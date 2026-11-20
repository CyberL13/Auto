/* config.js - global namespace, constants and data tables */
(function () {
  'use strict';
  var G = window.G = window.G || {};

  G.CFG = {
    BLOCKS: 8,          // blocks per side
    PITCH: 80,          // road centre to road centre
    CURB: 6,            // road centre to curb (asphalt half width)
    LOT_INSET: 9,       // road centre to lot edge (curb + sidewalk)
    LANE: 3.1,          // lane centre offset from road centre
    SEED: 20240611,
    DAY_MINUTES: 10,    // real minutes per in-game day
    START_HOUR: 9,
    START_MONEY: 5000,
    FUEL_PRICE: 2.2,    // $ per litre
    SAVE_KEY: 'lowpoly-city-save-v1',
    SET_KEY: 'lowpoly-city-settings-v1'
  };
  G.CFG.SIZE = G.CFG.BLOCKS * G.CFG.PITCH;
  G.CFG.ORIGIN = -G.CFG.SIZE / 2;

  /* ---------- graphics presets ---------- */
  G.QUALITY = {
    low:    { scale: 0.6,  draw: 170, shadows: 0, traffic: 9,  peds: 10, fps: 30, lamps: 0, stars: 0 },
    medium: { scale: 0.85, draw: 260, shadows: 0, traffic: 16, peds: 22, fps: 60, lamps: 1, stars: 1 },
    high:   { scale: 1.0,  draw: 380, shadows: 1, traffic: 26, peds: 38, fps: 0,  lamps: 1, stars: 1 }
  };

  /* ---------- vehicles ----------
     vmax m/s, acc m/s^2, brake m/s^2, steer = max steering lock (rad), grip = lateral grip */
  G.VEHICLES = [
    { id: 'compact', name: 'Pico Compact',   cls: 'Compact',   kind: 'sedan',  price: 4200,   vmax: 33, acc: 9,    brake: 24, steer: 0.62, grip: 8.5, mass: 1000, len: 3.8, wid: 1.7, fuel: 40, use: 0.012, shop: true },
    { id: 'sedan1',  name: 'Metro Sedan',    cls: 'Sedan',     kind: 'sedan',  price: 14000,  vmax: 38, acc: 10.5, brake: 26, steer: 0.58, grip: 8.0, mass: 1300, len: 4.5, wid: 1.8, fuel: 55, use: 0.014, shop: true },
    { id: 'sedan2',  name: 'Regal Sedan',    cls: 'Sedan',     kind: 'sedan',  price: 26000,  vmax: 43, acc: 12,   brake: 28, steer: 0.56, grip: 8.5, mass: 1500, len: 4.9, wid: 1.9, fuel: 60, use: 0.016, shop: true },
    { id: 'suv1',    name: 'Trail SUV',      cls: 'SUV',       kind: 'suv',    price: 22000,  vmax: 36, acc: 9.5,  brake: 24, steer: 0.52, grip: 7.0, mass: 1900, len: 4.7, wid: 1.95, fuel: 70, use: 0.018, shop: true },
    { id: 'suv2',    name: 'Titan SUV',      cls: 'SUV',       kind: 'suv',    price: 38000,  vmax: 41, acc: 11,   brake: 26, steer: 0.5,  grip: 7.4, mass: 2300, len: 5.1, wid: 2.1, fuel: 85, use: 0.021, shop: true },
    { id: 'pickup1', name: 'Ranger Pickup',  cls: 'Pickup',    kind: 'pickup', price: 18000,  vmax: 35, acc: 9,    brake: 23, steer: 0.52, grip: 6.8, mass: 1900, len: 5.2, wid: 1.9, fuel: 75, use: 0.019, shop: true },
    { id: 'pickup2', name: 'Hauler HD',      cls: 'Pickup',    kind: 'pickup', price: 31000,  vmax: 38, acc: 10.5, brake: 25, steer: 0.5,  grip: 7.0, mass: 2400, len: 5.6, wid: 2.05, fuel: 90, use: 0.022, shop: true },
    { id: 'van1',    name: 'City Van',       cls: 'Van',       kind: 'van',    price: 16000,  vmax: 31, acc: 7.5,  brake: 21, steer: 0.5,  grip: 6.4, mass: 2100, len: 5.0, wid: 2.0, fuel: 75, use: 0.017, shop: true },
    { id: 'van2',    name: 'Cargo Van XL',   cls: 'Van',       kind: 'van',    price: 21000,  vmax: 30, acc: 7,    brake: 20, steer: 0.46, grip: 6.0, mass: 2600, len: 5.9, wid: 2.05, fuel: 90, use: 0.02, shop: true },
    { id: 'sport1',  name: 'Street Coupe',   cls: 'Sports',    kind: 'sport',  price: 48000,  vmax: 48, acc: 15,   brake: 32, steer: 0.55, grip: 10,  mass: 1350, len: 4.4, wid: 1.9, fuel: 55, use: 0.02, shop: true },