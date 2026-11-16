# fauna_especies: every kind of the land, the water's edge and the air (js/animals.js DEF) — its family, its measures, its
# horns, antlers, mane, hump, trunk. A kind may share another's mesh (mesh: 'x') at its own scale (scale). Read by fauna.py.
# Measures: H the withers' height (a bird: standing; a snake, a lizard: the body's height), L the body's length, metres;
# the rest as fractions (see fauna_forma.DEF).
import numpy as np
import fauna_forma as FF
from fauna_forma import v3, nrm, lerp, K, Ellipsoid, RoundCone, Sphere, RBox, Plane, frame_from, orient, ell_between

SPECIES = {}


def sp(kind, fam, H, L, **kw):
    SPECIES[kind] = dict(fam=fam, H=H, L=L, **kw)


# ------------------------------ the hoofed ------------------------------
sp('deer', 'quad', 1.12, 1.5, D=0.46, Wr=0.7, legR=0.066, canR=0.03, foot='cloven', neckA=56, neckL=0.56, neckR0=0.38, neckR1=0.2,
   headA=58, headL=0.35, headH=0.42, headW=0.42, muzR=0.36, earL=0.18, earW=0.055, earA=(40, 20), tail='flag', tailL=0.14, tailR=0.04, eyeR=0.028,
   antler='deer', earTip=0.35)
sp('reindeer', 'quad', 1.05, 1.45, D=0.52, Wr=0.76, legR=0.072, canR=0.036, foot='cloven', neckA=40, neckL=0.5, neckR0=0.48, neckR1=0.27,
   headA=52, headL=0.36, headH=0.42, headW=0.42, muzR=0.46, muzFlat=1.1, earL=0.11, earW=0.045, earA=(55, 20), tail='flag', tailL=0.12, tailR=0.05, eyeR=0.025,
   antler='reindeer', withers=0.28, earTip=0.5)
sp('moose', 'quad', 1.85, 2.15, D=0.47, Wr=0.7, legR=0.06, canR=0.03, foot='cloven', neckA=24, neckL=0.4, neckR0=0.56, neckR1=0.36, withers=0.38, rump=0.92,
   headA=58, headL=0.42, headH=0.4, headW=0.38, muzR=0.62, muzDrop=0.35, earL=0.12, earW=0.05, earA=(65, 20), tail='short', tailL=0.08, tailR=0.04, eyeR=0.02,
   antler='moose', bell=1)
sp('muskox', 'quad', 1.3, 1.9, D=0.58, Wr=0.9, legR=0.072, canR=0.04, foot='cloven', neckA=8, neckL=0.28, neckR0=0.62, neckR1=0.46, withers=0.4,
   headA=62, headL=0.36, headH=0.48, headW=0.46, muzR=0.5, earL=0.04, earW=0.03, earA=(70, 20), tail='short', tailL=0.06, tailR=0.04, eyeR=0.016,
   horns='muskox', shag=0.6, earTip=0.6)
sp('bison', 'quad', 1.75, 2.5, D=0.6, Wr=0.84, rump=0.76, hump=0.55, humpZ=0.2, legR=0.075, canR=0.036, foot='cloven', neckA=-6, neckL=0.3, neckR0=0.72, neckR1=0.52,
   headA=72, headL=0.33, headH=0.56, headW=0.6, muzR=0.46, earL=0.05, earW=0.035, earA=(80, 20), tail='tuft', tailL=0.32, tailR=0.02, eyeR=0.016,
   horns='short', mane='bison', earTip=0.6)
sp('ibex', 'quad', 0.85, 1.15, D=0.5, Wr=0.72, legR=0.075, canR=0.036, foot='cloven', neckA=46, neckL=0.45, neckR0=0.48, neckR1=0.3,
   headA=56, headL=0.3, headH=0.44, headW=0.42, muzR=0.4, earL=0.1, earW=0.04, earA=(65, 20), tail='short', tailL=0.08, tailR=0.04, eyeR=0.027,
   horns='ibex', beard=1)
sp('boar', 'quad', 0.85, 1.3, D=0.64, Wr=0.74, rump=0.9, withers=0.38, legR=0.068, canR=0.034, foot='cloven', neckA=0, neckL=0.2, neckR0=0.76, neckR1=0.62,
   headA=32, headL=0.48, headH=0.62, headW=0.52, muzR=0.32, snout=0.35, earL=0.11, earW=0.05, earA=(30, 25), tail='thin', tailL=0.25, tailR=0.02, eyeR=0.016,
   tusks='boar', mane='boar')
sp('capybara', 'quad', 0.55, 1.0, D=0.74, Wr=0.82, rump=1.08, legR=0.085, canR=0.05, foot='paw', dig=True, neckA=14, neckL=0.24, neckR0=0.62, neckR1=0.52,
   headA=14, headL=0.5, headH=0.62, headW=0.5, muzR=0.62, muzPos=0.85, earL=0.05, earW=0.04, earA=(40, 10), tail=None, eyeR=0.026, earTip=1.0)
sp('tapir', 'quad', 1.0, 1.85, D=0.6, Wr=0.75, rump=1.05, legR=0.075, canR=0.04, foot='pad', neckA=20, neckL=0.3, neckR0=0.6, neckR1=0.46,
   headA=42, headL=0.42, headH=0.5, headW=0.44, muzR=0.42, earL=0.08, earW=0.05, earA=(40, 20), tail='short', tailL=0.06, tailR=0.04, eyeR=0.016,
   trunk='tapir', earTip=0.9)
sp('zebra', 'quad', 1.35, 1.75, D=0.5, Wr=0.76, legR=0.066, canR=0.032, foot='hoof', neckA=48, neckL=0.56, neckR0=0.5, neckR1=0.28, crest=0.6,
   headA=56, headL=0.4, headH=0.38, headW=0.36, muzR=0.44, earL=0.14, earW=0.05, earA=(18, 10), tail='tuft', tailL=0.5, tailR=0.022, eyeR=0.025,
   mane='zebra', earTip=0.32)
sp('gazelle', 'quad', 0.75, 0.95, D=0.44, Wr=0.62, legR=0.052, canR=0.022, foot='cloven', neckA=56, neckL=0.58, neckR0=0.36, neckR1=0.2,
   headA=56, headL=0.34, headH=0.42, headW=0.4, muzR=0.35, earL=0.17, earW=0.05, earA=(45, 15), tail='flag', tailL=0.14, tailR=0.03, eyeR=0.032,
   horns='gazelle')
sp('gnu', 'quad', 1.35, 1.85, D=0.56, Wr=0.74, rump=0.84, withers=0.36, legR=0.06, canR=0.03, foot='cloven', neckA=30, neckL=0.42, neckR0=0.55, neckR1=0.32,
   headA=66, headL=0.4, headH=0.42, headW=0.4, muzR=0.56, muzFlat=1.25, earL=0.09, earW=0.04, earA=(70, 15), tail='hang', tailL=0.22, tailR=0.03, tailHair=0.45, eyeR=0.018,
   horns='gnu', mane='gnu', beard=1)
sp('giraffe', 'quad', 3.0, 1.95, D=0.36, Wr=0.66, rump=0.66, withers=0.3, legR=0.042, canR=0.021, foot='cloven', neckA=62, neckL=0.62, neckR0=0.42, neckR1=0.17,
   headA=62, headL=0.2, headH=0.44, headW=0.4, muzR=0.38, earL=0.06, earW=0.022, earA=(75, 10), tail='tuft', tailL=0.32, tailR=0.012, eyeR=0.014,
   ossicones=1, mane='giraffe', earTip=0.35)
