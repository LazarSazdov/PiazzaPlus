#!/usr/bin/env python3
# Generates Pijaca Plus bar-chart SVGs (green palette, darker = taller) + a CSV.
import os, csv

RAMP = ['#a5d6a7', '#66bb6a', '#43a047', '#2e7d32', '#1b5e20']  # light -> dark
def shade(t):  # t in 0..1
    return RAMP[min(4, int(t * 4.999))]

DANI = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']
CHARTS = {
    'grafikon-prodaje':    ('Prodaja po danima (RSD)',        [4200, 5100, 3800, 6200, 7400, 9800, 5800]),
    'grafikon-predikcije': ('Predviđeni višak (kg)',          [4, 6, 5, 3, 2, 12, 8]),
    'grafikon-potraznja':  ('Potražnja - paradajz (kg/dan)',  [34, 30, 28, 38, 46, 22, 40]),
}

def nice_max(m):
    import math
    p = 10 ** math.floor(math.log10(m))
    f = m / p
    for s in (1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10):
        if s >= f:
            return s * p
    return 10 * p

def dots(v):  # 10000 -> "10.000"
    s = str(int(round(v)))
    out = ''
    while len(s) > 3:
        out = '.' + s[-3:] + out
        s = s[:-3]
    return s + out

W, H = 640, 360
ML, MR, MT, MB = 72, 24, 56, 44
PW, PH = W - ML - MR, H - MT - MB

def svg(title, days, values, fmt=dots):
    mx = nice_max(max(values))
    n = len(values)
    slot = PW / n
    bw = slot * 0.55
    base = MT + PH
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Inter, Arial, sans-serif">']
    parts.append(f'<rect width="{W}" height="{H}" rx="16" fill="#ffffff" stroke="#e5e7eb"/>')
    parts.append(f'<text x="{ML}" y="34" font-size="18" font-weight="600" fill="#1f2937">{title}</text>')
    # y-axis labels + gridlines
    for frac in (1.0, 0.5, 0.0):
        gy = base - frac * PH
        parts.append(f'<line x1="{ML}" y1="{gy:.1f}" x2="{W-MR}" y2="{gy:.1f}" stroke="#eef0ee"/>')
        parts.append(f'<text x="{ML-10}" y="{gy+4:.1f}" font-size="12" fill="#6b7280" text-anchor="end">{fmt(mx*frac)}</text>')
    for i, v in enumerate(values):
        t = v / mx
        bh = t * PH
        x = ML + i * slot + (slot - bw) / 2
        y = base - bh
        parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="5" fill="{shade(t)}"/>')
        parts.append(f'<text x="{x+bw/2:.1f}" y="{base+22:.1f}" font-size="12" fill="#6b7280" text-anchor="middle">{days[i]}</text>')
    parts.append('</svg>')
    return '\n'.join(parts)

here = os.path.dirname(os.path.abspath(__file__))
for name, (title, values) in CHARTS.items():
    with open(os.path.join(here, name + '.svg'), 'w', encoding='utf-8') as f:
        f.write(svg(title, DANI, values))

with open(os.path.join(here, 'chart-data.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['Grafikon', 'Metrika'] + DANI)
    for name, (title, values) in CHARTS.items():
        w.writerow([name, title] + values)

print('Wrote:', ', '.join(name + '.svg' for name in CHARTS), '+ chart-data.csv')
