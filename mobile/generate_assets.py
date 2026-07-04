from PIL import Image, ImageDraw, ImageFont
import os

NAVY = (15, 23, 42)
GOLD = (212, 175, 55)
WHITE = (255, 255, 255)

assets_dir = os.path.join(os.path.dirname(__file__), "assets")


def draw_my_text(draw, center, size, font_path=None):
    text = "MY"
    if font_path and os.path.exists(font_path):
        try:
            font = ImageFont.truetype(font_path, size)
        except Exception:
            font = ImageFont.load_default()
    else:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = center[0] - text_width // 2
    y = center[1] - text_height // 2
    draw.text((x, y), text, fill=GOLD, font=font)


def create_icon(size, output, draw_text=True):
    img = Image.new("RGB", (size, size), NAVY)
    draw = ImageDraw.Draw(img)

    # Gold circle
    margin = size // 8
    draw.ellipse(
        [(margin, margin), (size - margin, size - margin)],
        outline=GOLD,
        width=size // 40,
    )

    if draw_text:
        font_size = size // 3
        font_path = "C:\\Windows\\Fonts\\arialbd.ttf"
        if not os.path.exists(font_path):
            font_path = None
        draw_my_text(draw, (size // 2, size // 2), font_size, font_path)

    img.save(output)


def create_splash(width, height, output):
    img = Image.new("RGB", (width, height), NAVY)
    draw = ImageDraw.Draw(img)

    font_size = width // 6
    font_path = "C:\\Windows\\Fonts\\arialbd.ttf"
    if not os.path.exists(font_path):
        font_path = None
    draw_my_text(draw, (width // 2, height // 2), font_size, font_path)

    # Small subtitle
    subtitle = "YESAYA MINISTRY"
    if font_path:
        sub_font = ImageFont.truetype(font_path, width // 25)
    else:
        sub_font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    sub_width = bbox[2] - bbox[0]
    sub_height = bbox[3] - bbox[1]
    draw.text(
        ((width - sub_width) // 2, height // 2 + width // 8),
        subtitle,
        fill=WHITE,
        font=sub_font,
    )

    img.save(output)


if __name__ == "__main__":
    create_icon(1024, os.path.join(assets_dir, "icon.png"))
    create_icon(1024, os.path.join(assets_dir, "adaptive-icon.png"), draw_text=False)
    create_splash(1242, 2436, os.path.join(assets_dir, "splash.png"))
    create_icon(48, os.path.join(assets_dir, "favicon.png"))
    print("Assets generated successfully.")