sp('elephant', 'quad', 3.0, 2.9, D=0.56, Wr=0.86, rump=0.93, dip=0.05, pillar=True, legR=0.1, canR=0.076, foot='pillar', neckA=12, neckL=0.12, neckR0=0.72, neckR1=0.68,
   headA=24, headL=0.34, headH=0.72, headW=0.7, muzR=0.5, muzPos=0.62, forehead=0.8, earL=0.42, earW=0.23, earT=0.012, earA=(118, 30), earFace='side', earCup=0,
   tail='thin', tailL=0.36, tailR=0.012, eyeR=0.01, trunk='elephant', tusks='elephant', tris=900, earTip=1.0)
sp('rhino', 'quad', 1.7, 2.9, D=0.62, Wr=0.86, pillar=True, legR=0.09, canR=0.062, foot='pillar', neckA=8, neckL=0.2, neckR0=0.66, neckR1=0.56, withers=0.32,
   headA=48, headL=0.5, headH=0.55, headW=0.5, muzR=0.56, earL=0.1, earW=0.04, earA=(30, 20), tail='thin', tailL=0.3, tailR=0.015, eyeR=0.01,
   horns='rhino', folds=1, earTip=0.45)
sp('hippo', 'quad', 1.45, 3.0, D=0.7, Wr=1.0, belly=0.3, pillar=True, legR=0.11, canR=0.085, foot='pillar', neckA=4, neckL=0.16, neckR0=0.8, neckR1=0.74,
   headA=16, headL=0.6, headH=0.46, headW=0.62, muzR=0.62, muzFlat=1.45, muzPos=0.86, earL=0.06, earW=0.03, earA=(30, 10), tail='hippo', tailL=0.22, tailR=0.034, eyeR=0.016,
   eyesHigh=1, earTip=1.0, face='hippo')
sp('buffalo', 'quad', 1.55, 2.45, D=0.6, Wr=0.86, legR=0.075, canR=0.04, foot='cloven', neckA=10, neckL=0.3, neckR0=0.66, neckR1=0.48, withers=0.32,
   headA=56, headL=0.36, headH=0.44, headW=0.46, muzR=0.52, muzFlat=1.15, earL=0.11, earW=0.05, earA=(100, 10), tail='tuft', tailL=0.5, tailR=0.022, eyeR=0.016,
   horns='buffalo')
sp('camel', 'quad', 1.9, 2.15, D=0.42, Wr=0.68, hump=0.72, humpZ=-0.04, legR=0.058, canR=0.032, foot='pad', neckA=28, neckL=0.74, neckR0=0.5, neckR1=0.3, neckUp=0.0,
   headA=30, headL=0.27, headH=0.46, headW=0.42, muzR=0.46, muzDrop=0.15, earL=0.05, earW=0.03, earA=(40, 25), tail='tuft', tailL=0.28, tailR=0.02, eyeR=0.016, brow=1, earTip=0.7, neckS=1.0)
sp('vaca', 'quad', 1.35, 1.8, D=0.58, Wr=0.86, belly=0.32, legR=0.078, canR=0.038, Dh=0.92, haunch=1.15, foot='cloven', neckA=18, neckL=0.42, neckR0=0.5, neckR1=0.3,
   headA=50, headL=0.38, headH=0.42, headW=0.44, muzR=0.5, muzFlat=1.15, earL=0.1, earW=0.05, earA=(80, 10), tail='tuft', tailL=0.62, tailR=0.022,
   eyeR=0.025, horns='cow', withers=0.2, dewlap=0.6, udder=1.0, earTip=0.45)
sp('ovelha', 'quad', 0.75, 1.05, D=0.62, Wr=0.95, legR=0.052, canR=0.026, foot='cloven', neckA=30, neckL=0.3, neckR0=0.6, neckR1=0.44, rump=1.02,
   headA=56, headL=0.36, headH=0.45, headW=0.42, muzR=0.4, earL=0.08, earW=0.035, earA=(95, 10), tail='short', tailL=0.1, tailR=0.05, eyeR=0.028, wool=1, earTip=0.45)
sp('cabra', 'quad', 0.75, 1.0, D=0.5, Wr=0.72, legR=0.056, canR=0.028, foot='cloven', neckA=46, neckL=0.42, neckR0=0.42, neckR1=0.3,
   headA=56, headL=0.34, headH=0.44, headW=0.42, muzR=0.38, earL=0.12, earW=0.045, earA=(72, 20), tail='up', tailL=0.12, tailR=0.03, eyeR=0.027,
   horns='goat', beard=1)
sp('porco', 'quad', 0.75, 1.22, D=0.64, Wr=0.86, belly=0.25, legR=0.06, canR=0.034, foot='cloven', neckA=0, neckL=0.18, neckR0=0.76, neckR1=0.66,
   headA=24, headL=0.42, headH=0.62, headW=0.56, muzR=0.36, snout=0.42, earL=0.12, earW=0.07, earA=(40, -25), earFold=0.5, tail='curl', tailL=0.2, tailR=0.02, eyeR=0.02, earTip=0.3)
sp('cavalo', 'quad', 1.55, 1.8, D=0.48, Wr=0.76, legR=0.066, canR=0.032, foot='hoof', neckA=50, neckL=0.6, neckR0=0.48, neckR1=0.26, crest=0.6,
   headA=58, headL=0.4, headH=0.38, headW=0.36, muzR=0.44, earL=0.1, earW=0.038, earA=(12, 8), tail='hang', tailL=0.3, tailR=0.04, tailHair=0.62, eyeR=0.024,
   mane='horse', earTip=0.25)

# ------------------------------ the clawed ------------------------------
sp('fox', 'quad', 0.38, 0.6, D=0.46, Wr=0.6, legR=0.06, canR=0.038, foot='paw', dig=True, neckA=36, neckL=0.4, neckR0=0.5, neckR1=0.34,
   headA=8, headL=0.38, headH=0.42, headW=0.56, muzR=0.3, muzPos=0.98, stop=0.6, earL=0.2, earW=0.075, earA=(16, 10), jaw=True, tail='bushy', tailL=0.95, tailR=0.08,
   eyeR=0.02, flex=True, face='canid', earTip=0.15, eyeFwd=0.3)
sp('arcticfox', 'quad', 0.3, 0.52, D=0.5, Wr=0.66, legR=0.064, canR=0.042, foot='paw', dig=True, neckA=34, neckL=0.36, neckR0=0.56, neckR1=0.4,
   headA=8, headL=0.38, headH=0.48, headW=0.6, muzR=0.32, muzPos=0.92, stop=0.6, earL=0.13, earW=0.065, earA=(20, 10), jaw=True, tail='bushy', tailL=0.95, tailR=0.1,
   eyeR=0.022, flex=True, face='canid', earTip=0.45, eyeFwd=0.3)
sp('fennec', 'quad', 0.2, 0.36, D=0.5, Wr=0.66, legR=0.06, canR=0.04, foot='paw', dig=True, neckA=40, neckL=0.36, neckR0=0.52, neckR1=0.38,
   headA=8, headL=0.42, headH=0.5, headW=0.62, muzR=0.26, muzPos=0.95, stop=0.7, earL=0.42, earW=0.16, earA=(22, 10), jaw=True, tail='bushy', tailL=0.95, tailR=0.08,
   eyeR=0.034, flex=True, tris=560, face='canid', earTip=0.3, eyeFwd=0.3)
sp('wolf', 'quad', 0.85, 1.05, D=0.5, Wr=0.56, legR=0.064, canR=0.038, foot='paw', dig=True, neckA=36, neckL=0.36, neckR0=0.58, neckR1=0.34,
   headA=10, headL=0.42, headH=0.5, headW=0.56, muzR=0.36, muzPos=0.94, stop=0.8, earL=0.13, earW=0.05, earA=(16, 12), jaw=True, tail='bushy', tailL=0.6, tailR=0.055,
   eyeR=0.016, cheek=0.9, withers=0.2, claws=True, flex=True, face='canid', earTip=0.2, eyeFwd=0.3, ruff=0.8)
