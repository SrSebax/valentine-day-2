import { itemMessages } from '../data/itemMessages.js';

export class ItemFactory {
    constructor(scene) {
        this.scene = scene;
        this.items = this.scene.physics.add.staticGroup();
    }

    createItems(itemPositions) {
        itemPositions.forEach((pos, index) => {
            let item = this.items.create(pos.x, pos.y, 'items', pos.frame);
            item.setScale(0.12);
            item.refreshBody();
            item.setData('messageKey', index);
            
            // Floating tween
            this.scene.tweens.add({
                targets: item,
                y: pos.y - 10,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
        return this.items;
    }

    createGoal(x, y) {
        const goalGraphics = this.scene.make.graphics({x: 0, y: 0, add: false});
        goalGraphics.fillStyle(0xFF6B9D, 1);
        goalGraphics.fillRect(0, 0, 40, 200);
        goalGraphics.generateTexture('goal', 40, 200);
        goalGraphics.destroy();
        
        const goal = this.scene.physics.add.staticImage(x, y, 'goal');
        goal.setScale(1.5);
        return goal;
    }

    getMessage(index) {
        return itemMessages[index] || "¡Un recuerdo bonito!";
    }
}
