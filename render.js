/* render.js - Three.js renderer, materials, day/night cycle, sky, preview scene */
(function () {
  'use strict';
  var G = window.G, U = G.U;

  var R = G.Render = {
    hour: 9, night: 0, fps: 0, q: null, shadowLevel: 0, previewActive: false, preT: 0,
    camera: null, scene: null, renderer: null
  };

  /* hour keyframes: sky colour, sun intensity/colour, hemisphere intensity/colours */
  var KF = [
    { h: 0,    sky: 0x0b1022, sun: 0,    sc: 0x9fb0ff, hi: 0.50, hs: 0x5566a0, hg: 0x1d2230 },
    { h: 5,    sky: 0x0e1430, sun: 0,    sc: 0x9fb0ff, hi: 0.50, hs: 0x5566a0, hg: 0x1d2230 },
    { h: 6.5,  sky: 0xf2a06c, sun: 0.55, sc: 0xffb878, hi: 0.55, hs: 0xffd0a8, hg: 0x4a4a38 },
    { h: 8.5,  sky: 0x8fcdf5, sun: 0.95, sc: 0xfff4e0, hi: 0.68, hs: 0xc4e4ff, hg: 0x5e6c52 },
    { h: 13,   sky: 0x7cc6ff, sun: 1.05, sc: 0xffffff, hi: 0.72, hs: 0xc8e8ff, hg: 0x607058 },
    { h: 17,   sky: 0x8ec8f0, sun: 0.9,  sc: 0xfff0d8, hi: 0.66, hs: 0xc0dcf4, hg: 0x5c6a50 },
    { h: 19,   sky: 0xf08852, sun: 0.5,  sc: 0xff9a58, hi: 0.52, hs: 0xffc090, hg: 0x4a4636 },
    { h: 20.7, sky: 0x1c2342, sun: 0,    sc: 0x9fb0ff, hi: 0.50, hs: 0x5566a0, hg: 0x1d2230 },
    { h: 24,   sky: 0x0b1022, sun: 0,    sc: 0x9fb0ff, hi: 0.50, hs: 0x5566a0, hg: 0x1d2230 }
  ];
  var cA = new THREE.Color(), cB = new THREE.Color();

  function windowTextures() {
    var S = 128, a = document.createElement('canvas'), e = document.createElement('canvas');
    a.width = a.height = e.width = e.height = S;
    var ca = a.getContext('2d'), ce = e.getContext('2d');
    ca.fillStyle = '#ffffff'; ca.fillRect(0, 0, S, S);
    ce.fillStyle = '#000000'; ce.fillRect(0, 0, S, S);
    var rnd = U.rng(77), cell = S / 4;
    for (var fy = 0; fy < 4; fy++) for (var fx = 0; fx < 4; fx++) {
      var x = fx * cell, y = fy * cell;
      ca.fillStyle = '#c9ccd2'; ca.fillRect(x + 4, y + 5, cell - 8, cell - 9);            // frame
      var lit = rnd() < 0.42;
      ca.fillStyle = lit ? '#ffe9a8' : '#4c6580'; ca.fillRect(x + 6, y + 7, cell - 12, cell - 13);
      ca.fillStyle = 'rgba(255,255,255,0.18)'; ca.fillRect(x + 6, y + 7, cell - 12, 4);
      if (lit) { ce.fillStyle = '#ffd98a'; ce.fillRect(x + 6, y + 7, cell - 12, cell - 13); }
    }
    function mk(cv) {
      var t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
      return t;
    }
    return { map: mk(a), emissive: mk(e) };
  }

  R.init = function (canvas, settings) {
    R.settings = settings;
    var aa = !!settings.aa;
    R.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: aa, powerPreference: 'high-performance', alpha: false });
    R.renderer.setClearColor(0x7cc6ff, 1);
    R.scene = new THREE.Scene();
    R.scene.fog = new THREE.Fog(0x7cc6ff, 100, 300);
    R.camera = new THREE.PerspectiveCamera(62, 1, 0.9, 500);
    R.scene.add(R.camera);

    R.hemi = new THREE.HemisphereLight(0xc4e4ff, 0x5e6c52, 0.7);
    R.scene.add(R.hemi);
    R.sun = new THREE.DirectionalLight(0xffffff, 1);
    R.sun.position.set(60, 90, 30);
    R.scene.add(R.sun); R.scene.add(R.sun.target);

    var tx = windowTextures();
    R.mats = {
      flat: new THREE.MeshLambertMaterial({ vertexColors: true }),