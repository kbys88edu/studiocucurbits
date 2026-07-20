export function pauseOtherAudio(active: HTMLAudioElement, audios: Iterable<HTMLAudioElement>) {
  for (const audio of audios) if (audio !== active) audio.pause();
}

export function initAudioComparisons(root: ParentNode = document) {
  root.addEventListener('play', (event) => {
    if (event.target instanceof HTMLAudioElement) {
      pauseOtherAudio(event.target, root.querySelectorAll<HTMLAudioElement>('[data-audio-comparison]'));
    }
  }, true);

  root.querySelectorAll<HTMLButtonElement>('[data-audio-toggle], [data-audio-stop]').forEach((button) => {
    button.addEventListener('click', () => {
      const audio = root.querySelector<HTMLAudioElement>(`#${button.dataset.audioId}`);
      if (!audio) return;
      if (button.hasAttribute('data-audio-stop')) audio.pause();
      else if (audio.paused) void audio.play();
      else audio.pause();
    });
  });

  root.querySelectorAll<HTMLAudioElement>('[data-audio-comparison]').forEach((audio) => {
    audio.addEventListener('canplay', () => {
      const loading = audio.closest<HTMLElement>('[data-audio-comparison]')?.parentElement?.querySelector<HTMLElement>('[data-audio-loading]');
      if (loading) loading.textContent = 'Audio ready.';
    }, { once: true });
  });
}
