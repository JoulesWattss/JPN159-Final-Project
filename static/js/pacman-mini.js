// Enhanced Pac-Man mini-game
class PacManMini {
    constructor() {
        this.canvas = document.getElementById('pacman-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.pacman = {
            x: 50,
            y: 150,
            size: 15,
            direction: 0, // 0: right, 1: down, 2: left, 3: up
            mouthOpen: true,
            speed: 2
        };
        this.ghosts = [];
        this.dots = [];
        this.powerPellets = [];
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gameOver = false;
        this.mouthTimer = 0;
        this.ghostMode = 'chase'; // 'chase' or 'flee'
        this.ghostModeTimer = 0;
        
        this.init();
    }
    
    init() {
        // Create maze walls (simplified)
        this.walls = [
            // Outer walls
            {x: 0, y: 0, width: 400, height: 10},
            {x: 0, y: 290, width: 400, height: 10},
            {x: 0, y: 0, width: 10, height: 300},
            {x: 390, y: 0, width: 10, height: 300},
            // Inner walls
            {x: 100, y: 50, width: 200, height: 10},
            {x: 100, y: 240, width: 200, height: 10},
            {x: 180, y: 120, width: 40, height: 60}
        ];
        
        // Create dots
        for (let x = 30; x < 370; x += 30) {
            for (let y = 30; y < 270; y += 30) {
                if (!this.isWall(x, y)) {
                    this.dots.push({
                        x: x,
                        y: y,
                        collected: false
                    });
                }
            }
        }
        
        // Create power pellets
        this.powerPellets = [
            {x: 30, y: 30, collected: false},
            {x: 370, y: 30, collected: false},
            {x: 30, y: 270, collected: false},
            {x: 370, y: 270, collected: false}
        ];
        
        // Create ghosts
        this.ghosts = [
            {x: 200, y: 150, color: '#ff0000', dx: 1, dy: 0, vulnerable: false},
            {x: 180, y: 150, color: '#ffb8ff', dx: -1, dy: 0, vulnerable: false},
            {x: 220, y: 150, color: '#00ffff', dx: 0, dy: 1, vulnerable: false}
        ];
        
        this.setupControls();
        this.gameLoop();
    }
    
