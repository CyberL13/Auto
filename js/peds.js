(function () {
  'use strict';
  var G = window.LowPolyGame = window.LowPolyGame || {};
  G.Peds = {
    actors: [],
    init: function (scene) {
      var colors = [0xff7043, 0x42a5f5, 0xffca28, 0xab47bc, 0x26a69a];
      for (var i = 0; i < 12; i++) {
        // BoxGeometry is supported by the Three.js r128 build loaded by index.html.
        var mesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 1.7, 0.7),
          new THREE.MeshLambertMaterial({ color: colors[i % colors.length] })
        );
        mesh.position.set((i % 4 - 1.5) * 13, 0.85, (Math.floor(i / 4) - 1) * 18);
        scene.add(mesh);
        this.actors.push({ mesh: mesh, phase: i * 0.7, origin: mesh.position.clone() });
      }
    },
    update: function (dt, t) {
      this.actors.forEach(function (a) {
        a.mesh.position.x = a.origin.x + Math.sin(t * 0.45 + a.phase) * 1.5;
      });
    }
  };
})();
