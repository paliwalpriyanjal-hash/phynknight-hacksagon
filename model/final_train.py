import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import random
import json
from pathlib import Path


DATA_DIR = Path("data/processed")
BATCH_SIZE = 32
EPOCHS = 15
LR = 5e-4
PATIENCE = 5
MODEL_PATH = Path("best_model.pth")
FINAL_MODEL_PATH = Path("final_model.pth")
SEED = 42


def set_seed(seed=42):
    random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.benchmark = True

def compute_confusion_matrix(preds, targets, num_classes):
    cm = torch.zeros((num_classes, num_classes), dtype=torch.int64)
    for t, p in zip(targets, preds):
        cm[t.long(), p.long()] += 1
    return cm


def print_classwise_metrics(cm, class_names):
    print("\nPer-class metrics:")
    for i, name in enumerate(class_names):
        tp = cm[i, i].item()
        fp = cm[:, i].sum().item() - tp
        fn = cm[i, :].sum().item() - tp
        support = cm[i, :].sum().item()

        precision = tp / (tp + fp + 1e-9)
        recall = tp / (tp + fn + 1e-9)
        f1 = 2 * precision * recall / (precision + recall + 1e-9)

        print(f"{name:>15} | Precision: {precision:.2f} | Recall: {recall:.2f} | F1: {f1:.2f}")


def train_one_epoch(model, loader, criterion, optimizer, device, scaler):
    model.train()
    total_loss, correct, total = 0, 0, 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()

        with torch.cuda.amp.autocast(enabled=(device.type == "cuda")):
            outputs = model(images)
            loss = criterion(outputs, labels)

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item() * images.size(0)
        preds = outputs.argmax(1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    return total_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device, num_classes):
    model.eval()
    total_loss, correct, total = 0, 0, 0

    all_preds, all_targets = [], []

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        outputs = model(images)
        loss = criterion(outputs, labels)

        total_loss += loss.item() * images.size(0)

        preds = outputs.argmax(1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

        all_preds.append(preds.cpu())
        all_targets.append(labels.cpu())

    all_preds = torch.cat(all_preds)
    all_targets = torch.cat(all_targets)

    cm = compute_confusion_matrix(all_preds, all_targets, num_classes)

    return total_loss / total, correct / total, cm



def main():
    set_seed(SEED)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("Using device:", device)


    train_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(0.2, 0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    train_data = datasets.ImageFolder(DATA_DIR / "train", transform=train_transform)
    val_data = datasets.ImageFolder(DATA_DIR / "val", transform=val_transform)

    class_names = train_data.classes
    num_classes = len(class_names)

    print("Classes:", class_names)

    train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=BATCH_SIZE)

    
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

    # Freeze backbone
    for param in model.features.parameters():
        param.requires_grad = False

    # Unfreeze last layers
    for param in model.features[-2:].parameters():
        param.requires_grad = True

    # Replace classifier
    model.classifier[1] = nn.Linear(model.last_channel, num_classes)
    model = model.to(device)

    
    # LOSS + OPTIMIZER + SCHEDULER

    criterion = nn.CrossEntropyLoss()

    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LR)

    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=2)

    scaler = torch.cuda.amp.GradScaler()


    # TRAIN LOOP
    best_acc = 0
    patience_counter = 0

    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch+1}/{EPOCHS}")

        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device, scaler)
        val_loss, val_acc, cm = evaluate(model, val_loader, criterion, device, num_classes)

        scheduler.step(val_loss)

        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}%")
        print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc*100:.2f}%")

        if val_acc > best_acc:
            best_acc = val_acc
            patience_counter = 0

            torch.save({
                "model_state_dict": model.state_dict(),
                "class_names": class_names
            }, MODEL_PATH)

            print("🔥 Best model saved!")

        else:
            patience_counter += 1
            print(f"Early stopping counter: {patience_counter}/{PATIENCE}")

        if patience_counter >= PATIENCE:
            print("⛔ Early stopping triggered")
            break


    checkpoint = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])

    val_loss, val_acc, cm = evaluate(model, val_loader, criterion, device, num_classes)

    print("\n🏆 Final Results")
    print(f"Accuracy: {val_acc*100:.2f}%")

    print("\nConfusion Matrix:")
    print(cm)

    print_classwise_metrics(cm, class_names)

    torch.save(model.state_dict(), FINAL_MODEL_PATH)


if __name__ == "__main__":
    main()