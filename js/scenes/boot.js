class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    SpriteFactory.generate(this);
    this.scene.start('Menu');
  }
}
