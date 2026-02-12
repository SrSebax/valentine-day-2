import { TitleScene } from '../scenes/TitleScene.js';
import { IntroScene } from '../scenes/IntroScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { FinalScene } from '../scenes/FinalScene.js';
import { physicsConfig } from './physicsConfig.js';

export const gameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    parent: 'game-container',
    physics: physicsConfig,
    backgroundColor: '#fff0f5',
    scene: [TitleScene, IntroScene, GameScene, FinalScene]
};
