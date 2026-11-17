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
  const R3 = G.Realm; const TAU = Math.PI * 2;
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
    gxLM: { value: null }, gxLM2: { value: null }, gxLMB: v4(0, 0, 0, 0), gxLMY: v4(0, 16, 32, 0), gxGr: v4(0, 0.09, 0.25, 1), gxTn: v4(0.5, 0, 0, 0), gxAmb: v4(1, 0, 0, 0) };
  R3.GX = GX;
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
#endif`;
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
		// (the blue goes first: the far hills turn blue before they fade; at the very end of the view everything is haze)
		vec3 ff = 1.0 - exp( - tau * mix( vec3( 1.0 ), vec3( 0.8, 0.93, 1.12 ), gxAir2.w ) );
		ff = max( ff, vec3( smoothstep( gxAir2.y, gxAir2.z, fl ) ) );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, gxHaze( normalize( vec3( fd.x, max( fd.y, 0.0 ) * 0.25, fd.z ) ) ), ff );
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
    // the sky: a dome painted from the haze of the horizon (the very colour the far land melts into) up to the deep colour
    // overhead, the glow round the sun, the pink of the dusk opposite it, the sun's disc and the moon's, the stars, and a
    // layer of clouds drifting with the world's wind — thin on a fair day, a grey ceiling in the rain, lit gold at sunset
    // (only seen: it reads the weather, it is not the weather). In the same light as everything (linear, the same tone curve)
    skyU = Object.assign({ top: { value: new THREE.Color(0x5a9ae0) }, hor: { value: new THREE.Color(0xcfe4f2) }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color(0xfff0c0) }, night: { value: 0 },
      disc: { value: new THREE.Color(0) }, moonDir: { value: new THREE.Vector3(0, -1, 0) }, moonCol: { value: new THREE.Color(0) }, keyDir: { value: new THREE.Vector3(0, 1, 0) }, uStars: { value: 0 },
      cover: { value: 0.3 }, cloudCol: { value: new THREE.Color(0xffffff) }, cloudSh: { value: new THREE.Color(0x8890a0) }, uT: U.time, uWind: U.wind, uNoise: { value: G.Ground3D.cloudNoise() } }, GX);
    R3.skyU = skyU; // (the sky's colours, for what reflects it: the water, the windows — top, hor; sunDir/sunCol: the sun itself)
    skyMesh = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vd; void main(){ vd = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 disc; uniform vec3 moonDir; uniform vec3 moonCol; uniform vec3 keyDir; uniform float uStars; uniform float cover; uniform vec3 cloudCol; uniform vec3 cloudSh; uniform float uT; uniform vec3 uWind; uniform sampler2D uNoise; varying vec3 vd;
        ${GXHAZE}
        #ifdef SKYCHEAP
        float cloudN(vec2 uv) { return texture2D(uNoise, uv).r; }
        #else
        float cloudN(vec2 uv) { return texture2D(uNoise, uv).r * 0.68 + texture2D(uNoise, uv * 3.1 + 0.37).g * 0.32; }
        #endif
        void main(){
          vec3 d = normalize(vd); float h = d.y; float e = pow(max(h, 0.0), 0.42);
          // (from the haze of the horizon to the deep colour overhead: most of the change low down, where the air is thickest)
          vec3 hz = gxHaze(d); vec3 c = mix(hz, top, e);
          float cs = max(dot(d, gxSunW), 0.0);
          // (the bright sky round the sun reaches higher than the haze)
          c += gxGlow * (cs * cs * cs * cs * cs) * 0.3 * e * (1.0 - e * 0.6);
          // (under the horizon: the far haze over the sea, a little darker downward)
          if (h < 0.0) c = hz * (1.0 - min(-h * 2.0, 0.3));
          // (on a clear night, the faint river of the galaxy across the stars)
          if (uStars > 0.01 && h > 0.0) { float bd = dot(d, vec3(0.42, 0.56, 0.71)); float n = texture2D(uNoise, d.xz / (h + 0.4) * 0.6).r;
            c += vec3(0.5, 0.56, 0.75) * exp(-bd * bd * 30.0) * (0.35 + n * 0.9) * 0.028 * uStars * smoothstep(0.0, 0.25, h); }
          float cl = 0.0;
          if (h > 0.0) {
            vec2 uv = d.xz / (h + 0.08) * 0.11 + uWind.xy * uT * 0.0016;
            float n = cloudN(uv);
            cl = smoothstep(0.98 - cover, 1.18 - cover, n) * smoothstep(0.0, 0.22, h);
            float thick = smoothstep(0.98 - cover, 1.5 - cover, n);
            // (a cloud is lit on the side of the key light and grey in its own shade: denser toward the light is darker here;
            // its thin edges toward the sun shine — the silver lining, gold at sunset)
            #ifdef SKYCHEAP
            float ns = n + thick * 0.08;
            #else
            float ns = cloudN(uv + normalize(keyDir.xz + 1e-4) * 0.018);
            #endif
            float sh = clamp((ns - n) * 5.0 + thick * 0.45, 0.0, 1.0);
            vec3 cc = mix(cloudCol, cloudSh, sh) + gxGlow * pow(cs, 4.0) * 0.55 * (1.0 - thick);
            c = mix(c, cc, cl * 0.94);
          }
          // (the sun's disc, brighter than white — the glow of the higher qualities catches it — and the moon's with its halo;
          // both behind the clouds)
          c += disc * smoothstep(0.99955, 0.99975, cs) * (1.0 - cl);
          float cm = max(dot(d, moonDir), 0.0);
          c += moonCol * (smoothstep(0.99955, 0.99972, cm) + pow(cm, 300.0) * 0.05) * (1.0 - cl * 0.85);
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
        uniforms: { uStars: { value: 0 }, uPx: { value: 1 }, uT: U.time, uWind: U.wind, cover: null, uNoise: null, gxGr: GX.gxGr, gxTn: GX.gxTn },
        vertexShader: `attribute vec2 aM; uniform float uStars; uniform float uPx; uniform float uT; uniform vec3 uWind; uniform float cover; uniform sampler2D uNoise; varying vec3 vC; varying float vA;
          void main() { vec3 d = normalize(position); float h = d.y;
            vec2 uv = d.xz / (h + 0.08) * 0.11 + uWind.xy * uT * 0.0016; float cn = texture2D(uNoise, uv).r * 0.68 + texture2D(uNoise, uv * 3.1 + 0.37).g * 0.32;
            float cl = smoothstep(0.98 - cover, 1.18 - cover, cn) * smoothstep(0.0, 0.22, h);
            float tw = 1.0 + sin(uT * (2.3 + aM.y * 3.1) + aM.y * 61.0) * mix(0.12, 0.4, 1.0 - smoothstep(0.05, 0.45, h));
            vA = uStars * (0.22 + aM.x * 1.6) * tw * (1.0 - cl * 0.97) * smoothstep(0.0, 0.18, h);
            vC = aM.y < 0.12 ? vec3(1.0, 0.78, 0.55) : aM.y < 0.45 ? vec3(0.78, 0.86, 1.0) : vec3(1.0);
            gl_PointSize = max(1.0, (1.4 + aM.x * 2.6) * uPx); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`, // (never under a pixel: the lightest quality draws a smaller picture)
        fragmentShader: `varying vec3 vC; varying float vA; void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float a = exp(-dot(p, p) * 3.0) * vA; if (a < 0.004) discard; gl_FragColor = vec4(vC * a, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          }` }));
      stars.material.uniforms.cover = skyU.cover; stars.material.uniforms.uNoise = skyU.uNoise;
      stars.frustumCulled = false; stars.renderOrder = -0.5; scene.add(stars); }
    R3.sun = sun; R3.hemi = hemi; R3.skyMesh = skyMesh; R3.stars = stars;
  };
  // (what the quality changes here: the sun's picture of the shadows, the sky in its cheap way where no grain is drawn)
  Ce3.quality = function (q) {
    sun.castShadow = !!q.shadows;
    // (the side of the sun's picture: never more than the graphics card can hold)
    if (q.shadows) { const n = Math.min(q.shadows, renderer.capabilities.maxTextureSize || 4096); sun.shadow.mapSize.set(n, n); shadowKey = ''; if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    skyMesh.material.defines = q.detail === 0 ? { SKYCHEAP: 1 } : {}; skyMesh.material.needsUpdate = true;
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
  let _sd = null, _md = null, _cf = null, shadowKey = '', shadowTick = 0;
  // the light of the frame: G.Ceu's light of the hour given to the lights, the dome and the air; the sun's picture of the
  // shadows over the ground round the focus. Gives the light (G.Ceu.L) — the water and the others read it
  Ce3.light = function (focus) {
    if (!_sd) { _sd = new THREE.Vector3(); _md = new THREE.Vector3(); _cf = new THREE.Vector3(); }
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
      A.x = 1.25 / Math.max(120, q.view) * (1 + rain * 0.8 + storm * 0.4) * TUNE.haze; A.y = 0.0055 * mist * (1 + rain * 1.2); A.z = 0.12 / scene.scale.y; A.w = G.SEA * G.Space.HM * scene.scale.y;
      // (the haze starts past what the eye looks at: from far up, in the descent, the town is not lost in it)
      const cd = focus ? Math.hypot(camera.position.x - focus.X, camera.position.y - (focus.Y || 0), camera.position.z - focus.Z) : 0;
      A2.x = Math.max(0, cd - 8) * 0.9; A2.y = 1250; A2.z = 1520; A2.w = 0.5 + 0.5 * dayL; }
    // (the dome and the stars inside the far end of the view, wherever the quality puts it)
    { const ks = Math.min(1, camera.far * 0.92 / 1400); skyMesh.scale.setScalar(ks); stars.scale.setScalar(ks); }
    scene.fog.color.setRGB(hor[0], hor[1], hor[2]); U.sky.value.setRGB(hor[0], hor[1], hor[2]).lerp(skyU.top.value, 0.55);
    renderer.setClearColor(scene.fog.color);
    renderer.toneMappingExposure = L.exp;
    G.Build3D && G.Build3D.night(G.clamp((night - 0.25) * 1.6, 0, 1)); // (the windows light up as the dark comes)
    // the dome and the stars go with the eye; the key light's picture of the shadows over the ground round the body
    skyMesh.position.copy(camera.position); stars.position.copy(camera.position);
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
