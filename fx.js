/* fx.js - pooled particles (one instanced draw call): smoke, sparks, harmless cartoon stars */
(function () {
  'use strict';
  var G = window.G, U = G.U;
  var FX = G.FX = { max: 56, list: [], mesh: null, free: [] };
  var m4 = new THREE.Matrix4(), col = new THREE.Color(), zero = new THREE.Matrix4().makeScale(0, 0, 0);

  FX.init = function (scene) {
    FX.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), FX.max);
    FX.mesh.frustumCulled = false;
    for (var i = 0; i < FX.max; i++) {
      FX.mesh.setMatrixAt(i, zero); FX.mesh.setColorAt(i, col.setHex(0xffffff));
      FX.list.push({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, size: 0.3, g: 0, shrink: true, rot: 0 });
      FX.free.push(i);
    }
    scene.add(FX.mesh);
  };
  FX.emit = function (x, y, z, vx, vy, vz, life, color, size, gravity) {
    if (!FX.free.length) return;
    var i = FX.free.pop(), p = FX.list[i];
    p.on = true; p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.life = p.max = life; p.size = size; p.g = gravity || 0; p.rot = Math.random() * 6;
    FX.mesh.setColorAt(i, col.setHex(color));
    FX.mesh.instanceColor.needsUpdate = true;
  };
  FX.burst = function (x, y, z, n, color, speed, size, life, gravity) {
    for (var k = 0; k < n; k++) {
      var a = Math.random() * U.TAU, s = (0.4 + Math.random() * 0.6) * speed;
      FX.emit(x, y, z, Math.cos(a) * s, (0.3 + Math.random()) * speed * 0.8, Math.sin(a) * s, life || 0.7, color, size || 0.25, gravity === undefined ? 9 : gravity);
    }
  };
  FX.smoke = function (x, y, z) {
    FX.emit(x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.6, 1.4, (Math.random() - 0.5) * 0.6, 1.1, 0x9e9e9e, 0.55, -0.5);
  };
  FX.stars = function (x, y, z) {     // cartoon "bonk" stars
    for (var k = 0; k < 6; k++) {
      var a = k / 6 * U.TAU;
      FX.emit(x, y, z, Math.cos(a) * 2.2, 2.5, Math.sin(a) * 2.2, 0.9, k % 2 ? 0xffee58 : 0xffffff, 0.28, 3);
    }
  };
  FX.update = function (dt) {
    var any = false;
    for (var i = 0; i < FX.max; i++) {
      var p = FX.list[i];
      if (!p.on) continue;
      p.life -= dt;
      if (p.life <= 0) { p.on = false; FX.mesh.setMatrixAt(i, zero); FX.free.push(i); any = true; continue; }
      p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.y < 0.1 && p.g > 0) { p.y = 0.1; p.vy *= -0.3; }
      var k = p.life / p.max, s = p.size * (p.g < 0 ? (1.6 - k * 0.8) : (0.4 + 0.6 * k));
      m4.makeRotationY(p.rot + p.life * 4); m4.scale(new THREE.Vector3(s, s, s)); m4.setPosition(p.x, p.y, p.z);
      FX.mesh.setMatrixAt(i, m4); any = true;
    }
    if (any) FX.mesh.instanceMatrix.needsUpdate = true;
  };
})();