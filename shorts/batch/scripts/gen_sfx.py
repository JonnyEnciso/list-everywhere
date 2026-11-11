"""Synthesize the shared sound-effect library (no downloads, no credits) -> public/sfx/*.wav, 48 kHz mono, -1 dBFS peaks."""
import os, wave
import numpy as np
SR = 48000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = os.path.join(ROOT, 'public', 'sfx'); os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(5)
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
def knock(f0=520, d=0.16, body=180):
    t = t_(d)
    click = bp(noise(len(t) / SR), 900, 4500) * np.exp(-t * 90)
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
save('whoosh', bp(noise(len(t) / SR), 300, 2200) * env)
# pop
t = t_(0.12); f = 900 + 1400 * np.exp(-t * 60); ph = 2 * np.pi * np.cumsum(f) / SR
save('pop', np.sin(ph) * np.exp(-t * 40))
# rec beep
t = t_(0.18); save('beep', np.sin(2 * np.pi * 1760 * t) * (t < 0.15) * (1 - np.exp(-t * 400)))
# big slow thud (slow-motion hit): low knock + pitch-dropped crack
t = t_(1.0)
crack = bp(noise(len(t) / SR), 120, 1400) * np.exp(-t * 18)
boom = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t * 8)) / SR) * np.exp(-t * 4)
save('thud', 0.6 * crack + boom)
# metal clang (hammer on nail)
t = t_(0.9)
clang = sum(a * np.sin(2 * np.pi * fr * t) * np.exp(-t * dk) for a, fr, dk in [(1, 1180, 6), (0.6, 2730, 8), (0.4, 4100, 11), (0.3, 620, 5)])
save('clang', clang + 0.4 * bp(noise(len(t) / SR), 2000, 8000) * np.exp(-t * 60))
# soft pillow puff
t = t_(0.35); save('pff', lp(noise(len(t) / SR), 700) * np.exp(-t * 14) * (1 - np.exp(-t * 200)))
# squeeze / creak (pressure)
t = t_(1.1); f = 140 + 40 * np.sin(2 * np.pi * 1.3 * t)
saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
save('squeeze', bp(saw, 200, 1600) * np.sin(np.pi * t / 1.1) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t)))
# glass / window creak, crack, air hiss, chop, gulp, bubble, tick, chime, rumble-low
t = t_(0.8); save('creak', bp(2 * ((np.cumsum(90 + 30 * np.sin(2 * np.pi * 2 * t)) / SR) % 1) - 1, 250, 2000) * np.sin(np.pi * t / 0.8))
t = t_(0.35); save('crack', bp(noise(0.35), 1500, 9000) * np.exp(-t * 25) + 0.4 * bp(noise(0.35), 200, 1200) * np.exp(-t * 12))
t = t_(1.0); save('hiss', hp(noise(1.0), 2500) * np.sin(np.pi * t / 1.0) ** 0.7)
t = t_(0.18); save('chop', bp(noise(0.18), 700, 6000) * np.exp(-t * 40) + 0.6 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 35))
t = t_(0.3); f = 300 - 200 * t / 0.3; save('gulp', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.3))
t = t_(0.15); f = 500 + 900 * t / 0.15; save('bubble', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.15))
t = t_(0.06); save('tick', bp(noise(0.06), 2000, 8000) * np.exp(-t * 90))
t = t_(1.4); save('chime', sum(a * np.sin(2 * np.pi * fr * t) * np.exp(-t * 3) for a, fr in [(1, 1047), (0.6, 1319), (0.5, 1568)]))
t = t_(1.2); save('sparkle', sum(np.sin(2 * np.pi * (2000 + 400 * k) * t) * np.exp(-((t - 0.12 * k) * 12) ** 2) for k in range(8)))
t = t_(1.6); save('rumble', lp(noise(1.6), 160) * np.sin(np.pi * t / 1.6) ** 0.6)
print(sorted(os.listdir(out)))
