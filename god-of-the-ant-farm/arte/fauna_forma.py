# fauna_forma: the animals' clay — each kind's body as signed distance fields (corpo_sdf), built from its measures by a
# family (the hoofed, the clawed, the heavy, the birds, the scaled...), on one skeleton for all (BONES). Read by fauna.py.
# Coordinates: metres; the beast standing on the ground (y = 0), facing +Z, its left at +X. Deterministic: no randomness.
import numpy as np
from corpo_sdf import Sphere, Ellipsoid, RoundCone, RBox, Plane, frame_from, rot_x, rot_y, rot_z

# the skeleton every beast shares (the order is js/fauna3d.js's contract). A beast without a part keeps its bone at its parent
BONES = ['root', 'spine', 'chest', 'neck0', 'neck1', 'neck2', 'head', 'jaw', 'earL', 'earR',
         'tail0', 'tail1', 'tail2', 'tail3',
         'flL0', 'flL1', 'flL2', 'flL3', 'flR0', 'flR1', 'flR2', 'flR3',
         'hlL0', 'hlL1', 'hlL2', 'hlL3', 'hlR0', 'hlR1', 'hlR2', 'hlR3',
         'trunk0', 'trunk1', 'trunk2']
PARENT = {'root': None, 'spine': 'root', 'chest': 'spine', 'neck0': 'chest', 'neck1': 'neck0', 'neck2': 'neck1', 'head': 'neck2',
          'jaw': 'head', 'earL': 'head', 'earR': 'head', 'tail0': 'root', 'tail1': 'tail0', 'tail2': 'tail1', 'tail3': 'tail2',
          'trunk0': 'head', 'trunk1': 'trunk0', 'trunk2': 'trunk1'}
for s in 'LR':
    PARENT['fl%s0' % s] = 'chest'; PARENT['hl%s0' % s] = 'root'
    for k in (1, 2, 3): PARENT['fl%s%d' % (s, k)] = 'fl%s%d' % (s, k - 1); PARENT['hl%s%d' % (s, k)] = 'hl%s%d' % (s, k - 1)
BI = {b: i for i, b in enumerate(BONES)}
# the zones: how the shader paints a point (0 the coat, with the kind's pattern; the others their own colour)
ZONE = {'pelo': 0, 'olhoL': 1, 'olhoR': 2, 'chifre': 3, 'casco': 4, 'focinho': 5, 'crina': 6, 'marfim': 7, 'bico': 8,
        'crista': 9, 'galhada': 10, 'asa': 11, 'pena': 12, 'casca': 13, 'unha': 14}


def v3(*a): return np.array(a, float)
def nrm(a): a = np.asarray(a, float); return a / np.linalg.norm(a)
def lerp(a, b, t): return np.asarray(a, float) * (1 - t) + np.asarray(b, float) * t