    isWall(x, y) {
        return this.walls.some(wall => 
            x >= wall.x && x <= wall.x + wall.width &&
            y >= wall.y && y <= wall.y + wall.height
        );
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            if (!this.gameRunning) this.gameRunning = true;
            
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    if (!this.isWall(this.pacman.x, this.pacman.y - this.pacman.speed)) {
                        this.pacman.direction = 3;
                    }
                    break;
                case 's':
                case 'arrowdown':
                    if (!this.isWall(this.pacman.x, this.pacman.y + this.pacman.speed)) {
                        this.pacman.direction = 1;
                    }
                    break;
                case 'a':
                case 'arrowleft':
                    if (!this.isWall(this.pacman.x - this.pacman.speed, this.pacman.y)) {
                        this.pacman.direction = 2;
                    }
                    break;
                case 'd':
                case 'arrowright':
                    if (!this.isWall(this.pacman.x + this.pacman.speed, this.pacman.y)) {
                        this.pacman.direction = 0;
                    }
                    break;
            }
        });
    }
    
    update() {
        if (!this.gameRunning || this.gameOver) return;
        
        // Move Pac-Man
        let newX = this.pacman.x;
        let newY = this.pacman.y;
        
        switch(this.pacman.direction) {
            case 0: newX += this.pacman.speed; break;
            case 1: newY += this.pacman.speed; break;
            case 2: newX -= this.pacman.speed; break;
            case 3: newY -= this.pacman.speed; break;
        }
        
        // Check wall collision
        if (!this.isWall(newX, newY)) {
            this.pacman.x = newX;
            this.pacman.y = newY;
        }
        
        // Wrap around screen
        if (this.pacman.x > this.canvas.width) this.pacman.x = 0;
        if (this.pacman.x < 0) this.pacman.x = this.canvas.width;
        
        // Move ghosts
        this.ghosts.forEach(ghost => {
            let newGhostX = ghost.x + ghost.dx;
            let newGhostY = ghost.y + ghost.dy;
            
            // Simple AI: change direction at walls or randomly
            if (this.isWall(newGhostX, newGhostY) || Math.random() < 0.02) {
                const directions = [
                    {dx: 1, dy: 0}, {dx: -1, dy: 0},
                    {dx: 0, dy: 1}, {dx: 0, dy: -1}
                ];
                const dir = directions[Math.floor(Math.random() * directions.length)];
                ghost.dx = dir.dx;
                ghost.dy = dir.dy;
            } else {
                ghost.x = newGhostX;
                ghost.y = newGhostY;
            }
            
            // Wrap around screen
            if (ghost.x > this.canvas.width) ghost.x = 0;
            if (ghost.x < 0) ghost.x = this.canvas.width;
        });
        
        // Check dot collection
        this.dots.forEach(dot => {
            if (!dot.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.pacman.x - dot.x, 2) + 
                    Math.pow(this.pacman.y - dot.y, 2)
                );
                if (distance < this.pacman.size) {
                    dot.collected = true;
                    this.score += 10;
                    document.getElementById('pacman-score').textContent = this.score;
                }
            }
        });
        
        // Check power pellet collection
        this.powerPellets.forEach(pellet => {
            if (!pellet.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.pacman.x - pellet.x, 2) + 
                    Math.pow(this.pacman.y - pellet.y, 2)
                );
                if (distance < this.pacman.size) {
                    pellet.collected = true;
                    this.score += 50;
                    this.ghostMode = 'flee';
                    this.ghostModeTimer = 300; // 5 seconds at 60fps
                    this.ghosts.forEach(ghost => ghost.vulnerable = true);
                    document.getElementById('pacman-score').textContent = this.score;
                }
            }
        });
        
        // Update ghost mode
        if (this.ghostModeTimer > 0) {
            this.ghostModeTimer--;
            if (this.ghostModeTimer === 0) {
                this.ghostMode = 'chase';
                this.ghosts.forEach(ghost => ghost.vulnerable = false);
            }
        }
        
        // Check ghost collision
        this.ghosts.forEach(ghost => {
            const distance = Math.sqrt(
                Math.pow(this.pacman.x - ghost.x, 2) + 
                Math.pow(this.pacman.y - ghost.y, 2)
            );
            if (distance < this.pacman.size + 10) {
                if (ghost.vulnerable) {
                    // Eat ghost
                    this.score += 200;
                    ghost.x = 200;
                    ghost.y = 150;
                    ghost.vulnerable = false;
                    document.getElementById('pacman-score').textContent = this.score;
                } else {
                    // Lose life
                    this.lives--;
                    document.getElementById('pacman-lives').textContent = this.lives;
                    this.pacman.x = 50;
                    this.pacman.y = 150;
                    
                    if (this.lives <= 0) {
                        this.gameOver = true;
                    }
                }
            }
        });
        
        // Check win condition
        if (this.dots.every(dot => dot.collected) && this.powerPellets.every(pellet => pellet.collected)) {
            this.score += 1000;
            document.getElementById('pacman-score').textContent = this.score;
            this.resetLevel();
        }
        
        // Toggle mouth animation
        this.mouthTimer++;
        if (this.mouthTimer > 10) {
            this.pacman.mouthOpen = !this.pacman.mouthOpen;
            this.mouthTimer = 0;
        }
    }
    
    resetLevel() {
        this.dots.forEach(dot => dot.collected = false);
        this.powerPellets.forEach(pellet => pellet.collected = false);
        this.pacman.x = 50;
        this.pacman.y = 150;
        this.ghosts.forEach(ghost => {
            ghost.x = 200;
            ghost.y = 150;
            ghost.vulnerable = false;
        });
        this.ghostMode = 'chase';
        this.ghostModeTimer = 0;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw walls
        this.ctx.fillStyle = '#0000ff';
        this.walls.forEach(wall => {
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
        
        // Draw dots
        this.ctx.fillStyle = '#ffee07';
        this.dots.forEach(dot => {
            if (!dot.collected) {
                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw power pellets
        this.ctx.fillStyle = '#ffee07';
        this.powerPellets.forEach(pellet => {
            if (!pellet.collected) {
                this.ctx.beginPath();
                this.ctx.arc(pellet.x, pellet.y, 6, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw ghosts
        this.ghosts.forEach(ghost => {
            this.ctx.fillStyle = ghost.vulnerable ? '#0000ff' : ghost.color;
            this.ctx.beginPath();
            this.ctx.arc(ghost.x, ghost.y, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw eyes
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(ghost.x - 4, ghost.y - 4, 3, 3);
            this.ctx.fillRect(ghost.x + 1, ghost.y - 4, 3, 3);
        });
        
        // Draw Pac-Man
        this.ctx.fillStyle = '#ffee07';
        this.ctx.beginPath();
        
        if (this.pacman.mouthOpen) {
            const startAngle = (this.pacman.direction * Math.PI / 2) - Math.PI / 6;
            const endAngle = (this.pacman.direction * Math.PI / 2) + Math.PI / 6;
            this.ctx.arc(this.pacman.x, this.pacman.y, this.pacman.size, startAngle, endAngle);
            this.ctx.lineTo(this.pacman.x, this.pacman.y);
        } else {
            this.ctx.arc(this.pacman.x, this.pacman.y, this.pacman.size, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
        
        // Draw game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ffee07';
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
    new PacManMini();
});