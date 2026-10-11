import os
import random
import yaml
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CONFIGS_DIR = DATA_DIR / "dataset_configs"
WEIGHTS_DIR = DATA_DIR / "weights"

def generate_leather_background(width=640, height=640):
    """Generate realistic synthetic leather texture."""
    base_color = random.choice([
        (139, 69, 19),   # Saddle brown
        (160, 82, 45),   # Sienna
        (101, 67, 33),   # Dark brown
        (40, 40, 40),    # Black leather
        (210, 180, 140)  # Tan leather
    ])
    
    img = Image.new("RGB", (width, height), color=base_color)
    draw = ImageDraw.Draw(img)
    
    # Add texture noise
    arr = np.array(img, dtype=np.int16)
    noise = np.random.randint(-15, 15, arr.shape, dtype=np.int16)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr)
    
    # Add stitching/crease pattern lines
    draw = ImageDraw.Draw(img)
    for _ in range(random.randint(2, 5)):
        sx = random.randint(50, width - 50)
        sy = random.randint(50, height - 50)
        draw.line([(sx, sy), (sx + random.randint(-100, 100), sy + random.randint(-100, 100))],
                  fill=(base_color[0]//2, base_color[1]//2, base_color[2]//2), width=2)
                  
    return img

def generate_smartphone_background(width=640, height=640):
    """Generate realistic smartphone screen with bezel background."""
    img = Image.new("RGB", (width, height), color=(240, 240, 245))
    draw = ImageDraw.Draw(img)
    
    # Phone body outline
    bx1, by1 = random.randint(120, 150), random.randint(50, 70)
    bx2, by2 = random.randint(490, 520), random.randint(570, 590)
    
    body_color = random.choice([(20, 20, 20), (40, 40, 45), (200, 200, 210), (15, 25, 40)])
    draw.rounded_rectangle([bx1, by1, bx2, by2], radius=35, fill=body_color)
    
    # Screen display
    sx1, sy1 = bx1 + 15, by1 + 35
    sx2, sy2 = bx2 - 15, by2 - 35
    screen_color = random.choice([(10, 10, 15), (25, 75, 140), (40, 30, 60), (180, 50, 60)])
    draw.rectangle([sx1, sy1, sx2, sy2], fill=screen_color)
    
    return img, (sx1, sy1, sx2, sy2)

def generate_defect(img, category, class_idx, class_name, screen_bounds=None):
    """Draw realistic defect visuals and return YOLO bounding box [class, cx, cy, w, h]."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    
    if screen_bounds:
        min_x, min_y, max_x, max_y = screen_bounds
        min_x += 20
        min_y += 20
        max_x -= 20
        max_y -= 20
    else:
        min_x, min_y = 80, 80
        max_x, max_y = w - 80, h - 80

    def_w = random.randint(40, 120)
    def_h = random.randint(40, 120)
    x1 = random.randint(min_x, max(min_x + 10, max_x - def_w))
    y1 = random.randint(min_y, max(min_y + 10, max_y - def_h))
    x2 = min(x1 + def_w, max_x)
    y2 = min(y1 + def_h, max_y)

    # Draw specific defect patterns
    if class_name in ("cut", "screen_crack"):
        # Sharp crack or cut line
        points = [(x1, y1)]
        curr_x, curr_y = x1, y1
        steps = random.randint(3, 6)
        for _ in range(steps):
            curr_x += random.randint(-15, 25)
            curr_y += random.randint(10, 25)
            points.append((curr_x, curr_y))
        draw.line(points, fill=(255, 255, 255) if class_name == "screen_crack" else (20, 5, 5), width=3)
        draw.line(points, fill=(180, 180, 180) if class_name == "screen_crack" else (180, 30, 30), width=1)

    elif class_name in ("scratch", "screen_scratch"):
        # Multi-scratch cluster
        for _ in range(random.randint(3, 7)):
            sx = random.randint(x1, x2)
            sy = random.randint(y1, y2)
            draw.line([(sx, sy), (sx + random.randint(-20, 20), sy + random.randint(15, 35))],
                      fill=(220, 220, 220), width=random.randint(1, 2))

    elif class_name in ("color_stain", "discoloration_bleed"):
        # Stain or OLED screen bleed patch
        color = (10, 10, 10) if class_name == "discoloration_bleed" else (random.randint(150, 230), random.randint(20, 50), random.randint(20, 50))
        draw.ellipse([x1, y1, x2, y2], fill=color)

    elif class_name in ("shattered_screen", "hole"):
        # Shattered impact zone or hole
        draw.ellipse([x1, y1, x2, y2], fill=(240, 240, 240) if class_name == "shattered_screen" else (10, 10, 10))
        for _ in range(8):
            ang_x = random.randint(x1 - 20, x2 + 20)
            ang_y = random.randint(y1 - 20, y2 + 20)
            draw.line([( (x1+x2)//2, (y1+y2)//2 ), (ang_x, ang_y)], fill=(200, 200, 200), width=2)

    else:
        # Default defect box (glue_mark, fold, dent)
        draw.rectangle([x1, y1, x2, y2], outline=(230, 50, 50), width=3)

    # Compute normalized YOLO bounding box coordinates
    cx = ((x1 + x2) / 2.0) / w
    cy = ((y1 + y2) / 2.0) / h
    bw = (x2 - x1) / w
    bh = (y2 - y1) / h

    return f"{class_idx} {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}\n"

def build_dataset(dataset_name: str, classes: list, yaml_name: str, train_count=200, val_count=50):
    """Build dataset with train_count and val_count images."""
    dataset_path = DATA_DIR / dataset_name
    img_train = dataset_path / "images" / "train"
    img_val = dataset_path / "images" / "val"
    lbl_train = dataset_path / "labels" / "train"
    lbl_val = dataset_path / "labels" / "val"

    for p in [img_train, img_val, lbl_train, lbl_val, CONFIGS_DIR, WEIGHTS_DIR]:
        p.mkdir(parents=True, exist_ok=True)

    print(f"Generating {train_count} Train & {val_count} Val images for {dataset_name}...")

    def generate_split(img_dir, lbl_dir, count, split_type="train"):
        for i in range(count):
            if "leather" in dataset_name:
                img = generate_leather_background()
                screen_bounds = None
            else:
                img, screen_bounds = generate_smartphone_background()

            # 35% of images are pristine clean items with ZERO defects (negative background samples)
            if random.random() < 0.35:
                num_defects = 0
            else:
                num_defects = random.randint(1, 3)

            labels = []
            for _ in range(num_defects):
                cls_idx = random.randint(0, len(classes) - 1)
                cls_name = classes[cls_idx]
                label_str = generate_defect(img, dataset_name, cls_idx, cls_name, screen_bounds)
                labels.append(label_str)

            file_stem = f"sample_{split_type}_{i:04d}"
            img.save(img_dir / f"{file_stem}.jpg", quality=92)
            with open(lbl_dir / f"{file_stem}.txt", "w") as f:
                f.writelines(labels)

    generate_split(img_train, lbl_train, train_count, "train")
    generate_split(img_val, lbl_val, val_count, "val")

    data_yaml = {
        "path": str(dataset_path.absolute()).replace("\\", "/"),
        "train": "images/train",
        "val": "images/val",
        "nc": len(classes),
        "names": classes
    }

    yaml_file_path = CONFIGS_DIR / yaml_name
    with open(yaml_file_path, "w") as f:
        yaml.dump(data_yaml, f, sort_keys=False)

    print(f"[SUCCESS] Dataset {dataset_name} created with {train_count + val_count} total images.")
    print(f"YAML Config: {yaml_file_path}")

def main():
    print("=" * 70)
    print("Building Expanded Training Datasets (250 images per dataset)")
    print("=" * 70)
    
    build_dataset(
        dataset_name="mvtec_leather_dataset",
        classes=["cut", "scratch", "color_stain", "glue_mark", "hole", "fold"],
        yaml_name="mvtec_leather.yaml",
        train_count=200,
        val_count=50
    )

    build_dataset(
        dataset_name="smartphone_screen_dataset",
        classes=["screen_crack", "shattered_screen", "scratch", "discoloration_bleed", "dent"],
        yaml_name="smartphone_screen.yaml",
        train_count=200,
        val_count=50
    )

if __name__ == "__main__":
    main()