class Beast:
    """A beast being modelled: its joints, its body's clay (one skin), its pieces (eyes, hooves, horns, a mane — each its
    own mesh, its own zone) and what the 3D needs to know of it."""
    def __init__(self, name, H, L):
        self.name = name; self.H = H; self.L = L; self.J = {}; self.P = []; self.pieces = []; self.meta = {}
        self.keep = []  # (where the decimator should keep detail: (centre, radius, weight))

    def j(self, bone, p): self.J[bone] = v3(*p); return self.J[bone]

    def add(self, prim, bone, k=0.0, tau=None, op='u'):
        prim.set(op, k, bone, tau if tau is not None else max(0.012, self.H * 0.04)); self.P.append(prim); return prim

    def cut(self, prim, k=0.0): prim.set('s', k, None); self.P.append(prim); return prim

    def piece(self, name, zone, prims, tris, far=None, bone=None, h=None):
        """prims: [(prim, bone)] — a piece of its own colour, meshed apart and laid over the body."""
        ps = []
        for pr, bn in prims:
            if isinstance(pr, tuple): pr, op = pr
            else: op = 'u'
            pr.set(op, getattr(pr, '_k', 0.0), bn, max(0.008, self.H * 0.03)); ps.append(pr)
        self.pieces.append(dict(name=name, zone=zone, P=ps, tris=tris, far=far if far is not None else max(0, tris // 4), h=h))

    def bones_filled(self):
        J = dict(self.J)
        for b in BONES:
            if b not in J:
                p = PARENT[b]; J[b] = J[p].copy() if p else v3(0, self.H * 0.6, 0)
        return J


def K(prim, k): prim._k = k; return prim


def orient(a, b, up=(0, 1, 0)):
    """A frame whose local Y runs from a to b (its Z leaning toward up)."""
    d = nrm(np.asarray(b, float) - np.asarray(a, float)); u = np.asarray(up, float)
    if abs(np.dot(d, nrm(u))) > 0.98: u = (0, 0, 1) if abs(d[2]) < 0.9 else (1, 0, 0)
    return frame_from(d, u)


def ell_between(a, b, rx, rz, extra=1.0):
    """An ellipsoid laid from a to b: its long axis (y) the segment, its radii across rx (sideways) and rz."""
    a = np.asarray(a, float); b = np.asarray(b, float); c = (a + b) / 2; l = np.linalg.norm(b - a) / 2 * extra
    d = nrm(b - a); side = nrm(np.cross(d, [0, 0, 1] if abs(d[2]) < 0.95 else [0, 1, 0]))
    if abs(side[0]) < 0.5: side = nrm(np.cross(d, [0, 1, 0]))
    up = np.cross(side, d)
    R = np.stack([side, d, up], axis=1) if side[0] >= 0 else np.stack([-side, d, -up], axis=1)
    return Ellipsoid(c, (rx, l, rz), R)


# ------------------------------ the eye ------------------------------
def eyes(b, c, r, side_dir=None):
    """Two eyes at c (the left one; the right mirrored), radius r — the head's."""
    for sd, z in ((1, 'olhoL'), (-1, 'olhoR')):
        cc = v3(c[0] * sd, c[1], c[2])
        b.piece(z, z, [(Sphere(cc, r), 'head')], 0, far=-1)
        b.pieces[-1]['eye'] = (cc, r)


# ------------------------------ the four-legged ------------------------------
DEF = dict(D=0.46, Wr=0.72, rump=1.0, dip=0.03, belly=0.08, Dh=0.86, legR=0.07, canR=0.034, foot='hoof',
           neckA=48, neckL=0.6, neckR0=0.42, neckR1=0.22, headA=52, headL=0.36, headH=0.4, headW=0.36, muzR=0.4, muzL=0.5,
           earL=0.16, earW=0.06, earA=(25, 30), earT=0.012, earCup=0.6, tail='hang', tailL=0.5, tailR=0.03,
           eyeR=0.022, brow=0.0, cheek=1.0, jaw=False, neckFlat=0.72, withers=0.25, shoulder=1.0, haunch=1.0,
           dig=False, plant=False, pillar=False, hindPost=0.0, legSplay=1.0, chestFwd=0.0, hump=0.0, humpZ=0.12, crest=0.0,
           muzDrop=0.0, muzFlat=1.0, earFold=0.0, headRot=0.0, snout=0.0, forehead=0.0, neckUp=0.0, muzPos=0.88, stop=0.0, tailHair=0.0, plantF=False, earFace='fwd', flex=False, shag=0.0, udder=0.0,
           face='graze', eyeFwd=0.0, earTip=0.32, ruff=0.0, neckS=0.0)


NECK = 0.55
LEGK, CANK = 1.12, 1.18  # (the legs a little sturdier than the measures: the stylized look is chunky, not spindly)


def quad(b, **kw):
    """A mammal on four legs: the chest and the barrel, the haunches, two-boned legs with their cannons and hooves or paws,
    the neck in three, the head (skull, face, muzzle, cheeks, jaw), the ears, the tail. All measures from H (the withers'
    height) and L (the body's length, shoulder to buttock), as fractions where they are under 1 and not metres."""
    p = dict(DEF); p.update(kw); b.meta['p'] = p
    H, L = b.H, b.L; Dc = p['D'] * H; Wd = Dc * p['Wr']; Hc = H * p['rump']; Dh = Dc * p['Dh']
    tau = max(0.012, H * 0.05)
    # --- joints of the trunk
    root = b.j('root', (0, Hc - Dh * 0.38, -L * 0.30))
    spine = b.j('spine', (0, H * (1 - p['dip']) - Dc * 0.45, -L * 0.02))
    chest = b.j('chest', (0, H - Dc * 0.48, L * 0.22))
    # --- the trunk's clay
    belly = p['belly']
    b.add(Ellipsoid((0, H - Dc * 0.5, L * (0.17 + p['chestFwd'])), (Wd * 0.5, Dc * 0.5, L * 0.33)), 'chest')                    # the ribcage
    b.add(K(Ellipsoid((0, H * (1 - p['dip'] * 0.6) - Dc * 0.53 - belly * Dc * 0.08, -L * 0.06), (Wd * (0.52 + belly * 0.15), Dc * 0.5 * (1 + belly * 0.5), L * 0.33)), 0), 'spine', k=Dc * 0.25)  # the barrel
    b.add(Ellipsoid((0, Hc - Dh * 0.46, -L * 0.30), (Wd * 0.47 * p['haunch'], Dh * 0.5, L * 0.23)), 'root', k=Dc * 0.3)         # the haunches
    b.add(Ellipsoid((0, H - Dc * 0.18, L * 0.27), (Wd * 0.3, Dc * p['withers'], L * 0.17)), 'chest', k=Dc * 0.25)                # the withers
    b.add(Ellipsoid((0, H - Dc * 0.62, L * (0.40 + p['chestFwd'])), (Wd * 0.36, Dc * 0.36, L * 0.12)), 'chest', k=Dc * 0.2)       # the breast
    if p['shag']:  # (a skirt of long hair down the flanks, almost to the hooves: the musk ox)
        sk_y = H * (0.62 - p['shag'] * 0.3)
        b.add(K(Ellipsoid((0, (H - Dc * 0.4 + sk_y) / 2, -L * 0.08), (Wd * 0.6, (H - Dc * 0.4 - sk_y) / 2 + Dc * 0.2, L * 0.42)), 0), 'spine', k=Dc * 0.3)
        b.add(Ellipsoid((0, H - Dc * 0.6, L * 0.24), (Wd * 0.56, Dc * 0.55, L * 0.22)), 'chest', k=Dc * 0.3)
    if p['udder']:
        b.add(Ellipsoid((0, H - Dc * 1.02, -L * 0.2), (Wd * 0.22 * p['udder'], Dc * 0.16 * p['udder'], L * 0.1 * p['udder'])), 'root', k=Dc * 0.12)
    if p['hump']:
        b.add(Ellipsoid((0, H + Dc * p['hump'] * 0.35, L * p['humpZ']), (Wd * 0.32, Dc * p['hump'] * 0.75, L * 0.2)), 'chest', k=Dc * 0.35)
    # --- the legs, front and hind, of each side
    for sd, s in ((1, 'L'), (-1, 'R')):
        X = sd * Wd * 0.34 * p['legSplay']
        sh = b.j('fl%s0' % s, (X * 1.08, H - Dc * 0.58, L * (0.40 + p['chestFwd'] * 0.5)))
        el = b.j('fl%s1' % s, (X * 1.1, H - Dc * 1.0, L * 0.30))
        if p['pillar']:
            kn = b.j('fl%s2' % s, (X * 1.05, H * 0.30, L * 0.31)); fe = b.j('fl%s3' % s, (X * 1.05, H * 0.06, L * 0.31))
        elif p['plantF']:
            kn = b.j('fl%s2' % s, (X, H * 0.1, L * 0.32)); fe = b.j('fl%s3' % s, (X, H * 0.035, L * 0.38))
        elif p['dig']:
            kn = b.j('fl%s2' % s, (X, H * 0.13, L * 0.33)); fe = b.j('fl%s3' % s, (X, H * 0.04, L * 0.35))
        else:
            kn = b.j('fl%s2' % s, (X, H * 0.31, L * 0.315)); fe = b.j('fl%s3' % s, (X, H * 0.075, L * 0.32))
        hp = b.j('hl%s0' % s, (X * 1.05, Hc - Dh * 0.3, -L * 0.30))
        st = b.j('hl%s1' % s, (X * 1.15, min(H - Dc * 0.9, hp[1] - Dh * 0.3) + p['hindPost'] * H * 0.1, -L * (0.17 + p['hindPost'] * 0.04)))  # (under the hip: a low rump — the giraffe's — brings the stifle down with it)
        if p['pillar']:
            hk = b.j('hl%s2' % s, (X * 1.05, H * 0.30, -L * 0.30)); hf = b.j('hl%s3' % s, (X * 1.05, H * 0.06, -L * 0.29))
        elif p['plant']:
            hk = b.j('hl%s2' % s, (X, H * 0.12, -L * 0.40)); hf = b.j('hl%s3' % s, (X, H * 0.035, -L * 0.30))
        elif p['dig']:
            hk = b.j('hl%s2' % s, (X, H * 0.27, -L * 0.46)); hf = b.j('hl%s3' % s, (X, H * 0.04, -L * 0.38))
        else:
            hk = b.j('hl%s2' % s, (X, H * 0.31, -L * 0.43)); hf = b.j('hl%s3' % s, (X, H * 0.075, -L * 0.38))
        R = p['legR'] * H * LEGK; C = p['canR'] * H * CANK
        # the shoulder (scapula and upper arm in one muscle), the forearm, the cannon, the pastern
        b.add(ell_between(sh + v3(0, Dc * 0.42, -L * 0.08), el, Wd * 0.17 * p['shoulder'], R * 1.9 * p['shoulder']), 'fl%s0' % s, k=Dc * 0.18, tau=tau)
        b.add(RoundCone(el + v3(0, Dc * 0.06, 0), kn, R * 1.05, C * 1.15), 'fl%s1' % s, k=R * 0.6, tau=tau * 0.7)
        b.add(ell_between(el + v3(0, Dc * 0.04, 0.0), lerp(el, kn, 0.6), R * 1.15, R * 1.35), 'fl%s1' % s, k=R * 0.6, tau=tau * 0.7)   # the forearm's muscle
        b.add(RoundCone(kn, fe, C * 1.05, C * 0.95), 'fl%s2' % s, k=C * 0.6, tau=tau * 0.5)
        # the thigh (the haunch's muscle down to the stifle), the gaskin, the hind cannon
        b.add(ell_between(hp + v3(0, Dh * 0.3, -L * 0.08), st + v3(0, Dc * 0.04, -L * 0.05), Wd * 0.24 * p['haunch'], max(R * 2.5, Dh * 0.36) * p['haunch']), 'hl%s0' % s, k=Dc * 0.22, tau=tau)
        b.add(ell_between(st + v3(0, Dc * 0.02, -L * 0.03), lerp(st, hk, 0.55), R * 1.25, R * 1.7), 'hl%s1' % s, k=R * 0.8, tau=tau * 0.7)   # the gaskin
        b.add(RoundCone(st, hk, R * 1.15, C * 1.0), 'hl%s1' % s, k=R * 0.7, tau=tau * 0.7)
        b.add(RoundCone(hk, hf, C * 1.0, C * 0.95), 'hl%s2' % s, k=C * 0.5, tau=tau * 0.5)
        joints(b, p, s, el, kn, fe, st, hk, hf, R, C, tau)
        foot(b, p, s, 'fl', fe, X, C)
        foot(b, p, s, 'hl', hf, X, C)
    # --- the neck: from the front of the withers, forward and up
    a = np.radians(p['neckA']); nd = v3(0, np.sin(a), np.cos(a)); nL = p['neckL'] * H
    n0 = b.j('neck0', (0, H - Dc * 0.3, L * 0.38))
    if p['neckS']:  # (in an S: forward and down from the withers, then up in a curve to the head held high)
        sa = lambda deg: v3(0, np.sin(np.radians(deg)), np.cos(np.radians(deg)))
        n1 = b.j('neck1', n0 + sa(p['neckA'] - 34 * p['neckS']) * nL * 0.38); n2 = b.j('neck2', n1 + sa(p['neckA'] + 12 * p['neckS']) * nL * 0.33)
        poll = b.j('head', n2 + sa(p['neckA'] + 62 * p['neckS']) * nL * 0.31)
    else:
        n1 = b.j('neck1', n0 + nd * nL * 0.36 + v3(0, nL * p['neckUp'] * 0.05, 0))
        n2 = b.j('neck2', n0 + nd * nL * 0.7 + v3(0, nL * p['neckUp'] * 0.08, 0)); poll = b.j('head', n0 + nd * nL)
    r0 = p['neckR0'] * Dc * NECK; r1 = p['neckR1'] * Dc * NECK  # (neckR: the neck's depth over the chest's, at its base and at the head)
    fl = ((1, 0, 0), p['neckFlat'])
    b.add(RoundCone(n0 - nd * r0 * 0.4 + v3(0, -r0 * 0.15, 0), n1, r0, lerp(r0, r1, 0.45), flat=fl), 'neck0', k=r0 * 0.6, tau=tau)
    b.add(RoundCone(n1, n2, lerp(r0, r1, 0.45), lerp(r0, r1, 0.8), flat=fl), 'neck1', k=r1 * 0.5, tau=tau)
    b.add(RoundCone(n2, poll, lerp(r0, r1, 0.8), r1, flat=fl), 'neck2', k=r1 * 0.5, tau=tau)
    if p['ruff']:  # (a collar of long fur round the neck, down the throat: the wolf's)
        b.add(ell_between(n0 + v3(0, -r0 * 0.15, -r0 * 0.35), lerp(n1, n2, 0.55), r0 * (1.0 + 0.45 * p['ruff']), r0 * (1.05 + 0.55 * p['ruff'])), 'neck0', k=r0 * 0.5, tau=tau)
    if p['crest']:  # (a crest along the neck's top: the stallion's, the bull's)
        b.add(ell_between(n0 + v3(0, r0 * 0.7, 0), poll + v3(0, r1 * 0.6, 0), r1 * 0.55, r0 * p['crest']), 'neck1', k=r1 * 0.6, tau=tau)
    head(b, p, poll, Dc)
    tail(b, p, Hc, Dh, L)
    ground(b)
    b.meta['family'] = 'quad'; b.meta['flex'] = bool(p['flex'])
    b.meta['rump'] = round(float(Dh * 0.58), 4); b.meta['foot'] = p['foot']; b.meta.setdefault('tailR', 0.0)  # (for the 3D: how low the rump sits, what the feet are)
    return b


def ground(b):
    """The sole: nothing of the body under the ground — a paw, a pillar's foot, a pastern rest flat on it (they sank into it,
    the elephant's 0.2 m: the round ends of the clay reach below the joints they are drawn from)."""
    pr = Plane((0, 0, 0), (0, -1, 0), ((-9, -1, -9), (9, 0.0, 9))); pr.set('i', 0.0, None, b.H * 0.04); b.P.append(pr)


def joints(b, p, s, el, kn, fe, st, hk, hf, R, C, tau):
    """The joints that show under the skin and make a leg read as a leg: the point of the elbow behind the forearm, the knee
    (the carpus) a little broader than the cannon below it, the point of the hock sticking back (the hamstring's lever), the
    fetlock's knob above the hoof; the stifle's round in front of the thigh. A pillar's legs show none but the knee."""
    f = 'fl%s' % s; h = 'hl%s' % s
    if p['pillar']:
        b.add(Ellipsoid(kn + v3(0, 0, C * 0.1), (C * 1.12, C * 1.05, C * 1.15)), f + '2', k=C * 0.5, tau=tau * 0.5)
        return
    hoofed = p['foot'] in ('hoof', 'cloven', 'pad')
    b.add(Ellipsoid(el + v3(0, -R * 0.15, -R * 0.75), (R * 0.85, R * 1.0, R * 0.8)), f + '1', k=R * 0.5, tau=tau * 0.6)              # the elbow's point
    if not p['plantF']:
        b.add(Ellipsoid(kn + v3(0, C * 0.1, C * 0.12), (C * 1.22, C * 1.25, C * 1.22)), f + '2', k=C * 0.55, tau=tau * 0.5)        # the knee
    if not p['plant']:
        b.add(Ellipsoid(hk + v3(0, C * 0.55, -C * 0.85), (C * 0.8, C * 1.5, C * 0.75)), h + '2', k=C * 0.55, tau=tau * 0.5)       # the point of the hock
        b.add(ell_between(hk + v3(0, C * 0.8, -C * 0.7), lerp(st, hk, 0.35) + v3(0, 0, -R * 0.6), C * 0.55, C * 0.6), h + '1', k=C * 0.6, tau=tau * 0.6)  # the hamstring
    if hoofed:
        for q, bn in ((fe, f + '3'), (hf, h + '3')):
            b.add(Ellipsoid(q + v3(0, C * 0.15, -C * 0.25), (C * 1.12, C * 1.05, C * 1.2)), bn, k=C * 0.45, tau=tau * 0.45)        # the fetlock
    b.add(Ellipsoid(st + v3(0, R * 0.2, R * 0.55), (R * 0.95, R * 1.0, R * 0.8)), h + '0', k=R * 0.7, tau=tau * 0.7)                # the stifle


def foot(b, p, s, leg, fe, X, C):
    """The end of a leg: a hoof (whole or cloven) as its own piece, a paw of the coat, a pillar's round foot with nails."""
    bone = '%s%s3' % (leg, s); H = b.H
    f = p['foot']
    if f in ('hoof', 'cloven'):
        top = fe + v3(0, -H * 0.012, 0); bot = v3(fe[0], 0.0, fe[2] + C * 0.35)
        b.add(RoundCone(fe, top + v3(0, -H * 0.02, C * 0.2), C * 1.0, C * 1.08), bone, k=C * 0.4)                                # the pastern
        hb = v3(bot[0], C * 0.55, bot[2]); ht = v3(fe[0], H * 0.04, fe[2] + C * 0.15)
        prims = [(K(RoundCone(ht, hb, C * 1.05, C * 1.3), 0), bone), ((Plane((0, 0.0, 0), (0, -1, 0), ((-9, -1, -9), (9, 0.002, 9))), 'i'), bone)]
        if f == 'cloven': prims.append(((RBox((fe[0], C * 0.6, fe[2] + C * 1.3), (C * 0.12, C * 1.0, C * 1.0), 0.0), 's'), bone))
        b.piece('casco' + leg + s, 'casco', prims, 12, far=6)
    elif f == 'pad':  # (the camel's broad soft foot)
        b.add(Ellipsoid((fe[0], C * 0.7, fe[2] + C * 0.5), (C * 1.7, C * 0.75, C * 2.0)), bone, k=C * 0.8)
        b.add(RoundCone(fe, (fe[0], C * 0.9, fe[2] + C * 0.3), C * 0.95, C * 1.1), bone, k=C * 0.5)
    elif f == 'pillar':
        b.add(RoundCone(fe + v3(0, H * 0.06, 0), (fe[0], H * 0.03, fe[2] + C * 0.1), C * 1.05, C * 1.22), bone, k=C * 0.4)
        prims = []
        for k in range(4):
            a = (k - 1.5) * 0.42; c = v3(fe[0] + np.sin(a) * C * 1.12 * (1 if s == 'L' else -1) * 0, H * 0.025, fe[2] + C * 0.1) + v3(np.sin(a) * C * 1.12, 0, np.cos(a) * C * 1.12)
            prims.append((Ellipsoid(c, (C * 0.28, H * 0.025, C * 0.2)), bone))
        b.piece('unha' + leg + s, 'unha', prims, 24, far=0)
    else:  # a paw: the toes forward, the pads under them (painted), claws for the clawed
        big = 1.0 if f == 'paw' else 1.05
        b.add(Ellipsoid((fe[0], C * 0.85, fe[2] + C * 0.9), (C * 1.15 * big, C * 0.85, C * 1.5 * big)), bone, k=C * 0.8)
        for dx in (-0.62, -0.2, 0.2, 0.62):  # (the toes: four knuckles round the front of the paw)
            b.add(Ellipsoid((fe[0] + dx * C * big, C * 0.5, fe[2] + C * 2.0 * big - abs(dx) * C * 0.5), (C * 0.36, C * 0.45, C * 0.45)), bone, k=C * 0.25)
        if f == 'bearpaw':
            b.add(Ellipsoid((fe[0], C * 0.7, fe[2] - C * 0.2), (C * 1.0, C * 0.7, C * 1.6)), bone, k=C * 0.6)
        if p.get('claws'):
            prims = [(RoundCone((fe[0] + dx * C, C * 0.9, fe[2] + C * 2.1), (fe[0] + dx * C * 1.1, C * 0.15, fe[2] + C * 2.9), C * 0.16, C * 0.05), bone) for dx in (-0.6, -0.2, 0.2, 0.6)]
            b.piece('unha' + leg + s, 'unha', prims, 32, far=0, h=C * p.get('clawH', 0.2))  # (a coarse step: four small cones on a fine one would not come down to 32)


def head(b, p, poll, Dc):
    """The head at the poll: the skull, the face down to the muzzle, the cheeks, the jaw, the ears, the eyes."""
    H = b.H; hL = p['headL'] * H; hH = p['headH'] * hL; hW = p['headW'] * hL
    a = np.radians(p['headA']); d = v3(0, -np.sin(a), np.cos(a)); up = v3(0, np.cos(a), np.sin(a))
    tau = max(0.01, H * 0.035)
    sk = poll + d * hL * 0.2 + up * hH * 0.05
    face = p['face']
    if face in ('felid', 'canid', 'bear', 'primate', 'hippo'):
        mz, mr, ec = head_hunter(b, p, poll, sk, d, up, hL, hH, hW, tau)
        return head_rest(b, p, sk, d, up, hL, hH, hW, tau, mr, ec)
    b.add(Ellipsoid(sk, (hW * 0.5, hH * 0.5, hL * 0.26), orient(sk - d, sk + d, up)), 'head', k=hH * 0.3, tau=tau)                 # the skull
    if p['stop']: b.add(Ellipsoid(sk + up * hH * 0.2 + d * hL * 0.16, (hW * 0.3, hH * 0.32 * p['stop'], hL * 0.16)), 'head', k=hH * 0.25, tau=tau)
    if p['forehead']: b.add(Ellipsoid(sk + up * hH * 0.25 + d * hL * 0.05, (hW * 0.4, hH * 0.3 * p['forehead'], hL * 0.2)), 'head', k=hH * 0.3, tau=tau)
    mz = poll + d * hL * (p['muzPos'] - p['muzDrop'] * 0.05) - up * hH * (0.08 + p['muzDrop'] * 0.2)
    mr = p['muzR'] * hH
    b.add(RoundCone(sk + d * hL * 0.06, mz - d * mr * 0.3, hH * 0.42, mr * 0.95, flat=((1, 0, 0), 0.92 * p['muzFlat'])), 'head', k=hH * 0.25, tau=tau)   # the face
    b.add(Ellipsoid(mz, (mr * 1.05 * p['muzFlat'], mr * 0.95, mr * 1.05 * (1 + p['snout'])), orient(mz - d, mz + d, up)), 'head', k=mr * 0.6, tau=tau)   # the muzzle
    if p['snout']:  # (a pig's disc)
        sn = mz + d * mr * (0.9 + p['snout'] * 0.6)
        b.add(RoundCone(mz, sn, mr * 0.9, mr * 0.78), 'head', k=mr * 0.3, tau=tau)
        b.meta['nose'] = list(sn + d * mr * 0.7)
    else: b.meta['nose'] = list(mz + d * mr * 0.95)
    # the cheeks (the jowls of a grazer) and the jaw under them
    jw = 'jaw' if p['jaw'] else 'head'
    jc = poll + d * hL * 0.35 - up * hH * 0.28
    b.j('jaw', poll + d * hL * 0.12 - up * hH * 0.15)
    for sd in (1, -1):
        b.add(Ellipsoid(jc + v3(sd * hW * 0.18, 0, 0), (hW * 0.28 * p['cheek'], hH * 0.33 * p['cheek'], hL * 0.22)), jw if p['jaw'] else 'head', k=hH * 0.3, tau=tau)
    b.add(RoundCone(jc - d * hL * 0.05, mz - up * mr * 0.55 - d * mr * 0.2, hH * 0.22, mr * 0.55), jw, k=hH * 0.2, tau=tau)        # the lower jaw
    ec = sk + d * hL * 0.1 + up * hH * 0.12 + v3(hW * 0.43, 0, 0)
    head_rest(b, p, sk, d, up, hL, hH, hW, tau, mr, ec)


def head_hunter(b, p, poll, sk, d, up, hL, hH, hW, tau):
    """The head of a hunter or a monkey — the cats', the dogs', the bears', the monkeys': a round braincase and the face built on
    its front: a cat's short muzzle (the bridge of the nose, two whisker pads, the nose's leather, the chin) under big eyes set
    to the front; a dog's long one (a rounded box after the stop, the lower jaw under it, the nose's leather at its end); a
    monkey's flat face with its brow ridge and small muzzle."""
    face = p['face']; X = v3(1, 0, 0); jw = 'jaw' if p['jaw'] else 'head'
    O = lambda c: orient(c - d, c + d, up)
    mz = poll + d * hL * p['muzPos'] - up * hH * (0.1 + p['muzDrop'] * 0.2); mr = p['muzR'] * hH
    b.j('jaw', poll + d * hL * 0.12 - up * hH * 0.15)
    if face == 'hippo':
        # (the hippo's: a muzzle broader than the skull and flat at its end, the jowls under it; the eyes, the ears and the
        # nostrils up on top, where they stay out of the water)
        b.add(Ellipsoid(sk, (hW * 0.44, hL * 0.3, hH * 0.44), O(sk)), 'head', k=hH * 0.2, tau=tau)                                  # the skull
        a0 = sk + d * hL * 0.16 - up * hH * 0.06; a1 = mz + d * mr * 0.4; mc = (a0 + a1) / 2; ml = np.linalg.norm(a1 - a0) / 2; rr = hH * 0.17
        b.add(RBox(mc, (hW * 0.5 - rr, ml - rr, hH * 0.3 - rr), rr, O(mc)), 'head', k=hH * 0.15, tau=tau)                           # the muzzle
        jc = mc - up * hH * 0.26 - d * ml * 0.1
        b.add(RBox(jc, (hW * 0.44 - rr, ml * 0.85 - rr, hH * 0.2 - rr), rr, O(jc)), jw, k=hH * 0.15, tau=tau)                       # the jowls
        for sd in (1, -1):
            b.add(Sphere(sk + up * hH * 0.4 + X * sd * hW * 0.3 + d * hL * 0.02, p['eyeR'] * b.H * 1.9), 'head', k=hH * 0.08, tau=tau)  # the eyes' turrets
            b.add(Sphere(a1 + up * hH * 0.27 + X * sd * hW * 0.2 - d * rr * 0.4, hH * 0.075), 'head', k=hH * 0.05, tau=tau)            # the nostrils' knobs
        ec = sk + up * hH * 0.46 + X * hW * 0.33 + d * hL * 0.04
        nose = a1 + up * hH * 0.3 - d * rr * 0.3
    elif face == 'primate':
        b.add(Ellipsoid(sk, (hW * 0.5, hL * 0.4, hH * 0.5), O(sk)), 'head', k=hH * 0.2, tau=tau)                                    # the braincase
        fc = sk + d * hL * 0.24 - up * hH * 0.1
        b.add(Ellipsoid(fc, (hW * 0.38, hL * 0.17, hH * 0.38), O(fc)), 'head', k=hH * 0.12, tau=tau)                                # the face
        b.add(Ellipsoid(fc + up * hH * 0.2 + d * hL * 0.09, (hW * 0.36, hL * 0.07, hH * 0.075), O(fc)), 'head', k=hH * 0.06, tau=tau)  # the brow ridge
        mz = fc + d * hL * 0.17 - up * hH * 0.17
        b.add(Ellipsoid(mz, (mr * 0.8, mr * 0.7, mr * 0.62), O(mz)), 'head', k=mr * 0.3, tau=tau)                                   # the muzzle
        b.add(Ellipsoid(mz - up * mr * 0.55 - d * mr * 0.12, (mr * 0.6, mr * 0.5, mr * 0.42), O(mz)), jw, k=mr * 0.3, tau=tau)      # the chin
        ec = fc + d * hL * 0.14 + up * hH * 0.08 + X * hW * 0.15
        nose = mz + d * mr * 0.66 + up * mr * 0.12
    elif face == 'felid':
        b.add(Ellipsoid(sk, (hW * 0.5, hL * 0.32, hH * 0.5), O(sk)), 'head', k=hH * 0.25, tau=tau)                                  # the braincase
        for sd in (1, -1):
            c = sk + d * hL * 0.1 - up * hH * 0.2 + X * sd * hW * 0.26
            b.add(Ellipsoid(c, (hW * 0.27 * p['cheek'], hL * 0.22, hH * 0.3 * p['cheek']), O(c)), 'head', k=hH * 0.25, tau=tau)  # the cheeks
        b.add(RoundCone(sk + d * hL * 0.18 + up * hH * 0.14, mz + up * mr * 0.35, hH * 0.24, mr * 0.45, flat=((1, 0, 0), 0.9)), 'head', k=hH * 0.15, tau=tau)  # the bridge
        for sd in (1, -1): b.add(Ellipsoid(mz + X * sd * mr * 0.42 - up * mr * 0.12, (mr * 0.56, mr * 0.55, mr * 0.5), O(mz)), 'head', k=mr * 0.3, tau=tau)  # whisker pads
        b.add(Ellipsoid(mz - up * mr * 0.62 - d * mr * 0.1, (mr * 0.42, mr * 0.38, mr * 0.3), O(mz)), jw, k=mr * 0.25, tau=tau)     # the chin
        nose = mz + d * mr * 0.5 + up * mr * 0.3
        b.add(Ellipsoid(nose - d * mr * 0.12, (mr * 0.3, mr * 0.18, mr * 0.2), O(nose)), 'head', k=mr * 0.1, tau=tau)              # the leather
        ec = sk + d * hL * (0.2 + p['eyeFwd'] * 0.06) + up * hH * 0.12 + X * hW * 0.29
    else:  # the dogs, the wolf, the foxes, the hyena, the bears
        b.add(Ellipsoid(sk, (hW * 0.48, hL * 0.3, hH * 0.48), O(sk)), 'head', k=hH * 0.25, tau=tau)                                 # the braincase
        st = sk + d * hL * 0.22 + up * hH * 0.06
        b.add(Ellipsoid(st, (hW * 0.28, hL * 0.13, hH * 0.26 * max(p['stop'], 0.3)), O(st)), 'head', k=hH * 0.2, tau=tau)         # the stop, the brow
        for sd in (1, -1):
            c = sk + d * hL * 0.1 - up * hH * 0.22 + X * sd * hW * 0.22
            b.add(Ellipsoid(c, (hW * 0.24 * p['cheek'], hL * 0.2, hH * 0.26 * p['cheek']), O(c)), 'head', k=hH * 0.25, tau=tau)   # the cheeks
        a0 = sk + d * hL * 0.24 - up * hH * 0.1; a1 = mz + d * mr * 0.55; mc = (a0 + a1) / 2; ml = np.linalg.norm(a1 - a0) / 2; rr = mr * 0.42
        b.add(RBox(mc, (mr * 0.78 * p['muzFlat'] - rr, ml - rr, mr * 0.62 - rr), rr, O(mc)), 'head', k=mr * 0.45, tau=tau)        # the muzzle
        b.add(RoundCone(sk + d * hL * 0.12 - up * hH * 0.3, a1 - up * mr * 0.62 - d * mr * 0.35, hH * 0.2, mr * 0.42, flat=((1, 0, 0), 0.85)), jw, k=hH * 0.15, tau=tau)  # the lower jaw
        nose = a1 + up * mr * 0.16
        b.add(Ellipsoid(nose - d * mr * 0.16, (mr * 0.45, mr * 0.25, mr * 0.3), O(nose)), 'head', k=mr * 0.15, tau=tau)            # the leather
        ec = sk + d * hL * (0.2 + p['eyeFwd'] * 0.05) + up * hH * 0.16 + X * hW * (0.36 - p['eyeFwd'] * 0.04)
    b.meta['nose'] = list(nose)
    return mz, mr, ec


def head_rest(b, p, sk, d, up, hL, hH, hW, tau, mr, ec):
    """What every head has after its face: the nostrils, the eyes (under a brow, for some), the ears."""
    H = b.H; face = p['face']
    nose = np.array(b.meta['nose'])
    ns = {'felid': 0.14, 'canid': 0.24, 'bear': 0.26, 'primate': 0.2, 'hippo': 0.0}.get(face, 0.38); nr = {'felid': 0.08, 'primate': 0.1}.get(face, 0.16)
    if face == 'hippo': ns = b.meta['p']['headW'] * b.meta['p']['headL'] * b.H * 0.2 / max(mr, 1e-4)
    for sd in (1, -1):
        b.cut(Sphere(nose + v3(sd * mr * ns, mr * 0.08, -mr * 0.05), mr * nr), k=mr * nr * 0.5)
    er = p['eyeR'] * H
    if p['brow']:
        for sd in (1, -1): b.add(Ellipsoid(ec * v3(sd, 1, 1) + up * er * 1.1 - d * er * 0.2, (er * 1.4, er * 0.7 * p['brow'], er * 1.6)), 'head', k=er, tau=tau)
    fw = min(0.85, p['eyeFwd'] * 0.75)  # (the eye sunk into the head along its own face: sideways for the grazers, forward for the hunters)
    eyes(b, ec - (v3(1, 0, 0) * (1 - fw) + d * fw) * er * 0.35, er)
    b.meta['eye'] = list(ec)
    # the ears: from the skull's top, up and out and back; cupped in front; folded down for a drooping ear
    eL = p['earL'] * H; eW = p['earW'] * H; eT = max(p['earT'] * H, 0.004)
    for sd, s in ((1, 'L'), (-1, 'R')):
        base = sk + up * hH * 0.42 - d * hL * 0.08 + v3(sd * hW * 0.3, 0, 0)
        e1, e2 = np.radians(p['earA'][0]), np.radians(p['earA'][1])  # (out from the vertical, back from it)
        ed = nrm(v3(sd * np.sin(e1), np.cos(e1) * np.cos(e2) - p['earFold'], -np.sin(e2)) + up * 0.0)
        ej = b.j('ear%s' % s, base)
        c = base + ed * eL * 0.5
        R = frame_from(ed, d if p['earFace'] == 'fwd' else v3(sd, 0, 0.35))
        tip = p['earTip']
        if eL - eW * tip - eW * 0.3 < (1 - tip) * eW * 1.15: tip = 1.0  # (too short an ear for a leaf: a round one)
        if tip >= 0.95:  # (a round ear: the bear's, the monkey's, the elephant's)
            b.add(Ellipsoid(c, (eW, eL * 0.52, eT * 1.6), R), 'ear%s' % s, k=eT * 1.5, tau=max(0.006, eL * 0.25))
            if p['earCup'] and p['earFace'] == 'fwd': b.cut(Ellipsoid(c + R[:, 2] * eT * 1.2 + ed * eL * 0.05, (eW * 0.72, eL * 0.42, eT * 1.1), R), k=eT * 0.4)
        else:  # (a leaf: broad at its root, narrowing to the tip — pointed for the cats and the foxes, rounder for the hare)
            n = R[:, 2]; fl = (n, float(np.clip(eT * 1.6 / eW, 0.05, 1.0)))
            b.add(RoundCone(base + ed * eW * 0.3, base + ed * (eL - eW * tip), eW, eW * tip, flat=fl), 'ear%s' % s, k=eT * 1.5, tau=max(0.006, eL * 0.25))
            if p['earCup'] and p['earFace'] == 'fwd':
                if eL * 0.9 - eW * tip - eW * 0.7 > (0.7 - 0.55 * tip) * eW * 1.15:
                    b.cut(RoundCone(base + ed * eW * 0.7 + n * eT * 1.3, base + ed * (eL * 0.9 - eW * tip) + n * eT * 1.3, eW * 0.7, eW * tip * 0.55, flat=fl), k=eT * 0.4)
                else: b.cut(Ellipsoid(c + n * eT * 1.2 + ed * eL * 0.05, (eW * 0.62, eL * 0.4, eT * 1.1), R), k=eT * 0.4)  # (a short ear's cup)
        b.meta.setdefault('ears', []).append([list(base), list(base + ed * eL)])


def tail(b, p, Hc, Dh, L):
    """The tail from the croup: hanging (the hoofed), a tuft at its end, bushy (the dogs), long and curved (the cats), flat
    (the beaver), a puff (the rabbit), curled (the pig), short."""
    t = p['tail']; H = b.H
    if not t: return
    tl = p['tailL'] * H; tr = p['tailR'] * H
    t0 = b.j('tail0', (0, Hc - Dh * 0.12, -L * 0.52))
    if t in ('hang', 'tuft', 'thin'): dirs = [(0, -0.35, -1), (0, -1.6, -0.6), (0, -1, -0.2), (0, -1, -0.12)]
    elif t == 'bushy': dirs = [(0, -0.5, -1), (0, -0.9, -1), (0, -0.7, -1), (0, -0.4, -1)]
    elif t == 'long': dirs = [(0, -0.45, -1), (0, -1.2, -0.6), (0, -1.0, -0.25), (0, -0.3, -0.5)]
    elif t == 'up': dirs = [(0, 0.8, -1), (0, 1.2, -0.4), (0, 0.6, 0.4), (0, -0.2, 0.6)]
    elif t == 'curl': dirs = [(0, 0.3, -1), (0, 1.0, -0.2), (0, 0.2, 0.8), (0, -0.8, 0.2)]
    elif t == 'flat': dirs = [(0, -0.5, -1), (0, -0.25, -1), (0, -0.1, -1), (0, -0.05, -1)]
    elif t in ('puff', 'short', 'flag'): dirs = [(0, 0.3, -1), (0, 0.2, -1), (0, 0, -1), (0, 0, -1)]
    elif t == 'croc': dirs = [(0, -0.12, -1), (0, -0.08, -1), (0, -0.04, -1), (0, -0.02, -1)]
    else: dirs = [(0, -0.5, -1)] * 4
    seg = [0.3, 0.27, 0.23, 0.2]
    pts = [t0]
    for k in range(4): pts.append(pts[-1] + nrm(dirs[k]) * tl * seg[k])
    for k in range(1, 4): b.j('tail%d' % k, pts[k])
    if t in ('puff', 'short', 'flag'):
        c = t0 + nrm(dirs[0]) * tl * 0.3
        b.add(Ellipsoid(c, (tr * 1.1, tr * 1.3, tl * 0.42)), 'tail3', k=tr * 1.2)
        b.meta['tailR'] = round(float(tr * 1.3), 4)
        return
    radii = {'hang': [1, 0.8, 0.6, 0.45, 0.4], 'tuft': [1, 0.7, 0.5, 0.4, 0.35], 'thin': [1, 0.75, 0.55, 0.45, 0.35], 'bushy': [1.0, 1.6, 1.9, 1.7, 0.8],
             'long': [1, 0.85, 0.75, 0.7, 0.6], 'up': [1, 0.85, 0.7, 0.6, 0.5], 'curl': [1, 0.8, 0.6, 0.5, 0.4], 'flat': [0.9, 1.0, 1.0, 1.0, 0.8], 'croc': [1, 0.72, 0.5, 0.3, 0.12]}[t]
    b.meta['tailR'] = round(float(tr * max(radii) * (2.2 if t == 'flat' else 1.0)), 4)
    for k in range(4):
        a, c = pts[k], pts[k + 1]
        if t == 'flat':
            b.add(Ellipsoid((a + c) / 2, (tr * 2.2, tr * 0.45, np.linalg.norm(c - a) * 0.62)), 'tail%d' % k, k=tr * 0.3)
        else:
            b.add(RoundCone(a, c, tr * radii[k], tr * radii[k + 1]), 'tail%d' % k, k=tr * (0.8 if k == 0 else 0.3))
    if t == 'tuft':
        c = pts[4] + nrm(dirs[3]) * tl * 0.12
        b.piece('tufo', 'crina', [(RoundCone(lerp(pts[3], pts[4], 0.5), c, tr * 1.2, tr * 1.8), 'tail3')], 60, far=14)
    if t == 'hang' and p['tailHair']:
        # (the horse's tail: hair falling from the dock, full and long, a little spread at its end — in two locks for the bones)
        hl = p['tailHair'] * H; a0 = pts[1]; m = a0 + v3(0, -hl * 0.45, -hl * 0.12); e = a0 + v3(0, -hl, -hl * 0.06)
        b.piece('cauda', 'crina', [(K(ell_between(a0 + v3(0, tr, 0), m, tr * 2.0, tr * 2.6), 0), 'tail1'), (K(RoundCone(m, e, tr * 2.7, tr * 1.9, flat=((1, 0, 0), 0.75)), tr), 'tail3')], 110, far=24)


# ------------------------------ the birds ------------------------------
BDEF = dict(bodyL=0.42, bw=0.11, bh=0.12, legH=0.25, legR=0.012, neckL=0.12, neckR=0.035, neckS=0.0, neckA=70, headR=0.045,
            beak='cone', beakL=0.04, beakR=0.012, tailL=0.14, tailW=0.08, span=0.6, chord=0.16, fingers=0, wingFold=1.0,
            upright=False, toes=3, comb=0.0, wattle=0.0, crest=0.0, ruff=0.0, flipper=False, legThick=1.0, eyeR=0.009, disc=0.0, plumes=0.0,
            brow=0.0, trousers=0.0)


def tilt_bird(b, a, P, only=None):
    """Turn what is built of a bird so far (its body, neck, head, tail, wings) up by a about the point P, about X — an eagle,
    an owl, a parrot sit upright on their perch. only: just what hangs from these bones (the head, its beak, its eyes)."""
    Rm = rot_x(-a)
    T = lambda q: P + Rm @ (np.asarray(q, float) - P)
    if only:
        for pr in b.P:
            if pr.bone in only: tp1(pr, T, Rm)
        for pc in b.pieces:
            if all(pr.bone in only for pr in pc['P']) or 'eye' in pc:
                for pr in pc['P']: tp1(pr, T, Rm)
                if 'eye' in pc: pc['eye'] = (T(pc['eye'][0]), pc['eye'][1])
        for k in ('nose', 'eye'):
            if k in b.meta: b.meta[k] = list(T(b.meta[k]))
        for k in only:
            if k in b.J: b.J[k] = T(b.J[k])
        return
    def tp(pr):
        if hasattr(pr, 'a') and hasattr(pr, 'ra'):
            pr.a = T(pr.a); pr.b = T(pr.b)
            if pr.flat is not None: pr.flat = (Rm @ np.asarray(pr.flat[0], float), pr.flat[1])
        elif hasattr(pr, 'c'):
            pr.c = T(pr.c)
            if hasattr(pr, 'R'): pr.R = Rm if pr.R is None else Rm @ pr.R
    for pr in b.P: tp(pr)
    for pc in b.pieces:
        for pr in pc['P']: tp(pr)
        if 'eye' in pc: pc['eye'] = (T(pc['eye'][0]), pc['eye'][1])
        if 'wing' in pc: pc['wing'] = (list(T(pc['wing'][0])), pc['wing'][1])
    for k in list(b.J): b.J[k] = T(b.J[k])
    for k in ('nose', 'eye'):
        if k in b.meta: b.meta[k] = list(T(b.meta[k]))


def tp1(pr, T, Rm):
    if hasattr(pr, 'a') and hasattr(pr, 'ra'):
        pr.a = T(pr.a); pr.b = T(pr.b)
        if pr.flat is not None: pr.flat = (Rm @ np.asarray(pr.flat[0], float), pr.flat[1])
    elif hasattr(pr, 'c'):
        pr.c = T(pr.c)
        if hasattr(pr, 'R'): pr.R = Rm if pr.R is None else Rm @ pr.R


def bird(b, fly=False, **kw):
    """A bird: the body, the neck (straight or in an S), the head and its beak, the tail's fan, the legs (thigh hidden, the
    drumstick, the scaly shank, the toes), the wings — folded along the sides, or (fly) spread wide with the primaries out
    as fingers. Measures in metres."""
    p = dict(BDEF); p.update(kw); b.meta['p'] = p; H = b.H
    bL = p['bodyL']; bw, bh = p['bw'], p['bh']; legH = p['legH']
    up = p['upright']
    if up:  # the penguin: standing upright, the body a spindle
        zc = 0.0; yb = legH + bh * 1.0
        root = b.j('root', (0, legH + bh * 0.35, -bw * 0.1)); spine = b.j('spine', (0, yb, 0)); chest = b.j('chest', (0, yb + bh * 0.55, 0.0))
        b.add(Ellipsoid((0, yb, 0), (bw, bh * 1.05, bw * 0.95)), 'spine', k=bh * 0.1)
        b.add(Ellipsoid((0, yb + bh * 0.5, bw * 0.05), (bw * 0.8, bh * 0.7, bw * 0.78)), 'chest', k=bh * 0.3)
        b.add(Ellipsoid((0, legH + bh * 0.3, 0), (bw * 0.85, bh * 0.45, bw * 0.85)), 'root', k=bh * 0.3)
        n0 = b.j('neck0', (0, yb + bh * 0.95, 0.0)); n1 = b.j('neck1', n0 + v3(0, p['neckL'] * 0.4, 0)); n2 = b.j('neck2', n0 + v3(0, p['neckL'] * 0.75, 0.0))
        hd = b.j('head', n0 + v3(0, p['neckL'], 0.0))
        b.add(RoundCone(n0, hd, p['neckR'] * 1.2, p['neckR']), 'neck1', k=p['neckR'] * 0.6)
        tail0 = b.j('tail0', (0, legH + bh * 0.15, -bw * 0.8))
    else:
        zc = 0.0; yb = legH + bh
        root = b.j('root', (0, yb - bh * 0.1, -bL * 0.18)); spine = b.j('spine', (0, yb, 0.0)); chest = b.j('chest', (0, yb + bh * 0.1, bL * 0.2))
        b.add(Ellipsoid((0, yb, 0), (bw, bh, bL * 0.5), rot_x(-0.12)), 'spine', k=bh * 0.2)
        b.add(Ellipsoid((0, yb + bh * 0.05, bL * 0.22), (bw * 0.92, bh * 0.92, bL * 0.3)), 'chest', k=bh * 0.4)          # the breast
        b.add(Ellipsoid((0, yb - bh * 0.05, -bL * 0.25), (bw * 0.8, bh * 0.78, bL * 0.3)), 'root', k=bh * 0.4)
        # the neck: from the breast's top, up (and forward), straight or in an S
        a = np.radians(p['neckA']); nd = v3(0, np.sin(a), np.cos(a)); nL = p['neckL']
        n0 = b.j('neck0', (0, yb + bh * 0.55, bL * 0.36))
        s = p['neckS']
        n1 = b.j('neck1', n0 + nd * nL * 0.36 + v3(0, 0, -s * nL * 0.25)); n2 = b.j('neck2', n0 + nd * nL * 0.7 + v3(0, 0, s * nL * 0.12))
        hd = b.j('head', n0 + nd * nL + v3(0, 0, s * nL * 0.05))
        r = p['neckR']
        b.add(RoundCone(n0 - nd * r * 0.5, n1, r * 1.35, r * 1.1), 'neck0', k=r * 0.8)
        b.add(RoundCone(n1, n2, r * 1.1, r), 'neck1', k=r * 0.4); b.add(RoundCone(n2, hd, r, r * 0.95), 'neck2', k=r * 0.4)
        tail0 = b.j('tail0', (0, yb + bh * 0.15, -bL * 0.45))
    # the head and the beak
    hr = p['headR']; hc = hd + v3(0, hr * 0.3, hr * 0.2)
    b.add(Ellipsoid(hc, (hr * 0.92, hr, hr * 1.1)), 'head', k=hr * 0.4)
    if p['disc']:  # (the owl's face: a flat disc of feathers, a dish round each eye, the eyes to the front)
        b.add(Ellipsoid(hc + v3(0, -hr * 0.02, hr * 0.5), (hr * 1.18, hr * 1.08, hr * 0.42)), 'head', k=hr * 0.25)
        for sd in (1, -1): b.cut(Sphere(hc + v3(sd * hr * 0.43, hr * 0.12, hr * 1.42), hr * 0.62), k=hr * 0.12)
    if p['brow']:  # (a hunter's brow over the eye: the eagle's frown)
        for sd in (1, -1): b.add(Ellipsoid(hc + v3(sd * hr * 0.52, hr * 0.42, hr * 0.42), (hr * 0.34, hr * 0.16, hr * 0.42)), 'head', k=hr * 0.15)
    bk0 = hc + v3(0, -hr * 0.1, hr * 0.85); BL, BR = p['beakL'], p['beakR']; kind = p['beak']
    if kind == 'hook':  # (deep at its root, the tip curled down over the lower bill)
        pts = [bk0, bk0 + v3(0, -BL * 0.02, BL * 0.55), bk0 + v3(0, -BL * 0.22, BL * 0.9), bk0 + v3(0, -BL * 0.58, BL * 0.98)]; rr = [BR, BR * 0.72, BR * 0.38, BR * 0.1]
    elif kind == 'spear':
        pts = [bk0, bk0 + v3(0, -BL * 0.05, BL * 0.5), bk0 + v3(0, -BL * 0.1, BL)]; rr = [BR, BR * 0.55, BR * 0.08]
    elif kind == 'flat':
        pts = [bk0, bk0 + v3(0, -BL * 0.15, BL * 0.55), bk0 + v3(0, -BL * 0.2, BL)]; rr = [BR, BR * 0.8, BR * 0.6]
    elif kind == 'bent':
        pts = [bk0, bk0 + v3(0, -BL * 0.05, BL * 0.5), bk0 + v3(0, -BL * 0.6, BL * 0.75)]; rr = [BR, BR * 0.75, BR * 0.25]
    elif kind == 'toucan':
        pts = [bk0, bk0 + v3(0, -BL * 0.05, BL * 0.55), bk0 + v3(0, -BL * 0.18, BL)]; rr = [BR, BR * 0.75, BR * 0.2]
    else:
        pts = [bk0, bk0 + v3(0, -BL * 0.1, BL * 0.6), bk0 + v3(0, -BL * 0.25, BL)]; rr = [BR, BR * 0.55, BR * 0.12]
    bprim = [(RoundCone(pts[k], pts[k + 1], rr[k], rr[k + 1], flat=((1, 0, 0), 0.8 if kind not in ('flat',) else 1.3)), 'head') for k in range(len(pts) - 1)]
    b.piece('bico', 'bico', bprim, 40 if kind != 'toucan' else 70, far=8, h=max(0.0015, BR * 0.35))
    b.meta['nose'] = list(pts[-1]); b.j('jaw', bk0)
    eyes(b, hc + (v3(hr * 0.42, hr * 0.12, hr * 0.74) if p['disc'] else v3(hr * 0.68, hr * 0.2, hr * 0.42)), p['eyeR'])
    b.meta['eye'] = list(hc)
    if p['comb']:  # (the rooster's comb, the wattles under the beak)
        b.piece('crista', 'crista', [(Ellipsoid(hc + v3(0, hr * 1.05, hr * 0.2), (hr * 0.2, hr * 0.6 * p['comb'], hr * 0.85)), 'head'),
                                     (Ellipsoid(bk0 + v3(0, -hr * 0.6, -hr * 0.1), (hr * 0.25, hr * 0.5 * p['wattle'], hr * 0.3)), 'head')], 50, far=8)
    if p['crest']:
        b.piece('topete', 'pena', [(RoundCone(hc + v3(0, hr * 0.6, -hr * 0.3), hc + v3(0, hr * (0.8 + p['crest']), -hr * (1.2 + p['crest'])), hr * 0.25, hr * 0.06), 'head')], 30, far=0)
    # the tail's fan
    tl = p['tailL']; tw = p['tailW']
    if tl > 0:
        if up: t1 = tail0 + v3(0, -tl * 0.4, -tl * 0.6)
        else: t1 = tail0 + v3(0, -tl * 0.15, -tl)
        b.j('tail1', lerp(tail0, t1, 0.5)); b.j('tail2', t1); b.j('tail3', t1)
        b.piece('cauda', 'pena', [(K(ell_between(tail0, t1, tw, max(0.006, tw * 0.18)), 0), 'tail1')], 40, far=8, h=max(0.002, tw * 0.06))
    # the wings
    sp = p['span'] / 2; ch = p['chord']
    for sd, s in ((1, 'L'), (-1, 'R')):
        if up:  # flippers
            sh = b.j('fl%s0' % s, (sd * bw * 0.85, yb + bh * 0.45, 0)); el = b.j('fl%s1' % s, sh + v3(sd * 0.02, -bh * 0.4, 0)); wr = b.j('fl%s2' % s, sh + v3(sd * 0.04, -bh * 0.8, -0.01)); b.j('fl%s3' % s, sh + v3(sd * 0.05, -bh * 1.1, -0.02))
            # (a flipper: a flat paddle held a little out from the body, broad at its middle, narrowing to the tip)
            b.piece('asa' + s, 'asa', [(K(ell_between(sh + v3(-sd * bw * 0.05, bh * 0.05, 0), sh + v3(sd * bh * 0.32, -bh * 1.08, -bw * 0.12), bw * 0.34, bw * 0.06), 0), 'fl%s1' % s)], 48, far=8, h=0.003)
            continue
        sh = b.j('fl%s0' % s, (sd * bw * 0.7, yb + bh * 0.35, bL * 0.22))
        if not fly:
            # folded: lying along the flank, from the shoulder back over the rump, the tips crossing over the tail
            el = b.j('fl%s1' % s, sh + v3(sd * bw * 0.25, -bh * 0.35, -bL * 0.12)); wr = b.j('fl%s2' % s, sh + v3(sd * bw * 0.28, -bh * 0.2, -bL * 0.42))
            tip = b.j('fl%s3' % s, sh + v3(sd * bw * 0.12, -bh * 0.02, -bL * 0.42 - min(sp * 0.45, bL * 0.42) * p['wingFold']))
            c0 = lerp(sh, wr, 0.5) + v3(sd * bw * 0.1, -bh * 0.1, 0)
            prims = [(K(Ellipsoid(c0, (bw * 0.28, bh * 0.62, bL * 0.36), rot_x(0.12)), 0), 'fl%s1' % s),
                     (K(ell_between(wr + v3(0, bh * 0.05, bL * 0.08), tip, bw * 0.1, bh * 0.42), bh * 0.2), 'fl%s2' % s)]
            b.piece('asa' + s, 'asa', prims, 90, far=14, h=max(0.002, bw * 0.05))
        else:
            # spread: the arm and the hand out to the side, the inner wing broad, the outer narrowing — or fingers
            el = b.j('fl%s1' % s, sh + v3(sd * sp * 0.3, 0.0, -ch * 0.05)); wr = b.j('fl%s2' % s, sh + v3(sd * sp * 0.62, 0.0, 0.0)); tip = b.j('fl%s3' % s, sh + v3(sd * sp * 1.0, 0, -ch * 0.25))
            th = max(0.006, ch * 0.06)
            prims = [(K(Ellipsoid(lerp(sh, el, 0.5) + v3(0, 0, -ch * 0.35), (sp * 0.18, th, ch * 0.52)), 0), 'fl%s0' % s),
                     (K(Ellipsoid(lerp(el, wr, 0.5) + v3(0, 0, -ch * 0.38), (sp * 0.19, th, ch * 0.5)), th * 2), 'fl%s1' % s)]
            if p['fingers']:
                for k in range(p['fingers']):
                    a = -0.25 + k * 0.5 / max(1, p['fingers'] - 1); dirv = nrm(v3(sd * np.cos(a), 0, -np.sin(a) - 0.2))
                    q0 = wr + v3(0, 0, -ch * (0.15 + k * 0.12)); prims.append((K(ell_between(q0, q0 + dirv * sp * 0.42, ch * 0.075, th * 0.8), th), 'fl%s2' % s))
                prims.append((K(Ellipsoid(wr + v3(sd * sp * 0.05, 0, -ch * 0.3), (sp * 0.1, th, ch * 0.42)), th), 'fl%s2' % s))
            else:
                prims.append((K(ell_between(wr + v3(0, 0, -ch * 0.3), tip, ch * 0.42, th), th * 2), 'fl%s2' % s))
            b.piece('asa' + s, 'asa', prims, 150, far=24, h=max(0.0025, th * 0.45))
        b.pieces[-1]['wing'] = (list(sh), sp if fly else sp * 0.8)
    if p.get('tilt') and not up and not fly:
        tilt_bird(b, p['tilt'], v3(0, yb - bh * 0.25, -bL * 0.05))
        tilt_bird(b, -p['tilt'] * 0.8, np.array(b.J['head']), only=('head', 'jaw'))  # (the head kept level on the upright body)
    # the legs
    lr = p['legR']
    for sd, s in ((1, 'L'), (-1, 'R')):
        X = sd * bw * 0.42
        if up:
            hp = b.j('hl%s0' % s, (X, legH + bh * 0.25, 0)); kn = b.j('hl%s1' % s, (X, legH + bh * 0.05, 0.0)); hl = b.j('hl%s2' % s, (X, legH * 0.6, 0.0)); ft = b.j('hl%s3' % s, (X, 0.012, bw * 0.15))
        else:
            tl = 0 if fly else p.get('tilt', 0)
            hp = b.j('hl%s0' % s, (X, yb - bh * 0.25, -bL * 0.02)); kn = b.j('hl%s1' % s, (X * 1.05, yb - bh * (0.7 - 0.35 * tl), bL * 0.08 - bL * 0.1 * tl))
            hl = b.j('hl%s2' % s, (X * 1.05, legH * 0.55, -bL * 0.06)); ft = b.j('hl%s3' % s, (X * 1.05, 0.012, 0.0))
        b.add(RoundCone(kn, hl, lr * 2.4 * p['legThick'], lr * 1.1), 'hl%s1' % s, k=lr * 2)                                          # the drumstick
        if p['trousers']:  # (feathered down to the foot: the eagle's, the owl's)
            b.add(RoundCone(kn + v3(0, 0, -lr), lerp(hl, ft, p['trousers']), lr * 2.9 * p['legThick'], lr * 1.7 * p['legThick']), 'hl%s1' % s, k=lr * 1.5)
        leg = [(RoundCone(hl + v3(0, lr, 0), ft + v3(0, lr * 0.75 * p['legThick'], 0), lr * p['legThick'], lr * 0.9 * p['legThick']), 'hl%s2' % s)]  # (its round end over the toes, not under them)
        toeL = max(legH * 0.28, bw * 0.4) if not up else bw * 0.35
        for k, ang in enumerate((-0.45, 0.0, 0.45) if p['toes'] == 3 else (-0.15, 0.25)):
            tip = ft + v3(sd * np.sin(ang) * toeL + 0 * sd, -0.008, np.cos(ang) * toeL)
            leg.append((RoundCone(ft, tip, lr * 0.75, lr * 0.4), 'hl%s3' % s))
        if p['toes'] == 3 and not up: leg.append((RoundCone(ft, ft + v3(0, -0.006, -toeL * 0.45), lr * 0.6, lr * 0.35), 'hl%s3' % s))
        if p['flipper']: leg = [(RoundCone(hl + v3(0, lr, 0), ft, lr * p['legThick'], lr * 0.9 * p['legThick']), 'hl%s2' % s), (Ellipsoid(ft + v3(0, 0.005, bw * 0.2), (bw * 0.22, 0.01, bw * 0.3)), 'hl%s3' % s)]
        # (the shank and the toes meshed apart: a long thin shank in one piece with the toes, the decimator ate it)
        b.piece('perna' + s, 'casco', leg[:1], 24, far=6, h=max(0.0015, lr * 0.45))
        b.piece('dedos' + s, 'casco', leg[1:], 30, far=0, h=max(0.0015, lr * 0.4))
    b.meta['family'] = 'bird'; b.meta['fly'] = bool(fly); b.meta['upright'] = bool(up)
    return b


# ------------------------------ the snakes ------------------------------
SNAKE_J = ['tail3', 'tail2', 'tail1', 'tail0', 'root', 'spine', 'chest', 'neck0', 'neck1', 'neck2', 'head']
SNAKE_S = [0.05, 0.14, 0.23, 0.32, 0.41, 0.5, 0.59, 0.68, 0.77, 0.86, 0.93]


def snake(b, R=0.05, headW=1.6, headL=0.055, **kw):
    """A snake: a body in eleven bones lying straight along +Z (the 3D bends it as it goes), thickest in the middle, a slim
    neck behind the head; the head broad (the viper) or long (the python)."""
    L = b.L; H = b.H
    prof = lambda s: R * (0.18 + 0.82 * np.clip(s / 0.3, 0, 1) ** 0.7) * (1.0 - 0.12 * np.clip((s - 0.45) / 0.4, 0, 1)) * (1.0 - 0.15 * np.clip((s - 0.8) / 0.08, 0, 1))
    zs = lambda s: -L / 2 + s * L
    pts = [v3(0, R * 0.9, zs(s)) for s in SNAKE_S]
    for bn, q in zip(SNAKE_J, pts): b.j(bn, q)
    tip = v3(0, R * 0.3, zs(0.0))
    b.add(RoundCone(tip, pts[0], R * 0.06, prof(SNAKE_S[0])), 'tail3', k=R * 0.2)
    for k in range(len(pts) - 1):
        b.add(RoundCone(pts[k], pts[k + 1], prof(SNAKE_S[k]), prof(SNAKE_S[k + 1]), flat=((0, 1, 0), 0.82)), SNAKE_J[k + 1] if k >= 3 else SNAKE_J[k], k=R * 0.06)
    hd = pts[-1]; hw = R * headW; hl = headL * L
    hc = hd + v3(0, R * 0.05, hl * 0.4)
    b.add(Ellipsoid(hc, (hw * 0.5, R * 0.5, hl * 0.6)), 'head', k=R * 0.5)
    b.add(Ellipsoid(hc + v3(0, -R * 0.08, hl * 0.4), (hw * 0.32, R * 0.48, hl * 0.4)), 'head', k=R * 0.3)
    for sd in (1, -1):
        b.add(Ellipsoid(hc + v3(sd * hw * 0.27, -R * 0.12, -hl * 0.18), (hw * 0.25, R * 0.44, hl * 0.34)), 'head', k=R * 0.25)   # the jaw's corner
        b.add(Ellipsoid(hc + v3(sd * hw * 0.34, R * 0.4, hl * 0.12), (hw * 0.15, R * 0.13, hl * 0.2)), 'head', k=R * 0.1)       # the scale over the eye
    b.add(Ellipsoid(hc + v3(0, R * 0.32, hl * 0.05), (hw * 0.34, R * 0.2, hl * 0.48)), 'head', k=R * 0.2)                       # the flat crown
    b.j('jaw', hc); b.meta['nose'] = list(hc + v3(0, 0, hl * 0.8))
    eyes(b, hc + v3(hw * 0.4, R * 0.24, hl * 0.18), R * 0.21)
    b.meta['eye'] = list(hc)
    for s in ('L', 'R'):
        for k in range(4): b.j('fl%s%d' % (s, k), b.J['chest']); b.j('hl%s%d' % (s, k), b.J['root'])
    b.meta['family'] = 'snake'; b.meta['p'] = dict(headL=headL * L / max(H, 1e-3))
    return b


# ------------------------------ the sprawling: the crocodile, the lizard ------------------------------
def sprawl(b, W=0.5, tailL=1.2, headL=0.35, snout=1.0, legR=0.05, scutes=True, teeth=False, eyeR=0.012, headW=0.5, **kw):
    """Low on four legs splayed to the sides: a long flat body, the tail as long again (or more), the head long and flat."""
    H, L = b.H, b.L; Wd = W * L
    yb = H * 0.62
    root = b.j('root', (0, yb, -L * 0.36)); spine = b.j('spine', (0, yb + H * 0.03, 0)); chest = b.j('chest', (0, yb, L * 0.34))
    b.add(Ellipsoid((0, yb, 0), (Wd * 0.5, H * 0.42, L * 0.52)), 'spine', k=H * 0.2)
    b.add(Ellipsoid((0, yb, L * 0.3), (Wd * 0.44, H * 0.38, L * 0.28)), 'chest', k=H * 0.25)
    b.add(Ellipsoid((0, yb, -L * 0.32), (Wd * 0.46, H * 0.4, L * 0.26)), 'root', k=H * 0.25)
    # the neck and the head
    n0 = b.j('neck0', (0, yb + H * 0.02, L * 0.52)); n1 = b.j('neck1', (0, yb + H * 0.04, L * 0.6)); n2 = b.j('neck2', (0, yb + H * 0.06, L * 0.66))
    hd = b.j('head', (0, yb + H * 0.06, L * 0.7)); hl = headL * L; hw = headW * hl
    b.add(RoundCone(n0, hd, Wd * 0.34, Wd * 0.3, flat=((0, 1, 0), 0.7)), 'neck1', k=H * 0.2)
    b.add(Ellipsoid(hd + v3(0, H * 0.02, hl * 0.18), (hw * 0.55, H * 0.32, hl * 0.32)), 'head', k=H * 0.15)
    sn = hd + v3(0, -H * 0.02, hl * (0.95 + 0.05 * snout))
    b.add(RoundCone(hd + v3(0, 0, hl * 0.3), sn, hw * 0.42, hw * 0.16 * snout + hw * 0.06, flat=((0, 1, 0), 0.5)), 'head', k=H * 0.1)
    b.j('jaw', hd + v3(0, -H * 0.12, hl * 0.25))
    b.add(RoundCone(hd + v3(0, -H * 0.16, hl * 0.25), sn + v3(0, -H * 0.12, -hl * 0.05), hw * 0.36, hw * 0.12 * snout + hw * 0.05, flat=((0, 1, 0), 0.4)), 'jaw', k=H * 0.06)
    b.meta['nose'] = list(sn)
    ec = hd + v3(hw * 0.32, H * 0.26, hl * 0.2)
    for sd in (1, -1): b.add(Sphere(ec * v3(sd, 1, 1), eyeR * 1.6), 'head', k=eyeR)   # (the eyes' bumps, high on the head)
    eyes(b, ec + v3(eyeR * 0.3, eyeR * 0.6, 0), eyeR)
    b.meta['eye'] = list(ec)
    if teeth:
        pr = []
        for sd in (1, -1):
            for k in range(6):
                t = 0.35 + k * 0.11; q = lerp(hd + v3(sd * hw * 0.36, -H * 0.12, hl * 0.3), sn + v3(sd * hw * 0.1, -H * 0.1, -hl * 0.05), t)
                pr.append((RoundCone(q, q + v3(0, -H * 0.06, 0), H * 0.018, H * 0.004), 'head'))
        b.piece('dentes', 'marfim', pr, 60, far=0, h=H * 0.006)
    # the tail
    t0 = b.j('tail0', (0, yb, -L * 0.55)); tL = tailL * L
    pts = [t0] + [t0 + v3(0, -H * 0.15 * k / 4, -tL * k / 4) for k in range(1, 5)]
    for k in range(1, 4): b.j('tail%d' % k, pts[k])
    rr = [H * 0.38, H * 0.3, H * 0.22, H * 0.13, H * 0.03]
    for k in range(4): b.add(RoundCone(pts[k], pts[k + 1], rr[k], rr[k + 1], flat=((1, 0, 0), 0.75)), 'tail%d' % k, k=H * 0.12)
    if scutes:  # (two rows of plates down the back, one crest down the tail)
        for k in range(10):
            z = L * 0.45 - k * L * 0.1
            for sd in (1, -1): b.add(RBox((sd * Wd * 0.14, yb + H * 0.38, z), (Wd * 0.05, H * 0.06, L * 0.035), H * 0.02), 'spine' if z > -L * 0.2 else 'root', k=H * 0.04)
        for k in range(1, 12):
            t = k / 12.0; kk = min(3, int(t * 4)); q = lerp(pts[kk], pts[kk + 1], t * 4 - kk)
            b.add(RBox(q + v3(0, rr[kk] * (1 - (t * 4 - kk)) + rr[kk + 1] * (t * 4 - kk) + H * 0.03, 0), (H * 0.025, H * 0.07 * (1 - t * 0.6), tL * 0.02), H * 0.01), 'tail%d' % kk, k=H * 0.03)
    # the legs: out to the side, down at the elbow, the foot flat and forward
    for sd, s in ((1, 'L'), (-1, 'R')):
        for leg, z0 in (('fl', L * 0.32), ('hl', -L * 0.34)):
            big = 1.0 if leg == 'fl' else 1.25
            sh = b.j('%s%s0' % (leg, s), (sd * Wd * 0.42, yb - H * 0.05, z0)); el = b.j('%s%s1' % (leg, s), (sd * Wd * (0.42 + 0.36 * big), yb - H * 0.12, z0 - L * 0.03 * (1 if leg == 'fl' else -1)))
            wr = b.j('%s%s2' % (leg, s), (sd * Wd * (0.45 + 0.4 * big), H * 0.08, z0 + L * 0.02)); ft = b.j('%s%s3' % (leg, s), (sd * Wd * (0.5 + 0.42 * big), H * 0.03, z0 + L * 0.1))
            r = legR * L * big
            b.add(RoundCone(sh, el, r * 1.4, r), '%s%s0' % (leg, s), k=r)
            b.add(RoundCone(el, wr, r, r * 0.8), '%s%s1' % (leg, s), k=r * 0.5)
            b.add(Ellipsoid(ft + v3(0, -H * 0.01, 0), (r * 1.4, H * 0.05, r * 2.0)), '%s%s2' % (leg, s), k=r * 0.6)
    b.meta['family'] = 'sprawl'; b.meta['p'] = dict(headL=headL * L / max(H, 1e-3))
    return b


# ------------------------------ the frog ------------------------------
def frog(b, **kw):
    """A frog sitting: the body raised in front, the broad flat head with its eyes on top, the forelegs straight, the hind legs
    folded beside it — thigh forward, shin back, the long foot forward."""
    L = b.L; H = b.H
    root = b.j('root', (0, L * 0.18, -L * 0.25)); spine = b.j('spine', (0, L * 0.24, -L * 0.05)); chest = b.j('chest', (0, L * 0.3, L * 0.12))
    b.add(Ellipsoid((0, L * 0.25, -L * 0.05), (L * 0.28, L * 0.2, L * 0.36), rot_x(-0.45)), 'spine', k=L * 0.08)
    hd = b.j('head', (0, L * 0.34, L * 0.22)); b.j('neck0', (0, L * 0.32, L * 0.18)); b.j('neck1', (0, L * 0.33, L * 0.2)); b.j('neck2', (0, L * 0.335, L * 0.21))
    b.add(Ellipsoid(hd + v3(0, 0, L * 0.1), (L * 0.27, L * 0.13, L * 0.2)), 'head', k=L * 0.08)
    b.j('jaw', hd + v3(0, -L * 0.06, L * 0.05)); b.meta['nose'] = list(hd + v3(0, 0, L * 0.28))
    ec = hd + v3(L * 0.13, L * 0.11, L * 0.12)
    for sd in (1, -1): b.add(Sphere(ec * v3(sd, 1, 1), L * 0.06), 'head', k=L * 0.04)
    eyes(b, ec + v3(L * 0.02, L * 0.015, L * 0.01), L * 0.05)
    b.meta['eye'] = list(ec)
    for sd, s in ((1, 'L'), (-1, 'R')):
        sh = b.j('fl%s0' % s, (sd * L * 0.16, L * 0.26, L * 0.15)); el = b.j('fl%s1' % s, (sd * L * 0.2, L * 0.13, L * 0.2)); wr = b.j('fl%s2' % s, (sd * L * 0.22, L * 0.02, L * 0.22)); b.j('fl%s3' % s, (sd * L * 0.25, 0.0, L * 0.3))
        b.add(RoundCone(sh, el, L * 0.05, L * 0.035), 'fl%s0' % s, k=L * 0.03); b.add(RoundCone(el, wr, L * 0.035, L * 0.03), 'fl%s1' % s, k=L * 0.02)
        b.add(Ellipsoid(wr + v3(sd * L * 0.02, 0, L * 0.05), (L * 0.06, L * 0.015, L * 0.06)), 'fl%s2' % s, k=L * 0.02)
        hp = b.j('hl%s0' % s, (sd * L * 0.16, L * 0.14, -L * 0.3)); kn = b.j('hl%s1' % s, (sd * L * 0.34, L * 0.1, L * 0.05)); an = b.j('hl%s2' % s, (sd * L * 0.28, L * 0.05, -L * 0.3)); ft = b.j('hl%s3' % s, (sd * L * 0.3, 0.01, L * 0.02))
        b.add(RoundCone(hp, kn, L * 0.1, L * 0.06), 'hl%s0' % s, k=L * 0.05); b.add(RoundCone(kn, an, L * 0.055, L * 0.035), 'hl%s1' % s, k=L * 0.03)
        b.add(RoundCone(an, ft, L * 0.03, L * 0.025), 'hl%s2' % s, k=L * 0.02); b.add(Ellipsoid(ft + v3(0, 0, L * 0.08), (L * 0.07, L * 0.012, L * 0.1)), 'hl%s3' % s, k=L * 0.02)
    b.j('tail0', root)
    b.meta['family'] = 'frog'; b.meta['p'] = dict(headL=0.5)
    return b


# ------------------------------ the seals ------------------------------
def seal(b, R=0.25, headR=0.5, tusks=False, whisk=0.0, **kw):
    """A seal lying on its belly: a spindle of a body, the round head lifted on its neck, the fore flippers under the chest, the
    hind flippers together behind. The walrus: bigger, its tusks and the bristled pad of its muzzle."""
    L = b.L; H = b.H; Rb = R * L
    root = b.j('root', (0, Rb * 0.85, -L * 0.25)); spine = b.j('spine', (0, Rb * 0.9, 0.0)); chest = b.j('chest', (0, Rb * 0.95, L * 0.2))
    b.add(Ellipsoid((0, Rb * 0.88, 0), (Rb * 0.95, Rb * 0.88, L * 0.42)), 'spine', k=Rb * 0.2)
    b.add(Ellipsoid((0, Rb * 0.95, L * 0.18), (Rb * 0.92, Rb * 0.92, L * 0.24)), 'chest', k=Rb * 0.4)
    b.add(RoundCone((0, Rb * 0.7, -L * 0.2), (0, Rb * 0.35, -L * 0.46), Rb * 0.8, Rb * 0.32), 'root', k=Rb * 0.4)
    n0 = b.j('neck0', (0, Rb * 1.1, L * 0.36)); n1 = b.j('neck1', (0, Rb * 1.25, L * 0.42)); n2 = b.j('neck2', (0, Rb * 1.35, L * 0.46)); hd = b.j('head', (0, Rb * 1.4, L * 0.48))
    b.add(RoundCone(n0, hd, Rb * 0.72, Rb * 0.55), 'neck1', k=Rb * 0.3)
    hr = headR * Rb
    b.add(Ellipsoid(hd + v3(0, hr * 0.1, hr * 0.3), (hr * 0.95, hr * 0.85, hr)), 'head', k=hr * 0.3)
    mz = hd + v3(0, -hr * 0.1, hr * 1.1)
    b.add(Ellipsoid(mz, (hr * (0.62 + whisk * 0.4), hr * (0.5 + whisk * 0.25), hr * 0.5)), 'head', k=hr * 0.25)
    b.j('jaw', mz + v3(0, -hr * 0.3, -hr * 0.2)); b.meta['nose'] = list(mz + v3(0, 0, hr * 0.45))
    for sd in (1, -1): b.cut(Sphere(mz + v3(sd * hr * 0.18, hr * 0.25, hr * 0.42), hr * 0.07), k=hr * 0.03)
    eyes(b, hd + v3(hr * 0.55, hr * 0.38, hr * 0.62), hr * 0.15)
    b.meta['eye'] = list(hd)
    if tusks:
        b.piece('presas', 'marfim', [(RoundCone(mz + v3(sd * hr * 0.25, -hr * 0.3, hr * 0.1), mz + v3(sd * hr * 0.3, -hr * 1.6, hr * 0.25), hr * 0.12, hr * 0.05), 'head') for sd in (1, -1)], 60, far=12)
    for sd, s in ((1, 'L'), (-1, 'R')):
        sh = b.j('fl%s0' % s, (sd * Rb * 0.7, Rb * 0.55, L * 0.24)); el = b.j('fl%s1' % s, (sd * Rb * 0.95, Rb * 0.25, L * 0.26)); wr = b.j('fl%s2' % s, (sd * Rb * 1.05, Rb * 0.06, L * 0.28)); b.j('fl%s3' % s, (sd * Rb * 1.1, 0.01, L * 0.36))
        b.add(RoundCone(sh, el, Rb * 0.22, Rb * 0.16), 'fl%s0' % s, k=Rb * 0.15)
        b.add(K(ell_between(el, wr + v3(sd * Rb * 0.05, -Rb * 0.03, L * 0.1), Rb * 0.2, Rb * 0.05), Rb * 0.1), 'fl%s1' % s, k=Rb * 0.1)
        hp = b.j('hl%s0' % s, (sd * Rb * 0.15, Rb * 0.35, -L * 0.44)); kn = b.j('hl%s1' % s, (sd * Rb * 0.25, Rb * 0.3, -L * 0.5)); an = b.j('hl%s2' % s, (sd * Rb * 0.32, Rb * 0.25, -L * 0.56)); b.j('hl%s3' % s, (sd * Rb * 0.4, Rb * 0.2, -L * 0.62))
        b.add(K(ell_between(kn, an + v3(sd * Rb * 0.1, 0, -L * 0.08), Rb * 0.26, Rb * 0.05), Rb * 0.12), 'hl%s1' % s, k=Rb * 0.12)
    b.j('tail0', (0, Rb * 0.35, -L * 0.46))
    b.meta['family'] = 'seal'; b.meta['p'] = dict(headL=0.4)
    return b



# ------------------------------ the dragon (the god's power: js/dragon.js, drawn by js/dragon3d.js) ------------------------------
# A wyvern: its wings are its forelimbs, on the fl bones as a bird's (the arm, the forearm, the hand, the fingers), and on the
# ground it walks on its wrists and its hind feet — four claws on the ground, as the god's picture draws it —, so the one
# skeleton of the beasts carries it. Two meshes, as a bird of the air has: on the ground (the wings folded along its flanks
# like a cloak, the neck raised in an S, the tail on the ground) and in the air (the wings spread, the neck and the tail out
# straight). Some 18 m from the nose to the tail's tip, 21 m of wings; metres, standing on the ground, facing +Z.
from corpo_sdf import Prim, field_at


def poly2(p, V):
    """The signed distance in a plane from the points p (n, 2) to the polygon V (m, 2), negative inside (Inigo Quilez's)."""
    V = np.asarray(V, float); d = np.sum((p - V[0]) ** 2, 1); s = np.ones(len(p))
    for i in range(len(V)):
        e = V[i - 1] - V[i]; w = p - V[i]
        q = w - np.outer(np.clip((w @ e) / (e @ e), 0, 1), e); d = np.minimum(d, np.einsum('ij,ij->i', q, q))
        c1 = p[:, 1] >= V[i][1]; c2 = p[:, 1] < V[i - 1][1]; c3 = e[0] * w[:, 1] > e[1] * w[:, 0]
        s[(c1 & c2 & c3) | (~c1 & ~c2 & ~c3)] *= -1
    return s * np.sqrt(d)


class Sheet(Prim):
    """A membrane: a thin sheet (half thickness th) over a polygon in the plane of two axes, at the height hf(u, v) along the
    third (ax = (u, v, n)) — the skin of a wing between its fingers."""
    def __init__(self, poly, ax, hf, th):
        self.poly = np.asarray(poly, float); self.ax = ax; self.hf = hf; self.th = float(th)
        lo = self.poly.min(0); hi = self.poly.max(0)
        g = np.stack(np.meshgrid(np.linspace(lo[0], hi[0], 40), np.linspace(lo[1], hi[1], 40)), -1).reshape(-1, 2); hv = hf(g[:, 0], g[:, 1])
        b0 = np.zeros(3); b1 = np.zeros(3); b0[ax[0]], b1[ax[0]] = lo[0], hi[0]; b0[ax[1]], b1[ax[1]] = lo[1], hi[1]
        b0[ax[2]], b1[ax[2]] = hv.min() - th - 0.05, hv.max() + th + 0.05; self.box = (b0, b1)
    def bbox(self): return self.box
    def sdf(self, P):
        u, v, n = self.ax
        return np.maximum(np.abs(P[:, n] - self.hf(P[:, u], P[:, v])) - self.th, poly2(P[:, [u, v]], self.poly))


def seg_dist(P, a, b):
    ab = b - a; t = np.clip((P - a) @ ab / max(ab @ ab, 1e-12), 0, 1)
    return np.linalg.norm(P - (a + np.outer(t, ab)), axis=1), t


def line_weights(lines, tau):
    """The weights of a wing's skin by its bone lines — lines: [(a, b, [(t, bone), ...])]: a point near a line goes with it,
    with the bone of how far along it is (a finger's root with the hand, its end with the fingers, blended between); a point
    between two lines with both, by how near each is — smooth, so the membrane stretches as the wing beats and folds."""
    def f(V):
        D = []; Bw = []
        for a, b, along in lines:
            d, t = seg_dist(V, np.asarray(a, float), np.asarray(b, float)); D.append((d / tau) ** 2)
            w = np.zeros((len(V), len(BONES)))
            if len(along) == 1: w[:, BI[along[0][1]]] = 1
            else:
                for k in range(len(along) - 1):
                    t0, b0 = along[k]; t1, b1 = along[k + 1]
                    m = (t <= t1) if k == 0 else (t > along[k][0]) & (t <= t1)
                    if k == len(along) - 2: m |= t > t1
                    u = np.clip((t[m] - t0) / max(t1 - t0, 1e-9), 0, 1); u = u * u * (3 - 2 * u)
                    w[m, BI[b0]] += 1 - u; w[m, BI[b1]] += u
            Bw.append(w)
        D = np.stack(D, 1); E = np.exp(-(D - D.min(1, keepdims=True)))
        W = sum(E[:, k:k + 1] * Bw[k] for k in range(len(lines)))
        return W / np.maximum(W.sum(1, keepdims=True), 1e-12)
    return f


def surf_along(P, c, n, r0=0.0, r1=3.0):
    """Where the clay's surface is from c along n (the first crossing, by halving): for a spine on the back, an eye in its head."""
    lo, hi = r0, r1
    for _ in range(26):
        m = (lo + hi) / 2
        if field_at(P, (c + n * m)[None, :])[0] < 0: lo = m
        else: hi = m
    return c + n * lo


def dsm(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


LEGB = np.array([bn[:2] in ('fl', 'hl') for bn in BONES])


def dragon(b, fly=False, **kw):
    """The dragon: a deep chest for the wings' muscles, the hips and the hind legs of a great bird, the neck in three and the
    head (the skull, the long snout, the brows, the horns swept back, the frills behind the jaw, the jaw that opens to breathe,
    the teeth, the tongue), the tail in four to a spade, a row of spines from the head to the tail; the wings (the arm and the
    forearm in the body's skin, the fingers and the membrane between them pieces of their own)."""
    H = b.H; p = dict(headL=1.85 / H); b.meta['p'] = p; b.meta['h'] = kw.get('h', 0.045)
    # --- the trunk (the same in both meshes)
    root = b.j('root', (0, 2.75, -2.3)); spine = b.j('spine', (0, 3.05, -0.5)); chest = b.j('chest', (0, 3.2, 1.3))
    b.add(Ellipsoid((0, 2.85, 0.85), (0.95, 1.08, 1.75), rot_x(0.08)), 'chest', tau=0.6)                    # the ribcage
    b.add(Ellipsoid((0, 2.42, 1.85), (0.72, 0.92, 0.9)), 'chest', k=0.35, tau=0.6)                          # the keel of the breast
    for sd in (1, -1): b.add(Ellipsoid((sd * 0.52, 3.38, 1.2), (0.55, 0.48, 0.95)), 'chest', k=0.4, tau=0.6)  # the wings' muscles
    b.add(Ellipsoid((0, 2.72, -0.8), (0.8, 0.84, 1.55)), 'spine', k=0.5, tau=0.8)                            # the belly
    b.add(Ellipsoid((0, 2.82, -2.15), (0.84, 0.8, 1.15)), 'root', k=0.5, tau=0.7)                            # the hips
    # --- the neck, the head
    if fly: n0, n1, n2, hd, ha = v3(0, 3.5, 2.55), v3(0, 3.86, 3.8), v3(0, 4.12, 5.0), v3(0, 4.26, 6.1), 9
    else: n0, n1, n2, hd, ha = v3(0, 3.55, 2.5), v3(0, 4.5, 3.45), v3(0, 5.25, 4.25), v3(0, 5.62, 4.95), 26
    b.j('neck0', n0); b.j('neck1', n1); b.j('neck2', n2); b.j('head', hd)
    nk = [v3(0, 3.0, 1.75), n0, n1, n2, hd]; nr = [0.8, 0.68, 0.55, 0.46, 0.4]
    for k, bn in enumerate(['chest', 'neck0', 'neck1', 'neck2']):
        b.add(RoundCone(nk[k], nk[k + 1], nr[k], nr[k + 1], flat=((1, 0, 0), 0.86)), bn, k=0.25, tau=0.5)
    b.add(Ellipsoid(n0 + v3(0, -0.34, 0.12), (0.52, 0.5, 0.78)), 'neck0', k=0.3, tau=0.5)                   # the throat
    a = np.radians(ha); d = v3(0, -np.sin(a), np.cos(a)); up = v3(0, np.cos(a), np.sin(a)); X = v3(1, 0, 0)
    th = 0.3
    sk = hd + d * 0.28 + up * 0.08
    b.add(Ellipsoid(sk, (0.47, 0.56, 0.42), orient(sk - d, sk + d, up)), 'head', k=0.2, tau=th)              # the skull
    s0, s1 = hd + d * 0.75 + up * 0.02, hd + d * 1.72 - up * 0.05
    b.add(RoundCone(s0, s1, 0.34, 0.2, flat=(up, 0.78)), 'head', k=0.22, tau=th)                             # the snout
    nose = hd + d * 1.8 - up * 0.02
    b.add(Ellipsoid(nose - d * 0.06, (0.19, 0.15, 0.16)), 'head', k=0.1, tau=th)
    for sd in (1, -1):
        b.add(Ellipsoid(hd + d * 0.25 - up * 0.1 + X * sd * 0.3, (0.2, 0.3, 0.38)), 'head', k=0.2, tau=th)  # the jaw's muscles
        b.cut(Sphere(nose + X * sd * 0.1 + up * 0.07 + d * 0.06, 0.055), k=0.03)                           # the nostrils
    b.meta['nose'] = list(nose + d * 0.12)
    # (the eyes in their sockets under a heavy brow, a little forward: on the clay's surface, out from the face's middle)
    c = hd + d * 0.6 + up * 0.17; ec = surf_along(b.P, c, X, 0.0, 0.8) - X * 0.035
    er = 0.088
    for sd in (1, -1): b.add(Ellipsoid(ec * v3(sd, 1, 1) + up * 0.09 - d * 0.03, (0.13, 0.26, 0.07), orient(ec - d, ec + d, up)), 'head', k=0.07, tau=th)
    eyes(b, ec, er); b.meta['eye'] = list(ec)
    b.j('jaw', hd + d * 0.15 - up * 0.2)
    for sd, s in ((1, 'L'), (-1, 'R')): b.j('ear%s' % s, hd - d * 0.08 + up * 0.05 + X * sd * 0.38)
    # --- the tail, to the spade
    tl = [v3(0, 2.85, -3.5), v3(0, 2.8, -5.5), v3(0, 2.77, -7.5), v3(0, 2.75, -9.3), v3(0, 2.75, -11.3)] if fly else \
         [v3(0, 2.7, -3.5), v3(0, 2.05, -5.4), v3(0, 1.25, -7.25), v3(0, 0.62, -9.05), v3(0, 0.32, -11.0)]
    for k in range(4): b.j('tail%d' % k, tl[k])
    b.add(RoundCone(v3(0, 2.78, -2.6), tl[0], 0.78, 0.62), 'root', k=0.4, tau=0.7)
    tr = [0.62, 0.45, 0.31, 0.19, 0.05]
    for k in range(4): b.add(RoundCone(tl[k], tl[k + 1], tr[k], tr[k + 1], flat=((1, 0, 0), 0.9)), 'tail%d' % k, k=0.15, tau=0.8)
    # --- the hind legs: the thigh of a great bird, the shin, the long foot, three toes forward and one back, the claws
    claws = []
    for sd, s in ((1, 'L'), (-1, 'R')):
        Xs = v3(sd, 1, 1)
        hp = b.j('hl%s0' % s, v3(0.72, 2.55, -2.2) * Xs); kn = b.j('hl%s1' % s, v3(0.98, 1.55, -1.25) * Xs)
        an = b.j('hl%s2' % s, v3(0.92, 0.72, -2.35) * Xs); ft = b.j('hl%s3' % s, v3(0.92, 0.16, -1.85) * Xs)
        b.add(ell_between(hp + v3(0, 0.35, -0.15), kn + v3(0, 0.05, -0.05), 0.5, 0.64), 'hl%s0' % s, k=0.35, tau=0.5)   # the thigh
        b.add(RoundCone(kn, an, 0.34, 0.2), 'hl%s1' % s, k=0.15, tau=0.35)
        b.add(ell_between(kn + v3(0, -0.05, -0.12), lerp(kn, an, 0.55), 0.3, 0.38), 'hl%s1' % s, k=0.15, tau=0.35)      # the calf
        b.add(RoundCone(an, ft, 0.2, 0.17), 'hl%s2' % s, k=0.1, tau=0.3)
        b.add(Ellipsoid(ft + v3(0, -0.04, 0.22), (0.3, 0.14, 0.42)), 'hl%s3' % s, k=0.12, tau=0.3)
        for dx in (-0.2, 0.0, 0.2):
            tip = v3(ft[0] + sd * dx * 1.9 + sd * 0.02, 0.08, ft[2] + 0.92 - abs(dx) * 0.6)
            b.add(RoundCone(ft + v3(sd * dx * 0.5, -0.04, 0.3), tip, 0.11, 0.075), 'hl%s3' % s, k=0.08, tau=0.25)
            claws.append((RoundCone(tip + v3(0, 0.01, 0.02), tip + v3(sd * dx * 0.15, -0.075, 0.24), 0.075, 0.012), 'hl%s3' % s))
        bk = v3(ft[0] + sd * 0.05, 0.12, ft[2] - 0.42)
        b.add(RoundCone(ft + v3(0, 0, -0.1), bk, 0.1, 0.07), 'hl%s3' % s, k=0.06, tau=0.25)
        claws.append((RoundCone(bk, bk + v3(0, -0.07, -0.2), 0.065, 0.012), 'hl%s3' % s))
    # --- the wings: the arm in the body's skin, the fingers and the membrane pieces of their own
    sh = v3(0.8, 3.45, 1.45)
    if fly:
        el, wr = v3(2.95, 3.7, 0.75), v3(5.55, 3.8, 1.5)
        tips = [v3(10.6, 3.55, -0.45), v3(9.35, 3.45, -3.35), v3(7.0, 3.35, -5.0), v3(4.25, 3.3, -4.55)]
        thumb = v3(5.88, 3.75, 2.18); flank = v3(0.75, 2.95, -2.55)
    else:
        el, wr = v3(1.42, 2.2, 0.0), v3(1.55, 0.42, 2.05)
        tips = [v3(1.22, 4.2, -1.35), v3(1.35, 3.88, -1.85), v3(1.48, 3.42, -2.15), v3(1.58, 2.9, -1.95)]
        thumb = v3(1.7, 0.05, 2.55); flank = v3(0.85, 2.7, -2.4)
    q = [wr + (t - wr) * 0.45 for t in tips]; kn3 = np.mean(q, 0); axis = nrm(q[3] - q[0])
    b.meta['wing3'] = [round(float(x), 4) for x in axis]
    for sd, s in ((1, 'L'), (-1, 'R')):
        Xs = v3(sd, 1, 1); S = lambda v, Xs=Xs: np.asarray(v, float) * Xs
        f0, f1, f2, f3 = 'fl%s0' % s, 'fl%s1' % s, 'fl%s2' % s, 'fl%s3' % s
        b.j(f0, S(sh)); b.j(f1, S(el)); b.j(f2, S(wr)); b.j(f3, S(kn3))
        b.add(RoundCone(S(sh), S(el), 0.36, 0.22), f0, k=0.25, tau=0.35)
        b.add(ell_between(S(lerp(sh, el, 0.12)), S(lerp(sh, el, 0.75)), 0.3, 0.37), f0, k=0.2, tau=0.35)      # the arm's muscle
        b.add(RoundCone(S(el), S(wr), 0.22, 0.15), f1, k=0.12, tau=0.3)
        b.add(ell_between(S(lerp(el, wr, 0.04)), S(lerp(el, wr, 0.5)), 0.19, 0.24), f1, k=0.12, tau=0.3)
        b.add(Sphere(S(wr), 0.2), f2, k=0.1, tau=0.25)
        # the fingers: four long ones fanned from the wrist (bent at their knuckles, the fl3's hinge), the thumb and its claw
        fing = []; lines = []
        for t in tips:
            m = lerp(wr, t, 0.45)
            fing += [(RoundCone(S(wr), S(m), 0.115, 0.08), f2), (RoundCone(S(m), S(t), 0.08, 0.028), f3)]
            lines.append((S(wr), S(t), [(0.0, f2), (0.38, f2), (0.52, f3)]))
        fing.append((RoundCone(S(wr), S(thumb), 0.12, 0.065), f2))
        b.piece('dedos' + s, 'pelo', fing, 170, far=0, h=0.022); b.pieces[-1]['split'] = True
        b.pieces[-1]['wfun'] = line_weights(lines + [(S(wr), S(thumb), [(0.0, f2)])], 0.12)
        tdir = nrm(thumb - wr)
        claws.append((RoundCone(S(thumb), S(thumb + tdir * 0.26 - v3(0, 0.08, 0)), 0.07, 0.012), f2))
        # the membrane: from the arm and the flank out to the fingers' tips, its trailing edge in scallops between them
        lines = lines + [(S(sh), S(el), [(0.0, f0), (0.8, f0), (1.0, f1)]), (S(el), S(wr), [(0.0, f1), (0.85, f1), (1.0, f2)]),
                         (S(sh), S(flank), [(0.0, 'chest'), (0.5, 'spine'), (1.0, 'root')])]
        def scal(A, B, C0, k=0.3, n=4):
            Cc = (A + B) / 2 + (C0 - (A + B) / 2) * k
            return [(1 - u) ** 2 * A + 2 * u * (1 - u) * Cc + u * u * B for u in np.linspace(0, 1, n + 2)[1:-1]]
        edge = [tips[0]]
        for k in range(3): edge += scal(tips[k], tips[k + 1], wr) + [tips[k + 1]]
        edge += scal(tips[3], flank, el, 0.35)
        if fly:
            out = [sh, (sh + wr) / 2 + v3(0, 0, 0.12), wr, wr + (tips[0] - wr) * 0.5 + v3(0, 0, 0.18)] + edge + [flank]
            poly = np.array([[pt[0], pt[2]] for pt in out]); ax = (0, 2, 1)
        else:
            out = [wr, lerp(wr, sh, 0.5) + v3(0, 0, 0.18), sh + v3(0, 0.15, 0)] + edge + [flank, el]
            poly = np.array([[pt[2], pt[1]] for pt in out]); ax = (2, 1, 0)
        bl = [(sh, el), (el, wr)] + [(wr, t) for t in tips] + [(sh, flank)]
        def hf(u, v, bl=bl, ax=ax, fly=fly, wr=wr):
            """(the sheet's height: what the bones nearest have, eased between them; billowing up in the air, folded in pleats
            on the ground)"""
            P2 = np.stack([u, v], 1); num = 0; den = 0; dmin = np.full(len(u), 9.0)
            for A, B in bl:
                A2 = np.array([A[ax[0]], A[ax[1]]]); B2 = np.array([B[ax[0]], B[ax[1]]]); dd, t = seg_dist(P2, A2, B2)
                hh = A[ax[2]] + (B[ax[2]] - A[ax[2]]) * t; w = 1.0 / (dd * dd + 0.04); num = num + w * hh; den = den + w; dmin = np.minimum(dmin, dd)
            base = num / den
            if fly: return base + 0.2 * np.clip(dmin / 1.6, 0, 1) ** 0.8
            ang = np.arctan2(v - wr[1], u - wr[2]); return base + 0.07 * np.sin(ang * 16) * np.clip(dmin / 0.5, 0, 1)
        if sd < 0:
            if fly: poly = poly * np.array([-1, 1]); hfs = lambda u, v, hf0=hf: hf0(-u, v)
            else: hfs = lambda u, v, hf0=hf: -hf0(u, v)
        else: hfs = hf
        mem = Sheet(poly, ax, hfs, 0.065)
        b.piece('asa' + s, 'asa', [(mem, f1)], 600, far=130, h=0.032)
        b.pieces[-1]['split'] = True  # (the far mesh keeps the wings — they read from afar: the decimator stops short on the sheet's rim unless split)
        b.pieces[-1]['wfun'] = line_weights(lines, 0.8); b.pieces[-1]['wing'] = (list(S(sh)), float(np.linalg.norm(tips[0] - sh)))
    b.piece('garras', 'unha', claws, 120, far=0, h=0.016)
    # --- the head's own pieces: the lower jaw (it opens), the tongue and the palate, the teeth, the horns, the frills
    h0, chin = hd + d * 0.2 - up * 0.3, hd + d * 1.66 - up * 0.33
    b.meta['chin'] = [round(float(x), 4) for x in chin]
    b.piece('mandibula', 'pelo', [(RoundCone(h0, chin, 0.27, 0.15, flat=(up, 0.62)), 'jaw'), (Ellipsoid(h0 - d * 0.05 + up * 0.04, (0.3, 0.2, 0.3)), 'jaw')], 260, far=60, h=0.03)
    b.pieces[-1]['reg'] = True
    b.piece('lingua', 'crista', [(Ellipsoid(lerp(h0, chin, 0.45) + up * 0.12, (0.15, 0.6, 0.06), orient(h0, chin, up)), 'jaw')], 40, far=0, h=0.025)
    b.piece('palato', 'crista', [(Ellipsoid(lerp(s0, s1, 0.4) - up * 0.17, (0.2, 0.62, 0.05), orient(s0, s1, up)), 'head')], 30, far=0, h=0.025)
    b.pieces[-1]['split'] = True
    up_t, lo_t = [], []
    for sd in (1, -1):
        for k in range(6):
            t = k / 5.0
            a0 = lerp(hd + d * 0.62, hd + d * 1.66, t) - up * 0.19 + X * sd * (0.28 - 0.13 * t)
            up_t.append((RoundCone(a0, a0 - up * (0.15 - 0.05 * t) + d * 0.02, 0.045, 0.008), 'head'))
            a1 = lerp(h0 + d * 0.5, chin - d * 0.05, t) + up * 0.12 + X * sd * (0.22 - 0.1 * t)
            lo_t.append((RoundCone(a1, a1 + up * (0.12 - 0.03 * t) + d * 0.02, 0.04, 0.008), 'jaw'))
    b.piece('dentes', 'marfim', up_t, 120, far=0, h=0.012); b.piece('dentesb', 'marfim', lo_t, 90, far=0, h=0.012)
    hp = []
    for sd in (1, -1):
        Xs = X * sd; base = hd + up * 0.3 - d * 0.02 + Xs * 0.24
        pts = [base, base - d * 0.5 + up * 0.1 + Xs * 0.12, base - d * 1.0 + up * 0.08 + Xs * 0.2, base - d * 1.5 - up * 0.06 + Xs * 0.22]
        hp += [(RoundCone(pts[k], pts[k + 1], [0.14, 0.1, 0.065][k], [0.1, 0.065, 0.018][k]), 'head') for k in range(3)]
        b2 = hd - up * 0.06 + Xs * 0.36 + d * 0.02
        pts = [b2, b2 - d * 0.38 - up * 0.04 + Xs * 0.14, b2 - d * 0.72 - up * 0.12 + Xs * 0.2]
        hp += [(RoundCone(pts[k], pts[k + 1], [0.075, 0.045][k], [0.045, 0.012][k]), 'head') for k in range(2)]
        bb = ec * v3(sd, 1, 1) + up * 0.14 - d * 0.12
        hp.append((RoundCone(bb, bb + up * 0.16 - d * 0.18 + Xs * 0.06, 0.045, 0.01), 'head'))
    nh = nose + up * 0.12 - d * 0.18
    hp.append((RoundCone(nh, nh + up * 0.17 + d * 0.06, 0.06, 0.012), 'head'))
    b.piece('chifres', 'chifre', hp, 170, far=30, h=0.016)
    for sd, s in ((1, 'L'), (-1, 'R')):
        e0 = b.J['ear%s' % s]; f0_ = e0 - d * 0.05 + X * sd * 0.02 - up * 0.1; f1_ = e0 - d * 0.85 + X * sd * 0.3 - up * 0.18
        on = nrm(X * sd - (f1_ - f0_) * (np.dot(X * sd, f1_ - f0_) / np.dot(f1_ - f0_, f1_ - f0_)))
        fins = []
        for a_, b_, wd in ((f0_, f1_, 0.17), (f0_ + up * 0.12, f0_ - d * 0.6 + X * sd * 0.22 + up * 0.22, 0.1)):
            oz = nrm(b_ - a_); ox = nrm(on - oz * np.dot(on, oz)); oy = np.cross(oz, ox)
            fins.append((Ellipsoid((a_ + b_) / 2, (0.045, wd, np.linalg.norm(b_ - a_) * 0.55), np.stack([ox, oy, oz], 1)), 'ear%s' % s))
        b.piece('folho' + s, 'asa', fins, 60, far=0, h=0.02)
        b.meta.setdefault('ears', []).append([list(e0), list(e0 - d * 0.7)])
    # --- the spines: from behind the horns down the neck, the back and the tail, highest over the shoulders; the spade
    chainP = [hd, n2, n1, n0, v3(*chest), v3(*spine), v3(*root)] + tl
    chainB = ['neck2', 'neck1', 'neck0', 'chest', 'spine', 'root', 'root', 'tail0', 'tail1', 'tail2', 'tail3']
    seg = [np.linalg.norm(chainP[k + 1] - chainP[k]) for k in range(len(chainP) - 1)]; tot = sum(seg); cum = np.concatenate([[0], np.cumsum(seg)])
    spn = []
    for s_ in np.arange(0.35, tot - 0.9, 0.52):
        k = min(int(np.searchsorted(cum, s_, side='right') - 1), len(seg) - 1); u = (s_ - cum[k]) / seg[k]
        c = lerp(chainP[k], chainP[k + 1], u); tdir = nrm(chainP[k + 1] - chainP[k]); nu = nrm(v3(0, tdir[2], -tdir[1]))
        if nu[1] < 0: nu = -nu
        f = s_ / tot; hgt = 0.16 + 0.3 * np.exp(-((f - 0.3) / 0.16) ** 2) + 0.12 * np.exp(-((f - 0.12) / 0.1) ** 2) - 0.08 * f
        bs = surf_along(b.P, c, nu, 0.0, 1.6) - nu * 0.06
        spn.append((RoundCone(bs, bs + nu * hgt + tdir * hgt * 0.55, 0.11 * (0.55 + hgt), 0.012, flat=((1, 0, 0), 0.32)), chainB[k]))
    tip = tl[4]; td = nrm(tl[4] - tl[3])
    spn += [(Ellipsoid(tip + td * 0.05, (0.5, 0.06, 0.55)), 'tail3'), (RoundCone(tip + td * 0.3, tip + td * 1.0, 0.24, 0.015, flat=((0, 1, 0), 0.25)), 'tail3')]
    for sd in (1, -1): spn.append((RoundCone(tip + td * 0.1 + v3(sd * 0.3, 0, 0), tip + td * 0.55 + v3(sd * 0.62, 0, 0), 0.16, 0.012, flat=((0, 1, 0), 0.3)), 'tail3'))
    b.piece('espinhos', 'crina', spn, 360, far=60, h=0.022)
    b.meta['chain'] = [[float(x) for x in q_] for q_ in [np.array(b.meta['nose'])] + chainP + [tl[4] + td * 1.0]]
    b.meta['regions'] = dragon_regions
    b.meta['family'] = 'dragon'; b.meta['fly'] = bool(fly)
    return b


def dragon_regions(b, V, N, W, r1, r2):
    """The dragon's paint by where each point is on it: the belly plates under its whole length (the throat, the chest, the
    tail), the line of the back where the spines stand darker, and how far along the body (the tail's tip 0, the nose 1) —
    the plates are counted by it."""
    C = np.array(b.meta['chain'])[::-1]  # (from the tail's tip to the nose)
    best = np.full(len(V), 1e9); along = np.zeros(len(V)); dn = np.zeros((len(V), 3))
    seg = np.linalg.norm(np.diff(C, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)])
    for k in range(len(C) - 1):
        dd, t = seg_dist(V, C[k], C[k + 1]); m = dd < best; best[m] = dd[m]; along[m] = (cum[k] + t[m] * seg[k]) / cum[-1]
        tdir = nrm(C[k + 1] - C[k]); down = nrm(v3(0, tdir[2], -tdir[1])) if abs(tdir[0]) < 0.999 else v3(0, -1, 0)
        if down[1] > 0: down = -down
        dn[m] = down
    nd = np.einsum('ij,ij->i', N, dn)
    legw = W[:, LEGB].sum(1)
    belly = dsm(0.3, 0.75, nd) * np.clip(1 - legw * 1.4, 0, 1)
    back = dsm(0.55, 0.92, -nd) * np.clip(1 - legw * 1.4, 0, 1)
    q = lambda a: np.clip(np.round(np.asarray(a) * 255), 0, 255).astype(np.uint8)
    r1 = r1.copy(); r2 = r2.copy(); r1[:, 0] = q(belly); r2[:, 0] = q(along); r2[:, 2] = q(back); r2[:, 3] = 0
    return r1, r2
# ------------------------------ the swimmers of the sea (D-267) ------------------------------
# The dolphin, the orca, the whale and the shark: one spindle of a body along +Z, the snout at +L/2, the tail at -L/2, its
# belly at y = 0. The bones run down it as a chain from the head to the flukes — head, neck2..0 (the front of the body, to
# bend it), chest, spine, root (the middle: the body turns about it), tail0..3 (the stock and the flukes) —; the pectoral
# fins are the forelegs (fl*), the shark's pelvic fins the hind legs (hl*); the jaw opens. Measures as fractions of L.
SWIM_S = {'head': 0.15, 'neck2': 0.2, 'neck1': 0.25, 'neck0': 0.3, 'chest': 0.36, 'spine': 0.44, 'root': 0.52,
          'tail0': 0.62, 'tail1': 0.71, 'tail2': 0.8, 'tail3': 0.88}
LEGS = np.array([b_[:2] in ('fl', 'hl') for b_ in BONES]); TAILS3 = np.array([b_ == 'tail3' for b_ in BONES])


def fin(b, pts, radii, bone, flat_axis, thick, k=0.0, tau=None, op='u'):
    """A fin: flat round cones through the points (the chord at each its radius), its thickness a part of the chord — never
    thinner than the clay's grid can hold."""
    h = b.meta.get('h', 0.01)
    for q in range(len(pts) - 1):
        ra, rb = radii[q], radii[q + 1]; f = max(thick, 1.25 * h / max(min(ra, rb), 1e-4))
        b.add(RoundCone(pts[q], pts[q + 1], ra, rb, flat=(flat_axis, min(1.0, f))), bone[q] if isinstance(bone, list) else bone, k=k, tau=tau, op=op)


def swim(b, R=0.1, Wr=0.9, maxAt=0.36, nose=0.4, p1=0.7, p2=1.6, ped=0.1, pedW=0.42, headW=1.0, belly=0.08,
         head='beak', beakL=0.06, beakR=0.2, melon=1.0, eyeR=0.01, eyeAt=0.13, eyeUp=0.12, mouth=True, jaw=False, teeth=0, blow=1,
         dorsal=None, dorsal2=None, anal=None, pect=None, pelvic=None, flukes=None, caudal=None, keel=0.0, knobs=0, gills=0,
         pattern='plain', pectTip=0.1, droop=0.0, **kw):
    """A swimmer: its body's radius along it (rising from the snout to the widest at maxAt, falling to the stock), squeezed
    sideways (Wr; the stock thin as a blade, pedW; the shark's head broad, headW), its belly rounder than its back; the
    head — a beak before a melon (the dolphin), blunt (the orca), the whale's long flat rostrum, the shark's cone with
    the mouth under it —; the fins (dorsal, its second and the anal; the pectorals; the pelvics), the flukes or the shark's
    tail, the eyes, the blowhole, the mouth's line. Fin tuples: dorsal (at, height, base, rake back), pect (at, length,
    chord, down°, back°), pelvic (at, length, chord), flukes (span, chord, sweep), caudal (upper, lower, their angles°)."""
    L = b.L; Rm = R * L; yc = Rm * (1.0 + belly * 0.5)
    b.meta.setdefault('h', float(np.clip(Rm * 2 * 0.0105, 0.0025, 0.03)))
    zs = lambda s: L / 2 - s * L
    def prof(s):
        if s < maxAt: return nose + (1 - nose) * np.sin(np.pi / 2 * s / maxAt) ** p1
        u = min(1.0, (s - maxAt) / (0.95 - maxAt)); return ped + (1 - ped) * max(0.0, np.cos(np.pi / 2 * u)) ** p2
    def wid(s):  # (the breadth over the depth: the stock a blade, the shark's head broad)
        w = Wr + (pedW - Wr) * float(np.clip((s - 0.55) / 0.35, 0, 1)) ** 1.2
        return w + (headW - w) * float(np.clip((0.22 - s) / 0.18, 0, 1))
    def ax(s):  # (the body's middle, a little low where the belly bulges; the whale's head sloping down to its snout, droop)
        return v3(0, yc - Rm * belly * prof(s) * np.sin(np.pi * np.clip((s - 0.1) / 0.6, 0, 1)) - Rm * droop * np.clip((0.3 - s) / 0.3, 0, 1) ** 1.5, zs(s))
    b.meta['swim'] = dict(R=round(Rm, 4), yc=round(yc, 4), top=round(yc + Rm * 0.95, 4), beat='h' if caudal else 'v')
    b.meta['pattern'] = pattern
    for bn, s in SWIM_S.items(): b.j(bn, ax(s))
    names = list(SWIM_S.keys()); ss = list(SWIM_S.values())
    def owner(s):
        for q in range(len(ss) - 1):
            if s < (ss[q] + ss[q + 1]) / 2: return names[q]
        return names[-1]
    s0 = beakL if head == 'beak' else 0.07 if head == 'shark' else 0.0   # (where the spindle begins: behind the beak, behind the shark's snout)
    S = sorted(set([s for s in [s0, s0 + 0.03, 0.08, 0.13, 0.19, 0.26, 0.34, 0.43, 0.52, 0.62, 0.71, 0.8, 0.87, 0.92] if s >= s0]))
    tau = max(0.012, Rm * 0.25)
    for q in range(len(S) - 1):
        a, c = S[q], S[q + 1]; ra, rc = prof(a) * Rm, prof(c) * Rm
        b.add(RoundCone(ax(a), ax(c), ra, rc, flat=((1, 0, 0), (wid(a) + wid(c)) / 2)), owner((a + c) / 2), k=Rm * 0.06, tau=tau)
    # --- the head
    if head == 'beak':  # (the melon over the forehead, the beak before it, the lower jaw a little longer)
        rm = prof(s0 + 0.03) * Rm; mel = ax(s0 + 0.045) + v3(0, rm * 0.2 * melon, 0)
        b.add(Ellipsoid(mel, (rm * 0.8 * wid(0.05), rm * 0.82, beakL * L * 0.62)), 'head', k=Rm * 0.2, tau=tau)
        tip = v3(0, yc - Rm * 0.22, L / 2); base = ax(s0 + 0.01) + v3(0, -Rm * 0.2, 0)
        b.add(RoundCone(base, tip, beakR * Rm * 1.0, beakR * Rm * 0.5, flat=((1, 0, 0), 0.82)), 'head', k=Rm * 0.08, tau=tau)
        b.add(RoundCone(base + v3(0, -beakR * Rm * 0.4, -beakL * L * 0.1), tip + v3(0, -beakR * Rm * 0.36, beakR * Rm * 0.18), beakR * Rm * 0.85, beakR * Rm * 0.42, flat=((1, 0, 0), 0.82)), 'head', k=Rm * 0.06, tau=tau)
        nose_p = tip + v3(0, 0, beakR * Rm * 0.5)
    elif head == 'whale':  # (the long flat rostrum, the lower jaw bowed under it and a little beyond)
        top = ax(0.02) + v3(0, Rm * 0.18, 0); bk = ax(0.24) + v3(0, Rm * 0.45, 0)
        b.add(ell_between(top + v3(0, 0, L * 0.015), bk, Rm * 0.55, Rm * 0.32), 'head', k=Rm * 0.35, tau=tau)
        jb = ax(0.03) + v3(0, -Rm * 0.25, L * 0.01); jk = ax(0.26) + v3(0, -Rm * 0.35, 0)
        b.add(ell_between(jb, jk, Rm * 0.62, Rm * 0.5, extra=1.05), 'jaw' if jaw else 'head', k=Rm * 0.3, tau=tau)
        nose_p = v3(0, yc, L / 2)
    elif head == 'shark':  # (the cone of the snout, a little flat; the jaws under it)
        sn = v3(0, yc + Rm * 0.08, L / 2 - L * 0.004)
        b.add(RoundCone(ax(0.13) + v3(0, Rm * 0.05, 0), sn, prof(0.13) * Rm * 0.9, Rm * 0.09, flat=((0, 1, 0), 0.78)), 'head', k=Rm * 0.25, tau=tau)
        jb = ax(0.08) + v3(0, -Rm * 0.42, 0); jk = ax(0.15) + v3(0, -Rm * 0.48, 0)
        b.add(ell_between(jb, jk, Rm * 0.5 * headW, Rm * 0.28, extra=1.25), 'jaw' if jaw else 'head', k=Rm * 0.2, tau=tau * 0.6)
        nose_p = sn + v3(0, 0, Rm * 0.1)
    else:  # blunt (the orca): a round cone of a head, a little melon over it
        sn = v3(0, yc - Rm * 0.1, L / 2)
        b.add(RoundCone(ax(0.08), sn, prof(0.08) * Rm, Rm * 0.32, flat=((1, 0, 0), wid(0.05))), 'head', k=Rm * 0.25, tau=tau)
        b.add(Ellipsoid(ax(0.05) + v3(0, Rm * 0.12 * melon, 0), (Rm * 0.48 * wid(0.05), Rm * 0.5, L * 0.06)), 'head', k=Rm * 0.25, tau=tau)
        if jaw: b.add(ell_between(ax(0.02) + v3(0, -Rm * 0.32, 0), ax(0.13) + v3(0, -Rm * 0.45, 0), Rm * 0.45, Rm * 0.28), 'jaw', k=Rm * 0.15, tau=tau * 0.6)
        nose_p = sn + v3(0, 0, Rm * 0.3)
    b.meta['nose'] = list(nose_p)
    b.j('jaw', ax(eyeAt + 0.02) + v3(0, -Rm * 0.35, 0))
    # the mouth's line: a slit from the snout back to the gape, rising at its end (the dolphin's smile); the shark's crescent under
    if mouth:
        g = ax(eyeAt + 0.015) + v3(0, -Rm * (0.3 if head != 'shark' else 0.55), 0)
        for sd in (1, -1):
            if head == 'shark':
                pts = [v3(0, yc - Rm * 0.62, zs(0.06)), v3(sd * Rm * 0.38 * headW, yc - Rm * 0.6, zs(0.09)), g + v3(sd * Rm * 0.62 * headW, 0, 0)]
            elif head == 'beak':
                tip = v3(0, yc - Rm * 0.18, L / 2)
                pts = [tip + v3(sd * beakR * Rm * 0.15, -beakR * Rm * 0.42, -beakR * Rm * 0.1), ax(s0) + v3(sd * beakR * Rm * 0.95, -Rm * 0.34, 0), g + v3(sd * prof(eyeAt) * Rm * wid(eyeAt) * 0.8, Rm * 0.12, 0)]
            else:
                lo = 0.78 if head == 'whale' else 0.65
                pts = [nose_p + v3(sd * Rm * 0.05, -Rm * 0.36, -Rm * 0.25), ax(0.06) + v3(sd * Rm * lo * 0.8, -Rm * 0.36, 0), g + v3(sd * prof(eyeAt) * Rm * wid(eyeAt) * 0.82, Rm * 0.05, 0)]
            for q in range(len(pts) - 1):
                b.cut(RoundCone(pts[q], pts[q + 1], max(Rm * 0.035, b.meta['h'] * 1.6), max(Rm * 0.03, b.meta['h'] * 1.4), flat=((0, 1, 0), 0.4)), k=Rm * 0.02)
    # the eyes, a little above the mouth's corner; the blowhole on top behind the forehead
    ez = eyeAt; er = eyeR * L; ep = ax(ez); rr = prof(ez) * Rm
    ex = rr * wid(ez) * 0.94; ey = ep[1] + rr * eyeUp
    b.add(Sphere((ex * 0.9, ey, ep[2]), er * 1.5), 'head', k=er * 1.2, tau=tau)   # (the socket's bulge)
    b.add(Sphere((-ex * 0.9, ey, ep[2]), er * 1.5), 'head', k=er * 1.2, tau=tau)
    eyes(b, v3(ex * 0.9 + er * 0.75, ey, ep[2]), er)
    b.meta['eye'] = [float(ex), float(ey), float(ep[2])]
    if blow:
        bz = (0.17 if head == 'beak' else 0.12 if head == 'blunt' else 0.22); bp = ax(bz) + v3(0, prof(bz) * Rm * 0.98, 0)
        for sd in ((0,) if blow == 1 else (1, -1)):
            b.cut(Ellipsoid(bp + v3(sd * Rm * 0.06, 0, 0), (Rm * (0.07 if blow == 1 else 0.035), Rm * 0.05, Rm * (0.025 if blow == 1 else 0.06))), k=Rm * 0.02)
        if blow == 2: b.add(Ellipsoid(bp + v3(0, Rm * 0.01, Rm * 0.12), (Rm * 0.12, Rm * 0.05, Rm * 0.06)), 'head', k=Rm * 0.05, tau=tau)
        b.meta['swim']['blow'] = [0.0, float(bp[1]), float(bp[2])]
    if knobs:  # (the humpback's knobs on its rostrum and its jaw)
        for k in range(knobs):
            s = 0.025 + k * 0.17 / knobs
            for sd in ((0,) if k % 2 == 0 else (1, -1)):
                b.add(Sphere(ax(s) + v3(sd * Rm * 0.22, Rm * (0.42 + 0.1 * s / 0.2), 0), Rm * 0.05), 'head', k=Rm * 0.04, tau=tau)
            for sd in (1, -1):
                b.add(Sphere(ax(s + 0.01) + v3(sd * Rm * 0.48, -Rm * 0.38, 0), Rm * 0.045), 'jaw' if jaw else 'head', k=Rm * 0.04, tau=tau)
    # --- the dorsal fin (and the shark's second, its anal): rising from the back, swept back, its trailing edge hollow
    def back_fin(spec, up=1):
        at, ht, base, rake = spec; ht *= L; base *= L
        p0 = ax(at) + v3(0, up * prof(at) * Rm * 0.82, 0)
        P = [p0, p0 + v3(0, up * ht * 0.4, -ht * rake * 0.18), p0 + v3(0, up * ht * 0.75, -ht * rake * 0.58), p0 + v3(0, up * ht, -ht * rake)]
        fin(b, P, [base * 0.5, base * 0.36, base * 0.2, base * 0.06], owner(at), (1, 0, 0), 0.16, k=Rm * 0.08, tau=tau * 0.6)
        return P[-1]
    if dorsal: b.meta['swim']['fin'] = [float(x) for x in back_fin(dorsal)]
    if dorsal2: back_fin(dorsal2)
    if anal: back_fin(anal, up=-1)
    # --- the pectoral fins: from low on the flank, out, down and back — a flat paddle (the whale's long, its edge knobbed)
    if pect:
        at, ln, chd, dn, bk = pect; ln *= L; chd *= L; dn, bk = np.radians(dn), np.radians(bk)
        for sd, s in ((1, 'L'), (-1, 'R')):
            rr = prof(at) * Rm; p0 = ax(at) + v3(sd * rr * wid(at) * 0.6, -rr * 0.5, 0)
            d = nrm(v3(sd * np.cos(dn) * np.cos(bk), -np.sin(dn), -np.cos(dn) * np.sin(bk)))
            n = nrm(np.cross(d, v3(0, 0, 1))); n = n if n[1] > 0 else -n
            P = [p0, p0 + d * ln * 0.3, p0 + d * ln * 0.68 + v3(0, 0, -ln * 0.06), p0 + d * ln + v3(0, 0, -ln * 0.12)]
            for q, bn in enumerate(('fl%s0' % s, 'fl%s1' % s, 'fl%s2' % s, 'fl%s3' % s)): b.j(bn, P[q])
            fin(b, P, [chd * 0.42, chd * 0.5, chd * (0.36 + pectTip * 0.6), chd * pectTip], ['fl%s0' % s, 'fl%s1' % s, 'fl%s2' % s], n, 0.2, k=Rm * 0.06, tau=tau * 0.5)
            fw = nrm(np.cross(n, d)); fw = fw if fw[2] > 0 else -fw
            for k in range(knobs // 2):  # (the bumps of its leading edge)
                t = 0.15 + 0.8 * k / max(1, knobs // 2 - 1); qq = lerp(P[0], P[3], t)
                b.add(Sphere(qq + fw * chd * (0.44 - 0.32 * t), chd * 0.075), 'fl%s2' % s if t > 0.6 else 'fl%s1' % s, k=chd * 0.06, tau=tau * 0.5)
    if pelvic:
        at, ln, chd = pelvic; ln *= L; chd *= L
        for sd, s in ((1, 'L'), (-1, 'R')):
            rr = prof(at) * Rm; p0 = ax(at) + v3(sd * rr * wid(at) * 0.45, -rr * 0.72, 0)
            d = nrm(v3(sd * 0.55, -0.45, -1)); P = [p0, p0 + d * ln * 0.55, p0 + d * ln]
            for q, bn in enumerate(('hl%s0' % s, 'hl%s1' % s, 'hl%s2' % s, 'hl%s3' % s)): b.j(bn, P[min(q, 2)])
            fin(b, P, [chd * 0.45, chd * 0.3, chd * 0.06], ['hl%s0' % s, 'hl%s1' % s], v3(0, 1, 0.3), 0.2, k=Rm * 0.05, tau=tau * 0.5)
    # --- the tail: the flukes (the cetaceans, flat and swept back, notched in the middle) or the shark's (upright, the upper
    # lobe longer: the backbone runs into it), the keels of the stock
    t3 = ax(0.92)
    if flukes:
        span, chd, sweep = flukes; span *= L; chd *= L
        for sd in (1, -1):
            P = [t3 + v3(0, 0, chd * 0.1), t3 + v3(sd * span * 0.2, 0, -sweep * span * 0.12), t3 + v3(sd * span * 0.38, 0, -sweep * span * 0.3), t3 + v3(sd * span * 0.5, 0, -sweep * span * 0.55)]
            fin(b, P, [chd * 0.42, chd * 0.48, chd * 0.32, chd * 0.06], 'tail3', (0, 1, 0), 0.15, k=Rm * 0.05, tau=tau * 0.6)
        b.cut(Ellipsoid(t3 + v3(0, 0, -chd * 0.62), (span * 0.035, chd * 0.2, chd * 0.14)), k=chd * 0.05)   # (the notch)
        b.meta['swim']['tail'] = [0.0, float(t3[1]), float(t3[2] - sweep * span * 0.55)]
    if caudal:
        up, lo, au, al = caudal; up *= L; lo *= L; au, al = np.radians(au), np.radians(al)
        t3s = ax(0.86); du = nrm(v3(0, np.sin(au), -np.cos(au))); dl = nrm(v3(0, -np.sin(al), -np.cos(al)))
        cu = Rm * 0.44
        b.add(Ellipsoid(t3s + v3(0, 0, -up * 0.16), (Rm * 0.05, Rm * 0.62, up * 0.2), rot_x(-0.15)), 'tail3', k=Rm * 0.06, tau=tau * 0.6)   # (the web between the lobes)
        Pu = [t3s, t3s + du * up * 0.35 + v3(0, 0, -up * 0.04), t3s + du * up * 0.72 + v3(0, 0, -up * 0.1), t3s + du * up + v3(0, 0, -up * 0.12)]
        fin(b, Pu, [cu, cu * 0.75, cu * 0.45, cu * 0.1], 'tail3', (1, 0, 0), 0.14, k=Rm * 0.05, tau=tau * 0.6)
        Pl = [t3s, t3s + dl * lo * 0.45, t3s + dl * lo * 0.8 + v3(0, 0, -lo * 0.06), t3s + dl * lo + v3(0, 0, -lo * 0.08)]
        fin(b, Pl, [cu * 0.9, cu * 0.7, cu * 0.4, cu * 0.1], 'tail3', (1, 0, 0), 0.14, k=Rm * 0.05, tau=tau * 0.6)
        b.meta['swim']['tail'] = [0.0, float(Pu[-1][1]), float(Pu[-1][2])]
    if keel:  # (the keels along the stock's sides)
        for sd in (1, -1): b.add(ell_between(ax(0.8) + v3(sd * prof(0.84) * Rm * pedW * 0.9, 0, 0), ax(0.89) + v3(sd * prof(0.88) * Rm * pedW * 0.9, 0, 0), Rm * 0.06 * keel, Rm * 0.025), 'tail3', k=Rm * 0.04, tau=tau * 0.5)
    # the teeth: a row along each jaw, seen when the mouth opens
    if teeth:
        pr = []
        for sd in (1, -1):
            for k in range(teeth):
                t = (k + 0.5) / teeth
                if head == 'shark':
                    up_ = lerp(v3(sd * Rm * 0.08, yc - Rm * 0.56, zs(0.065)), v3(sd * Rm * 0.6 * headW, yc - Rm * 0.5, zs(eyeAt + 0.01)), t)
                    lo_ = lerp(v3(sd * Rm * 0.1, yc - Rm * 0.7, zs(0.075)), v3(sd * Rm * 0.58 * headW, yc - Rm * 0.62, zs(eyeAt + 0.01)), t)
                else:
                    up_ = lerp(nose_p + v3(sd * Rm * 0.12, -Rm * 0.36, -Rm * 0.3), ax(eyeAt) + v3(sd * prof(eyeAt) * Rm * 0.72, -Rm * 0.3, 0), t)
                    lo_ = up_ + v3(0, -Rm * 0.08, -Rm * 0.04)
                th = Rm * (0.07 if head == 'shark' else 0.05) * (1.1 - 0.4 * t)
                pr.append((RoundCone(up_ + v3(0, th * 0.4, 0), up_ + v3(0, -th, 0), th * 0.45, th * 0.06), 'head'))
                pr.append((RoundCone(lo_ + v3(0, -th * 0.4, 0), lo_ + v3(0, th * 0.9, 0), th * 0.4, th * 0.06), 'jaw' if jaw else 'head'))
        b.piece('dentes', 'marfim', pr, 90, far=0, h=max(0.002, Rm * 0.012))
    b.meta['gills'] = gills; b.meta['eyeAt'] = eyeAt
    b.meta['family'] = 'swim'; b.meta['p'] = dict(headL=0.18 * L / max(b.H, 1e-3))
    b.meta['paint'] = swim_paint
    for s in ('L', 'R'):  # (what a swimmer lacks keeps its bone where its parent is: the hind legs at the root)
        for k in range(4):
            if 'hl%s%d' % (s, k) not in b.J: b.j('hl%s%d' % (s, k), b.J['root'])
    return b


def swim_paint(b, V, N, W, r1, r2):
    """What the sea's coat reads of each point (the shader's f3sea): reg.x the belly's side of the line (0.5 on it — a
    signed distance, so the line stays where it is drawn whatever the triangles), reg.y how far out along a pectoral fin,
    reg.w the orca's grey saddle, reg2.y the stripes' place (the shark's gill slits, the whale's throat grooves) and reg2.w
    where they are, reg2.z the dark cape down the back; reg.z (the snout) and reg2.x (along the tail) as the land's."""
    L = b.L; sw = b.meta['swim']; Rm = sw['R']; yc = sw['yc']; kind = b.meta.get('pattern', 'plain')
    s = (L / 2 - V[:, 2]) / L                                    # (along the body: 0 the snout, 1 the tail's end)
    y = V[:, 1] - yc; x = V[:, 0]
    phi = np.arctan2(np.abs(x), -y)                             # (round the body from the keel: 0 under, π on top)
    rad = np.maximum(np.hypot(x, y), Rm * 0.05)
    finw = np.clip(W[:, LEGS].sum(1), 0, 1)
    def band(lo, hi, u): return np.clip((u - lo) / max(hi - lo, 1e-6), 0, 1)
    def bump(c, w, u): return np.exp(-((u - c) / w) ** 2)
    # the line's height round the body (radians from the keel), by where along it
    if kind == 'orca':  # (the white chin and throat, narrow between the fins, the belly, the flank's lobe up behind the fin)
        th = 1.25 * band(0.0, 0.03, s) * (1 - band(0.1, 0.2, s)) + 0.5 * band(0.12, 0.2, s) * (1 - band(0.8, 0.86, s)) \
            + 1.15 * bump(0.66, 0.08, s) * band(0.5, 0.62, s) - 0.25 * bump(0.33, 0.05, s)
    elif kind == 'shark':  # (high and ragged down the flank, lower toward the tail)
        th = 1.45 + 0.12 * np.sin(s * 47.0 + 1.0) + 0.07 * np.sin(s * 113.0) - 0.35 * band(0.6, 0.9, s) - 0.5 * band(0.0, 0.08, 0.08 - s)
    elif kind == 'whale':  # (the pale belly, its edge mottled, gone toward the tail)
        th = 1.05 + 0.18 * np.sin(s * 31.0) * band(0.2, 0.7, s) + 0.08 * np.sin(s * 87.0) - 0.6 * band(0.62, 0.85, s)
    else:  # (the dolphin: the pale belly up the flanks, a little higher by the head)
        th = 1.2 + 0.2 * band(0.0, 0.2, 0.25 - s) - 0.45 * band(0.65, 0.9, s)
    d = (th - phi) * rad                                          # (metres along the skin, + on the belly's side)
    if kind == 'orca':  # (the white over its eye: an oval above and behind it, rising toward the back)
        e = np.array(b.meta['eye']); c = e + np.array([0, Rm * 0.22, -L * 0.065])
        u = V[:, 2] - c[2]; vv = (V[:, 1] - c[1]) + u * 0.28; ww = np.abs(V[:, 0]) - c[0]
        de = (1 - np.sqrt((u / (L * 0.066)) ** 2 + (vv / (Rm * 0.25)) ** 2 + (np.minimum(ww, 0) / (Rm * 0.6)) ** 2)) * Rm * 0.25
        d = np.maximum(d, np.where(finw < 0.3, de, -Rm))
    # (the fins: the pectorals' top as the back, their underside as the belly — the whale's all pale, the orca's all dark; the
    # flukes' underside pale for the whale and the orca)
    sgn = np.where(N[:, 1] < 0, 1.0, -1.0)
    under_fin = sgn * Rm * 0.3
    if kind == 'whale': under_fin = np.full(len(V), Rm * 0.3)
    if kind == 'orca': under_fin = np.full(len(V), -Rm * 0.3)
    d = np.where(finw > 0.55, under_fin, d)
    fl = (W[:, TAILS3].sum(1) > 0.6) & (s > 0.9)
    d = np.where(fl, (sgn if kind in ('whale', 'orca') else -1.0) * Rm * 0.3, d)
    wq = 2.0 * Rm                                                 # (the scale of the signed distance: half of it either side)
    r1[:, 0] = np.clip(np.round((0.5 + d / (2 * wq)) * 255), 0, 255).astype(np.uint8)
    # how far out along a pectoral fin (its tip painted)
    J = b.bones_filled(); out = np.zeros(len(V))
    for sd, sname in ((1, 'L'), (-1, 'R')):
        a = J['fl%s0' % sname]; t = J['fl%s3' % sname]; ab = t - a; ln = max(float(np.linalg.norm(ab)), 1e-6)
        u = np.clip((V - a) @ ab / (ln * ln), 0, 1); out = np.where((np.sign(V[:, 0]) == sd) & (finw > 0.3), np.maximum(out, u), out)
    r1[:, 1] = np.clip(np.round(out * 255), 0, 255).astype(np.uint8)
    # the orca's saddle: grey over the back behind the fin
    sad = bump(0.56, 0.05, s) * band(2.2, 2.7, phi) * (finw < 0.3) if kind == 'orca' else np.zeros(len(V))
    r1[:, 3] = np.clip(np.round(sad * 255), 0, 255).astype(np.uint8)
    # the stripes: the shark's five slits before the pectorals; the whale's grooves under its throat and chest
    st = np.zeros(len(V)); sm_ = np.zeros(len(V))
    if b.meta.get('gills'):
        ea = b.meta['eyeAt']; g0, g1 = ea + 0.06, ea + 0.15
        st = np.clip(((s - g0) / (g1 - g0) * 4 + 1) / 25.5, 0, 1)   # (slits at the whole numbers 1..5 of st × 25.5)
        sm_ = band(g0 - 0.012, g0, s) * (1 - band(g1, g1 + 0.012, s)) * bump(1.55, 0.42, phi) * (finw < 0.3)
    if kind == 'whale':
        st = np.clip(phi * 18 / 25.5, 0, 1); sm_ = band(0.02, 0.06, s) * (1 - band(0.42, 0.5, s)) * (1 - band(0.85, 1.0, phi)) * (finw < 0.3)
    r2[:, 1] = np.clip(np.round(st * 255), 0, 255).astype(np.uint8); r2[:, 3] = np.clip(np.round(sm_ * 255), 0, 255).astype(np.uint8)
    # the cape: darker down the back from the forehead past the fin (the dolphin's; the others' a breath of it)
    cape = band(2.0, 2.75, phi) * band(0.08, 0.16, s) * (1 - band(0.55, 0.72, s)) * (finw < 0.3)
    r2[:, 2] = np.clip(np.round(cape * 255), 0, 255).astype(np.uint8)
    return r1, r2


# ------------------------------ the sea turtle (D-267) ------------------------------
def turtle(b, shellL=0.74, shellW=0.6, domeH=0.17, plastH=0.06, headL=0.15, neckL=0.1, flipL=0.5, flipC=0.2, hindL=0.18, **kw):
    """The sea turtle: the shell (a piece of its own, zone 'casca': the domed carapace, narrowing behind, over the flat
    plastron; its scutes painted by where each point is on it), the head with its horny beak and big eyes on a short
    neck, the long front flippers swept back like wings, the small round hind ones, the stub of the tail. The body's bones
    hold still under the shell; the neck's and the flippers' move. Measures as fractions of L (beak to tail)."""
    L = b.L; Ls = shellL * L; Wd = shellW * L; Hd = domeH * L; Hp = plastH * L
    yr = Hp * 1.15 + 0.01; zc = -L * 0.06                     # (the shell's rim: its height and its middle along the body)
    b.meta.setdefault('h', float(np.clip(Ls * 0.0075, 0.0025, 0.02)))
    root = b.j('root', (0, yr, zc - Ls * 0.18)); b.j('spine', (0, yr, zc)); b.j('chest', (0, yr, zc + Ls * 0.22))
    # the shell: one solid, the dome over the rim and the flatter plastron under it, narrowing toward the tail, a ridge down
    # the middle of the back
    def shell(P):
        x, y, z = P[:, 0], P[:, 1] - yr, P[:, 2] - zc
        zn = np.clip(z / (Ls / 2), -1.3, 1.3)
        w = Wd / 2 * (1 - 0.3 * np.clip(-zn, 0, 1) ** 1.6) * (1 - 0.08 * np.clip(zn, 0, 1) ** 2)
        ht = np.where(y > 0, Hd * (1 - 0.18 * np.clip(-zn, 0, 1)) * (1 + 0.06 * np.exp(-(x / (Wd * 0.08)) ** 2)), Hp)
        q = np.stack([x / w, y / ht, z / (Ls / 2)], 1); k0 = np.linalg.norm(q, axis=1)
        return (k0 - 1) * np.minimum(np.minimum(w, ht), Ls / 2) * 0.92
    from corpo_sdf import Custom
    sh = Custom(shell, ((-Wd / 2 - 0.02, yr - Hp - 0.02, zc - Ls / 2 - 0.02), (Wd / 2 + 0.02, yr + Hd * 1.1 + 0.02, zc + Ls / 2 + 0.02)))
    b.piece('casca', 'casca', [(sh, 'spine')], 300, far=60, h=b.meta['h'] * 1.1)
    b.pieces[-1]['paint'] = lambda V, N: shell_paint(V, N, yr, zc, Ls, Wd)
    b.meta['shell'] = dict(yr=yr, zc=zc, L=Ls, W=Wd, H=Hd)
    # (what the shell hides: a core the limbs and the neck grow from)
    tau = max(0.01, Ls * 0.05)
    b.add(Ellipsoid((0, yr + Hd * 0.25, zc), (Wd * 0.33, Hd * 0.5, Ls * 0.38)), 'spine', k=Ls * 0.05, tau=tau)
    # the neck and the head: out of the shell's front, the head a little down, the beak a piece of horn, the eyes big
    n0 = b.j('neck0', (0, yr + Hd * 0.1, zc + Ls * 0.4)); n1 = b.j('neck1', (0, yr + Hd * 0.12, zc + Ls * 0.4 + neckL * L * 0.4))
    n2 = b.j('neck2', (0, yr + Hd * 0.13, zc + Ls * 0.4 + neckL * L * 0.75)); hd = b.j('head', (0, yr + Hd * 0.14, zc + Ls * 0.4 + neckL * L))
    hl = headL * L; nr = hl * 0.36
    b.add(RoundCone(n0 - v3(0, 0, Ls * 0.06), n1, nr * 1.25, nr * 1.08, flat=((0, 1, 0), 0.8)), 'neck0', k=nr * 0.4, tau=tau)
    b.add(RoundCone(n1, n2, nr * 1.08, nr, flat=((0, 1, 0), 0.82)), 'neck1', k=nr * 0.3, tau=tau)
    b.add(RoundCone(n2, hd, nr, nr * 0.95, flat=((0, 1, 0), 0.85)), 'neck2', k=nr * 0.3, tau=tau)
    hc = hd + v3(0, hl * 0.06, hl * 0.42)
    b.add(Ellipsoid(hc, (hl * 0.36, hl * 0.3, hl * 0.48)), 'head', k=hl * 0.15, tau=tau)
    b.add(Ellipsoid(hc + v3(0, hl * 0.1, -hl * 0.05), (hl * 0.32, hl * 0.25, hl * 0.4)), 'head', k=hl * 0.12, tau=tau)   # (the crown)
    bk = hc + v3(0, -hl * 0.1, hl * 0.4)
    b.j('jaw', hc + v3(0, -hl * 0.12, -hl * 0.1))
    b.add(Ellipsoid(hc + v3(0, -hl * 0.14, hl * 0.12), (hl * 0.3, hl * 0.14, hl * 0.36)), 'jaw', k=hl * 0.08, tau=tau * 0.5)  # (the lower jaw)
    b.piece('bico', 'bico', [(RoundCone(bk + v3(0, hl * 0.06, -hl * 0.12), bk + v3(0, -hl * 0.06, hl * 0.1), hl * 0.2, hl * 0.07, flat=((1, 0, 0), 0.9)), 'head'),
                             (RoundCone(bk + v3(0, -hl * 0.14, -hl * 0.14), bk + v3(0, -hl * 0.12, hl * 0.04), hl * 0.15, hl * 0.06, flat=((1, 0, 0), 0.9)), 'jaw')], 50, far=10, h=max(0.002, hl * 0.02))
    b.meta['nose'] = list(bk + v3(0, -hl * 0.03, hl * 0.12))
    ec = hc + v3(hl * 0.27, hl * 0.08, hl * 0.18); er = hl * 0.085
    for sd in (1, -1): b.add(Sphere(ec * v3(sd, 1, 1), er * 1.4), 'head', k=er, tau=tau)
    eyes(b, ec + v3(er * 0.55, 0, er * 0.15), er)
    b.meta['eye'] = list(ec)
    # the front flippers: the arm out of the shell, the long blade swept back, flat; the hind ones short and round
    for sd, s in ((1, 'L'), (-1, 'R')):
        sh0 = b.j('fl%s0' % s, (sd * Wd * 0.26, yr - Hp * 0.1, zc + Ls * 0.3)); el = b.j('fl%s1' % s, (sd * Wd * 0.5, yr - Hp * 0.25, zc + Ls * 0.33))
        wr = b.j('fl%s2' % s, (sd * (Wd * 0.5 + flipL * L * 0.3), yr - Hp * 0.35, zc + Ls * 0.27)); tip = b.j('fl%s3' % s, (sd * (Wd * 0.5 + flipL * L * 0.85), yr - Hp * 0.5, zc + Ls * 0.02))
        c = flipC * L
        b.add(RoundCone(sh0, el, c * 0.42, c * 0.36, flat=((0, 1, 0), 0.6)), 'fl%s0' % s, k=c * 0.2, tau=tau)
        fin(b, [el, wr, lerp(wr, tip, 0.55), tip], [c * 0.34, c * 0.5, c * 0.36, c * 0.08], ['fl%s1' % s, 'fl%s2' % s, 'fl%s2' % s], (0, 1, 0), 0.18, k=c * 0.15, tau=tau * 0.6)
        hp = b.j('hl%s0' % s, (sd * Wd * 0.2, yr - Hp * 0.2, zc - Ls * 0.32)); kn = b.j('hl%s1' % s, (sd * Wd * 0.32, yr - Hp * 0.3, zc - Ls * 0.46))
        an = b.j('hl%s2' % s, (sd * (Wd * 0.32 + hindL * L * 0.4), yr - Hp * 0.35, zc - Ls * 0.5 - hindL * L * 0.35)); b.j('hl%s3' % s, an)
        hc_ = hindL * L
        b.add(RoundCone(hp, kn, hc_ * 0.3, hc_ * 0.26, flat=((0, 1, 0), 0.6)), 'hl%s0' % s, k=hc_ * 0.15, tau=tau)
        fin(b, [kn, lerp(kn, an, 0.5), an], [hc_ * 0.28, hc_ * 0.42, hc_ * 0.2], ['hl%s1' % s, 'hl%s2' % s], (0, 1, 0), 0.22, k=hc_ * 0.12, tau=tau * 0.6)
    t0 = b.j('tail0', (0, yr - Hp * 0.1, zc - Ls * 0.44)); t1 = b.j('tail1', t0 + v3(0, -Hp * 0.1, -L * 0.07))
    b.j('tail2', t1); b.j('tail3', t1)
    b.add(RoundCone(t0, t1, L * 0.035, L * 0.012), 'tail0', k=L * 0.01, tau=tau * 0.5)
    b.meta['family'] = 'turtle'; b.meta['p'] = dict(headL=hl / max(b.H, 1e-3))
    b.meta['swim'] = dict(R=round((Hd + Hp) / 2, 4), yc=round(yr, 4), top=round(yr + Hd, 4), beat='f')
    return b


def shell_paint(V, N, yr, zc, Ls, Wd):
    """Where each point is on the shell, for its scutes (the shader's f3shell): reg.x across it (0.5 the middle), reg.y
    along it (0 the tail's end, 1 the head's), reg.z the plastron under it, reg.w how near the rim."""
    x, y, z = V[:, 0], V[:, 1] - yr, V[:, 2] - zc
    zn = np.clip(z / (Ls / 2), -1, 1)
    w = Wd / 2 * (1 - 0.3 * np.clip(-zn, 0, 1) ** 1.6) * (1 - 0.08 * np.clip(zn, 0, 1) ** 2)
    u = np.clip(x / w, -1, 1); rim = np.clip(np.sqrt(u ** 2 + zn ** 2), 0, 1)
    under = np.clip((-N[:, 1] - 0.2) / 0.5, 0, 1) * (y < Ls * 0.02)
    q = lambda a: np.clip(np.round(np.asarray(a) * 255), 0, 255).astype(np.uint8)
    return np.stack([q(u * 0.5 + 0.5), q(zn * 0.5 + 0.5), q(under), q(rim)], 1), np.zeros((len(V), 4), np.uint8)
