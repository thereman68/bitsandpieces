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
    <p>Authenticating...</p>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #121212;
  color: white;
}
</style>
