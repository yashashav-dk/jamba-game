class ResultsScene extends Phaser.Scene {
  constructor() { super('Results'); }
  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'RESULTS', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
  }
}
