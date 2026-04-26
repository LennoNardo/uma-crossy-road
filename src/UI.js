export class UI {
    constructor(game) {
        this.game = game;
        
        this.homeScreen = document.getElementById('home-screen');
        this.hud = document.getElementById('hud');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.scoreEl = document.getElementById('score');
        this.carrotCounterEl = document.getElementById('carrot-counter');
        this.finalScoreEl = document.getElementById('final-score');
        this.bestScoreEl = document.getElementById('best-score');
        
        // Buttons Event Listeners
        document.getElementById('btn-play').addEventListener('click', () => {
            this.game.start();
        });
        document.getElementById('btn-home').onclick = () => {
            this.game.returnToHome();
        };
        
        const gameOverHomeBtn = document.getElementById('game-over-home-btn');
        if (gameOverHomeBtn) {
            gameOverHomeBtn.onclick = () => {
                this.game.returnToHome();
            };
        }
        
        const charModal = document.getElementById('char-modal');
        document.getElementById('btn-select-char').addEventListener('click', () => {
            charModal.classList.toggle('hidden');
        });
        
        document.querySelectorAll('.char-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-char');
                this.game.player.setCharacter(type);
                // Hide modal after selection
                charModal.classList.add('hidden');
            });
        });
        
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.game.start();
        });
    }
    
    showHome() {
        this.homeScreen.classList.remove('hidden');
        this.hud.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }
    
    showHUD() {
        this.homeScreen.classList.add('hidden');
        this.hud.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
    }
    
    showGameOver(score) {
        this.hud.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        this.finalScoreEl.textContent = score;
        
        let best = parseInt(localStorage.getItem('voxel_best_score')) || 0;
        if (score > best) {
            best = score;
            localStorage.setItem('voxel_best_score', best);
        }
        this.bestScoreEl.textContent = best;
    }
    
    updateScore(score) {
        this.scoreEl.textContent = score;
    }
    
    updateCarrots(carrots) {
        this.carrotCounterEl.innerText = "Carrots: " + carrots;
    }
}
