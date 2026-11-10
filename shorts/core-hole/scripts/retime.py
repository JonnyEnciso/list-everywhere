"""Fit the animation to the real voice-over.

    python3 scripts/retime.py path/to/voice.wav|mp3

Copies the voice to public/core/vo/, finds the pauses by loudness (RMS every 20 ms, silence below -42 dB for
>= 0.18 s, as the skill says - more reliable than word-timestamp edges), picks the pauses inside the speech
that work as the sentence breaks (best fit to each line's syllable count) and rewrites src/core/timing.json. Every beat in time.ts is derived
from these sentence times, so the whole animation, the pecks and the sound cues follow automatically.
"""
import json, os, shutil, subprocess, sys
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TIMING = os.path.join(ROOT, 'src', 'core', 'timing.json')
VOICE_AT = 0.1  # the voice is placed 0.1 s into the composition


def load(path, sr=16000):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768, sr


def main(src):
    x, sr = load(src)
    hop = int(0.02 * sr)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, 'same')[::hop] + 1e-12)
    db = 20 * np.log10(rms / (rms.max() + 1e-12))
    loud = db > -42
    idx = np.flatnonzero(loud)
    start, end = idx[0] * 0.02, (idx[-1] + 1) * 0.02
    gaps, i = [], idx[0]
    while i < idx[-1]:
        if not loud[i]:
            j = i
            while j < len(loud) and not loud[j]: j += 1
            if (j - i) * 0.02 >= 0.18: gaps.append((i * 0.02, j * 0.02))
            i = j
        else:
            i += 1
    d = json.load(open(TIMING))
    n = len(d['sentences'])
    if len(gaps) < n - 1:
        sys.exit(f'only {len(gaps)} pauses found, need {n - 1}: check the take or lower the threshold')
    # choose the n-1 pauses whose sentence lengths best fit each line's syllable count (commas also make pauses,
    # so the longest pauses are not always the sentence breaks); longer pauses win ties
    from itertools import combinations
    import re
    def syllables(text):  # vowel groups per word, a silent final e dropped; good enough to compare line lengths
        n = 0
        for w in re.findall(r"[a-z']+", text.lower()):
            g = len(re.findall(r'[aeiouy]+', w))
            if w.endswith('e') and not w.endswith(('le', 'ee')) and g > 1: g -= 1
            n += max(1, g)
        return n
    words = [syllables(s['text']) for s in d['sentences']]  # syllables track speaking time better than words
    rate = (end - start) / sum(words)
    def cost(combo):
        b = [start] + [v for g in combo for v in g] + [end]
        fit = sum(((b[2 * k + 1] - b[2 * k]) - w * rate) ** 2 for k, w in enumerate(words))
        return fit - 0.5 * sum(g[1] - g[0] for g in combo)
    breaks = list(min(combinations(gaps, n - 1), key=cost))
    bounds = [start] + [v for g in breaks for v in g] + [end]
    for k, s in enumerate(d['sentences']):
        s['a'] = round(VOICE_AT + bounds[2 * k], 3)
        s['b'] = round(VOICE_AT + bounds[2 * k + 1], 3)
    ext = os.path.splitext(src)[1]
    dst = os.path.join(ROOT, 'public', 'core', 'vo', 'take1' + ext)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.abspath(src) != os.path.abspath(dst): shutil.copy(src, dst)
    d.update(source=f'measured from {os.path.basename(src)} (pauses by RMS)', voiceStart=VOICE_AT,
             voiceEnd=round(VOICE_AT + end, 3), voiceFile=f'core/vo/take1{ext}')
    json.dump(d, open(TIMING, 'w'), indent=2)
    for s in d['sentences']: print(f"{s['a']:6.2f} - {s['b']:6.2f}  {s['text']}")
    print(f"voice ends {d['voiceEnd']:.2f} s -> video {d['voiceEnd'] + 0.9:.2f} s")


if __name__ == '__main__':
    main(sys.argv[1])
