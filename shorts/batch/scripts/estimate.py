"""python3 scripts/estimate.py <short> 'sentence one' 'sentence two' ...  -> src/<short>/timing.json from a speaking-rate
estimate (4.85 syllables/s + 0.4 s pauses, measured from the earlier takes). retime.py replaces it with real times."""
import json, os, re, sys
name, lines = sys.argv[1], sys.argv[2:]
def syl(text):
    n = 0
    for w in re.findall(r"[a-z']+", text.lower()):
        g = len(re.findall(r'[aeiouy]+', w))
        if w.endswith('e') and not w.endswith(('le', 'ee')) and g > 1: g -= 1
        n += max(1, g)
    return n
t, S = 0.15, []
for l in lines:
    d = syl(l) / 4.85; S.append({'a': round(t, 2), 'b': round(t + d, 2), 'text': l}); t += d + 0.4
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', name); os.makedirs(p, exist_ok=True)
json.dump({'source': 'estimate (4.85 syl/s) - run scripts/retime.py on the real voice', 'voiceStart': 0.1,
           'voiceEnd': S[-1]['b'], 'voiceFile': None, 'sentences': S}, open(os.path.join(p, 'timing.json'), 'w'), indent=2)
print(name, S[-1]['b'])
