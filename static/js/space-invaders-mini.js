// Enhanced Space Invaders mini-game
class SpaceInvadersMini {
    constructor() {
        this.canvas = document.getElementById('invaders-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = {
            x: 200,
            y: 260,
            width: 30,
            height: 20,
            speed: 3
        };
        this.bullets = [];
        this.enemyBullets = [];
        this.invaders = [];
        this.barriers = [];
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gameOver = false;
        this.keys = {};
        this.invaderDirection = 1;
        this.invaderSpeed = 0.5;
        this.shootTimer = 0;
        this.enemyShootTimer = 0;
        
        this.init();
    }
    
    init() {
        // Create invaders
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                this.invaders.push({
                    x: col * 35 + 30,
                    y: row * 25 + 30,
                    width: 25,
                    height: 20,
                    alive: true,
                    type: row < 2 ? 'small' : 'large'
                });
            }
        }
        
        // Create barriers
        for (let i = 0; i < 4; i++) {
            const baseX = 50 + i * 80;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 6; col++) {
                    this.barriers.push({
                        x: baseX + col * 5,
                        y: 200 + row * 5,
                        width: 5,
                        height: 5,
                        destroyed: false
                    });
                }
            }
        }
        
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
                this.shoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    shoot() {
        if (this.shootTimer <= 0) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y,
                width: 3,
                height: 10,
                speed: 5
            });
            this.shootTimer = 15; // Limit shooting rate
        }
    }
    
    update() {
        if (!this.gameRunning || this.gameOver) return;
        
        // Update timers
        if (this.shootTimer > 0) this.shootTimer--;
        this.enemyShootTimer++;
        
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
        
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.canvas.height;
        });
        
        // Move invaders
        let shouldMoveDown = false;
        const aliveInvaders = this.invaders.filter(inv => inv.alive);
        
        aliveInvaders.forEach(invader => {
            invader.x += this.invaderDirection * this.invaderSpeed;
            if (invader.x <= 0 || invader.x >= this.canvas.width - invader.width) {
                shouldMoveDown = true;
            }
        });
        
        if (shouldMoveDown) {
            this.invaderDirection *= -1;
            this.invaders.forEach(invader => {
                if (invader.alive) {
                    invader.y += 20;
                }
            });
            this.invaderSpeed += 0.1; // Speed up
        }
        
        // Enemy shooting
        if (this.enemyShootTimer > 60 && Math.random() < 0.02) {
            const shooters = aliveInvaders.filter(inv => 
                // Only bottom row invaders can shoot
                !aliveInvaders.some(other => 
                    other.x === inv.x && other.y > inv.y
                )
            );
            
            if (shooters.length > 0) {
                const shooter = shooters[Math.floor(Math.random() * shooters.length)];
                this.enemyBullets.push({
                    x: shooter.x + shooter.width / 2,
                    y: shooter.y + shooter.height,
                    width: 3,
                    height: 8,
                    speed: 2
                });
            }
            this.enemyShootTimer = 0;
        }
        
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
                    this.score += invader.type === 'small' ? 30 : 10;
                    document.getElementById('invaders-score').textContent = this.score;
                }
            });
        });
        
        // Check bullet-barrier collisions
        [...this.bullets, ...this.enemyBullets].forEach((bullet, bulletIndex, bulletArray) => {
            this.barriers.forEach(barrier => {
                if (!barrier.destroyed &&
                    bullet.x < barrier.x + barrier.width &&
                    bullet.x + bullet.width > barrier.x &&
                    bullet.y < barrier.y + barrier.height &&
                    bullet.y + bullet.height > barrier.y) {
                    
                    barrier.destroyed = true;
                    bulletArray.splice(bulletIndex, 1);
                }
            });
        });
        
        // Check enemy bullet-player collision
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < this.player.x + this.player.width &&
                bullet.x + bullet.width > this.player.x &&
                bullet.y < this.player.y + this.player.height &&
                bullet.y + bullet.height > this.player.y) {
                
                this.enemyBullets.splice(bulletIndex, 1);
                this.lives--;
                document.getElementById('invaders-lives').textContent = this.lives;
                
                if (this.lives <= 0) {
                    this.gameOver = true;
                }
            }
        });
        
        // Check if invaders reached player
        if (aliveInvaders.some(inv => inv.y + inv.height >= this.player.y)) {
            this.gameOver = true;
        }
        
        // Check win condition
        if (aliveInvaders.length === 0) {
            this.score += 1000;
            document.getElementById('invaders-score').textContent = this.score;
            this.nextWave();
        }
    }
    
    nextWave() {
        // Reset invaders
        this.invaders = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                this.invaders.push({
                    x: col * 35 + 30,
                    y: row * 25 + 30,
                    width: 25,
                    height: 20,
                    alive: true,
                    type: row < 2 ? 'small' : 'large'
                });
            }
        }
        
        this.invaderSpeed += 0.5;
        this.bullets = [];
        this.enemyBullets = [];
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 23) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
        
        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw player cannon
        this.ctx.fillRect(this.player.x + this.player.width/2 - 2, this.player.y - 5, 4, 5);
        
        // Draw bullets
        this.ctx.fillStyle = '#ffffff';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        this.ctx.fillStyle = '#ff0000';
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // Draw invaders
        this.invaders.forEach(invader => {
            if (invader.alive) {
                this.ctx.fillStyle = invader.type === 'small' ? '#ff0000' : '#ffff00';
                this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
                
                // Draw invader details
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(invader.x + 5, invader.y + 5, 3, 3);
                this.ctx.fillRect(invader.x + 17, invader.y + 5, 3, 3);
            }
        });
        
        // Draw barriers
        this.ctx.fillStyle = '#00ff00';
        this.barriers.forEach(barrier => {
            if (!barrier.destroyed) {
                this.ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
            }
        });
        
        // Draw game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00ff00';
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
    new SpaceInvadersMini();
});