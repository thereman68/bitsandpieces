<script setup>
import { onMounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { SpotifyService } from '../services/SpotifyService';
import { useRouter } from 'vue-router';

const store = useGameStore();
const router = useRouter();

onMounted(async () => {
  if (!SpotifyService.accessToken) {
    if (!SpotifyService.restoreSession()) {
      router.push('/login');
      return;
    }
  }
  
  // Load playlists when mounting
  await store.fetchPlaylists();
});

const handleStart = () => {
  store.loadTracks();
};

const handlePlayTrack = (track) => {
  store.playTrack(track);
};
</script>

<template>
  <div class="player-view">
    <div v-if="store.gameState === 'idle'" class="start-screen">
      <h1>Spotify Music Player</h1>
      <p>Choose a playlist and start your quiz!</p>
      
      <div class="controls">
        <div class="control-group">
          <label>Select Playlist:</label>
          <select v-model="store.selectedPlaylistId" class="playlist-select">
            <option :value="null">Random Popular Tracks</option>
            <option v-for="playlist in store.userPlaylists" :key="playlist.id" :value="playlist.id">
              {{ playlist.name }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>Number of Tracks:</label>
          <input type="number" v-model="store.trackLimit" min="1" max="50" class="limit-input" />
        </div>

        <button @click="handleStart" class="action-btn">Start Quiz</button>
      </div>
    </div>

    <div v-else-if="store.gameState === 'loading'" class="loading-screen">
      <p>Loading tracks...</p>
    </div>

    <div v-else class="player-interface">
      <h1>Track List</h1>
      <div class="track-list">
        <div v-for="(track, index) in store.gameTracks" :key="track.id" class="track-item">
          <div class="track-info">
            <div class="track-number">{{ index + 1 }}</div>
            <img v-if="track.album?.images?.[2]" :src="track.album.images[2].url" alt="Album art" class="album-art" />
            <div class="track-details">
              <div class="track-name">{{ track.name }}</div>
              <div class="track-artist">{{ track.artists[0].name }}</div>
            </div>
          </div>
          <button @click="handlePlayTrack(track)" class="play-btn">
            {{ store.currentTrack?.id === track.id ? '⏸ Pause' : '▶ Play' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  color: white;
  font-family: 'Inter', sans-serif;
}

.start-screen, .loading-screen {
  text-align: center;
  padding: 4rem 2rem;
}

.start-screen h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #1db954, #1ed760);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.action-btn {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  margin-top: 1rem;
  font-weight: bold;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
  margin: 2rem auto;
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.control-group label {
  font-size: 0.9rem;
  color: #b3b3b3;
  font-weight: 600;
}

.playlist-select, .limit-input {
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #404040;
  background: #282828;
  color: white;
  font-size: 1rem;
  font-family: inherit;
}

.playlist-select:focus, .limit-input:focus {
  outline: none;
  border-color: #1db954;
}


.action-btn:hover {
  transform: scale(1.05);
  background-color: #1ed760;
}

.player-interface h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.track-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #282828;
  border-radius: 8px;
  transition: background 0.2s;
}

.track-item:hover {
  background: #3e3e3e;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.track-number {
  font-size: 1.2rem;
  color: #b3b3b3;
  width: 30px;
  text-align: center;
}

.album-art {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.track-details {
  flex: 1;
}

.track-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.track-artist {
  font-size: 0.9rem;
  color: #b3b3b3;
}

.play-btn {
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 100px;
}

.play-btn:hover {
  background-color: #1ed760;
}
</style>
