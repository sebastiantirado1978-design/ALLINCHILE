"""
Generador de lámina de venta ALLINCHILE.
Filosofía: Comercio Lúcido — cartografía suiza aplicada al SaaS.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# ============================================================================
# CONFIG
# ============================================================================
W, H = 1080, 1920
NAVY_DEEP = (10, 22, 42)
CYAN = (14, 165, 233)
WHITE = (255, 255, 255)
WHITE_70 = (255, 255, 255, 178)
WHITE_50 = (255, 255, 255, 128)
HAIRLINE = (255, 255, 255, 38)

FONTS_DIR = Path(
    "/Users/sebastiantiradoz/Library/Application Support/Claude/"
    "local-agent-mode-sessions/skills-plugin/"
    "28366418-ebca-4e60-b79a-6f230b9d0d4b/"
    "29fd1189-2dbc-4327-a329-a36afe129834/"
    "skills/canvas-design/canvas-fonts"
)


def f(name, size):
    return ImageFont.truetype(str(FONTS_DIR / name), size)


H_DISPLAY = "BricolageGrotesque-Bold.ttf"
H_SANS = "InstrumentSans-Regular.ttf"
H_SANS_BOLD = "InstrumentSans-Bold.ttf"
H_MONO = "GeistMono-Regular.ttf"
H_MONO_BOLD = "GeistMono-Bold.ttf"

img = Image.new("RGB", (W, H), NAVY_DEEP)
draw = ImageDraw.Draw(img, "RGBA")

M = 80


def hairline(y):
    draw.line([(M, y), (W - M, y)], fill=HAIRLINE, width=1)


def wrap(text, font, max_w):
    words = text.split(" ")
    lines, line = [], ""
    for w in words:
        test = (line + " " + w).strip()
        if draw.textlength(test, font=font) > max_w:
            if line:
                lines.append(line)
            line = w
        else:
            line = test
    if line:
        lines.append(line)
    return lines


# ============================================================================
# 1. CABECERA — meta + logo
# ============================================================================
draw.text((M, 80), "DOSSIER · 2026", font=f(H_MONO, 22), fill=WHITE_50)
draw.text((W - M, 80), "PLATAFORMA SAAS · CHILE",
          font=f(H_MONO, 22), fill=WHITE_50, anchor="rt")

# Logo
logo = f(H_DISPLAY, 96)
allin_w = draw.textlength("ALLIN", font=logo)
draw.text((M, 180), "ALLIN", font=logo, fill=WHITE)
draw.text((M + allin_w, 180), "CHILE", font=logo, fill=CYAN)

draw.text((M, 305), "Plataforma chilena con Copiloto IA",
          font=f(H_SANS, 30), fill=WHITE_70)

hairline(380)

# ============================================================================
# 2. HERO — 2 líneas grandes
# ============================================================================
hero = f(H_DISPLAY, 102)
draw.text((M, 460), "Todo tu negocio,", font=hero, fill=WHITE)

una = "una sola "
una_w = draw.textlength(una, font=hero)
draw.text((M, 580), una, font=hero, fill=WHITE)
draw.text((M + una_w, 580), "pantalla.", font=hero, fill=CYAN)

# Subhero
draw.text((M, 740),
          "Inbox multicanal + CRM + IA en una plataforma chilena.",
          font=f(H_SANS, 28), fill=WHITE_70)

hairline(820)

# ============================================================================
# 3. QUÉ HACE POR TI — 4 bullets
# ============================================================================
draw.text((M, 870), "QUÉ HACE POR TI", font=f(H_MONO, 22), fill=CYAN)

bullets = [
    ("01", "Inbox unificado",
     "WhatsApp, email, Instagram, Facebook y web en una sola bandeja."),
    ("02", "CRM con pipeline visual",
     "Arrastra oportunidades por etapa. Mide ventas en vivo."),
    ("03", "Copiloto IA",
     "Mejora redacción y tono. Acorta o expande sin inventar datos."),
    ("04", "Reportes al instante",
     "Métricas de equipo, ventas y atención sin tocar Excel."),
]

num_font = f(H_DISPLAY, 50)
title_font = f(H_SANS_BOLD, 30)
body_font = f(H_SANS, 24)
NUM_COL = 110

y = 920
for i, (num, title, body) in enumerate(bullets):
    draw.text((M, y), num, font=num_font, fill=CYAN)
    draw.text((M + NUM_COL, y), title, font=title_font, fill=WHITE)
    body_y = y + 46
    for ln in wrap(body, body_font, W - M * 2 - NUM_COL):
        draw.text((M + NUM_COL, body_y), ln, font=body_font, fill=WHITE_70)
        body_y += 30
    if i < len(bullets) - 1:
        sep_y = body_y + 14
        draw.line([(M, sep_y), (W - M, sep_y)], fill=HAIRLINE, width=1)
        y = sep_y + 18

hairline(1490)

# ============================================================================
# 4. PRECIO
# ============================================================================
draw.text((M, 1530), "DESDE",
          font=f(H_MONO, 22), fill=CYAN)
draw.text((W - M, 1530), "TRES PLANES",
          font=f(H_MONO, 22), fill=WHITE_50, anchor="rt")

price_font = f(H_DISPLAY, 84)
price_text = "$89.000"
price_w = draw.textlength(price_text, font=price_font)
draw.text((M, 1565), price_text, font=price_font, fill=WHITE)
draw.text(
    (M + price_w + 22, 1593),
    "CLP / mes + IVA",
    font=f(H_SANS, 26), fill=WHITE_70,
)

draw.text(
    (M, 1670),
    "Pro $185.000 · Business $390.000 · 14 días gratis",
    font=f(H_SANS, 22),
    fill=WHITE_50,
)

# ============================================================================
# 5. CTA cyan inferior
# ============================================================================
CTA_H = 200
cta_y = H - CTA_H
draw.rectangle([0, cta_y, W, H], fill=CYAN)

inner_y = cta_y + 30
draw.text((M, inner_y), "EMPIEZA HOY",
          font=f(H_MONO_BOLD, 22), fill=NAVY_DEEP)

inner_y += 36
draw.text((M, inner_y), "allinchile.vercel.app",
          font=f(H_DISPLAY, 56), fill=NAVY_DEEP)

inner_y += 70
draw.text(
    (M, inner_y),
    "Sin tarjeta · Sin compromiso · Live en menos de 7 días",
    font=f(H_SANS, 20),
    fill=NAVY_DEEP,
)

# ============================================================================
# OUTPUT
# ============================================================================
out = Path("/Users/sebastiantiradoz/Desktop/allinchile/docs/allinchile_sales_sheet.png")
img.save(out, "PNG", optimize=True)
print(f"OK → {out}  ({W}x{H})")
