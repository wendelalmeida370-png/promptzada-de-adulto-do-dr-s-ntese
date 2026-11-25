# deco_luz: the lights of each people (the interiors 3, the front L — D-1012; planos/levantamentos/interiores3-D-referencias.md §1.4,
# §18, §19.2), each a function of its size in the game's frame (moveis_forma.py: Y up, the front toward +Z, centred on its rectangle),
# drawn by js/dentro3d.js where G.Atmos.within says the people lights itself so and has what to burn:
#   lamparina_pires — the open saucer lamp of clay of the Nile: its rim pinched at the front into the lip where the wick lies, the oil
#                     (with its salt) seen in it;
#   lamparina_pedra — the lamp of soapstone of the north: a thick bowl carved round from the stone, a lug at its back to hold it by, the
#                     oil of the seal in it, the wick lying in the groove of its front rim;
#   lamparina_pe    — the stone lamp on its tall foot of the dawn of the cities (Cnossos, Pilos, Mallia): a broad foot, the stem ringed
#                     under the bowl, the bowl with two nozzles opposite, the wick burning in the front one;
#   ocote           — the torch of the lake: a bundle of splinters of resinous pine (the ocote is wood), tied with a cord, in its holder
#                     of clay on the wall — a plate fixed to the wall and the cup it holds out —, their tips charred where they burn;
#   braseira        — the portable brazier of clay: a wide bowl on three short feet, a ring of a handle at either side, its bed of
#                     embers and a few sticks half burnt on it;
#   lanterna        — the lantern of horn of Rome (laterna cornea): the round base and the conical cap of its frame, four posts, the
#                     panes of horn between them, the candle standing in it; hung by its ring.
# The parts (what js/dentro3d.js paints each in): lampada (what a lamp is made of — clay, stone, soapstone, bronze: by what the people
# has), liquido (the oil seen in an open lamp: its colour the oil's), corda (the wick, the cord), madeira / madeira2 (the pine, the
# sticks), carvao (the charred wood), brasa (the embers: red while they burn, ash when they are out), castical (the lantern's frame:
# bronze or iron), chifre (its panes of horn: brighter while the candle burns), cera (its candle). The flame of each is its anchor
# 'chama'. Nothing by chance: every jitter is a seeded generator's — the same thing, the same shape.
import math, random
from moveis_forma import caixa, torno, cilindro, tubo, arco_pts, ovo, TAU

def R(seed): return random.Random(seed)

def fio(M, part, a, b, r=0.002):
    """a wick, a cord: a thin tube between two points"""
    tubo(M, part, [a, b], r, seg=5, chao=None)

# ------------------------------ the lamps of oil ------------------------------
def lamparina_pires(M, w, d, h):
    # (the Egyptian saucer lamp: a shallow round bowl of clay on a flat foot, its rim drawn out and pinched at the front into the lip where
    # the wick lies, the oil in it — the salt does not show: it is in the flame, clearer and steadier)
    torno(M, 'lampada', [(0.0, 0.03), (0.004, 0.04), (0.014, 0.052), (0.024, 0.058), (0.029, 0.059), (0.031, 0.056), (0.026, 0.051), (0.013, 0.044), (0.008, 0.0001)], seg=18, sharp=60, cap1=False)
    torno(M, 'liquido', [(0.019, 0.049), (0.0192, 0.0001)], seg=18, cap0=False, cap1=False)
    # (the lip: the rim drawn out at the front, open on top, the wick laid along it and burning at its point)
    tubo(M, 'lampada', [(0.0, 0.023, 0.044), (0.0, 0.026, 0.064), (0.0, 0.027, 0.079)], 0.012, seg=8, oval=0.42, rs=[0.017, 0.012, 0.007])
    fio(M, 'corda', (0.0, 0.02, 0.036), (0.0, 0.03, 0.081), 0.0019)
    M.anchor('chama', 0.0, 0.032, 0.082, 0.0, 0.0)

def lamparina_pedra(M, w, d, h):
    # (the soapstone lamp of the north: a thick bowl carved round from the stone, its rim worn, a lug at the back to hold it by, the oil of
    # the seal or the whale in it, the wick lying in a groove of the front rim)
    torno(M, 'lampada', [(0.0, 0.05), (0.005, 0.06), (0.024, 0.067), (0.038, 0.066), (0.043, 0.061), (0.042, 0.054), (0.036, 0.049), (0.026, 0.045), (0.02, 0.0001)], seg=16, sharp=55, cap1=False)
    torno(M, 'liquido', [(0.029, 0.046), (0.0292, 0.0001)], seg=16, cap0=False, cap1=False)
    caixa(M, 'lampada', (-0.022, 0.012, -0.083), (0.022, 0.034, -0.058), ch=0.007)
    fio(M, 'corda', (0.0, 0.029, 0.028), (0.0, 0.044, 0.058), 0.0024)
    M.anchor('chama', 0.0, 0.046, 0.061, 0.0, 0.0)

