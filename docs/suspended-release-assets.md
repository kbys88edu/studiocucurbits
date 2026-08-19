# SC Suspended Release Assets

The public page renders optional media only when the referenced files exist. Add approved assets to the paths below; no component change is required after the data record is updated.

## Audio comparisons

Store lossless masters as 24-bit WAV and publish web-sized derivatives only if the deployment size remains acceptable.

```text
[ ] public/audio/products/suspended/piano-dry.wav
[ ] public/audio/products/suspended/piano-suspended.wav
[ ] public/audio/products/suspended/voice-dry.wav
[ ] public/audio/products/suspended/voice-suspended.wav
[ ] public/audio/products/suspended/field-recording-dry.wav
[ ] public/audio/products/suspended/field-recording-suspended.wav
[ ] public/audio/products/suspended/synth-dry.wav
[ ] public/audio/products/suspended/synth-suspended.wav
```

Recommended: stereo or mono source matching the product demo, 44.1/48 kHz, trimmed silence, normalized conservatively, and kept short enough for metadata preload without making the page heavy.

## Product film

```text
[ ] public/video/products/suspended/suspended-film.mp4
[ ] public/video/products/suspended/suspended-film.webm
[ ] public/video/products/suspended/suspended-film-poster.jpg
[ ] public/video/products/suspended/suspended-film.en.vtt
```

Recommended: 20–35 seconds, H.264 MP4 plus VP9/WebM when available, poster at 1600×900 or equivalent 16:9, captions in WebVTT, and no autoplay requirement.

## Interface and press stills

```text
[x] public/images/products/SC_Suspended_mockup_20260722.png
[ ] public/images/products/SC_Suspended_interface.png
[ ] public/images/products/SC_Suspended_press.png
```

Recommended: PNG or WebP, exact source dimensions preserved in the data record, optimized without removing readable UI detail, and meaningful alt text supplied for non-decorative screenshots.
