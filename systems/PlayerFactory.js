export class PlayerFactory {
    constructor(scene) {
        this.scene = scene;
    }

    createPlayer(x, y) {
        const player = this.scene.physics.add.sprite(x, y, 'player');
        player.setBounce(0.2);
        player.setScale(0.25);
        player.body.setSize(150, 150);
        player.body.setOffset(50, 50);
        return player;
    }
}
