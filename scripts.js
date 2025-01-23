const songListContainer = document.getElementById('song-list-container');
const songList = document.getElementById('song-list');
const playButton = document.getElementById('play-btn');
const stopButton = document.getElementById('stop-btn');
const nextButton = document.getElementById('next-btn');
const shuffleButton = document.getElementById('shuffle-btn');
const loopButton = document.getElementById('loop-btn');
const queueList = document.getElementById('queue-list');
const searchBar = document.getElementById('search-bar');
const searchOptions = document.getElementById('search-options');
const localSearchBtn = document.getElementById('local-search-btn');
const spotifySearchBtn = document.getElementById('spotify-search-btn');
const youtubeSearchBtn = document.getElementById('youtube-search-btn');
const youtubePlayer = document.getElementById('youtube-player');
const youtubeIframe = document.getElementById('youtube-iframe');

let playlist = [];
let queue = [];
let currentSongIndex = 0;
let audio = new Audio();
let isShuffling = false;
let isLooping = false;

// Fetch playlist from songs.json
fetch('songs.json')
    .then(response => response.json())
    .then(data => {
        playlist = data;
        console.log('Playlist loaded:', playlist);
    })
    .catch(error => console.error('Error fetching playlist:', error));

document.getElementById('link-spotify-btn')?.addEventListener('click', () => {
    linkSpotify();
    document.getElementById('spotify-search-btn').classList.remove('hidden');
});

document.getElementById('link-youtube-btn')?.addEventListener('click', () => {
    alert("YouTube linked! Ready for search.");
});
// search bar search system
searchBar?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const selectedOption = searchOptions.value;
        if (selectedOption === 'local') {
            searchLocalFiles(searchBar.value);
        } else if (selectedOption === 'spotify') {
            searchSpotify(searchBar.value);
        } else if (selectedOption === 'youtube') {
            searchYouTube(searchBar.value);
        }
    }

function linkSpotify() {
    const clientId = 'af120aa8257f44008a5cbf84e95bfa0a';
    const redirectUri = 'https://minecatl1.github.io/MP/callback';  // Your website's redirect URI
    const scopes = [
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-private',
        'playlist-read-private',
        'user-library-read'
    ];

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&response_type=token`;
    window.location.href = authUrl;
}

function getAccessToken() {
    return localStorage.getItem('spotify_access_token');
}

function getAccessToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

const token = getAccessToken();
if (token) {
    fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('User playlists:', data);
        data.items.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'song-item';
            playlistItem.innerHTML = `
                <img src="${playlist.images[0] ? playlist.images[0].url : 'default_image.jpg'}" alt="Playlist Art">
                <span>${playlist.name}</span>
            `;
            playlistItem.addEventListener('click', () => {
                fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(response => response.json())
                .then(tracksData => {
                    tracksData.items.forEach(track => {
                        addToQueue(track.track.id, track.track.name, track.track.artists[0].name, track.track.preview_url);
                    });
                })
                .catch(error => console.error('Error fetching playlist tracks:', error));
            });
            songList.appendChild(playlistItem);
        });
    })
    .catch(error => console.error('Error fetching user playlists:', error));
}

function searchLocalFiles(query) {
    songList.innerHTML = '';
    playlist.forEach((song, index) => {
        if (song.name.toLowerCase().includes(query.toLowerCase()) || song.author.toLowerCase().includes(query.toLowerCase())) {
            const songItem = document.createElement('div');
            songItem.className = 'song-item';
            songItem.innerHTML = `
                <img src="${song.path.replace('.mp3', '.jpg').replace('.wav', '.jpg')}" alt="Album Art">
                <span>${song.name} - ${song.author}</span>
            `;
            songItem.addEventListener('click', () => {
                addToQueue(index);
            });
            songList.appendChild(songItem);
        }
    });
}

function searchSpotify(query) {
    songList.innerHTML = '';
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        data.tracks.items.forEach(track => {
            const songItem = document.createElement('div');
            songItem.className = 'song-item';
            songItem.innerHTML = `
                <img src="${track.album.images[0] ? track.album.images[0].url : 'default_image.jpg'}" alt="Album Art">
                <span>${track.name} - ${track.artists[0].name}</span>
            `;
            songItem.addEventListener('click', () => {
                addToQueue(track.id, track.name, track.artists[0].name, track.preview_url);
            });
            songList.appendChild(songItem);
        });
    })
    .catch(error => console.error('Error fetching tracks:', error));
}

function searchYouTube(query) {
    const apiKey = 'AIzaSyANMFVhZDBTigvMRtXTgqQf4hPJU47LrqM';
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            songList.innerHTML = '';
            data.items.forEach(video => {
                const songItem = document.createElement('div');
                songItem.className = 'song-item';
                songItem.innerHTML = `
                    <img src="${video.snippet.thumbnails.default.url}" alt="Video Thumbnail">
                    <span>${video.snippet.title}</span>
                `;
                songItem.addEventListener('click', () => {
                    addToQueue(video.id.videoId, video.snippet.title, video.snippet.channelTitle, `https://www.youtube.com/embed/${video.id.videoId}`);
                });
                songList.appendChild(songItem);
            });
        })
        .catch(error => console.error('Error fetching YouTube videos:', error));
}

function addToQueue(id, name, author, previewUrl) {
    queue.push({ id, name, author, previewUrl });
    updateQueueDisplay();
}

function removeFromQueue(index) {
    queue.splice(index, 1);
    updateQueueDisplay();
}

function updateQueueDisplay() {
    queueList.innerHTML = '';
    queue.forEach((track, idx) => {
        const queueItem = document.createElement('li');
        queueItem.className = 'queue-item';
        queueItem.innerHTML = `
            <span>${track.name} - ${track.author}</span>
            <button onclick="removeFromQueue(${idx})">Remove</button>
        `;
        queueList.appendChild(queueItem);
    });
}

playButton?.addEventListener('click', () => {
    if (queue.length > 0) {
        loadSong(0);
    }
});

stopButton?.addEventListener('click', () => {
    if (audio.src) {
        audio.pause();
        audio.currentTime = 0;
    }
    if (youtubeIframe.src) {
        youtubeIframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
    }
});

nextButton?.addEventListener('click', () => {
    nextSong();
});

shuffleButton?.addEventListener('click', () => {
    isShuffling = !isShuffling;
    shuffleButton.textContent = isShuffling ? 'Shuffle On' : 'Shuffle Off';
});

loopButton?.addEventListener('click', () => {
    isLooping = !isLooping;
    loopButton.textContent = isLooping ? 'Loop On' : 'Loop Off';
});

function loadSong(index) {
    const track = queue[index];
    if (track.previewUrl.includes('youtube.com')) {
        youtubePlayer.classList.remove('hidden');
        youtubeIframe.src = track.previewUrl + '?autoplay=1';
        audio.pause();
    } else {
        youtubePlayer.classList.add('hidden');
        audio.src = track.previewUrl;
        audio.play();
    }
    queue.splice(index, 1);
    updateQueueDisplay();
}

function nextSong() {
    if (isShuffling) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        loadSong(randomIndex);
    } else {
        if (queue.length > 0) {
            loadSong(0);
        }
    }
}
