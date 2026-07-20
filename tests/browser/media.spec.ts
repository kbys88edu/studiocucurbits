import { describe, expect, it } from 'vitest';
import { pauseOtherAudio } from '../../src/scripts/audio-comparison';

describe('audio comparison playback', () => {
  it('pauses every other audio element when one starts', () => {
    const active = { pause: () => undefined } as unknown as HTMLAudioElement;
    let paused = false;
    const other = { pause: () => { paused = true; } } as unknown as HTMLAudioElement;

    pauseOtherAudio(active, [active, other]);

    expect(paused).toBe(true);
  });
});
