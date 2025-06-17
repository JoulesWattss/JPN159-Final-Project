// Simple Mario mini-game
class MarioMini {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.mario = {
            x: 50,
            y: 200,
            width: 20,
            height: 30,
            velocityY: 0,
            onGround: false,
            speed: 3
        };
        this.platforms = [];
        this.coins = [];
        this.score = 0;
        this.gameRunning = false;
        this.keys = {};
        this.gravity = 0.5;
        this.jumpPower = -12;
        
        this.init();
    }
    
    init() {
        const container = document.getElementById('mario-game');
        container.innerHTML = '';
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 300;
        this.canvas.style.backgroundColor = '#87CEEB';
        this.canvas.style.border = '2px solid #ff4444';
        
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Create platforms
        this.platforms = [
            { x: 0, y: 280, width: 400, height: 20 }, // ground
            { x: 150, y: 220, width: 100, height: 15 },
            { x: 300, y: 160, width: 80, height: 15 },
            { x: 50, y: 100, width: 120, height: 15 }
        ];
        
        // Create coins
        this.coins = [
            { x: 180, y: 190, collected: false },
            { x: 320, y: 130, collected: false },
            { x: 90, y: 70, collected: false },
            { x: 350, y: 250, collected: false }
        ];
        
        // Add controls
        const controls = document.createElement('div');
        controls.innerHTML = `
            <p style="color: #ff4444; margin: 10px 0;">Use A/D or Arrow Keys to move, SPACE to jump</p>
            <p style="color: #d477cd;">Coins: <span id="mario-score">0</span></p>
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
                if (this.mario.onGround) {
                    this.mario.velocityY = this.jumpPower;
                    this.mario.onGround = false;
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Move Mario horizontally
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.mario.x = Math.max(0, this.mario.x - this.mario.speed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.mario.x = Math.min(this.canvas.width - this.mario.width, this.mario.x + this.mario.speed);
        }
        
        // Apply gravity
        this.mario.velocityY += this.gravity;
        this.mario.y += this.mario.velocityY;
        
        // Platform collision
        this.mario.onGround = false;
        this.platforms.forEach(platform => {
            if (this.mario.x < platform.x + platform.width &&
                this.mario.x + this.mario.width > platform.x &&
                this.mario.y + this.mario.height > platform.y &&
                this.mario.y + this.mario.height < platform.y + platform.height + 10) {
                
                if (this.mario.velocityY > 0) {
                    this.mario.y = platform.y - this.mario.height;
                    this.mario.velocityY = 0;
                    this.mario.onGround = true;
                }
            }
        });
        
        // Collect coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.mario.x + this.mario.width/2 - coin.x, 2) + 
                    Math.pow(this.mario.y + this.mario.height/2 - coin.y, 2)
                );
                if (distance < 20) {
                    coin.collected = true;
                    this.score += 1;
                    document.getElementById('mario-score').textContent = this.score;
                }
            }
        });
        
        // Reset if Mario falls off screen
        if (this.mario.y > this.canvas.height) {
            this.mario.x = 50;
            this.mario.y = 200;
            this.mario.velocityY = 0;
        }
    }
    
    draw() {
        // Clear canvas (sky blue background)
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw platforms
        this.ctx.fillStyle = '#8B4513';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Draw coins
        this.ctx.fillStyle = '#FFD700';
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw Mario
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(this.mario.x, this.mario.y, this.mario.width, this.mario.height);
        
        // Draw Mario's hat
        this.ctx.fillStyle = '#cc0000';
        this.ctx.fillRect(this.mario.x, this.mario.y, this.mario.width, 8);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MarioMini();
});