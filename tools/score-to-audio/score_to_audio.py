#!/usr/bin/env python3
"""Render a printed score into MIDI, and MIDI into MP3.

Three subcommands, each usable on its own:

    midi   score.pdf     PDF page images -> MusicXML (Audiveris) -> MIDI (music21)
    audio  score.mid     MIDI -> WAV (FluidSynth) -> MP3 (ffmpeg/LAME)
    render score.pdf     both steps in one pass
    selftest             run the bundled fixture through the whole chain

Optical music recognition is a best-effort transcription, not a conversion.
Proofread the MusicXML this writes before trusting the audio: see README.md.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
FIXTURE_MIN_NOTES = 230

SETUP_HINT = f"Run {HERE / 'setup.sh'} (Debian/Ubuntu) or see {HERE / 'README.md'}."

AUDIVERIS_CANDIDATES = ("/opt/audiveris/bin/Audiveris", "Audiveris", "audiveris")
SOUNDFONT_CANDIDATES = (
    "/usr/share/sounds/sf2/FluidR3_GM.sf2",
    "/usr/share/sounds/sf2/default-GM.sf2",
    "/usr/share/soundfonts/FluidR3_GM.sf2",
    "/usr/share/soundfonts/default.sf2",
)


class ToolMissing(SystemExit):
    def __init__(self, what: str) -> None:
        super().__init__(f"error: {what} not found. {SETUP_HINT}")


def resolve_binary(name: str, candidates: tuple[str, ...], env_var: str) -> str:
    override = os.environ.get(env_var)
    if override:
        if shutil.which(override) or Path(override).is_file():
            return override
        raise SystemExit(f"error: {env_var}={override} is not an executable file.")
    for candidate in candidates:
        found = shutil.which(candidate)
        if found:
            return found
        if Path(candidate).is_file() and os.access(candidate, os.X_OK):
            return candidate
    raise ToolMissing(name)


def resolve_soundfont(explicit: str | None) -> Path:
    if explicit:
        path = Path(explicit).expanduser()
        if not path.is_file():
            raise SystemExit(f"error: soundfont not found: {path}")
        return path
    env_value = os.environ.get("SOUNDFONT")
    candidates = (env_value, *SOUNDFONT_CANDIDATES) if env_value else SOUNDFONT_CANDIDATES
    for candidate in candidates:
        path = Path(candidate).expanduser()
        if path.is_file():
            return path
    raise ToolMissing("a General MIDI soundfont (.sf2)")


def run(command: list[str], *, quiet: bool) -> None:
    result = subprocess.run(
        command,
        stdout=subprocess.DEVNULL if quiet else None,
        stderr=subprocess.STDOUT if quiet else None,
    )
    if result.returncode != 0:
        raise SystemExit(f"error: command failed ({result.returncode}): {' '.join(command)}")


def transcribe_pdf(pdf: Path, out_dir: Path, *, sheets: str | None, quiet: bool) -> list[Path]:
    """Run Audiveris in batch mode and return the MusicXML files it exported."""
    audiveris = resolve_binary("Audiveris", AUDIVERIS_CANDIDATES, "AUDIVERIS_BIN")
    with tempfile.TemporaryDirectory(prefix="audiveris-") as tmp:
        work = Path(tmp)
        command = [audiveris, "-batch", "-transcribe", "-export", "-output", str(work)]
        if sheets:
            command += ["-sheets", *sheets.split()]
        command += ["--", str(pdf)]
        run(command, quiet=quiet)
        exported = sorted(work.glob("*.mxl")) or sorted(work.glob("*.xml"))
        exported = [path for path in exported if path.name not in {"book.xml"}]
        if not exported:
            raise SystemExit(
                f"error: Audiveris exported no MusicXML for {pdf.name}. "
                "The pages may be too low-resolution or too heavily skewed for OMR."
            )
        out_dir.mkdir(parents=True, exist_ok=True)
        results = []
        for path in exported:
            target = out_dir / path.name
            shutil.copy2(path, target)
            results.append(target)
        return results


def musicxml_to_midi(musicxml: Path, midi: Path, *, tempo: float | None) -> int:
    """Convert MusicXML to MIDI, returning the note count as a sanity signal."""
    try:
        from music21 import converter, tempo as m21tempo
    except ImportError as exc:  # pragma: no cover - environment guard
        raise SystemExit(f"error: music21 is not installed ({exc}). {SETUP_HINT}") from None

    score = converter.parse(str(musicxml))
    if tempo is not None:
        existing = list(score.recurse().getElementsByClass(m21tempo.MetronomeMark))
        if existing:
            score.remove(existing, recurse=True)
        score.insert(0, m21tempo.MetronomeMark(number=tempo))
    midi.parent.mkdir(parents=True, exist_ok=True)
    score.write("midi", fp=str(midi))
    return len(score.flatten().notes)


def midi_to_audio(
    midi: Path,
    output: Path,
    *,
    soundfont: Path,
    gain: float,
    sample_rate: int,
    bitrate: str,
    quiet: bool,
) -> Path:
    """Synthesise MIDI with FluidSynth, then encode to MP3 unless a WAV was asked for."""
    fluidsynth = resolve_binary("fluidsynth", ("fluidsynth",), "FLUIDSYNTH_BIN")
    want_wav = output.suffix.lower() == ".wav"
    output.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="score-audio-") as tmp:
        wav = output if want_wav else Path(tmp) / f"{midi.stem}.wav"
        run(
            [
                fluidsynth, "-ni", "-g", str(gain), "-r", str(sample_rate),
                "-F", str(wav), str(soundfont), str(midi),
            ],
            quiet=quiet,
        )
        if not wav.is_file() or wav.stat().st_size == 0:
            raise SystemExit(f"error: FluidSynth produced no audio for {midi.name}.")
        if want_wav:
            return output

        ffmpeg = resolve_binary("ffmpeg", ("ffmpeg",), "FFMPEG_BIN")
        run(
            [
                ffmpeg, "-y", "-loglevel", "error", "-i", str(wav),
                "-codec:a", "libmp3lame", "-b:a", bitrate, "-ar", str(sample_rate),
                str(output),
            ],
            quiet=quiet,
        )
    return output


def audio_target(source: Path, destination: str | None, *, wav: bool) -> Path:
    suffix = ".wav" if wav else ".mp3"
    if destination is None:
        return source.with_suffix(suffix)
    path = Path(destination)
    if path.suffix.lower() in {".mp3", ".wav"}:
        return path
    return path / f"{source.stem}{suffix}"


def cmd_midi(args: argparse.Namespace) -> int:
    pdf = Path(args.input).expanduser()
    if not pdf.is_file():
        raise SystemExit(f"error: no such file: {pdf}")
    out_dir = Path(args.output).expanduser() if args.output else pdf.parent
    for musicxml in transcribe_pdf(pdf, out_dir, sheets=args.sheets, quiet=args.quiet):
        midi = musicxml.with_suffix(".mid")
        notes = musicxml_to_midi(musicxml, midi, tempo=args.tempo)
        print(f"{musicxml}  ({notes} notes)")
        print(f"{midi}")
    return 0


def cmd_audio(args: argparse.Namespace) -> int:
    midi = Path(args.input).expanduser()
    if not midi.is_file():
        raise SystemExit(f"error: no such file: {midi}")
    output = midi_to_audio(
        midi,
        audio_target(midi, args.output, wav=args.wav),
        soundfont=resolve_soundfont(args.soundfont),
        gain=args.gain,
        sample_rate=args.sample_rate,
        bitrate=args.bitrate,
        quiet=args.quiet,
    )
    print(f"{output}")
    return 0


def cmd_render(args: argparse.Namespace) -> int:
    pdf = Path(args.input).expanduser()
    if not pdf.is_file():
        raise SystemExit(f"error: no such file: {pdf}")
    out_dir = Path(args.output).expanduser() if args.output else pdf.parent
    soundfont = resolve_soundfont(args.soundfont)
    for musicxml in transcribe_pdf(pdf, out_dir, sheets=args.sheets, quiet=args.quiet):
        midi = musicxml.with_suffix(".mid")
        notes = musicxml_to_midi(musicxml, midi, tempo=args.tempo)
        audio = midi_to_audio(
            midi,
            audio_target(midi, str(out_dir), wav=args.wav),
            soundfont=soundfont,
            gain=args.gain,
            sample_rate=args.sample_rate,
            bitrate=args.bitrate,
            quiet=args.quiet,
        )
        print(f"{musicxml}  ({notes} notes)")
        print(f"{midi}")
        print(f"{audio}")
    return 0


def cmd_selftest(args: argparse.Namespace) -> int:
    fixture = HERE / "fixtures" / "scale-study.pdf"
    if not fixture.is_file():
        raise SystemExit(f"error: fixture missing: {fixture}")

    with tempfile.TemporaryDirectory(prefix="score-selftest-") as tmp:
        out_dir = Path(args.output).expanduser() if args.output else Path(tmp)
        exported = transcribe_pdf(fixture, out_dir, sheets=None, quiet=True)
        if len(exported) != 1:
            raise SystemExit(f"error: expected one MusicXML export, got {len(exported)}")
        midi = exported[0].with_suffix(".mid")
        notes = musicxml_to_midi(exported[0], midi, tempo=None)
        print(f"transcribed {fixture.name}: {notes} notes (fixture engraves 248)")
        if notes < FIXTURE_MIN_NOTES:
            raise SystemExit(
                f"error: only {notes} notes recognised, expected at least {FIXTURE_MIN_NOTES}. "
                "The OMR stack is installed but performing far below its baseline."
            )
        try:
            soundfont = resolve_soundfont(None)
        except SystemExit as exc:
            print(f"skipping audio stage: {exc}")
            return 0
        audio = midi_to_audio(
            midi,
            audio_target(midi, str(out_dir), wav=False),
            soundfont=soundfont,
            gain=0.7,
            sample_rate=44100,
            bitrate="192k",
            quiet=True,
        )
        print(f"rendered {audio.name}: {audio.stat().st_size} bytes")
    print("selftest ok")
    return 0


def add_audio_options(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--soundfont", help="Path to a .sf2 soundfont (default: system FluidR3_GM).")
    parser.add_argument("--gain", type=float, default=0.7, help="FluidSynth gain (default: 0.7).")
    parser.add_argument("--sample-rate", type=int, default=44100, help="Output sample rate (default: 44100).")
    parser.add_argument("--bitrate", default="192k", help="MP3 bitrate (default: 192k).")
    parser.add_argument("--wav", action="store_true", help="Write WAV instead of MP3.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="score_to_audio.py",
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("-q", "--quiet", action="store_true", help="Silence the underlying tools.")

    midi = subparsers.add_parser("midi", parents=[common], help="PDF -> MusicXML -> MIDI")
    midi.add_argument("input", help="Score PDF (or page image Audiveris can read).")
    midi.add_argument("-o", "--output", help="Output directory (default: beside the input).")
    midi.add_argument("--sheets", help='Page selection passed to Audiveris, e.g. "1 4-5".')
    midi.add_argument("--tempo", type=float, help="Override the tempo in BPM.")
    midi.set_defaults(func=cmd_midi)

    audio = subparsers.add_parser("audio", parents=[common], help="MIDI -> MP3")
    audio.add_argument("input", help="MIDI file.")
    audio.add_argument("-o", "--output", help="Output file or directory (default: beside the input).")
    add_audio_options(audio)
    audio.set_defaults(func=cmd_audio)

    render = subparsers.add_parser("render", parents=[common], help="PDF -> MIDI -> MP3 in one pass")
    render.add_argument("input", help="Score PDF.")
    render.add_argument("-o", "--output", help="Output directory (default: beside the input).")
    render.add_argument("--sheets", help='Page selection passed to Audiveris, e.g. "1 4-5".')
    render.add_argument("--tempo", type=float, help="Override the tempo in BPM.")
    add_audio_options(render)
    render.set_defaults(func=cmd_render)

    selftest = subparsers.add_parser("selftest", help="Run the bundled fixture through the chain.")
    selftest.add_argument("-o", "--output", help="Keep the artefacts in this directory.")
    selftest.set_defaults(func=cmd_selftest)

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
