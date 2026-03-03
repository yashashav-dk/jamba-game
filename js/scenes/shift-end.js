class ShiftEndScene extends Phaser.Scene {
  constructor() { super('ShiftEnd'); }
  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'SHIFT END', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
  }
}
