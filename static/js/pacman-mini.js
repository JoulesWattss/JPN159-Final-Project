// Simple Pac-Man mini-game
class PacManMini {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.pacman = {
            x: 50,
            y: 200,
            size: 20,
            direction: 0, // 0: right, 1: down, 2: left, 3: up
            mouthOpen: true
        };
        this.dots = [];
        this.score = 0;
        this.gameRunning = false;
        
        this.init();
    }
    
    init() {
        const container = document.getElementById('pacman-game');
        container.innerHTML = '';
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 300;
        this.canvas.style.backgroundColor = '#000';
        this.canvas.style.border = '2px solid #ffee07';
        
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Create dots
        for (let i = 0; i < 20; i++) {
            this.dots.push({
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: Math.random() * (this.canvas.height - 40) + 20,
                collected: false
            });
        }
        
        // Add controls
        const controls = document.createElement('div');
        controls.innerHTML = `
            <p style="color: #ffee07; margin: 10px 0;">Use WASD or Arrow Keys to move</p>
            <p style="color: #d477cd;">Score: <span id="pacman-score">0</span></p>
        `;
        container.appendChild(controls);
        
        this.setupControls();
        this.gameLoop();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) this.gameRunning = true;
            
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.pacman.direction = 3;
                    break;
                case 's':
                case 'arrowdown':
                    this.pacman.direction = 1;
                    break;
                case 'a':
                case 'arrowleft':
                    this.pacman.direction = 2;
                    break;
                case 'd':
                case 'arrowright':
                    this.pacman.direction = 0;
                    break;
            }
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Move Pac-Man
        const speed = 2;
        switch(this.pacman.direction) {
            case 0: // right
                this.pacman.x += speed;
                break;
            case 1: // down
                this.pacman.y += speed;
                break;
            case 2: // left
                this.pacman.x -= speed;
                break;
            case 3: // up
                this.pacman.y -= speed;
                break;
        }
        
        // Wrap around screen
        if (this.pacman.x > this.canvas.width) this.pacman.x = 0;
        if (this.pacman.x < 0) this.pacman.x = this.canvas.width;
        if (this.pacman.y > this.canvas.height) this.pacman.y = 0;
        if (this.pacman.y < 0) this.pacman.y = this.canvas.height;
        
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
        
        // Toggle mouth animation
        this.pacman.mouthOpen = !this.pacman.mouthOpen;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw dots
        this.ctx.fillStyle = '#ffee07';
        this.dots.forEach(dot => {
            if (!dot.collected) {
                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
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