def lamparina_pe(M, w, d, h):
    # (the stone lamp on its tall foot of the Aegean palaces: a broad foot, a turned stem ringed under the bowl, the bowl with two nozzles
    # opposite, the oil in it, the wick burning in the front one)
    torno(M, 'lampada', [(0.0, 0.05), (0.008, 0.05), (0.014, 0.038), (0.024, 0.021), (0.1, 0.016), (0.106, 0.024), (0.112, 0.017), (0.124, 0.03), (0.143, 0.053),
                         (0.158, 0.06), (0.163, 0.056), (0.154, 0.048), (0.146, 0.0001)], seg=16, sharp=55, cap1=False)
    torno(M, 'liquido', [(0.152, 0.046), (0.1522, 0.0001)], seg=16, cap0=False, cap1=False)
    for s in (1, -1):
        tubo(M, 'lampada', [(0.0, 0.15, s * 0.05), (0.0, 0.154, s * 0.069), (0.0, 0.157, s * 0.082)], 0.01, seg=8, oval=0.6, rs=[0.013, 0.01, 0.007])
    fio(M, 'corda', (0.0, 0.151, 0.05), (0.0, 0.161, 0.085), 0.0018)
    M.anchor('chama', 0.0, 0.163, 0.087, 0.0, 0.0)

# ------------------------------ the torch of the lake ------------------------------
def ocote(M, w, d, h):
    # (on a wall, its back at z = -d/2: the holder of clay — a plate fixed to the wall, an arm, the flared cup it holds out —, in the cup a
    # bundle of splinters of resinous pine tied with a cord, leaning out from the wall a little, their tips charred where they burn)
    zb = -d / 2
    caixa(M, 'lampada', (-0.032, 0.02, zb), (0.032, 0.15, zb + 0.014), ch=0.006)
    tubo(M, 'lampada', [(0.0, 0.045, zb + 0.01), (0.0, 0.062, zb + 0.036), (0.0, 0.072, zb + 0.05)], 0.011, seg=6, rs=[0.013, 0.011, 0.012])
    cz = zb + 0.062   # (the cup's axis)
    torno(M, 'lampada', [(0.066, 0.012), (0.072, 0.02), (0.098, 0.026), (0.112, 0.031), (0.115, 0.029), (0.108, 0.024), (0.086, 0.018), (0.08, 0.0001)], z=cz, seg=12, sharp=55, cap1=False)
    # (the splinters: flat, of different lengths, fanned a little round the bundle's axis, which leans out from the wall)
    rnd = R(4401); top0 = h - 0.035; lean = 0.032; n = 7 if M.lod == 0 else 5   # (the middle level: fewer splinters, the char and the end as one)
    for k in range(n):
        a = k * TAU / n + 0.4; r0 = 0.007 + 0.004 * (k % 3) / 2
        x0, z0 = math.cos(a) * r0, cz + math.sin(a) * r0
        top = top0 - 0.03 * rnd.random() - (0.02 if k % 3 == 2 else 0.0)
        fan = 1.9 + 0.6 * rnd.random()
        x1, z1 = x0 * fan, z0 + lean + math.sin(a) * r0 * (fan - 1)
        part = 'madeira' if k % 2 else 'madeira2'
        # (the wood up to the char, the char, the end that burns)
        f = lambda t: (x0 + (x1 - x0) * t, 0.082 + (top - 0.082) * t, z0 + (z1 - z0) * t)
        ov = 0.28 + 0.07 * (k % 3)
        if M.lod == 0:
            tubo(M, part, [f(0.0), f(0.83)], 0.0095, seg=4, oval=ov, chao=None)
            tubo(M, 'carvao', [f(0.83), f(0.95)], 0.0095, seg=4, oval=ov, chao=None, rs=[0.0095, 0.008])
        else: tubo(M, part, [f(0.0), f(0.95)], 0.0095, seg=4, oval=ov, chao=None, caps=False)
        tubo(M, 'brasa', [f(0.95), f(1.0)], 0.008, seg=4, oval=ov, chao=None, rs=[0.008, 0.004])
    # (the cord tying the bundle over the cup)
    yc = 0.132; tq = (yc - 0.082) / (top0 - 0.082)
    ring =[(math.cos(t) * 0.0185 * (1 + 0.9 * tq), yc, cz + lean * tq + math.sin(t) * 0.0185 * (1 + 0.9 * tq)) for t in [TAU * i / 10 for i in range(10)]]
    tubo(M, 'corda', ring, 0.0022, seg=4, closed=True, chao=None)
    M.anchor('chama', 0.0, h - 0.025, cz + lean, 0.0, 0.0)