sp('hyena', 'quad', 0.8, 1.2, D=0.56, Wr=0.66, rump=0.78, withers=0.32, legR=0.075, canR=0.042, foot='paw', dig=True, neckA=30, neckL=0.42, neckR0=0.66, neckR1=0.56,
   headA=14, headL=0.4, headH=0.6, headW=0.66, muzR=0.4, muzPos=0.9, stop=0.4, earL=0.1, earW=0.06, earA=(25, 15), jaw=True, tail='tuft', tailL=0.32, tailR=0.03,
   eyeR=0.016, mane='hyena', face='canid', earTip=0.75, muzFlat=1.1)
sp('bear', 'quad', 1.05, 1.85, D=0.62, Wr=0.86, plant=True, plantF=True, legR=0.11, canR=0.075, foot='bearpaw', claws=True, withers=0.42, neckA=14, neckL=0.3, neckR0=0.66, neckR1=0.5,
   headA=18, headL=0.38, headH=0.6, headW=0.66, muzR=0.32, muzPos=0.96, stop=0.4, earL=0.07, earW=0.045, earA=(30, 10), jaw=True, tail='short', tailL=0.06, tailR=0.05, eyeR=0.012, face='bear', earTip=1.0)
sp('polarbear', 'quad', 1.3, 2.2, D=0.6, Wr=0.8, plant=True, plantF=True, legR=0.1, canR=0.072, foot='bearpaw', claws=True, withers=0.32, neckA=18, neckL=0.46, neckR0=0.56, neckR1=0.42,
   headA=14, headL=0.36, headH=0.48, headW=0.56, muzR=0.32, muzPos=0.98, stop=0.2, earL=0.05, earW=0.04, earA=(40, 10), jaw=True, tail='short', tailL=0.05, tailR=0.04, eyeR=0.01, face='bear', earTip=1.0)
sp('lion', 'quad', 1.1, 1.8, D=0.52, Wr=0.66, legR=0.078, canR=0.05, foot='paw', dig=True, neckA=30, neckL=0.36, neckR0=0.56, neckR1=0.44,
   headA=8, headL=0.4, headH=0.62, headW=0.78, muzR=0.46, muzPos=0.72, stop=0.4, earL=0.06, earW=0.045, earA=(30, 10), jaw=True, tail='tuft', tailL=0.85, tailR=0.03,
   eyeR=0.017, mane='lion', flex=True, face='felid', eyeFwd=0.6, earTip=1.0, cheek=1.15, brow=0.5)
sp('tiger', 'quad', 1.0, 1.9, D=0.52, Wr=0.68, legR=0.08, canR=0.052, foot='paw', dig=True, neckA=26, neckL=0.36, neckR0=0.62, neckR1=0.52,
   headA=8, headL=0.38, headH=0.68, headW=0.82, muzR=0.44, muzPos=0.74, stop=0.4, earL=0.06, earW=0.045, earA=(30, 10), jaw=True, tail='long', tailL=0.9, tailR=0.035,
   eyeR=0.018, cheek=1.3, flex=True, face='felid', eyeFwd=0.6, earTip=0.95)
sp('jaguar', 'quad', 0.7, 1.32, D=0.54, Wr=0.7, legR=0.085, canR=0.056, foot='paw', dig=True, neckA=26, neckL=0.36, neckR0=0.6, neckR1=0.48,
   headA=8, headL=0.38, headH=0.68, headW=0.8, muzR=0.44, muzPos=0.74, stop=0.4, earL=0.06, earW=0.05, earA=(32, 10), jaw=True, tail='long', tailL=0.85, tailR=0.04,
   eyeR=0.022, cheek=1.15, flex=True, face='felid', eyeFwd=0.6, earTip=0.9)
sp('leopard', 'quad', 0.65, 1.28, D=0.5, Wr=0.64, legR=0.074, canR=0.048, foot='paw', dig=True, neckA=28, neckL=0.38, neckR0=0.55, neckR1=0.44,
   headA=8, headL=0.36, headH=0.64, headW=0.76, muzR=0.42, muzPos=0.74, stop=0.4, earL=0.07, earW=0.05, earA=(30, 10), jaw=True, tail='long', tailL=1.2, tailR=0.035,
   eyeR=0.022, flex=True, face='felid', eyeFwd=0.6, earTip=0.85)
sp('snowleopard', 'quad', 0.6, 1.18, D=0.54, Wr=0.68, legR=0.08, canR=0.055, foot='paw', dig=True, neckA=26, neckL=0.36, neckR0=0.58, neckR1=0.46,
   headA=8, headL=0.36, headH=0.66, headW=0.78, muzR=0.4, muzPos=0.72, stop=0.4, earL=0.06, earW=0.05, earA=(40, 10), jaw=True, tail='long', tailL=1.45, tailR=0.06,
   eyeR=0.024, flex=True, face='felid', eyeFwd=0.6, earTip=0.9)
sp('cao', 'quad', 0.52, 0.66, D=0.54, Wr=0.66, legR=0.07, canR=0.044, foot='paw', dig=True, neckA=40, neckL=0.4, neckR0=0.62, neckR1=0.5,
   headA=10, headL=0.44, headH=0.56, headW=0.64, muzR=0.46, muzPos=0.9, stop=1.0, earL=0.18, earW=0.08, earA=(40, 10), earFold=0.75, jaw=True, tail='up', tailL=0.55, tailR=0.04,
   eyeR=0.026, flex=True, face='canid', earTip=0.5, eyeFwd=0.35)
sp('gato', 'quad', 0.26, 0.32, D=0.52, Wr=0.72, legR=0.066, canR=0.044, foot='paw', dig=True, neckA=40, neckL=0.3, neckR0=0.56, neckR1=0.44,
   headA=6, headL=0.54, headH=0.66, headW=0.84, muzR=0.32, muzPos=0.66, stop=0.6, earL=0.17, earW=0.085, earA=(22, 6), jaw=True, tail='long', tailL=1.0, tailR=0.055,
   eyeR=0.038, cheek=1.1, withers=0.18, flex=True, tris=560, face='felid', eyeFwd=0.7, earTip=0.12)

# ------------------------------ the others on four legs ------------------------------
sp('rabbit', 'quad', 0.2, 0.34, D=0.72, Wr=0.86, rump=1.3, Dh=1.05, haunch=1.3, legR=0.08, canR=0.05, foot='paw', dig=True, plant=True, neckA=40, neckL=0.2, neckR0=0.62, neckR1=0.52,
   headA=24, headL=0.42, headH=0.7, headW=0.7, muzR=0.5, muzPos=0.76, earL=0.42, earW=0.1, earA=(8, 28), tail='puff', tailL=0.2, tailR=0.14, eyeR=0.05, hop=1, tris=560, earTip=0.55)
sp('hare', 'quad', 0.3, 0.44, D=0.56, Wr=0.66, rump=1.2, Dh=1.0, haunch=1.25, legR=0.07, canR=0.042, foot='paw', dig=True, plant=True, neckA=42, neckL=0.22, neckR0=0.6, neckR1=0.5,
   headA=24, headL=0.42, headH=0.68, headW=0.66, muzR=0.48, muzPos=0.78, earL=0.46, earW=0.085, earA=(8, 28), tail='puff', tailL=0.18, tailR=0.12, eyeR=0.045, hop=1, tris=560, earTip=0.5)
sp('beaver', 'quad', 0.32, 0.72, D=0.76, Wr=0.86, rump=1.2, Dh=1.05, legR=0.08, canR=0.05, foot='paw', dig=True, plant=True, neckA=10, neckL=0.15, neckR0=0.72, neckR1=0.62,
   headA=14, headL=0.42, headH=0.6, headW=0.6, muzR=0.5, muzPos=0.85, earL=0.05, earW=0.04, earA=(40, 10), tail='flat', tailL=0.95, tailR=0.08, eyeR=0.024, incisors=1, earTip=1.0)
