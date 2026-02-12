import { levelPlatforms } from '../data/levelPlatforms.js';

export class PlatformFactory {
    constructor(scene) {
        this.scene = scene;
        this.platforms = this.scene.physics.add.staticGroup();
    }

    createPlatforms() {
        levelPlatforms.forEach(plat => {
            const p = this.scene.add.rectangle(plat.x, plat.y, plat.width, plat.height, plat.color);
            this.platforms.add(p);
            p.body.setSize(plat.width, plat.height);
        });
        
        return this.platforms;
    }
}
