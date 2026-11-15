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
           muzDrop=0.0, muzFlat=1.0, earFold=0.0, headRot=0.0, snout=0.0, forehead=0.0, neckUp=0.0, muzPos=0.88, stop=0.0, tailHair=0.0, plantF=False, earFace='fwd', flex=False, shag=0.0, udder=0.0)


NECK = 0.55


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
        st = b.j('hl%s1' % s, (X * 1.15, H - Dc * 0.9 + p['hindPost'] * H * 0.1, -L * (0.17 + p['hindPost'] * 0.04)))
        if p['pillar']:
            hk = b.j('hl%s2' % s, (X * 1.05, H * 0.30, -L * 0.30)); hf = b.j('hl%s3' % s, (X * 1.05, H * 0.06, -L * 0.29))
        elif p['plant']:
            hk = b.j('hl%s2' % s, (X, H * 0.12, -L * 0.40)); hf = b.j('hl%s3' % s, (X, H * 0.035, -L * 0.30))
        elif p['dig']:
            hk = b.j('hl%s2' % s, (X, H * 0.27, -L * 0.46)); hf = b.j('hl%s3' % s, (X, H * 0.04, -L * 0.38))
        else:
            hk = b.j('hl%s2' % s, (X, H * 0.31, -L * 0.43)); hf = b.j('hl%s3' % s, (X, H * 0.075, -L * 0.38))
        R = p['legR'] * H; C = p['canR'] * H
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
        foot(b, p, s, 'fl', fe, X, C)
        foot(b, p, s, 'hl', hf, X, C)
    # --- the neck: from the front of the withers, forward and up
    a = np.radians(p['neckA']); nd = v3(0, np.sin(a), np.cos(a)); nL = p['neckL'] * H
    n0 = b.j('neck0', (0, H - Dc * 0.3, L * 0.38)); n1 = b.j('neck1', n0 + nd * nL * 0.36 + v3(0, nL * p['neckUp'] * 0.05, 0))
    n2 = b.j('neck2', n0 + nd * nL * 0.7 + v3(0, nL * p['neckUp'] * 0.08, 0)); poll = b.j('head', n0 + nd * nL)
    r0 = p['neckR0'] * Dc * NECK; r1 = p['neckR1'] * Dc * NECK  # (neckR: the neck's depth over the chest's, at its base and at the head)
    fl = ((1, 0, 0), p['neckFlat'])
    b.add(RoundCone(n0 - nd * r0 * 0.4 + v3(0, -r0 * 0.15, 0), n1, r0, lerp(r0, r1, 0.45), flat=fl), 'neck0', k=r0 * 0.6, tau=tau)
    b.add(RoundCone(n1, n2, lerp(r0, r1, 0.45), lerp(r0, r1, 0.8), flat=fl), 'neck1', k=r1 * 0.5, tau=tau)
    b.add(RoundCone(n2, poll, lerp(r0, r1, 0.8), r1, flat=fl), 'neck2', k=r1 * 0.5, tau=tau)
    if p['crest']:  # (a crest along the neck's top: the stallion's, the bull's)
        b.add(ell_between(n0 + v3(0, r0 * 0.7, 0), poll + v3(0, r1 * 0.6, 0), r1 * 0.55, r0 * p['crest']), 'neck1', k=r1 * 0.6, tau=tau)
    head(b, p, poll, Dc)
    tail(b, p, Hc, Dh, L)
    b.meta['family'] = 'quad'; b.meta['flex'] = bool(p['flex'])
    return b


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
        if f == 'bearpaw':
            b.add(Ellipsoid((fe[0], C * 0.7, fe[2] - C * 0.2), (C * 1.0, C * 0.7, C * 1.6)), bone, k=C * 0.6)
        if p.get('claws'):
            prims = [(RoundCone((fe[0] + dx * C, C * 0.9, fe[2] + C * 2.1), (fe[0] + dx * C * 1.1, C * 0.15, fe[2] + C * 2.9), C * 0.16, C * 0.05), bone) for dx in (-0.6, -0.2, 0.2, 0.6)]
            b.piece('unha' + leg + s, 'unha', prims, 32, far=0)


