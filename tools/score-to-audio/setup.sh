#!/usr/bin/env bash
# Install the score-to-audio toolchain on Debian/Ubuntu.
#
#   Audiveris  optical music recognition (Java 21)
#   FluidSynth synthesiser + FluidR3_GM soundfont
#   ffmpeg     MP3 encoding through libmp3lame
#   music21    MusicXML -> MIDI
#
# Re-running is safe. Everything installs system-wide, so run it with sudo
# (or as root inside a container).

set -euo pipefail

AUDIVERIS_VERSION="5.6.0"
AUDIVERIS_SHA256="13ac5079c96e1f43f2e5058b5f69f071001ce1b89456a42870dccd9d4ed1273c"
AUDIVERIS_URL="https://github.com/Audiveris/audiveris/releases/download/${AUDIVERIS_VERSION}/Audiveris-${AUDIVERIS_VERSION}-linux-x86_64.deb"
AUDIVERIS_BIN="/opt/audiveris/bin/Audiveris"

say() { printf '\n== %s\n' "$1"; }

say "System packages"
apt-get update -qq
apt-get install -y -qq default-jre fluidsynth fluid-soundfont-gm ffmpeg python3-pip curl

if [ -x "$AUDIVERIS_BIN" ]; then
  say "Audiveris already installed at $AUDIVERIS_BIN"
else
  say "Audiveris ${AUDIVERIS_VERSION}"
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  curl -fsSL -o "$tmp/audiveris.deb" "$AUDIVERIS_URL"
  echo "${AUDIVERIS_SHA256}  ${tmp}/audiveris.deb" | sha256sum -c -
  # The package's postinst registers a desktop menu entry and fails on headless
  # machines. The files under /opt/audiveris are installed regardless, so the
  # configure step is allowed to fail and the binary is checked instead.
  apt-get install -y -qq "$tmp/audiveris.deb" || true
  if [ ! -x "$AUDIVERIS_BIN" ]; then
    echo "error: Audiveris did not install to $AUDIVERIS_BIN" >&2
    exit 1
  fi
fi

say "Python packages"
pip3 install --quiet --break-system-packages -r "$(dirname "$0")/requirements.txt" \
  || pip3 install --quiet -r "$(dirname "$0")/requirements.txt"

say "Verifying"
python3 "$(dirname "$0")/score_to_audio.py" selftest
