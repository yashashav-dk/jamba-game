class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'JAMBA SHIFT TRAINER', { fontSize: '32px', fill: '#FFD23F' }).setOrigin(0.5);
  }
}
