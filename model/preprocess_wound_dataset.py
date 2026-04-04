import os
import shutil
import random
import csv
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError


RAW_ROOT = Path(r"C:\Users\himan\OneDrive\Desktop\Hacksagon\data\raw\Wound_dataset_copy")
OUTPUT_ROOT = Path(r"C:\Users\himan\OneDrive\Desktop\Hacksagon\data\processed")

IMG_SIZE = (224, 224)
TRAIN_RATIO = 0.8
SEED = 42
COPY_MODE = True   # True = keep original raw files safe
                   # False = move files instead of copy

# Map source folders to final triage classes
# Adjust names here if your folder names differ slightly.
FOLDER_TO_LABEL = {
    "abrasions": "low",
    "cut": "low",
    "cuts": "low",
    "normal": "low",

    "bruises": "medium",
    "bruise": "medium",
    "laceration": "medium",
    "lacerations": "medium",
    "surgical wounds": "medium",
    "surgical_wounds": "medium",

    "burns": "high",
    "burn": "high",
    "diabetic wounds": "high",
    "diabetic_wounds": "high",
    "pressure wounds": "high",
    "pressure_wounds": "high",
    "venous wounds": "high",
    "venous_wounds": "high",
}

CLASSES = ["low", "medium", "high"]
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def norm_name(name: str) -> str:
    return name.strip().lower().replace("-", "_").replace(" ", "_")


def is_image_file(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_EXTS


def safe_open_image(path: Path):
    try:
        img = Image.open(path)
        return img.convert("RGB")
    except (UnidentifiedImageError, OSError):
        return None


def preprocess_image(img: Image.Image) -> Image.Image:
    
    img = ImageOps.fit(img, IMG_SIZE, method=Image.Resampling.LANCZOS)
    return img


def ensure_dirs():
    for split in ["train", "val"]:
        for cls in CLASSES:
            (OUTPUT_ROOT / split / cls).mkdir(parents=True, exist_ok=True)

    (OUTPUT_ROOT / "summary").mkdir(parents=True, exist_ok=True)


def get_all_source_images(raw_root: Path):
    """
    Returns a dict:
    {
        "low": [Path(...), ...],
        "medium": [...],
        "high": [...]
    }
    """
    class_to_files = {cls: [] for cls in CLASSES}

    for folder in raw_root.iterdir():
        if not folder.is_dir():
            continue

        folder_key = norm_name(folder.name)
        label = FOLDER_TO_LABEL.get(folder_key)

        if label is None:
            
            continue

        for file in folder.rglob("*"):
            if file.is_file() and is_image_file(file):
                class_to_files[label].append(file)

    return class_to_files


def copy_or_move_image(src: Path, dst: Path):
    dst.parent.mkdir(parents=True, exist_ok=True)

    if COPY_MODE:
        shutil.copy2(src, dst)
    else:
        shutil.move(src, dst)


def save_processed_image(src: Path, dst: Path) -> bool:
    img = safe_open_image(src)
    if img is None:
        return False

    img = preprocess_image(img)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, quality=95)
    return True


def split_list(items, train_ratio=0.8):
    random.shuffle(items)
    split_idx = int(len(items) * train_ratio)
    return items[:split_idx], items[split_idx:]



def preprocess_dataset():
    random.seed(SEED)
    ensure_dirs()

    if not RAW_ROOT.exists():
        raise FileNotFoundError(f"Raw dataset folder not found: {RAW_ROOT}")

    class_to_files = get_all_source_images(RAW_ROOT)

    summary_rows = []
    total_counts = {"low": 0, "medium": 0, "high": 0}

    print("\nRaw dataset counts:")
    for cls in CLASSES:
        count = len(class_to_files[cls])
        total_counts[cls] = count
        print(f"  {cls}: {count}")

    print("\nProcessing and splitting...")

    for cls in CLASSES:
        files = class_to_files[cls]
        if len(files) == 0:
            print(f"[WARN] No images found for class: {cls}")
            summary_rows.append([cls, 0, 0, 0])
            continue

        train_files, val_files = split_list(files, TRAIN_RATIO)

        train_ok = 0
        val_ok = 0

        # Train split
        for i, src in enumerate(train_files):
            dst = OUTPUT_ROOT / "train" / cls / f"{src.stem}_{i}{src.suffix.lower()}"
            ok = save_processed_image(src, dst)
            if ok:
                train_ok += 1

        # Val split
        for i, src in enumerate(val_files):
            dst = OUTPUT_ROOT / "val" / cls / f"{src.stem}_{i}{src.suffix.lower()}"
            ok = save_processed_image(src, dst)
            if ok:
                val_ok += 1

        summary_rows.append([cls, len(files), train_ok, val_ok])
        print(f"  {cls}: total={len(files)} | train={train_ok} | val={val_ok}")

    # Save CSV summary
    summary_csv = OUTPUT_ROOT / "summary" / "dataset_summary.csv"
    with open(summary_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["class", "total_found", "train_saved", "val_saved"])
        writer.writerows(summary_rows)

    print("\nDone.")
    print(f"Processed dataset saved in: {OUTPUT_ROOT}")
    print(f"Summary CSV saved in: {summary_csv}")

    print("\nFinal folder structure:")
    print(r"processed/")
    print(r"  train/low, train/medium, train/high")
    print(r"  val/low, val/medium, val/high")


if __name__ == "__main__":
    preprocess_dataset()