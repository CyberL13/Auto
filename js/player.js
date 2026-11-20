(function () {
  'use strict';
  var G = window.LowPolyGame = window.LowPolyGame || {};
  G.Player = {
    mesh: null, speed: 0, heading: 0, keys: {}, x: 0, z: 0,
    init: function (scene) {
      var car = new THREE.Group();
      var body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 4), new THREE.MeshLambertMaterial({ color: 0xffbe28 })); body.position.y = 0.65; car.add(body);
      var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.8, 1.9), new THREE.MeshLambertMaterial({ color: 0x8ed4e8 })); cabin.position.set(0, 1.35, -0.15); car.add(cabin);
      var wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 8), wheelMat = new THREE.MeshLambertMaterial({ color: 0x20242b });
      [[-1.08,0.42,-1.25],[1.08,0.42,-1.25],[-1.08,0.42,1.25],[1.08,0.42,1.25]].forEach(function (p) { var w = new THREE.Mesh(wheelGeo, wheelMat); w.rotation.z = Math.PI / 2; w.position.set(p[0],p[1],p[2]); car.add(w); });
      scene.add(car); this.mesh = car; this.reset();
      var self = this;
      window.addEventListener('keydown', function (e) { self.keys[e.code] = true; if (/Arrow/.test(e.code) || e.code === 'Space') e.preventDefault(); if (e.code === 'KeyR') self.reset(); });
      window.addEventListener('keyup', function (e) { self.keys[e.code] = false; });
    },
    reset: function () { this.x = 0; this.z = 0; this.heading = 0; this.speed = 0; if (this.mesh) { this.mesh.position.set(0, 0, 0); this.mesh.rotation.y = 0; } },
    update: function (dt) {
      var k = this.keys, forward = k.KeyW || k.ArrowUp, back = k.KeyS || k.ArrowDown, left = k.KeyA || k.ArrowLeft, right = k.KeyD || k.ArrowRight;
      if (forward) this.speed += 16 * dt; else if (back) this.speed -= 12 * dt; else this.speed *= Math.pow(0.985, dt * 60);
      if (k.Space) this.speed *= Math.pow(0.88, dt * 60);
      this.speed = Math.max(-10, Math.min(28, this.speed));
      var steer = (left ? 1 : 0) - (right ? 1 : 0);
      this.heading += steer * Math.min(1, Math.abs(this.speed) / 5) * dt * (this.speed < 0 ? -1 : 1) * 1.8;
      this.x += Math.sin(this.heading) * this.speed * dt; this.z += Math.cos(this.heading) * this.speed * dt;
      // Keep driving within the demo city limits.
      this.x = Math.max(-145, Math.min(145, this.x)); this.z = Math.max(-145, Math.min(145, this.z));
      this.mesh.position.set(this.x, 0, this.z); this.mesh.rotation.y = this.heading;
    }
  };
})();
