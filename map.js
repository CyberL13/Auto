/* map.js - procedural city layout (pure data, no rendering): roads, blocks, buildings, shops, props */
(function () {
  'use strict';
  var G = window.G, C = G.CFG, U = G.U;
  var N = C.BLOCKS, P = C.PITCH, O = C.ORIGIN, HALF = 31;   // lot half size (block centre to lot edge)

  var M = G.Map = {
    N: N, P: P, O: O, HALF: HALF, blocks: [], shops: [], jobSpots: [], trees: [], lamps: [], hydrants: [], benches: [], bins: [],
    parkPaths: [], ponds: [], parking: [], extents: C.SIZE / 2
  };
  var FACE = { N: { x: 0, z: -1 }, S: { x: 0, z: 1 }, E: { x: 1, z: 0 }, W: { x: -1, z: 0 } };

  M.rx = function (i) { return O + i * P; };       // road centre line x for index i (0..N)
  M.rz = function (j) { return O + j * P; };
  M.bcx = function (bi) { return O + (bi + 0.5) * P; };
  M.bcz = function (bj) { return O + (bj + 0.5) * P; };
  M.corner = function (i, j, sx, sz) { return { x: M.rx(i) + sx * 7.5, z: M.rz(j) + sz * 7.5 }; };
  M.nearestNode = function (x, z) {
    return { i: U.clamp(Math.round((x - O) / P), 0, N), j: U.clamp(Math.round((z - O) / P), 0, N) };
  };
  M.inCity = function (x, z) { return Math.abs(x) < M.extents + 14 && Math.abs(z) < M.extents + 14; };
  /* distance from the nearest road centre line on each axis; returns true when on asphalt */
  M.onRoad = function (x, z) {
    if (Math.abs(x) > M.extents + C.CURB || Math.abs(z) > M.extents + C.CURB) return false;
    var dx = Math.abs(((x - O) % P + P) % P), dz = Math.abs(((z - O) % P + P) % P);
    dx = Math.min(dx, P - dx); dz = Math.min(dz, P - dz);
    return dx < C.CURB || dz < C.CURB;
  };

  var SHOP_DEFS = [
    { type: 'garage',     name: 'MY GARAGE',      bi: 3, bj: 3, face: 'S', color: 0x78909c, sign: 0x37474f },
    { type: 'bank',       name: 'CITY BANK',      bi: 5, bj: 3, face: 'W', color: 0xcfd8dc, sign: 0x3949ab },
    { type: 'dealer',     name: 'PREMIUM MOTORS', bi: 2, bj: 5, face: 'E', color: 0xb3e5fc, sign: 0xc62828 },
    { type: 'market',     name: 'SUPERMARKET',    bi: 5, bj: 5, face: 'N', color: 0xffe0b2, sign: 0x2e7d32 },
    { type: 'clothes',    name: 'FASHION STORE',  bi: 3, bj: 5, face: 'N', color: 0xf8bbd0, sign: 0x8e24aa },
    { type: 'restaurant', name: 'TASTY BITES',    bi: 1, bj: 3, face: 'E', color: 0xffcc80, sign: 0xe65100 },
    { type: 'restaurant', name: 'PIZZA PLACE',    bi: 6, bj: 4, face: 'W', color: 0xef9a9a, sign: 0xb71c1c },
    { type: 'gas',        name: 'GAS STATION',    bi: 1, bj: 1, face: 'S', color: 0xeeeeee, sign: 0xf9a825 },
    { type: 'gas',        name: 'GAS STATION',    bi: 6, bj: 6, face: 'N', color: 0xeeeeee, sign: 0xf9a825 },
    { type: 'police',     name: 'POLICE HQ',      bi: 4, bj: 2, face: 'S', color: 0x90a4ae, sign: 0x1565c0 }
  ];
  var PARKS = ['0,0', '7,7', '0,6', '7,1', '4,0', '2,7', '6,2', '3,6'];
  var JOBS = [
    ['taxi', 2, 2, 1, 1], ['taxi', 5, 6, -1, -1],
    ['delivery', 4, 5, 1, -1], ['delivery', 1, 4, -1, 1],
    ['package', 3, 2, -1, 1], ['package', 6, 3, 1, 1],
    ['race', 2, 4, 1, 1], ['race', 5, 1, -1, 1],
    ['parking', 4, 6, -1, 1], ['parking', 1, 7, 1, -1],
    ['collect', 6, 5, -1, -1], ['collect', 3, 7, 1, -1]
  ];

  function snap(v) { return Math.round(v * 2) / 2; }

  function buildingFor(r, x0, z0, x1, z1, dist) {
    var h, pal;
    if (dist < 2.2)      { h = 28 + r() * 52; pal = [0x90a4ae, 0x78909c, 0xb0bec5, 0x80cbc4, 0x9fa8da, 0xcfd8dc]; }