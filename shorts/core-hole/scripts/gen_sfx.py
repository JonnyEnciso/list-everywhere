"""Synthesize the sound effects (no downloads, no credits) -> public/core/sfx/*.wav, 48 kHz mono, peaks at -1 dBFS.
The drill loop is cut to the length of the drilling beat in src/core/timing.json, so re-run after retime.py."""
import json, os, wave
import numpy as np
SR = 48000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = os.path.join(ROOT, 'public', 'core', 'sfx'); os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(3)
t_ = lambda d: np.arange(int(SR * d)) / SR
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
hp = lambda x, fc: x - lp(x, fc)
bp = lambda x, lo, hi: lp(hp(x, lo), hi)
def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (-1 / 20)
    f = min(len(x), int(0.006 * SR)); x[-f:] *= np.linspace(1, 0, f); x[:f] *= np.linspace(0, 1, f)
    with wave.open(os.path.join(out, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
noise = lambda d: rng.standard_normal(int(SR * d))

t = t_(0.25); save('chk', bp(noise(0.25), 600, 5000) * np.exp(-t * 30) + 0.5 * np.sin(2 * np.pi * 140 * t) * np.exp(-t * 25))
t = t_(0.3); save('swish', bp(noise(0.3), 800, 4000) * np.sin(np.pi * t / 0.3) ** 2)
t = t_(0.25); f = 220 * np.exp(-t * 6); save('plop', lp(noise(0.25), 900) * np.exp(-t * 22) + 0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18))
t = t_(0.12); f = 900 + 1400 * np.exp(-t * 60); save('pop', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40))
t = t_(0.6); f = 200 + 240 * np.exp(-t * 5); save('boing', np.sin(2 * np.pi * np.cumsum(f * (1 + 0.08 * np.sin(2 * np.pi * 18 * t))) / SR) * np.exp(-t * 5))
t = t_(0.7)
save('clank', sum(a * np.sin(2 * np.pi * fr * t) * np.exp(-t * dk) for a, fr, dk in [(1, 820, 9), (0.7, 1930, 12), (0.4, 3100, 16)]) + 0.6 * bp(noise(0.7), 300, 3000) * np.exp(-t * 40))
t = t_(1.0); save('ding', sum(a * np.sin(2 * np.pi * fr * t) * np.exp(-t * 4) for a, fr in [(1, 1568), (0.4, 3136), (0.2, 4704)]))
t = t_(0.55); save('whoosh', bp(noise(0.55), 300, 2200) * np.sin(np.pi * t / 0.55) ** 2)
t = t_(2.2); save('sizzle', hp(noise(2.2), 3000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 3.1 * t))) * np.minimum(1, t * 4) * np.minimum(1, (2.2 - t) * 2))
t = t_(0.5); f = 160 + 120 * np.sin(np.pi * t / 0.5); save('squish', lp(noise(0.5), 1100) * np.sin(np.pi * t / 0.5) + 0.7 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.5))
# earthquake rumble (low noise swell) and seismograph needle scratch
t = t_(1.6); save('rumble', lp(noise(1.6), 160) * np.sin(np.pi * t / 1.6) ** 0.6 * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * t)) + 0.3 * np.sin(2 * np.pi * 42 * t) * np.sin(np.pi * t / 1.6))
t = t_(0.9); save('scratch', bp(noise(0.9), 2500, 7000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * t))) * np.exp(-t * 3))
# drill: motor hum + grinding, runs from the drill beat to the stop beat, then winds down
d = json.load(open(os.path.join(ROOT, 'src', 'core', 'timing.json')))
S = d['sentences']
at = lambda i, f: S[i]['a'] + (S[i]['b'] - S[i]['a']) * f
run = S[4]['a'] - (S[2]['a'] + 0.45); dur = run + 0.9
t = t_(dur); f = np.where(t < run, 95, 95 * np.exp(-(t - run) * 2.5))
ph = np.cumsum(f) / SR
motor = (2 * (ph % 1) - 1) * 0.6 + 0.4 * np.sin(2 * np.pi * ph * 2)
grind = bp(noise(dur), 400, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))
env = np.minimum(1, t * 6) * np.where(t < run, 1, np.exp(-(t - run) * 3))
save('drill', lp(motor, 1800) * env + 0.5 * grind * env)
print(sorted(os.listdir(out)))
