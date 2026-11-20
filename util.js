/* util.js - math helpers, RNG, input */
(function () {
  'use strict';
  var G = window.G;
  var TAU = Math.PI * 2;

  var U = G.U = {
    TAU: TAU,
    clamp: function (v, a, b) { return v < a ? a : (v > b ? b : v); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    wrap: function (a) { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; },
    angDiff: function (from, to) { return U.wrap(to - from); },
    damp: function (cur, target, rate, dt) { return cur + (target - cur) * (1 - Math.exp(-rate * dt)); },
    dampAngle: function (cur, target, rate, dt) { return cur + U.angDiff(cur, target) * (1 - Math.exp(-rate * dt)); },
    dist: function (ax, az, bx, bz) { var dx = ax - bx, dz = az - bz; return Math.sqrt(dx * dx + dz * dz); },
    dist2: function (ax, az, bx, bz) { var dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; },
    rng: function (seed) {              // mulberry32
      var a = seed >>> 0;
      return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        var t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    pick: function (arr, r) { return arr[Math.floor((r || Math.random)() * arr.length)]; },
    money: function (n) {
      n = Math.round(n);
      var s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (n < 0 ? '-$' : '$') + s;
    },
    pad2: function (n) { return n < 10 ? '0' + n : '' + n; },
    mixHex: function (a, b, t) {
      var ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
      var br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
      return ((ar + (br - ar) * t) << 16) | ((ag + (bg - ag) * t) << 8) | (ab + (bb - ab) * t) | 0;
    },
    shade: function (hex, f) {
      var r = Math.min(255, ((hex >> 16) & 255) * f), g = Math.min(255, ((hex >> 8) & 255) * f), b = Math.min(255, (hex & 255) * f);
      return ((r << 16) | (g << 8) | b) | 0;
    },
    css: function (hex) { return '#' + ('000000' + (hex >>> 0).toString(16)).slice(-6); },
    $: function (id) { return document.getElementById(id); },
    safeGet: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    safeSet: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  /* ---------- input ---------- */
  var In = G.Input = {
    keys: {}, pressed: {}, dx: 0, dy: 0, wheel: 0,
    locked: false, dragging: false, canvas: null, suppressLock: false,
    down: function (c) { return !!In.keys[c]; },
    hit: function (c) { return !!In.pressed[c]; },
    endFrame: function () { In.pressed = {}; In.dx = 0; In.dy = 0; In.wheel = 0; },
    clear: function () { In.keys = {}; In.pressed = {}; In.dx = 0; In.dy = 0; In.dragging = false; },
    lock: function () {
      if (In.canvas && In.canvas.requestPointerLock && !In.locked) {
        try { var p = In.canvas.requestPointerLock(); if (p && p.catch) p.catch(function () {}); } catch (e) { /* ignore */ }
      }
    },
    unlock: function () {
      In.suppressLock = true;
      if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
      setTimeout(function () { In.suppressLock = false; }, 250);
    },