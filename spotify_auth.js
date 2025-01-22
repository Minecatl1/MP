const clientId = 'YOUR_SPOTIFY_CLIENT_ID';
const redirectUri = 'http://localhost:8000/callback';  // This should be a valid URL (e.g., http://localhost:8000/callback)
const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-private',
    'playlist-read-private',
    'user-library-read'
];

document.getElementById('link-spotify-btn').addEventListener('click', () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&response_type=token`;
    window.location.href = authUrl;
});

function getAccessToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    return accessToken;
}

// Use the access token to make API requests
const accessToken = getAccessToken();
if (accessToken) {
    fetch('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('User data:', data);
        // You can fetch the user's playlists or favorite tracks here and integrate them into your music player
    })
    .catch(error => console.error('Error fetching user data:', error));
}
