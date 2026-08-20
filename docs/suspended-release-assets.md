# SC Suspended Release Assets

Publishing a media section takes **two steps**. Copying a file into `public/`
alone changes nothing: the page is gated on the data record in
`src/data/products.ts`, not on the presence of a file on disk.

1. Place the approved file at the path listed below.
2. Point the matching field in `src/data/products.ts` at that path (paths are
   site-absolute, so `public/audio/x.mp3` is written as `/audio/x.mp3`).

Both language variants must be updated together — the English and Japanese
demo lists are separate arrays.

## Audio comparisons

Directory: `public/audio/products/suspended/` (exists, currently empty).

Keep 24-bit WAV masters outside the repository and publish compressed
derivatives. The site is served from GitHub Pages, which caps a single file at
100 MB and the whole published site at 1 GB; the `<audio>` element in
`src/components/AudioComparison.astro` emits `<source>` without a `type`
attribute, so the browser resolves the format from the file extension. MP3 or
M4A at 44.1/48 kHz is the safe choice.

```text
[ ] public/audio/products/suspended/piano-dry.mp3
[ ] public/audio/products/suspended/piano-suspended.mp3
[ ] public/audio/products/suspended/voice-dry.mp3
[ ] public/audio/products/suspended/voice-suspended.mp3
[ ] public/audio/products/suspended/field-recording-dry.mp3
[ ] public/audio/products/suspended/field-recording-suspended.mp3
[ ] public/audio/products/suspended/synth-dry.mp3
[ ] public/audio/products/suspended/synth-suspended.mp3
```

Wiring: `src/data/products.ts`, `launch.sound.en.demos` (around line 263) and
`launch.sound.ja.demos` (around line 272). Replace `drySrc: null` and
`suspendedSrc: null` with the site-absolute paths.

`ProductLaunch.astro` filters with `demo.drySrc && demo.suspendedSrc`, so a
demo appears only when **both** sides are supplied. A half-configured pair is
silently dropped rather than rendered broken. `launch.release.audioDemosEnabled`
is already `true` (line 244), so no flag change is needed.

Recommended: source matching the product demo, trimmed silence, conservative
normalization, and short enough that `preload="metadata"` keeps the page light.

## Product film

Directory: `public/video/products/suspended/` (exists, currently empty).

```text
[ ] public/video/products/suspended/suspended-film.mp4
[ ] public/video/products/suspended/suspended-film.webm
[ ] public/video/products/suspended/suspended-film-poster.jpg
[ ] public/video/products/suspended/suspended-film.en.vtt
```

Wiring: `src/data/products.ts` line 216, the `media.video` record. It is
currently `{ status: 'in-production', poster: null, mp4: null, webm: null,
captions: null }`. Set `status: 'ready'` and fill `mp4` / `webm` / `poster` /
`captions`.

`ProductLaunch.astro` shows the section when `videoEnabled` (already `true`,
line 245) **and** either `status === 'ready'` with an `mp4` or `webm`, **or** a
`poster` is set. Note the second branch: setting only `poster` renders the
section in its in-production state, which is a deliberate way to show a still
before the film is finished.

Recommended: 20–35 seconds, H.264 MP4 plus VP9/WebM when available, poster at
1600×900 or equivalent 16:9, captions in WebVTT, and no autoplay requirement.

## Interface and press stills

```text
[x] public/images/products/SC_Suspended_mockup_20260722.png
[ ] public/images/products/SC_Suspended_interface.png
[ ] public/images/products/SC_Suspended_press.png
```

Recommended: PNG or WebP, exact source dimensions preserved in the data record,
optimized without removing readable UI detail, and meaningful alt text supplied
for non-decorative screenshots.

## After adding any asset

Run the full gate and confirm the new section actually renders:

```bash
npm run verify
CI=1 npm run test:browser
```

Then re-check the claims listed in [CONTENT_GUIDE.md](CONTENT_GUIDE.md) before
publishing — in particular, publish checkout URLs and public prices together
only after both are approved.
