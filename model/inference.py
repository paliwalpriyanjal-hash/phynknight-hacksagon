import argparse
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image

# ==============================
# CONFIG
# ==============================
MODEL_PATH = Path("best_model.pth")
IMG_SIZE = 224

# Safe defaults; will be replaced by checkpoint class_names if available
DEFAULT_CLASSES = ["low", "medium", "high"]

# Triage thresholds
LOW_CONFIDENCE_THRESHOLD = 0.75
HIGH_PROB_THRESHOLD = 0.25

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ==============================
# MODEL LOADING
# ==============================
def load_model(model_path: Path):
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    # Load checkpoint safely
    checkpoint = torch.load(model_path, map_location=device)

    # Build the same architecture used in training
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, 3)

    # Support both:
    # 1) raw state_dict
    # 2) checkpoint dict with "model_state_dict"
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
        class_names = checkpoint.get("class_names", DEFAULT_CLASSES)
    else:
        state_dict = checkpoint
        class_names = DEFAULT_CLASSES

    model.load_state_dict(state_dict)
    model = model.to(device)
    model.eval()

    # Normalize class names to a consistent format
    class_names = [str(c).lower() for c in class_names]
    return model, class_names


# ==============================
# IMAGE TRANSFORM
# ==============================
# Match validation preprocessing from training:
# Resize(256) -> CenterCrop(224) -> Normalize(ImageNet mean/std)
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])


# ==============================
# PREDICTION
# ==============================
def predict_image(image_path, model, class_names):
    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    try:
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(f"Could not open image: {image_path}. Error: {e}")

    image = transform(image).unsqueeze(0).to(device)

    with torch.inference_mode():
        output = model(image)
        probs = F.softmax(output, dim=1).squeeze(0).cpu()

    pred_idx = int(torch.argmax(probs).item())
    pred_label = class_names[pred_idx].capitalize()
    confidence = float(probs[pred_idx].item())

    return pred_label, confidence, probs


# ==============================
# TRIAGE LOGIC
# ==============================
def final_decision(pred, confidence, symptoms, probs):
    symptoms = [s.lower().strip() for s in symptoms if s.strip()]
    low_prob, med_prob, high_prob = [float(x) for x in probs.tolist()]

    # Hard emergency rules
    if "bleeding" in symptoms:
        return "High"
    if "pus" in symptoms or "fever" in symptoms:
        return "High"

    # Never downgrade a strong High prediction
    if pred == "High":
        return "High"

    # Escalate Medium if symptoms suggest worsening
    if pred == "Medium":
        if "swelling" in symptoms or "pain" in symptoms:
            return "Medium"
        return "Medium"

    # For Low prediction, use confidence + high-risk probability + symptoms
    if pred == "Low":
        if confidence < LOW_CONFIDENCE_THRESHOLD:
            return "Medium"
        if high_prob >= HIGH_PROB_THRESHOLD:
            return "Medium"
        if len(symptoms) > 0:
            return "Medium"
        return "Low"

    return pred


# ==============================
# EXPLANATION
# ==============================
def explain_result(pred, final, symptoms, confidence, probs):
    symptoms = [s.lower().strip() for s in symptoms if s.strip()]
    low_prob, med_prob, high_prob = [float(x) for x in probs.tolist()]

    if "bleeding" in symptoms:
        return "Emergency detected due to bleeding."
    if "pus" in symptoms or "fever" in symptoms:
        return "High risk due to infection-related symptoms."

    if final == "High" and pred != "High":
        return "Symptoms suggest a higher risk than the image prediction."
    if final == "Medium" and pred == "Low":
        return "Image looks mild, but confidence or symptoms suggest caution."
    if pred == "Low":
        return "Wound appears visually mild."
    if pred == "Medium":
        return "Moderate wound detected."
    return "Severe wound detected."


# ==============================
# COMPLETE PIPELINE
# ==============================
def analyze_case(image_path, symptoms, model, class_names):
    pred, confidence, probs = predict_image(image_path, model, class_names)
    final = final_decision(pred, confidence, symptoms, probs)
    explanation = explain_result(pred, final, symptoms, confidence, probs)

    result = {
        "prediction": pred,
        "confidence_percent": round(confidence * 100, 2),
        "final_decision": final,
        "symptoms": symptoms,
        "explanation": explanation,
        "class_probabilities": {
            class_names[0].capitalize(): round(float(probs[0]) * 100, 2),
            class_names[1].capitalize(): round(float(probs[1]) * 100, 2),
            class_names[2].capitalize(): round(float(probs[2]) * 100, 2),
        },
    }
    return result


# ==============================
# CLI
# ==============================
def parse_args():
    parser = argparse.ArgumentParser(description="AI Wound Triage Inference")
    parser.add_argument("--image", required=True, help="Path to wound image")
    parser.add_argument(
        "--symptoms",
        default="",
        help="Comma-separated symptoms, e.g. pain,swelling,fever"
    )
    return parser.parse_args()


# ==============================
# MAIN
# ==============================
def main():
    args = parse_args()

    symptoms = []
    if args.symptoms.strip():
        symptoms = [s.strip() for s in args.symptoms.split(",") if s.strip()]

    model, class_names = load_model(MODEL_PATH)
    result = analyze_case(args.image, symptoms, model, class_names)

    print("\n🧠 AI Analysis Result:\n")
    print(f"Prediction       : {result['prediction']}")
    print(f"Confidence       : {result['confidence_percent']}%")
    print(f"Final Decision   : {result['final_decision']}")
    print(f"Symptoms         : {', '.join(result['symptoms']) if result['symptoms'] else 'None'}")
    print(f"\nExplanation      : {result['explanation']}")
    print("\nClass Probabilities:")
    for k, v in result["class_probabilities"].items():
        print(f"  {k}: {v}%")


if __name__ == "__main__":
    main()