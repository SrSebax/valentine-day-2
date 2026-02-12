export class AnimationManager {
    constructor(scene) {
        this.scene = scene;
    }

    createAnimations() {
        if (!this.scene.anims.exists('idle')) {
            this.scene.anims.create({
                key: 'idle',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
                frameRate: 1,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('left')) {
            this.scene.anims.create({
                key: 'left',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('right')) {
            this.scene.anims.create({
                key: 'right',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
                frameRate: 8,
                repeat: -1
            });
        }
    }
}
