const SpriteFactory = {
  generate(scene) {
    this.makeIngredientTiles(scene);
    this.makeBlender(scene);
    this.makeButtons(scene);
    this.makeCustomer(scene);
    this.makeCounterBg(scene);
    this.makeTicket(scene);
    this.makeTimerBar(scene);
    this.makeParticles(scene);
  },

  makeIngredientTiles(scene) {
    var zones = ['juices', 'pb', 'dairy', 'iqf', 'hardpacks', 'powders', 'ice'];
    zones.forEach(function(zone) {
      var color = ZONE_COLORS[zone].bg;
      var g = scene.make.graphics({ add: false });
      g.fillStyle(0x000000, 1);
      g.fillRoundedRect(0, 0, 56, 40, 4);
      g.fillStyle(color, 1);
      g.fillRoundedRect(2, 2, 52, 36, 3);
      g.fillStyle(0xFFFFFF, 0.3);
      g.fillRect(4, 4, 48, 6);
      g.generateTexture('tile-' + zone, 56, 40);
      g.destroy();

      var gh = scene.make.graphics({ add: false });
      gh.fillStyle(0xFFFFFF, 1);
      gh.fillRoundedRect(0, 0, 56, 40, 4);
      gh.fillStyle(color, 1);
      gh.fillRoundedRect(1, 1, 54, 38, 3);
      gh.fillStyle(0xFFFFFF, 0.5);
      gh.fillRect(4, 4, 48, 8);
      gh.generateTexture('tile-' + zone + '-hover', 56, 40);
      gh.destroy();
    });
  },

  makeBlender(scene) {
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0xDDDDDD, 1);
    g.fillRoundedRect(0, 20, 80, 100, 6);
    g.fillStyle(0xAAAAAA, 1);
    g.fillRoundedRect(0, 15, 80, 12, 4);
    g.fillStyle(0x888888, 1);
    g.fillRoundedRect(10, 0, 60, 18, 4);
    g.generateTexture('blender-cup', 80, 120);
    g.destroy();

    var gl = scene.make.graphics({ add: false });
    gl.fillStyle(0xFFFFFF, 1);
    gl.fillRoundedRect(4, 0, 72, 90, 4);
    gl.generateTexture('blender-fill', 80, 90);
    gl.destroy();
  },

  makeButtons(scene) {
    this._makeButton(scene, 'btn-blend', 0x4CAF50, 'BLEND');
    this._makeButton(scene, 'btn-clear', 0xF44336, 'CLEAR');
    this._makeButton(scene, 'btn-undo', 0x757575, 'UNDO');
  },

  _makeButton(scene, key, color) {
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0x000000, 1);
    g.fillRoundedRect(0, 0, 72, 28, 4);
    g.fillStyle(color, 1);
    g.fillRoundedRect(1, 1, 70, 26, 3);
    g.fillStyle(0xFFFFFF, 0.2);
    g.fillRect(3, 3, 66, 8);
    g.generateTexture(key, 72, 28);
    g.destroy();
  },

  makeCustomer(scene) {
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0x4A90D9, 1);
    g.fillRect(12, 24, 24, 24);
    g.fillStyle(0xFFCC99, 1);
    g.fillCircle(24, 16, 12);
    g.fillStyle(0x4CAF50, 1);
    g.fillRect(12, 8, 24, 6);
    g.fillStyle(0x4A90D9, 1);
    g.fillRect(6, 28, 8, 16);
    g.fillRect(34, 28, 8, 16);
    g.fillStyle(0x333333, 1);
    g.fillRect(14, 48, 8, 16);
    g.fillRect(26, 48, 8, 16);
    g.generateTexture('customer', 48, 64);
    g.destroy();

    var gh = scene.make.graphics({ add: false });
    gh.fillStyle(0x4A90D9, 1);
    gh.fillRect(12, 24, 24, 24);
    gh.fillStyle(0xFFCC99, 1);
    gh.fillCircle(24, 16, 12);
    gh.fillStyle(0x4CAF50, 1);
    gh.fillRect(12, 8, 24, 6);
    gh.fillStyle(0x333333, 1);
    gh.fillCircle(19, 14, 2);
    gh.fillCircle(29, 14, 2);
    gh.lineStyle(2, 0x333333, 1);
    gh.beginPath();
    gh.arc(24, 18, 6, 0.2, Math.PI - 0.2, false);
    gh.strokePath();
    gh.fillStyle(0x4A90D9, 1);
    gh.fillRect(6, 28, 8, 16);
    gh.fillRect(34, 28, 8, 16);
    gh.fillStyle(0x333333, 1);
    gh.fillRect(14, 48, 8, 16);
    gh.fillRect(26, 48, 8, 16);
    gh.generateTexture('customer-happy', 48, 64);
    gh.destroy();

    var gs = scene.make.graphics({ add: false });
    gs.fillStyle(0x4A90D9, 1);
    gs.fillRect(12, 24, 24, 24);
    gs.fillStyle(0xFFCC99, 1);
    gs.fillCircle(24, 16, 12);
    gs.fillStyle(0x4CAF50, 1);
    gs.fillRect(12, 8, 24, 6);
    gs.fillStyle(0x333333, 1);
    gs.fillCircle(19, 14, 2);
    gs.fillCircle(29, 14, 2);
    gs.lineStyle(2, 0x333333, 1);
    gs.beginPath();
    gs.arc(24, 24, 5, Math.PI + 0.3, -0.3, false);
    gs.strokePath();
    gs.fillStyle(0x4A90D9, 1);
    gs.fillRect(6, 28, 8, 16);
    gs.fillRect(34, 28, 8, 16);
    gs.fillStyle(0x333333, 1);
    gs.fillRect(14, 48, 8, 16);
    gs.fillRect(26, 48, 8, 16);
    gs.generateTexture('customer-sad', 48, 64);
    gs.destroy();
  },

  makeCounterBg(scene) {
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0x5D4037, 1);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x4E342E, 0.3);
    g.fillRect(0, 3, 16, 1);
    g.fillRect(0, 7, 16, 1);
    g.fillRect(0, 12, 16, 1);
    g.generateTexture('wood-tile', 16, 16);
    g.destroy();

    var gs = scene.make.graphics({ add: false });
    gs.fillStyle(0x9E9E9E, 1);
    gs.fillRect(0, 0, 400, 8);
    gs.fillStyle(0xBDBDBD, 1);
    gs.fillRect(0, 0, 400, 3);
    gs.generateTexture('shelf', 400, 8);
    gs.destroy();

    var gl = scene.make.graphics({ add: false });
    gl.fillStyle(0x000000, 0.4);
    gl.fillRoundedRect(0, 0, 100, 18, 3);
    gl.generateTexture('zone-label-bg', 100, 18);
    gl.destroy();
  },

  makeTicket(scene) {
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0xFFFDE7, 1);
    g.fillRoundedRect(0, 0, 160, 80, 4);
    g.lineStyle(1, 0xCCCCCC, 1);
    g.strokeRoundedRect(0, 0, 160, 80, 4);
    for (var i = 4; i < 156; i += 8) {
      g.fillStyle(0xBBBBBB, 1);
      g.fillRect(i, 24, 4, 1);
    }
    g.generateTexture('ticket-bg', 160, 80);
    g.destroy();
  },

  makeTimerBar(scene) {
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0x333333, 1);
    g.fillRoundedRect(0, 0, 300, 12, 3);
    g.generateTexture('timer-bg', 300, 12);
    g.destroy();

    var gf = scene.make.graphics({ add: false });
    gf.fillStyle(0xFFFFFF, 1);
    gf.fillRoundedRect(0, 0, 296, 8, 2);
    gf.generateTexture('timer-fill', 296, 8);
    gf.destroy();
  },

  makeParticles(scene) {
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();

    var gs = scene.make.graphics({ add: false });
    gs.fillStyle(0xFFD23F, 1);
    gs.fillTriangle(8, 0, 10, 6, 16, 6);
    gs.fillTriangle(8, 0, 6, 6, 0, 6);
    gs.fillTriangle(2, 14, 8, 10, 14, 14);
    gs.fillRect(4, 6, 8, 4);
    gs.generateTexture('star-particle', 16, 16);
    gs.destroy();

    var gh = scene.make.graphics({ add: false });
    gh.fillStyle(0xFF4081, 1);
    gh.fillCircle(5, 4, 4);
    gh.fillCircle(11, 4, 4);
    gh.fillTriangle(1, 6, 15, 6, 8, 14);
    gh.generateTexture('heart-particle', 16, 16);
    gh.destroy();

    var gb = scene.make.graphics({ add: false });
    gb.fillStyle(0xFFFFFF, 1);
    gb.fillRoundedRect(0, 0, 200, 60, 8);
    gb.fillTriangle(30, 58, 50, 58, 40, 72);
    gb.generateTexture('speech-bubble', 200, 72);
    gb.destroy();
  }
};