sp('otter', 'quad', 0.26, 0.72, D=0.62, Wr=0.76, legR=0.07, canR=0.05, foot='paw', dig=True, plant=True, neckA=18, neckL=0.36, neckR0=0.72, neckR1=0.56,
   headA=8, headL=0.42, headH=0.56, headW=0.66, muzR=0.5, muzPos=0.86, earL=0.04, earW=0.03, earA=(50, 10), tail='croc', tailL=1.25, tailR=0.1, eyeR=0.026, flex=True, earTip=1.0)
sp('monkey', 'quad', 0.42, 0.48, D=0.52, Wr=0.72, legR=0.07, canR=0.046, foot='paw', plant=True, plantF=True, neckA=40, neckL=0.24, neckR0=0.55, neckR1=0.45,
   headA=0, headL=0.38, headH=0.86, headW=0.82, muzR=0.34, muzPos=0.56, earL=0.08, earW=0.06, earA=(85, 0), earCup=0.4, jaw=True, tail='long', tailL=1.3, tailR=0.04, eyeR=0.034, face='primate', earTip=1.0, eyeFwd=0.9)
sp('sloth', 'quad', 0.32, 0.6, D=0.64, Wr=0.82, legR=0.07, canR=0.05, foot='paw', plant=True, plantF=True, claws=True, legSplay=1.3, neckA=30, neckL=0.32, neckR0=0.6, neckR1=0.5,
   headA=10, headL=0.36, headH=0.75, headW=0.82, muzR=0.36, muzPos=0.56, earL=0.02, earW=0.02, earA=(60, 0), tail=None, eyeR=0.022, face='primate', earTip=1.0, eyeFwd=0.7, clawH=0.35)


# ------------------------------ the scaled, the frog, the seals ------------------------------
sp('python', 'snake', 0.22, 4.0, R=0.11, headW=1.8, headL=0.035)
sp('viper', 'snake', 0.09, 0.9, R=0.045, headW=2.6, headL=0.065, tris=560)
sp('anaconda', 'snake', 0.3, 5.5, R=0.15, headW=1.7, headL=0.03)
sp('croc', 'sprawl', 0.42, 1.6, W=0.42, tailL=1.35, headL=0.42, snout=0.8, legR=0.045, scutes=True, teeth=True, eyeR=0.02, headW=0.45, tris=900)
sp('lizard', 'sprawl', 0.09, 0.3, W=0.42, tailL=1.4, headL=0.3, snout=1.3, legR=0.04, scutes=False, eyeR=0.008, headW=0.62, tris=560)
sp('frog', 'frog', 0.06, 0.14, tris=560)
sp('seal', 'seal', 0.4, 1.7, R=0.2, headR=0.55)
sp('walrus', 'seal', 0.9, 3.0, R=0.26, headR=0.5, tusks=True, whisk=1.0)

# ------------------------------ the birds (fly: a second mesh, the wings spread) ------------------------------
sp('gull', 'bird', 0.38, 0.6, fly=1, bodyL=0.32, bw=0.07, bh=0.075, legH=0.12, legR=0.005, neckL=0.08, neckR=0.025, neckA=75, headR=0.032, beak='cone', beakL=0.05, beakR=0.009,
   tailL=0.1, tailW=0.06, span=1.3, chord=0.2, eyeR=0.006, flipper=True)
sp('eagle', 'bird', 0.75, 0.85, fly=1, bodyL=0.5, bw=0.12, bh=0.13, legH=0.16, legR=0.012, legThick=1.8, neckL=0.1, neckR=0.042, neckA=60, headR=0.046, beak='hook', beakL=0.07, beakR=0.022,
   tailL=0.25, tailW=0.12, span=2.0, chord=0.42, fingers=5, eyeR=0.009, tilt=0.82, brow=1, trousers=0.55)
sp('vulture', 'bird', 0.85, 1.0, fly=1, bodyL=0.55, bw=0.14, bh=0.14, legH=0.15, legR=0.012, neckL=0.18, neckR=0.026, neckA=50, headR=0.04, beak='hook', beakL=0.07, beakR=0.018,
   tailL=0.2, tailW=0.12, span=2.4, chord=0.5, fingers=6, eyeR=0.008, ruff=1, tilt=0.45, brow=1)
sp('raven', 'bird', 0.4, 0.6, fly=1, bodyL=0.34, bw=0.07, bh=0.075, legH=0.1, legR=0.006, neckL=0.06, neckR=0.03, neckA=60, headR=0.036, beak='cone', beakL=0.065, beakR=0.013,
   tailL=0.16, tailW=0.07, span=1.2, chord=0.25, fingers=5, eyeR=0.006, tilt=0.3, tris=560)
sp('parrot', 'bird', 0.5, 0.85, fly=1, bodyL=0.3, bw=0.07, bh=0.08, legH=0.06, legR=0.008, neckL=0.06, neckR=0.036, neckA=75, headR=0.046, beak='hook', beakL=0.06, beakR=0.022,
   tailL=0.45, tailW=0.075, span=1.0, chord=0.2, toes=2, eyeR=0.008, tilt=0.85)
sp('heron', 'bird', 1.0, 0.95, fly=1, bodyL=0.4, bw=0.09, bh=0.1, legH=0.5, legR=0.008, neckL=0.42, neckR=0.024, neckS=0.6, neckA=80, headR=0.034, beak='spear', beakL=0.13, beakR=0.012,
   tailL=0.12, tailW=0.07, crest=1.0, span=1.8, chord=0.35, eyeR=0.007)
sp('stork', 'bird', 1.05, 1.0, fly=1, bodyL=0.45, bw=0.12, bh=0.12, legH=0.5, legR=0.01, neckL=0.3, neckR=0.034, neckA=75, headR=0.04, beak='spear', beakL=0.2, beakR=0.02,
   tailL=0.12, tailW=0.09, span=2.0, chord=0.4, fingers=5, eyeR=0.008)
sp('flamingo', 'bird', 1.25, 1.0, fly=1, bodyL=0.4, bw=0.1, bh=0.11, legH=0.75, legR=0.008, neckL=0.55, neckR=0.022, neckS=0.9, neckA=80, headR=0.034, beak='bent', beakL=0.12, beakR=0.02,
   tailL=0.1, tailW=0.08, span=1.5, chord=0.3, eyeR=0.007)
sp('goose', 'bird', 0.7, 0.8, fly=1, bodyL=0.5, bw=0.14, bh=0.13, legH=0.12, legR=0.01, neckL=0.28, neckR=0.03, neckA=72, headR=0.04, beak='flat', beakL=0.06, beakR=0.018,
   tailL=0.12, tailW=0.1, span=1.6, chord=0.3, eyeR=0.008, flipper=True)
sp('toucan', 'bird', 0.4, 0.6, fly=1, bodyL=0.25, bw=0.07, bh=0.08, legH=0.06, legR=0.008, neckL=0.05, neckR=0.036, neckA=75, headR=0.042, beak='toucan', beakL=0.18, beakR=0.04,
   tailL=0.18, tailW=0.06, span=0.6, chord=0.16, toes=2, eyeR=0.008, tilt=0.5, tris=560)
sp('owl', 'bird', 0.5, 0.55, fly=1, bodyL=0.3, bw=0.12, bh=0.15, legH=0.08, legR=0.012, legThick=2.0, neckL=0.03, neckR=0.06, neckA=85, headR=0.08, disc=1, beak='hook', beakL=0.03, beakR=0.012,
   tailL=0.12, tailW=0.09, span=1.3, chord=0.35, fingers=5, eyeR=0.02, tilt=1.0, trousers=0.8)
