/* city.js - builds the render meshes of the procedural city (chunked, merged, vertex coloured) */
(function () {
  'use strict';
  var G = window.G, U = G.U, M = G.Map, MB = G.Models.MB, R = G.Render;
  var N = M.N, P = M.P, O = M.O, H = M.HALF, E = M.extents;

  var City = G.City = { chunks: [], markers: [], pool: [], lightState: [], lightHeads: null };

  function rectY(mb, x0, z0, x1, z1, y, col) { mb.quad([x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], col); }

  var chunkMap = {};
  City.chunkAt = function (x, z) {
    var bi = U.clamp(Math.floor((x - O) / P), 0, N - 1), bj = U.clamp(Math.floor((z - O) / P), 0, N - 1);
    var ci = bi >> 1, cj = bj >> 1, k = ci + ',' + cj;
    if (!chunkMap[k]) {
      chunkMap[k] = { flat: new MB(), decal: new MB(), bld: new MB(), cx: O + (ci * 2 + 1) * P, cz: O + (cj * 2 + 1) * P, meshes: [] };
      City.chunks.push(chunkMap[k]);
    }
    return chunkMap[k];
  };

  City.build = function (scene) {
    var ground = new MB();
    // grass + far ground
    rectY(ground, -2500, -2500, 2500, 2500, -0.08, 0x6aa55a);
    var asphalt = 0x3b3e43, yellow = 0xe0c75a, white = 0xe6e6e6;

    /* ---- roads, markings ---- */
    for (var j = 0; j <= N; j++) for (var i = 0; i <= N; i++) {
      var nx = M.rx(i), nz = M.rz(j), ch = City.chunkAt(nx, nz);
      rectY(ch.flat, nx - 6, nz - 6, nx + 6, nz + 6, 0, asphalt);
      // crosswalks on every existing approach
      M.DIRS.forEach(function (d) {
        if (!M.validDir(i, j, d)) return;
        for (var k = -4; k <= 4; k++) {
          var cxp = nx + d.x * 9.3, czp = nz + d.z * 9.3;
          if (d.x !== 0) rectY(ch.decal, cxp - 1.2, nz + k * 1.2 - 0.3, cxp + 1.2, nz + k * 1.2 + 0.3, 0.02, white);
          else rectY(ch.decal, nx + k * 1.2 - 0.3, czp - 1.2, nx + k * 1.2 + 0.3, czp + 1.2, 0.02, white);
        }
      });
      // road segment to the east (x) and south (z)
      if (i < N) {
        var x0 = nx + 6, x1 = M.rx(i + 1) - 6, c2 = City.chunkAt((x0 + x1) / 2, nz);
        rectY(c2.flat, x0, nz - 6, x1, nz + 6, 0, asphalt);
        for (var xx = x0 + 6; xx < x1 - 6; xx += 6) rectY(c2.decal, xx, nz - 0.1, xx + 3, nz + 0.1, 0.02, yellow);
        rectY(c2.decal, x0 + 5, nz - 5.3 - 0.07, x1 - 5, nz - 5.3 + 0.07, 0.02, white);
        rectY(c2.decal, x0 + 5, nz + 5.3 - 0.07, x1 - 5, nz + 5.3 + 0.07, 0.02, white);
      }
      if (j < N) {
        var z0 = nz + 6, z1 = M.rz(j + 1) - 6, c3 = City.chunkAt(nx, (z0 + z1) / 2);
        rectY(c3.flat, nx - 6, z0, nx + 6, z1, 0, asphalt);
        for (var zz = z0 + 6; zz < z1 - 6; zz += 6) rectY(c3.decal, nx - 0.1, zz, nx + 0.1, zz + 3, 0.02, yellow);
        rectY(c3.decal, nx - 5.3 - 0.07, z0 + 5, nx - 5.3 + 0.07, z1 - 5, 0.02, white);
        rectY(c3.decal, nx + 5.3 - 0.07, z0 + 5, nx + 5.3 + 0.07, z1 - 5, 0.02, white);
      }
    }

    /* ---- blocks: sidewalk ring, lot, buildings, parks ---- */
    var curb = 0xa4a8ad, walk = 0xbdc0c4;
    M.blocks.forEach(function (col) {
      col.forEach(function (blk) {
        var cx = blk.cx, cz = blk.cz, ch = City.chunkAt(cx, cz), S = P / 2 - 6, h = 0.15;
        var f = ch.flat;
        f.box(cx - S, 0, cz - S, cx + S, h, cz - H, curb, { topCol: walk });         // north strip
        f.box(cx - S, 0, cz + H, cx + S, h, cz + S, curb, { topCol: walk });         // south strip