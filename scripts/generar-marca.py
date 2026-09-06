"""Renderiza encuadres SVG del logo original sin alterar el JPEG."""
import base64
import os
from pathlib import Path

if os.name == 'nt':
    for folder in [Path('C:/Program Files/Inkscape/bin'), Path('C:/msys64/mingw64/bin')]:
        if folder.exists():
            os.environ['PATH'] = str(folder) + os.pathsep + os.environ['PATH']
import subprocess
try:
    import cairosvg
except (ImportError, OSError):
    cairosvg = None
from PIL import Image

root = Path(__file__).resolve().parents[1]
data = base64.b64encode((root / 'public/logonuevo.jpeg').read_bytes()).decode()
def svg(viewbox, width, height):
    return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="{viewbox}" width="{width}" height="{height}" role="img" aria-label="Catalán Propiedades"><image width="1600" height="800" xlink:href="data:image/jpeg;base64,{data}"/></svg>'

wordmark = svg('190 340 1230 142', 1230, 142)
# El ícono usa la C del original, con margen uniforme para tamaños pequeños.
icon = f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 124 124" width="512" height="512" role="img" aria-label="C de Catalán Propiedades"><rect width="124" height="124" fill="white"/><svg x="12" y="12" width="100" height="100" viewBox="194 350 100 100" overflow="hidden"><image width="1600" height="800" xlink:href="data:image/jpeg;base64,{data}"/></svg></svg>'
for target in ['app/favicon.svg', 'public/favicon.svg']:
    (root / target).write_text(icon, encoding='utf-8')
def render(source, target):
    if cairosvg:
        cairosvg.svg2png(bytestring=source.encode(), write_to=str(root / target))
    else:
        # Windows sin la biblioteca nativa Cairo: mismo SVG, render con sharp.
        subprocess.run(['node', '-e', 'const fs=require("fs");require("sharp")(fs.readFileSync(0)).png().toFile(process.argv[1]).catch(e=>{console.error(e);process.exit(1)})', str(root / target)], input=source.encode(), cwd=root, check=True)
render(wordmark, 'public/logo-catalan.png')
for target in ['app/icon.png', 'public/icon.png']:
    render(icon, target)
with Image.open(root / 'public/icon.png') as image:
    image.save(root / 'public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print('Logo e íconos generados desde logonuevo.jpeg')
