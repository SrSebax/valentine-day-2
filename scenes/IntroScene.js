export class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xfff0f5);
        try {
            const bg = this.add.image(width / 2, height / 2, 'background');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale).setAlpha(0.5);
        } catch (e) {}

        // Animations (ensure idle exists)
        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
                frameRate: 1,
                repeat: -1
            });
        }

        // Player Character (Left side)
        const player = this.add.sprite(width * 0.3, height * 0.6, 'player');
        player.setScale(0.8);
        player.play('idle');

        // Dialogue Box (Right side)
        const boxX = width * 0.5;
        const boxY = height * 0.25;
        const boxW = width * 0.45;
        const boxH = height * 0.4;

        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 0.9);
        graphics.fillRoundedRect(boxX, boxY, boxW, boxH, 20);
        graphics.lineStyle(4, 0xff69b4, 1);
        graphics.strokeRoundedRect(boxX, boxY, boxW, boxH, 20);

        // Text
        const textStyle = {
            fontFamily: 'Quicksand',
            fontSize: '24px',
            color: '#555',
            wordWrap: { width: boxW - 40 },
            align: 'center'
        };

        this.add.text(boxX + boxW / 2, boxY + 50, "¡Hola mi amorcito! ❤️", {
            ...textStyle,
            fontSize: '32px',
            color: '#e91e63',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(boxX + boxW / 2, boxY + 130, 
            "Espero que disfrutes este mini juego que te hice con mucho amor... 👇", 
            textStyle
        ).setOrigin(0.5);

        this.add.text(boxX + boxW / 2, boxY + boxH - 50, 
            "(Toca para continuar)", 
            { ...textStyle, fontSize: '18px', color: '#888' }
        ).setOrigin(0.5);

        // Interaction
        this.input.once('pointerdown', () => this.startGame());
        this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    }

    startGame() {
        this.scene.start('GameScene');
    }
}
