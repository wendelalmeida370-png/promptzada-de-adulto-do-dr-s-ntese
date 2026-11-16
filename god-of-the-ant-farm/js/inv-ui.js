'use strict';
// ============================================================
//  InvUI: the screen of the bag and the equipment, and the bar
//  of quick things (the hotbar) on the body's screen (D-336).
//  Only seen: it reads G.Inv and asks the world through the
//  body's doors (G.Possess.apply), never moves a thing itself
//  (the guard's rules 13 and 111). It plugs into the body's
//  screen by its ports: the hotbar's place in the HUD
//  (G.IncUI.hud(), '.ih-hotbar'), the panel mark
//  (G.Modes.setPanel), the closing of every panel
//  (G.IncUI.closers), the keys by action name (G.Input3D.on).
//  This file starts as the contract's skeleton; the screen is
//  the inventory's work (wave 1, part C).
// ============================================================
(function (G) {
  const UI = G.InvUI = {};
  UI.open = () => false;
})(window.G);
