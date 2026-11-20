/* dress.js - decorations, signs and entrance markers for the shop buildings */
(function () {
  'use strict';
  var G = window.G, U = G.U, M = G.Map, City = G.City, R = G.Render;

  var Dress = G.Dress = { signs: [], display: [] };
  var SHOP_COLORS = { garage: 0x90a4ae, bank: 0x66bb6a, dealer: 0xef5350, market: 0x42a5f5, clothes: 0xab47bc, restaurant: 0xffa726, gas: 0xffee58 };
  var JOB_COLORS = { taxi: 0xffeb3b, delivery: 0x26c6da, package: 0xa1887f, race: 0xff7043, parking: 0x9575cd, collect: 0xffd54f };
  Dress.SHOP_COLORS = SHOP_COLORS; Dress.JOB_COLORS = JOB_COLORS;

  function at(s, a, c) { var b = s.block; return { x: b.cx + s.f.x * a + s.r.x * c, z: b.cz + s.f.z * a + s.r.z * c }; }
  function sbox(mb, s, a0, a1, c0, c1, y0, y1, col, o) {
    var p = at(s, a0, c0), q = at(s, a1, c1);
    mb.box(Math.min(p.x, q.x), y0, Math.min(p.z, q.z), Math.max(p.x, q.x), y1, Math.max(p.z, q.z), col, o);
  }
  function signTexture(text, bg) {
    var c = document.createElement('canvas'); c.width = 512; c.height = 112;
    var g = c.getContext('2d');
    g.fillStyle = U.css(bg); g.fillRect(0, 0, 512, 112);
    g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 100);
    var size = 62;
    g.font = 'bold ' + size + 'px "Arial Black", Impact, sans-serif';
    while (g.measureText(text).width > 470 && size > 20) { size -= 4; g.font = 'bold ' + size + 'px "Arial Black", Impact, sans-serif'; }
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 256, 60);
    var t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    return t;
  }

  Dress.build = function (scene) {
    M.shops.forEach(function (s) {
      var mb = City.chunkAt(s.block.cx, s.block.cz).flat, a = s.type === 'gas' ? -3 : 11, tp = s.type;

      /* entrance */
      if (tp === 'garage') {
        [-10, 0, 10].forEach(function (cc) {
          sbox(mb, s, a, a + 0.25, cc - 4, cc + 4, 0, 4.2, 0x607d8b);
          for (var k = 0; k < 6; k++) sbox(mb, s, a + 0.2, a + 0.32, cc - 4, cc + 4, 0.5 + k * 0.7, 0.62 + k * 0.7, 0x455a64);
        });
      } else if (tp !== 'police') {
        sbox(mb, s, a, a + 0.4, -2.1, 2.1, 0, 3.4, s.signCol);
        sbox(mb, s, a, a + 0.5, -1.65, 1.65, 0, 3.0, 0x1b2a36);
      } else {
        sbox(mb, s, a, a + 0.4, -2.4, 2.4, 0, 3.4, 0x1565c0);
        sbox(mb, s, a, a + 0.5, -1.9, 1.9, 0, 3.0, 0x1b2a36);
        sbox(mb, s, a, a + 0.2, -20, 20, 3.8, 4.6, 0x1565c0);
        var rp = at(s, 5, 0);
        mb.boxC(rp.x - 1, 14.4, rp.z, 1.2, 0.8, 1.2, 0xe53935); mb.boxC(rp.x + 1, 14.4, rp.z, 1.2, 0.8, 1.2, 0x1e88e5);
      }
      if (tp === 'market' || tp === 'clothes' || tp === 'restaurant' || tp === 'bank' || tp === 'dealer' || tp === 'gas') {
        var wmax = tp === 'dealer' ? 22 : (tp === 'gas' ? 11 : 17), y1 = tp === 'dealer' ? 5.6 : 3.3;
        sbox(mb, s, a, a + 0.18, -wmax, -4, tp === 'dealer' ? 0.3 : 0.8, y1, 0x6aa0c0);
        sbox(mb, s, a, a + 0.18, 4, wmax, tp === 'dealer' ? 0.3 : 0.8, y1, 0x6aa0c0);
      }

      /* type specific decoration */
      if (tp === 'market' || tp === 'restaurant' || tp === 'clothes') {
        for (var k = 0; k < 8; k++) sbox(mb, s, a, a + 3.2, -8 + k * 2, -6 + k * 2, 3.5 - k * 0.0, 3.72, k % 2 ? 0xfafafa : (tp === 'restaurant' ? 0xd32f2f : s.signCol));
      }
      if (tp === 'restaurant') {