sp('ostrich', 'bird', 2.4, 2.0, bodyL=1.0, bw=0.3, bh=0.3, legH=1.0, legR=0.03, legThick=2.0, neckL=0.85, neckR=0.04, neckA=82, headR=0.07, beak='flat', beakL=0.08, beakR=0.04,
   tailL=0.25, tailW=0.3, toes=2, span=1.0, chord=0.45, eyeR=0.018)
sp('galinha', 'bird', 0.45, 0.4, bodyL=0.35, bw=0.11, bh=0.12, legH=0.14, legR=0.009, neckL=0.1, neckR=0.036, neckA=70, headR=0.036, beak='cone', beakL=0.025, beakR=0.01,
   comb=0.7, wattle=0.7, tailL=0.15, tailW=0.1, span=0.7, chord=0.2, eyeR=0.007, tris=560)
sp('peru', 'bird', 0.9, 1.0, bodyL=0.6, bw=0.2, bh=0.22, legH=0.3, legR=0.014, neckL=0.25, neckR=0.035, neckA=70, headR=0.042, beak='cone', beakL=0.035, beakR=0.014,
   wattle=1.0, comb=0.3, tailL=0.3, tailW=0.25, span=1.2, chord=0.3, eyeR=0.008)
sp('pombo', 'bird', 0.28, 0.32, bodyL=0.25, bw=0.06, bh=0.065, legH=0.06, legR=0.005, neckL=0.05, neckR=0.025, neckA=70, headR=0.026, beak='cone', beakL=0.016, beakR=0.005,
   tailL=0.1, tailW=0.05, span=0.65, chord=0.15, eyeR=0.005, tris=560)
sp('penguin', 'bird', 0.9, 0.4, upright=True, bw=0.17, bh=0.33, legH=0.05, legR=0.015, neckL=0.08, neckR=0.07, headR=0.075, beak='spear', beakL=0.1, beakR=0.016,
   tailL=0.08, tailW=0.06, flipper=True, eyeR=0.012, span=0.5, chord=0.12)

# ------------------------------ the dragon (not of Animals.DEF: the god's power, js/dragon.js — drawn by js/dragon3d.js) ------------------------------
# (on the ground, the wings folded; fly: the second mesh, the wings spread — as a bird of the air. H: the shoulder's height)
sp('dragon', 'dragon', 3.4, 18.0, fly=1, tris=2100, far=440)
# ------------------------------ the sea (D-267: the swimmers and the turtle; drawn by Things3D) ------------------------------
# (H the body's depth, L its length — the sizes of the old drawing: the dolphin 2.4 m, the orca 6.5, the whale 14, the shark
# 3.6, the turtle 1.25 from the beak to the tail)
sp('dolphin', 'swim', 0.48, 2.4, R=0.1, Wr=0.86, maxAt=0.38, nose=0.34, p1=0.75, p2=1.7, ped=0.09, pedW=0.4, belly=0.08, head='beak', beakL=0.075, beakR=0.2,
   eyeR=0.0085, eyeAt=0.14, eyeUp=0.05, blow=1, dorsal=(0.5, 0.1, 0.13, 0.85), pect=(0.27, 0.14, 0.065, 38, 35), flukes=(0.26, 0.075, 0.55),
   pattern='dolphin', tris=1000, far=180)
sp('orca', 'swim', 1.5, 6.5, R=0.115, Wr=0.95, maxAt=0.38, nose=0.45, p1=0.6, p2=1.5, ped=0.1, pedW=0.42, belly=0.06, head='blunt',
   eyeR=0.0055, eyeAt=0.12, eyeUp=0.08, jaw=True, teeth=10, blow=1, dorsal=(0.47, 0.17, 0.13, 0.15), pect=(0.25, 0.13, 0.085, 40, 25), pectTip=0.42, flukes=(0.25, 0.08, 0.5),
   pattern='orca', tris=1100, far=260)
sp('whale', 'swim', 3.4, 14.0, R=0.12, Wr=1.0, maxAt=0.34, nose=0.3, p1=0.6, p2=1.4, ped=0.08, pedW=0.42, headW=0.86, belly=0.12, droop=0.4, head='whale',
   eyeR=0.003, eyeAt=0.26, eyeUp=-0.1, blow=2, knobs=8, dorsal=(0.66, 0.035, 0.07, 0.6), pect=(0.3, 0.31, 0.06, 30, 30), flukes=(0.34, 0.09, 0.35),
   pattern='whale', tris=1200, far=320)
sp('shark', 'swim', 0.76, 3.6, R=0.105, Wr=0.9, maxAt=0.36, nose=0.25, p1=0.75, p2=1.3, ped=0.13, pedW=0.85, headW=1.15, belly=0.04, head='shark',
   eyeR=0.007, eyeAt=0.11, eyeUp=0.18, jaw=True, teeth=9, gills=5, blow=0, dorsal=(0.42, 0.11, 0.13, 0.45), dorsal2=(0.79, 0.022, 0.03, 0.4), anal=(0.8, 0.02, 0.03, 0.4),
   pect=(0.27, 0.19, 0.075, 28, 40), pelvic=(0.6, 0.06, 0.035), caudal=(0.24, 0.17, 42, 52), keel=1.0, pattern='shark', tris=1100, far=190)
sp('turtle', 'turtle', 0.4, 1.25, tris=900, far=180)


def kinds(): return list(SPECIES.keys())


def build(kind, fly=False):
    s = dict(SPECIES[kind]); fam = s.pop('fam'); H = s.pop('H'); L = s.pop('L'); s.pop('fly', None)
    feats = ('antler', 'horns', 'mane', 'dewlap', 'mesh', 'tris', 'far', 'scale', 'beard', 'trunk', 'tusks', 'ossicones', 'folds', 'bell', 'wool', 'eyesHigh', 'incisors', 'hop')
    if fam != 'quad': feats = ('mesh', 'tris', 'far', 'scale', 'hop')  # (the ornaments are the four-legged's; the other families take theirs as measures)
    extras = {k: s.pop(k) for k in feats if k in s}
    b = FF.Beast(kind, H, L)
    if fam == 'quad': FF.quad(b, **s)
    elif fam == 'bird': FF.bird(b, fly=fly, **s)
    elif fam == 'snake': FF.snake(b, **s)
    elif fam == 'sprawl': FF.sprawl(b, **s)
    elif fam == 'frog': FF.frog(b, **s)
    elif fam == 'seal': FF.seal(b, **s)
    elif fam == 'dragon': FF.dragon(b, fly=fly, **s)
    elif fam == 'swim': FF.swim(b, **s)
    elif fam == 'turtle': FF.turtle(b, **s)
    b.meta['hop'] = bool(extras.get('hop'))
    for k, f in (('antler', antlers), ('horns', horns), ('mane', mane), ('dewlap', dewlap), ('beard', beard), ('trunk', trunk), ('tusks', tusks),
                 ('ossicones', ossicones), ('folds', folds), ('bell', bell), ('incisors', teeth)):
        if k in extras: f(b, extras[k])
    FF.seat_face(b)  # (last: the eyes find the skin the whole head has — its ornaments, its cuts — D-320)
    return b


