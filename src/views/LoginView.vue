<script setup>
import { SpotifyService } from '../services/SpotifyService';

const login = () => {
  SpotifyService.login();
};
</script>

<template>
  <div class="login-container">
    <h1>Bits and Pieces Quiz</h1>
    <p>Test your music knowledge with the classic radio quiz format!</p>
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
  background-color: #121212;
  color: white;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #1db954, #1ed760);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.note {
  color: #b3b3b3;
  margin-bottom: 2rem;
}

.login-btn {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.login-btn:hover {
  transform: scale(1.05);
  background-color: #1ed760;
}
</style>
