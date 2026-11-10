// main.js - Entry point for the UI
import { mountGame } from './ui/game.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  mountGame(appContainer);
});
