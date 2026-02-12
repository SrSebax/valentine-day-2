export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.audio('music', 'assets/music.mp3');
        this.load.audio('collect', 'assets/collect.mp3');
        this.load.spritesheet('player', 'assets/player2.png', { frameWidth: 256, frameHeight: 256 });
    }

    create() {
        // Simple background
        this.add.rectangle(400, 300, 800, 600, 0xfff0f5);
        try {
            const bg = this.add.image(400, 300, 'background');
            const scaleX = 800 / bg.width;
            const scaleY = 600 / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale).setAlpha(0.5);
        } catch (e) {
            console.warn("Background image might be missing");
        }

        // Handle HTML overlay button
        const startBtn = document.getElementById('start-btn');
        const titleScreen = document.getElementById('title-screen');

        if (startBtn) {
            // Remove old listeners to prevent duplicates if scene restarts
            const newBtn = startBtn.cloneNode(true);
            startBtn.parentNode.replaceChild(newBtn, startBtn);
            
            newBtn.onclick = () => {
                // Start music if available
                try {
                    this.sound.play('music', { loop: true, volume: 0.5 });
                } catch (e) {
                    console.log("No music found or audio error");
                }
            
                // HTML transition
                if (titleScreen) {
                    titleScreen.style.opacity = '0';
                    setTimeout(() => {
                        titleScreen.style.display = 'none';
                        this.scene.start('IntroScene');
                    }, 500);
                } else {
                    this.scene.start('IntroScene');
                }
            };
        }
    }
}