def meta_of(b):
    J = b.bones_filled(); p = b.meta.get('p', {})
    m = {'fam': b.meta.get('family', 'quad'), 'H': b.H, 'L': b.L, 'eye': [round(x, 4) for x in b.meta.get('eye', [0, 0, 0])],
         'nose': [round(x, 4) for x in b.meta.get('nose', [0, 0, 0])], 'dig': bool(p.get('dig')), 'pillar': bool(p.get('pillar')),
         'flex': bool(b.meta.get('flex')), 'hop': bool(b.meta.get('hop')), 'trunk': bool(b.meta.get('trunk')), 'fly': bool(b.meta.get('fly')), 'upright': bool(b.meta.get('upright'))}
    if 'wing3' in b.meta: m['wing3'] = b.meta['wing3']; m['chin'] = b.meta['chin']  # (the dragon: the axis its fingers bend about, the left wing's; the chin)
    if 'swim' in b.meta: m['swim'] = {k: (round(v, 4) if isinstance(v, float) else [round(x, 4) for x in v] if isinstance(v, list) else v) for k, v in b.meta['swim'].items()}  # (a swimmer: its girth, where its back, blowhole, fin and tail are, how it beats — D-267)
    if 'rump' in b.meta: m.update(rump=b.meta['rump'], foot=b.meta['foot'], tailR=b.meta.get('tailR', 0.0))  # (a four-legged's: where its feet are placed by — D-273)
    if 'face' in b.meta: m['face'] = {k: [round(float(x), 5) for x in v] for k, v in b.meta['face'].items()}  # (the eye, the mouth, the nostril for the shader — D-321)
    return m


def species_entry(kind):
    s = SPECIES[kind]
    e = {'mesh': s.get('mesh', kind), 'scale': s.get('scale', 1.0), 'fam': s['fam']}
    if s.get('fly'): e['fly'] = s.get('mesh', kind) + '_voo'
    return e


# ------------------------------ the head's ornaments ------------------------------
def head_frame(b):
    p = b.meta['p']; H = b.H; hL = p['headL'] * H; hH = p['headH'] * hL; hW = p['headW'] * hL
    a = np.radians(p['headA']); d = v3(0, -np.sin(a), np.cos(a)); up = v3(0, np.cos(a), np.sin(a))
    poll = b.J['head']; sk = poll + d * hL * 0.2 + up * hH * 0.05
    return poll, sk, d, up, hL, hH, hW


def tube(pts, radii, bone):
    """A bent horn or beam: round cones through the points."""
    return [(RoundCone(pts[k], pts[k + 1], radii[k], radii[k + 1]), bone) for k in range(len(pts) - 1)]


def antlers(b, kind):
    """Antlers: the red deer's beam with tines forward; the reindeer's long sweep back and up with a shovel over the face; the
    moose's broad palms."""
    poll, sk, d, up, hL, hH, hW = head_frame(b); H = b.H
    prims = []
    for sd in (1, -1):
        base = sk + up * hH * 0.45 + d * hL * 0.02 + v3(sd * hW * 0.22, 0, 0)
        if kind == 'deer':
            r = H * 0.02
            pts = [base, base + v3(sd * 0.08, 0.16, -0.05) * H, base + v3(sd * 0.17, 0.34, -0.12) * H, base + v3(sd * 0.22, 0.5, -0.06) * H, base + v3(sd * 0.2, 0.64, 0.04) * H]
            prims += tube(pts, [r, r * 0.85, r * 0.72, r * 0.6, r * 0.45], 'head')
            for t, dv in [(0.1, (0.02, 0.06, 0.17)), (0.38, (0.03, 0.1, 0.15)), (0.68, (0.07, 0.11, 0.1)), (0.9, (-0.05, 0.12, 0.06))]:
                kk = min(3, int(t * 4)); q = lerp(pts[kk], pts[kk + 1], t * 4 - kk); prims.append((RoundCone(q, q + v3(sd * dv[0], dv[1], dv[2]) * H, r * 0.7, r * 0.28), 'head'))
        elif kind == 'reindeer':
            r = H * 0.018
            pts = [base, base + v3(sd * 0.1, 0.22, -0.18) * H, base + v3(sd * 0.2, 0.5, -0.24) * H, base + v3(sd * 0.22, 0.78, -0.08) * H, base + v3(sd * 0.16, 0.92, 0.12) * H]
            prims += tube(pts, [r, r * 0.9, r * 0.8, r * 0.65, r * 0.5], 'head')
            for t, dv in [(0.5, (0.04, 0.12, 0.12)), (0.75, (0.08, 0.1, 0.1)), (0.92, (-0.04, 0.12, 0.1))]:
                kk = min(3, int(t * 4)); q = lerp(pts[kk], pts[kk + 1], t * 4 - kk); prims.append((RoundCone(q, q + v3(sd * dv[0], dv[1], dv[2]) * H, r * 0.6, r * 0.3), 'head'))
            if sd > 0:  # (the brow shovel, over the face on one side)
                prims.append((Ellipsoid(base + v3(0.02, 0.06, 0.12) * H, (H * 0.012, H * 0.06, H * 0.08), orient(base, base + v3(0, 0.3, 1), (1, 0, 0))), 'head'))
                prims.append((RoundCone(base, base + v3(0.02, 0.05, 0.1) * H, r * 0.8, r * 0.6), 'head'))
        elif kind == 'moose':
            r = H * 0.016
            a0 = base + v3(sd * 0.1, 0.02, -0.02) * H
            prims.append((RoundCone(base, a0, r, r * 0.9), 'head'))
            c = a0 + v3(sd * 0.17, 0.05, -0.02) * H
            prims.append((Ellipsoid(c, (H * 0.17, H * 0.014, H * 0.1), FF.rot_z(sd * 0.45) @ FF.rot_x(-0.25)), 'head'))
            for k in range(5):
                a = -0.6 + k * 0.32; tip = c + v3(sd * (0.18 + 0.02 * np.cos(a * 3)) * np.cos(a), 0.06 + 0.1 * np.sin(a + 0.7), np.sin(a) * 0.12) * H
                prims.append((RoundCone(c + (tip - c) * 0.55, tip, r * 0.6, r * 0.25), 'head'))
    b.piece('galhada', 'galhada', prims, 240 if kind != 'deer' else 220, far=50, h=H * 0.006)


