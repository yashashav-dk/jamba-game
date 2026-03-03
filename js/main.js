const gameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  pixelArt: true,
  backgroundColor: '#2d1b0e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, CategorySelectScene, CounterScene, ResultsScene, ShiftEndScene, StudyScene]
};

const game = new Phaser.Game(gameConfig);
