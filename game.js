class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: "TitleScene" });
  }

  preload() {
    this.load.image("background", "assets/background.png");
    this.load.audio("music", "assets/music.mp3");
    this.load.audio("collect", "assets/collect.mp3");
    this.load.spritesheet("player", "assets/player2.png", {
      frameWidth: 256,
      frameHeight: 256,
    });
  }

  create() {
    this.music = this.sound.add("music", {
      loop: true,
      volume: 0.1, // 🔈 volumen bajo (0.0 a 1.0)
    });

    this.music.play();
  }

  create() {
    // Simple background
    this.add.rectangle(400, 300, 800, 600, 0xfff0f5);
    try {
      const bg = this.add.image(400, 300, "background");
      const scaleX = 800 / bg.width;
      const scaleY = 600 / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale).setAlpha(0.5);
    } catch (e) {
      console.warn("Background image might be missing");
    }

    // Handle HTML overlay button
    const startBtn = document.getElementById("start-btn");
    const titleScreen = document.getElementById("title-screen");

    startBtn.onclick = () => {
      // Start music if available
      try {
        this.sound.play("music", { loop: true, volume: 0.5 });
      } catch (e) {
        console.log("No music found or audio error");
      }

      // HTML transition
      titleScreen.style.opacity = "0";
      setTimeout(() => {
        titleScreen.style.display = "none";
        this.scene.start("IntroScene");
      }, 500);
    };
  }
}

