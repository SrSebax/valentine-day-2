import { PlatformFactory } from '../systems/PlatformFactory.js';
import { PlayerFactory } from '../systems/PlayerFactory.js';
import { AnimationManager } from '../systems/AnimationManager.js';
import { ItemFactory } from '../systems/ItemFactory.js';
import { InputManager } from '../systems/InputManager.js';
import { goalPosition } from '../data/levelPlatforms.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.spritesheet('player', 'assets/player2.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('items', 'assets/items.png', { frameWidth: 512, frameHeight: 512 });
    }

    create() {
        this.collectedCount = 0;
        this.gameEnded = false;
        this.isPaused = false;
        
        // Background
        const bg = this.add.image(400, 300, 'background');
        const scaleX = 1600 / bg.width;
        const scaleY = 600 / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);

        // Particle Manager
        const graphics = this.make.graphics({x: 0, y: 0, add: false});
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('spark', 8, 8);
        graphics.destroy();
        
        this.particles = this.add.particles('spark', {
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 500
        });

        // Camera setup for horizontal level
        this.cameras.main.setBounds(0, 0, 4200, 600);
        this.physics.world.setBounds(0, 0, 4200, 600);

        // Initialize Systems
        this.platformFactory = new PlatformFactory(this);
        this.playerFactory = new PlayerFactory(this);
        this.animationManager = new AnimationManager(this);
        this.itemFactory = new ItemFactory(this);
        this.inputManager = new InputManager(this);

        // Create Game Objects using Systems
        this.platforms = this.platformFactory.createPlatforms();
        this.player = this.playerFactory.createPlayer(100, 400);
        
        // Create animations
        this.animationManager.createAnimations();

        // Items
        const itemPositions = [
            { x: 350, y: 410, frame: 0 },
            { x: 750, y: 310, frame: 1 },
            { x: 1250, y: 250, frame: 2 },
            { x: 1750, y: 330, frame: 3 },
            { x: 2400, y: 180, frame: 0 },
            { x: 2900, y: 200, frame: 1 },
            { x: 3400, y: 170, frame: 2 },
            { x: 3650, y: 110, frame: 3 }
        ];
        this.items = this.itemFactory.createItems(itemPositions);

        // Goal
        this.goal = this.itemFactory.createGoal(goalPosition.x, goalPosition.y);

        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

        // Respawn Point
        this.startX = 100;
        this.startY = 400;

        // UI Listeners
        const closeBtn = document.getElementById('close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                document.getElementById('message-overlay').classList.add('hidden');
                this.isPaused = false;
            };
        }
    }

    update() {
        if (this.isPaused || this.gameEnded) {
            this.player.setVelocityX(0);
            this.player.anims.stop();
            return;
        }

        // Check if player fell
        if (this.player.y > 650) {
            this.respawnPlayer();
            return;
        }

        const inputs = this.inputManager.getInputs();
        const speed = 250;
        const jumpForce = 360;
        const onGround = this.player.body.touching.down;

        if (inputs.left) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
            this.player.flipX = false;
        } else if (inputs.right) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('idle', true);
        }

        if (inputs.jump && onGround) {
            this.player.setVelocityY(-jumpForce);
        }

        // Camera follow
        this.cameras.main.scrollX = Math.max(0, this.player.x - 200);
    }

    respawnPlayer() {
        this.player.setPosition(this.startX, this.startY);
        this.player.setVelocity(0, 0);
    }

    collectItem(player, item) {
        if (this.isPaused || this.gameEnded) return;

        // Visuals
        this.particles.emitParticleAt(item.x, item.y, 10);
        
        // Audio
        try {
            this.sound.play('collect');
        } catch(e) {}

        item.disableBody(true, true);
        this.collectedCount++;

        const frameIndex = item.getData('messageKey');
        const msg = this.itemFactory.getMessage(frameIndex);

        this.showOverlay(msg);
    }

    reachGoal(player, goal) {
        if (this.isPaused || this.gameEnded) return;
        this.gameEnded = true;
        
        this.particles.emitParticleAt(goal.x, goal.y, 20);
        
        this.time.delayedCall(500, () => {
            this.scene.start('FinalScene');
        });
    }

    showOverlay(text) {
        this.isPaused = true;
        const overlay = document.getElementById('message-overlay');
        const msgText = document.getElementById('message-text');
        const btn = document.getElementById('close-btn');
        
        if (msgText) msgText.innerText = text;
        if (btn) {
            btn.innerText = "Continuar ✨";
            btn.style.display = 'block';
        }
        
        if (overlay) overlay.classList.remove('hidden');
    }
}