def horns(b, kind):
    poll, sk, d, up, hL, hH, hW = head_frame(b); H = b.H
    prims = []; zone = 'chifre'
    for sd in (1, -1):
        base = sk + up * hH * 0.38 - d * hL * 0.04 + v3(sd * hW * 0.42, 0, 0)
        X = v3(sd, 0, 0)
        if kind == 'cow':
            pts = [base, base + v3(sd * 0.09, 0.02, 0.0) * H, base + v3(sd * 0.15, 0.07, 0.03) * H, base + v3(sd * 0.17, 0.13, 0.05) * H]
            prims += tube(pts, [0.026 * H, 0.02 * H, 0.013 * H, 0.005 * H], 'head')
        elif kind == 'gnu':
            pts = [base, base + v3(sd * 0.1, -0.02, 0.0) * H, base + v3(sd * 0.17, 0.03, -0.02) * H, base + v3(sd * 0.16, 0.1, 0.02) * H]
            prims += tube(pts, [0.024 * H, 0.018 * H, 0.012 * H, 0.004 * H], 'head')
        elif kind == 'buffalo':
            boss = base + v3(-sd * 0.06, 0.03, 0) * H
            pts = [boss, base + v3(sd * 0.08, -0.04, -0.02) * H, base + v3(sd * 0.2, -0.06, 0.0) * H, base + v3(sd * 0.27, 0.04, 0.02) * H, base + v3(sd * 0.26, 0.13, 0.05) * H]
            prims += tube(pts, [0.05 * H, 0.04 * H, 0.03 * H, 0.018 * H, 0.005 * H], 'head')
        elif kind == 'muskox':
            boss = base + v3(-sd * 0.05, 0.04, 0) * H
            pts = [boss, base + v3(sd * 0.06, -0.02, -0.02) * H, base + v3(sd * 0.1, -0.12, 0.0) * H, base + v3(sd * 0.16, -0.12, 0.06) * H, base + v3(sd * 0.2, -0.04, 0.1) * H]
            prims += tube(pts, [0.05 * H, 0.04 * H, 0.03 * H, 0.018 * H, 0.006 * H], 'head')
        elif kind == 'short':
            pts = [base, base + v3(sd * 0.06, 0.0, 0.0) * H, base + v3(sd * 0.09, 0.06, 0.02) * H]
            prims += tube(pts, [0.024 * H, 0.016 * H, 0.004 * H], 'head')
        elif kind == 'ibex':
            b0 = base - X * hW * 0.25 + up * hH * 0.05
            pts = [b0 + v3(0, 0, 0) * H, b0 + v3(sd * 0.03, 0.22, -0.1) * H, b0 + v3(sd * 0.06, 0.38, -0.32) * H, b0 + v3(sd * 0.08, 0.36, -0.55) * H, b0 + v3(sd * 0.09, 0.22, -0.66) * H]
            prims += tube(pts, [0.045 * H, 0.04 * H, 0.032 * H, 0.022 * H, 0.008 * H], 'head')
            for k in range(1, 9):  # (the ridges on its front)
                t = k / 9.0; kk = min(3, int(t * 4)); q = lerp(pts[kk], pts[kk + 1], t * 4 - kk)
                prims.append((Sphere(q + v3(0, 0.012, 0.012) * H, (0.044 - 0.035 * t) * H), 'head'))
        elif kind == 'goat':
            b0 = base - X * hW * 0.2
            pts = [b0, b0 + v3(sd * 0.03, 0.12, -0.06) * H, b0 + v3(sd * 0.07, 0.17, -0.18) * H, b0 + v3(sd * 0.1, 0.12, -0.27) * H]
            prims += tube(pts, [0.03 * H, 0.024 * H, 0.016 * H, 0.005 * H], 'head')
        elif kind == 'gazelle':
            b0 = base - X * hW * 0.25
            pts = [b0, b0 + v3(sd * 0.03, 0.14, -0.08) * H, b0 + v3(sd * 0.06, 0.28, -0.1) * H, b0 + v3(sd * 0.05, 0.38, -0.02) * H]
            prims += tube(pts, [0.02 * H, 0.017 * H, 0.012 * H, 0.004 * H], 'head')
            for k in range(1, 8):
                t = k / 8.0; kk = min(2, int(t * 3)); q = lerp(pts[kk], pts[kk + 1], t * 3 - kk); prims.append((Sphere(q, (0.021 - 0.012 * t) * H), 'head'))
    if kind == 'rhino':  # (the front horn long, broad at its root and curving back to the tip; the second behind it, short)
        nose = np.array(b.meta['nose']); hv = nrm(v3(0, 1, 0) * 0.8 + up * 0.2); bk = nrm(v3(0, 0, -1) - hv * hv[2])  # (up the world's way, the head held low)
        h1 = nose - d * hL * 0.15 + up * hH * 0.28
        prims = tube([h1, h1 + hv * 0.12 * H - bk * 0.02 * H, h1 + hv * 0.23 * H + bk * 0.01 * H, h1 + hv * 0.3 * H + bk * 0.07 * H], [0.075 * H, 0.052 * H, 0.03 * H, 0.006 * H], 'head')
        h2 = h1 - d * hL * 0.3 + up * hH * 0.1
        prims += tube([h2, h2 + hv * 0.07 * H, h2 + hv * 0.12 * H + bk * 0.02 * H], [0.05 * H, 0.032 * H, 0.006 * H], 'head')
    b.piece('chifres', zone, prims, 110 if kind in ('ibex', 'gazelle') else 90, far=24, h=H * 0.005)


def mane(b, kind):
    """A mane: the horse's and the zebra's along the neck's crest; the lion's round the head and neck; the gnu's and the
    hyena's upright crest; the boar's bristles; the bison's shaggy forequarters; the giraffe's short ridge."""
    J = b.J; H = b.H; p = b.meta['p']; Dc = p['D'] * H
    n0, n1, n2, hd = J['neck0'], J['neck1'], J['neck2'], J['head']
    r0 = p['neckR0'] * Dc * FF.NECK; r1 = p['neckR1'] * Dc * FF.NECK
    if kind in ('horse', 'zebra', 'gnu', 'giraffe', 'hyena'):
        prims = []
        hgt = {'horse': 0.5, 'zebra': 0.55, 'gnu': 0.6, 'giraffe': 0.35, 'hyena': 0.5}[kind]; wd = {'horse': 0.3, 'zebra': 0.22, 'gnu': 0.22, 'giraffe': 0.18, 'hyena': 0.2}[kind]
        pts = [n0, n1, n2, hd]; rr = [r0 * 0.8, lerp(r0, r1, 0.45), lerp(r0, r1, 0.8), r1]; bones = ['neck0', 'neck1', 'neck2']
        if kind == 'hyena': pts = [J['spine'] + v3(0, Dc * 0.4, 0)] + pts; rr = [r0 * 0.5] + rr; bones = ['chest'] + bones
        crest = []
        for k, q in enumerate(pts):
            dd = nrm(pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]); upn = nrm(np.cross(np.cross(dd, v3(0, 1, 0)), dd)) if abs(dd[1]) < 0.99 else v3(0, 0, -1)
            if upn[1] < 0: upn = -upn
            crest.append(q + upn * rr[k] * 0.9)
        for k in range(len(crest) - 1):
            prims.append((RoundCone(crest[k], crest[k + 1], max(rr[k] * hgt, 0.004), max(rr[k + 1] * hgt, 0.004), flat=((1, 0, 0), wd)), bones[k]))
        if kind == 'horse':  # (the forelock)
            poll, sk, d, up, hL, hH, hW = head_frame(b)
            prims.append((ell_between(hd + up * hH * 0.4, hd + up * hH * 0.2 + d * hL * 0.3, hW * 0.18, hH * 0.12), 'head'))
        b.piece('crina', 'crina', prims, 140, far=30)
    elif kind == 'lion':
        # (the mane frames the face — a ruff round it behind the cheeks and the brow, the face in front of it — and falls over the
        # neck to the withers and down the throat to the chest; locks round its edge break the outline: no helmet)
        poll, sk, d, up, hL, hH, hW = head_frame(b); X = v3(1, 0, 0)
        rc = poll - d * hL * 0.12 - up * hH * 0.16
        prims = [(K(Ellipsoid(rc, (hW * 0.95, hL * 0.3, hH * 1.0), orient(rc - d, rc + d, up)), 0), 'head'),
                 (K(ell_between(hd + up * hH * 0.25 - d * hL * 0.15, n0 + v3(0, r0 * 0.75, -r0 * 0.5), r0 * 1.3, r0 * 1.25), hW * 0.3), 'neck1'),
                 (K(ell_between(hd - up * hH * 0.45, n0 + v3(0, -r0 * 1.05, r0 * 0.55), r0 * 1.15, r0 * 1.05), hW * 0.3), 'neck0')]
        for ring, (nl, ri, ro, wi, wo, back) in enumerate(((13, 0.72, 1.22, 0.27, 0.11, 0.18), (10, 0.62, 1.02, 0.24, 0.1, 0.06))):
            for k in range(nl):  # (round the frame, from under one cheek over the brow to under the other: two layers of locks, rounded, each its length — D-325)
                ang = -np.pi * 0.88 + (k + 0.5 * ring) * np.pi * 1.76 / (nl - 1 + 0.5 * ring); dv = nrm(X * np.sin(ang) + up * np.cos(ang))
                ln = ro + 0.1 * np.sin(k * 2.3 + ring * 1.7) + (0.16 if abs(ang) > 2.3 else 0.0)
                l0 = rc + dv * hH * ri - d * hL * 0.04; l1 = rc + dv * hH * ln - d * hL * (0.12 + back)
                prims.append((K(RoundCone(l0, l1, hH * wi, hH * wo), hH * 0.12), 'head'))
        for sd in (1, -1):  # (the long locks down the chest)
            q0 = n0 + v3(sd * r0 * 0.45, -r0 * 1.2, r0 * 0.6); prims.append((K(RoundCone(q0, q0 + v3(sd * r0 * 0.1, -r0 * 0.75, r0 * 0.15), r0 * 0.45, r0 * 0.12), r0 * 0.2), 'neck0'))
        b.piece('juba', 'crina', prims, 320, far=66)
    elif kind == 'boar':
        prims = [(ell_between(n1 + v3(0, r1 * 0.95, 0), J['spine'] + v3(0, Dc * 0.42, 0.0), r1 * 0.14, r1 * 0.35), 'chest')]
        b.piece('crina', 'crina', prims, 60, far=12)
    elif kind == 'bison':
        poll, sk, d, up, hL, hH, hW = head_frame(b)
        prims = [(K(Ellipsoid(sk + up * hH * 0.22, (hW * 0.62, hH * 0.48, hL * 0.32)), Dc * 0.15), 'head'),
                 (K(ell_between(hd - up * hH * 0.6 + d * hL * 0.3, hd - up * hH * 1.2 + d * hL * 0.5, hW * 0.25, hW * 0.3), Dc * 0.1), 'head')]
        b.piece('juba', 'crina', prims, 260, far=70)


