export class FinalScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FinalScene' });
    }

    preload() {
        // Preload any final assets if needed
    }

    create() {
        // Get display dimensions
        const { width, height } = this.game.config;
        const displayWidth = this.scale.displaySize.width;
        const displayHeight = this.scale.displaySize.height;

        // Add full screen background image
        try {
            const finalImage = this.add.image(width / 2, height / 2, 'background');
            finalImage.setDisplaySize(displayWidth, displayHeight);
            finalImage.setScrollFactor(0);
        } catch (e) {
            console.warn("Background image might be missing");
        }

        // Add a semi-transparent overlay with message
        const overlay = this.add.rectangle(width / 2, height / 2, displayWidth, displayHeight, 0x000000, 0.3);
        overlay.setScrollFactor(0);

        // Add final message
        const finalText = this.add.text(width / 2, height / 2 - 100, '¡Feliz San Valentín! ✨', {
            fontSize: '64px',
            fill: '#ff69b4',
            fontFamily: 'Quicksand',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);

        // Add personal message
        const messageText = this.add.text(width / 2, height / 2 + 50, 'Recorriste todo el camino,\ncargando los recuerdos que compartimos.\nTe amo mucho. 💗', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Quicksand',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);

        // Add restart button/instruction
        const restartText = this.add.text(width / 2, height - 80, 'Haz click o presiona ESPACIO para volver a jugar', {
            fontSize: '18px',
            fill: '#ffb6c1',
            fontFamily: 'Quicksand',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);

        // Animate restart text
        this.tweens.add({
            targets: restartText,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Animate final text
        this.tweens.add({
            targets: finalText,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Add particle effects
        const graphics = this.make.graphics({x: 0, y: 0, add: false});
        graphics.fillStyle(0xFF69B4, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('heart-spark', 8, 8);
        graphics.destroy();
        
        const particles = this.add.particles('heart-spark', {
            speed: { min: -100, max: 100 },
            angle: { min: 240, max: 300 },
            scale: { start: 1, end: 0 },
            lifespan: 1500,
            gravityY: 100
        });

        // Emit particles continuously
        this.time.addEvent({
            delay: 300,
            callback: () => {
                particles.emitParticleAt(
                    Phaser.Math.Between(this.scale.displaySize.width * 0.2, this.scale.displaySize.width * 0.8),
                    0,
                    5
                );
            },
            loop: true
        });

        // Input to restart game
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('TitleScene');
        });

        this.input.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });

        // Play final music/sound if available
        try {
            if (!this.sound.get('music') || !this.sound.get('music').isPlaying) {
                this.sound.play('music', { loop: true, volume: 0.5 });
            }
        } catch (e) {
            console.log("Music not available");
        }
    }
}
