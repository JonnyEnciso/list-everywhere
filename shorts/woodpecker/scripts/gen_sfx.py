"""Synthesize the cartoon sound effects (no downloads needed). Writes public/woodpecker/sfx/*.wav, 48 kHz mono,
peak-normalised to -1 dBFS."""
import numpy as np, wave, os, sys
SR = 48000
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'woodpecker', 'sfx')
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(SR * d)) / SR

def lp(x, fc):  # one-pole low-pass
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)
def bp(x, lo, hi): return lp(hp(x, lo), hi)
def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (-1 / 20)
    fade = min(len(x), int(0.004 * SR)); x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(out, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def knock(f0=520, d=0.16, body=180):
    t = t_(d)
    click = bp(rng.standard_normal(len(t)), 900, 4500) * np.exp(-t * 90)
    tone = (np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * f0 * 2.3 * t)) * np.exp(-t * 45)
    thump = np.sin(2 * np.pi * body * t) * np.exp(-t * 30)
    return 0.8 * click + 0.6 * tone + 0.5 * thump
save('knock', knock())
save('knock2', knock(470, body=160))
# boing: sine with falling pitch and vibrato
t = t_(0.7); f = 180 + 260 * np.exp(-t * 5) ; ph = 2 * np.pi * np.cumsum(f * (1 + 0.08 * np.sin(2 * np.pi * 18 * t))) / SR
save('boing', np.sin(ph) * np.exp(-t * 4.5) * (1 - np.exp(-t * 300)))
# whoosh: band-passed noise with a swell
t = t_(0.55); env = np.sin(np.pi * np.clip(t / 0.55, 0, 1)) ** 2
save('whoosh', bp(rng.standard_normal(len(t)), 300, 2200) * env)
# pop
t = t_(0.12); f = 900 + 1400 * np.exp(-t * 60); ph = 2 * np.pi * np.cumsum(f) / SR
save('pop', np.sin(ph) * np.exp(-t * 40))
# rec beep
t = t_(0.18); save('beep', np.sin(2 * np.pi * 1760 * t) * (t < 0.15) * (1 - np.exp(-t * 400)))
# big slow thud (slow-motion hit): low knock + pitch-dropped crack
t = t_(1.0)
crack = bp(rng.standard_normal(len(t)), 120, 1400) * np.exp(-t * 18)
boom = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t * 8)) / SR) * np.exp(-t * 4)
save('thud', 0.6 * crack + boom)
# metal clang (hammer on nail)
t = t_(0.9)
clang = sum(a * np.sin(2 * np.pi * fr * t) * np.exp(-t * dk) for a, fr, dk in [(1, 1180, 6), (0.6, 2730, 8), (0.4, 4100, 11), (0.3, 620, 5)])
save('clang', clang + 0.4 * bp(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t * 60))
# soft pillow puff
t = t_(0.35); save('pff', lp(rng.standard_normal(len(t)), 700) * np.exp(-t * 14) * (1 - np.exp(-t * 200)))
# squeeze / creak (pressure)
t = t_(1.1); f = 140 + 40 * np.sin(2 * np.pi * 1.3 * t)
saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
save('squeeze', bp(saw, 200, 1600) * np.sin(np.pi * t / 1.1) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t)))
print('ok', sorted(os.listdir(out)))
