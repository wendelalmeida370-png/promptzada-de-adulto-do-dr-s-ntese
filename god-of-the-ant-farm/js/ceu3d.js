'use strict';
// ============================================================
//  Ceu3D: the sky, the light and the air of the body's view
//  (21d, NATUREZA.md §8 — the ports the other pillars read).
//  What G.Ceu says (js/ceu.js, pure), drawn: the key light and
//  the sky's, the dome with its sun, moon, stars and clouds, the
//  air laid over every material, the painter's light patched
//  once into three.js's own pieces of shader (toon) — the one
//  place the light of the 3D is made: the water, the woods and
//  the land read its uniforms (GX) and its pieces of shader, and
//  never make a light or a sky of their own. Only seen: it reads
//  the world, it writes nothing of it, and draws from no chance
//  of the world's (D-466).
// ============================================================
(function (G) {
  const Ce3 = G.Ceu3D = {};
  // the sky's fields of the qualities (D-466, D-468): shafts — the cards of light in the gaps of the canopy (the Média); vlight —
  // the light in the air itself, marched through the sun's picture of the shadows by the post (0 none, 1 a quarter of the
  // picture and 16 steps, 2 half of it and 24)
  G.Realm.qualAdd('shafts', { baixa: 0, media: 1, alta: 0, ultra: 0 });
  G.Realm.qualAdd('vlight', { baixa: 0, media: 0, alta: 1, ultra: 2 });
  // (vclouds: the clouds of the plane with a body of their own, marched through their layer — the Ultra; the others draw them on
  // the dome with their own shade, a false volume)
  G.Realm.qualAdd('vclouds', { baixa: 0, media: 0, alta: 0, ultra: 1 });
  const R3 = G.Realm; const TAU = Math.PI * 2; const W = G.W;
  let THREE = null, renderer = null, scene = null, camera = null;
  let sun = null, hemi = null, skyMesh = null, skyU = null, stars = null;
  const U = R3.U;
  // ------------------------------ the painter's light ------------------------------
  // (patched once into three.js' own pieces of shader, so every material of the 3D has it — the look of the god's drawing
  // and of a painted world like Breath of the Wild: a soft band from shade to light instead of a smooth fall; a rim of
  // sunlight on the edges that turn away from it; the air — the far land going blue into a haze that is the sky's own colour
  // at the horizon (warm toward the sun), a low mist over the water and in the hollows, thick at dawn; shadows that fade out
  // at the edge of the sun's picture instead of stopping on a line; the colours kept a little richer after the tone curve)
  // the air and the sky, the same for every material: three.js copies the uniforms of its own materials from its library,
  // a plain object by reference — so these few objects, set once a frame by light(), reach every material made after this
  // gxSunW: toward the sun · gxHor: the sky at the horizon · gxGlow: its glow toward the sun · gxBelt: the pink of the
  // dusk opposite it · gxAir: (haze k [1/m], mist at its base [1/m], mist falloff [1/m], mist base height [m]) ·
  // gxAir2: (haze start [m], the end of the view from, to [m], how blue the distance goes)
  const v4 = (x, y, z, w) => ({ value: { x, y, z, w } });
  // gxLM, gxLM2: the picture of the light of the flames round the body (FX3D paints it: its colour; where it comes from) ·
  // gxLMB: (its corner x, z [m], 1 / its side [1/m], on — and the world's height on the screen) · gxLMY: (the height its
  // sources are measured from [m], the most light it holds, the span of its offsets [m], -) · gxGr: (how much of the night's
  // grade: the colours going out in the dark, -, -, -) · gxAmb: (the sky's light now against noon's, 0.1 at night to 1; -, -, -:
  // for a light a material makes of its own — a rim, a glow — that must go down with the day's)
  const GX = { gxSunW: v4(0, 1, 0, 0), gxHor: v4(0.6, 0.7, 0.85, 0), gxGlow: v4(0, 0, 0, 0), gxBelt: v4(0, 0, 0, 0), gxAir: v4(0.003, 0.001, 0.11, 3), gxAir2: v4(0, 1250, 1520, 1),
    gxLM: { value: null }, gxLM2: { value: null }, gxLMB: v4(0, 0, 0, 0), gxLMY: v4(0, 16, 32, 0), gxGr: v4(0, 0.09, 0.25, 1), gxTn: v4(0.5, 0, 0, 0), gxAmb: v4(1, 0, 0, 0),
    // the air of each place and the shade of the land and of the clouds (21d, NATUREZA.md §8): gxAirMap — the map of the air,
    // a texel at each corner of a tile (R the mist that lies at dawn, G the canopy, B the mist that stays, A its top over the sea
    // in steps of 0.3 m: G.Ceu.airMap) · gxShade — the land's shade (R, G the height over the ground the shadow of the land
    // reaches for the key light at two hours, in steps of 0.2 m; B the ground itself, in steps of 0.3 m) · gxCloudN — the
    // clouds' stuff (G.Ceu.noise: R the big shapes, G the small; tiling) · gxAirB: (1 / a tile [1/m], 1 / the corners to a
    // side, on, the world's height on the screen) · gxAirK: (the dawn's mist now, the lasting mist now, the canopy on, the
    // mist's thickness [1/m]) · gxCl0: (the two layers' offsets: x0, z0, x1, z1) · gxCl1: (their weights w0, w1, how dark a
    // cloud's shadow is, the contrast given back) · gxCl2: (the cloud plane's height [m], 1 / the stuff's side [1/m], how much
    // of the sky they cover, -) · gxShadeK: (the blend from the first hour to the second, on, -, -) · gxKeyW: toward the key
    // light (the sun, or the moon) · gxCanopy: (the share of the sky's light under a full canopy r, g, b; the canopy's height
    // over the ground [m]) · gxSunBox: (the middle x, z of the sun's picture of the shadows, its half side [m], on) ·
    // gxFlash: (the light of a lightning flash now r, g, b; -)
    gxAirMap: { value: null }, gxShade: { value: null }, gxCloudN: { value: null }, gxAirB: v4(0.25, 1 / 129, 0, 1), gxAirK: v4(0, 0, 0, 0.012),
    gxCl0: v4(0, 0, 0.5, 0.5), gxCl1: v4(0.5, 0.5, 0, 1.4), gxCl2: v4(353, 1 / 2200, 0.36, 0), gxShadeK: v4(0, 0, 0, 0), gxKeyW: v4(0, 1, 0, 0),
    gxCanopy: v4(0.28, 0.36, 0.22, 18), gxSunBox: v4(0, 0, 0, 0), gxFlash: v4(0, 0, 0, 0) };
  R3.GX = GX;
  // the pieces of shader of the air of each place, for every material that is lit or lies in the air — declared once whichever
  // piece comes first: gxMapUV (a point of the land to the maps), gxCloud (the clouds' stuff over a point of their plane),
  // gxLightAt (the share of the key light reaching a point — the clouds' shadow, the land's, the canopy's gaps — and of the
  // sky's light there)
  const GXAIR = `#ifndef GX_AIR
#define GX_AIR
uniform sampler2D gxAirMap; uniform sampler2D gxShade; uniform sampler2D gxCloudN;
uniform vec4 gxAirB; uniform vec4 gxAirK; uniform vec4 gxCl0; uniform vec4 gxCl1; uniform vec4 gxCl2; uniform vec4 gxShadeK; uniform vec4 gxKeyW; uniform vec4 gxCanopy; uniform vec4 gxSunBox; uniform vec4 gxFlash;
vec2 gxMapUV( vec2 xz ) { return ( xz * gxAirB.x + 0.5 ) * gxAirB.y; }
float gxCloud( vec2 p ) { vec2 u = p * gxCl2.y; return 0.5 + ( ( texture2D( gxCloudN, u + gxCl0.xy ).r - 0.5 ) * gxCl1.x + ( texture2D( gxCloudN, u + gxCl0.zw ).r - 0.5 ) * gxCl1.y ) * gxCl1.w; }
// (the share of the key light that reaches a point — the clouds' shadow, the land's, the gaps of the canopy — and the share of
// the sky's light there, under the canopy: green-gold where the woods close over. Under the crowns the sun comes through
// their gaps: a dapple of sun and shade, where the sun's picture of the shadows does not reach — and everywhere in the
// lightest quality, which has none)
void gxLightAt( vec3 wp, out float ks, out vec3 sk ) {
	ks = 1.0; sk = vec3( 1.0 ); vec3 kd = gxKeyW.xyz;
	if ( gxShadeK.y > 0.0 ) {
		vec2 uv = gxMapUV( wp.xz ); vec4 sh = texture2D( gxShade, uv ); float gy = sh.b * 76.5 * gxAirB.w; float above = mix( sh.r, sh.g, gxShadeK.x ) * 51.0 * gxAirB.w;
		ks *= 1.0 - step( 0.004, above ) * smoothstep( -0.8, 0.8, gy + above - wp.y );
		// (the clouds' shadow over the land, the JS's own sum of the world's one field along the key light — G.Ceu.cloudShade —, in the
		// same texel: no read of its own)
		ks *= 1.0 - sh.a * gxCl1.z;
		if ( gxAirK.z > 0.0 ) { float cano = texture2D( gxAirMap, uv ).g * gxAirK.z;
			if ( cano > 0.004 ) {
				float top = gy + gxCanopy.w * gxAirB.w; float below = 1.0 - smoothstep( top - gxCanopy.w * 0.25 * gxAirB.w, top + gxCanopy.w * 0.15 * gxAirB.w, wp.y );
				sk = mix( vec3( 1.0 ), gxCanopy.rgb, cano * below );
				vec2 bx = abs( wp.xz - gxSunBox.xy ); float inBox = gxSunBox.w * ( 1.0 - smoothstep( gxSunBox.z * 0.72, gxSunBox.z * 0.92, max( bx.x, bx.y ) ) );
				vec2 pl = wp.xz + kd.xz * ( ( top - wp.y ) / max( kd.y, 0.15 ) );
				// (the leaves read at a level of their own: only some of the pixels come here)
				float lf = textureLod( gxCloudN, pl / 23.0, 0.5 ).g * 0.65 + textureLod( gxCloudN, pl / 7.3 + 0.41, 0.5 ).r * 0.35; float c = mix( 0.3, 0.86, cano );
				ks *= mix( 1.0, smoothstep( c - 0.07, c + 0.07, lf ), cano * below * ( 1.0 - inBox ) );
			} }
	}
}
#endif`;
  // (the haze of the horizon in a direction: shared by the sky's dome and the air in front of everything, so the far land
  // melts into exactly the sky behind it)
  const GXHAZE = `uniform vec3 gxSunW; uniform vec3 gxHor; uniform vec3 gxGlow; uniform vec3 gxBelt;
vec3 gxHaze( vec3 d ) {
	float cs = dot( d, gxSunW ); float s = max( cs, 0.0 ); float s2 = s * s; float s4 = s2 * s2; float s8 = s4 * s4; float a = max( - cs, 0.0 );
	return gxHor + gxGlow * ( s4 * 0.45 + s8 * s8 * 0.55 ) + gxBelt * a * a;
}`;
  // (the grade after the tone curve, the same here and in the post-processing's last pass)
  const GXGRADE = `uniform vec4 gxGr; uniform vec4 gxTn;
// (three.js's neutral curve — Khronos PBR Neutral — the very one, with the darks it crushes in its toe given back as much as
// gxTn.x says (0 the curve's own, 1 a straight line at black): the dark wood in the shade, and under the moon, where nearly
// all the picture lies in the toe, keep their colour instead of going black)
vec3 gxTone( vec3 color ) {
	const float sc = 0.8 - 0.04; const float ds = 0.15;
	float x = min( color.r, min( color.g, color.b ) ); color -= x < 0.08 ? ( x - 6.25 * x * x ) * ( 1.0 - gxTn.x * ( 1.0 - x * 12.5 ) ) : 0.04; // (given back only near black: the same curve from 0.08 up)
	float peak = max( color.r, max( color.g, color.b ) ); if ( peak < sc ) return color;
	float d = 1.0 - sc; float np = 1.0 - d * d / ( peak + d - sc ); color *= np / peak;
	float g = 1.0 - 1.0 / ( ds * ( peak - np ) + 1.0 ); return mix( color, vec3( np ), g );
}
vec3 gxGrade( vec3 c ) {
	float lum = dot( c, vec3( 0.2126, 0.7152, 0.0722 ) );
	// (a little richer in the middle tones, not in the lights: green stays moss, never neon)
	c = max( mix( vec3( lum ), c, 1.0 + gxGr.y * ( 1.0 - smoothstep( 0.5, 0.95, lum ) ) ), 0.0 );
	// (a gentle S in the eye's own scale: the shade deeper, the light brighter — not washed out; the darks kept)
	vec3 cp = sqrt( c ); cp = mix( cp, cp * cp * ( 3.0 - 2.0 * cp ), gxGr.z * smoothstep( 0.18, 0.5, cp ) ); c = cp * cp;
	// (at night the eye loses the colours of what is dim — the moonlit land goes blue-grey — and keeps them where a flame
	// lights: the warm pools stand out of the cool night, as they do)
	c = mix( c, vec3( lum ) * vec3( 0.8, 0.92, 1.16 ), gxGr.x * ( 1.0 - smoothstep( 0.03, 0.3, lum ) ) );
	// (the painter's split: the shadows a little cool, the lights a little warm)
	return c * mix( vec3( 1.0 - 0.04 * gxGr.w, 1.0 - 0.015 * gxGr.w, 1.0 + 0.04 * gxGr.w ), vec3( 1.0 + 0.025 * gxGr.w, 1.0, 1.0 - 0.03 * gxGr.w ), smoothstep( 0.04, 0.5, lum ) );
}`;
  R3.GLSL = { haze: GXHAZE, grade: GXGRADE };
  let toned = false;
  function toon() {
    if (toned) return; toned = true; const SC = THREE.ShaderChunk;
    // (each patch must find its place: a three.js that changed under it is said out loud, not drawn wrong in silence)
    const rep = (n, a, b) => { if (SC[n].indexOf(a) < 0) { console.warn('3D: o pedaço ' + n + ' do three.js mudou — luz incompleta'); return; } SC[n] = SC[n].replace(a, b); };
    rep('lights_lambert_pars_fragment', 'float dotNL = saturate( dot( geometryNormal, directLight.direction ) );', `float nl = dot( geometryNormal, directLight.direction );
	float dotNL = smoothstep( -0.06, 0.4, nl ) * 0.8 + saturate( nl ) * 0.2;
	#ifndef RIM
	#define RIM 0.14
	#endif
	float rimV = pow( 1.0 - saturate( dot( geometryNormal, geometryViewDir ) ), 4.0 ) * saturate( dot( -geometryViewDir, directLight.direction ) + 0.25 );
	reflectedLight.directDiffuse += directLight.color * material.diffuseColor * rimV * RIM;`);
    // (the sun's picture ends softly: near its edge the shadows thin out, so its border never shows as a line on the land)
    rep('shadowmap_pars_fragment', 'return mix( 1.0, shadow, shadowIntensity );', `vec2 se = abs( shadowCoord.xy * 2.0 - 1.0 );
		return mix( 1.0, shadow, shadowIntensity * ( 1.0 - smoothstep( 0.8, 0.97, max( se.x, se.y ) ) ) );`);
    // soft shadows where the quality has them (the key light's shadow.radius > 0: how many texels of penumbra one unit of the
    // picture's depth between a thing and its shadow makes): as the sun's are — sharp where a thing touches the ground, softer
    // the farther the shade falls from what casts it (a post's foot crisp, the crown of a tree a blur). The things in the way
    // are looked for first in a disc round the point; where there are none it is lit, where all the disc is in the way it is
    // shade, and only the edge between is gathered from a disc as wide as its penumbra — turned at each texel of the sun's
    // picture, so its grain stays on the land and does not crawl with the eye
    const disc = (n, k) => { const o = []; for (let i = 0; i < n; i++) { const r = Math.sqrt((i + 0.5) / n), a = i * 2.39996323 + k; o.push(`vec2(${(Math.cos(a) * r).toFixed(4)}, ${(Math.sin(a) * r).toFixed(4)})`); } return `const vec2 ${n === 10 ? 'GXB' : 'GXP'}[${n}] = vec2[${n}](${o.join(', ')});`; };
    rep('shadowmap_pars_fragment', 'float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {', `${disc(10, 0.6)}
	${disc(16, 0)}
	float gxSoft( sampler2D sm, vec2 size, float pk, vec3 sc ) {
		vec2 tx = 1.0 / size; vec2 cell = floor( sc.xy * size * 0.5 );
		float an = 6.2831853 * fract( sin( dot( cell, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); mat2 rot = mat2( cos( an ), sin( an ), - sin( an ), cos( an ) );
		// (the receiver's own slope in the picture's depth, from the screen's derivatives: each sample is compared with the
		// surface's own depth there, so a roof or a hillside turned from the sun does not shade itself in a wide disc)
		vec3 sx = dFdx( sc ), sy = dFdy( sc ); float det = sx.x * sy.y - sx.y * sy.x;
		vec2 dz = abs( det ) > 1e-14 ? clamp( vec2( sx.z * sy.y - sx.y * sy.z, sx.x * sy.z - sx.z * sy.x ) / det, -1.5, 1.5 ) : vec2( 0.0 );
		// (the point itself first: a post or a leg right over it is never missed between the samples of the disc)
		float zb = unpackRGBAToDepth( texture2D( sm, sc.xy ) ), nb = step( zb, sc.z ); zb *= nb;
		for ( int i = 0; i < 10; i ++ ) { vec2 o = rot * GXB[ i ] * 9.0 * tx; float d = unpackRGBAToDepth( texture2D( sm, sc.xy + o ) ); if ( d < sc.z + dot( dz, o ) ) { zb += d; nb += 1.0; } }
		if ( nb < 0.5 ) return 1.0;
		float pen = clamp( ( sc.z - zb / nb ) * pk, 1.25, 9.0 );
		if ( nb > 10.5 && pen < 8.0 ) return 0.0;
		float s = 0.0;
		for ( int i = 0; i < 16; i ++ ) { vec2 o = rot * GXP[ i ] * pen * tx; s += step( sc.z + dot( dz, o ), unpackRGBAToDepth( texture2D( sm, sc.xy + o ) ) ); }
		return s * ( 1.0 / 16.0 );
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {`);
    rep('shadowmap_pars_fragment', `#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;`, `#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			if ( shadowRadius > 0.0 ) shadow = gxSoft( shadowMap, shadowMapSize, shadowRadius, shadowCoord.xyz ); else {
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;`);
    rep('shadowmap_pars_fragment', `) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )`, `) * ( 1.0 / 9.0 ); }
		#elif defined( SHADOWMAP_TYPE_VSM )`);
    // the light of the flames and the lit doorways round the body (FX3D paints it into gxLM each frame: its colour, and in
    // gxLM2 where it comes from): every lit material adds it to the light of the sky, as a light of its own — turned to it,
    // falling off with the distance — a pool of warm light round a campfire, the street before a door, the face by a torch
    SC.lights_fragment_maps += `
#if defined( RE_IndirectDiffuse )
	if ( gxLMB.w > 0.0 ) {
		vec3 lmW = cameraPosition + ( vec4( geometryPosition, 0.0 ) * viewMatrix ).xyz; vec2 lmU = ( lmW.xz - gxLMB.xy ) * gxLMB.z;
		if ( lmU.x > 0.0 && lmU.y > 0.0 && lmU.x < 1.0 && lmU.y < 1.0 ) {
			vec4 lm1 = texture2D( gxLM, lmU );
			if ( lm1.r + lm1.g > 0.004 ) {
				vec4 lm2 = texture2D( gxLM2, lmU );
				vec3 lmL = vec3( ( lm2.r - 0.5 ) * gxLMY.z, ( gxLMY.x + ( lm2.b - 0.5 ) * gxLMY.z ) * gxLMB.w - lmW.y, ( lm2.g - 0.5 ) * gxLMY.z );
				float lmD = dot( lmL, lmL ); lmL *= inversesqrt( max( lmD, 1e-4 ) );
				irradiance += lm1.rgb * lm1.rgb * gxLMY.y * saturate( dot( ( vec4( geometryNormal, 0.0 ) * viewMatrix ).xyz, lmL ) * 0.8 + 0.2 ) / ( 1.0 + lmD * 0.45 );
			}
		}
	}
#endif`;
    SC.lights_pars_begin += '\nuniform sampler2D gxLM; uniform sampler2D gxLM2; uniform vec4 gxLMB; uniform vec4 gxLMY; uniform vec4 gxAmb;';
    // (the key light — the sun, or the moon — reaches a point as the clouds and the land let it: every lit material, so the
    // trees, the houses, the water and the people darken together when a cloud passes or a ridge hides the low sun; and the
    // sky's light is hidden by the woods' canopy over what stands under it. gxWP, gxKS and gxSK are there for the rest of the
    // material's main: a light of its own a material makes — the sun through the leaves — can take them)
    SC.lights_pars_begin += '\n' + GXAIR;
    rep('lights_fragment_begin', 'vec3 geometryPosition = - vViewPosition;', `vec3 geometryPosition = - vViewPosition;
vec3 gxWP = cameraPosition + ( vec4( geometryPosition, 0.0 ) * viewMatrix ).xyz; float gxKS; vec3 gxSK; gxLightAt( gxWP, gxKS, gxSK );`);
    rep('lights_fragment_begin', 'getDirectionalLightInfo( directionalLight, directLight );', 'getDirectionalLightInfo( directionalLight, directLight ); directLight.color *= gxKS;');
    rep('lights_fragment_begin', 'irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );', 'irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal ) * gxSK;');
    // (a lightning flash: the whole sky lights up for an instant — what is under the canopy less)
    rep('lights_fragment_begin', '#if ( NUM_HEMI_LIGHTS > 0 )', '#if ( NUM_HEMI_LIGHTS > 0 )\n\tirradiance += gxFlash.rgb * gxSK * 0.6;');
    // the air: where each point is in the world (for the mist, which lies low), carried to the fragment
    SC.fog_pars_vertex = `#ifdef USE_FOG
	varying float vFogDepth;
	varying vec3 vFogW;
#endif`;
    SC.fog_vertex = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
	vFogW = cameraPosition + ( vec4( mvPosition.xyz, 0.0 ) * viewMatrix ).xyz;
#endif`;
    SC.fog_pars_fragment = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	varying vec3 vFogW;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
	uniform vec4 gxAir; uniform vec4 gxAir2;
	${GXHAZE}
#endif
${GXAIR}`;
    // (the air is laid over the light itself, before the tone curve — the same in the picture drawn straight to the screen
    // and in the one the post-processing finishes: the haze and the sky meet in the same light)
    SC.fog_fragment = '';
    SC.tonemapping_pars_fragment += '\n' + GXGRADE;
    SC.tonemapping_fragment = `#ifdef USE_FOG
	{
		vec3 fr = vFogW - cameraPosition; float fl = length( fr ); vec3 fd = fr / max( fl, 1e-4 );
		float dl = max( fl - gxAir2.x, 0.0 );
		// (the haze of distance: nothing near, then more and more — and the low mist, thicker toward its base)
		float tau = dl * dl * gxAir.x * gxAir.x;
		float bd = clamp( gxAir.z * fr.y, -60.0, 60.0 ); float lk = abs( bd ) > 1e-3 ? ( 1.0 - exp( - bd ) ) / bd : 1.0 - 0.5 * bd;
		tau += gxAir.y * exp( - gxAir.z * ( cameraPosition.y - gxAir.w ) ) * dl * lk;
		// (and the mist of the place, where the map of the air has it — the valley at dawn, the river, the swamp, the wet woods,
		// the spray of a fall —, under its top: read at the middle of the way and at its end)
		float tauL = 0.0; vec3 mTint = vec3( 1.0 );
		if ( gxAirB.z > 0.0 ) {
			vec3 mp = mix( cameraPosition, vFogW, 0.5 ); vec4 a1 = texture2D( gxAirMap, gxMapUV( mp.xz ) ), a2 = gxAirB.z > 1.5 ? texture2D( gxAirMap, gxMapUV( vFogW.xz ) ) : a1; // (the lighter qualities read it once, at the middle)
			float t1 = a1.a * 76.5 * gxAirB.w, t2 = a2.a * 76.5 * gxAirB.w;
			float d1 = ( a1.r * gxAirK.x + a1.b * gxAirK.y ) * ( 1.0 - smoothstep( t1 - 2.5, t1 + 1.0, mp.y ) ), d2 = ( a2.r * gxAirK.x + a2.b * gxAirK.y ) * ( 1.0 - smoothstep( t2 - 2.5, t2 + 1.0, vFogW.y ) );
			tauL = ( d1 * 0.65 + d2 * 0.35 ) * fl * gxAirK.w;
			// (under the canopy it is lit by what the crowns let through: dimmer and greener than the open air's)
			mTint = mix( vec3( 1.0 ), vec3( 0.5, 0.62, 0.46 ), a2.g * gxAirK.z * ( 1.0 - smoothstep( a2.a * 76.5 * gxAirB.w, a2.a * 76.5 * gxAirB.w + 8.0, vFogW.y ) ) );
		}
		// (the blue goes first: the far hills turn blue before they fade; at the very end of the view everything is haze)
		vec3 hzC = gxHaze( normalize( vec3( fd.x, max( fd.y, 0.0 ) * 0.25, fd.z ) ) );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, hzC * mTint, 1.0 - exp( - tauL ) );
		vec3 ff = 1.0 - exp( - tau * mix( vec3( 1.0 ), vec3( 0.8, 0.93, 1.12 ), gxAir2.w ) );
		ff = max( ff, vec3( smoothstep( gxAir2.y, gxAir2.z, fl ) ) );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, hzC, ff );
	}
#endif
#if defined( TONE_MAPPING )
	gl_FragColor.rgb = gxGrade( gxTone( gl_FragColor.rgb * toneMappingExposure ) );
#endif`;
    // (and every material three.js makes from its library from now on gets the air's uniforms — the same objects)
    for (const k in THREE.ShaderLib) { const u = THREE.ShaderLib[k].uniforms; if (u && u.fogColor) Object.assign(u, GX); }
    Object.assign(THREE.UniformsLib.fog, GX);
  }
  Ce3.toon = function (three) { THREE = three; toon(); };
  // ------------------------------ the maps of the land: the air and the shade ------------------------------
  // (the map of the air — G.Ceu.airMap — and the land's shade for the key light — G.Ceu.shadeFor —, a texel at each corner of a
  // tile: made when the world's size is new; the air again when the land changes (its key), looked at every second of the
  // view's clock; the shade at two hours of the world a little apart, the light blending from one to the other as the hour goes,
  // the next made when the hour passes the second — the shadows of the ridges creep with the sun, never jump)
  const MAPS = { n: 0, air: null, shade: null, key: '', at: -1, look: 0, tA: NaN, dirA: null, dirB: null, shA: null, shB: null, ground: '', kT: 0, cRow: 0, cano: 0 }; const KW = { x: 0, y: 1, z: 0 };
  const SHADE_DT = 0.0025; // (a step of the hour between two shades: half a second of the world, under half a degree of sun)
  function mapsMake() {
    const n = G.N + 1; if (MAPS.n === n && MAPS.air) return; MAPS.n = n;
    for (const k of ['air', 'shade']) if (MAPS[k]) MAPS[k].dispose();
    const mk = () => { const t = new THREE.DataTexture(new Uint8Array(n * n * 4), n, n, THREE.RGBAFormat, THREE.UnsignedByteType); t.magFilter = t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; t.flipY = false; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true; t.clone = function () { return this; }; return t; };
    MAPS.air = mk(); MAPS.shade = mk(); GX.gxAirMap.value = MAPS.air; GX.gxShade.value = MAPS.shade; MAPS.key = ''; MAPS.tA = NaN; MAPS.ground = '';
  }
  G.worldHooks.push(() => { MAPS.key = ''; MAPS.tA = NaN; MAPS.ground = ''; MAPS.look = 0; bolts.length = 0; });
  // (the key light's direction at an hour: the sun by day, the moon when it carries the light — as the light of the hour has it)
  const _kl = {};
  function keyAt(t) { const S = G.S; const L = G.Ceu.light(t, S.weather, 0, TUNE, _kl); const d = L.byMoon ? L.md : L.sd; return { x: d.x, y: d.y, z: d.z }; }
  function mapsTick(t, vt) {
    const S = G.S; if (!MAPS.air || MAPS.n !== G.N + 1) mapsMake(); const n = MAPS.n;
    // (the air: looked at once a second of the view; made again only when the land is another)
    if (vt - MAPS.look > 1 || vt < MAPS.look || !MAPS.key) { MAPS.look = vt; const key = G.Ceu.airKey();
      if (key !== MAPS.key) { const A = G.Ceu.airMap(); MAPS.air.image.data.set(A.pic); MAPS.air.needsUpdate = true; MAPS.key = key; MAPS.at = S.clock; MAPS.cano = 0; for (let c = 0; c < A.cano.length; c++) if (A.cano[c] > 0.004) { MAPS.cano = 1; break; }
        // (the ground in the shade's B: the land the shadows and the canopy are measured from)
        const d = MAPS.shade.image.data, H = S.H; for (let c = 0; c < n * n; c++) { d[c * 4 + 2] = Math.round(G.clamp(H[c] * G.Space.HM / G.Ceu.TOPM, 0, 1) * 255); } MAPS.tA = NaN; } }
    // (the shade: two hours apart, the light blending between them)
    const kA = Math.floor(t / SHADE_DT), tA = kA * SHADE_DT;
    if (kA !== MAPS.tA) {
      const d = MAPS.shade.image.data;
      if (kA === MAPS.tA + 1 && MAPS.shB) { const old = MAPS.shA; MAPS.shA = MAPS.shB; MAPS.shB = G.Ceu.shadeFor(keyAt(tA + SHADE_DT), old); }
      else { MAPS.shA = G.Ceu.shadeFor(keyAt(tA), MAPS.shA); MAPS.shB = G.Ceu.shadeFor(keyAt(tA + SHADE_DT), MAPS.shB); }
      MAPS.tA = kA;
      for (let c = 0; c < n * n; c++) { d[c * 4] = Math.min(255, Math.round(MAPS.shA[c] / 51 * 255)); d[c * 4 + 1] = Math.min(255, Math.round(MAPS.shB[c] / 51 * 255)); }
      MAPS.shade.needsUpdate = true;
    }
    // (the clouds' shadow over the land, in the shade's A: a twelfth of the rows every other frame — the clouds drift slowly, the
    // whole made again in a third of a second or so, and the seam between two slices moves less than a hand)
    if ((MAPS.kT = (MAPS.kT + 1) & 1) === 0) { const d = MAPS.shade.image.data, H = S.H, HM = G.Space.HM, TL = G.Space.TILE; const dr = DR, cov = GX.gxCl2.value.z, kw = GX.gxKeyW.value; const rows = Math.ceil(n / 12);
      const j0 = MAPS.cRow, j1 = Math.min(n, j0 + rows); const sd = KW; sd.x = kw.x; sd.y = kw.y; sd.z = kw.z;
      if (GX.gxCl1.value.z > 0) { for (let j = j0; j < j1; j++) for (let i = 0; i < n; i++) { const c = j * n + i; d[c * 4 + 3] = Math.round((1 - G.Ceu.cloudShade(i * TL, H[c] * HM, j * TL, sd, cov, 1, dr)) * 255); } MAPS.shade.needsUpdate = true; }
      MAPS.cRow = j1 >= n ? 0 : j1; }
    GX.gxShadeK.value.x = G.clamp((t - tA) / SHADE_DT, 0, 1); GX.gxShadeK.value.y = 1;
    const B = GX.gxAirB.value; B.x = 1 / G.Space.TILE; B.y = 1 / n; B.z = (R3.Q().vlight | 0) > 0 ? 2 : 1; B.w = scene.scale.y; // (2: the higher qualities read the air twice)
  }
  // (for the verifier: the version of the land the maps the 3D draws are of, and when they were made)
  Ce3.maps = () => (MAPS.key ? { key: MAPS.key, at: MAPS.at } : null);
  // ------------------------------ the bolts of lightning ------------------------------
  // (where the world struck: G.FX.lightning is the world's word to what is seen that a bolt fell, at that place — the 3D draws it
  // there, and nowhere else. Only seen: kept a few seconds, by the world's clock)
  const bolts = Ce3.bolts = [];
  // (the canopy over a point of the world — X, Z in metres —, from the map of the air, between its four corners; and whether the
  // point lies under the crowns: their height over the ground there)
  function canopyAt(X, Y, Z) {
    const A = G.Ceu.airMap(), n = A.n, TL = G.Space.TILE; const x = G.clamp(X / TL, 0, n - 1.001), z = G.clamp(Z / TL, 0, n - 1.001); const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j; const c = j * n + i;
    const cv = (A.cano[c] * (1 - fx) + A.cano[c + 1] * fx) * (1 - fz) + (A.cano[c + n] * (1 - fx) + A.cano[c + n + 1] * fx) * fz;
    const gy = W.hAt(x, z) * G.Space.HM * scene.scale.y; const top = gy + GX.gxCanopy.value.w * scene.scale.y;
    return cv * (1 - G.smooth(top - GX.gxCanopy.value.w * 0.25, top + GX.gxCanopy.value.w * 0.15, Y));
  }
  function placeExp(cp) { return 1 + 0.6 * canopyAt(cp.x, cp.y, cp.z); }
  Ce3.canopyAt = canopyAt;
  // ------------------------------ the light in the air of the woods: the cards (the Média) ------------------------------
  // (where the woods' canopy has a gap — the map of the air, a corner in seven by the hash — a long soft card hangs from the
  // crowns down along the sun to the ground, turned to the eye about its own length: the shafts of the sun between the trunks.
  // Brightest looking toward the sun; none with the sun too high, too low, under the horizon, in the rain; a few round the body.
  // The higher qualities have the light in the air itself instead — the post's, through the sun's picture of the shadows)
  let shafts = null; const NSH = 26; let shT = -1;
  function makeShafts() {
    const g = new THREE.InstancedBufferGeometry(); const P = new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0]); g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    g.setAttribute('aP', new THREE.InstancedBufferAttribute(new Float32Array(NSH * 3), 3)); g.setAttribute('aS', new THREE.InstancedBufferAttribute(new Float32Array(NSH * 4), 4)); g.instanceCount = 0;
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide,
      uniforms: { uDir: { value: new THREE.Vector3(0, -1, 0) }, uCol: { value: new THREE.Color(0) }, uT: U.time, gxGr: GX.gxGr, gxTn: GX.gxTn },
      vertexShader: `attribute vec3 aP; attribute vec4 aS; uniform vec3 uDir; varying vec2 vU; varying float vA; varying float vPh; varying float vS;
        void main() { vec3 toE = normalize(cameraPosition - aP); vec3 sd = normalize(cross(uDir, toE)); vec3 w = aP + uDir * (position.y * aS.x) + sd * ((position.x - 0.5) * aS.y);
          vU = position.xy; vA = aS.z; vS = aS.w; vPh = dot(normalize(w - cameraPosition), -uDir); gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0); }`,
      fragmentShader: `uniform vec3 uCol; uniform float uT; varying vec2 vU; varying float vA; varying float vPh; varying float vS;
        void main() { float x = 1.0 - abs(vU.x * 2.0 - 1.0); float a = x * x * smoothstep(0.0, 0.18, vU.y) * (1.0 - smoothstep(0.55, 1.0, vU.y));
          a *= 0.8 + 0.2 * sin(uT * (0.7 + vS * 0.6) + vS * 31.0); float ph = mix(0.25, 1.7, smoothstep(-0.3, 0.95, vPh));
          gl_FragColor = vec4(uCol * a * vA * ph, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    shafts = new THREE.Mesh(g, m); shafts.frustumCulled = false; shafts.renderOrder = 2; scene.add(shafts);
  }
  function shaftsTick(L, focus, q) {
    if (!q.shafts || !focus) { if (shafts) shafts.visible = false; return; } if (!shafts) makeShafts();
    const sd = L.sd; const k = G.smooth(0.1, 0.24, sd.y) * (1 - G.smooth(0.78, 0.93, sd.y)) * (1 - L.rain) * (L.byMoon ? 0 : 1); shafts.visible = k > 0.01; if (!shafts.visible) return;
    const u = shafts.material.uniforms; u.uDir.value.set(-sd.x, -sd.y, -sd.z); u.uCol.value.setRGB(L.key[0], L.key[1], L.key[2]).multiplyScalar(L.keyI * 0.055 * k);
    // (the cards are put again twice a second of the view: where the canopy has its gaps round the body)
    const vt = U.time.value; if (vt - shT < 0.5 && vt >= shT) { shafts.visible = shafts.geometry.instanceCount > 0; return; } shT = vt;
    const A = G.Ceu.airMap(), n = A.n, TL = G.Space.TILE, HM = G.Space.HM, ky = scene.scale.y; const g = shafts.geometry, P = g.attributes.aP.array, Sx = g.attributes.aS.array;
    const ci = Math.round(focus.X / TL), cj = Math.round(focus.Z / TL), R = 8; let m = 0; const ch = GX.gxCanopy.value.w;
    for (let dj = -R; dj <= R && m < NSH; dj++) for (let di = -R; di <= R && m < NSH; di++) {
      const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= n || j >= n) continue; const c = j * n + i; const cv = A.cano[c];
      if (cv < 0.35 || cv > 0.93 || G.hash(c * 7 + 3) > 0.15) continue;
      const X = (i + (G.hash(c * 11) - 0.5) * 0.8) * TL, Z = (j + (G.hash(c * 13) - 0.5) * 0.8) * TL; const gy = W.hAt(X / TL, Z / TL) * HM; const top = (gy + ch * 0.92) * ky;
      const len = Math.min(42, ch * 0.92 * ky / Math.max(0.2, sd.y)); const d = Math.hypot(X - focus.X, Z - focus.Z);
      P[m * 3] = X; P[m * 3 + 1] = top; P[m * 3 + 2] = Z; Sx[m * 4] = len; Sx[m * 4 + 1] = 0.6 + G.hash(c * 17) * 1.2; Sx[m * 4 + 2] = (1 - G.smooth(22, 34, d)) * G.smooth(0.35, 0.55, cv) * (1 - G.smooth(0.8, 0.93, cv)); Sx[m * 4 + 3] = G.hash(c * 19);
      m++;
    }
    g.instanceCount = m; g.attributes.aP.needsUpdate = true; g.attributes.aS.needsUpdate = true; if (!m) shafts.visible = false;
  }
  Ce3.shafts = () => (shafts && shafts.visible ? shafts.geometry.instanceCount : 0);
  Ce3.bolt = function (x, y) { const S = G.S; if (!S) return; prune(); bolts.push({ x, y, at: S.clock || 0, seed: (G.VR() * 1e9) | 0, t0: -1 }); while (bolts.length > 8) bolts.shift(); };
  // (a bolt lives a second and a half of the world: then it is gone from the list, drawn or not)
  function prune() { const c = G.S ? G.S.clock || 0 : 0; for (let k = bolts.length - 1; k >= 0; k--) if (c - bolts[k].at > 1.5 || bolts[k].at > c + 0.01) bolts.splice(k, 1); }
  Ce3.live = () => { prune(); return bolts; };
  // ------------------------------ the world's rain clouds and the lightning ------------------------------
  // (each rain cloud of the world — S.clouds: the shower, the storm, the god's — where the world has it, as big as it is: a
  // tower of soft cards turned to the eye, dark at its base, the storm's tall and grey-blue, the shower's lower and paler, the
  // god's warm; under it, its rain falling as a curtain of streaks to the ground, seen from afar — gone as the eye walks under
  // it, where the drops round the body take over. The bolts where the world struck: a jagged stroke from the cloud's base to the
  // ground, its branches, a flicker or two; and the flash — the sky, the clouds and the shade lit at once)
  const NCL = 12, CARDS = 5; let cl3 = null, curtain = null, boltM = null, flashV = 0, sheetT = 0;
  // (the picture of a cloud's card: lumps of soft white, the same each time — G.hash)
  function cloudTex() {
    const S = 128; const cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d'); c.clearRect(0, 0, S, S);
    for (let k = 0; k < 26; k++) { const a = G.hash(k * 3 + 1) * TAU, r = Math.sqrt(G.hash(k * 5 + 2)) * 38, x = 64 + Math.cos(a) * r * 1.2, y = 70 + Math.sin(a) * r * 0.75 - Math.max(0, -Math.sin(a)) * r * 0.25, rr = 18 + G.hash(k * 7 + 3) * 22;
      const g = c.createRadialGradient(x, y, 0, x, y, rr); const v = 200 + Math.round(G.hash(k * 11) * 55); g.addColorStop(0, `rgba(${v},${v},${v},0.5)`); g.addColorStop(0.6, `rgba(${v},${v},${v},0.22)`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill(); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function makeClouds() {
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]), 3));
    g.setAttribute('aC', new THREE.InstancedBufferAttribute(new Float32Array(NCL * CARDS * 4), 4)); g.setAttribute('aK', new THREE.InstancedBufferAttribute(new Float32Array(NCL * CARDS * 4), 4)); g.instanceCount = 0;
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, uniforms: { tMap: { value: cloudTex() }, uLit: { value: new THREE.Color() }, uSh: { value: new THREE.Color() }, gxFlash: GX.gxFlash, gxGr: GX.gxGr, gxTn: GX.gxTn, gxSunW: GX.gxSunW, gxHor: GX.gxHor, gxGlow: GX.gxGlow, gxBelt: GX.gxBelt },
      vertexShader: `attribute vec4 aC; attribute vec4 aK; varying vec2 vU; varying vec4 vK; varying vec3 vD;
        void main() { vec3 toE = cameraPosition - aC.xyz; vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), toE)); vec3 w = aC.xyz + r * position.x * aC.w + vec3(0.0, 1.0, 0.0) * position.y * aC.w * 0.7;
          vU = position.xy + 0.5; vK = aK; vD = normalize(w - cameraPosition); gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0); }`,
      fragmentShader: `uniform sampler2D tMap; uniform vec3 uLit; uniform vec3 uSh; uniform vec4 gxFlash; varying vec2 vU; varying vec4 vK; varying vec3 vD;
        ${GXHAZE}
        void main() { vec4 t = texture2D(tMap, vec2(fract(vU.x + vK.w), vU.y)); float a = t.a * vK.x; if (a < 0.004) discard;
          // (lit on top and toward the key light, dark at the base — darker as the cloud is heavier with rain; the far ones in the haze)
          float up = smoothstep(0.1, 0.85, vU.y); vec3 c = mix(uSh * (1.0 - vK.y * 0.55), uLit, up * (0.55 + 0.45 * t.r)) + gxFlash.rgb * 2.2 * vK.y;
          c = mix(c, gxHaze(normalize(vec3(vD.x, max(vD.y, 0.0) * 0.25, vD.z))), clamp(1.0 - vK.z, 0.0, 0.85));
          gl_FragColor = vec4(c * a, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    m.blending = THREE.CustomBlending; m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor; // (premultiplied: soft over the sky)
    cl3 = new THREE.Mesh(g, m); cl3.frustumCulled = false; cl3.renderOrder = -0.3; scene.add(cl3);
    // the curtains of rain: an open cylinder of streaks under each cloud, rolling down
    const cg = new THREE.CylinderGeometry(1, 1, 1, 20, 1, true); cg.translate(0, 0.5, 0);
    const cm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, uniforms: { uT: U.time, uCol: { value: new THREE.Color() }, uA: { value: 0 }, gxGr: GX.gxGr, gxTn: GX.gxTn },
      vertexShader: 'varying vec2 vU; varying float vY; void main() { vU = uv; vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uT; uniform vec3 uCol; uniform float uA; varying vec2 vU; varying float vY;
        void main() { float st = fract(sin(floor(vU.x * 90.0) * 12.9898) * 43758.5453); float fall = fract(vU.y * 3.0 + uT * (0.9 + st * 0.6) + st);
          float a = uA * (0.55 + 0.45 * smoothstep(0.2, 0.9, fall)) * smoothstep(0.0, 0.25, vY) * (1.0 - smoothstep(0.7, 1.0, vY)) * (0.6 + 0.4 * st);
          gl_FragColor = vec4(uCol * a, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    cm.blending = THREE.CustomBlending; cm.blendSrc = THREE.OneFactor; cm.blendDst = THREE.OneMinusSrcAlphaFactor;
    curtain = []; for (let k = 0; k < 6; k++) { const mt = cm.clone(); mt.uniforms.uT = U.time; mt.blending = THREE.CustomBlending; mt.blendSrc = THREE.OneFactor; mt.blendDst = THREE.OneMinusSrcAlphaFactor; const mm = new THREE.Mesh(cg, mt); mm.frustumCulled = false; mm.visible = false; mm.renderOrder = -0.2; scene.add(mm); curtain.push(mm); }
    // the bolts: ribbons, bright past white
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(1800 * 3), 3)); bg.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(1800), 1)); bg.setDrawRange(0, 0);
    const bm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uK: { value: 0 }, gxGr: GX.gxGr, gxTn: GX.gxTn },
      vertexShader: 'attribute float aA; varying float vA; void main() { vA = aA; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uK; varying float vA; void main() { gl_FragColor = vec4(vec3(0.82, 0.88, 1.0) * 26.0 * uK * vA, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    boltM = new THREE.Mesh(bg, bm); boltM.frustumCulled = false; boltM.renderOrder = 3; scene.add(boltM);
  }
  // (the base of a cloud of the world over the sea, in metres: the storm's lowest)
  const cbase = c => (c.kind === 'storm' ? 105 : c.kind === 'divine' ? 150 : 135);
  function cloudsTick(L, focus, rdt) {
    if (!cl3) makeClouds(); const S = G.S, TL = G.Space.TILE, HM = G.Space.HM, ky = scene.scale.y; const g = cl3.geometry, C = g.attributes.aC.array, K = g.attributes.aK.array; let m = 0, cu = 0;
    const fx = focus ? focus.X : camera.position.x, fz = focus ? focus.Z : camera.position.z;
    const key = L.key, kI = L.keyI; cl3.material.uniforms.uLit.value.setRGB(key[0] * kI * 0.3 + L.sky[0] * 0.3, key[1] * kI * 0.3 + L.sky[1] * 0.3, key[2] * kI * 0.3 + L.sky[2] * 0.3);
    cl3.material.uniforms.uSh.value.setRGB(L.sky[0] * 0.2, L.sky[1] * 0.2, L.sky[2] * 0.22);
    for (let q = 0; q < S.clouds.length && m < NCL * CARDS; q++) {
      const c = S.clouds[q]; const X = c.x * TL, Z = c.y * TL; const d = Math.hypot(X - fx, Z - fz); if (d > 900) continue;
      const it = G.Nature && G.Nature.cloudIntensity ? G.Nature.cloudIntensity(c) : 0.6; const R = c.r * TL; const storm = c.kind === 'storm', god = c.kind === 'divine';
      const base = (G.SEA * HM + cbase(c)) * ky; const tall = storm ? 2.1 : 1.3; const near = 1 - G.smooth(R * 0.6, R * 1.1, d); // (under it, the cloud is the ceiling the dome's grey already is)
      for (let k = 0; k < CARDS && m < NCL * CARDS; k++) { const h = G.hash(q * 31 + k * 7 + ((c.ph * 100) | 0)), h2 = G.hash(q * 17 + k * 13 + 5); const a = h * TAU, rr = R * 0.45 * Math.sqrt(h2);
        C[m * 4] = X + Math.cos(a) * rr; C[m * 4 + 1] = base + R * tall * (0.25 + 0.5 * k / CARDS); C[m * 4 + 2] = Z + Math.sin(a) * rr; C[m * 4 + 3] = R * (1.6 - k * 0.12) * (0.9 + h2 * 0.3);
        K[m * 4] = it * (0.75 + 0.25 * h) * (1 - near * 0.85) * (god ? 0.8 : 1); K[m * 4 + 1] = storm ? 1 : god ? 0 : 0.45; K[m * 4 + 2] = 1 - G.smooth(300, 900, d) * 0.8; K[m * 4 + 3] = h2; m++; }
      // (its rain, a curtain to the ground, but for the god's)
      if (!god && cu < curtain.length && it > 0.15) { const mm = curtain[cu++]; const gy = W.hAt(G.clamp(c.x, 0, G.N - 0.01), G.clamp(c.y, 0, G.N - 0.01)) * HM * ky; mm.visible = true; mm.position.set(X, gy, Z); mm.scale.set(R * 0.75, Math.max(1, base - gy), R * 0.75);
        const u = mm.material.uniforms; u.uA.value = it * (storm ? 0.32 : 0.2) * (1 - near) * (1 - G.smooth(450, 900, d)); u.uCol.value.setRGB(L.sky[0] * 0.18 + 0.02, L.sky[1] * 0.18 + 0.02, L.sky[2] * 0.2 + 0.03); }
    }
    for (let k = cu; k < curtain.length; k++) curtain[k].visible = false;
    g.instanceCount = m; g.attributes.aC.needsUpdate = true; g.attributes.aK.needsUpdate = true; cl3.visible = m > 0; // (no cloud of the world near: no call)
    // the bolts the world struck, and the flash; and the sheet lightning inside a storm cloud (only seen: its own chance)
    const live = Ce3.live(); const P = boltM.geometry.attributes.position.array, A = boltM.geometry.attributes.aA.array; let n = 0, br = 0;
    const cr = camera.position;
    for (const b of live) {
      if (b.t0 < 0) b.t0 = U.time.value; const age = U.time.value - b.t0; if (age > 0.6) continue;
      const fl = age < 0.08 ? 1 : age < 0.16 ? 0.25 : age < 0.26 ? 0.9 : Math.max(0, 1 - (age - 0.26) / 0.34) * 0.5; br = Math.max(br, fl);
      const X = b.x * TL, Z = b.y * TL, gy = W.hAt(G.clamp(b.x, 0, G.N - 0.01), G.clamp(b.y, 0, G.N - 0.01)) * HM * ky; const top = (G.SEA * HM + 110) * ky; let r = (b.seed % 2147483646) + 1;
      const rnd = () => { r = (r * 16807) % 2147483647; return (r - 1) / 2147483646; };
      const seg = (x0, y0, z0, x1, y1, z1, w, a) => { if (n + 6 > 1800) return; let sx = -(cr.z - z0), sz = cr.x - x0; const sl = Math.hypot(sx, sz) || 1; sx *= w / sl; sz *= w / sl;
        const v = [[x0 - sx, y0, z0 - sz], [x0 + sx, y0, z0 + sz], [x1 + sx, y1, z1 + sz], [x0 - sx, y0, z0 - sz], [x1 + sx, y1, z1 + sz], [x1 - sx, y1, z1 - sz]];
        for (const p of v) { P[n * 3] = p[0]; P[n * 3 + 1] = p[1]; P[n * 3 + 2] = p[2]; A[n] = a * fl; n++; } };
      let x = X + (rnd() - 0.5) * 30, y = top, z = Z + (rnd() - 0.5) * 30; const steps = 16;
      for (let k = 1; k <= steps; k++) { const u = k / steps; const nx = k === steps ? X : G.lerp(x, X, 1 / (steps - k + 1)) + (rnd() - 0.5) * 9, ny = G.lerp(top, gy, u), nz = k === steps ? Z : G.lerp(z, Z, 1 / (steps - k + 1)) + (rnd() - 0.5) * 9;
        seg(x, y, z, nx, ny, nz, 0.45, 1); if (rnd() < 0.3 && k < steps - 2) { let bx = nx, by = ny, bz = nz; const dd = rnd() < 0.5 ? -1 : 1; for (let j = 0; j < 4; j++) { const ex = bx + dd * (3 + rnd() * 7), ey = by - (4 + rnd() * 7), ez = bz + (rnd() - 0.5) * 8; seg(bx, by, bz, ex, ey, ez, 0.22, 0.5); bx = ex; by = ey; bz = ez; } }
        x = nx; y = ny; z = nz; }
    }
    boltM.geometry.setDrawRange(0, n); boltM.visible = n > 0; if (n) { boltM.geometry.attributes.position.needsUpdate = true; boltM.geometry.attributes.aA.needsUpdate = true; } boltM.material.uniforms.uK.value = 1;
    Ce3.drawnBolts = n ? live.filter(b => U.time.value - b.t0 <= 0.6).length : 0;
    // (the sheet lightning: in a storm, now and then, the clouds lit from within — no bolt, no place of the world's)
    if ((S.weather.storm || 0) > 0 && (S.weather.rain || 0) > 0.3 && G.VR() < rdt * 0.22) sheetT = 0.22;
    sheetT = Math.max(0, sheetT - rdt);
    const fv = Math.max(br * 0.9, sheetT > 0 ? (sheetT > 0.15 ? 0.35 : sheetT > 0.09 ? 0.08 : 0.25) : 0); flashV = fv;
    GX.gxFlash.value.x = fv * 0.55; GX.gxFlash.value.y = fv * 0.6; GX.gxFlash.value.z = fv * 0.75;
  }
  Ce3.flash = () => flashV;
  // ------------------------------ the shooting stars ------------------------------
  // (on a clear night, now and then — the chance of what is only seen, G.VR —, a streak high across the sky: a head and its tail
  // fading behind it, gone in under a second)
  const NMT = 14; let meteor = null, met = null;
  function meteorTick(L, rdt) {
    if (!meteor) {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NMT * 3), 3)); g.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(NMT), 1));
      meteor = new THREE.Points(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uPx: { value: 1 }, gxGr: GX.gxGr, gxTn: GX.gxTn },
        vertexShader: 'attribute float aA; uniform float uPx; varying float vA; void main() { vA = aA; gl_PointSize = max(1.0, (1.0 + aA * 2.4) * uPx); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `varying float vA; void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float a = exp(-dot(p, p) * 3.0) * vA; if (a < 0.004) discard; gl_FragColor = vec4(vec3(0.9, 0.95, 1.0) * a * 3.0, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` }));
      meteor.frustumCulled = false; meteor.renderOrder = -0.4; meteor.visible = false; scene.add(meteor);
    }
    const night = L.stars * (1 - G.smooth(0.45, 0.7, L.cover));
    if (!met && night > 0.5 && G.VR() < rdt / 35) { const a = G.VR() * TAU, e = 0.5 + G.VR() * 0.7, b = a + (G.VR() < 0.5 ? 1 : -1) * (0.5 + G.VR() * 0.6); met = { a, e, b, de: -(0.15 + G.VR() * 0.3), t: 0, life: 0.5 + G.VR() * 0.5 }; }
    if (!met) { meteor.visible = false; return; }
    met.t += rdt; if (met.t > met.life) { met = null; meteor.visible = false; return; }
    const P = meteor.geometry.attributes.position.array, A = meteor.geometry.attributes.aA.array; const u = met.t / met.life; const R = 1250;
    for (let k = 0; k < NMT; k++) { const v = Math.max(0, u - k * 0.022); const az = met.a + (met.b - met.a) * v, el = met.e + met.de * v;
      P[k * 3] = Math.cos(az) * Math.cos(el) * R; P[k * 3 + 1] = Math.sin(el) * R; P[k * 3 + 2] = Math.sin(az) * Math.cos(el) * R; A[k] = (1 - k / NMT) * Math.sin(Math.PI * u) * night; }
    meteor.geometry.attributes.position.needsUpdate = true; meteor.geometry.attributes.aA.needsUpdate = true; meteor.visible = true;
    meteor.position.copy(camera.position); meteor.scale.setScalar(Math.min(1, camera.far * 0.92 / 1400)); meteor.material.uniforms.uPx.value = renderer.getPixelRatio();
  }
  // the lights, the air and the sky, made once with the 3D (realm3d's init: after the land's material, before the others)
  Ce3.init = function (three, rn, sc, cam) {
    THREE = three; renderer = rn; scene = sc; camera = cam;
    // the light of the hour: the sky's (a hemisphere — the sky's own colour from above, the warm bounce of the land from
    // below) and one key light that casts the shadows: the sun by day, the moon by night (one light: every material pays
    // for each light it is lit by)
    hemi = new THREE.HemisphereLight(0xcfe6ff, 0x5a5a3a, 1); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.position.set(40, 80, 30); scene.add(sun); scene.add(sun.target);
    scene.fog = new THREE.Fog(0xbfd8ea, 1250, 1520);
    // the picture of the light of the flames round the body (a texel a metre; FX3D paints it each frame): its colour (the
    // root of it, for the dim light's sake), and where its light comes from. One picture for every material: three.js gives
    // each material a copy of the uniforms of its kind, and a copy of this picture is the picture itself
    { const n = 96; const mk = () => { const t = new THREE.DataTexture(new Uint8Array(n * n * 4), n, n, THREE.RGBAFormat, THREE.UnsignedByteType); t.magFilter = t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; t.flipY = false; t.needsUpdate = true; t.clone = function () { return this; }; return t; };
      R3.LM = { n, m: 1, tex: mk(), tex2: mk() }; GX.gxLM.value = R3.LM.tex; GX.gxLM2.value = R3.LM.tex2; }
    // the clouds' stuff (G.Ceu.noise: made once, the same for every world), tiling, its far reaches blurred by its smaller pictures
    { const S = G.Ceu.CLOUD.size; const t = new THREE.DataTexture(G.Ceu.noise(), S, S, THREE.RGBAFormat, THREE.UnsignedByteType); t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; GX.gxCloudN.value = t; }
    mapsMake();
    // the sky: a dome painted from the haze of the horizon (the very colour the far land melts into) up to the deep colour
    // overhead, the glow round the sun, the pink of the dusk opposite it, the sun's disc and the moon's, the stars, and a
    // layer of clouds drifting with the world's wind — thin on a fair day, a grey ceiling in the rain, lit gold at sunset
    // (only seen: it reads the weather, it is not the weather). In the same light as everything (linear, the same tone curve)
    skyU = Object.assign({ top: { value: new THREE.Color(0x5a9ae0) }, hor: { value: new THREE.Color(0xcfe4f2) }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color(0xfff0c0) }, night: { value: 0 },
      disc: { value: new THREE.Color(0) }, moonDir: { value: new THREE.Vector3(0, -1, 0) }, moonCol: { value: new THREE.Color(0) }, keyDir: { value: new THREE.Vector3(0, 1, 0) }, uStars: { value: 0 },
      cover: { value: 0.3 }, cloudCol: { value: new THREE.Color(0xffffff) }, cloudSh: { value: new THREE.Color(0x8890a0) }, skB: { value: new THREE.Vector4() }, skM: { value: new THREE.Vector4() }, skE: { value: new THREE.Vector2() }, skU: { value: new THREE.Color(0) }, moP: { value: new THREE.Vector4(0, 1, 0, 0) }, moU: { value: new THREE.Vector3(1, 0, 0) }, moV: { value: new THREE.Vector3(0, 0, 1) }, rbK: { value: 0 }, auK: { value: 0 }, haK: { value: 0 }, uGal: { value: new THREE.Vector3(0.42, 0.56, 0.71).normalize() }, ciK: { value: new THREE.Vector4(0, 1, 0, 0) }, ciCol: { value: new THREE.Color(1, 1, 1) }, uT: U.time, uWind: U.wind, uNoise: { value: G.Ground3D.cloudNoise() } }, GX);
    R3.skyU = skyU; // (the sky's colours, for what reflects it: the water, the windows — top, hor; sunDir/sunCol: the sun itself)
    skyMesh = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vd; void main(){ vd = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec4 skB; uniform vec4 skM; uniform vec2 skE; uniform vec3 skU; uniform vec4 moP; uniform vec3 moU; uniform vec3 moV; uniform float rbK; uniform float auK; uniform float haK; uniform vec3 uGal; uniform vec4 ciK; uniform vec3 ciCol; uniform vec3 top; uniform vec3 disc; uniform vec3 moonDir; uniform vec3 moonCol; uniform vec3 keyDir; uniform float uStars; uniform float cover; uniform vec3 cloudCol; uniform vec3 cloudSh; uniform float uT; uniform vec3 uWind; uniform sampler2D uNoise; varying vec3 vd;
        ${GXHAZE}
        ${GXAIR}
        // (the clouds are the world's one field on its plane, G.Ceu's: the line of sight meets the plane — far toward the
        // horizon, held there short of infinity — and reads its stuff: the big shapes, and the small but in the lightest)
        vec2 cloudP(vec3 d) { return cameraPosition.xz + d.xz * ((gxCl2.x - cameraPosition.y) / (d.y + 0.06)); }
        #ifdef SKYCHEAP
        float cloudN(vec2 p) { return gxCloud(p); }
        #else
        float cloudN(vec2 p) { vec2 u = p * gxCl2.y; vec2 o0 = u + gxCl0.xy, o1 = u + gxCl0.zw;
          float a = texture2D(gxCloudN, o0).r * 0.68 + texture2D(gxCloudN, o0 * 3.1 + 0.37).g * 0.32, b = texture2D(gxCloudN, o1).r * 0.68 + texture2D(gxCloudN, o1 * 3.1 + 0.37).g * 0.32;
          return 0.5 + ((a - 0.5) * gxCl1.x + (b - 0.5) * gxCl1.y) * gxCl1.w; }
        #endif
        #ifdef VOLCLOUD
        float cloudL(vec2 p, float lod) { vec2 u = p * gxCl2.y; vec2 o0 = u + gxCl0.xy, o1 = u + gxCl0.zw;
          float a = textureLod(gxCloudN, o0, lod).r * 0.68 + textureLod(gxCloudN, o0 * 3.1 + 0.37, lod + 1.6).g * 0.32, b = textureLod(gxCloudN, o1, lod).r * 0.68 + textureLod(gxCloudN, o1 * 3.1 + 0.37, lod + 1.6).g * 0.32;
          return 0.5 + ((a - 0.5) * gxCl1.x + (b - 0.5) * gxCl1.y) * gxCl1.w; }
        // (the Ultra: the clouds of the plane with a body — the same field, marched through their layer from its base up 420 m:
        // fuller at the base, rounded at the top; each step lit by the key light through what lies toward it, with the powder of
        // the edges — dark bellies, silver rims —, the sky's light in their shade, the far ones in the haze)
        vec4 volCloud(vec3 d, vec3 hz) {
          if (d.y < 0.015) return vec4(0.0);
          float b0 = gxCl2.x, b1 = gxCl2.x + 420.0; float t0 = max((b0 - cameraPosition.y) / d.y, 0.0), t1 = min((b1 - cameraPosition.y) / d.y, t0 + 5000.0);
          float dt = (t1 - t0) / 22.0; float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          float T = 1.0; vec3 acc = vec3(0.0); float cf = dot(d, keyDir); float ph = mix(0.8, 2.2, pow(max(cf, 0.0), 6.0));
          for (int i = 0; i < 22; i++) {
            vec3 p = cameraPosition + d * (t0 + (float(i) + jit) * dt); float hf = clamp((p.y - b0) / (b1 - b0), 0.0, 1.0);
            float lod = clamp(log2(1.0 + (t0 + float(i) * dt) / 1500.0), 0.0, 4.0); float thr = 0.98 - cover + hf * hf * 0.42; float den = smoothstep(thr, thr + 0.11, cloudL(p.xz, lod)) * (1.0 - smoothstep(0.82, 1.0, hf));
            if (den > 0.01) {
              float ld = 0.0; for (int j = 1; j <= 3; j++) { vec3 q = p + keyDir * float(j) * 55.0; float hq = clamp((q.y - b0) / (b1 - b0), 0.0, 1.0); float tq = 0.98 - cover + hq * hq * 0.42; ld += smoothstep(tq, tq + 0.11, cloudL(q.xz, lod + 0.5)); }
              float lit = exp(-ld * 1.1) * (1.0 - exp(-den * 2.2)) * 1.6;
              vec3 col = cloudCol * (0.35 + lit * ph * 1.6) + cloudSh * (0.55 + hf * 0.5) + skU * (1.0 - hf) * 0.8;
              float a = 1.0 - exp(-den * dt * 0.014); acc += T * a * col; T *= 1.0 - a; if (T < 0.03) break;
            }
          }
          float far = 1.0 - exp(-t0 / 3500.0); acc = mix(acc, hz * (1.0 - T), far * 0.75);
          return vec4(acc, (1.0 - T) * smoothstep(0.015, 0.12, d.y));
        }
        #endif
        void main(){
          vec3 d = normalize(vd); float h = d.y; float e = pow(max(h, 0.0), 0.42);
          // (from the haze of the horizon to the deep colour overhead: most of the change low down, where the air is thickest)
          vec3 hz = gxHaze(d); vec3 c = mix(hz, top, e);
          float cs = max(dot(d, gxSunW), 0.0);
          // (the bright sky round the sun reaches higher than the haze)
          c += gxGlow * (cs * cs * cs * cs * cs) * 0.3 * e * (1.0 - e * 0.6);
          // (the sky's physical base, G.Ceu.sky: the glow of the dusk along the horizon, brightest toward the sun, in the colour of
          // the sun through the most air; the haze lit round the sun — wide, as thick as the place's air; after sunset the Earth's
          // own shadow rising opposite, blue, under the pink band)
          vec2 dh = normalize(d.xz + 1e-5), sh2 = normalize(gxSunW.xz + 1e-5); float az = dot(dh, sh2);
          c += skB.rgb * skB.w * exp(-max(h, 0.0) * 9.0) * (0.2 + 0.8 * pow(az * 0.5 + 0.5, 3.0));
          { float cf = dot(d, gxSunW); float hg = 0.4224 / pow(max(1.5776 - 1.52 * cf, 1e-3), 1.5); c += skM.rgb * skM.w * hg * (0.4 + 0.6 * smoothstep(-0.05, 0.2, h)); }
          c = mix(c, c * vec3(0.5, 0.58, 0.86), skE.y * max(-az, 0.0) * (1.0 - smoothstep(skE.x - 0.02, skE.x + 0.05, h)) * step(0.0, h));
          // (under the horizon: the far haze over the sea, a little darker downward)
          if (h < 0.0) c = hz * (1.0 - min(-h * 2.0, 0.3));
          // (on a clear night, the faint river of the galaxy across the stars)
          if (uStars > 0.01 && h > 0.0) { float bd = dot(d, uGal); float n = texture2D(uNoise, d.xz / (h + 0.4) * 0.6).r;
            c += vec3(0.5, 0.56, 0.75) * exp(-bd * bd * 30.0) * (0.35 + n * 0.9) * 0.028 * uStars * smoothstep(0.0, 0.25, h); }
          // (the lights of the north: on a cold clear night, curtains of green and violet folding slowly over the north)
          if (auK > 0.001 && h > 0.0) { float ph = atan(d.x, -d.z); float nb = max(-d.z, 0.0) / max(length(d.xz), 1e-3);
            float n1 = textureLod(gxCloudN, vec2(ph * 0.55 + uT * 0.0035, 0.31), 0.0).b, n2 = textureLod(gxCloudN, vec2(ph * 2.3 - uT * 0.006, 0.71), 0.0).g; float e0 = 0.13 + n1 * 0.12;
            float v = smoothstep(e0 - 0.01, e0 + 0.025, h) * exp(-max(h - e0, 0.0) * 4.5) * (0.35 + n2 * 1.1);
            c += mix(vec3(0.08, 1.0, 0.42), vec3(0.55, 0.18, 0.95), smoothstep(0.06, 0.3, h - e0)) * v * auK * 0.062 * smoothstep(0.2, 0.75, nb); }
          // (the high thin clouds of the day, streaked along the wind, far over the others: lit white, pink at the dusk)
          if (ciK.x > 0.001 && h > 0.0) { vec2 hp = (cameraPosition.xz + d.xz * (1600.0 / (h + 0.05))) / 6400.0 + gxCl0.xy * 0.35; vec2 wd = ciK.yz; vec2 q = vec2(dot(hp, wd), dot(hp, vec2(-wd.y, wd.x)) * 3.2);
            float cl2 = min(log2(1.0 + 0.3 / max(h, 0.02)), 4.0); float cn = textureLod(gxCloudN, q, cl2).b * 0.7 + textureLod(gxCloudN, q * 2.7 + 0.13, cl2 + 1.0).g * 0.3; float ci = smoothstep(0.52, 0.8, cn) * ciK.x * smoothstep(0.0, 0.18, h);
            c = mix(c, ciCol + skU * 0.8, ci * 0.42); }
          // (the bow opposite the sun after a shower: red outside at 42°, violet in; a fainter second one at 51°, its colours turned)
          if (rbK > 0.001 && h > -0.02) { float ra = acos(clamp(dot(d, -gxSunW), -1.0, 1.0));
            for (int b = 0; b < 2; b++) { float r0 = b == 0 ? 0.733 : 0.89; float u = b == 0 ? (r0 - ra) / 0.036 : (ra - r0) / 0.05;
              vec3 rc = clamp(vec3(1.0 - u * 1.6, 1.0 - abs(u - 0.45) * 2.4, u * 1.7 - 0.55), 0.0, 1.0); float bm = smoothstep(-0.12, 0.05, u) * (1.0 - smoothstep(0.95, 1.12, u));
              c += rc * bm * rbK * (b == 0 ? 0.1 : 0.035) * smoothstep(-0.02, 0.08, h); } }
          float cl = 0.0;
          #ifdef VOLCLOUD
          { vec4 vc = volCloud(d, hz); c = c * (1.0 - vc.a) + vc.rgb; cl = vc.a; }
          #else
          if (h > 0.0) {
            vec2 cp = cloudP(d);
            float n = cloudN(cp);
            cl = smoothstep(0.98 - cover, 1.18 - cover, n) * smoothstep(0.0, 0.22, h);
            float thick = smoothstep(0.98 - cover, 1.5 - cover, n);
            // (a cloud is lit on the side of the key light and grey in its own shade: denser toward the light is darker here;
            // its thin edges toward the sun shine — the silver lining, gold at sunset)
            #ifdef SKYCHEAP
            float ns = n + thick * 0.08;
            #else
            float ns = cloudN(cp + normalize(keyDir.xz + 1e-4) * 40.0);
            #endif
            float sh = clamp((ns - n) * 5.0 + thick * 0.45, 0.0, 1.0);
            vec3 cc = mix(cloudCol, cloudSh, sh) + gxGlow * pow(cs, 4.0) * 0.55 * (1.0 - thick);
            // (while the sun is low and just under the horizon the clouds are lit from below, red and gold — brightest toward it)
            cc += skU * (1.0 - thick * 0.35) * (0.35 + 0.65 * pow(az * 0.5 + 0.5, 2.0));
            c = mix(c, cc, cl * 0.94);
          }
          #endif
          // (the sun's disc, brighter than white — the glow of the higher qualities catches it — and the moon's with its halo;
          // both behind the clouds)
          c += disc * smoothstep(0.99955, 0.99975, cs) * (1.0 - cl);
          float cm = max(dot(d, moonDir), 0.0);
          // (the moon: its face lit by the sun as its phase has it — the lit side toward the sun —, the dark seas on it, the faint
          // light of the earth on its dark part; its glow as bright as the part that is lit; and in a high thin cloud, its ring)
          if (cm > 0.9993) { vec2 mp = vec2(dot(d, moU), dot(d, moV)) / 0.026; float r2 = dot(mp, mp);
            if (r2 < 1.0) { vec3 nr = vec3(mp, sqrt(1.0 - r2)); vec3 ls = vec3(sin(moP.x), 0.0, -cos(moP.x)); float lit = smoothstep(-0.04, 0.1, dot(nr, ls));
              float mare = textureLod(gxCloudN, mp * 0.21 + 0.37, 0.0).b; float face = mix(1.0, 0.6, smoothstep(0.48, 0.68, mare));
              c += moonCol * face * (lit + 0.03) * (1.0 - smoothstep(0.9, 1.0, r2)) * (1.0 - cl * 0.85); } }
          c += moonCol * pow(cm, 300.0) * 0.05 * moP.y * (1.0 - cl * 0.85);
          if (haK > 0.001) { float ma = acos(clamp(cm, -1.0, 1.0)); c += moonCol * 0.012 * haK * exp(-pow((ma - 0.384) / 0.022, 2.0)); }
          c += gxFlash.rgb * (0.12 + cl * 0.75); // (the flash: the clouds lit from within, the sky with them)
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #ifdef TONE_MAPPING
          gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0; // (no bands in the gradient)
          #endif
        }`,
    }));
    skyMesh.renderOrder = -1; skyMesh.frustumCulled = false; scene.add(skyMesh);
    // the stars: many faint and a few bright (the magnitudes of a real sky), white, blue-white and a few orange, more of them
    // along the river of the galaxy; each twinkles, the more the nearer the horizon, where the air is thick and dims them; and
    // the clouds of the sky hide them (the same clouds the dome draws, read at each star)
    { const n = 1500, p = new Float32Array(n * 3), m = new Float32Array(n * 2), gb = new THREE.Vector3(0.42, 0.56, 0.71).normalize(); let k = 0;
      for (let q = 0; k < n && q < n * 4; q++) {
        const a = G.hash(q * 3 + 1) * TAU, e = Math.asin(G.hash(q * 7 + 2) * 0.96 + 0.03), r = 1300; const x = Math.cos(a) * Math.cos(e), y = Math.sin(e), z = Math.sin(a) * Math.cos(e);
        const band = Math.abs(x * gb.x + y * gb.y + z * gb.z); if (G.hash(q * 13 + 5) > 0.35 + 0.65 * Math.exp(-band * band * 18)) continue; // (thinner away from the band)
        p[k * 3] = x * r; p[k * 3 + 1] = y * r; p[k * 3 + 2] = z * r; const mg = G.hash(q * 11 + 3); m[k * 2] = Math.pow(mg, 7); m[k * 2 + 1] = G.hash(q * 17 + 9); k++;
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aM', new THREE.BufferAttribute(m, 2)); g.setDrawRange(0, k);
      stars = new THREE.Points(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
        uniforms: { uStars: { value: 0 }, uPx: { value: 1 }, uT: U.time, uWind: U.wind, cover: null, gxCloudN: GX.gxCloudN, gxCl0: GX.gxCl0, gxCl1: GX.gxCl1, gxCl2: GX.gxCl2, gxGr: GX.gxGr, gxTn: GX.gxTn },
        vertexShader: `attribute vec2 aM; uniform float uStars; uniform float uPx; uniform float uT; uniform vec3 uWind; uniform float cover; uniform sampler2D gxCloudN; uniform vec4 gxCl0; uniform vec4 gxCl1; uniform vec4 gxCl2; varying vec3 vC; varying float vA;
          void main() { vec3 d = normalize(mat3(modelMatrix) * position); float h = d.y; // (where the star is now: the sky turns)
            vec2 u = (cameraPosition.xz + d.xz * ((gxCl2.x - cameraPosition.y) / (h + 0.06))) * gxCl2.y; vec2 o0 = u + gxCl0.xy, o1 = u + gxCl0.zw;
            float cn = 0.5 + ((texture2D(gxCloudN, o0).r * 0.68 + texture2D(gxCloudN, o0 * 3.1 + 0.37).g * 0.32 - 0.5) * gxCl1.x + (texture2D(gxCloudN, o1).r * 0.68 + texture2D(gxCloudN, o1 * 3.1 + 0.37).g * 0.32 - 0.5) * gxCl1.y) * gxCl1.w;
            float cl = smoothstep(0.98 - cover, 1.18 - cover, cn) * smoothstep(0.0, 0.22, h);
            float tw = 1.0 + sin(uT * (2.3 + aM.y * 3.1) + aM.y * 61.0) * mix(0.12, 0.4, 1.0 - smoothstep(0.05, 0.45, h));
            vA = uStars * (0.22 + aM.x * 1.6) * tw * (1.0 - cl * 0.97) * smoothstep(0.0, 0.18, h);
            vC = aM.y < 0.12 ? vec3(1.0, 0.78, 0.55) : aM.y < 0.45 ? vec3(0.78, 0.86, 1.0) : vec3(1.0);
            gl_PointSize = max(1.0, (1.4 + aM.x * 2.6) * uPx); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`, // (never under a pixel: the lightest quality draws a smaller picture)
        fragmentShader: `varying vec3 vC; varying float vA; void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float a = exp(-dot(p, p) * 3.0) * vA; if (a < 0.004) discard; gl_FragColor = vec4(vC * a, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          }` }));
      stars.material.uniforms.cover = skyU.cover;
      stars.frustumCulled = false; stars.renderOrder = -0.5; scene.add(stars); }
    R3.sun = sun; R3.hemi = hemi; R3.skyMesh = skyMesh; R3.stars = stars;
  };
  // (what the quality changes here: the sun's picture of the shadows, the sky in its cheap way where no grain is drawn)
  Ce3.quality = function (q) {
    sun.castShadow = !!q.shadows;
    // (the side of the sun's picture: never more than the graphics card can hold)
    if (q.shadows) { const n = Math.min(q.shadows, renderer.capabilities.maxTextureSize || 4096); sun.shadow.mapSize.set(n, n); shadowKey = ''; if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    skyMesh.material.defines = q.detail === 0 ? { SKYCHEAP: 1 } : q.vclouds ? { VOLCLOUD: 1 } : {}; skyMesh.material.needsUpdate = true;
  };
  // ------------------------------ the light of the hour ------------------------------
  // the hour is the world's (S.time) and nothing else: G.Ceu says the sun and the moon, the colours of the light and of the sky,
  // the key light, the sky's light in the shade, the dome's colours, the clouds, the stars, the exposure, the mist of the hour —
  // here they are only given to the drawing: the lights, the dome, the uniforms of the air every material reads
  const Ce = () => G.Ceu;
  const lum = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  // (the light's own dials, for the tests and the eye: G.Ceu.TUNE — 1 is the light as it is made)
  const TUNE = R3.TUNE = G.Ceu.TUNE;
  // (the light of this hour, read only: for the tests and for what wants to match it)
  const LT = { air: [1, 1, 1], sun: [0, 0, 0], zen: [0, 0, 0], hor: [0, 0, 0], glow: [0, 0, 0], belt: [0, 0, 0], fill: [0, 0, 0], sky: [0, 0, 0], bounce: [0, 0, 0], key: [0, 0, 0] };
  R3.LT = LT;
  let _sd = null, _md = null, _cf = null, shadowKey = '', shadowTick = 0; let lastVT = -1; let MU = null, MV = null, MQ = null, MAX = null; const MOON = {}; const DR = {}, SKY = { band: [0, 0, 0, 0], halo: [0, 0, 0, 0], shadow: [0, 0], under: [0, 0, 0] };
  // the light of the frame: G.Ceu's light of the hour given to the lights, the dome and the air; the sun's picture of the
  // shadows over the ground round the focus. Gives the light (G.Ceu.L) — the water and the others read it
  Ce3.light = function (focus) {
    if (!_sd) { _sd = new THREE.Vector3(); _md = new THREE.Vector3(); _cf = new THREE.Vector3(); MU = new THREE.Vector3(); MV = new THREE.Vector3(); MQ = new THREE.Quaternion(); MAX = new THREE.Vector3(); }
    const S = G.S; const w = S.weather; const t = S.time;
    const L = Ce().light(t, w, S.clouds ? S.clouds.length : 0, TUNE);
    for (const k in LT) { const a = L[k]; for (let q = 0; q < 3; q++) LT[k][q] = a[q]; }
    const night = L.night, rain = L.rain, storm = L.storm, dayL = L.dayL;
    _sd.set(L.sd.x, L.sd.y, L.sd.z); _md.set(L.md.x, L.md.y, L.md.z);
    const key = L.key, keyI = L.keyI, skyIrr = L.sky, bounce = L.bounce, hor = L.hor, glow = L.glow, belt = L.belt, zen = L.zen;
    const kd = L.byMoon ? _md : _sd;
    sun.color.setRGB(key[0], key[1], key[2]); sun.intensity = keyI;
    hemi.intensity = 1; hemi.color.setRGB(skyIrr[0], skyIrr[1], skyIrr[2]); hemi.groundColor.setRGB(bounce[0], bounce[1], bounce[2]);
    GX.gxAmb.value.x = L.amb;
    // the sky's dome: its colours, the discs, the clouds lit by the key light (gold at sunset, grey and low in the rain)
    skyU.top.value.setRGB(L.top[0], L.top[1], L.top[2]); skyU.hor.value.setRGB(hor[0], hor[1], hor[2]); skyU.night.value = night;
    skyU.sunDir.value.copy(_sd); skyU.sunCol.value.setRGB(L.sunCol[0], L.sunCol[1], L.sunCol[2]);
    skyU.disc.value.setRGB(L.disc[0], L.disc[1], L.disc[2]);
    skyU.moonDir.value.copy(_md); skyU.moonCol.value.setRGB(L.moonCol[0], L.moonCol[1], L.moonCol[2]);
    skyU.keyDir.value.copy(kd);
    // (the clouds: the world's one field, drifting by the world's clock — G.Ceu.drift —, as much of the sky covered over the
    // body as the hour, the day, the weather and the rain clouds of the world say)
    { const dr = G.Ceu.drift(S.clock || 0, w, DR); const fx = focus ? focus.X / G.Space.TILE : G.N / 2, fy = focus ? focus.Z / G.Space.TILE : G.N / 2;
      L.cover = G.Ceu.cover(t, w, S.clouds ? S.clouds.length : 0, S.day, fx, fy);
      const C0 = GX.gxCl0.value, C1 = GX.gxCl1.value, C2 = GX.gxCl2.value; C0.x = dr.x0; C0.y = dr.z0; C0.z = dr.x1; C0.w = dr.z1;
      // (a cloud's shadow is as dark as the key light is strong over the land: none at night under a thin moon, little in the
      // grey of the rain, where there is no sun left to shade)
      C1.x = dr.w0; C1.y = dr.w1; C1.w = dr.k; C1.z = 0.78 * G.smooth(0.02, 0.15, (L.byMoon ? L.md : L.sd).y) * G.clamp(L.keyI / 1.6, 0, 1) * (1 - rain * 0.85);
      C2.x = (G.Ceu.CLOUD.h + G.SEA * G.Space.HM) * scene.scale.y; C2.y = 1 / G.Ceu.CLOUD.scale; C2.z = L.cover;
      const kw = GX.gxKeyW.value, kv = L.byMoon ? L.md : L.sd; kw.x = kv.x; kw.y = kv.y; kw.z = kv.z; }
    // (the map of the air and the land's shade; the mist of each place as thick as the hour makes it)
    mapsTick(t, U.time.value);
    // (and thicker where the land round the body is still wet from a rain the sun is drying: the land steaming)
    { let wm = 0; if (focus && S.wet) { const N = G.N, cx = G.clamp(Math.floor(focus.X / G.Space.TILE), 0, N - 1), cy = G.clamp(Math.floor(focus.Z / G.Space.TILE), 0, N - 1); let n = 0;
        for (let j = cy - 4; j <= cy + 4; j += 2) for (let i = cx - 4; i <= cx + 4; i += 2) { if (i < 0 || j < 0 || i >= N || j >= N) continue; wm += S.wet[j * N + i]; n++; } wm = n ? wm / n : 0; }
      const mn = G.Ceu.mistNow(t, w, wm); const K = GX.gxAirK.value; K.x = mn.dawn; K.y = mn.last; K.z = MAPS.cano; K.w = 0.012; } // (the canopy read only where the woods have one)
    { const fx = focus ? focus.X / G.Space.TILE : G.N / 2, fy = focus ? focus.Z / G.Space.TILE : G.N / 2; const K = G.Ceu.sky(t, fx, fy, w, SKY);
      skyU.skB.value.set(K.band[0], K.band[1], K.band[2], K.band[3]); skyU.skM.value.set(K.halo[0], K.halo[1], K.halo[2], K.halo[3]); skyU.skE.value.set(K.shadow[0], K.shadow[1]); skyU.skU.value.setRGB(K.under[0], K.under[1], K.under[2]);
      // (and the far land goes blue as soon as the place's air says: the wet woods' milky, the desert's clear)
      L.hazeK = K.haze; }
    { const mo = G.Ceu.moon(t, S.day, MOON); const sd = _sd, md = _md; skyU.moP.value.set(mo.phase * TAU, mo.lit, 0, 0);
      // (the moon's frame: its first axis toward the sun as seen on the sky, so its lit side faces the sun)
      const k = sd.x * md.x + sd.y * md.y + sd.z * md.z; MU.set(sd.x - md.x * k, sd.y - md.y * k, sd.z - md.z * k); if (MU.lengthSq() < 1e-8) MU.set(1, 0, 0); MU.normalize(); MV.crossVectors(md, MU).normalize();
      skyU.moU.value.copy(MU); skyU.moV.value.copy(MV);
      // (the stars and the river of the galaxy turn about the pole through the night)
      const P = G.Ceu.POLE; MQ.setFromAxisAngle(MAX.set(P.x, P.y, P.z), G.Ceu.starTurn(t)); stars.quaternion.copy(MQ); skyU.uGal.value.set(0.42, 0.56, 0.71).normalize().applyQuaternion(MQ);
      const fx = focus ? focus.X / G.Space.TILE : G.N / 2, fy = focus ? focus.Z / G.Space.TILE : G.N / 2;
      skyU.rbK.value = G.Ceu.rainbow(t, fx, fy, w); skyU.auK.value = G.Ceu.aurora(t, fx, fy, w, L.cover);
      // (the high thin clouds of the day: more on one day than on another — the day's air, never the world's chance)
      const da = G.Ceu.dayAir(S.day); const wd = G.Ceu.wind(w); const ci = G.smooth(0.45, 0.85, da.cirrus) * (1 - rain) * (R3.Q().detail === 0 ? 0 : 1);
      skyU.ciK.value.set(ci, wd.x, wd.y, 0); skyU.ciCol.value.setRGB(L.cloudCol[0] * 1.25 + L.glow[0] * 0.15, L.cloudCol[1] * 1.25 + L.glow[1] * 0.12, L.cloudCol[2] * 1.25 + L.glow[2] * 0.1);
      skyU.haK.value = ci * (L.byMoon ? 1 : 0) * (1 - G.smooth(0.55, 0.8, L.cover)); }
    skyU.cover.value = L.cover;
    skyU.cloudCol.value.setRGB(L.cloudCol[0], L.cloudCol[1], L.cloudCol[2]);
    skyU.cloudSh.value.setRGB(L.cloudSh[0], L.cloudSh[1], L.cloudSh[2]);
    { const st = L.stars; stars.material.uniforms.uStars.value = st; stars.material.uniforms.uPx.value = renderer.getPixelRatio(); skyU.uStars.value = st * (1 - skyU.cover.value * 0.6); }
    // (the night's grade: the dim colours going out as the sun goes down)
    GX.gxGr.value.x = L.grN; GX.gxGr.value.y = TUNE.gsat; GX.gxGr.value.z = TUNE.gs; GX.gxGr.value.w = TUNE.gsplit;
    GX.gxTn.value.x = L.toe; // (the toe given back: by day, and under the moon)
    // the air (every material reads it: GX)
    const q = R3.Q();
    GX.gxSunW.value.x = _sd.x; GX.gxSunW.value.y = _sd.y; GX.gxSunW.value.z = _sd.z;
    GX.gxHor.value.x = hor[0]; GX.gxHor.value.y = hor[1]; GX.gxHor.value.z = hor[2];
    GX.gxGlow.value.x = glow[0]; GX.gxGlow.value.y = glow[1]; GX.gxGlow.value.z = glow[2];
    GX.gxBelt.value.x = belt[0]; GX.gxBelt.value.y = belt[1]; GX.gxBelt.value.z = belt[2];
    { const A = GX.gxAir.value, A2 = GX.gxAir2.value; const mist = L.mist;
      A.x = 1.25 / Math.max(120, q.view) * (1 + rain * 0.8 + storm * 0.4) * TUNE.haze * (L.hazeK || 1); A.y = 0.0055 * mist * (1 + rain * 1.2); A.z = 0.12 / scene.scale.y; A.w = G.SEA * G.Space.HM * scene.scale.y;
      // (the haze starts past what the eye looks at: from far up, in the descent, the town is not lost in it)
      const cd = focus ? Math.hypot(camera.position.x - focus.X, camera.position.y - (focus.Y || 0), camera.position.z - focus.Z) : 0;
      A2.x = Math.max(0, cd - 8) * 0.9; A2.y = 1250; A2.z = 1520; A2.w = 0.5 + 0.5 * dayL; }
    // (the dome and the stars inside the far end of the view, wherever the quality puts it)
    { const ks = Math.min(1, camera.far * 0.92 / 1400); skyMesh.scale.setScalar(ks); stars.scale.setScalar(ks); }
    scene.fog.color.setRGB(hor[0], hor[1], hor[2]); U.sky.value.setRGB(hor[0], hor[1], hor[2]).lerp(skyU.top.value, 0.55);
    renderer.setClearColor(scene.fog.color);
    // (the eye opens under a closed canopy, as it does stepping into the woods — the canopy over the eye, from the map of the
    // air, read where the eye is and eased over the metres round it, never by the frames: the same eye, the same light)
    // (by day only: at night the eye is open already — and the exposure never past what the verifier allows)
    L.expPlace = 1 + (placeExp(camera.position) - 1) * L.dayL; renderer.toneMappingExposure = Math.min(2.9, L.exp * L.expPlace);
    G.Build3D && G.Build3D.night(G.clamp((night - 0.25) * 1.6, 0, 1)); // (the windows light up as the dark comes)
    // the dome and the stars go with the eye; the key light's picture of the shadows over the ground round the body
    skyMesh.position.copy(camera.position); stars.position.copy(camera.position);
    shaftsTick(L, focus, q);
    { const rdt = Math.max(0, U.time.value - (lastVT < 0 ? U.time.value : lastVT)); cloudsTick(L, focus, rdt); meteorTick(L, rdt); } lastVT = U.time.value;
    GX.gxSunBox.value.w = sun.castShadow ? 1 : 0;
    if (focus) placeKey(kd, focus, q);
    // (the sun's picture of the shadows made again every n frames where the quality says so: three.js keeps the frame it
    // was drawn in with it, so the shadows stay where they are; only the shadow of what moves trails a frame)
    if (!renderer.shadowMap.autoUpdate) { shadowTick = (shadowTick + 1) % Math.max(1, q.shadowEvery | 0); if (shadowTick === 0) renderer.shadowMap.needsUpdate = true; }
    void zen; void lum;
    return L;
  };
  // the far end of the view of the body's eye: where the haze has hidden all (at least 99.9% of it), never past the dome
  R3.viewFar = () => G.clamp(3 / Math.max(1e-5, GX.gxAir.value.x), 500, 1600);
  // (for the verifier: the light of the hour is numbers in their range; the key light is the sun by day and the moon by night,
  // and its picture of the shadows covers the body)
  Ce3.check = function () {
    const out = []; if (!renderer || !R3.on) return out;
    const bad = v => !Number.isFinite(v);
    for (const k in LT) if (LT[k].some(bad)) out.push(`luz: ${k} não é número`);
    for (const k in GX) { const v = GX[k].value; if (!v || v.isTexture) continue; if (bad(v.x) || bad(v.y) || bad(v.z) || bad(v.w)) out.push(`ar: ${k} não é número`); } // (the pictures of the flames' light are pictures, not numbers)
    const e = renderer.toneMappingExposure; if (bad(e) || e < 0.5 || e > 3) out.push(`exposição fora do lugar: ${e}`);
    if (bad(sun.intensity) || sun.intensity < 0 || sun.intensity > 4) out.push(`luz principal com intensidade ${sun.intensity}`);
    const s = skyU.sunDir.value.y; if (s > 0.1 && skyU.keyDir.value.dot(skyU.sunDir.value) < 0.999) out.push('de dia, a luz principal não é o sol');
    if (sun.castShadow && U.body.value && U.body.value.w) { const b = U.body.value; const c = sun.target.position; const h = sun.shadow.camera.right; if (Math.abs(b.x - c.x) > h || Math.abs(b.z - c.z) > h) out.push('a imagem das sombras não cobre o corpo'); }
    return out;
  };
  // the key light's picture of what is near the body (its shadows): a square of ground round the body, pushed a little ahead
  // of the eye (what one looks at gets the texels), its texels fixed on the land (walking, the shadows do not crawl), and only
  // as deep as the near world, so the shadows still touch the feet that cast them
  function placeKey(dir, focus, q) {
    const half = q.sbox || 45, size = sun.shadow.mapSize.x || 1024;
    camera.getWorldDirection(_cf); let fx = _cf.x, fz = _cf.z; const fl = Math.hypot(fx, fz); if (fl > 1e-3) { fx /= fl; fz /= fl; } else fx = fz = 0;
    let cx = focus.X + fx * half * 0.3, cy = focus.Y || 0, cz = focus.Z + fz * half * 0.3;
    // (the light's frame as three.js's lookAt makes it: z toward the light, x = up × z, y = z × x)
    const xl = Math.hypot(dir.z, dir.x) || 1, xx = dir.z / xl, xz = -dir.x / xl; const yx = dir.y * xz, yy = dir.z * xx - dir.x * xz, yz = -dir.y * xx;
    const tx = 2 * half / size; const u = cx * xx + cz * xz, v = cx * yx + cy * yy + cz * yz;
    const du = Math.round(u / tx) * tx - u, dv = Math.round(v / tx) * tx - v;
    cx += du * xx + dv * yx; cy += dv * yy; cz += du * xz + dv * yz;
    const D = half * 2.5 + 20; sun.position.set(cx + dir.x * D, cy + dir.y * D, cz + dir.z * D); sun.target.position.set(cx, cy, cz); sun.target.updateMatrixWorld();
    { const bx = GX.gxSunBox.value; bx.x = cx; bx.y = cz; bx.z = half; } // (where the sun's picture reaches: under the canopy the dapple is its own there)
    const kk = half + ':' + size + ':' + (q.soft | 0); if (kk !== shadowKey) {
      shadowKey = kk; const c = sun.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = Math.max(1, D - half * 2.5 - 20); c.far = D + half * 2.5 + 20; c.updateProjectionMatrix();
      // (a bias of a few centimetres in the picture's depth, and along the normal a little under a texel: no stripes of
      // self-shadow on the lit walls, and no gap between a foot and its shadow)
      sun.shadow.bias = -0.05 / (c.far - c.near); sun.shadow.normalBias = tx * 0.7;
      // (the soft shadows: the penumbra a shade makes per metre between it and what casts it — a little wider than the sun's
      // own half a degree, as a painter softens them — in texels of the picture per unit of its depth)
      sun.shadow.radius = q.soft ? (c.far - c.near) * 0.03 / tx : 0;
      renderer.shadowMap.needsUpdate = true;
    }
  }

})(window.G);
