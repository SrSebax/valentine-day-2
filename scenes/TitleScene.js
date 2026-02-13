export class TitleScene extends Phaser.Scene {
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
    // Start playing music at very low volume initially if possible, or wait for interaction
    try {
      if (!this.sound.get("music")) {
        this.sound.play("music", { loop: true, volume: 0.1 });
      }
    } catch (e) {}

    const width = this.scale.width;
    const height = this.scale.height;
    // Simple background
    this.add.rectangle(width / 2, height / 2, width, height, 0xfff0f5);
    try {
      const bg = this.add.image(width / 2, height / 2, "background");
      const scaleX = width / bg.width;
      const scaleY = height / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale).setAlpha(0.5);
    } catch (e) {
      console.warn("Background image might be missing");
    }

    // Handle HTML overlay button
    const startBtn = document.getElementById("start-btn");
    const titleScreen = document.getElementById("title-screen");

    if (titleScreen) {
      titleScreen.style.display = "flex";
      setTimeout(() => {
        titleScreen.style.opacity = "1";
      }, 50);
    }

    if (startBtn) {
      // Remove old listeners to prevent duplicates if scene restarts
      const newBtn = startBtn.cloneNode(true);
      if (startBtn.parentNode) {
        startBtn.parentNode.replaceChild(newBtn, startBtn);
      }

      newBtn.onclick = () => {
        // Start music if available (ensure volume is 0.1)
        try {
          const music = this.sound.get("music");
          if (music) {
            if (!music.isPlaying) music.play({ loop: true, volume: 0.1 });
            else music.setVolume(0.1);
          } else {
            this.sound.play("music", { loop: true, volume: 0.1 });
          }
        } catch (e) {
          console.log("No music found or audio error");
        }

        // HTML transition
        if (titleScreen) {
          titleScreen.style.opacity = "0";
          setTimeout(() => {
            titleScreen.style.display = "none";
            this.scene.start("IntroScene");
          }, 500);
        } else {
          this.scene.start("IntroScene");
        }
      };
    }

    const memoriesBtn = document.getElementById("memories-btn");
    if (memoriesBtn) {
      const newMemBtn = memoriesBtn.cloneNode(true);
      if (memoriesBtn.parentNode) {
        memoriesBtn.parentNode.replaceChild(newMemBtn, memoriesBtn);
      }

      newMemBtn.onclick = () => {
        // HTML transition
        if (titleScreen) {
          titleScreen.style.opacity = "0";
          setTimeout(() => {
            titleScreen.style.display = "none";
            this.scene.start("MemoriesScene");
          }, 500);
        } else {
          this.scene.start("MemoriesScene");
        }
      };
    }
  }
}
