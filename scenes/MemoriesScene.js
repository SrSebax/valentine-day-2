import { itemMessages } from "../data/itemMessages.js";

export class MemoriesScene extends Phaser.Scene {
  constructor() {
    super({ key: "MemoriesScene" });
  }

  preload() {
    this.load.image("background", "assets/background.png");
    this.load.spritesheet("items", "assets/items.png", {
      frameWidth: 512,
      frameHeight: 512,
    });
    // Load photos
    for (let i = 1; i <= 7; i++) {
      this.load.image(`photo${i}`, `assets/photos/${i}.png`);
    }
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0xfff0f5);
    try {
      const bg = this.add.image(width / 2, height / 2, "background");
      const scaleX = width / bg.width;
      const scaleY = height / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale).setAlpha(0.3);
    } catch (e) {}

    // Title
    this.add
      .text(width / 2, 60, "Mis Recuerdos 💖", {
        fontFamily: "Quicksand",
        fontSize: "48px",
        color: "#e91e63",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Load collected memories
    const collected = JSON.parse(
      localStorage.getItem("collectedMemories") || "[]",
    );

    // Grid layout
    const startX = width * 0.15;
    const startY = 150;
    const cols = 4;
    const gap = 140;

    for (let i = 0; i < 7; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * gap + (row === 1 ? gap * 0.5 : 0); // Offset second row slightly
      const y = startY + row * gap;

      const isUnlocked = collected.includes(i);

      // Container for each memory
      const container = this.add.container(x, y);

      // Background circle/box
      const bgCircle = this.add.circle(
        0,
        0,
        50,
        isUnlocked ? 0xffffff : 0xdddddd,
      );
      bgCircle.setStrokeStyle(4, isUnlocked ? 0xff69b4 : 0xaaaaaa);
      container.add(bgCircle);

      if (isUnlocked) {
        // Item sprite (using frame i % 4 since spritesheet might loop or we have specific frames)
        // Wait, items.png has 4 frames?
        // GameScene uses frames 0, 1, 2, 3.
        // If we have 7 items, we might need to reuse frames or if the spritesheet has more.
        // Let's assume reusing 0-3 for now, or maybe distinct icons if available.
        // For now: i % 4
        const sprite = this.add.sprite(0, 0, "items", i % 4);
        sprite.setDisplaySize(64, 64);
        container.add(sprite);

        // Interaction
        bgCircle.setInteractive({ useHandCursor: true });
        bgCircle.on("pointerdown", () => {
          this.showMemory(i);
        });
      } else {
        // Question mark
        const qText = this.add
          .text(0, 0, "?", {
            fontFamily: "Quicksand",
            fontSize: "40px",
            color: "#aaaaaa",
          })
          .setOrigin(0.5);
        container.add(qText);
      }
    }

    // Back Button
    const backBtn = this.add
      .text(width / 2, height - 80, "⬅ Volver", {
        fontFamily: "Quicksand",
        fontSize: "32px",
        color: "#555",
        backgroundColor: "#fff",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backBtn.on("pointerdown", () => {
      this.scene.start("TitleScene");
    });

    // Hover effects
    backBtn.on("pointerover", () => backBtn.setStyle({ color: "#e91e63" }));
    backBtn.on("pointerout", () => backBtn.setStyle({ color: "#555" }));

    // Overlay for viewing memory
    this.createOverlay(width, height);
  }

  createOverlay(width, height) {
    this.overlayContainer = this.add.container(0, 0);
    this.overlayContainer.setVisible(false);
    this.overlayContainer.setDepth(100);

    // Dark bg
    const bg = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.8,
    );
    bg.setInteractive(); // Block clicks
    this.overlayContainer.add(bg);

    // Content box
    const box = this.add.rectangle(
      width / 2,
      height / 2,
      width * 0.8,
      height * 0.8,
      0xffffff,
    );
    box.setStrokeStyle(4, 0xff69b4);
    this.overlayContainer.add(box);

    // Photo
    this.memoryPhoto = this.add.image(width / 2, height / 2 - 60, "photo1"); // Placeholder
    // Scale photo to fit
    const maxPhotoWidth = width * 0.6;
    const maxPhotoHeight = height * 0.5;
    const scale = Math.min(
      maxPhotoWidth / this.memoryPhoto.width,
      maxPhotoHeight / this.memoryPhoto.height,
    );
    this.memoryPhoto.setScale(scale);
    this.overlayContainer.add(this.memoryPhoto);

    // Text
    this.memoryText = this.add
      .text(width / 2, height / 2 + height * 0.25, "", {
        fontFamily: "Quicksand",
        fontSize: "24px",
        color: "#333",
        align: "center",
        wordWrap: { width: width * 0.7 },
      })
      .setOrigin(0.5);
    this.overlayContainer.add(this.memoryText);

    // Close instruction
    const closeText = this.add
      .text(width / 2, height / 2 + height * 0.35, "(Toca para cerrar)", {
        fontFamily: "Quicksand",
        fontSize: "20px",
        color: "#888",
      })
      .setOrigin(0.5);
    this.overlayContainer.add(closeText);

    // Close logic
    bg.on("pointerdown", () => {
      this.overlayContainer.setVisible(false);
    });
  }

  showMemory(index) {
    const msg = itemMessages[index] || "Un recuerdo bonito...";
    this.memoryText.setText(msg);

    // Update photo texture
    // index is 0-6, photos are 1-7
    this.memoryPhoto.setTexture(`photo${index + 1}`);

    // Rescale
    const maxPhotoWidth = this.scale.width * 0.6;
    const maxPhotoHeight = this.scale.height * 0.5;
    const scale = Math.min(
      maxPhotoWidth / this.memoryPhoto.width,
      maxPhotoHeight / this.memoryPhoto.height,
    );
    this.memoryPhoto.setScale(scale);

    this.overlayContainer.setVisible(true);
  }
}
