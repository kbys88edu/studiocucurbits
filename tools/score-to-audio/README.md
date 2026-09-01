# score-to-audio

Turn a printed score into audio: **PDF → MusicXML → MIDI → MP3**.

The intended use is public-domain sheet music (IMSLP and similar) that needs to
become sound — a reference rendering of a piece, or raw material to process
further. It is a transcription pipeline, not a conversion: optical music
recognition guesses at the page, so the MusicXML it writes is a draft that
wants proofreading before the audio means anything.

| Stage | Tool |
| --- | --- |
| PDF page → MusicXML | [Audiveris](https://github.com/Audiveris/audiveris) 5.6.0 (Java 21, batch mode) |
| MusicXML → MIDI | [music21](https://www.music21.org/) |
| MIDI → WAV | FluidSynth + the FluidR3_GM soundfont |
| WAV → MP3 | ffmpeg / libmp3lame |

## Install

```bash
sudo tools/score-to-audio/setup.sh
```

Debian/Ubuntu. It installs `default-jre`, `fluidsynth`, `fluid-soundfont-gm`
and `ffmpeg` from apt, downloads the pinned Audiveris `.deb` from its GitHub
release (checksum verified), installs `music21`, and finishes by running the
selftest below.

The Audiveris package's post-install step registers a desktop menu entry and
fails on a headless machine; `setup.sh` tolerates that and checks for
`/opt/audiveris/bin/Audiveris` instead.

Paths can be overridden with `AUDIVERIS_BIN`, `FLUIDSYNTH_BIN`, `FFMPEG_BIN`
and `SOUNDFONT`.

## Use

```bash
# whole chain
python3 tools/score-to-audio/score_to_audio.py render score.pdf -o out/

# transcription only, to proofread before rendering
python3 tools/score-to-audio/score_to_audio.py midi score.pdf -o out/
#   ... fix out/score.mxl in MuseScore, re-export, then:
python3 tools/score-to-audio/score_to_audio.py audio out/score.mid -o out/

# first three pages only, at a fixed tempo
python3 tools/score-to-audio/score_to_audio.py render score.pdf -o out/ --sheets "1-3" --tempo 72
```

Useful flags: `--wav` (skip MP3 encoding), `--bitrate`, `--sample-rate`,
`--gain`, `--soundfont`, `-q`.

Each run writes the MusicXML next to the MIDI on purpose. That file is the
editable artefact — correct it there, not in the MIDI.

## Selftest

```bash
python3 tools/score-to-audio/score_to_audio.py selftest
```

`fixtures/scale-study.pdf` is 32 bars of original material engraved with
`abcm2ps` (the ABC source sits beside it, with the regeneration command).
It contains 248 notes. The selftest fails if fewer than 230 come back, which
catches a broken or mis-installed OMR stack rather than ordinary recognition
error.

## What to expect from the recognition

Measured on that fixture — clean digital engraving, single staff, no
accidentals, the easiest input this pipeline will ever see:

- Audiveris read the page in ~16 s; the whole PDF → MP3 chain took 13 s.
- 247 of 248 notes came through, and bars 1–13 matched the source exactly.
- One rhythm error in bar 14 (Audiveris logged `Voice too long` /
  `no correct rhythm`) shifted every later barline by one note, so only 13 of
  32 bars matched exactly even though almost every pitch was correct.

That last point is the important one: a single misread duration corrupts the
bars after it, and the damage is obvious in a score editor but easy to miss in
a waveform. Scanned nineteenth-century editions — faint print, skew, bleed
through from the reverse side, dense piano writing — do considerably worse.
Treat the output as a first pass and proofread the MusicXML.

`oemer` 0.1.8 was measured on the same page as an alternative engine: 4 min 19 s,
233 notes, and a spurious note in bar 1. Audiveris is the better tool here.

## Sourcing scores

Scores are supplied as local files; nothing in this pipeline downloads them.

Two things are worth checking before a rendering is used for anything public:

- **Network.** In a Claude Code web session, `imslp.org` is blocked by the
  environment's network policy (the agent proxy answers `403` to the CONNECT),
  so a PDF has to be fetched elsewhere and brought in, or the host added to the
  environment's allowlist.
- **Licence.** A composition being in the public domain does not settle the
  file. IMSLP hosts scans of specific editions, and typesettings contributed by
  users, under a range of terms (public domain, CC BY-SA, CC BY-NC and others),
  and the status differs between the US, Canada and the EU. Check the licence
  on the individual file's page, per country, before publishing anything
  derived from it.
