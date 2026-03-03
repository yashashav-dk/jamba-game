class CategorySelectScene extends Phaser.Scene {
  constructor() { super('CategorySelect'); }
  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CATEGORY SELECT', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
  }
}
