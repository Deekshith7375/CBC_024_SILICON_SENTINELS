from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

DATA_DIR = Path(__file__).resolve().parent

def generate_samples():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Reference Shoe (Leather Brown)
    ref_shoe = Image.new("RGB", (600, 600), color=(240, 240, 240))
    draw = ImageDraw.Draw(ref_shoe)
    # Sole
    draw.rectangle([150, 380, 450, 420], fill=(50, 50, 50))
    # Shoe Body (Leather Brown)
    draw.polygon([(170, 380), (220, 250), (380, 250), (430, 380)], fill=(139, 69, 19))
    draw.ellipse([200, 220, 360, 280], fill=(160, 82, 45))
    ref_shoe.save(DATA_DIR / "sample_ref_shoe.jpg")

    # 2. Returned Shoe Matched & Clean
    ret_shoe_clean = ref_shoe.copy()
    ret_shoe_clean.save(DATA_DIR / "sample_ret_shoe_clean.jpg")

    # 3. Returned Shoe Damaged (Cut / Damage defect)
    ret_shoe_damaged = ref_shoe.copy()
    draw_d = ImageDraw.Draw(ret_shoe_damaged)
    # Draw leather cut/scratch defect
    draw_d.line([(260, 300), (320, 340)], fill=(30, 10, 5), width=8)
    draw_d.line([(270, 305), (310, 335)], fill=(220, 40, 40), width=4)
    ret_shoe_damaged.save(DATA_DIR / "sample_ret_shoe_damaged.jpg")

    # 4. Reference Smartphone (Black bezel, blue screen display)
    ref_phone = Image.new("RGB", (600, 600), color=(245, 245, 245))
    draw_p = ImageDraw.Draw(ref_phone)
    # Phone frame
    draw_p.rounded_rectangle([200, 80, 400, 520], radius=30, fill=(20, 20, 20))
    # Screen area
    draw_p.rectangle([215, 120, 385, 480], fill=(40, 100, 200))
    # Home button / Notch
    draw_p.ellipse([290, 490, 310, 510], fill=(80, 80, 80))
    ref_phone.save(DATA_DIR / "sample_ref_phone.jpg")

    # 5. Returned Smartphone Damaged (Screen Crack / Shattered)
    ret_phone_damaged = ref_phone.copy()
    draw_pd = ImageDraw.Draw(ret_phone_damaged)
    # Cracks spider web
    crack_lines = [
        [(250, 200), (310, 280), (370, 260)],
        [(310, 280), (300, 350), (360, 410)],
        [(310, 280), (230, 310)],
        [(310, 280), (340, 200)]
    ]
    for line in crack_lines:
        draw_pd.line(line, fill=(255, 255, 255), width=4)
        draw_pd.line(line, fill=(200, 200, 200), width=2)
    ret_phone_damaged.save(DATA_DIR / "sample_ret_phone_damaged.jpg")

    print("[SUCCESS] Generated sample reference and test images in data/")

if __name__ == "__main__":
    generate_samples()
