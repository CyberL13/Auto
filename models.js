/* models.js - low-poly mesh builder (vertex colours, merged geometry) and procedural models */
(function () {
  'use strict';
  var G = window.G, U = G.U;

  function hexToRGB(h) { return [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]; }

  /* ---------- MeshBuilder: collects triangles, outputs one BufferGeometry ---------- */
  function MB() { this.p = []; this.n = []; this.c = []; this.uv = []; }
  MB.prototype = {
    // quad a,b,c,d counter-clockwise seen from outside
    quad: function (a, b, c, d, col, uvs) {
      var rgb = hexToRGB(col);
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      var vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= l; ny /= l; nz /= l;
      var idx = [0, 1, 2, 0, 2, 3], vs = [a, b, c, d];
      for (var i = 0; i < 6; i++) {
        var v = vs[idx[i]];
        this.p.push(v[0], v[1], v[2]);
        this.n.push(nx, ny, nz);
        this.c.push(rgb[0], rgb[1], rgb[2]);
        var uv = uvs ? uvs[idx[i]] : [0.03, 0.03];
        this.uv.push(uv[0], uv[1]);
      }
    },
    tri: function (a, b, c, col) {
      var rgb = hexToRGB(col);
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      var vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= l; ny /= l; nz /= l;
      var vs = [a, b, c];
      for (var i = 0; i < 3; i++) {
        this.p.push(vs[i][0], vs[i][1], vs[i][2]); this.n.push(nx, ny, nz);
        this.c.push(rgb[0], rgb[1], rgb[2]); this.uv.push(0.03, 0.03);
      }
    },
    /* axis aligned box. opts: {bottom:true, tex:{tu,tv,off}, top:false, rotX, pivotY, pivotZ} */
    box: function (x0, y0, z0, x1, y1, z1, col, o) {
      o = o || {};
      var q = this.quad.bind(this);
      var tex = o.tex, tu = 0, tv = 0, off = 0;
      if (tex) { tu = tex.tu; tv = tex.tv; off = tex.off || 0; }
      var self = this, startLen = this.p.length;
      function sideUV(h0, h1, ya, yb) {
        if (!tex) return null;
        return [[(h0 + off) / tu, ya / tv], [(h1 + off) / tu, ya / tv], [(h1 + off) / tu, yb / tv], [(h0 + off) / tu, yb / tv]];
      }
      if (o.top !== false) q([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], o.topCol || col);
      if (o.bottom) q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], col);
      q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], col, sideUV(x0, x1, y0, y1));
      q([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], col, sideUV(x1, x0, y0, y1));
      q([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], col, sideUV(z1, z0, y0, y1));
      q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], col, sideUV(z0, z1, y0, y1));
      if (o.rotX) {   // rotate just-added vertices about X axis around (pivotY, pivotZ)
        var cs = Math.cos(o.rotX), sn = Math.sin(o.rotX), py = o.pivotY || 0, pz = o.pivotZ || 0;
        for (var i = startLen; i < this.p.length; i += 3) {
          var y = this.p[i + 1] - py, z = this.p[i + 2] - pz;
          this.p[i + 1] = y * cs - z * sn + py; this.p[i + 2] = y * sn + z * cs + pz;
          var ny = this.n[i + 1], nz = this.n[i + 2];