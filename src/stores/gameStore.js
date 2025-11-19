import { defineStore } from 'pinia';
import { SpotifyService } from '../services/SpotifyService';

export const useGameStore = defineStore('game', {
    state: () => ({
        gameState: 'idle', // idle, loading, playing
        playlistId: '37i9dQZF1DXcBWIGoYBM5M', // Not used anymore, using search
        tracks: [],
        gameTracks: [],
        currentTrack: null,
    }),

    actions: {
        async loadTracks() {
            this.gameState = 'loading';
            this.gameTracks = [];

            try {
                // Initialize SDK if not already done
                if (!SpotifyService.deviceId) {
                    await SpotifyService.initializeSDK(SpotifyService.accessToken);
                }

                // Fetch tracks
                if (this.tracks.length === 0) {
                    this.tracks = await SpotifyService.getPlaylistTracks(this.playlistId);
                }

                // Select 50 random tracks
                const shuffled = [...this.tracks].sort(() => 0.5 - Math.random());
                this.gameTracks = shuffled.slice(0, 50);

                this.gameState = 'playing';
            } catch (error) {
                console.error('Failed to load tracks:', error);
                this.gameState = 'idle';
            }
        },

        async playTrack(track) {
            if (!track) return;

            // If clicking the same track, pause it
            if (this.currentTrack?.id === track.id) {
                await SpotifyService.pause();
                this.currentTrack = null;
                return;
            }

            // Play the new track from a random position
            this.currentTrack = track;

            // Pick a random start point (between 10% and 80% of duration)
            const duration = track.duration_ms;
            const startMs = Math.floor(duration * 0.1 + Math.random() * (duration * 0.7));

            await SpotifyService.playTrack(track.uri, startMs);

            // Auto-pause after 5 seconds
            setTimeout(async () => {
                if (this.currentTrack?.id === track.id) {
                    await SpotifyService.pause();
                    this.currentTrack = null;
                }
            }, 5000);
        }
    }
});
