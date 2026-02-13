import { PlatformFactory } from '../systems/PlatformFactory.js';
import { PlayerFactory } from '../systems/PlayerFactory.js';
import { AnimationManager } from '../systems/AnimationManager.js';
import { ItemFactory } from '../systems/ItemFactory.js';
import { InputManager } from '../systems/InputManager.js';
import { ObstacleFactory } from '../systems/ObstacleFactory.js';


export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.spritesheet('player', 'assets/player2.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('items', 'assets/items.png', { frameWidth: 512, frameHeight: 512 });
        this.load.audio('fart', 'assets/fart.mp3');
        this.load.audio('fuchi', 'assets/fuchi.opus');
    }

    create() {
        this.collectedCount = 0;
        this.gameEnded = false;
        this.isPaused = false;
        
        // Background
        // Background
        const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);

        // Particle Manager
        this.particles = this.add.particles('spark', {
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 500
        });

        // --- Generate Textures ---
        const graphics = this.make.graphics({x: 0, y: 0, add: false});

        // 1. Ground Block (Pastel Brown/Pink)
        graphics.fillStyle(0xD2B48C); // Tan/Pastel Brown
        graphics.fillRect(0, 0, 40, 40);
        graphics.fillStyle(0xE6C8CA); // Pinkish highlight
        graphics.fillRect(5, 5, 30, 30);
        graphics.generateTexture('ground', 40, 40);
        graphics.clear();

        // 2. Brick Block (Cute Pink)
        graphics.fillStyle(0xFF69B4); // Hot Pink
        graphics.fillRect(0, 0, 40, 40);
        graphics.lineStyle(2, 0xC71585); // Darker Pink border
        graphics.strokeRect(0, 0, 40, 40);
        graphics.moveTo(0, 20);
        graphics.lineTo(40, 20); // Horizontal line
        graphics.moveTo(20, 0);
        graphics.lineTo(20, 20); // Vertical top
        graphics.moveTo(10, 20);
        graphics.lineTo(10, 40); // Vertical bottom 1
        graphics.moveTo(30, 20);
        graphics.lineTo(30, 40); // Vertical bottom 2
        graphics.strokePath();
        graphics.generateTexture('brick', 40, 40);
        graphics.clear();

        // 3. Pipe (Teal/Pastel Green) - REMOVED for simplification
        // 4. Pipe Top - REMOVED for simplification
        graphics.destroy(); 
        // -------------------------

        // Camera setup for horizontal level
        this.cameras.main.setBounds(0, 0, 4200, 600);
        this.physics.world.setBounds(0, 0, 4200, 600);

        // Initialize Systems
        this.platformFactory = new PlatformFactory(this);
        this.playerFactory = new PlayerFactory(this);
        this.animationManager = new AnimationManager(this);
        this.itemFactory = new ItemFactory(this);
        this.inputManager = new InputManager(this);
        this.obstacleFactory = new ObstacleFactory(this);

        this.lives = 3;
        this.isInvincible = false;
        this.jumpCount = 0; // Track jumps

        // Create Cloud Texture for Fart
        const cloudGraphics = this.make.graphics({x: 0, y: 0, add: false});
        cloudGraphics.fillStyle(0xffffff, 0.8);
        cloudGraphics.fillCircle(10, 10, 10);
        cloudGraphics.fillCircle(25, 15, 12);
        cloudGraphics.fillCircle(15, 25, 10);
        cloudGraphics.generateTexture('cloud', 40, 40);
        cloudGraphics.clear();
        cloudGraphics.destroy();

        // Lives UI
        this.livesText = this.add.text(20, 20, '❤️❤️❤️', {
            fontSize: '32px',
            fontFamily: 'Quicksand'
        }).setScrollFactor(0).setDepth(100);

        // Create Game Objects using Systems
        this.platforms = this.platformFactory.createPlatforms();
        this.player = this.playerFactory.createPlayer(100, 400);
        
        // Create animations
        this.animationManager.createAnimations();

        // Items
        // Items (Simplified Layout)
        const itemPositions = [
            { x: 400, y: 360, frame: 0 },
            { x: 800, y: 310, frame: 1 },
            { x: 1200, y: 360, frame: 2 },
            { x: 1600, y: 260, frame: 3 },
            { x: 2100, y: 360, frame: 0 },
            { x: 2400, y: 210, frame: 1 }, // High path
            { x: 2900, y: 360, frame: 2 },
            { x: 3300, y: 310, frame: 3 },
            { x: 3700, y: 360, frame: 0 }
        ];
        this.items = this.itemFactory.createItems(itemPositions);

        // Obstacles
        // Obstacles (Simplified)
        const obstaclePositions = [
           { x: 600, y: 540 },
           { x: 1000, y: 540 },
           { x: 1400, y: 540 }, 
           { x: 2000, y: 540 },
           { x: 2500, y: 540 },
           { x: 3100, y: 540 },
           { x: 3500, y: 540 }
        ];
        this.obstacles = this.obstacleFactory.createObstacles(obstaclePositions);

        // Goal
        this.goal = this.itemFactory.createGoal(4000, 450);

        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
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

        // Jump Logic with Double Jump
        const spaceJustDown = Phaser.Input.Keyboard.JustDown(this.inputManager.spaceBar);
        const touchJump = inputs.jump && !this.wasTouchingJump; // simple debounce for touch
        this.wasTouchingJump = inputs.jump;

        if ((spaceJustDown || touchJump)) {
            if (onGround) {
                this.player.setVelocityY(-jumpForce);
                this.jumpCount = 1;
            } else if (this.jumpCount < 2) {
                // Double Jump
                this.player.setVelocityY(-jumpForce);
                this.jumpCount++;
                
                // Fart Effect 💨
                try {
                     this.sound.play('fart', { volume: 0.8 });
                     
                     // Random chance for "Fuchiii"
                     if (Math.random() > 0.5) {
                         this.time.delayedCall(800, () => {
                             try {
                                this.sound.play('fuchi', { volume: 1.0 });
                             } catch(e) {}
                         });
                     }
                } catch(e) {}
                
                // Visuals
                const puff = this.add.image(this.player.x, this.player.y + 30, 'cloud');
                puff.setScale(0.5);
                this.tweens.add({
                    targets: puff,
                    alpha: 0,
                    scale: 1,
                    y: puff.y + 20,
                    duration: 500,
                    onComplete: () => puff.destroy()
                });
            }
        }
        
        // Reset jump count on ground (redundant check but safe)
        if (onGround && !inputs.jump) {
             this.jumpCount = 0;
        }

        // Camera follow
        this.cameras.main.scrollX = Math.max(0, this.player.x - 200);
    }

    respawnPlayer() {
        this.player.setPosition(this.startX, this.startY);
        this.player.setVelocity(0, 0);
    }

    updateLivesUI() {
        let text = '';
        for (let i = 0; i < this.lives; i++) {
            text += '❤️';
        }
        for (let i = this.lives; i < 3; i++) {
            text += '🖤';
        }
        this.livesText.setText(text);
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
             this.game.sound.stopAll();
            this.scene.start('FinalScene');
        });
    }

    hitObstacle(player, obstacle) {
        if (this.isInvincible || this.gameEnded) return;

        this.lives--;
        this.updateLivesUI();
        
        // Visual feedback
        this.cameras.main.shake(200, 0.01);
        this.player.setTint(0xff0000);
        this.isInvincible = true;

        if (this.lives <= 0) {
            this.triggerAngelRevival();
        } else {
            // this.showOverlay("¡Au! Ten cuidado 🤕", true); // Removed per user request
            
            // Interaction: Knockback instead of respawn
            this.player.setVelocityY(-250);
            
            // Determine knockback direction based on velocity or default to left
            const velX = this.player.body.velocity.x;
            if (velX > 0) {
                this.player.setVelocityX(-200);
            } else if (velX < 0) {
                 this.player.setVelocityX(200);
            } else {
                 this.player.setVelocityX(-200); // Default fallback
            }
            
            this.time.delayedCall(1000, () => {
                this.player.clearTint();
                this.isInvincible = false;
            });
        }
    }

    triggerAngelRevival() {
         this.gameEnded = true; 
         this.physics.pause();
         // Don't tint player, let them look normal as they are "down"
         // actually maybe tint 
         this.player.setTint(0x555555);

         // --- Angel Animation ---
         const targetY = this.player.y - 100;
         this.angel = this.add.sprite(this.player.x, targetY - 300, 'angel', 1); // Start high
         this.angel.setDisplaySize(64, 85); // Scale up a bit
         this.angel.setDepth(200);

         // Descent Tween
         this.tweens.add({
             targets: this.angel,
             y: targetY,
             duration: 2000,
             ease: 'Sine.easeOut',
             onComplete: () => {
                 this.angelFloatTween = this.tweens.add({
                     targets: this.angel,
                     y: targetY - 20,
                     duration: 1500,
                     yoyo: true,
                     repeat: -1,
                     ease: 'Sine.easeInOut'
                 });
             }
         });

         const foods = ['miniburguer', 'sushi', 'pizza', 'hamburguesita', 'comidita mexicana'];
         const randomFood = foods[Math.floor(Math.random() * foods.length)];
         
         const message = `👼 Sebastián dice:\n\n"Ay mi amor… te revivo…\npero me debes una ${randomFood} por el esfuerzo."`;
         
         this.time.delayedCall(1500, () => {
             this.showOverlay(message, false);
             
             const btn = document.getElementById('close-btn');
             if (btn) {
                 btn.innerText = "Reintentar (Trato hecho) 💖";
                 // Clone to remove old listeners
                 const newBtn = btn.cloneNode(true);
                 if (btn.parentNode) {
                    btn.parentNode.replaceChild(newBtn, btn);
                 }
                 
                 newBtn.onclick = () => {
                     console.log("Reviving player...");
                     this.revivePlayer();
                 };
             }
         });
    }

    revivePlayer() {
        document.getElementById('message-overlay').classList.add('hidden');
        
        // Angel ascent
        if (this.angel) {
            if (this.angelFloatTween) this.angelFloatTween.stop();
            this.tweens.add({
                targets: this.angel,
                y: -200,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    this.angel.destroy();
                    this.angel = null;
                }
            });
        }

        this.lives = 3;
        this.updateLivesUI();
        this.gameEnded = false;
        this.physics.resume();
        this.player.clearTint();
        this.player.setAlpha(1);
        this.player.setVisible(true);
        this.player.setDepth(10); // Ensure player is in front
        this.respawnPlayer();
        this.isInvincible = false;
    }

    showOverlay(text, isTemporary = false) {
        this.isPaused = !isTemporary; // Don't pause hard for temp hit messages
        const overlay = document.getElementById('message-overlay');
        const msgText = document.getElementById('message-text');
        const btn = document.getElementById('close-btn');
        
        if (msgText) msgText.innerText = text;
        
        if (overlay) overlay.classList.remove('hidden');

        if (isTemporary) {
            btn.style.display = 'none';
            setTimeout(() => {
                overlay.classList.add('hidden');
                this.isPaused = false;
            }, 1500);
        } else {
             if (btn) {
                btn.innerText = "Continuar ✨";
                btn.style.display = 'block';
            }
        }
    }
}
