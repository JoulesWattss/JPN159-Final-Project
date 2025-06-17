// Simple Space Invaders mini-game
class SpaceInvadersMini {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = {
            x: 200,
            y: 250,
            width: 30,
            height: 20,
            speed: 3
        };
        this.bullets = [];
        this.invaders = [];
        this.score = 0;
        this.gameRunning = false;
        this.keys = {};
        
        this.init();
    }
    
    init() {
        const container = document.getElementById('invaders-game');
        container.innerHTML = '';
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 300;
        this.canvas.style.backgroundColor = '#000';
        this.canvas.style.border = '2px solid #00ff00';
        
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Create invaders
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                this.invaders.push({
                    x: col * 40 + 50,
                    y: row * 30 + 50,
                    width: 25,
                    height: 20,
                    alive: true
                });
            }
        }
        
        // Add controls
        const controls = document.createElement('div');
        controls.innerHTML = `
            <p style="color: #00ff00; margin: 10px 0;">Use A/D or Arrow Keys to move, SPACE to shoot</p>
            <p style="color: #d477cd;">Score: <span id="invaders-score">0</span></p>
        `;
        container.appendChild(controls);
        
        this.setupControls();
        this.gameLoop();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (!this.gameRunning) this.gameRunning = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            width: 3,
            height: 10,
            speed: 5
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Move player
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
        
        // Move bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });
        
        // Move invaders
        this.invaders.forEach(invader => {
            if (invader.alive) {
                invader.x += 0.5;
                if (invader.x > this.canvas.width - invader.width || invader.x < 0) {
                    invader.y += 20;
                }
            }
        });
        
        // Check bullet-invader collisions
        this.bullets.forEach((bullet, bulletIndex) => {
            this.invaders.forEach(invader => {
                if (invader.alive && 
                    bullet.x < invader.x + invader.width &&
                    bullet.x + bullet.width > invader.x &&
                    bullet.y < invader.y + invader.height &&
                    bullet.y + bullet.height > invader.y) {
                    
                    invader.alive = false;
                    this.bullets.splice(bulletIndex, 1);
                    this.score += 10;
                    document.getElementById('invaders-score').textContent = this.score;
                }
            });
        });
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw bullets
        this.ctx.fillStyle = '#ffffff';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // Draw invaders
        this.ctx.fillStyle = '#ff0000';
        this.invaders.forEach(invader => {
            if (invader.alive) {
                this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            }
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpaceInvadersMini();
});