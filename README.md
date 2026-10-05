# Motion Bench

A non-game browser tool for comparing two CSS cubic-bezier easing curves with the same time, duration and translation distance. A preview, curve plot and CSS output update from the same control-point values. It does not upload comparisons or use a model/API at runtime.

Built from new code on 2026-10-05 for a possible Hyperbloom October UI/UX entry. This local preparation is not registration, publication or an accepted hackathon entry. Code and interface were created with Codex under Kwon Jun's submission request. No human user interview, usability improvement, clinical effect or accessibility certification is claimed.

## Run

From this folder, run `python3 -m http.server 8763 --bind 127.0.0.1`. Open the local address. The app has no package dependency or build/install step. Serve the folder over HTTP because browser module loading from `file:` varies.

## Use

Choose curve A or B, then select a preset or edit its four control points. X coordinates are limited to 0–1; this prototype limits Y to −1–2. Play both previews or inspect a fixed percentage of elapsed time. A value above 100% movement is overshoot, not an elapsed-time error. Static comparison disables playback; an OS reduced-motion preference enables it initially and on a change to reduced motion. There is no autoplay or continuous loop.

Download CSS exports the two timing functions and shared duration. It also exports a reduced-motion media query. Apply the classes to elements and choose your own transform. The demo compares translation only: clipping behavior for other properties, such as colors, can differ. Local previews use numerical inversion of the Bézier x coordinate; no claim of exact browser-frame synchronization is made.

All editable fields and preview controls are native HTML controls with visible labels. No study with disabled users or complete accessibility audit has been performed. Curve graphics also retain explicit A/B labels instead of relying on color alone.

## Validation

Run `node --test model.test.mjs`. Analytical degenerate curves verify that elapsed time is inverted correctly instead of incorrectly treated as the curve parameter; mirror symmetry, overshoot, exact endpoints and invalid-input rejection are also tested. Browser interaction/responsive verification is still required before a final submission packet.

Reference for the CSS input/output and control-point constraints: [MDN cubic-bezier()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/cubic-bezier). The implementation is new project code, not copied example code or a fork of another entry.

## Rights and release

No external image, font, music, data or source code was included. Keep the original source and preparation evidence. Public release and actual contest submission have not occurred.
