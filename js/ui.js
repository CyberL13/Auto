(function () {
  'use strict';
  var G = window.LowPolyGame = window.LowPolyGame || {};
  G.UI = {
    init: function () {
      var menu = document.getElementById('menu'), loading = document.getElementById('loading');
      var hud = document.getElementById('hud'), status = document.getElementById('status');
      loading.classList.add('hidden'); menu.classList.remove('hidden');
      document.getElementById('start').addEventListener('click', function () { menu.classList.add('hidden'); hud.classList.remove('hidden'); status.classList.remove('hidden'); G.started = true; });
      G.updateUI = function () { status.textContent = 'Speed: ' + Math.round(Math.abs(G.Player.speed) * 3.6) + ' km/h'; };
    }
  };
})();
