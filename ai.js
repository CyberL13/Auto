/* ai.js - road-following drivers (traffic, racers), police pursuit AI and the wanted-level system */
(function () {
  'use strict';
  var G = window.G, U = G.U, M = G.Map, W = G.World, V = G.Vehicles, Lt = G.Lights, C = G.CFG;
  var LANE = C.LANE, N = M.N;
  var AI = G.AI = {}, Traffic = G.Traffic = { timer: 0 }, Pol = G.Police = { timer: 0 }, Wt = G.Wanted = {};

  /* ---------- grid helpers ---------- */
  AI.initGrid = function (ai, x, z, h) {
    var fx = Math.sin(h), fz = Math.cos(h), dx = 0, dz = 0;
    if (Math.abs(fx) > Math.abs(fz)) dx = fx > 0 ? 1 : -1; else dz = fz > 0 ? 1 : -1;
    var gi = (x - M.O) / M.P, gj = (z - M.O) / M.P, ni, nj;
    if (dx !== 0) { nj = Math.round(gj); ni = dx > 0 ? Math.ceil(gi + 0.1) : Math.floor(gi - 0.1); }
    else { ni = Math.round(gi); nj = dz > 0 ? Math.ceil(gj + 0.1) : Math.floor(gj - 0.1); }
    ai.ni = U.clamp(ni, 0, N); ai.nj = U.clamp(nj, 0, N); ai.dx = dx; ai.dz = dz; ai.nd = null;
  };

  function chooseDir(ai) {
    var cand = [], bx = -ai.dx, bz = -ai.dz, i;
    for (i = 0; i < 4; i++) {
      var d = M.DIRS[i];
      if (!M.validDir(ai.ni, ai.nj, d)) continue;
      if (d.x === bx && d.z === bz) continue;
      cand.push(d);
    }
    if (!cand.length) return { x: bx, z: bz };
    if (ai.route && ai.ri + 1 < ai.route.length) {
      var nx = ai.route[ai.ri + 1];
      for (i = 0; i < cand.length; i++) if (ai.ni + cand[i].x === nx[0] && ai.nj + cand[i].z === nx[1]) return cand[i];
    }
    if (ai.goal) {
      var best = null, bd = 1e9;
      for (i = 0; i < cand.length; i++) {
        var dd = Math.abs(ai.ni + cand[i].x - ai.goal.i) + Math.abs(ai.nj + cand[i].z - ai.goal.j) + Math.random() * 0.6;
        if (dd < bd) { bd = dd; best = cand[i]; }
      }
      return best;
    }
    // random with a bias for driving straight
    for (i = 0; i < cand.length; i++) if (cand[i].x === ai.dx && cand[i].z === ai.dz && Math.random() < 0.55) return cand[i];
    return cand[Math.floor(Math.random() * cand.length)];
  }

  /* nearest obstacle in the driving corridor */
  var obs = { gap: 1e9, who: null };
  function obstacle(v) {
    var fx = Math.sin(v.h), fz = Math.cos(v.h), rx = -fz, rz = fx, look = 9 + Math.max(0, v.speed) * 1.3;
    obs.gap = 1e9; obs.who = null;
    for (var i = 0; i < V.list.length; i++) {
      var w = V.list[i];
      if (w === v) continue;
      var dx = w.x - v.x, dz = w.z - v.z;
      if (dx > look + 6 || dx < -look - 6 || dz > look + 6 || dz < -look - 6) continue;
      var along = dx * fx + dz * fz;
      if (along < 0.3 || along > look + w.def.len / 2) continue;
      var lat = dx * rx + dz * rz;
      if (Math.abs(lat) > (v.def.wid + w.def.wid) / 2 + 0.45) continue;
      var gap = along - (v.def.len + w.def.len) / 2;
      if (gap < obs.gap) { obs.gap = gap; obs.who = w; }
    }
    return obs;
  }
  function allowedSpeed(o) {
    if (!o.who) return 99;
    if (o.gap < 1.5) return 0;
    return Math.max(0, (o.who.speed > 0 ? o.who.speed * 0.85 : 0) + (o.gap - 3.2) * 0.8);
  }

  function drive(v, vt, steerAmt) {
    var c = v.ctrl;
    c.steer = steerAmt;
    if (vt < 0.3 && Math.abs(v.speed) < 1.2) { c.hb = 1; c.thr = 0; }
    else { c.hb = 0; c.thr = U.clamp((vt - v.speed) * 0.5, -1, 0.8); }
  }
