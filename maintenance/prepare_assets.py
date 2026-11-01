"""Rebuild website media from the adjacent FITR research folder.

Requires Pillow, imageio-ffmpeg and pdftoppm. Original research files are never modified.
"""
from pathlib import Path
from PIL import Image, ImageChops
import subprocess, shutil, json
import imageio_ffmpeg

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parent
IMAGES = SITE / 'assets/images'
VIDEOS = SITE / 'assets/videos'
for p in (IMAGES, VIDEOS, SITE / 'assets/paper'):
    p.mkdir(parents=True, exist_ok=True)
ff = imageio_ffmpeg.get_ffmpeg_exe()
manifest = []

def webimage(src, name, trim=False):
    im = Image.open(src).convert('RGB')
    if trim:
        diff = ImageChops.difference(im, Image.new('RGB', im.size, 'white'))
        box = diff.point(lambda x: 255 if x > 30 else 0).getbbox()
        if box: im = im.crop(box)
    im.thumbnail((2400, 1800))
    im.save(IMAGES / (name + '.webp'), quality=91)
    manifest.append({'output': 'assets/images/' + name + '.webp', 'source': str(src.relative_to(ROOT)) if src.is_relative_to(ROOT) else src.name})

for src, name in [('main1', 'overview'), ('real3', 'rollouts'), ('contact_review', 'contacts'), ('fig_collect', 'collection')]:
    pdf = ROOT / 'iclr2027/figure' / (src + '.pdf')
    target = Path('/private/tmp/fitr-preview') / name
    subprocess.run(['pdftoppm', '-f', '1', '-singlefile', '-scale-to', '2400', '-png', str(pdf), str(target)], check=True)
    webimage(target.with_suffix('.png'), name, True)
    manifest[-1]['source'] = str(pdf.relative_to(ROOT))

for src, name in [('4', 'sim-to-real'), ('3', 'backbones'), ('5', 'post-training')]:
    webimage(ROOT / 'iclr2027/figure/data' / (src + '.png'), name, True)

for src, name in [('mac', 'laptop-input'), ('mac_urdf', 'laptop-urdf'), ('mac_lab', 'laptop-contact'), ('display', 'display-input'), ('display_urdf', 'display-urdf'), ('display_lab', 'display-contact'), ('microwave', 'microwave-input'), ('microwave_urdf', 'microwave-urdf'), ('microwave_lab', 'microwave-contact')]:
    directory = ROOT / '其他/图片素材/main'
    source = next(p for p in directory.glob(src + '.*') if p.suffix.lower() in ['.png', '.jpg'])
    webimage(source, name)

for i in range(1, 13):
    webimage(ROOT / '其他/图片素材/cantact_review' / f'review{i}.png', f'asset-{i}')

for category, stem in [('laptop', 'laptop_demo41'), ('display', 'monitor_demo210'), ('microwave', 'microwave_w0_demo299'), ('drawer', 'table'), ('lamp', 'lamp_demo257'), ('faucet', 'faucet_demo237')]:
    directory = ROOT / '其他/图片素材/hdf5_repaly' / {'display': 'monitor', 'drawer': 'table'}.get(category, category)
    files = sorted(directory.glob(stem + '*')) or sorted(directory.glob('*.png'))
    if files: webimage(files[len(files)//2], 'randomized-' + category)

mapping = [('sim_mac_demo', 'sim-laptop'), ('sim_display_demo', 'sim-display'), ('sim_microwave_demo', 'sim-microwave'), ('sim_table_demo', 'sim-drawer'), ('sim_lamp_demo', 'sim-lamp'), ('sim_faucet_demo', 'sim-faucet'), ('display_demo', 'real-display'), ('microwave_demo', 'real-microwave'), ('table_demo', 'real-drawer'), ('faucet_demo', 'real-faucet')]
for src, name in mapping + [('demo', 'overview')]:
    source = (ROOT / 'code&demo/demo.mp4') if src == 'demo' else (ROOT / '其他/demo' / (src + '.mp4'))
    target = VIDEOS / (name + '.mp4')
    subprocess.run([ff, '-y', '-i', str(source), '-an', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(target)], capture_output=True, check=True)
    subprocess.run([ff, '-y', '-ss', '1', '-i', str(target), '-frames:v', '1', '-vf', 'scale=960:-1', str(IMAGES / (name + '-poster.jpg'))], capture_output=True, check=True)
    manifest.append({'output': str(target.relative_to(SITE)), 'source': str(source.relative_to(ROOT))})

# Individual real-world snapshots from the six-column figure; no video is synthesized.
rollout = Image.open('/private/tmp/fitr-preview/rollouts.png').convert('RGB')
w, h = rollout.size
for name, col in [('laptop', 1), ('lamp', 5)]:
    box = (int(w * (0.037 + col * .151)), int(h * .338), int(w * (.185 + col * .151)), int(h * .588))
    rollout.crop(box).save(IMAGES / ('real-' + name + '.webp'), quality=94)

shutil.copy2(ROOT / 'iclr2027/FITR.pdf', SITE / 'assets/paper/FITR.pdf')
(SITE / 'maintenance/asset-sources.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
print('Prepared', len(manifest), 'media entries.')
