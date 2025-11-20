const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '527622f9e9c5403c9a6dbababa2b95ee';
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback';

const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
].join(' ');

export const SpotifyService = {
    accessToken: null,
    player: null,
    deviceId: null,

    // --- Authentication (PKCE) ---

    async login() {
        const verifier = this.generateCodeVerifier(128);
        const challenge = await this.generateCodeChallenge(verifier);

        localStorage.setItem('spotify_verifier', verifier);

        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            redirect_uri: redirectUri,
            scope: SCOPES,
            code_challenge_method: 'S256',
            code_challenge: challenge,
        });

        console.log('Login called with clientId:', clientId);
        console.log('Redirect URI:', redirectUri);
        const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
        console.log('Redirecting to:', authUrl);
        window.location.replace(authUrl);
    },

    async handleCallback() {
        console.log('handleCallback called');
        console.log('Full URL:', window.location.href);

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log('Authorization code:', code);

        if (!code) {
            console.error('No authorization code found');
            return null;
        }

        const verifier = localStorage.getItem('spotify_verifier');
        console.log('Verifier from storage:', verifier ? 'found' : 'not found');

        const params = new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: verifier,
        });

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Token exchange failed:', errorText);
                throw new Error('Failed to obtain access token');
            }

            const data = await response.json();
            this.accessToken = data.access_token;

            // Store tokens and expiration
            const expiresIn = data.expires_in; // usually 3600 seconds
            const expirationTime = Date.now() + (expiresIn * 1000);

            localStorage.setItem('spotify_access_token', data.access_token);
            localStorage.setItem('spotify_token_expiration', expirationTime);

            if (data.refresh_token) {
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
            }

            console.log('Token obtained successfully');
            return data.access_token;
        } catch (error) {
            console.error('Error in handleCallback:', error);
            return null;
        }
    },

    generateCodeVerifier(length) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },

    async generateCodeChallenge(codeVerifier) {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    },

    async restoreSession() {
        const token = localStorage.getItem('spotify_access_token');
        const expiration = localStorage.getItem('spotify_token_expiration');
        const refreshToken = localStorage.getItem('spotify_refresh_token');

        if (!token) return false;

        // Check if expired
        if (expiration && Date.now() > parseInt(expiration)) {
            console.log('Token expired, attempting refresh...');
            if (refreshToken) {
                return await this.refreshToken();
            }
            return false;
        }

        this.accessToken = token;
        return true;
    },

    async refreshToken() {
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (!refreshToken) return false;

        const params = new URLSearchParams({
            client_id: clientId,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        });

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            if (!response.ok) {
                console.error('Failed to refresh token');
                return false;
            }

            const data = await response.json();

            this.accessToken = data.access_token;
            localStorage.setItem('spotify_access_token', data.access_token);

            const expiresIn = data.expires_in;
            const expirationTime = Date.now() + (expiresIn * 1000);
            localStorage.setItem('spotify_token_expiration', expirationTime);

            if (data.refresh_token) {
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
            }

            console.log('Token refreshed successfully');
            return true;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return false;
        }
    },

    // --- Web Playback SDK ---

    initializeSDK(token) {
        return new Promise((resolve) => {
            if (window.Spotify) {
                this.createPlayer(token, resolve);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;

            window.onSpotifyWebPlaybackSDKReady = () => {
                this.createPlayer(token, resolve);
            };

            document.body.appendChild(script);
        });
    },

    createPlayer(token, resolve) {
        this.player = new window.Spotify.Player({
            name: 'Bits and Pieces Quiz',
            getOAuthToken: (cb) => { cb(token); },
            volume: 0.5
        });

        this.player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            this.deviceId = device_id;
            resolve(device_id);
        });

        this.player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        this.player.connect();
    },

    // --- Playback Control ---

    async playTrack(uri, position_ms = 0) {
        if (!this.deviceId) return;

        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [uri], position_ms }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            },
        });
    },

    async pause() {
        if (!this.player) return;
        await this.player.pause();
    },

    async getUserPlaylists() {
        const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch playlists');
        }

        const data = await response.json();
        return data.items;
    },

    async getPlaylistTracks(playlistId) {
        // If no playlist ID is provided, fallback to search (legacy behavior support)
        if (!playlistId) {
            console.log('No playlist ID provided, searching for popular tracks');
            const searchTerms = ['pop', 'rock', 'hits', 'dance', 'party'];
            const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

            const response = await fetch(`https://api.spotify.com/v1/search?q=${randomTerm}&type=track&limit=50`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to search tracks: ${response.status}`);
            }

            const data = await response.json();
            return data.tracks.items.filter(t => t && t.is_playable !== false);
        }

        // Fetch tracks from specific playlist
        let allTracks = [];
        let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;

        // Fetch first page (we can implement pagination later if needed, for now 50 is good)
        const response = await fetch(nextUrl, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
        }

        const data = await response.json();

        // Map playlist track objects to simple track objects
        // Playlist tracks are wrapped in a 'track' object and have 'added_at' etc.
        return data.items
            .map(item => item.track)
            .filter(t => t && t.id && t.is_playable !== false);
    }
};
