# Generates per-form body texture PNGs for the dressing room by stretching the
# shape_0 (form 0) artist assets to match each avatar form's body proportions.
#
# Usage:
#   pip install Pillow
#   python generate_body_textures.py
#
# Input:  frontend/src/assets/DressingRoom/BodyTextures/shape_0/{color}_0.png
#         (high-res RGBA assets from the artist, one per color)
# Output: frontend/src/assets/DressingRoom/BodyTextures/shape_{1..4}/{color}_{form}.png
#         (newly created or overwritten files)
#
# To add a new color, drop {color}_0.png into shape_0/ and add the name to COLORS.
# To regenerate shape_0 as well (re-aligns it to its own mask), set FORMS = range(0, 5).
#
# How it works:
#   Each avatar form has a mask image (Avatar{N+1}Mask.png) that defines the body
#   silhouette. Both the texture and mask are rendered in the browser via CSS
#   `background-size: contain; background-position: bottom center` inside a fixed
#   container. For the color fill to align with the silhouette, the texture canvas
#   must share the same aspect ratio as its form's mask canvas. This script:
#     1. Crops the shape_0 asset to its non-transparent bounding box (the body).
#     2. Resizes that body content to match the target form's body bbox dimensions
#        (derived from the mask, scaled to TARGET_H).
#     3. Places the resized content at the correct position on a new canvas whose
#        aspect ratio matches the target form's mask canvas.

import os
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT  = os.path.join(SCRIPT_DIR, '..', '..')
BASE = os.path.normpath(os.path.join(REPO_ROOT, 'frontend/src/assets/DressingRoom/BodyTextures'))

COLORS = ['blue', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow']

# Forms to generate (0 = shape_0 itself; useful if shape_0 needs realignment too)
FORMS = range(1, 5)

# Canvas size and body bounding box (x1, y1, x2, y2) for each form's mask image.
# Derived from Avatar{form+1}Mask.png non-transparent pixel extents.
MASK_CANVAS = {
    0: (492, 507),
    1: (518, 482),
    2: (466, 535),
    3: (526, 474),
    4: (542, 461),
}
MASK_BODY_BBOX = {
    0: (87,  6,  485, 447),
    1: (115, 19, 466, 407),
    2: (45,  28, 433, 458),
    3: (79,  17, 438, 415),
    4: (93,  14, 441, 400),
}

# Output canvas height — keep high so textures stay sharp when scaled up in-app.
TARGET_H = 1335


def process_color(color: str, form: int, body_content: Image.Image) -> None:
    mw, mh = MASK_CANVAS[form]
    scale    = TARGET_H / mh
    canvas_w = round(mw * scale)

    x1, y1, x2, y2 = [round(v * scale) for v in MASK_BODY_BBOX[form]]
    body_w, body_h  = x2 - x1, y2 - y1

    stretched = body_content.resize((body_w, body_h), Image.LANCZOS)
    canvas    = Image.new('RGBA', (canvas_w, TARGET_H), (0, 0, 0, 0))
    canvas.paste(stretched, (x1, y1))

    out_dir  = os.path.join(BASE, f'shape_{form}')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f'{color}_{form}.png')
    canvas.save(out_path, optimize=False)
    print(f'  shape_{form}/{color}_{form}.png — canvas {canvas_w}×{TARGET_H}, body {body_w}×{body_h} at ({x1},{y1})')


def main() -> None:
    for color in COLORS:
        src_path = os.path.join(BASE, f'shape_0/{color}_0.png')
        if not os.path.exists(src_path):
            print(f'SKIP {color}_0.png — not found in shape_0/')
            continue

        print(f'{color}:')
        src = Image.open(src_path).convert('RGBA')
        _, _, _, a = src.split()
        body_content = src.crop(a.getbbox())

        for form in FORMS:
            process_color(color, form, body_content)

    print('Done.')


if __name__ == '__main__':
    main()
