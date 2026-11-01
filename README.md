# FITR project website

Project page for **FITR: From Articulated Object Images to Interactive 3D Assets for Real-World Manipulation**.

Live GitHub Pages address: https://binyao-123.github.io/FITR/

## Contents

- Paper PDF, research overview and framework.
- Interactive asset examples and simulation data gallery.
- Six simulation demos; four real-world videos; clearly labeled paper snapshots for laptop and lamp.
- All three experimental figures, full attribute and randomization tables, and original NJC evaluation conditions.
- Links to code, datasets, assets and policy checkpoints.

## Preview

Open `index.html` directly in a modern browser, or run `python3 -m http.server 4173` from this folder and visit `http://localhost:4173`.

No build system, package installation, external font requests or CDN scripts are needed. Typography uses the system Arial / Helvetica font stack. SVG icons use Lucide (ISC) and the official Hugging Face logo. All page paths are relative, so the site supports the `/FITR/` GitHub Pages subdirectory.

## Deploy

Push this folder's contents to the root of `binyao-123/FITR`, on branch `main`. In **Settings → Pages**, choose **GitHub Actions** as the source. The included `.github/workflows/publish.yml` deploys only the website and its assets.

Alternatively, choose **Deploy from a branch → main → /(root)**. The root `index.html` and `.nojekyll` support branch-based publishing too; use only one deployment approach at a time.

## Update

- Author names and affiliations: fill `publication.authors` and `publication.affiliations` at the top of `script.js`. Both are intentionally blank, with reserved space on the page.
- Title and resource URLs: edit `index.html`.
- Experiment figures, tables, captions and highlighted numbers: edit the evaluation section in `index.html`.
- Videos: replace the corresponding files in `assets/videos/`; maintain names or update the HTML/JS references. Existing clips use H.264, yuv420p and fast-start MP4 for browser compatibility.
- Paper: replace `assets/paper/FITR.pdf`.

No author names, acceptance claims, arXiv IDs or formal BibTeX citation have been invented. Add citation metadata after the author list and publication details are confirmed.

## Sources

The adjacent research files `iclr2027/FITR.tex` and `iclr2027/FITR.pdf` are the content source. Main figures come from `iclr2027/figure/`; videos and example images come from `其他/` and `code&demo/`. Detailed mappings are recorded in `maintenance/asset-sources.json`.

`maintenance/prepare_assets.py` optionally rebuilds web media from the adjacent FITR research folder; it is not required to view or deploy the website. It requires Pillow, imageio-ffmpeg and pdftoppm. Original files are never modified.

The initial visual layout was inspired by [Zero-WAM](https://robbyant-research.github.io/Zero-WAM/). Website implementation was written for FITR; no Zero-WAM research media or text is included.
