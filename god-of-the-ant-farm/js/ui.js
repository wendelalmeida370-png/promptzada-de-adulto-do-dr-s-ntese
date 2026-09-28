'use strict';
// ============================================================
//  UI: HUD, power bar, inspector, chronicle, family tree,
//  statistics, menus, toasts & notices
// ============================================================
(function (G) {
  const UI = G.UI = {};
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svg = (inner, vb) => `<svg viewBox="${vb || '0 0 24 24'}" aria-hidden="true">${inner}</svg>`;
  const ST = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const ICON = G.ICON = {
    pop: svg('<circle cx="9" cy="7.5" r="3.4" fill="currentColor"/><path d="M2.5 20.5c0-3.8 2.9-6.6 6.5-6.6s6.5 2.8 6.5 6.6z" fill="currentColor"/><circle cx="17.3" cy="8.6" r="2.6" fill="currentColor" opacity=".75"/><path d="M16.2 13.6c3.3 0 5.6 2.4 5.6 6.2h-4.6" fill="currentColor" opacity=".75"/>'),
    food: svg('<path d="M12 22V8" ' + ST + '/><path d="M12 9c-2.6-.4-4-2.2-4-4.8 2.6.4 4 2.2 4 4.8zm0 0c2.6-.4 4-2.2 4-4.8-2.6.4-4 2.2-4 4.8zm0 5c-2.6-.4-4-2.2-4-4.8 2.6.4 4 2.2 4 4.8zm0 0c2.6-.4 4-2.2 4-4.8-2.6.4-4 2.2-4 4.8zm0 5c-2.6-.4-4-2.2-4-4.8 2.6.4 4 2.2 4 4.8zm0 0c2.6-.4 4-2.2 4-4.8-2.6.4-4 2.2-4 4.8z" fill="currentColor"/>'),
    wood: svg('<rect x="2.5" y="7.5" width="15" height="9" rx="4.5" fill="currentColor"/><ellipse cx="18" cy="12" rx="3.5" ry="4.5" fill="currentColor" opacity=".55"/><ellipse cx="18" cy="12" rx="1.5" ry="2" fill="none" stroke="currentColor" stroke-width="1.2"/>'),
    stone: svg('<path d="M3 18.5l2.8-7.5 5.2-3.6 6.2 2.2 3.8 8.9z" fill="currentColor"/><path d="M11 7.4l1.6 5.2 7.6 5.9M5.8 11l6.8 1.6" stroke="rgba(0,0,0,.25)" stroke-width="1.2" fill="none"/>'),
    faith: svg('<circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" ' + ST + '/>'),
    pause: svg('<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>'),
    scroll: svg('<path d="M6 3h11a2 2 0 0 1 2 2v12M6 3a2 2 0 0 0-2 2v2h4M6 3a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-2h-11v2a2 2 0 0 1-2 2" ' + ST + '/><path d="M12 8h4M12 12h4" ' + ST + '/>'),
    stats: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" ' + ST + '/>'),
    sound: svg('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" ' + ST + '/>'),
    mute: svg('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6" ' + ST + '/>'),
    menu: svg('<path d="M4 6h16M4 12h16M4 18h16" ' + ST + '/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18" ' + ST + '/>'),
    eye: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" ' + ST + '/><circle cx="12" cy="12" r="3" fill="currentColor"/>'),
    tree: svg('<rect x="9" y="2.5" width="6" height="4.5" rx="1" fill="currentColor"/><rect x="2.5" y="16" width="6" height="4.5" rx="1" fill="currentColor"/><rect x="15.5" y="16" width="6" height="4.5" rx="1" fill="currentColor"/><path d="M12 7v4.5M5.5 16v-4.5h13V16" ' + ST + '/>'),
    rain: svg('<path d="M7 15.5a4.2 4.2 0 0 1 .3-8.4A5.8 5.8 0 0 1 18.4 8a3.8 3.8 0 0 1-.4 7.5z" fill="currentColor"/><path d="M8 18.5l-1 2.5M12 18.5l-1 2.5M16 18.5l-1 2.5" ' + ST + '/>'),
    growth: svg('<path d="M12 21.5v-9" ' + ST + '/><path d="M12 13C12 8.6 9 6 4 6c0 4.4 3 7 8 7zM12 10.5c0-4.4 3-7 8-7 0 4.4-3 7-8 7z" fill="currentColor"/>'),
    heal: svg('<path d="M12 21s-8-4.9-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6.1-8 11-8 11z" fill="currentColor"/><path d="M12 8.5v6M9 11.5h6" stroke="#1a1410" stroke-width="2" stroke-linecap="round"/>'),
    fertility: svg('<circle cx="12" cy="6.5" r="3.4" fill="currentColor"/><circle cx="17.2" cy="10.3" r="3.4" fill="currentColor"/><circle cx="15.2" cy="16.4" r="3.4" fill="currentColor"/><circle cx="8.8" cy="16.4" r="3.4" fill="currentColor"/><circle cx="6.8" cy="10.3" r="3.4" fill="currentColor"/><circle cx="12" cy="11.8" r="2.6" fill="#1a1410"/>'),
    lightning: svg('<path d="M13.5 2L4.5 13.5h6.2L9.5 22l9.5-12.2h-6.4z" fill="currentColor"/>'),
    meteor: svg('<circle cx="15.5" cy="15.5" r="5.5" fill="currentColor"/><path d="M2.5 3.5l8 8M6.5 2.5l6.5 6.5M2.5 7.5L9 14" ' + ST + '/>'),
    wolves: svg('<ellipse cx="12" cy="16.2" rx="4.6" ry="3.9" fill="currentColor"/><ellipse cx="5.6" cy="10.8" rx="2.1" ry="2.7" fill="currentColor"/><ellipse cx="18.4" cy="10.8" rx="2.1" ry="2.7" fill="currentColor"/><ellipse cx="9.2" cy="6.4" rx="2.1" ry="2.8" fill="currentColor"/><ellipse cx="14.8" cy="6.4" rx="2.1" ry="2.8" fill="currentColor"/>'),
    hand: svg('<path d="M8 11.5V5a1.6 1.6 0 0 1 3.2 0v6M11.2 5V3.9a1.6 1.6 0 0 1 3.2 0V11M14.4 5.4a1.6 1.6 0 0 1 3.2 0V12.5c0 5-2.9 8.5-7 8.5-3.1 0-5.1-1.9-6-4.8l-1.2-4a1.6 1.6 0 0 1 3-1l1.4 3.2" ' + ST + '/>'),
    hammer: svg('<path d="M14.5 5.5l4 4-2.5 2.5-4-4z" fill="currentColor"/><path d="M13 10.5L4.5 19" ' + ST + '/><path d="M12 6.5l3-3 3.5 1" ' + ST + '/>'),
    flame: svg('<path d="M12 22c-4.2 0-7-2.8-7-6.6 0-3.6 2.6-5.4 3.4-9.4 2 1.2 3.2 3 3.4 5.4 1-1 1.6-2.4 1.6-4.4 3 2.2 5.6 5 5.6 8.6 0 3.8-2.8 6.4-7 6.4z" fill="currentColor"/>'),
    heart: svg('<path d="M12 21s-8.5-5-8.5-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.5 2.8C20.5 16 12 21 12 21z" fill="currentColor"/>'),
    cross: svg('<path d="M10 3h4v5h5v4h-5v9h-4v-9H5V8h5z" fill="currentColor"/>'),
    star: svg('<path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8z" fill="currentColor"/>'),
    cloud: svg('<path d="M7 18.5a4.6 4.6 0 0 1 .3-9.2A6 6 0 0 1 18.7 10a4.3 4.3 0 0 1-.5 8.5z" fill="currentColor"/>'),
    sun: svg('<circle cx="12" cy="12" r="4.6" fill="currentColor"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" ' + ST + '/>'),
    leaf: svg('<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" fill="currentColor"/><path d="M5 19c3-4 6-7 10-9" stroke="#1a1410" stroke-width="1.5" fill="none"/>'),
    boat: svg('<path d="M3 15h18l-3 5H6z" fill="currentColor"/><path d="M12 3v11" ' + ST + '/><path d="M12.8 4c4 2.6 5.2 6 4.6 9h-4.6z" fill="currentColor"/>'),
    save: svg('<path d="M5 3h11l3 3v15H5z" ' + ST + '/><path d="M8 3v5h7V3M8 21v-6h8v6" ' + ST + '/>'),
    home: svg('<path d="M3 11l9-7 9 7v10H3z" fill="currentColor"/>'),
    sword: svg('<path d="M14.5 3H21v6.5L10 20.5 3.5 14z" fill="currentColor"/><path d="M5 15.5l3.5 3.5M3 21l3-3M7.5 13l3.5 3.5" stroke="#1a1410" stroke-width="1.6" stroke-linecap="round"/><path d="M2.5 19.5l2 2" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>'),
    crown: svg('<path d="M3 18l1.5-10 4.5 4 3-7 3 7 4.5-4L21 18z" fill="currentColor"/><rect x="3" y="19" width="18" height="2" rx="1" fill="currentColor"/>'),
    chain: svg('<rect x="2.5" y="8.5" width="10" height="7" rx="3.5" ' + ST + '/><rect x="11.5" y="8.5" width="10" height="7" rx="3.5" ' + ST + '/>'),
    dove: svg('<path d="M3 13c3 0 5-1 7-4 1-1.6 2.6-3 5-3 1.4 0 2.4.6 3 1.4L21 7l-2 2c0 5-4 9-10 9-2 0-4-.6-5-1.5L7 15c-2 0-3.2-.8-4-2z" fill="currentColor"/>'),
    shield: svg('<path d="M12 2.5l8 3v6c0 5-3.5 8.6-8 10-4.5-1.4-8-5-8-10v-6z" fill="currentColor"/>'),
    split: svg('<path d="M12 21v-7M12 14L5 5M12 14l7-9M5 5v4M5 5h4M19 5v4M19 5h-4" ' + ST + '/>'),
    scale: svg('<path d="M12 3v18M7 21h10M4 7h16" ' + ST + '/><path d="M4 7l-2.5 6h5zM20 7l-2.5 6h5z" fill="currentColor"/>'),
    skullx: svg('<path d="M12 2.5c-5 0-8 3.3-8 7.6 0 2.7 1.3 4.4 3 5.4V19h10v-3.5c1.7-1 3-2.7 3-5.4 0-4.3-3-7.6-8-7.6z" fill="currentColor"/><circle cx="9" cy="10.5" r="1.8" fill="#1a1410"/><circle cx="15" cy="10.5" r="1.8" fill="#1a1410"/><path d="M9 19v2.5M12 19v2.5M15 19v2.5" stroke="currentColor" stroke-width="1.6"/>'),
    quake: svg('<path d="M2 17h5l2-4 3 6 2-8 2 6h6" ' + ST + '/><path d="M4 21h16" ' + ST + ' opacity=".5"/><path d="M8 4l2 3-2 2M15 3l-1 3 2 2" ' + ST + '/>'),
    plague: svg('<circle cx="12" cy="12" r="5.2" fill="currentColor"/><path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2M5.3 5.3l2.3 2.3M16.4 16.4l2.3 2.3M5.3 18.7l2.3-2.3M16.4 7.6l2.3-2.3" ' + ST + '/><circle cx="10.4" cy="10.6" r="1.2" fill="#1a1410"/><circle cx="13.8" cy="13.2" r="1" fill="#1a1410"/>'),
    anoint: svg('<path d="M4 15l1.4-7 4 3.4L12 5l2.6 6.4 4-3.4L20 15z" fill="currentColor"/><rect x="4" y="16.2" width="16" height="2.2" rx="1" fill="currentColor"/><path d="M12 19.5c-1 1.4-1 2.4 0 2.5 1-.1 1-1.1 0-2.5z" fill="currentColor"/>'),
    liberate: svg('<rect x="2" y="9" width="8.5" height="6" rx="3" ' + ST + '/><path d="M13.5 9h5.5a3 3 0 0 1 0 6h-5.5" ' + ST + '/><path d="M11.2 6.5l1.2 2M12.8 17.5l-1.2-2M11.9 12h1.2" ' + ST + '/>'),
    fury: svg('<path d="M4 20l6-6M20 20l-6-6" ' + ST + '/><path d="M14.5 3H21v6.5L13 17.5 6.5 11zM9.5 3H3v6.5l8 8 6.5-6.5z" fill="currentColor" opacity=".9"/>'),
    discord: svg('<path d="M12 21s-8.5-5-8.5-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.5 2.8C20.5 16 12 21 12 21z" fill="currentColor"/><path d="M12 7l-1.5 4 3 2-2 3.5 1 2.5" stroke="#1a1410" stroke-width="1.8" fill="none" stroke-linejoin="round"/>'),
    peace: svg('<path d="M3 13c3 0 5-1 7-4 1-1.6 2.6-3 5-3 1.4 0 2.4.6 3 1.4L21 7l-2 2c0 5-4 9-10 9-2 0-4-.6-5-1.5L7 15c-2 0-3.2-.8-4-2z" fill="currentColor"/><path d="M8 13.5c2 .5 4-.5 5.5-2.5" stroke="#1a1410" stroke-width="1.2" fill="none" opacity=".45"/>'),
    grave: svg('<path d="M6 21v-10a6 6 0 0 1 12 0v10z" fill="currentColor"/><path d="M12 9v6M9.5 11.5h5" stroke="#1a1410" stroke-width="1.6"/>'),
    tech: svg('<path d="M2.5 5c3.2-1.2 6.4-1 9.5 1 3.1-2 6.3-2.2 9.5-1v14c-3.2-1.2-6.4-1-9.5 1-3.1-2-6.3-2.2-9.5-1z" fill="currentColor"/><path d="M12 6v14M5 9c1.6-.4 3.2-.3 4.6.3M5 12.5c1.6-.4 3.2-.3 4.6.3M14.4 9.3c1.4-.6 3-.7 4.6-.3M14.4 12.8c1.4-.6 3-.7 4.6-.3" stroke="#1a1410" stroke-width="1.2" fill="none"/>'),
    book: svg('<path d="M5 3h12.5a1.5 1.5 0 0 1 1.5 1.5V21H6.5A2.5 2.5 0 0 1 4 18.5V4a1 1 0 0 1 1-1z" fill="currentColor"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H19" stroke="#1a1410" stroke-width="1.4" fill="none"/><path d="M9 7h6M9 10h4" stroke="#1a1410" stroke-width="1.4"/>'),
    city: svg('<path d="M2 21V11l4-3 4 3v10zM10 21V6l5-3.2L20 6v15zM20 21v-7h2.5v7z" fill="currentColor"/><path d="M4.5 14h3M4.5 17.5h3M13 9h4M13 12.5h4M13 16h4" stroke="#1a1410" stroke-width="1.4"/>'),
    ship: svg('<path d="M1.5 14h21l-3.5 5H5z" fill="currentColor"/><path d="M12 2v11" stroke="currentColor" stroke-width="1.8"/><path d="M12.8 3c3.6 1.2 5.4 3.4 5.4 5.4 0 1.6-.8 2.8-1.8 3.6h-3.6z" fill="currentColor"/><path d="M6 19.5l-1.6 2.5M10 19.5l-1.2 2.5M14 19.5l-.8 2.5M18 19.5l-.4 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'),
    cart: svg('<path d="M2.5 7.5h14l-1 7.5h-12z" fill="currentColor"/><circle cx="6.5" cy="18" r="2.8" fill="currentColor"/><circle cx="13.5" cy="18" r="2.8" fill="currentColor"/><circle cx="6.5" cy="18" r="1" fill="#1a1410"/><circle cx="13.5" cy="18" r="1" fill="#1a1410"/><path d="M16.5 11h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    wall: svg('<path d="M2 21V8.5h3.2v2.2h2.4V8.5h3.2v2.2h2.4V8.5h3.2v2.2h2.4V8.5H22V21z" fill="currentColor"/><path d="M9.5 21v-4.5a2.5 2.5 0 0 1 5 0V21z" fill="#1a1410"/><path d="M2 14.5h7M15 14.5h7" stroke="#1a1410" stroke-width="1" opacity=".4"/>'),
    road: svg('<path d="M9 2.5L4 21.5M15 2.5l5 19" ' + ST + '/><path d="M12 4v3M12 10v3.5M12 17v3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    aqueduct: svg('<path d="M1.5 5h21v3h-21z" fill="currentColor"/><path d="M1.5 8v13h3v-6a2.5 2.5 0 0 1 5 0v6h5v-6a2.5 2.5 0 0 1 5 0v6h2.5V8z" fill="currentColor" opacity=".85"/><path d="M3 6.5h18" stroke="#3ab7d8" stroke-width="1.4"/>'),
    wonder: svg('<path d="M12 3l10 18H2z" fill="currentColor"/><path d="M12 3l2.6 18M7 12h10M4.8 16.5h14.4" stroke="#1a1410" stroke-width="1.1" opacity=".45"/>'),
    wave: svg('<path d="M2 15c3-4 5-4 8 0s5 4 8 0 4-2 4-2v6c-2 1.6-4 1.6-4 1.6-3 0-5-3.6-8-3.6s-5 3.6-8 3.6z" fill="currentColor"/><path d="M2 9c3-4 5-4 8 0s5 4 8 0 4-2 4-2" ' + ST + '/>'),
    mountain: svg('<path d="M1.5 20.5L9 7l4 6.5 2.6-3.5 6.9 10.5z" fill="currentColor"/><path d="M9 7l-2 3.6 2 -1 1.8 1.4z" fill="#fff" opacity=".7"/>'),
    word: svg('<path d="M4 3.5h16a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H10l-5.5 4.5v-4.5H4A1.5 1.5 0 0 1 2.5 15V5A1.5 1.5 0 0 1 4 3.5z" fill="currentColor"/><path d="M7 8h10M7 11.5h6" stroke="#1a1410" stroke-width="1.5" stroke-linecap="round"/>'),
    ram: svg('<rect x="2" y="9" width="16" height="4.5" rx="1.5" fill="currentColor"/><path d="M18 8h3.5v6.5H18z" fill="currentColor"/><circle cx="6" cy="18" r="2.5" fill="currentColor"/><circle cx="14" cy="18" r="2.5" fill="currentColor"/><path d="M4 9l3-5h6l3 5" ' + ST + '/>'),
    bow: svg('<path d="M6 3c8 3 11 8 9 18" ' + ST + '/><path d="M6 3l9 18" stroke="currentColor" stroke-width="1.2"/><path d="M3 13h14.5M15 10.5l3 2.5-3 2.5" ' + ST + '/>'),
    sacrifice: svg('<path d="M4 21h16l-2-5H6z" fill="currentColor"/><path d="M6.5 15.5h11l-1.5-4h-8z" fill="currentColor" opacity=".85"/><path d="M12 2.5c-2.6 3-3.4 5-1.6 7.4.6-1.4 1.6-1.8 1.6-1.8s1 .4 1.6 1.8c1.8-2.4 1-4.4-1.6-7.4z" fill="#e85a3a"/>'),
    // miracles: dádivas, ira, terra, mar, palavra, destino
    golden: svg('<circle cx="12" cy="12" r="5.2" fill="currentColor"/><path d="M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4M4.8 4.8l2.4 2.4M16.8 16.8l2.4 2.4M4.8 19.2l2.4-2.4M16.8 7.2l2.4-2.4" ' + ST + '/><path d="M9.3 12.6l1.8 1.8 3.8-4.2" stroke="#1a1410" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
    curse: svg('<circle cx="12" cy="10" r="7.5" fill="currentColor"/><path d="M8.2 9.2l2.4 1.4M15.8 9.2l-2.4 1.4M9 14.6c1.8-1.4 4.2-1.4 6 0" stroke="#1a1410" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M6.5 17.5L4 22M12 18v4M17.5 17.5L20 22" ' + ST + '/>'),
    raise: svg('<path d="M1.5 20.5c2.5-1.2 4.5-1.2 7 0s4.5 1.2 7 0 4.5-1.2 7 0" ' + ST + '/><path d="M4 17l4.5-7 3 3.5 2.5-3 5.5 6.5z" fill="currentColor"/><path d="M12 8V2.5M9.5 5L12 2.5 14.5 5" ' + ST + '/>'),
    sink: svg('<path d="M1.5 12.5c2.5-1.2 4.5-1.2 7 0s4.5 1.2 7 0 4.5-1.2 7 0" ' + ST + '/><path d="M5 21l3-5 2.5 2 2.5-3.5 4 6.5z" fill="currentColor" opacity=".7"/><path d="M12 2.5V9M9.5 6.5L12 9l2.5-2.5" ' + ST + '/>'),
    forest: svg('<path d="M7 2.5l4.5 7H9l3.5 5.5h-11L5 9.5H2.5z" fill="currentColor"/><path d="M16.5 5l4.5 7h-2.5l3 5h-10l3-5H12z" fill="currentColor" opacity=".8"/><path d="M7 15v6.5M16.5 17v4.5" ' + ST + '/>'),
    vein: svg('<path d="M2.5 19l3.5-9 6-4.5 6.5 3 3 10.5z" fill="currentColor"/><path d="M8 10.5l3 3.5-1 4M12 5.5l1.5 5 4 2.5" stroke="#1a1410" stroke-width="1.5" fill="none" stroke-linejoin="round"/><path d="M11 14l2.5 1" stroke="#fff" stroke-width="1.2" opacity=".6"/>'),
    volcano: svg('<path d="M1.5 21.5l6.5-11h8l6.5 11z" fill="currentColor"/><path d="M8 10.5l2 2.5 2-2 2 2 2-2.5" stroke="#e8562a" stroke-width="1.8" fill="none"/><path d="M12 8.5c-.6-2 .4-3.2 1.4-4.2M9.5 8c-1-1.5-1-3 0-4.5M14.5 8.5c1-1 2.5-1.3 3.5-.8" stroke="#e8562a" stroke-width="1.6" fill="none" stroke-linecap="round"/>'),
    shoal: svg('<path d="M3 9c2.4-2.6 6-2.6 8.5 0-2.5 2.6-6.1 2.6-8.5 0zM11.5 9l2.5-2v4z" fill="currentColor"/><path d="M9 16.5c2.4-2.6 6-2.6 8.5 0-2.5 2.6-6.1 2.6-8.5 0zM17.5 16.5l2.5-2v4z" fill="currentColor" opacity=".8"/><circle cx="5.3" cy="8.6" r=".8" fill="#1a1410"/><circle cx="11.3" cy="16.1" r=".8" fill="#1a1410"/>'),
    wind: svg('<path d="M2.5 8.5h11a3 3 0 1 0-3-3M2.5 12.5h16a3 3 0 1 1-3 3M2.5 16.5h7" ' + ST + '/>'),
    seastorm: svg('<path d="M6.5 11a4 4 0 0 1 .4-8A5.5 5.5 0 0 1 17.6 3.8a3.6 3.6 0 0 1-.4 7.2z" fill="currentColor"/><path d="M12.5 11.5l-2.5 4h3l-2 4" stroke="#ffd24a" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M1.5 20c2-1.4 3.6-1.4 5.6 0M16.5 20c2-1.4 3.6-1.4 5.6 0" ' + ST + '/>'),
    tsunami: svg('<path d="M2 21.5c0-9 5-15.5 13-15.5 3.5 0 6 1.8 7 4.2-2.8-1.6-6.4-.6-7.2 2.3-.8 2.8 1.2 5 4.2 5-2 2.6-6 4-9.5 4H2z" fill="currentColor"/><path d="M15 6c-2.6.6-4.6 2.6-5.4 5.6" stroke="#1a1410" stroke-width="1.2" fill="none" opacity=".45"/>'),
    kraken: svg('<path d="M12 2.5c-3.8 0-6.5 3-6.5 7 0 2 .7 3.5 1.8 4.5h9.4c1.1-1 1.8-2.5 1.8-4.5 0-4-2.7-7-6.5-7z" fill="currentColor"/><circle cx="9.5" cy="10" r="1.3" fill="#1a1410"/><circle cx="14.5" cy="10" r="1.3" fill="#1a1410"/><path d="M7.5 14c-1 3-3.5 4-5 3.5M10 14.5c-.4 3-1.4 5.5-3 6.5M14 14.5c.4 3 1.4 5.5 3 6.5M16.5 14c1 3 3.5 4 5 3.5" ' + ST + '/>'),
    prophecy: svg('<path d="M12 2.5l1.8 4.5 4.7.4-3.6 3 1.1 4.6L12 12.5l-4 2.5 1.1-4.6-3.6-3 4.7-.4z" fill="currentColor"/><path d="M3.5 21.5c2.5-3.5 5.3-5 8.5-5s6 1.5 8.5 5" ' + ST + '/>'),
    commandment: svg('<path d="M3 21V7.5A4.5 4.5 0 0 1 12 7.5V21zM12 21V7.5a4.5 4.5 0 0 1 9 0V21z" fill="currentColor"/><path d="M5.5 10h4M5.5 13h4M5.5 16h4M14.5 10h4M14.5 13h4M14.5 16h4" stroke="#1a1410" stroke-width="1.3"/>'),
    inspire: svg('<path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8c.6.5.9 1.2.9 2V17h5.8v-.7c0-.8.3-1.5.9-2A6.5 6.5 0 0 0 12 2.5z" fill="currentColor"/><path d="M9.3 19.3h5.4M10.2 21.5h3.6" ' + ST + '/><path d="M12 6.5v5M10 9.5l2 2 2-2" stroke="#1a1410" stroke-width="1.4" fill="none"/>'),
    sign: svg('<circle cx="16.5" cy="7.5" r="3.4" fill="currentColor"/><path d="M13.8 9.5L3 20.5M15 10.8L7 21M12.2 8.2L2.5 15.5" ' + ST + ' opacity=".75"/><path d="M5 4l.6 1.6 1.6.6-1.6.6L5 8.4l-.6-1.6-1.6-.6 1.6-.6z" fill="currentColor"/>'),
    vision: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="currentColor"/><circle cx="12" cy="12" r="3.6" fill="#1a1410"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><path d="M12 1.5v2M4.5 4l1.2 1.6M19.5 4l-1.2 1.6" ' + ST + '/>'),
    hero: svg('<path d="M12 2.5l8 3v6c0 5-3.5 8.6-8 10-4.5-1.4-8-5-8-10v-6z" fill="currentColor"/><path d="M12 6.5l1.4 3 3.2.3-2.4 2.1.7 3.2-2.9-1.7-2.9 1.7.7-3.2-2.4-2.1 3.2-.3z" fill="#1a1410"/>'),
    divwall: svg('<path d="M2 21V10h3v2h2.5v-2h3v2H13v-2h3v2h2.5v-2H22v11z" fill="currentColor"/><path d="M12 1.5l1 2.3 2.4.2-1.8 1.6.6 2.4L12 6.7 9.8 8l.6-2.4-1.8-1.6 2.4-.2z" fill="currentColor"/><path d="M9.5 21v-3.5a2.5 2.5 0 0 1 5 0V21z" fill="#1a1410"/>'),
  };
  // civilization emblems
  const CIVICON = {
    grego: '<path d="M12 2.5L21.5 7.5h-19z" fill="currentColor"/><rect x="3" y="8.5" width="18" height="1.8" fill="currentColor"/><path d="M6 11.5v7M10 11.5v7M14 11.5v7M18 11.5v7" stroke="currentColor" stroke-width="2.3"/><rect x="2.5" y="19" width="19" height="2.5" fill="currentColor"/>',
    nordico: '<path d="M1.5 13.5h17.8c1.6 0 2.6-1.2 2.6-2.8V5l-2.4 1.4L18 4.2v7.1H3z" fill="currentColor"/><path d="M1.8 13.5c1 3.6 3.6 5.2 6.2 5.2h8.6c2.2 0 3.8-1.5 4.4-5.2z" fill="currentColor"/><circle cx="6" cy="15.6" r="1.4" fill="#1a1410" opacity=".55"/><circle cx="10" cy="15.6" r="1.4" fill="#1a1410" opacity=".55"/><circle cx="14" cy="15.6" r="1.4" fill="#1a1410" opacity=".55"/><path d="M10 2.5v10" stroke="currentColor" stroke-width="1.7"/><path d="M10.7 3h6.3v6.8h-6.3z" fill="currentColor" opacity=".7"/>',
    egipcio: '<ellipse cx="12" cy="6.6" rx="3.6" ry="4.2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 10.8V22M5.5 12.8h13" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>',
    asteca: '<path d="M9.2 2.5h5.6v3.3H9.2zM7 6.5h10v3.6H7zM5 10.8h14v3.6H5zM3 15.1h18v3.6H3zM1.5 19.4h21v2.3h-21z" fill="currentColor"/><path d="M11 7v14.7h2V7z" fill="#1a1410" opacity=".45"/>',
    romano: '<path d="M12 21c-5-1.3-8.2-5.2-8.2-10.3 0-2.3.6-4.3 1.8-6.2M12 21c5-1.3 8.2-5.2 8.2-10.3 0-2.3-.6-4.3-1.8-6.2" stroke="currentColor" stroke-width="1.6" fill="none"/><g fill="currentColor"><ellipse cx="4.3" cy="7.6" rx="1.1" ry="2.3" transform="rotate(-25 4.3 7.6)"/><ellipse cx="3.9" cy="12" rx="1.1" ry="2.3" transform="rotate(-5 3.9 12)"/><ellipse cx="5.4" cy="16.2" rx="1.1" ry="2.3" transform="rotate(25 5.4 16.2)"/><ellipse cx="8.4" cy="19.2" rx="1.1" ry="2.3" transform="rotate(55 8.4 19.2)"/><ellipse cx="19.7" cy="7.6" rx="1.1" ry="2.3" transform="rotate(25 19.7 7.6)"/><ellipse cx="20.1" cy="12" rx="1.1" ry="2.3" transform="rotate(5 20.1 12)"/><ellipse cx="18.6" cy="16.2" rx="1.1" ry="2.3" transform="rotate(-25 18.6 16.2)"/><ellipse cx="15.6" cy="19.2" rx="1.1" ry="2.3" transform="rotate(-55 15.6 19.2)"/></g><path d="M9.5 8.5h5M12 8.5v7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  };
  UI.civIcon = id => svg(CIVICON[id] || '<circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" stroke-width="2"/>');
  const LOGICON = {
    hut: ['hammer', 'gold'], house: ['hammer', 'gold'], storehouse: ['hammer', 'gold'], farm: ['food', 'gold'], well: ['hammer', 'gold'], workshop: ['hammer', 'gold'],
    temple: ['faith', 'gold'], monument: ['star', 'gold'], campfire: ['flame', 'orange'], fire: ['flame', 'red'], bolt: ['lightning', 'blue'], meteor: ['meteor', 'red'],
    baby: ['heart', 'pink'], heart: ['heart', 'pink'], grave: ['grave', 'grey'], skull: ['grave', 'red'], era: ['star', 'gold'], pop: ['pop', 'gold'], settle: ['home', 'gold'],
    war: ['sword', 'red'], peace: ['dove', 'blue'], ally: ['shield', 'blue'], crown: ['crown', 'gold'], chain: ['chain', 'grey'], split: ['split', 'orange'], massacre: ['skullx', 'red'], trade: ['scale', 'gold'], tyrant: ['crown', 'red'], free: ['chain', 'gold'], envoy: ['scroll', 'gold'],
    eye: ['eye', 'gold'], rain: ['rain', 'blue'], storm: ['cloud', 'blue'], sun: ['sun', 'orange'], wolf: ['wolves', 'brown'], deer: ['wolves', 'green'], sick: ['heal', 'green'],
    heal: ['heal', 'green'], food: ['leaf', 'green'], stone: ['stone', 'grey'], boat: ['boat', 'blue'], flower: ['fertility', 'pink'], info: ['leaf', 'green'],
    tech: ['tech', 'blue'], city: ['city', 'gold'], ship: ['ship', 'blue'], naval: ['ship', 'red'], cart: ['cart', 'gold'], wall: ['wall', 'grey'], road: ['road', 'gold'],
    aqueduct: ['aqueduct', 'blue'], wonder: ['wonder', 'gold'], siege: ['ram', 'red'], sacrifice: ['sacrifice', 'red'], lore: ['book', 'gold'], prophecy: ['word', 'gold'],
    mountain: ['mountain', 'brown'], wave: ['wave', 'blue'],
  };
  const SYMP = {
    sol: '<circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    lua: '<path d="M15 3.5a8.5 8.5 0 1 0 5.5 14.9A7 7 0 0 1 15 3.5z" fill="currentColor"/>',
    arvore: '<path d="M12 3l6 8h-3l4 5H5l4-5H6z" fill="currentColor"/><rect x="11" y="16" width="2" height="5" fill="currentColor"/>',
    onda: '<path d="M2 15c3-4 5-4 8 0s5 4 8 0 4-2 4-2v5c-2 2-4 2-4 2-3 0-5-4-8-4s-5 4-8 4z" fill="currentColor"/><path d="M2 9c3-4 5-4 8 0s5 4 8 0" stroke="currentColor" stroke-width="2" fill="none"/>',
    montanha: '<path d="M2 20l7-12 4 6 3-4 6 10z" fill="currentColor"/>',
    olho: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="currentColor"/><circle cx="12" cy="12" r="3" fill="#1a1410"/>',
    estrela: '<path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8z" fill="currentColor"/>',
    chama: '<path d="M12 22c-4.2 0-7-2.8-7-6.6 0-3.6 2.6-5.4 3.4-9.4 2 1.2 3.2 3 3.4 5.4 1-1 1.6-2.4 1.6-4.4 3 2.2 5.6 5 5.6 8.6 0 3.8-2.8 6.4-7 6.4z" fill="currentColor"/>',
    lobo: '<path d="M4 4l4 5h8l4-5v9l-3 3-5 5-5-5-3-3z" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="#1a1410"/><circle cx="15" cy="12" r="1.2" fill="#1a1410"/>',
    coroa: '<path d="M3 18l1.5-10 4.5 4 3-7 3 7 4.5-4L21 18z" fill="currentColor"/><rect x="3" y="19" width="18" height="2" fill="currentColor"/>',
  };
  UI.symbolSVG = k => svg(SYMP[G.Fac.SYMBOLS[(k | 0) % G.Fac.SYMBOLS.length]] || SYMP.sol);
  UI.flag = (fid, cls) => { const f = G.Fac.get(fid); return f ? `<span class="fc-flag ${cls || ''}" style="--fc:${G.Fac.hex(fid)}">${UI.symbolSVG(f.sym)}</span>` : ''; };
  UI.selected = null;
  UI.viewFac = 0;
  let hudBuilt = false, tUpd = 0, tInsp = 0, lastLogCount = 0;

  // ------------------------------ setup ------------------------------
  UI.init = function () {
    $('#ic-pop').innerHTML = ICON.pop; $('#ic-food').innerHTML = ICON.food; $('#ic-wood').innerHTML = ICON.wood; $('#ic-stone').innerHTML = ICON.stone; $('#ic-faith').innerHTML = ICON.faith;
    $('#btn-pause').innerHTML = ICON.pause;
    $('#btn-chron').innerHTML = ICON.scroll; $('#btn-stats').innerHTML = ICON.stats; $('#btn-menu').innerHTML = ICON.menu; $('#btn-realms').innerHTML = ICON.crown; $('#btn-lore').innerHTML = ICON.book;
    $('#btn-sound').innerHTML = G.Audio.sfxOn || G.Audio.musicOn ? ICON.sound : ICON.mute;
    // powers
    const bar = $('#powerbar');
    UI.buildPowerBar();
    $('#powertabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; G.Audio.play('click'); UI.setTab(b.dataset.tab); });
    bar.addEventListener('click', e => { const b = e.target.closest('.pw'); if (!b) return; G.Audio.init(); UI.setPower(G.Input.power === b.dataset.power ? null : b.dataset.power); });
    bar.addEventListener('mouseover', e => { const b = e.target.closest('.pw'); if (!b) return; showPowerTip(b); G.Audio.play('hover'); });
    bar.addEventListener('mouseout', e => { const b = e.target.closest('.pw'); if (b && !b.contains(e.relatedTarget)) hideTip(); });
    // speed
    $('#speed').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; G.Audio.play('click'); UI.setSpeed(+b.dataset.speed); });
    $('#btn-chron').onclick = () => { G.Audio.play('click'); $('#chronicle').classList.toggle('collapsed'); };
    $('#chron-toggle').onclick = () => { G.Audio.play('click'); $('#chronicle').classList.toggle('collapsed'); };
    $('#btn-stats').onclick = () => { G.Audio.play('click'); UI.openStats(); };
    $('#btn-realms').onclick = () => { G.Audio.play('click'); UI.openRealms(); };
    $('#btn-lore').onclick = () => { G.Audio.play('click'); G.Lore.openBook(); };
    $('#fac-chip').onclick = () => { G.Audio.play('click'); UI.openRealms(); };
    $('#prayer').onclick = () => {
      const p = G.S && G.S.prayer; if (!p) return;
      G.Audio.play('click'); G.Render.cam.follow = 0; G.Render.panTo(p.x, p.y);
      UI.setPower(G.Events.PRAYER[p.kind].powers[0]);
    };
    $('#btn-menu').onclick = () => { G.Audio.play('click'); UI.openPause(); };
    $('#btn-sound').onclick = () => { G.Audio.play('click'); UI.openSound(); };
    $('#chron-list').addEventListener('click', e => {
      const it = e.target.closest('.ch-item'); if (!it || it.dataset.x === undefined || it.dataset.x === '') return;
      G.Render.cam.follow = 0; G.Render.panTo(+it.dataset.x, +it.dataset.y); G.Audio.play('click');
    });
    $('#inspector').addEventListener('click', e => {
      const a = e.target.closest('[data-pid]');
      if (a) { const p = G.person(+a.dataset.pid); if (p) { UI.select(p); if (!p.dead) { G.Render.cam.follow = 0; G.Render.panTo(p.x, p.y); } } return; }
      const b = e.target.closest('[data-act]'); if (!b) return;
      G.Audio.play('click');
      if (b.dataset.act === 'close') UI.select(null);
      else if (b.dataset.act === 'follow') { const s = UI.selected; if (s && !s.dead) { G.Render.cam.follow = G.Render.cam.follow === s.id ? 0 : s.id; renderInspector(true); } }
      else if (b.dataset.act === 'tree') UI.openTree(UI.selected.id);
    });
    $('#modal-bg').addEventListener('click', e => { if (e.target.id === 'modal-bg') UI.closeModal(); });
    $('#modal').addEventListener('click', e => {
      const c = e.target.closest('[data-tree]'); if (c) { G.Audio.play('click'); UI.openTree(+c.dataset.tree); return; }
      const so = e.target.closest('[data-so]'); if (so) { G.Audio.play('click'); const o = UI._setup.opts; o[so.dataset.so] = isNaN(+so.dataset.v) ? so.dataset.v : +so.dataset.v; UI.openSetup(UI._setup.fromGame, true); return; }
      const cv = e.target.closest('[data-civ]'); if (cv) { G.Audio.play('click'); const o = UI._setup.opts; const k = +cv.dataset.civ; o.civs = (o.civs || []).slice(); while (o.civs.length <= k) o.civs.push(null); o.civs[k] = cv.dataset.v === 'rand' ? null : cv.dataset.v; UI._setup.focus = k; UI.openSetup(UI._setup.fromGame, true); return; }
      const ch = e.target.closest('[data-choice]');
      if (ch) {
        G.Audio.play('click'); const c = UI._choice; UI.closeModal(); if (!c) return;
        if (G.Powers.castChoice(c.id, c.x, c.y, ch.dataset.choice)) { UI.update(1, true); if (G.S.faith < G.Powers.byId(c.id).cost) UI.setPower(null); }
        else UI.notice(G.S.faith < G.Powers.byId(c.id).cost ? 'Fé insuficiente para este poder.' : (G.Powers.why || 'Não é possível usar isso aí.'), 'eye');
        return;
      }
      const b = e.target.closest('[data-m]'); if (!b) return;
      G.Audio.play('click');
      const m = b.dataset.m;
      if (m === 'close' || m === 'resume') UI.closeModal();
      else if (m === 'save') { G.Save.save(); UI.closeModal(); }
      else if (m === 'load') { UI.closeModal(); G.Main.continueGame(); }
      else if (m === 'new') UI.openSetup(true);
      else if (m === 'setup-go') {
        const o = UI._setup; UI.closeModal();
        if (o.fromGame) UI.confirm('Criar um novo mundo? O mundo atual será substituído.', () => G.Main.newGame(o.opts));
        else G.Main.newGame(o.opts);
      }
      else if (m === 'realm') { UI.viewFac = +b.dataset.id; const c = G.Fac.capitalOf(UI.viewFac); if (c) { G.Render.cam.follow = 0; G.Render.panTo(c.cx, c.cy); } UI.update(1, true); UI.openRealms(); }
      else if (m === 'realm-go') { const c = G.Fac.capitalOf(+b.dataset.id); if (c) { G.Render.cam.follow = 0; G.Render.panTo(c.cx, c.cy); UI.viewFac = +b.dataset.id; UI.closeModal(); UI.update(1, true); } }
      else if (m === 'leader') { const p = G.person(+b.dataset.id); if (p) { UI.closeModal(); UI.select(p); if (!p.dead) { G.Render.cam.follow = 0; G.Render.panTo(p.x, p.y); } } }
      else if (m === 'mainmenu') { G.Save.save(true); UI.closeModal(); G.Main.toMenu(); }
      else if (m === 'help') UI.openHelp();
      else if (m === 'lore') G.Lore.openBook(b.dataset.tab);
      else if (m === 'sfx') { G.Audio.setSfx(!G.Audio.sfxOn); UI.openSound(); }
      else if (m === 'music') { G.Audio.init(); G.Audio.setMusic(!G.Audio.musicOn); UI.openSound(); }
      else if (m === 'amb') { G.Audio.setAmb(!G.Audio.ambOn); UI.openSound(); }
      else if (m === 'yes') { const f = UI._confirm; UI.closeModal(); f && f(); }
      else if (m === 'person') { const p = G.person(+b.dataset.id); if (p) { UI.closeModal(); UI.select(p); if (!p.dead) G.Render.panTo(p.x, p.y); } }
    });
    document.querySelectorAll('button').forEach(b => b.addEventListener('mouseenter', () => G.Audio.play('hover')));
    hudBuilt = true;
  };
  UI.showHUD = function (on) { $('#hud').classList.toggle('hidden', !on); if (on) { rebuildChronicle(); UI.update(1, true); } };

  UI.setSpeed = function (s) {
    G.speed = s;
    document.querySelectorAll('#speed button').forEach(b => b.classList.toggle('on', +b.dataset.speed === s));
    $('#paused-badge').classList.toggle('hidden', s !== 0);
  };
  UI.powerTab = 'dadivas';
  UI.tabPowers = () => G.POWERS.filter(p => p.tab === UI.powerTab);
  UI.buildPowerBar = function () {
    $('#powertabs').innerHTML = G.POWER_TABS.map(t => `<button data-tab="${t.id}" class="${t.id === UI.powerTab ? 'on' : ''}">${t.name}</button>`).join('') + '<span class="pt-hint"><kbd>Tab</kbd></span>';
    $('#powerbar').innerHTML = UI.tabPowers().map(p => `<button class="pw ${p.good === true ? 'good' : p.good === false ? 'bad' : 'neutral'}" data-power="${p.id}"><span class="key">${p.key}</span><span class="pic">${ICON[p.id]}</span><span class="cost">${p.cost ? p.cost : 'grátis'}</span></button>`).join('');
    document.querySelectorAll('.pw').forEach(b => b.classList.toggle('sel', b.dataset.power === G.Input.power));
    if (G.S) UI.update(1, true);
  };
  UI.setTab = function (id) { if (UI.powerTab === id) return; UI.powerTab = id; UI.buildPowerBar(); hideTip(); };
  UI.nextTab = function (d) { const k = G.POWER_TABS.findIndex(t => t.id === UI.powerTab); UI.setTab(G.POWER_TABS[(k + d + G.POWER_TABS.length) % G.POWER_TABS.length].id); G.Audio.play('click'); };
  UI.setPower = function (id) {
    if (id) { const p = G.Powers.byId(id); if (p && p.tab !== UI.powerTab) UI.setTab(p.tab); }
    G.Input.power = id;
    document.querySelectorAll('.pw').forEach(b => b.classList.toggle('sel', b.dataset.power === id));
    const hint = $('#power-hint');
    if (id) {
      const p = G.Powers.byId(id);
      hint.innerHTML = id === 'hand' ? `<b>${p.name}</b> — clique e segure sobre alguém; solte para largar, arraste rápido para arremessar · <kbd>Esc</kbd> cancela`
        : id === 'anoint' ? `<b>${p.name}</b> — clique sobre um habitante adulto · <kbd>Esc</kbd> cancela`
        : id === 'peace' ? `<b>${p.name}</b> — clique em qualquer lugar do mapa · <kbd>Esc</kbd> cancela`
        : `<b>${p.name}</b> — clique no mapa para lançar · <kbd>botão direito</kbd> ou <kbd>Esc</kbd> cancela`;
      hint.classList.remove('hidden');
      G.Audio.play('power');
    } else { hint.classList.add('hidden'); G.Render.preview = null; }
    document.body.classList.toggle('casting', !!id && id !== 'hand');
    document.body.classList.toggle('handmode', id === 'hand');
  };

  // ------------------------------ tooltips ------------------------------
  function showPowerTip(b) {
    const p = G.Powers.byId(b.dataset.power);
    const tip = $('#tooltip');
    const afford = G.S && G.S.faith >= p.cost;
    tip.innerHTML = `<div class="tt-title">${ICON[p.id]}<b>${p.name}</b><span class="tt-key">${p.key}</span></div><div class="tt-desc">${p.desc}</div><div class="tt-cost ${afford ? '' : 'no'}">${ICON.faith}${p.cost ? p.cost + ' de fé' : 'Grátis'}${afford ? '' : ' — fé insuficiente'}</div>`;
    tip.classList.remove('hidden');
    const r = b.getBoundingClientRect();
    const tw = tip.offsetWidth;
    tip.style.left = Math.max(8, Math.min(innerWidth - tw - 8, r.left + r.width / 2 - tw / 2)) + 'px';
    tip.style.top = (r.top - tip.offsetHeight - 12) + 'px';
  }
  function hideTip() { $('#tooltip').classList.add('hidden'); }
  UI.hideTip = hideTip;

  // ------------------------------ per-frame ------------------------------
  UI.update = function (dt, force) {
    if (!hudBuilt || !G.S) return;
    tUpd -= dt; tInsp -= dt;
    if (tUpd > 0 && !force) return;
    tUpd = 0.2;
    const S = G.S;
    let vf = G.Fac.get(UI.viewFac);
    if (!vf || !vf.alive) { vf = G.Fac.all().sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id))[0]; UI.viewFac = vf ? vf.id : 0; }
    const nf = G.Fac.all().length;
    const pop = vf ? G.Fac.pop(vf.id) : 0; const cap = vf ? G.Village.cap(vf.id) : 0; const stk = vf ? vf.stock : { food: 0, wood: 0, stone: 0 };
    const chip = $('#fac-chip');
    if (vf) {
      chip.classList.remove('hidden');
      const gov = G.Politics ? G.Politics.govName(vf) : '';
      const key = vf.id + '|' + vf.name + '|' + vf.ci + '|' + nf + '|' + gov + '|' + (vf.atWarN || 0);
      if (chip.dataset.k !== key) {
        chip.dataset.k = key;
        chip.innerHTML = `<span class="fc-flag" style="--fc:${G.Fac.hex(vf.id)}">${UI.symbolSVG(vf.sym)}</span><span class="fc-txt"><span class="fc-name">${esc(vf.name)}</span>${gov ? '<span class="fc-gov">' + esc(gov) + '</span>' : ''}</span>${vf.atWarN ? '<span class="fc-war" title="Em guerra">' + ICON.sword + '</span>' : ''}${nf > 1 ? '<span class="fc-more">' + nf + ' povos</span>' : ''}`;
      }
    } else chip.classList.add('hidden');
    setText('#v-pop', nf > 1 ? pop + '·' + S.villagers.size : pop);
    setText('#v-food', Math.floor(stk.food)); setText('#c-food', '/' + cap);
    setText('#v-wood', Math.floor(stk.wood)); setText('#c-wood', '/' + cap);
    setText('#v-stone', Math.floor(stk.stone)); setText('#c-stone', '/' + cap);
    setText('#v-faith', Math.floor(S.faith));
    setText('#r-faith', '+' + G.Village.faithRate.toFixed(2) + '/s');
    $('#res-food').classList.toggle('warn', stk.food < pop * 0.8);
    setText('#day', 'Dia ' + S.day);
    setText('#era', G.ERAS[vf ? vf.era : S.era] || '');
    const [pt, pk] = G.Village.perception(nf > 1 && vf ? vf.id : 0);
    const ptxt = `${nf > 1 && vf ? esc(vf.name) + ' te vê' : 'Eles te veem'} como <b class="pc-${pk}">${pt}</b>`;
    const pe = $('#perception'); if (pe.dataset.k !== ptxt) { pe.dataset.k = ptxt; pe.innerHTML = ptxt; }
    drawDial();
    document.querySelectorAll('.pw').forEach(b => { const p = G.Powers.byId(b.dataset.power); b.classList.toggle('poor', S.faith < p.cost); });
    const pr = $('#prayer');
    if (S.prayer) {
      const P = G.Events.PRAYER[S.prayer.kind]; const set = S.settlements.get(S.prayer.set);
      const pw = G.Powers.byId(P.powers[0]);
      const html = `<i class="ci gold">${ICON.eye}</i><span>${P.ask}${set ? ' em <b>' + esc(set.name) + '</b>' : ''} — use <b>${P.powers.map(k => G.Powers.byId(k).name).join(' ou ')}</b></span><span class="pr-bar"><span style="width:${Math.max(0, S.prayer.t / S.prayer.max * 100)}%"></span></span>`;
      if (pr.dataset.k !== S.prayer.kind + S.prayer.set) { pr.dataset.k = S.prayer.kind + S.prayer.set; pr.innerHTML = html; pr.classList.remove('hidden'); }
      else pr.querySelector('.pr-bar span').style.width = Math.max(0, S.prayer.t / S.prayer.max * 100) + '%';
      document.querySelectorAll('.pw').forEach(b => b.classList.toggle('asked', P.powers.includes(b.dataset.power)));
      document.querySelectorAll('#powertabs [data-tab]').forEach(b => b.classList.toggle('asked', b.dataset.tab !== UI.powerTab && P.powers.some(k => G.Powers.byId(k).tab === b.dataset.tab)));
    } else if (!pr.classList.contains('hidden')) { pr.classList.add('hidden'); pr.dataset.k = ''; document.querySelectorAll('.pw, #powertabs [data-tab]').forEach(b => b.classList.remove('asked')); }
    const w = S.weather;
    const wl = $('#weather'); const txt = w.storm > 0 ? 'Tempestade' : w.drought > 0 ? 'Seca' : S.clouds.some(c => c.kind === 'natural') ? 'Chuvisco' : '';
    wl.textContent = txt; wl.classList.toggle('hidden', !txt);
    if (S.history.length !== lastLogCount) rebuildChronicle();
    if (UI.selected && tInsp <= 0) { tInsp = 0.25; renderInspector(); }
  };
  function setText(sel, v) { const e = $(sel); if (e && e.textContent !== String(v)) e.textContent = v; }
  function drawDial() {
    const c = $('#dial'); if (!c) return; const x = c.getContext('2d');
    const S = G.S; const d = 2; const W = 36 * d;
    if (c.width !== W) { c.width = W; c.height = W; }
    x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, 36, 36);
    const nf = G.Render.nightness();
    const g = x.createLinearGradient(0, 0, 0, 36);
    g.addColorStop(0, G.rgb(G.lerpColor([120, 190, 235], [20, 30, 70], nf))); g.addColorStop(1, G.rgb(G.lerpColor([240, 210, 160], [40, 40, 90], nf)));
    x.fillStyle = g; x.beginPath(); x.arc(18, 18, 16, 0, Math.PI * 2); x.fill();
    const a = S.time * Math.PI * 2 - Math.PI * 0.62;
    const sx = 18 + Math.cos(a - Math.PI / 2) * 10, sy = 22 + Math.sin(a - Math.PI / 2) * 10;
    const night = G.isNight();
    x.fillStyle = night ? '#f2f0e0' : '#ffd24a';
    x.beginPath(); x.arc(sx, sy, 4, 0, Math.PI * 2); x.fill();
    if (night) { x.fillStyle = G.rgb(G.lerpColor([120, 190, 235], [20, 30, 70], nf)); x.beginPath(); x.arc(sx + 1.8, sy - 1.2, 3.4, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = 'rgba(40,60,30,0.85)'; x.fillRect(2, 24, 32, 12);
    x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 1.2; x.beginPath(); x.arc(18, 18, 16.4, 0, Math.PI * 2); x.stroke();
  }

  // ------------------------------ chronicle ------------------------------
  function logItem(e) {
    const [ic, col] = LOGICON[e.ic] || LOGICON.info;
    return `<div class="ch-item ${e.x !== undefined ? 'loc' : ''}" data-x="${e.x !== undefined ? e.x : ''}" data-y="${e.y !== undefined ? e.y : ''}"><span class="ch-day">Dia ${e.d}</span><i class="ci ${col}">${ICON[ic]}</i><span class="ch-txt">${esc(e.txt)}</span></div>`;
  }
  function rebuildChronicle() {
    const S = G.S; if (!S) return;
    lastLogCount = S.history.length;
    const list = S.history.slice(-90).reverse();
    $('#chron-list').innerHTML = list.map(logItem).join('') || '<div class="ch-empty">A história ainda não começou.</div>';
    $('#chron-count').textContent = S.history.length;
  }
  UI.onLog = function (e) { /* rebuilt lazily in update */ if (G.Main && G.Main.mode === 'game') { const el = $('#chronicle'); if (el.classList.contains('collapsed')) { el.classList.add('ping'); setTimeout(() => el.classList.remove('ping'), 900); } } };

  // ------------------------------ notices & toasts ------------------------------
  UI.notice = function (text, icon) {
    if (!G.Main || G.Main.mode === 'menu') return;
    const box = $('#notices');
    const [ic, col] = LOGICON[icon] || LOGICON.info;
    const d = document.createElement('div'); d.className = 'notice';
    d.innerHTML = `<i class="ci ${col}">${ICON[ic] || ICON.leaf}</i><span>${esc(text)}</span>`;
    box.appendChild(d);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    setTimeout(() => d.classList.add('out'), 6500);
    setTimeout(() => d.remove(), 7400);
  };
  const toastQ = []; let toastBusy = false;
  UI.toast = function (title, sub, icon) {
    if (!G.Main || G.Main.mode === 'menu') return;
    toastQ.push([title, sub, icon]); while (toastQ.length > 3) toastQ.shift(); if (!toastBusy) nextToast();
  };
  function nextToast() {
    const t = toastQ.shift(); if (!t) { toastBusy = false; return; }
    toastBusy = true;
    const [ic, col] = LOGICON[t[2]] || ['star', 'gold'];
    const el = $('#toast');
    el.innerHTML = `<i class="ci ${col}">${ICON[ic] || ICON.star}</i><div><div class="t-title">${esc(t[0])}</div><div class="t-sub">${esc(t[1])}</div></div>`;
    el.classList.remove('hidden', 'out'); void el.offsetWidth; el.classList.add('in');
    setTimeout(() => { el.classList.add('out'); el.classList.remove('in'); }, 4200);
    setTimeout(() => { el.classList.add('hidden'); nextToast(); }, 4900);
  }

  // ------------------------------ inspector ------------------------------
  UI.select = function (o) {
    UI.selected = o;
    if (o && !o.dead && o.set) { const fid = G.Village.facOfSet(o.set); if (fid) UI.viewFac = fid; }
    if (!o && G.Render.cam.follow) G.Render.cam.follow = 0;
    $('#inspector').classList.toggle('hidden', !o);
    if (o) { G.Audio.play('select'); renderInspector(true); }
  };
  function bar(label, v, cls, txt) {
    return `<div class="bar"><span class="bl">${label}</span><span class="bt"><span class="bf ${cls}" style="width:${G.clamp(v, 0, 100)}%"></span></span><span class="bv">${txt !== undefined ? txt : Math.round(v) + '%'}</span></div>`;
  }
  const plink = id => { const p = G.person(id); return p ? `<a data-pid="${p.id}" class="${p.dead ? 'dead' : ''}">${esc(p.name)}${p.dead ? ' †' : ''}</a>` : null; };
  function portrait(v) {
    const c = document.createElement('canvas'); const d = 2; c.width = 64 * d; c.height = 64 * d;
    const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
    const g = x.createRadialGradient(32, 28, 4, 32, 32, 34); g.addColorStop(0, '#f4e6c8'); g.addColorStop(1, '#b89a6a');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    x.save(); x.translate(32, 50); x.scale(3.4, 3.4);
    const pv = Object.assign({}, v, { act: '', moving: false, face: 1, sleeping: false, inside: 0, hurt: 0, torch: false, emo: null });
    if (v.dead) { pv.role = v.role; pv.skin = '#c8c0b0'; pv.hair = '#9a948a'; pv.kidCloth = '#8a8a8a'; }
    if (pv.age >= 2) G.Art.villager(x, pv, 0, 0, 0, false);
    x.restore();
    return c;
  }
  let lastPortraitKey = '';
  function renderInspector(full) {
    const o = UI.selected; const el = $('#inspector'); if (!o) return;
    const S = G.S;
    let html = '';
    if (o.type && G.BDEF[o.type]) html = buildingHTML(o);
    else if (o.kind && o.dock !== undefined && G.Naval && G.Naval.SHIP[o.kind]) html = shipHTML(o);
    else if (o.kind) {
      if (!S.animals.has(o.id)) { UI.select(null); return; }
      const d = G.Animals.DEF[o.kind];
      const st = o.dead ? 'Morto' : o.state === 'flee' ? 'Fugindo' : o.state === 'chase' ? 'Caçando!' : o.state === 'eat' ? 'Comendo' : o.state === 'leave' ? 'Indo embora' : o.state === 'charge' ? 'Atacando!' : o.state === 'wander' ? 'Vagando' : 'Pastando';
      html = `<div class="insp-head"><div class="insp-title"><h3>${d.name}${o.summoned ? ' (invocado)' : ''}</h3><div class="sub">${o.kind === 'wolf' ? 'Predador' : 'Animal selvagem · fonte de alimento'}</div></div><button class="x" data-act="close">${ICON.close}</button></div>
        ${bar('Vida', o.hp / o.maxHp * 100, 'hp')}<div class="doing">Atualmente: <b>${st}</b></div>`;
    } else {
      const p = o.dead ? o : S.villagers.get(o.id);
      if (!p) { const d = S.dead.get(o.id); if (d) { UI.selected = d; return renderInspector(true); } UI.select(null); return; }
      html = personHTML(p);
    }
    el.innerHTML = html;
    if (!o.type && !o.kind) {
      const holder = el.querySelector('.portrait');
      if (holder) holder.appendChild(portrait(o.dead ? o : S.villagers.get(o.id)));
    }
  }
  function personHTML(v) {
    const S = G.S;
    const f = v.g === 'f';
    const age = Math.floor(v.age);
    let fam = [];
    const parents = [plink(v.mother), plink(v.father)].filter(Boolean);
    if (parents.length) fam.push(`${f ? 'Filha' : 'Filho'} de ${parents.join(' e ')}`);
    if (v.partner) { const l = plink(v.partner); if (l) fam.push(`${f ? 'Parceira' : 'Parceiro'} de ${l}`); }
    else if (v.widow) { const l = plink(v.widow); if (l) fam.push(`${f ? 'Viúva' : 'Viúvo'} de ${l}`); }
    const kids = (v.kids || []).map(plink).filter(Boolean);
    if (kids.length) fam.push(`${kids.length > 1 ? 'Filhos' : (G.person(v.kids[0]) && G.person(v.kids[0]).g === 'f' ? 'Filha' : 'Filho')}: ${kids.join(', ')}`);
    const traits = (v.traits || []).map(t => `<span class="trait">${G.traitName(v, t)}</span>`).join('');
    if (v.dead) {
      const cause = { old: 'Velhice', hunger: 'Fome', wolf: 'Atacad' + (f ? 'a' : 'o') + ' por lobos', boar: 'Atacad' + (f ? 'a' : 'o') + ' por um javali', fire: 'Incêndio', lightning: 'Raio', meteor: 'Meteoro', sick: 'Doença', fall: 'Queda', drown: 'Afogamento', war: 'Morte em combate', arrow: 'Flecha', massacre: 'Massacre', execution: 'Execução', coup: 'Assassinato', quake: 'Terremoto' }[v.cause] || 'Desconhecida';
      const df = G.Fac.get(v.fac); const killer = v.by ? G.person(v.by) : null;
      const deadName = v.reigned ? esc(G.Politics.fullName(v)) : esc(v.name) + (v.ep ? ', ' + esc(G.Politics.epithet(v)) : '');
      return `<div class="insp-head"><div class="portrait dead"></div><div class="insp-title"><h3>${deadName} †</h3><div class="sub">Viveu ${age} anos · Dia ${Math.max(1, Math.round(v.born))} – Dia ${v.died}</div><div class="traits">${traits}</div></div><button class="x" data-act="close">${ICON.close}</button></div>
        ${df ? `<div class="fline">${UI.flag(df.id, 'mini')}${esc(df.name)}${v.reigned ? ' · governou' : ''}${v.captive ? ' · morreu no cativeiro' : ''}</div>` : ''}
        <div class="doing">Causa da morte: <b>${cause}</b>${killer && killer.id !== v.id ? ` — por <a data-pid="${killer.id}">${esc(killer.name)}</a>` : ''}${v.kills ? `<br>Derrubou ${v.kills} ${v.kills > 1 ? 'inimigos' : 'inimigo'} em vida.` : ''}</div>
        <div class="family">${fam.map(x => `<div>${x}</div>`).join('') || '<div class="muted">Sem família conhecida.</div>'}</div>
        <div class="btns"><button data-act="tree">${ICON.tree} Árvore genealógica</button></div>`;
    }
    const role = G.roleName(v);
    const set = S.settlements.get(v.set);
    const home = S.buildings.get(v.home);
    const status = [];
    if (v.preg > 0) status.push('<span class="st pink">Grávida</span>');
    if (v.sick > 0) status.push('<span class="st green">Doente</span>');
    if (v.mourn > 0) status.push('<span class="st grey">De luto</span>');
    if (v.fear > 55) status.push('<span class="st red">Aterrorizad' + (f ? 'a' : 'o') + '</span>');
    if (v.hunger >= 95) status.push('<span class="st red">Faminto</span>');
    if (!v.home && v.age >= 16) status.push('<span class="st grey">Sem casa</span>');
    const feats = [];
    if (v.st.wood) feats.push(`${v.st.wood} de madeira`); if (v.st.food) feats.push(`${v.st.food} de comida`); if (v.st.stone) feats.push(`${v.st.stone} de pedra`); if (v.st.built) feats.push(`${v.st.built} ${v.st.built > 1 ? 'obras concluídas' : 'obra concluída'}`);
    const following = G.Render.cam.follow === v.id;
    const P = G.Politics; const fac = G.Fac.ofV(v); const ruler = fac && fac.leader === v.id;
    if (v.captive) { const from = G.Fac.get(v.captive.from); status.unshift(`<span class="st red">Cativ${f ? 'a' : 'o'}${from ? ' — de ' + esc(from.name) : ''}</span>`); }
    if (v.chosen) status.push(`<span class="st gold">${v.g === 'f' ? 'Escolhida' : 'Escolhido'} dos céus · ${v.kills || 0} vitórias</span>`);
    else if (v.hero) status.push(`<span class="st gold">Herói${f ? 'na' : ''} · ${v.kills} vitórias</span>`);
    if (v.prophet) status.push(`<span class="st gold">${v.g === 'f' ? 'Profetisa' : 'Profeta'}</span>`);
    else if (v.kills) status.push(`<span class="st grey">${v.kills} ${v.kills > 1 ? 'inimigos derrubados' : 'inimigo derrubado'}</span>`);
    if (v.fury > 0) status.push('<span class="st red">Em fúria</span>');
    if (v.coup) status.push('<span class="st red">Conspirador' + (f ? 'a' : '') + '</span>');
    if (v.rebel || v.revolt) status.push('<span class="st red">Rebelde</span>');
    const title = ruler ? esc(P.styled(fac, v)) : esc(v.name) + (v.ep ? ', ' + esc(P.epithet(v)) : '');
    const rulerLine = ruler ? `<div class="doing">Governa ${esc(fac.name)} (${P.govName(fac).toLowerCase()}) desde o dia ${(fac.rulers[fac.rulers.length - 1] || {}).from}. Legitimidade <b>${Math.round(fac.legit)}%</b>${P.personaWords(v).length ? ' · ' + P.personaWords(v).join(', ') : ''}.</div>` : '';
    const facLine = fac ? `<div class="fline">${UI.flag(fac.id, 'mini')}${esc(fac.name)}${ruler ? ' · ' + ICON.crown : ''}</div>` : '';
    return `<div class="insp-head"><div class="portrait"></div><div class="insp-title"><h3 class="${ruler ? 'royal' : ''}">${title}</h3><div class="sub">${age} ${age === 1 ? 'ano' : 'anos'} · ${ruler ? P.title(fac, v) : role}</div><div class="traits">${traits}</div></div><button class="x" data-act="close">${ICON.close}</button></div>
      ${facLine}${rulerLine}
      <div class="bars">${bar('Vida', v.hp, 'hp')}${bar('Fome', v.hunger, 'hunger')}${bar('Energia', v.energy, 'energy')}${bar('Devoção', v.devotion, 'dev')}${bar('Medo', v.fear, 'fear')}</div>
      ${status.length ? `<div class="status">${status.join('')}</div>` : ''}
      <div class="family">${fam.map(x => `<div>${x}</div>`).join('') || '<div class="muted">Sem laços familiares ainda.</div>'}</div>
      <div class="doing">Atualmente: <b>${esc(G.Vg.taskText(v))}</b></div>
      <div class="meta">${set ? esc(set.name) : ''}${home ? (() => { const hn = G.Village.buildName(home).toLowerCase(); return ' · mora n' + (G.gen(hn) === 'a' ? 'uma ' : 'um ') + esc(hn); })() : ''}${feats.length ? '<br>Contribuiu com ' + feats.join(', ') : ''}</div>
      <div class="btns"><button data-act="follow" class="${following ? 'on' : ''}">${ICON.eye} ${following ? 'Seguindo' : 'Seguir'}</button><button data-act="tree">${ICON.tree} Família</button></div>`;
  }
  function shipHTML(s) {
    const S = G.S; if (!S.ships.includes(s)) { UI.select(null); return ''; }
    const f = G.Fac.get(s.fac); const nm = G.Naval.shipName(s);
    const KIND = { pesca: 'Barco de pesca', explorador: 'Barco explorador', mercante: 'Navio mercante', guerra: 'Navio de guerra', transporte: 'Navio de transporte' };
    const ST = { idle: 'Atracado no porto', out: 'Rumo ao pesqueiro', fish: 'Pescando', back: 'Voltando ao porto', go: 'Navegando para o porto estrangeiro', back2: 'Voltando ao porto', patrol: 'Patrulhando a costa', hunt: 'Caçando navios inimigos!', repair: 'Voltando para reparos', embark: 'Esperando a tripulação embarcar', sail: s.purpose === 'colony' ? 'Levando colonos a uma nova terra' : 'Navegando para a batalha', land: 'Desembarcando', wait: 'Esperando os guerreiros na praia', return: 'Voltando para casa' };
    const aboard = s.crew ? s.crew.filter(id => { const v = S.villagers.get(id); return v && v.aboard === s.id; }) : [];
    const cargo = s.goods || s.ret || (s.cargo ? { k: 'food', n: s.cargo } : null);
    const MAT = { food: 'comida', wood: 'madeira', stone: 'pedra' };
    return `<div class="insp-head"><div class="insp-title"><h3>${esc(G.cap(nm.replace(/^(um|uma) /, '')))}</h3><div class="sub">${KIND[s.kind] || ''}</div></div><button class="x" data-act="close">${ICON.close}</button></div>
      ${f ? `<div class="fline">${UI.flag(f.id, 'mini')}${esc(f.name)}</div>` : ''}
      ${bar('Casco', s.hp / s.maxHp * 100, 'hp')}
      <div class="doing">Atualmente: <b>${ST[s.st] || 'Navegando'}</b></div>
      ${aboard.length ? `<div class="family"><div>A bordo (${aboard.length}):</div><div>${aboard.slice(0, 12).map(id => plink(id)).join(', ')}</div></div>` : ''}
      ${cargo ? `<div class="doing">Carga: <b>${cargo.n} de ${MAT[cargo.k]}</b></div>` : ''}`;
  }
  function buildingHTML(b) {
    const S = G.S; const def = G.BDEF[b.type];
    if (!S.buildings.has(b.id)) { UI.select(null); return ''; }
    const set = S.settlements.get(b.set);
    let body = '';
    let title = G.Village.buildName(b);
    if (b.type === 'ruin') { title = 'Ruínas'; const on = G.BDEF[b.origType] ? G.Village.nameOf(b.origType, b) : null; body = `<div class="doing">Restos d${on ? G.gen(on) + ' ' + esc(on.toLowerCase()) : 'e uma construção'}. O mato vai tomar conta.</div>`; }
    else if (!b.built) {
      const al = G.Vg.allowedProgress(b);
      const miss = [];
      if (b.need.wood > 0) miss.push(`${Math.ceil(b.need.wood)} madeira`);
      if (b.need.stone > 0) miss.push(`${Math.ceil(b.need.stone)} pedra`);
      let builders = 0; for (const v of S.villagers.values()) if (v.task && v.task.type === 'build' && v.task.id === b.id) builders++;
      body = `${bar('Obra', b.progress * 100, 'energy')}${bar('Material', al * 100, 'dev')}<div class="doing">${miss.length ? 'Faltam: <b>' + miss.join(', ') + '</b>' : 'Materiais completos.'}<br>${builders ? builders + (builders > 1 ? ' pessoas trabalhando' : ' pessoa trabalhando') : 'Ninguém trabalhando agora.'}</div>`;
    } else {
      body = `<div class="desc">${G.BDESC[b.type] || ''}</div>`;
      if (b.hp < b.maxHp && b.type !== 'cemetery') body += bar('Estrutura', b.hp / b.maxHp * 100, 'hp');
      if (def.housing) {
        const res = [...S.villagers.values()].filter(v => v.home === b.id);
        body += `<div class="family"><div>Moradores (${res.length}/${def.housing}):</div><div>${res.map(v => plink(v.id)).join(', ') || '<span class="muted">vazia</span>'}</div></div>`;
      }
      if (b.type === 'farm') {
        const st = [0, 0, 0, 0]; for (const c of b.crops) st[c.s]++;
        body += `<div class="doing">${st[3]} prontos para colher · ${st[1] + st[2]} crescendo · ${st[0]} por plantar</div>`;
      }
      if (b.type === 'storehouse' || b.type === 'campfire' || b.type === 'celeiro') body += `<div class="doing">Capacidade de estoque: <b>${G.Village.cap(G.Village.facOfSet(b.set))}</b> de cada recurso.</div>`;
      if (b.type === 'temple') body += `<div class="doing">Gera fé continuamente. Os sacerdotes rezam aqui.</div>`;
      if (b.type === 'aqueduto') { const a = S.aqueducts.find(q => q.b === b.id); body += `<div class="doing">${a ? (a.done ? 'Água corrente: colheitas +20%, mais gente cabe na cidade.' : `Arcos erguidos: <b>${a.built}/${a.tiles.length}</b> (consome pedra).`) : set && set.aqua ? 'Cisterna cheia.' : ''}</div>`; }
      if (b.type === 'mercado' || b.type === 'praca') { const rs = S.routes.filter(r => r.ok && (r.a === b.set || r.b === b.set)); if (rs.length) body += `<div class="doing">${rs.length} ${rs.length > 1 ? 'rotas' : 'rota'} de carroças passando por aqui.</div>`; }
      if (b.type === 'cemetery') {
        const gs = b.graves.map(id => S.dead.get(id)).filter(Boolean);
        body += `<div class="graves">${gs.map(p => `<a data-pid="${p.id}" class="dead">${esc(p.name)} <span>${Math.floor(p.age)} anos · dia ${p.died}</span></a>`).join('') || '<span class="muted">Ninguém ainda.</span>'}</div>`;
      }
    }
    const bf = set ? G.Fac.get(set.fac) : null;
    if (b.type === 'cercado' && b.built) { const n = [...S.villagers.values()].filter(v => v.captive && v.set === b.set).length; body += `<div class="doing">${n ? n + (n > 1 ? ' cativos vivem' : ' cativo vive') + ' nesta vila.' : 'Vazio, por enquanto.'}</div>`; }
    if (b.type === 'quartel' && b.built && bf) body += `<div class="doing">${G.War.warriorsOf(bf.id)} guerreiros em ${esc(bf.name)}.</div>`;
    return `<div class="insp-head"><div class="insp-title"><h3>${esc(title)}</h3><div class="sub">${set ? esc(set.name) + ' · ' + G.City.tierName(set).toLowerCase() : ''}${!b.built && b.type !== 'ruin' ? ' · em construção' : ''}${b.style && G.CIVS[b.style] ? ' · arquitetura ' + G.CIVS[b.style].adj : ''}</div></div><button class="x" data-act="close">${ICON.close}</button></div>${bf ? `<div class="fline">${UI.flag(bf.id, 'mini')}${esc(bf.name)}${set && G.Fac.capitalOf(bf.id) === set ? ' · capital' : ''}${set ? ' · lealdade ' + Math.round(set.loyalty) + '%' : ''}</div>` : ''}${body}`;
  }

  // ------------------------------ modals ------------------------------
  UI.openModal = function (html, cls) {
    $('#modal').className = 'panel ' + (cls || '');
    $('#modal').innerHTML = html;
    $('#modal-bg').classList.remove('hidden');
    G.Main.modalOpen = true;
  };
  UI.closeModal = function () { $('#modal-bg').classList.add('hidden'); G.Main.modalOpen = false; };
  // some miracles ask the god to choose: the law, the secret, the sign, the prophecy
  UI.choosePower = function (p, x, y, opts) {
    UI._choice = { id: p.id, x, y };
    UI.openModal(`<h2>${ICON[p.id] || ''}${esc(p.name)}</h2><p class="muted">${esc(G.Powers.optionsTitle(p.id, x, y))}</p>
      <div class="choices">${opts.map(o => `<button data-choice="${esc(o.k)}"><b>${esc(o.name)}</b><span>${esc(o.desc)}</span></button>`).join('')}</div>
      <div class="mbtns"><span class="cost">${ICON.faith}${p.cost} de fé</span><button data-m="close">Cancelar</button></div>`, 'choose');
  };
  UI.confirm = function (text, yes) {
    UI._confirm = yes;
    UI.openModal(`<h2>Tem certeza?</h2><p>${esc(text)}</p><div class="mbtns"><button data-m="close">Cancelar</button><button class="primary" data-m="yes">Confirmar</button></div>`, 'small');
  };
  UI.openPause = function () {
    UI.openModal(`<h2>Pausa divina</h2><p class="muted">O mundo é salvo automaticamente.</p>
      <div class="mlist"><button class="primary" data-m="resume">Continuar</button><button data-m="save">${ICON.save} Salvar agora</button><button data-m="load">Carregar último save</button><button data-m="new">Novo mundo</button><button data-m="help">Como jogar</button><button data-m="mainmenu">Menu principal</button></div>
      <div class="keys"><span><kbd>Espaço</kbd> pausar</span><span><kbd>1</kbd>–<kbd>8</kbd> poderes</span><span><kbd>Tab</kbd> aba de poderes</span><span><kbd>R</kbd> reinos</span><span><kbd>L</kbd> livro do mundo</span><span><kbd>WASD</kbd> mover</span><span><kbd>F</kbd> seguir</span><span><kbd>H</kbd> crônica</span><span><kbd>+</kbd>/<kbd>−</kbd> velocidade</span></div>`, 'small');
  };
  UI.openSound = function () {
    const A = G.Audio;
    UI.openModal(`<h2>Som</h2><div class="mlist">
      <button data-m="sfx" class="${A.sfxOn ? 'on' : ''}">Efeitos: <b>${A.sfxOn ? 'ligados' : 'desligados'}</b></button>
      <button data-m="amb" class="${A.ambOn ? 'on' : ''}">Ambiente: <b>${A.ambOn ? 'ligado' : 'desligado'}</b></button>
      <button data-m="music" class="${A.musicOn ? 'on' : ''}">Música: <b>${A.musicOn ? 'ligada' : 'desligada'}</b></button>
      <button class="primary" data-m="close">Fechar</button></div>`, 'small');
    $('#btn-sound').innerHTML = A.sfxOn || A.musicOn || A.ambOn ? ICON.sound : ICON.mute;
  };
  UI.openHelp = function () {
    UI.openModal(`<h2>Como jogar</h2>
      <div class="help">
      <p class="lead">Você é o deus de uma pequena ilha. Os habitantes vivem por conta própria: coletam, constroem, se apaixonam, têm filhos, envelhecem e morrem. <b>Você não dá ordens</b> — você interfere.</p>
      <h4>Câmera</h4><ul><li><b>Arrastar</b> com o mouse (ou botão direito) move o mapa · <b>WASD</b>/setas também</li><li><b>Roda do mouse</b> dá zoom · <b>clique</b> num habitante ou construção para ver detalhes · <b>duplo clique</b> segue alguém</li></ul>
      <h4>Poderes divinos — seis abas (<kbd>Tab</kbd> troca, <kbd>1</kbd>–<kbd>8</kbd> escolhe)</h4><ul>
        <li><b>Dádivas</b> — Chuva, Crescimento, Cura, Fertilidade, <b>Era de Ouro</b> (três dias de prosperidade para um povo) e a <b>Mão Divina</b></li>
        <li><b>Ira</b> — Raio, Meteoro, Matilha, Terremoto, Praga e <b>Maldição</b> (colheitas murcham, filhos não vêm, a lealdade apodrece)</li>
        <li><b>Terra</b> — <b>Erguer</b> ilhas ou pontes de terra entre povos isolados, <b>Afundar</b> o chão (e engolir cidades), <b>Floresta Sagrada</b>, <b>Veio de Pedra</b> e o <b>Vulcão</b>: lava, bombas de fogo, cinzas férteis — e às vezes ele desperta de novo</li>
        <li><b>Mar</b> — <b>Cardume</b>, <b>Ventos Favoráveis</b> para os navios, <b>Tempestade</b> no mar, <b>Maremoto</b> que varre a costa e o <b>Kraken</b>, que caça navios até ser morto ou voltar às profundezas</li>
        <li><b>Palavra</b> — <b>Profecia</b> sobre uma cidade (se ela se cumprir, a fé explode), <b>Mandamento</b> (uma lei divina que muda o jeito de viver de um povo), <b>Inspiração</b> (revele a tecnologia que quiser), <b>Sinal nos Céus</b> (cometa, eclipse, aurora, chuva de estrelas — cada povo interpreta a seu modo) e <b>Visão</b> (crie um profeta)</li>
        <li><b>Destino</b> — Ungir, <b>Herói</b> (um campeão escolhido que luta como dez), Libertação, Fúria, Discórdia, <b>Muralha Divina</b> e Paz Divina</li></ul>
      <h4>Fé</h4><p>Poderes custam <b>fé</b>. A fé nasce da <b>devoção</b> (quando você ajuda) e do <b>medo</b> (quando você castiga). Medo também rende fé, mas deixa o povo lento, triste e menos fértil — e quem perde parentes para a sua fúria perde a devoção. Templos e sacerdotes geram fé constante.</p>
      <h4>Preces</h4><p>Em momentos difíceis — seca, incêndio, doença, fome, lobos — a vila <b>reza pedindo algo específico</b>. Um aviso dourado aparece acima da barra de poderes: clique nele para ir até lá. Atender as preces faz a devoção disparar; ignorá-las tem um preço.</p>
      <h4>Civilizações</h4><p>Cada povo pode ser <b>Grego</b> (pesquisa e colônias), <b>Nórdico</b> (mar, saques, berserkers), <b>Egípcio</b> (rio, fé, pirâmides), <b>Asteca</b> (guerras floridas, sacrifícios, Templo Mayor) ou <b>Romano</b> (estradas, aquedutos, legiões) — ou um povo clássico sem nome. Cada um tem arquitetura, nomes, governos, unidades, tecnologias e traços próprios.</p>
      <h4>Cidades que crescem</h4><p>Acampamento → aldeia → vila → cidade → metrópole. Casas viram sobrados e ínsulas, surgem praças, mercados, celeiros, bibliotecas, teatros, termas, palácios, portos e uma <b>maravilha</b>. Ruas são calçadas, estradas ligam cidades, <b>carroças</b> levam bens pelas rotas internas e de comércio, e <b>aquedutos</b> trazem água dos rios.</p>
      <h4>O mar</h4><p>Com Navegação vêm portos, barcos de pesca, exploradores que descobrem outros povos, navios mercantes, frotas de guerra, invasões pelo mar e colônias em outras ilhas.</p>
      <h4>Povos, reinos e guerras</h4><p>No <b>Novo mundo</b> você escolhe o mapa (ilha, continente, arquipélago, istmo), o tamanho e quantos povos despertam. Cada povo tem cor, bandeira, estoque, território e um <b>líder</b> com personalidade própria (belicoso, cruel, devoto, ambicioso…). Governos mudam: tribo → chefia → reino, ou teocracia, tirania, conselho.</p>
      <ul><li>Quando se encontram, os povos trocam emissários, fazem comércio, casamentos e alianças — ou declaram <b>guerra</b>: exércitos marcham, saqueiam, fazem <b>cativos</b>, conquistam vilas e, sob líderes cruéis, <b>massacram</b>.</li>
      <li>Vilas distantes e infelizes podem <b>rachar</b> e virar povos novos. Ambiciosos tramam <b>golpes</b>; tiranos executam em praça pública; o povo pode se levantar numa <b>revolução</b>.</li>
      <li>Cativos trabalham à força, tentam fugir, se revoltam — e às vezes fundam um povo livre.</li>
      <li>Arqueiros, tropas de elite, <b>muralhas</b> com portões que se fecham, <b>aríetes</b> e <b>catapultas</b> em cercos.</li>
      <li>Abra o painel <b>Reinos</b> (<kbd>R</kbd> ou o chip do povo no topo) para ver líderes, relações, exércitos, saberes e o mapa político. <kbd>B</kbd> mostra as fronteiras.</li></ul>
      <h4>O Livro do Mundo</h4><p>Cada mundo nasce com nome, mito da criação, lendas de origem de cada povo e <b>duas profecias antigas</b>. Depois o livro se escreve sozinho: um capítulo a cada sete anos, lendas de heróis, profetas, monstros, vulcões e cidades afogadas. Abra com <kbd>L</kbd> ou pelo ícone do livro.</p>
      <h4>Dicas</h4><ul><li>Clique nos eventos da <b>Crônica</b> para ir até onde aconteceram.</li><li>Na seca, a chuva vale ouro. Num incêndio, também.</li><li>Tudo é salvo automaticamente no navegador.</li></ul>
      </div><div class="mbtns"><button class="primary" data-m="close">Entendi</button></div>`, 'wide');
  };
  UI.openStats = function () {
    const S = G.S; const st = S.stats;
    let homes = 0, bld = 0; for (const b of S.buildings.values()) { if (b.built && G.BDEF[b.type].housing) homes++; if (b.built && b.type !== 'cemetery' && b.type !== 'ruin') bld++; }
    const pw = st.powers || {};
    const card = (l, v, s) => `<div class="stat"><div class="sv">${v}</div><div class="sl">${l}</div>${s ? `<div class="ss">${s}</div>` : ''}</div>`;
    UI.openModal(`<h2>Estatísticas da civilização</h2>
      <canvas id="pop-chart" width="720" height="140"></canvas>
      <div class="stats">
      ${card('População atual', S.villagers.size)}${card('Máxima histórica', st.maxPop)}${card('Idade da civilização', (S.day - 1) + ' anos')}
      ${card('Nascimentos', st.births)}${card('Mortes', st.deaths)}${card('Mortos por você', st.godKills, st.godKills ? 'mortes por ações divinas' : 'mãos limpas… por enquanto')}
      ${card('Casas', homes)}${card('Construções', bld)}${card('Assentamentos', S.settlements.size)}
      ${card('Comida produzida', Math.floor(st.foodProduced))}${card('Madeira coletada', Math.floor(st.woodProduced))}${card('Pedra extraída', Math.floor(st.stoneProduced))}
      ${card('Maior idade', Math.floor(st.oldest) + ' anos', esc(st.oldestName || ''))}${card('Árvores cortadas', st.treesFelled)}${card('Imigrantes', st.immigrants)}
      ${card('Fé gasta', Math.floor(st.faithSpent))}${card('Poderes usados', Object.values(pw).reduce((a, b) => a + b, 0), Object.entries(pw).map(([k, n]) => (G.Powers.byId(k) || { name: k }).name + ' ' + n).join(' · '))}${card('Era', G.ERAS[S.era])}
      ${S.factions.size > 1 || st.wars ? `${card('Povos vivos', G.Fac.all().length, (st.fallen || 0) + ' caídos')}${card('Guerras', st.wars || 0, (st.battles || 0) + ' batalhas')}${card('Mortos em combate', st.warDeaths || 0, (st.massacres || 0) + ' massacres')}
      ${card('Cativos feitos', st.captives || 0, (st.freed || 0) + ' libertados · ' + (st.escapes || 0) + ' fugas')}${card('Rachas', st.secessions || 0, (st.coups || 0) + ' golpes · ' + (st.revolutions || 0) + ' revoluções')}${card('Execuções', st.executions || 0, (st.conquests || 0) + ' vilas conquistadas')}` : ''}
      </div><div class="mbtns"><button class="primary" data-m="close">Fechar</button></div>`, 'wide');
    drawPopChart();
  };
  function drawPopChart() {
    const c = $('#pop-chart'); if (!c) return; const x = c.getContext('2d');
    const S = G.S; const h = (S.popHist || []).concat([S.villagers.size]);
    const W = c.width, H = c.height;
    x.clearRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,255,0.04)'; x.fillRect(0, 0, W, H);
    const max = Math.max(10, ...h);
    x.strokeStyle = 'rgba(255,255,255,0.08)'; x.lineWidth = 1;
    for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(0, H * k / 4); x.lineTo(W, H * k / 4); x.stroke(); }
    if (h.length < 2) { x.fillStyle = 'rgba(255,255,255,0.5)'; x.font = '14px Nunito, sans-serif'; x.fillText('O gráfico aparece a partir do segundo dia.', 20, H / 2); return; }
    const px = k => 10 + (W - 20) * k / (h.length - 1), py = v => H - 12 - (H - 30) * v / max;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(245,200,107,0.45)'); g.addColorStop(1, 'rgba(245,200,107,0)');
    x.beginPath(); x.moveTo(px(0), H); h.forEach((v, k) => x.lineTo(px(k), py(v))); x.lineTo(px(h.length - 1), H); x.closePath(); x.fillStyle = g; x.fill();
    x.beginPath(); h.forEach((v, k) => k ? x.lineTo(px(k), py(v)) : x.moveTo(px(k), py(v))); x.strokeStyle = '#f5c86b'; x.lineWidth = 2; x.stroke();
    x.fillStyle = 'rgba(255,240,210,0.8)'; x.font = '12px Nunito, sans-serif'; x.fillText('População por dia · pico ' + Math.max(...h), 14, 18);
  }
  UI.openTree = function (id) {
    const S = G.S; const p = G.person(id); if (!p) return;
    const card = (q, big) => {
      if (!q) return '';
      const f = q.g === 'f';
      const sub = q.dead ? `† aos ${Math.floor(q.age)} · dia ${q.died}` : `${Math.floor(q.age)} anos · ${G.roleName(q)}`;
      return `<button class="ft-card ${f ? 'f' : 'm'} ${q.dead ? 'dead' : ''} ${big ? 'big' : ''}" data-tree="${q.id}"><b>${esc(q.name)}</b><span>${sub}</span></button>`;
    };
    const P = i => G.person(i);
    const parents = [P(p.mother), P(p.father)].filter(Boolean);
    const gp = []; for (const q of parents) { if (P(q.mother)) gp.push(P(q.mother)); if (P(q.father)) gp.push(P(q.father)); }
    const kids = (p.kids || []).map(P).filter(Boolean);
    const gk = []; for (const k of kids) for (const i of (k.kids || [])) { const q = P(i); if (q) gk.push(q); }
    const sibs = [];
    const all = [...S.villagers.values(), ...S.dead.values()];
    for (const q of all) if (q.id !== p.id && ((p.mother && q.mother === p.mother) || (p.father && q.father === p.father))) sibs.push(q);
    const partner = P(p.partner) || P(p.widow);
    const row = (label, list) => list.length ? `<div class="ft-row"><label>${label}</label><div class="ft-cards">${list.map(q => card(q)).join('')}</div></div>` : '';
    UI.openModal(`<h2>Família de ${esc(p.name)}</h2>
      <div class="ft">
      ${row('Avós', gp)}${row('Pais', parents)}
      <div class="ft-row main"><label>${p.dead ? 'Em memória' : 'Hoje'}</label><div class="ft-cards">${card(p, true)}${partner ? '<span class="ft-heart">' + ICON.heart + '</span>' + card(partner, true) : ''}</div></div>
      ${row('Irmãos', sibs)}${row('Filhos', kids)}${row('Netos', gk)}
      ${!gp.length && !parents.length && !kids.length && !sibs.length ? '<p class="muted center">Uma árvore ainda sem galhos. Talvez um dia.</p>' : ''}
      </div><div class="mbtns"><button data-m="person" data-id="${p.id}">Ver ${esc(p.name)}</button><button class="primary" data-m="close">Fechar</button></div>`, 'wide');
  };
  // ------------------------------ world setup ------------------------------
  const MAPSVG = {
    ilha: '<path d="M14 30c-6-6-3-16 6-19 7-3 16-2 21 3 6 6 4 15-2 20-6 5-18 3-25-4z" fill="currentColor"/><path d="M24 18c3 4 5 9 11 12" stroke="#3a7ab8" stroke-width="1.6" fill="none"/>',
    continente: '<path d="M6 34c-2-9 1-20 10-25 9-4 22-5 30 1 7 6 9 15 5 23-4 8-15 10-26 9-9-1-17-1-19-8z" fill="currentColor"/><path d="M20 20l4-6 4 6M32 26l3-5 3 5" stroke="#6a5a4a" stroke-width="1.4" fill="none"/>',
    mar: '<path d="M6 12c1-4 6-5 9-3 2 2 1 6-2 7-4 1-8-1-7-4zM36 8c2-3 8-3 9 1 1 4-3 6-6 5-3 0-4-3-3-6zM20 30c1-4 8-5 10-2 3 3 0 7-4 7-4 1-7-2-6-5zM42 32c1-2 5-2 6 1 0 3-3 4-5 3-1-1-2-2-1-4z" fill="currentColor"/><path d="M13 18c5 3 9 7 9 10M30 12c4 2 7 6 10 17" stroke="#8ec8e8" stroke-width="1.2" stroke-dasharray="1.5 2.5" fill="none"/><path d="M24 20l2-4 2 4z" fill="#f4ecd8"/>',
    arquipelago: '<path d="M8 17c1-5 8-7 12-4 3 3 1 8-3 9-5 1-10-1-9-5zM30 12c2-4 9-4 11 0 2 5-3 8-7 7-3-1-5-4-4-7zM18 33c1-5 9-6 12-2 3 4-1 9-6 8-4 0-7-2-6-6zM40 29c2-3 8-2 8 2s-5 6-8 4c-1-1-1-4 0-6z" fill="currentColor"/><path d="M19 22l5 8M34 19l6 9" stroke="#8ec8e8" stroke-width="1.4" stroke-dasharray="2 2" fill="none"/>',
    istmo: '<path d="M4 20c0-8 8-13 15-11 5 2 6 6 9 7 3 1 5-5 11-5 7 0 12 6 11 13-1 7-8 11-15 9-4-1-5-5-8-5s-5 5-11 5C9 33 4 28 4 20z" fill="currentColor"/>',
  };
  UI.openSetup = function (fromGame, keep) {
    if (!keep || !UI._setup) UI._setup = { fromGame: !!fromGame, opts: Object.assign({}, G.Main.lastOpts) };
    const o = UI._setup.opts; if (!o.clima) o.clima = 'variado';
    const opt = (k, v, label, sub) => `<button class="st-opt ${o[k] === v ? 'on' : ''}" data-so="${k}" data-v="${v}"><b>${label}</b>${sub ? '<span>' + sub + '</span>' : ''}</button>`;
    const maps = Object.entries(G.MAP_TYPES).map(([id, m]) => `<button class="st-map ${o.type === id ? 'on' : ''}" data-so="type" data-v="${id}"><span class="st-pic">${svg(MAPSVG[id] || MAPSVG.ilha, '0 0 54 44')}</span><b>${m.name}</b><span>${m.desc}</span></button>`).join('');
    const tip = o.tribes === 1 ? 'Um único povo. Com o tempo, suas próprias vilas podem se rebelar e virar novos reinos.'
      : `${o.tribes} povos começam em cantos distantes, sem saber uns dos outros. Quando se encontrarem, virão comércio, alianças, guerras — e talvez correntes.`;
    // civilization per people
    o.civs = (o.civs || []).slice(0, 4);
    const focus = Math.min(UI._setup.focus || 0, o.tribes - 1);
    const civChip = (k, id) => { const c = G.CIVS[id]; const on = (o.civs[k] || 'rand') === id; return `<button class="st-civ ${on ? 'on' : ''}" data-civ="${k}" data-v="${id}" title="${c ? esc(c.blurb) : 'Sorteada ao criar o mundo'}"><i>${id === 'rand' ? ICON.star : UI.civIcon(id)}</i><b>${c ? c.name : 'Aleatória'}</b></button>`; };
    const rows = o.classic ? '' : Array.from({ length: o.tribes }, (_, k) => `<div class="st-civrow ${k === focus ? 'focus' : ''}"><span class="st-civn">${o.tribes > 1 ? 'Povo ' + (k + 1) : 'Seu povo'}</span><div class="st-civopts">${['rand'].concat(G.Civ.IDS).map(id => civChip(k, id)).join('')}</div></div>`).join('');
    const fc = G.CIVS[o.civs[focus]];
    const civTip = o.classic ? 'Tribos sem nome, como no começo de tudo: sem culturas históricas, sem traços especiais.'
      : fc ? `<b>${fc.name}.</b> ${esc(fc.blurb)}` : 'Aleatória: cada povo sorteia uma civilização diferente — gregos, nórdicos, egípcios, astecas ou romanos.';
    UI.openModal(`<h2>Novo mundo</h2>
      <div class="setup">
        <div class="st-label">Mapa</div><div class="st-maps">${maps}</div>
        <div class="st-grid">
          <div><div class="st-label">Tamanho</div><div class="st-row">${opt('size', 64, 'Pequeno')}${opt('size', 80, 'Médio')}${opt('size', 96, 'Grande')}</div></div>
          <div><div class="st-label">Povos</div><div class="st-row">${[1, 2, 3, 4].map(n => opt('tribes', n, String(n))).join('')}</div></div>
        </div>
        <div class="st-label">Clima</div>
        <div class="st-row st-clima">${Object.entries(G.Biome.CLIMAS).map(([k, c]) => opt('clima', k, c.name)).join('')}</div>
        <p class="st-hint">${esc((G.Biome.CLIMAS[o.clima || 'variado'] || G.Biome.CLIMAS.variado).desc)}</p>
        <div class="st-label">Civilizações</div>
        <div class="st-row">${opt('classic', 0, 'Históricas', 'cada povo com sua cultura')}${opt('classic', 1, 'Tribos sem nome', 'o modo clássico')}</div>
        <div class="st-civs">${rows}</div>
        <p class="st-hint civ">${civTip}</p>
        <div class="st-label">Temperamento dos povos</div>
        <div class="st-row">${opt('temper', 'pacifico', 'Pacíficos', 'guerras raras e tardias')}${opt('temper', 'normal', 'Imprevisíveis', 'depende de quem governa')}${opt('temper', 'belicoso', 'Belicosos', 'sangue cedo e muitas vezes')}</div>
        <p class="st-hint">${tip}</p>
      </div>
      <div class="mbtns"><button data-m="close">Cancelar</button><button class="primary" data-m="setup-go">Criar mundo</button></div>`, 'wide setup-modal');
  };

  // ------------------------------ kingdoms panel ------------------------------
  const REL = { paz: ['Paz', 'grey'], guerra: ['Guerra', 'red'], tregua: ['Trégua', 'blue'], alianca: ['Aliança', 'green'], vassalo: ['Vassalagem', 'gold'] };
  function relChip(a, b) {
    const r = G.Fac.rel(a.id, b.id); if (!r) return '';
    if (!r.met) return `<span class="rel unk">${UI.flag(b.id, 'mini')} desconhecido</span>`;
    let [txt, cls] = REL[r.st] || REL.paz;
    if (r.st === 'vassalo') txt = r.over === a.id ? 'Suserano' : 'Vassalo';
    const op = Math.round(r.op);
    return `<span class="rel ${cls}" title="Opinião ${op > 0 ? '+' : ''}${op}${r.grudge > 5 ? ' · rancor ' + Math.round(r.grudge) : ''}">${UI.flag(b.id, 'mini')}${txt}<em class="${op >= 0 ? 'pos' : 'neg'}">${op > 0 ? '+' : ''}${op}</em></span>`;
  }
  function realmCard(f) {
    const S = G.S; const P = G.Politics;
    const ruler = P.ruler(f);
    const sets = G.Fac.settlementsOf(f.id);
    const pop = G.Fac.pop(f.id), caps = G.Fac.captives(f.id), army = G.War.warriorsOf(f.id);
    const cap = G.Fac.capitalOf(f.id);
    const others = G.Fac.all().filter(o => o.id !== f.id);
    const words = ruler ? P.personaWords(ruler) : [];
    const past = f.rulers.slice(0, -1).slice(-4).reverse();
    const stab = Math.round(f.stab || 0);
    const status = [];
    if (f.coup) status.push('<span class="st red">Conspiração</span>');
    if (f.rev) status.push('<span class="st red">Revolução</span>');
    if (f.revolt) status.push('<span class="st red">Revolta de cativos</span>');
    if (f.exec) status.push('<span class="st red">Execução</span>');
    if (f.weariness > 60) status.push('<span class="st grey">Cansado da guerra</span>');
    if (f.stock.food < pop * 0.5) status.push('<span class="st red">Fome</span>');
    if (f.golden > 0) status.push(`<span class="st gold">Era de Ouro · ${Math.ceil(f.golden / G.DAY_LEN)}d</span>`);
    if (f.curse > 0) status.push(`<span class="st red">Amaldiçoado · ${Math.ceil(f.curse / G.DAY_LEN)}d</span>`);
    if (f.law && G.Powers.LAWS && G.Powers.LAWS[f.law]) status.push(`<span class="st gold" title="Mandamento divino">“${esc(G.Powers.LAWS[f.law].name)}”</span>`);
    const known = f.tech ? Object.keys(f.tech.known) : [];
    const cur = f.tech && f.tech.cur ? `${G.TECH[f.tech.cur].name} ${Math.min(99, Math.floor(f.tech.pts / G.Civ.techCost(f, f.tech.cur) * 100))}%` : '';
    const ships = S.ships.filter(s => s.fac === f.id); const warships = ships.filter(s => s.kind === 'guerra').length;
    return `<div class="realm ${f.id === UI.viewFac ? 'on' : ''}" style="--fc:${G.Fac.hex(f.id)}">
      <div class="rm-head">${UI.flag(f.id, 'big')}<div class="rm-title"><h3>${esc(f.name)}</h3><div class="sub">${f.civ && G.CIVS[f.civ] ? `<span class="rm-civ">${UI.civIcon(f.civ)}${G.CIVS[f.civ].name}</span> · ` : ''}${P.govName(f)} · ${G.ERAS[f.era] || ''}${f.parent && G.Fac.get(f.parent) ? ' · rompeu com ' + esc(G.Fac.get(f.parent).name) : ''}</div></div>
      <button class="rm-go" data-m="realm-go" data-id="${f.id}" title="Ir até a capital">${ICON.eye}</button></div>
      <div class="rm-ruler">${ICON.crown}${ruler ? `<a data-m="leader" data-id="${ruler.id}">${esc(P.styled(f, ruler))}</a>` : '<span class="muted">sem líder</span>'}</div>
      ${ruler ? `<div class="rm-pers">${Math.floor(ruler.age)} anos${words.length ? ' · ' + words.join(', ') : ''} · legitimidade ${Math.round(f.legit)}%</div>` : ''}
      <div class="rm-stats">
        <span title="População livre">${ICON.pop}<b>${pop}</b></span>
        <span title="Guerreiros">${ICON.sword}<b>${army}</b></span>
        ${caps ? `<span title="Cativos mantidos">${ICON.chain}<b>${caps}</b></span>` : ''}
        <span title="Vilas">${ICON.home}<b>${sets.length}</b></span>
        <span title="Comida">${ICON.food}<b>${Math.floor(f.stock.food)}</b></span>
        <span title="Madeira">${ICON.wood}<b>${Math.floor(f.stock.wood)}</b></span>
        <span title="Pedra">${ICON.stone}<b>${Math.floor(f.stock.stone)}</b></span>
        ${ships.length ? `<span title="Navios (${warships} de guerra)">${ICON.ship}<b>${ships.length}</b></span>` : ''}
      </div>
      ${f.tech ? `<div class="rm-tech">${ICON.tech}<span>${known.length ? known.map(t => G.TECH[t].name).join(' · ') : 'Nenhum saber ainda'}${cur ? ` <em>pesquisando ${esc(cur)}</em>` : ''}</span></div>` : ''}
      ${bar('Estabilidade', stab, stab < 35 ? 'hp' : 'energy', stab + '%')}
      ${status.length ? `<div class="status">${status.join('')}</div>` : ''}
      <div class="rm-sets">${sets.map(s => `<span class="${s === cap ? 'cap' : ''}" title="Lealdade ${Math.round(s.loyalty)}%">${s === cap ? ICON.crown : ''}${esc(s.name)} <small>${G.City.tierName(s).toLowerCase()}</small> <em class="${s.loyalty < 30 ? 'neg' : ''}">${Math.round(s.loyalty)}%</em></span>`).join('')}</div>
      ${others.length ? `<div class="rm-rels">${others.map(o => relChip(f, o)).join('')}</div>` : ''}
      <div class="rm-foot">${f.st.kills || f.st.deaths ? `${f.st.kills} mortes causadas · ${f.st.deaths} baixas` : G.Fac.enemiesOf(f.id).length ? 'Em guerra, ainda sem batalhas' : 'Nunca lutou uma batalha'}${f.st.conquests ? ' · ' + f.st.conquests + (f.st.conquests > 1 ? ' conquistas' : ' conquista') : ''}${f.st.massacres ? ' · ' + f.st.massacres + (f.st.massacres > 1 ? ' massacres' : ' massacre') : ''}${f.st.captives ? ' · ' + f.st.captives + ' capturados' : ''}${f.st.executions ? ' · ' + f.st.executions + (f.st.executions > 1 ? ' execuções' : ' execução') : ''}</div>
      ${past.length ? `<div class="rm-hist">${past.map(r => `<span>${esc(r.title || '')} ${esc(r.name)}${r.ord > 1 ? ' ' + ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][r.ord] : ''}${r.ep ? ', ' + esc(r.ep) : ''} <em>dia ${r.from}–${r.to !== undefined ? r.to : '?'}${END_TXT[r.end] ? ' · ' + END_TXT[r.end] : ''}</em></span>`).join('')}</div>` : ''}
      <button class="rm-view" data-m="realm" data-id="${f.id}">${f.id === UI.viewFac ? 'Acompanhando' : 'Acompanhar este povo'}</button>
    </div>`;
  }
  const END_TXT = { morte: 'morte', old: 'velhice', batalha: 'caiu em batalha', golpe: 'derrubado num golpe', revolucao: 'derrubado pelo povo', executado: 'executado', capturado: 'capturado', deposto: 'deposto por deus', queda: 'o povo caiu', partiu: 'partiu', war: 'batalha', lightning: 'raio', meteor: 'meteoro', sick: 'doença', hunger: 'fome', fire: 'fogo' };
  UI.openRealms = function () {
    const S = G.S; if (!S) return;
    const all = G.Fac.all();
    const dead = [...S.factions.values()].filter(f => !f.alive);
    const st = S.stats;
    all.sort((a, b) => (b.id === UI.viewFac) - (a.id === UI.viewFac) || G.Fac.pop(b.id) - G.Fac.pop(a.id));
    UI.openModal(`<h2>Reinos</h2>
      <div class="realms-top"><canvas id="realm-map" width="320" height="200"></canvas>
      <div class="realms-sum">
        <div><b>${all.length}</b> ${all.length === 1 ? 'povo vivo' : 'povos vivos'}${dead.length ? ` · <b>${dead.length}</b> ${dead.length > 1 ? 'caídos' : 'caído'}` : ''}</div>
        <div><b>${st.wars || 0}</b> guerras · <b>${st.battles || 0}</b> batalhas · <b>${st.warDeaths || 0}</b> mortos em combate</div>
        <div><b>${st.conquests || 0}</b> conquistas · <b>${st.massacres || 0}</b> massacres · <b>${st.captives || 0}</b> capturados · <b>${st.freed || 0}</b> libertados</div>
        <div><b>${st.secessions || 0}</b> rachas · <b>${st.coups || 0}</b> golpes · <b>${st.revolutions || 0}</b> revoluções · <b>${st.executions || 0}</b> execuções</div>
        <div class="muted">Clique num povo para acompanhá-lo no HUD. <kbd>R</kbd> abre este painel, <kbd>B</kbd> mostra/oculta as fronteiras.</div>
      </div></div>
      <div class="realms">${all.map(realmCard).join('')}</div>
      ${dead.length ? `<h4 class="rm-deadh">Povos caídos</h4><div class="rm-dead">${dead.map(f => `<span>${UI.flag(f.id, 'mini')}<b>${esc(f.name)}</b> <em>dia ${f.founded}–${f.died} · ${esc(f.fate || '')}</em></span>`).join('')}</div>` : ''}
      <div class="mbtns"><button class="primary" data-m="close">Fechar</button></div>`, 'wide realms-modal');
    drawRealmMap();
  };
  function drawRealmMap() {
    const c = $('#realm-map'); if (!c) return; const x = c.getContext('2d');
    const S = G.S; const N = S.N || G.N; const W = c.width, H = c.height;
    x.clearRect(0, 0, W, H);
    // fit the land (not the whole ocean) into the canvas
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) if (S.type[ty * N + tx] > G.T.SEA) { const u = tx - ty, w = (tx + ty) * 0.5; if (u < x0) x0 = u; if (u > x1) x1 = u; if (w < y0) y0 = w; if (w > y1) y1 = w; }
    if (x0 > x1) { x0 = -N; x1 = N; y0 = 0; y1 = N; }
    const sc = Math.min((W - 16) / (x1 - x0 + 2), (H - 16) / (y1 - y0 + 2));
    const ox = W / 2 - (x0 + x1) / 2 * sc, oy = H / 2 - (y0 + y1 + 1) / 2 * sc;
    const P = (tx, ty) => [ox + (tx - ty) * sc, oy + (tx + ty) * sc * 0.5];
    const terr = G.Fac.terrFac;
    for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) {
      const i = ty * N + tx; const t = S.type[i];
      let col = t <= G.T.SEA ? null : t === G.T.RIVER ? '#6aa8c8' : t === G.T.SAND ? '#d8c890' : t === G.T.ROCKY ? '#9a948a' : '#6e9a52';
      if (!col) continue;
      if (terr && terr[i]) { const rgb = G.hex2rgb(G.Fac.hex(terr[i])); const base = G.hex2rgb(col); col = G.rgb(G.lerpColor(base, rgb, 0.55)); }
      const [px, py] = P(tx, ty);
      x.fillStyle = col; x.beginPath(); x.moveTo(px, py); x.lineTo(px + sc, py + sc * 0.5); x.lineTo(px, py + sc); x.lineTo(px - sc, py + sc * 0.5); x.closePath(); x.fill();
    }
    // wars & alliances between capitals
    const fs = G.Fac.all();
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      const r = G.Fac.rel(fs[i].id, fs[j].id); if (!r || !r.met || r.st === 'paz' || r.st === 'tregua') continue;
      const a = G.Fac.capitalOf(fs[i].id), b = G.Fac.capitalOf(fs[j].id); if (!a || !b) continue;
      const [ax, ay] = P(a.cx, a.cy), [bx, by] = P(b.cx, b.cy);
      x.strokeStyle = r.st === 'guerra' ? 'rgba(255,70,60,0.9)' : r.st === 'alianca' ? 'rgba(120,200,255,0.9)' : 'rgba(240,200,90,0.9)';
      x.lineWidth = 2; x.setLineDash(r.st === 'guerra' ? [5, 3] : []); x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]);
    }
    for (const b of G.War.bands.values()) {
      const f = G.Fac.get(b.fac); const v = S.villagers.get(b.members[0]); if (!f || !v) continue;
      const [px, py] = P(v.x, v.y); x.fillStyle = G.Fac.hex(f.id); x.strokeStyle = '#fff'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(px, py - 5); x.lineTo(px + 4, py + 3); x.lineTo(px - 4, py + 3); x.closePath(); x.fill(); x.stroke();
    }
    for (const s of S.settlements.values()) {
      const [px, py] = P(s.cx, s.cy); const f = G.Fac.get(s.fac);
      const capital = f && G.Fac.capitalOf(f.id) === s;
      x.fillStyle = f ? G.Fac.hex(f.id) : '#999'; x.strokeStyle = '#1a1410'; x.lineWidth = 1.5;
      x.beginPath(); x.arc(px, py, capital ? 4.5 : 3, 0, Math.PI * 2); x.fill(); x.stroke();
      if (capital) { x.fillStyle = '#ffe08a'; x.beginPath(); x.arc(px, py, 1.6, 0, Math.PI * 2); x.fill(); }
    }
  }
})(window.G);
