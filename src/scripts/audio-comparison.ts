import { trackEvent } from '../lib/analytics';

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
      const audio = button.closest<HTMLElement>('[data-audio-control]')?.querySelector<HTMLAudioElement>('audio');
      if (!audio) return;
      if (audio.paused) {
        void audio.play();
        const comparison = button.closest<HTMLElement>('[data-audio-comparison-root]');
        const demoName = comparison?.dataset.demoName;
        if (demoName) {
          trackEvent('suspended_demo_play', {
            locale: comparison?.dataset.locale ?? 'en',
            demo_name: demoName,
            source: comparison?.dataset.source ?? 'suspended_product_page',
            release_state: comparison?.dataset.releaseState ?? 'pre-release',
          });
        } else {
          trackEvent('audio_comparison_played', { variant: button.dataset.audioVariant ?? '' });
        }
      }
      else audio.pause();
    });
  });

  root.querySelectorAll<HTMLAudioElement>('[data-audio-comparison]').forEach((audio) => {
    audio.addEventListener('canplay', () => {
      const loading = audio.closest<HTMLElement>('[data-audio-comparison-root]')?.querySelector<HTMLElement>('[data-audio-loading]');
      if (loading) loading.textContent = 'Audio ready.';
    }, { once: true });
    audio.addEventListener('ended', () => {
      const rootElement = audio.closest<HTMLElement>('[data-audio-comparison-root]');
      const name = rootElement?.dataset.demoName;
      if (name) {
        trackEvent('suspended_demo_complete', {
          locale: rootElement?.dataset.locale ?? 'en',
          demo_name: name,
          source: rootElement?.dataset.source ?? 'suspended_product_page',
          release_state: rootElement?.dataset.releaseState ?? 'pre-release',
        });
      }
    });
  });
}
