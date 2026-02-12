export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.spaceBar = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.touchControls = { left: false, right: false, jump: false };
        this.setupTouchControls();
    }

    setupTouchControls() {
        const setupBtn = (id, dir) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            const activate = (e) => { 
                e.preventDefault(); 
                this.touchControls[dir] = true; 
                btn.classList.add('active'); 
            };
            const deactivate = (e) => { 
                e.preventDefault(); 
                this.touchControls[dir] = false; 
                btn.classList.remove('active'); 
            };
            
            btn.addEventListener('touchstart', activate, { passive: false });
            btn.addEventListener('touchend', deactivate);
            btn.addEventListener('mousedown', activate);
            btn.addEventListener('mouseup', deactivate);
            btn.addEventListener('mouseleave', deactivate);
        };
        
        setupBtn('btn-left', 'left');
        setupBtn('btn-right', 'right');
        setupBtn('btn-up', 'jump');
    }

    getInputs() {
        return {
            left: this.cursors.left.isDown || this.touchControls.left,
            right: this.cursors.right.isDown || this.touchControls.right,
            jump: this.cursors.up.isDown || this.spaceBar.isDown || this.touchControls.jump
        };
    }
}
