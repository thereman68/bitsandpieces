<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { SpotifyService } from '../services/SpotifyService';

const router = useRouter();

onMounted(async () => {
  const token = await SpotifyService.handleCallback();
  if (token) {
    router.push('/game');
  } else {
    router.push('/login');
  }
});
</script>

<template>
  <div class="callback-container">
    <div class="loading-box">
      <p>Authenticating...</p>
    </div>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: transparent; /* Handled by global body */
  color: white;
}

.loading-box {
  padding: 3rem;
  border: 1px solid #ccc;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 4px;
}

p {
  font-size: 2rem;
  color: var(--retro-red);
  text-transform: uppercase;
  font-weight: 900;
  text-shadow: none;
  margin: 0;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
