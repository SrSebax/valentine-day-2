import { levelPlatforms } from '../data/levelPlatforms.js';

export class PlatformFactory {
    constructor(scene) {
        this.scene = scene;
        this.platforms = this.scene.physics.add.staticGroup();
    }

    createPlatforms() {
        // 1. Ground Floor (Tile-based)
        // Make it continuous mostly, maybe one easy gap
        for (let x = 0; x < 4200; x += 40) {
            // Pit at 2600-2680 (2 blocks wide, jumpable)
            if (x > 2600 && x < 2680) continue; 
            
            this.createBlock(x, 580, 'ground');
            this.createBlock(x, 540, 'ground'); // Double thick ground
        }

        // 2. Simple Floating Platforms
        // Easy jumps, no big structures
        this.createPlatform(400, 400, 3);
        this.createPlatform(800, 350, 3);
        this.createPlatform(1200, 400, 3);
        this.createPlatform(1600, 300, 3);
        
        this.createPlatform(2100, 400, 4);
        this.createPlatform(2400, 250, 3); // High path
        
        this.createPlatform(2900, 400, 3);
        this.createPlatform(3300, 350, 3);
        this.createPlatform(3700, 400, 3); // Pre-goal

        return this.platforms;
    }

    createBlock(x, y, key) {
        const block = this.platforms.create(x + 20, y + 20, key); // Offset for center origin
        block.body.updateFromGameObject();
    }

    createPlatform(startX, y, widthBlocks) {
        for (let i = 0; i < widthBlocks; i++) {
            this.createBlock(startX + (i * 40), y, 'brick');
        }
    }
}