def head(b, p, poll, Dc):
    """The head at the poll: the skull, the face down to the muzzle, the cheeks, the jaw, the ears, the eyes."""
    H = b.H; hL = p['headL'] * H; hH = p['headH'] * hL; hW = p['headW'] * hL
    a = np.radians(p['headA']); d = v3(0, -np.sin(a), np.cos(a)); up = v3(0, np.cos(a), np.sin(a))
    tau = max(0.01, H * 0.035)
    sk = poll + d * hL * 0.2 + up * hH * 0.05
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
    # nostrils, and the eye's socket under a brow
    nose = np.array(b.meta['nose'])
    for sd in (1, -1):
        b.cut(Sphere(nose + v3(sd * mr * 0.38, mr * 0.08, -mr * 0.05), mr * 0.16), k=mr * 0.08)
    ec = sk + d * hL * 0.1 + up * hH * 0.12 + v3(hW * 0.43, 0, 0)
    er = p['eyeR'] * H
    if p['brow']:
        for sd in (1, -1): b.add(Ellipsoid(ec * v3(sd, 1, 1) + up * er * 1.1 - d * er * 0.2, (er * 1.4, er * 0.7 * p['brow'], er * 1.6)), 'head', k=er, tau=tau)
    eyes(b, ec + v3(-er * 0.35, 0, 0), er)
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
        b.add(Ellipsoid(c, (eW, eL * 0.52, eT * 1.6), R), 'ear%s' % s, k=eT * 1.5, tau=max(0.006, eL * 0.25))
        if p['earCup'] and p['earFace'] == 'fwd': b.cut(Ellipsoid(c + R[:, 2] * eT * 1.2 + ed * eL * 0.05, (eW * 0.72, eL * 0.42, eT * 1.1), R), k=eT * 0.4)
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
        return
    radii = {'hang': [1, 0.8, 0.6, 0.45, 0.4], 'tuft': [1, 0.7, 0.5, 0.4, 0.35], 'thin': [1, 0.75, 0.55, 0.45, 0.35], 'bushy': [1.0, 1.6, 1.9, 1.7, 0.8],
             'long': [1, 0.85, 0.75, 0.7, 0.6], 'up': [1, 0.85, 0.7, 0.6, 0.5], 'curl': [1, 0.8, 0.6, 0.5, 0.4], 'flat': [0.9, 1.0, 1.0, 1.0, 0.8], 'croc': [1, 0.72, 0.5, 0.3, 0.12]}[t]
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
            upright=False, toes=3, comb=0.0, wattle=0.0, crest=0.0, ruff=0.0, flipper=False, legThick=1.0, eyeR=0.009, disc=0.0, plumes=0.0)


def tilt_bird(b, a, P):
    """Turn what is built of a bird so far (its body, neck, head, tail, wings) up by a about the point P, about X — an eagle,
    an owl, a parrot sit upright on their perch."""
    Rm = rot_x(-a)
    T = lambda q: P + Rm @ (np.asarray(q, float) - P)
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
    if p['disc']: b.add(Ellipsoid(hc + v3(0, 0, hr * 0.5), (hr * 1.15, hr * 1.05, hr * 0.5)), 'head', k=hr * 0.3)  # (the owl's face)
    bk0 = hc + v3(0, -hr * 0.1, hr * 0.85); BL, BR = p['beakL'], p['beakR']; kind = p['beak']
    if kind == 'hook':
        pts = [bk0, bk0 + v3(0, -BL * 0.05, BL * 0.6), bk0 + v3(0, -BL * 0.45, BL * 0.95)]; rr = [BR, BR * 0.6, BR * 0.15]
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
    bprim = [(RoundCone(pts[k], pts[k + 1], rr[k], rr[k + 1], flat=((1, 0, 0), 0.8 if kind not in ('flat',) else 1.3)), 'head') for k in range(2)]
    b.piece('bico', 'bico', bprim, 40 if kind != 'toucan' else 70, far=8, h=max(0.0015, BR * 0.35))
    b.meta['nose'] = list(pts[-1]); b.j('jaw', bk0)
    eyes(b, hc + v3(hr * 0.68, hr * 0.2, hr * 0.42 + (hr * 0.35 if p['disc'] else 0)) - v3(0, 0, 0), p['eyeR'])
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
            b.piece('asa' + s, 'asa', [(ell_between(sh, sh + v3(sd * 0.05, -bh * 1.15, -0.02), bw * 0.32, 0.012), 'fl%s1' % s)], 40, far=8, h=0.003)
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
    if p.get('tilt') and not up and not fly: tilt_bird(b, p['tilt'], v3(0, yb - bh * 0.25, -bL * 0.05))
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
        leg = [(RoundCone(hl + v3(0, lr, 0), ft, lr * p['legThick'], lr * 0.9 * p['legThick']), 'hl%s2' % s)]
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
    b.add(Ellipsoid(hc, (hw * 0.5, R * 0.62, hl * 0.6)), 'head', k=R * 0.7)
    b.add(Ellipsoid(hc + v3(0, -R * 0.08, hl * 0.4), (hw * 0.32, R * 0.48, hl * 0.4)), 'head', k=R * 0.3)
    b.j('jaw', hc); b.meta['nose'] = list(hc + v3(0, 0, hl * 0.8))
    eyes(b, hc + v3(hw * 0.42, R * 0.25, hl * 0.15), R * 0.18)
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