# ------------------------------ the brazier ------------------------------
def braseira(M, w, d, h):
    # (the portable brazier of clay: a wide bowl on three short feet, a ring of a handle at either side, its bed of embers mounded in it and
    # a few sticks half burnt on the embers)
    for k in range(3):
        a = k * TAU / 3 + math.pi / 2; c, s = math.cos(a), math.sin(a)
        torno(M, 'lampada', [(0.0, 0.02), (0.022, 0.016), (0.05, 0.019)], seg=6, x=c * 0.105, z=s * 0.105, sharp=60)
    torno(M, 'lampada', [(0.036, 0.07), (0.06, 0.13), (0.1, 0.16), (0.124, 0.168), (0.129, 0.163), (0.11, 0.148), (0.075, 0.115), (0.056, 0.0001)], seg=14, sharp=55, cap0=True, cap1=False)
    # (the handles: a ring out of either side under the rim)
    for s in (1, -1):
        tubo(M, 'lampada', [(s * p[0], p[1], p[2]) for p in arco_pts((0.162, 0.106, 0.0), 0.024, -math.pi / 2, math.pi / 2, 4, plane='xy')], 0.0065, seg=4, chao=None)
    # (the bed of embers, round as the bowl and clear of its wall; on it a few coals and the ends of the sticks, charred)
    torno(M, 'brasa', [(0.092, 0.128), (0.104, 0.1), (0.111, 0.05), (0.113, 0.0001)], seg=14, cap0=False, cap1=False, sharp=89)
    rnd = R(4402)
    for k in range(4):
        a = k * TAU / 4 + 0.5; r = 0.03 + 0.04 * (k % 2)
        ovo(M, 'brasa', math.cos(a) * r, 0.11 - 0.004 * (r - 0.03) / 0.04, math.sin(a) * r, 0.014 + 0.005 * rnd.random(), 0.008, 0.011 + 0.004 * rnd.random(), seg=5, nv=2)
    for k, (a, L) in enumerate(((0.7, 0.12), (2.6, 0.1), (4.4, 0.11))):
        c, s = math.cos(a), math.sin(a); p0 = (c * 0.012, 0.114, s * 0.012); p1 = (c * L, 0.1 + 0.006 * k, s * L)
        mid = (p0[0] + (p1[0] - p0[0]) * 0.55, p0[1] + (p1[1] - p0[1]) * 0.55, p0[2] + (p1[2] - p0[2]) * 0.55)
        tubo(M, 'carvao', [p0, mid], 0.008, seg=4, chao=None)
        tubo(M, 'madeira2', [mid, p1], 0.009, seg=4, chao=None)
    M.anchor('chama', 0.0, 0.116, 0.0, 0.0, 0.0)

# ------------------------------ the lantern of horn ------------------------------
def lanterna(M, w, d, h):
    # (hung by its ring from (0, h, 0): the round base and the conical cap of the frame, four posts between them, the panes of horn between
    # the posts, the candle standing on the base inside)
    rb = 0.06
    torno(M, 'castical', [(0.0, rb), (0.012, rb + 0.004), (0.02, rb + 0.002), (0.022, 0.0001)], seg=14, sharp=60)
    for k in range(4):
        a = k * TAU / 4 + math.pi / 4
        tubo(M, 'castical', [(math.cos(a) * rb, 0.02, math.sin(a) * rb), (math.cos(a) * rb, 0.2, math.sin(a) * rb)], 0.005, seg=5)
    torno(M, 'chifre', [(0.022, rb - 0.003), (0.2, rb - 0.003)], seg=14, cap0=False, cap1=False)
    torno(M, 'castical', [(0.198, rb + 0.004), (0.208, rb + 0.006), (0.25, 0.022), (0.262, 0.012), (0.276, 0.008), (0.278, 0.0001)], seg=14, sharp=55, cap0=False)
    # (the ring it hangs by, on the knob of the cap: its top at h)
    tubo(M, 'castical', arco_pts((0.0, h - 0.018, 0.0), 0.015, 0.0, TAU, 10, plane='xy')[:-1], 0.003, seg=4, closed=True, chao=None)
    cilindro(M, 'cera', 0.0, 0.022, 0.0, 0.012, 0.09, seg=10)
    fio(M, 'corda', (0.0, 0.11, 0.0), (0.0, 0.118, 0.0), 0.0014)
    M.anchor('chama', 0.0, 0.12, 0.0, 0.0, 0.0)
