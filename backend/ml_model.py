import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image

device = torch.device("cpu")

def load_model(model_path):
    checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, 3)
    
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
        class_names = checkpoint.get("class_names", ["low", "medium", "high"])
    else:
        state_dict = checkpoint
        class_names = ["low", "medium", "high"]
        
    model.load_state_dict(state_dict)
    model = model.to(device)
    model.eval()
    
    class_names = [str(c).lower() for c in class_names]
    return model, class_names

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

def predict_image(image: Image.Image, model, class_names):
    image_tensor = transform(image).unsqueeze(0).to(device)
    with torch.inference_mode():
        output = model(image_tensor)
        probs = F.softmax(output, dim=1).squeeze(0).cpu()

    pred_idx = int(torch.argmax(probs).item())
    pred_label = class_names[pred_idx].capitalize()
    confidence = float(probs[pred_idx].item())
    return pred_label, confidence, probs

def final_decision(pred, confidence, symptoms, probs):
    low_prob, med_prob, high_prob = [float(x) for x in probs.tolist()]
    
    if pred == "High":
        return "High"
        
    if pred == "Medium":
        return "Medium"
        
    if pred == "Low":
        if confidence < 0.75:
            return "Medium"
        if high_prob >= 0.25:
            return "Medium"
        if len(symptoms) > 0:
            return "Medium"
        return "Low"
        
    return pred

def explain_result(pred, final, symptoms, confidence, probs):
    if final == "High" and pred != "High":
        return "Symptoms suggest a higher risk than the image prediction."
    if final == "Medium" and pred == "Low":
        return "Image looks mild, but confidence or symptoms suggest caution."
    if pred == "Low":
        return "Wound appears visually mild."
    if pred == "Medium":
        return "Moderate wound detected."
    return "Severe wound detected."

# Pre-load the copied model weights into memory
model_instance, class_names = load_model("best_model.pth")

def analyze_image(image: Image.Image):
    # Pass empty symptoms to enforce mandate: "REMOVE dependency on symptoms for risk decision"
    symptoms = [] 
    
    pred, confidence, probs = predict_image(image, model_instance, class_names)
    final = final_decision(pred, confidence, symptoms, probs)
    explanation = explain_result(pred, final, symptoms, confidence, probs)
    
    return {
        "prediction": pred,
        "confidence_percent": round(confidence * 100, 2),
        "final_decision": final,
        "explanation": explanation,
        "class_probabilities": {
            class_names[0].capitalize(): round(float(probs[0]) * 100, 2),
            class_names[1].capitalize(): round(float(probs[1]) * 100, 2),
            class_names[2].capitalize(): round(float(probs[2]) * 100, 2),
        }
    }
