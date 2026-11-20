/* vehicles.js - vehicle objects (pooled), arcade physics, collisions, damage, fuel */
(function () {
  'use strict';
  var G = window.G, U = G.U, M = G.Map, W = G.World, R = G.Render;

  var V = G.Vehicles = { list: [], free: [], nextId: 1, onCollide: null, bars: null };
  var hit = {};

  function bars() {
    if (V.bars) return V.bars;
    var geo = new THREE.BoxGeometry(0.42, 0.16, 0.3);
    V.bars = { geo: geo, red: new THREE.MeshBasicMaterial({ color: 0xff2a2a }), blue: new THREE.MeshBasicMaterial({ color: 0x2a6bff }) };
    return V.bars;
  }

  function Vehicle() {
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), R.mats.flat);
    this.mesh.castShadow = true;
    this.mesh.rotation.order = 'YXZ';
    this.mesh.matrixAutoUpdate = true;
    this.barR = this.barB = null;
    this.ctrl = { thr: 0, steer: 0, hb: 0 };
  }

  Vehicle.prototype.setModel = function (id, paint) {
    var d = G.VEH[id];
    this.def = d; this.modelId = id; this.paint = paint;
    this.mesh.geometry = G.Models.vehicleGeometry(id, paint);
    this.cr = d.wid * 0.48;
    var n = d.len > 6 ? 3 : 2, half = d.len / 2 - this.cr, offs = [];
    for (var i = 0; i < n; i++) offs.push(-half + (2 * half) * i / (n - 1));
    this.offs = offs;
    this.isPolice = d.kind === 'police';
    if (this.isPolice) {
      var b = bars();
      if (!this.barR) { this.barR = new THREE.Mesh(b.geo, b.red); this.barB = new THREE.Mesh(b.geo, b.blue); this.mesh.add(this.barR, this.barB); }
      var topY = (d.wid > 1.92 ? 1.58 : 1.52);
      this.barR.position.set(-0.28, topY, -0.02); this.barB.position.set(0.28, topY, -0.02);
      this.barR.visible = this.barB.visible = false;
    } else if (this.barR) { this.barR.visible = this.barB.visible = false; }
  };

  Vehicle.prototype.reset = function (id, paint, x, z, h, owner) {
    this.setModel(id, paint);
    this.x = x; this.z = z; this.h = h || 0; this.vx = 0; this.vz = 0;
    this.speed = 0; this.steer = 0; this.yaw = 0; this.roll = 0; this.pitch = 0; this.y = 0;
    this.cond = 100; this.fuel = this.def.fuel; this.owner = owner || null; this.driver = null;
    this.ai = null; this.tag = null; this.hitCd = 0; this.honk = 0; this.siren = false; this.garageId = null;
    this.ctrl.thr = 0; this.ctrl.steer = 0; this.ctrl.hb = 0; this.smokeT = 0; this.lastAcc = 0; this.parked = false; this.stolenFlag = false;
    this.active = true; this.mesh.visible = true; this.mass = this.def.mass;
    this.sync();
  };

  Vehicle.prototype.sync = function () {
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.set(this.pitch, this.h, this.roll);
  };
  Vehicle.prototype.fwd = function () { return { x: Math.sin(this.h), z: Math.cos(this.h) }; };
  Vehicle.prototype.kmh = function () { return Math.abs(this.speed) * 3.6; };

  V.spawn = function (id, paint, x, z, h, owner) {
    var v = V.free.pop();
    if (!v) { v = new Vehicle(); R.scene.add(v.mesh); }
    v.id = V.nextId++;
    v.reset(id, paint, x, z, h, owner);
    V.list.push(v);
    return v;
  };
  V.despawn = function (v) {
    var i = V.list.indexOf(v);
    if (i >= 0) V.list.splice(i, 1);
    v.active = false; v.mesh.visible = false; v.ai = null; v.driver = null;
    V.free.push(v);
  };
