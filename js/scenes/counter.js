class CounterScene extends Phaser.Scene {
  constructor() { super('Counter'); }
  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'COUNTER', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
  }
}
