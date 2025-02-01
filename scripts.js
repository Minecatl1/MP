const songListContainer = document.getElementById('song-list-container');
const songList = document.getElementById('song-list');
const playButton = document.getElementById('play-btn');
const stopButton = document.getElementById('stop-btn');
const nextButton = document.getElementById('next-btn');
const shuffleButton = document.getElementById('shuffle-btn');
const loopButton = document.getElementById('loop-btn');
const volumeSlider = document.getElementById('volume-slider');
const progressBar = document.getElementById('progress-bar');
const queueList = document.getElementById('queue-list');
const searchBar = document.getElementById('search-bar');
const searchOptions = document.getElementById('search-options');
const searchButton = document.getElementById('search-btn');
const youtubePlayer = document.getElementById('youtube-player');
const youtubeIframe = document.getElementById('youtube-iframe');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingAuthor = document.getElementById('now-playing-author');
const nowPlayingArt = document.getElementById('now-playing-art');
const currentTimeElem = document.getElementById('current-time');
const durationTimeElem = document.getElementById('duration-time');

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

searchBar?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});

searchButton?.addEventListener('click', () => {
    performSearch();
});

volumeSlider?.addEventListener('input', (event) => {
    audio.volume = event.target.value;
    youtubeIframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":[${event.target.value * 100}]}`, '*');
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    } else if (event.code === 'ArrowRight') {
        nextSong();
    } else if (event.code === 'ArrowLeft') {
        currentSongIndex = (currentSongIndex - 1 + queue.length) % queue.length;
        loadSong(currentSongIndex);
    }
});

audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress;
    currentTimeElem.textContent = formatTime(audio.currentTime);
    durationTimeElem.textContent = formatTime(audio.duration);
});

function performSearch() {
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
                        addToQueue({
                            id: track.track.id,
                            name: track.track.name,
                            author: track.track.artists[0].name,
                            previewUrl: track.track.preview_url
                        });
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
    console.log('Searching local files for:', query);
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
                addToQueue({
                    id: index,
                    name: song.name,
                    author: song.author,
                    previewUrl: song.path
                });
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
                addToQueue({
                    id: track.id,
                    name: track.name,
                    author: track.artists[0].name,
                    previewUrl: track.preview_url
                });
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
                    addToQueue({
                        id: video.id.videoId,
                        name: video.snippet.title,
                        author: video.snippet.channelTitle,
                        previewUrl: `https://www.youtube.com/embed/${video.id.videoId}`
                    });
                });
                songList.appendChild(songItem);
            });
        })
        .catch(error => console.error('Error fetching YouTube videos:', error));
}

function addToQueue(track) {
    queue.push(track);
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
    nowPlayingTitle.textContent = track.name;
    nowPlayingAuthor.textContent = track.author;
    nowPlayingArt.src = track.previewUrl.replace('.mp3', '.jpg').replace('.wav', '.jpg'); // Assuming local files have corresponding images

    if (track.previewUrl && track.previewUrl.includes('youtube.com')) {
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
        } else if (isLooping) {
            currentSongIndex = 0;
            loadSong(currentSongIndex);
        } else {
            audio.pause();
        }
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
}