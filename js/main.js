(function () {
  'use strict';
  var G = window.LowPolyGame = window.LowPolyGame || {};
  G.boot = function () {
    var canvas = document.getElementById('game');
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); }
    catch (e) { document.getElementById('loaderror').textContent = 'WebGL is unavailable in this browser/device.'; document.getElementById('loaderror').classList.remove('hidden'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87c9ed);
    var scene = new THREE.Scene(); scene.background = new THREE.Color(0x87c9ed); scene.fog = new THREE.Fog(0x87c9ed, 120, 330);
    var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 500);
    scene.add(new THREE.HemisphereLight(0xd8efff, 0x526044, 1.2));
    var sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(-80, 120, 60); scene.add(sun);
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(360, 360), new THREE.MeshLambertMaterial({ color: 0x6da75c })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.08; scene.add(ground);
    // Simple city grid, roads, sidewalks and colorful block buildings.
    var roadMat = new THREE.MeshLambertMaterial({ color: 0x383d44 }), walkMat = new THREE.MeshLambertMaterial({ color: 0xb9bfc2 });
    for (var i = -3; i <= 3; i++) {
      var roadX = new THREE.Mesh(new THREE.BoxGeometry(10, 0.04, 360), roadMat); roadX.position.set(i * 40, 0, 0); scene.add(roadX);
      var roadZ = new THREE.Mesh(new THREE.BoxGeometry(360, 0.04, 10), roadMat); roadZ.position.set(0, 0, i * 40); scene.add(roadZ);
    }
    var palette = [0x90a4ae,0x78909c,0x80cbc4,0x9fa8da,0xffcc80,0xef9a9a,0xb0bec5];
    for (var bx = -3; bx < 3; bx++) for (var bz = -3; bz < 3; bz++) {
      if (bx === 0 && bz === 0) continue;
      var x = bx * 40 + (Math.random() - 0.5) * 5, z = bz * 40 + (Math.random() - 0.5) * 5;
      var w = 17 + Math.random() * 9, d = 17 + Math.random() * 9, h = 8 + Math.random() * 30;
      var building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: palette[Math.floor(Math.random() * palette.length)] }));
      building.position.set(x, h / 2, z); scene.add(building);
      var roof = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.5, d + 1), new THREE.MeshLambertMaterial({ color: 0x59636b })); roof.position.set(x, h + 0.25, z); scene.add(roof);
      var walk = new THREE.Mesh(new THREE.BoxGeometry(28, 0.1, 28), walkMat); walk.position.set(bx * 40 + 20, 0.05, bz * 40 + 20); scene.add(walk);
    }
    G.Player.init(scene); G.Peds.init(scene); G.Shops.init(scene); G.Missions.init(scene); G.Interiors.init(scene); G.Audio.init();
    G.UI.init();
    var clock = new THREE.Clock(), elapsed = 0;
    function resize() { renderer.setSize(window.innerWidth, window.innerHeight); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); }
    window.addEventListener('resize', resize);
    function frame() {
      requestAnimationFrame(frame);
      var dt = Math.min(clock.getDelta(), 0.05); elapsed += dt;
      if (G.started) G.Player.update(dt);
      G.Peds.update(dt, elapsed); G.Missions.update(dt); G.Interiors.update(dt);
      var p = G.Player, distance = 10, height = 5;
      var target = new THREE.Vector3(p.x - Math.sin(p.heading) * distance, height, p.z - Math.cos(p.heading) * distance);
      camera.position.lerp(target, 1 - Math.exp(-5 * dt));
      camera.lookAt(p.x, 1.2, p.z + Math.cos(p.heading) * 3);
      G.updateUI(); renderer.render(scene, camera);
    }
    frame();
  };
})();
