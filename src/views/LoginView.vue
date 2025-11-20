<script setup>
import { SpotifyService } from '../services/SpotifyService';

const login = () => {
  SpotifyService.login();
};
</script>

<template>
  <div class="login-container">
    <div class="logo-container">
      <img src="../assets/retro-logo.png" alt="Bits and Pieces" class="logo" />
    </div>
    <p class="subtitle">Test your music knowledge with the classic radio quiz format!</p>
    <p class="note">Requires Spotify Premium</p>
    <button @click="login" class="login-btn">Login with Spotify</button>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  /* Background is handled by global body style */
  background: transparent;
  color: var(--retro-text);
}

.logo-container {
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.logo {
  max-width: 100%;
  width: 300px;
  height: auto;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--retro-text);
  text-shadow: none;
  margin-bottom: 0.5rem;
  max-width: 600px;
  padding: 0.5rem;
  font-weight: bold;
  background: #f9f9f9;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.note {
  color: var(--retro-red);
  margin-bottom: 1.5rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 900;
  text-shadow: 1px 1px 0px white;
}

.login-btn {
  padding: 0.8rem 2.5rem;
  font-size: 1.2rem;
  background-color: var(--retro-red);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s;
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: 0 4px 0px #B71C1C;
}

.login-btn:hover {
  transform: translateY(2px);
  box-shadow: 0 2px 0px #B71C1C;
  background-color: #D32F2F;
}

.login-btn:active {
  transform: translate(6px, 6px);
  box-shadow: 0px 0px 0px #000;
}
</style>
