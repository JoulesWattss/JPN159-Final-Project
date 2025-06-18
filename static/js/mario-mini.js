// Enhanced Mario mini-game
class MarioMini {
    constructor() {
        this.canvas = document.getElementById('mario-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.mario = {
            x: 50,
            y: 200,
            width: 20,
            height: 30,
            velocityY: 0,
            onGround: false,
            speed: 3,
            facing: 1 // 1 for right, -1 for left
        };
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gameOver = false;
        this.keys = {};
        this.gravity = 0.5;
        this.jumpPower = -12;
        this.cameraX = 0;
        this.worldWidth = 800;
        
        this.init();
    }
    
    init() {
        // Create platforms
        this.platforms = [
            // Ground platforms
            { x: 0, y: 280, width: 200, height: 20 },
            { x: 250, y: 280, width: 150, height: 20 },
            { x: 450, y: 280, width: 200, height: 20 },
            { x: 700, y: 280, width: 100, height: 20 },
            
            // Floating platforms
            { x: 150, y: 220, width: 80, height: 15 },
            { x: 300, y: 180, width: 100, height: 15 },
            { x: 500, y: 160, width: 80, height: 15 },
            { x: 650, y: 200, width: 120, height: 15 },
            
            // High platforms
            { x: 200, y: 120, width: 100, height: 15 },
            { x: 400, y: 100, width: 80, height: 15 },
            { x: 600, y: 80, width: 100, height: 15 }
        ];
        
        // Create coins
        this.coins = [
            { x: 180, y: 190, collected: false },
            { x: 320, y: 150, collected: false },
            { x: 520, y: 130, collected: false },
            { x: 680, y: 170, collected: false },
            { x: 220, y: 90, collected: false },
            { x: 420, y: 70, collected: false },
            { x: 620, y: 50, collected: false },
            { x: 350, y: 250, collected: false },
            { x: 550, y: 250, collected: false },
            { x: 750, y: 250, collected: false }
        ];
        
        // Create enemies (Goombas)
        this.enemies = [
            { x: 300, y: 250, width: 20, height: 20, dx: -1, alive: true },
            { x: 500, y: 250, width: 20, height: 20, dx: 1, alive: true },
            { x: 650, y: 170, width: 20, height: 20, dx: -1, alive: true }
        ];
        
        this.setupControls();
        this.gameLoop();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
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
        if (!this.gameRunning || this.gameOver) return;
        
        // Move Mario horizontally
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.mario.x = Math.max(0, this.mario.x - this.mario.speed);
            this.mario.facing = -1;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.mario.x = Math.min(this.worldWidth - this.mario.width, this.mario.x + this.mario.speed);
            this.mario.facing = 1;
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
        
        // Update camera
        this.cameraX = this.mario.x - this.canvas.width / 2;
        this.cameraX = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.cameraX));
        
        // Move enemies
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.x += enemy.dx;
                
                // Check platform boundaries
                let onPlatform = false;
                this.platforms.forEach(platform => {
                    if (enemy.x + enemy.width > platform.x && 
                        enemy.x < platform.x + platform.width &&
                        enemy.y + enemy.height >= platform.y &&
                        enemy.y + enemy.height <= platform.y + platform.height + 5) {
                        onPlatform = true;
                    }
                });
                
                // Turn around at platform edges
                if (!onPlatform || enemy.x <= 0 || enemy.x >= this.worldWidth - enemy.width) {
                    enemy.dx *= -1;
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
                    this.score += 100;
                    document.getElementById('mario-score').textContent = this.score;
                }
            }
        });
        
        // Check enemy collision
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                const distance = Math.sqrt(
                    Math.pow(this.mario.x + this.mario.width/2 - (enemy.x + enemy.width/2), 2) + 
                    Math.pow(this.mario.y + this.mario.height/2 - (enemy.y + enemy.height/2), 2)
                );
                
                if (distance < 25) {
                    if (this.mario.velocityY > 0 && this.mario.y < enemy.y) {
                        // Jump on enemy
                        enemy.alive = false;
                        this.mario.velocityY = this.jumpPower / 2;
                        this.score += 200;
                        document.getElementById('mario-score').textContent = this.score;
                    } else {
                        // Hit by enemy
                        this.lives--;
                        document.getElementById('mario-lives').textContent = this.lives;
                        this.mario.x = 50;
                        this.mario.y = 200;
                        this.mario.velocityY = 0;
                        
                        if (this.lives <= 0) {
                            this.gameOver = true;
                        }
                    }
                }
            }
        });
        
        // Reset if Mario falls off screen
        if (this.mario.y > this.canvas.height) {
            this.lives--;
            document.getElementById('mario-lives').textContent = this.lives;
            this.mario.x = 50;
            this.mario.y = 200;
            this.mario.velocityY = 0;
            
            if (this.lives <= 0) {
                this.gameOver = true;
            }
        }
        
        // Check win condition
        if (this.coins.every(coin => coin.collected)) {
            this.score += 1000;
            document.getElementById('mario-score').textContent = this.score;
            this.resetLevel();
        }
    }
    
    resetLevel() {
        this.coins.forEach(coin => coin.collected = false);
        this.enemies.forEach(enemy => enemy.alive = true);
        this.mario.x = 50;
        this.mario.y = 200;
        this.mario.velocityY = 0;
    }
    
    draw() {
        // Clear canvas (sky blue background)
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Draw clouds
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
            const x = i * 200 + 100;
            this.ctx.beginPath();
            this.ctx.arc(x, 50, 20, 0, Math.PI * 2);
            this.ctx.arc(x + 20, 50, 25, 0, Math.PI * 2);
            this.ctx.arc(x + 40, 50, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw platforms
        this.ctx.fillStyle = '#8B4513';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add grass on top
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(platform.x, platform.y - 3, platform.width, 3);
            this.ctx.fillStyle = '#8B4513';
        });
        
        // Draw coins
        this.ctx.fillStyle = '#FFD700';
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add shine effect
                this.ctx.fillStyle = '#FFFF00';
                this.ctx.beginPath();
                this.ctx.arc(coin.x - 3, coin.y - 3, 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#FFD700';
            }
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                // Add eyes
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(enemy.x + 4, enemy.y + 4, 3, 3);
                this.ctx.fillRect(enemy.x + 13, enemy.y + 4, 3, 3);
                
                // Add frown
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + 10, enemy.y + 12, 4, 0, Math.PI);
                this.ctx.stroke();
            }
        });
        
        // Draw Mario
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(this.mario.x, this.mario.y, this.mario.width, this.mario.height);
        
        // Draw Mario's hat
        this.ctx.fillStyle = '#cc0000';
        this.ctx.fillRect(this.mario.x, this.mario.y, this.mario.width, 8);
        
        // Draw Mario's face
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(this.mario.x + 2, this.mario.y + 8, this.mario.width - 4, 12);
        
        // Draw mustache
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.mario.x + 6, this.mario.y + 14, 8, 3);
        
        // Restore context
        this.ctx.restore();
        
        // Draw game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff4444';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Refresh to play again', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
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