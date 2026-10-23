#!/usr/bin/env python3
"""Generate PWA icons from a single colour and letter.

    python3 scripts/make-icons.py --color "#2563eb" --letter S

Writes public/pwa-192x192.png, pwa-512x512.png, maskable-icon-512x512.png and
apple-touch-icon-180x180.png. Replace with real artwork when the app has a brand;
until then this keeps the manifest valid and installs looking intentional.
Requires Pillow (pip install pillow).
"""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def draw_icon(size: int, color: str, letter: str, maskable: bool) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    rgb = hex_to_rgb(color)
    if maskable:
        # Maskable icons must fill the whole canvas; keep content in the inner 80%.
        draw.rectangle((0, 0, size, size), fill=rgb + (255,))
    else:
        radius = int(size * 0.22)
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=rgb + (255,))

    font_size = int(size * (0.42 if maskable else 0.52))
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), letter, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), letter, font=font, fill=(255, 255, 255, 255))
    return img


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--color", default="#2563eb")
    parser.add_argument("--letter", default="S")
    parser.add_argument("--out", default="public")
    args = parser.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    letter = args.letter[:1].upper()

    draw_icon(192, args.color, letter, False).save(out / "pwa-192x192.png")
    draw_icon(512, args.color, letter, False).save(out / "pwa-512x512.png")
    draw_icon(512, args.color, letter, True).save(out / "maskable-icon-512x512.png")
    draw_icon(180, args.color, letter, True).convert("RGB").save(out / "apple-touch-icon-180x180.png")
    print(f"Wrote 4 icons to {out}/ using {args.color} and '{letter}'.")


if __name__ == "__main__":
    main()
