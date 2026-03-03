class StudyScene extends Phaser.Scene {
  constructor() { super('Study'); }
  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'RECIPE BOOK', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
  }
}
