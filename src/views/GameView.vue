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
  
  // Test if token works at all
  try {
    await SpotifyService.getUserProfile();
  } catch (error) {
    console.error('Token validation failed:', error);
    router.push('/login');
    return;
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

const handleLogout = () => {
  SpotifyService.logout();
  router.push('/login');
};
</script>

<template>
  <div class="player-view">
    <button @click="handleLogout" class="logout-btn" title="Logout">🚪 Logout</button>
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
  color: var(--retro-text);
  text-align: center;
  position: relative;
}

.logout-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: var(--retro-blue);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 3px 0px #0d1f2d;
  z-index: 100;
}

.logout-btn:hover {
  transform: translateY(1px);
  box-shadow: 0 2px 0px #0d1f2d;
  background-color: #2a4a6a;
}

.logout-btn:active {
  transform: translateY(3px);
  box-shadow: 0px 0px 0px #000;
}

.start-screen, .loading-screen {
  padding: 4rem 2rem;
  background: #fff;
  border: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 4px;
 }

.start-screen h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: var(--retro-red);
  text-transform: uppercase;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.2);
  -webkit-text-fill-color: initial;
  background: none;
  font-family: 'Impact', sans-serif;
  letter-spacing: 2px;
}

.start-screen p {
  font-size: 1.5rem;
  color: var(--retro-text);
  text-shadow: none;
  font-weight: bold;
}

.action-btn {
  padding: 1rem 3rem;
  font-size: 1.5rem;
  background-color: var(--retro-red);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s;
  margin-top: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: 0 4px 0px #B71C1C;
}

.action-btn:hover {
  transform: translateY(2px);
  box-shadow: 0 2px 0px #B71C1C;
  background-color: #D32F2F;
}

.action-btn:active {
  transform: translate(6px, 6px);
  box-shadow: 0px 0px 0px #000;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
  margin: 2rem auto;
  background: #fff;
  padding: 2rem;
  border: 1px solid #ccc;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 4px;
}

.control-group label {
  font-size: 1.2rem;
  color: var(--retro-blue);
  font-weight: 900;
  text-transform: uppercase;
  text-shadow: none;
}

.playlist-select, .limit-input {
  padding: 1rem;
  border-radius: 4px;
  border: 2px solid #ccc;
  background: #f9f9f9;
  color: #333;
  font-size: 1.2rem;
  font-family: sans-serif;
  font-weight: bold;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.playlist-select:focus, .limit-input:focus {
  outline: none;
  border-color: var(--retro-red);
  background: #fff;
}

.player-interface h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 3rem;
  color: var(--retro-red);
  text-shadow: 2px 2px 0px rgba(0,0,0,0.2);
  text-transform: uppercase;
  font-family: 'Impact', sans-serif;
  letter-spacing: 2px;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.track-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  background: #E0E0E0; /* Grey block for content */
  border: none;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: #000;
  transform: none;
  transition: transform 0.2s;
  margin-bottom: 1rem;
  overflow: hidden;
}

.track-item:hover {
  background: #d0d0d0;
  transform: translateY(-2px);
  border-color: transparent;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.track-number {
  font-size: 1.5rem;
  color: white;
  width: 60px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  text-shadow: none;
  background: var(--retro-red); /* Red block for number */
  padding: 1rem;
  border: none;
  margin-right: 1rem;
}

.album-art {
  width: 60px;
  height: 60px;
  border: 3px solid #000;
  border-radius: 0;
}

.track-name {
  font-size: 1.3rem;
  font-weight: 900;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.track-artist {
  font-size: 1rem;
  color: #000;
  font-weight: bold;
}

.play-btn {
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
  background-color: var(--retro-red);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s;
  min-width: 120px;
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: 0 4px 0px #B71C1C;
  margin-right: 1rem;
}

.play-btn:hover {
  background-color: #D32F2F;
  transform: translateY(2px);
  box-shadow: 0 2px 0px #B71C1C;
}

.play-btn:active {
  transform: translateY(4px);
  box-shadow: none;
}
</style>
