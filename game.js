class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.audio('music', 'assets/music.mp3'); // Optional
        this.load.audio('collect', 'assets/collect.mp3'); // Optional
    }

    create() {
        // Simple background or color
        this.add.rectangle(400, 300, 800, 600, 0xfff0f5); // Fallback color
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

        startBtn.onclick = () => {
            // Start music if available
            if (this.sound.get('music')) {
                // Check if already playing to avoid double start
            } else {
                 try {
                    this.sound.play('music', { loop: true, volume: 0.5 });
                } catch (e) {
                    console.log("No music found or audio error");
                }
            }
           
            // HTML transition
            titleScreen.style.opacity = '0';
            setTimeout(() => {
                titleScreen.style.display = 'none';
                this.scene.start('GameScene');
            }, 500);
        };
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Player: 4x4 grid.
        this.load.spritesheet('player', 'assets/player2.png', { frameWidth: 256, frameHeight: 256 });
        // Items: 2x2 grid.
        this.load.spritesheet('items', 'assets/items.png', { frameWidth: 512, frameHeight: 512 });
        this.load.image('particle', 'assets/items.png'); // Use items as particles or a generic shape
    }

    create() {
        this.collectedCount = 0;
        this.totalItems = 4;
        this.isPaused = false;
        
        // Item Messages
        this.itemMessages = {
            0: "Una carta antigua llena de amor... 💌",
            1: "Una estrella que ilumina el camino... ⭐",
            2: "Una flor que nunca se marchita... 🌸",
            3: "Una foto de un momento feliz... 📸"
        };
        this.finalMessage = "Recogiste todos los recuerdos.\nLa vida está hecha de pequeños momentos brillantes. ✨";

        // Background
        const bg = this.add.image(400, 300, 'background');
        const scaleX = 800 / bg.width;
        const scaleY = 600 / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);

        // Particle Manager (using a texture from items for now, or generate one)
        // Creating a simple texture for particles if 'particle' isn't great
        const graphics = this.make.graphics({x: 0, y: 0, add: false});
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('spark', 8, 8);
        
        this.particles = this.add.particles(0, 0, 'spark', {
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            on: false
        });

        // Player
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.25);
        this.player.body.setSize(150, 150);
        this.player.body.setOffset(50, 50);

        // Animations
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: -1
        });

        // Items
        this.items = this.physics.add.staticGroup();
        const positions = [
            { x: 150, y: 150, frame: 0 },
            { x: 650, y: 150, frame: 1 },
            { x: 150, y: 450, frame: 2 },
            { x: 650, y: 450, frame: 3 }
        ];

        positions.forEach(pos => {
            let item = this.items.create(pos.x, pos.y, 'items', pos.frame);
            item.setScale(0.15);
            item.refreshBody();
            item.setData('messageKey', pos.frame);
            
            // Add a floating tween to items
            this.tweens.add({
                targets: item,
                y: pos.y - 10,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Inputs
        this.cursors = this.input.keyboard.createCursorKeys();

        // Collisions
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

        // UI Listeners (HTML overlay)
        document.getElementById('close-btn').onclick = () => {
            document.getElementById('message-overlay').classList.add('hidden');
            this.isPaused = false;
            
            if (this.collectedCount >= this.totalItems) {
                this.showEndScreen();
            }
        };
    }

    update() {
        if (this.isPaused) {
            this.player.setVelocity(0);
            this.player.anims.stop();
            return;
        }

        const speed = 200;
        let moving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
            moving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                this.player.anims.play('up', true);
            }
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                this.player.anims.play('down', true);
            }
            moving = true;
        } else {
            this.player.setVelocityY(0);
        }

        if (!moving) {
            this.player.anims.stop();
        }
    }

    collectItem(player, item) {
        if (this.isPaused) return;

        // Visuals
        this.particles.explode(10, item.x, item.y);
        
        // Audio
        try {
            this.sound.play('collect');
        } catch(e) {}

        item.disableBody(true, true);
        this.collectedCount++;

        const frameIndex = item.getData('messageKey');
        const msg = this.itemMessages[frameIndex] || "¡Un recuerdo bonito!";

        this.showOverlay(msg);
    }

    showOverlay(text) {
        this.isPaused = true;
        const overlay = document.getElementById('message-overlay');
        const msgText = document.getElementById('message-text');
        const btn = document.getElementById('close-btn');
        
        msgText.innerText = text;
        
        if (this.collectedCount >= this.totalItems) {
            btn.innerText = "Ver final ❤️";
        } else {
            btn.innerText = "Guardar recuerdo ✨";
        }
        
        overlay.classList.remove('hidden');
    }

    showEndScreen() {
        const overlay = document.getElementById('message-overlay');
        const msgText = document.getElementById('message-text');
        const btn = document.getElementById('close-btn');
        
        msgText.innerText = this.finalMessage;
        btn.style.display = 'none';
        overlay.classList.remove('hidden');
        
        // Create a restart button dynamically if needed, or simple refresh
        // For this mini-game, just showing the final message is enough.
        // Maybe add some hearts effect
        const timer = this.time.addEvent({
            delay: 500,
            callback: () => {
                this.particles.explode(
                    5,
                    Phaser.Math.Between(100, 700), 
                    Phaser.Math.Between(100, 500)
                );
            },
            loop: true
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    backgroundColor: '#fff0f5',
    scene: [TitleScene, GameScene]
};

const game = new Phaser.Game(config);