class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0xfff0f5);
    try {
      const bg = this.add.image(width / 2, height / 2, "background");
      const scaleX = width / bg.width;
      const scaleY = height / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale).setAlpha(0.5);
    } catch (e) {}

    // Animations (ensure idle exists)
    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 0 }),
        frameRate: 1,
        repeat: -1,
      });
    }

    // Player Character (Left side)
    const player = this.add.sprite(width * 0.3, height * 0.6, "player");
    player.setScale(0.8);
    player.play("idle");

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
      fontFamily: "Quicksand",
      fontSize: "24px",
      color: "#555",
      wordWrap: { width: boxW - 40 },
      align: "center",
    };

    this.add
      .text(boxX + boxW / 2, boxY + 50, "¡Hola mi amorcito! ❤️", {
        ...textStyle,
        fontSize: "32px",
        color: "#e91e63",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(
        boxX + boxW / 2,
        boxY + 130,
        "Espero que disfrutes este mini juego que te hice con mucho amor... 👇",
        textStyle,
      )
      .setOrigin(0.5);

    this.add
      .text(boxX + boxW / 2, boxY + boxH - 50, "(Toca para continuar)", {
        ...textStyle,
        fontSize: "18px",
        color: "#888",
      })
      .setOrigin(0.5);

    // Interaction
    this.input.once("pointerdown", () => this.startGame());
    this.input.keyboard.once("keydown-SPACE", () => this.startGame());
  }

  startGame() {
    this.scene.start("GameScene");
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.spritesheet("player", "assets/player2.png", {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("items", "assets/items.png", {
      frameWidth: 512,
      frameHeight: 512,
    });
  }

  create() {
    this.collectedCount = 0;
    this.totalItems = 8;
    this.isPaused = false;
    this.canJump = false;
    this.gameEnded = false;

    // Background
    const bg = this.add.image(400, 300, "background");
    const scaleX = 1600 / bg.width;
    const scaleY = 600 / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Particle Manager
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture("spark", 8, 8);
    graphics.destroy();

    this.particles = this.add.particles("spark", {
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
      lifespan: 500,
    });

    // Camera setup for horizontal level
    this.cameras.main.setBounds(0, 0, 4200, 600);
    this.physics.world.setBounds(0, 0, 4200, 600);

    // Create Platforms (static)
    this.platforms = this.physics.add.staticGroup();

    // Ground section 1
    const ground1 = this.add.rectangle(150, 550, 300, 20, 0x8b4513);
    this.platforms.add(ground1);
    ground1.body.setSize(300, 20);

    // Platform 1 - Easy start
    const plat1 = this.add.rectangle(350, 480, 150, 20, 0x90ee90);
    this.platforms.add(plat1);
    plat1.body.setSize(150, 20);

    // Platform 2 - Small gap
    const plat2 = this.add.rectangle(550, 430, 120, 20, 0x90ee90);
    this.platforms.add(plat2);
    plat2.body.setSize(120, 20);

    // Platform 3 - Medium gap
    const plat3 = this.add.rectangle(750, 380, 130, 20, 0x90ee90);
    this.platforms.add(plat3);
    plat3.body.setSize(130, 20);

    // Platform 4 - Wider gap
    const plat4 = this.add.rectangle(1000, 360, 140, 20, 0x90ee90);
    this.platforms.add(plat4);
    plat4.body.setSize(140, 20);

    // Platform 5 - Challenge
    const plat5 = this.add.rectangle(1250, 320, 120, 20, 0x90ee90);
    this.platforms.add(plat5);
    plat5.body.setSize(120, 20);

    // Platform 6 - Up and down
    const plat6 = this.add.rectangle(1500, 280, 130, 20, 0x90ee90);
    this.platforms.add(plat6);
    plat6.body.setSize(130, 20);

    // Platform 7 - Down
    const plat7 = this.add.rectangle(1750, 400, 140, 20, 0x90ee90);
    this.platforms.add(plat7);
    plat7.body.setSize(140, 20);

    // Platform 8 - Final stretch
    const plat8 = this.add.rectangle(2000, 350, 150, 20, 0x90ee90);
    this.platforms.add(plat8);
    plat8.body.setSize(150, 20);

    // HARD SECTION - More platforms and challenges
    // Platform 9 - Tight jump
    const plat9 = this.add.rectangle(2200, 300, 100, 20, 0x90ee90);
    this.platforms.add(plat9);
    plat9.body.setSize(100, 20);

    // Platform 10 - Double jump required
    const plat10 = this.add.rectangle(2400, 250, 110, 20, 0x90ee90);
    this.platforms.add(plat10);
    plat10.body.setSize(110, 20);

    // Platform 11 - Down again
    const plat11 = this.add.rectangle(2650, 320, 120, 20, 0x90ee90);
    this.platforms.add(plat11);
    plat11.body.setSize(120, 20);

    // Platform 12 - Up high
    const plat12 = this.add.rectangle(2900, 270, 115, 20, 0x90ee90);
    this.platforms.add(plat12);
    plat12.body.setSize(115, 20);

    // Platform 13 - Precise landing
    const plat13 = this.add.rectangle(3150, 280, 100, 20, 0x90ee90);
    this.platforms.add(plat13);
    plat13.body.setSize(100, 20);

    // Platform 14 - Final climb
    const plat14 = this.add.rectangle(3400, 240, 120, 20, 0x90ee90);
    this.platforms.add(plat14);
    plat14.body.setSize(120, 20);

    // Platform 15 - Last challenge before meta
    const plat15 = this.add.rectangle(3650, 180, 110, 20, 0x90ee90);
    this.platforms.add(plat15);
    plat15.body.setSize(110, 20);

    // Player
    this.player = this.physics.add.sprite(100, 400, "player");
    this.player.setBounce(0.2);
    this.player.setScale(0.25);
    this.player.body.setSize(150, 150);
    this.player.body.setOffset(50, 50);

    // Collisions
    this.physics.add.collider(this.player, this.platforms);

    // Animations
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1,
    });

    // Items on platforms
    this.items = this.physics.add.staticGroup();
    const itemPositions = [
      { x: 350, y: 410, frame: 0 },
      { x: 750, y: 310, frame: 1 },
      { x: 1250, y: 250, frame: 2 },
      { x: 1750, y: 330, frame: 3 },
      { x: 2400, y: 180, frame: 0 },
      { x: 2900, y: 200, frame: 1 },
      { x: 3400, y: 170, frame: 2 },
      { x: 3650, y: 110, frame: 3 },
    ];

    itemPositions.forEach((pos, index) => {
      let item = this.items.create(pos.x, pos.y, "items", pos.frame);
      item.setScale(0.12);
      item.refreshBody();
      item.setData("messageKey", index);

      // Floating tween
      this.tweens.add({
        targets: item,
        y: pos.y - 10,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    // Goal/Meta at the end
    const goalGraphics = this.make.graphics({ x: 2300, y: 350, add: false });
    goalGraphics.fillStyle(0xff6b9d, 1);
    goalGraphics.fillRect(0, 0, 40, 200);
    goalGraphics.generateTexture("goal", 40, 200);
    goalGraphics.destroy();

    this.goal = this.physics.add.staticImage(3900, 450, "goal");
    this.goal.setScale(1.5);

    // Collision with items
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this,
    );

    // Collision with goal
    this.physics.add.overlap(
      this.player,
      this.goal,
      this.reachGoal,
      null,
      this,
    );

    // Store starting position for respawn
    this.startX = 100;
    this.startY = 400;

    // Inputs
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    // Touch Inputs
    this.touchControls = { left: false, right: false, jump: false };

    const setupBtn = (id, dir) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const activate = (e) => {
        e.preventDefault();
        this.touchControls[dir] = true;
        btn.classList.add("active");
      };
      const deactivate = (e) => {
        e.preventDefault();
        this.touchControls[dir] = false;
        btn.classList.remove("active");
      };

      btn.addEventListener("touchstart", activate, { passive: false });
      btn.addEventListener("touchend", deactivate);
      btn.addEventListener("mousedown", activate);
      btn.addEventListener("mouseup", deactivate);
      btn.addEventListener("mouseleave", deactivate);
    };

    setupBtn("btn-left", "left");
    setupBtn("btn-right", "right");
    setupBtn("btn-up", "jump");

    // UI Listeners
    document.getElementById("close-btn").onclick = () => {
      document.getElementById("message-overlay").classList.add("hidden");
      this.isPaused = false;
    };
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

    const speed = 250;
    const jumpForce = 360;

    // Check both keyboard and touch
    const left = this.cursors.left.isDown || this.touchControls.left;
    const right = this.cursors.right.isDown || this.touchControls.right;
    const jump =
      this.cursors.up.isDown || this.spaceBar.isDown || this.touchControls.jump;

    // Check if touching ground
    const onGround = this.player.body.touching.down;

    // Horizontal movement
    if (left) {
      this.player.setVelocityX(-speed);
      this.player.anims.play("left", true);
      this.player.flipX = false;
    } else if (right) {
      this.player.setVelocityX(speed);
      this.player.anims.play("right", true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("idle", true);
    }

    // Jump
    if (jump && onGround) {
      this.player.setVelocityY(-jumpForce);
    }

    // Camera follow player
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
      this.sound.play("collect");
    } catch (e) {}

    item.disableBody(true, true);
    this.collectedCount++;

    const frameIndex = item.getData("messageKey");
    const msg = this.itemMessages[frameIndex] || "¡Un recuerdo bonito!";

    this.showOverlay(msg);
  }

  reachGoal(player, goal) {
    if (this.isPaused || this.gameEnded) return;
    this.gameEnded = true;

    this.particles.emitParticleAt(goal.x, goal.y, 20);

    // Go to FinalScene after a brief delay
    this.time.delayedCall(500, () => {
      this.scene.start("FinalScene");
    });
  }

  showOverlay(text) {
    this.isPaused = true;
    const overlay = document.getElementById("message-overlay");
    const msgText = document.getElementById("message-text");
    const btn = document.getElementById("close-btn");

    msgText.innerText = text;
    btn.innerText = "Continuar ✨";
    btn.style.display = "block";

    overlay.classList.remove("hidden");
  }
}

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: false,
    },
  },
  backgroundColor: "#fff0f5",
  scene: [TitleScene, IntroScene, GameScene, FinalScene],
};

const game = new Phaser.Game(config);
