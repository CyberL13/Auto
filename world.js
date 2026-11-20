/* world.js - static collision grid (AABBs + circles) and traffic light timing */
(function () {
  'use strict';
  var G = window.G, U = G.U, M = G.Map;
  var CELL = 16, stamp = 1;

  var W = G.World = { boxes: [], circles: [], grid: {}, ready: false };

  function cellKey(cx, cz) { return (cx + 500) * 1024 + (cz + 500); }
  function insert(obj, x0, z0, x1, z1) {
    var a = Math.floor(x0 / CELL), b = Math.floor(x1 / CELL), c = Math.floor(z0 / CELL), d = Math.floor(z1 / CELL);
    for (var i = a; i <= b; i++) for (var j = c; j <= d; j++) {
      var k = cellKey(i, j);
      (W.grid[k] || (W.grid[k] = [])).push(obj);
    }
  }
  W.addBox = function (x0, z0, x1, z1, h, kind) {
    var o = { t: 0, x0: x0, z0: z0, x1: x1, z1: z1, h: h || 10, kind: kind || 'building', q: 0 };
    W.boxes.push(o); insert(o, x0, z0, x1, z1); return o;
  };
  W.addCircle = function (x, z, r, kind, h) {
    var o = { t: 1, x: x, z: z, r: r, h: h || 3, kind: kind || 'prop', q: 0 };
    W.circles.push(o); insert(o, x - r, z - r, x + r, z + r); return o;
  };

  W.build = function () {
    W.boxes = []; W.circles = []; W.grid = {};
    M.blocks.forEach(function (col) {
      col.forEach(function (blk) {
        blk.buildings.forEach(function (b) { W.addBox(b.x0, b.z0, b.x1, b.z1, b.h, 'building'); });
        if (blk.pond) { /* decorative only */ }
      });
    });
    M.trees.forEach(function (t) { if (!t.skip) W.addCircle(t.x, t.z, 0.45 * Math.max(0.8, t.s), 'tree', 6); });
    M.lamps.forEach(function (l) { W.addCircle(l.x, l.z, 0.22, 'lamp', 6); });
    M.hydrants.forEach(function (h) { W.addCircle(h.x, h.z, 0.25, 'hydrant', 1); });
    M.bins.forEach(function (h) { W.addCircle(h.x, h.z, 0.3, 'bin', 1); });
    M.benches.forEach(function (b) { W.addBox(b.x - (b.alongX ? 1 : 0.3), b.z - (b.alongX ? 0.3 : 1), b.x + (b.alongX ? 1 : 0.3), b.z + (b.alongX ? 0.3 : 1), 1, 'bench'); });
    M.shops.forEach(function (s) {
      if (s.pumps) s.pumps.forEach(function (p) { W.addCircle(p.x, p.z, 0.8, 'pump', 2); });
      if (s.canopy) {
        var c = s.canopy, hw = c.alongX ? c.w / 2 : c.d / 2, hd = c.alongX ? c.d / 2 : c.w / 2;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { W.addCircle(c.x + q[0] * (hw - 1), c.z + q[1] * (hd - 1), 0.5, 'pillar', 6); });
      }
    });
    M.walls.forEach(function (w) { W.addBox(w.x0, w.z0, w.x1, w.z1, 4, 'wall'); });
    W.ready = true;
  };

  var tmp = [];
  W.near = function (x0, z0, x1, z1) {
    tmp.length = 0; stamp++;
    var a = Math.floor(x0 / CELL), b = Math.floor(x1 / CELL), c = Math.floor(z0 / CELL), d = Math.floor(z1 / CELL);
    for (var i = a; i <= b; i++) for (var j = c; j <= d; j++) {
      var arr = W.grid[cellKey(i, j)];
      if (!arr) continue;
      for (var k = 0; k < arr.length; k++) { var o = arr[k]; if (o.q !== stamp) { o.q = stamp; tmp.push(o); } }
    }
    return tmp;
  };

  /* push circle (x,z,r) out of static geometry. out = {hit,x,z,nx,nz,pen,kind} */
  W.collideCircle = function (x, z, r, out) {
    out.hit = false; out.pen = 0; out.nx = 0; out.nz = 0; out.kind = '';
    var list = W.near(x - r, z - r, x + r, z + r);
    for (var i = 0; i < list.length; i++) {
      var o = list[i], dx, dz, d, pen, nx, nz;
      if (o.t === 0) {