def L_(b): return b.L


def dewlap(b, amt):
    """The fold of skin under a bull's neck."""
    J = b.J; H = b.H; p = b.meta['p']; Dc = p['D'] * H
    a = J['neck0'] + v3(0, -Dc * 0.45, 0.05 * H); c = J['head'] + v3(0, -Dc * 0.25, -0.05 * H)
    b.add(ell_between(a, c, Dc * 0.08, Dc * 0.18 * amt), 'neck1', k=Dc * 0.12)


def bell(b, amt):
    """The moose's bell: a flap of skin and hair under the throat."""
    poll, sk, d, up, hL, hH, hW = head_frame(b); H = b.H
    a = poll + d * hL * 0.15 - up * hH * 0.5
    b.piece('sino', 'crina', [(ell_between(a, a - up * hH * 0.9 + d * hL * 0.05, hW * 0.12, hW * 0.22), 'head')], 50, far=0)


def beard(b, amt):
    poll, sk, d, up, hL, hH, hW = head_frame(b)
    a = poll + d * hL * 0.7 - up * hH * 0.45
    b.piece('barba', 'crina', [(RoundCone(a, a - up * hH * 0.7 - d * hL * 0.1, hW * 0.14, hW * 0.06), 'jaw')], 40, far=0)


def ossicones(b, amt):
    poll, sk, d, up, hL, hH, hW = head_frame(b); H = b.H
    for sd in (1, -1):
        base = sk + up * hH * 0.4 - d * hL * 0.05 + v3(sd * hW * 0.22, 0, 0)
        tip = base + up * H * 0.045 - d * H * 0.01 + v3(sd * H * 0.006, 0, 0)
        b.add(RoundCone(base, tip, H * 0.012, H * 0.008), 'head', k=H * 0.006)
        b.piece('tufoL' if sd > 0 else 'tufoR', 'crina', [(Sphere(tip, H * 0.011), 'head')], 24, far=0)


def trunk(b, kind):
    """The elephant's trunk in three bones, hanging from the face to near the ground; the tapir's short one."""
    poll, sk, d, up, hL, hH, hW = head_frame(b); H = b.H
    nose = np.array(b.meta['nose'])
    if kind == 'elephant':
        t0 = nose - d * hL * 0.12; r0 = hH * 0.31
        p1 = t0 + v3(0, -H * 0.2, H * 0.07); p2 = p1 + v3(0, -H * 0.23, H * 0.015); p3 = p2 + v3(0, -H * 0.19, H * 0.04); tip = p3 + v3(0, -H * 0.05, H * 0.07)
        b.j('trunk0', t0); b.j('trunk1', p1); b.j('trunk2', p2)
        b.add(RoundCone(t0, p1, r0, r0 * 0.68), 'trunk0', k=r0 * 0.5)
        b.add(RoundCone(p1, p2, r0 * 0.68, r0 * 0.48), 'trunk1', k=r0 * 0.2)
        b.add(RoundCone(p2, p3, r0 * 0.48, r0 * 0.34), 'trunk2', k=r0 * 0.2)
        b.add(RoundCone(p3, tip, r0 * 0.34, r0 * 0.3), 'trunk2', k=r0 * 0.1)
        b.add(Ellipsoid(tip + v3(0, -r0 * 0.05, r0 * 0.12), (r0 * 0.34, r0 * 0.22, r0 * 0.3)), 'trunk2', k=r0 * 0.1)   # (the tip's lip)
        b.meta['nose'] = list(tip); b.meta['trunk'] = True
        b.meta['nostril'] = [list(tip + v3(r0 * 0.12, -r0 * 0.02, r0 * 0.36)), float(r0 * 0.09)]  # (the trunk's two holes at its tip)
    else:
        t0 = nose - d * hL * 0.05; r0 = hH * 0.17
        p1 = t0 + d * hL * 0.18 - up * hL * 0.05; p2 = p1 + d * hL * 0.12 - up * hL * 0.12
        b.j('trunk0', t0); b.j('trunk1', p1); b.j('trunk2', p2)
        b.add(RoundCone(t0, p1, r0, r0 * 0.75), 'trunk0', k=r0 * 0.5); b.add(RoundCone(p1, p2, r0 * 0.75, r0 * 0.6), 'trunk1', k=r0 * 0.2)
        b.meta['nose'] = list(p2); b.meta['trunk'] = True
        b.meta['nostril'] = [list(p2 + d * r0 * 0.55 + v3(r0 * 0.25, 0, 0)), float(r0 * 0.16)]


def tusks(b, kind):
    poll, sk, d, up, hL, hH, hW = head_frame(b); H = b.H
    prims = []
    for sd in (1, -1):
        if kind == 'elephant':
            base = poll + d * hL * 0.62 - up * hH * 0.32 + v3(sd * hW * 0.22, 0, 0)
            pts = [base, base + v3(sd * 0.02, -0.12, 0.12) * H, base + v3(sd * 0.04, -0.14, 0.26) * H, base + v3(sd * 0.03, -0.06, 0.36) * H]
            prims += tube(pts, [0.03 * H, 0.026 * H, 0.018 * H, 0.006 * H], 'head')
        else:
            base = poll + d * hL * 0.8 - up * hH * 0.3 + v3(sd * hW * 0.25, 0, 0)
            pts = [base, base + v3(sd * 0.03, 0.03, 0.04) * H, base + v3(sd * 0.04, 0.08, 0.02) * H]
            prims += tube(pts, [0.02 * H, 0.015 * H, 0.004 * H], 'head')
    b.piece('presas', 'marfim', prims, 80, far=16, h=H * 0.004)


def folds(b, amt):
    """The rhino's armour: folds of hide behind the shoulder and before the haunch."""
    J = b.J; H = b.H; p = b.meta['p']; Dc = p['D'] * H; Wd = Dc * p['Wr']; L = b.L
    for z, bone in ((L * 0.06, 'chest'), (-L * 0.16, 'spine')):
        b.add(Ellipsoid((0, H - Dc * 0.5, z), (Wd * 0.55, Dc * 0.56, L * 0.02)), bone, k=Dc * 0.08)
    b.add(Ellipsoid(J['neck0'] + v3(0, -Dc * 0.05, 0.04 * H), (Wd * 0.48, Dc * 0.46, L * 0.03)), 'neck0', k=Dc * 0.06)


def teeth(b, amt):
    poll, sk, d, up, hL, hH, hW = head_frame(b); H = b.H
    nose = np.array(b.meta['nose'])
    c = nose - up * hH * 0.35 - d * hL * 0.04
    b.piece('dentes', 'bico', [(RBox(c, (hW * 0.12, hH * 0.12, hL * 0.03), hL * 0.01), 'jaw')], 20, far=0, h=H * 0.004)
