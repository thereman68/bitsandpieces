import { defineStore } from 'pinia';
import { SpotifyService } from '../services/SpotifyService';

export const useGameStore = defineStore('game', {
    state: () => ({
        gameState: 'idle', // idle, loading, playing
        userPlaylists: [],
        selectedPlaylistId: null,
        trackLimit: 10,
        tracks: [],
        gameTracks: [],
        currentTrack: null,
    }),

    actions: {
        async fetchPlaylists() {
            try {
                this.userPlaylists = await SpotifyService.getUserPlaylists();
            } catch (error) {
                console.error('Failed to fetch playlists:', error);
            }
        },

        async loadTracks() {
            this.gameState = 'loading';
            this.gameTracks = [];

            try {
                // Initialize SDK if not already done
                if (!SpotifyService.deviceId) {
                    await SpotifyService.initializeSDK(SpotifyService.accessToken);
                }

                // Fetch tracks - always fetch fresh if we have a selected playlist, 
                // or if we don't have tracks yet
                if (this.selectedPlaylistId || this.tracks.length === 0) {
                    this.tracks = await SpotifyService.getPlaylistTracks(this.selectedPlaylistId);
                }

                // Select random tracks based on limit
                const limit = Math.max(1, Math.min(50, this.trackLimit)); // Clamp between 1 and 50
                const shuffled = [...this.tracks].sort(() => 0.5 - Math.random());
                this.gameTracks = shuffled.slice(0, limit);

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
