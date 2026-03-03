class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { this.scene.start('Menu'); }
}
