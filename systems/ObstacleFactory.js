export class ObstacleFactory {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = this.scene.physics.add.staticGroup();
        // Texture 'spike' is preloaded in IntroScene
    }

    createObstacles(obstaclePositions) {
        obstaclePositions.forEach(pos => {
            const obstacle = this.obstacles.create(pos.x, pos.y, 'spike');
            obstacle.setOrigin(0.5, 1); // Anchor at bottom center
            
            // Ensure size is appropriate (approx 30x30)
            // Use setDisplaySize to force it regardless of source resolution
            obstacle.setDisplaySize(30, 30);
            
            obstacle.refreshBody();
            
            // Adjust hitbox to be slightly smaller than visual
            // For static bodies, setSize should be called after scaling/display size
            const width = obstacle.displayWidth;
            const height = obstacle.displayHeight;
            obstacle.body.setSize(width * 0.6, height * 0.6);
            obstacle.body.setOffset(width * 0.2, height * 0.4);
        });
        
        return this.obstacles;
    }
}
