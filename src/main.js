import './style.css';
import { Game } from './Game.js';

// Entry point of the web game
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});
