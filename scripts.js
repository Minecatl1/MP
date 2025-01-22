const songList = document.getElementById('song-list');
const playButton = document.getElementById('play-btn');
const stopButton = document.getElementById('stop-btn');
const nextButton = document.getElementById('next-btn');
const shuffleButton = document.getElementById('shuffle-btn');
const loopButton = document.getElementById('loop-btn');
const queueList = document.getElementById('queue-list');

let playlist = [];
let queue = [];
let currentSongIndex = 0;
let audio = new Audio();
let isShuffling = false;
let isLooping = false;

fetch('songs.json')
    .then(response => response.json())
    .then(data => {
        playlist = data;
        playlist.forEach((song, index) => {
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
        });
    })
    .catch(error => console.error('Error fetching song data:', error));

playButton.addEventListener('click', () => {
    if (audio.src) {
        audio.play();
    } else if (queue.length > 0) {
        loadSong(queue[0]);
    }
});

stopButton.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
});

nextButton.addEventListener('click', () => {
    nextSong();
});

shuffleButton.addEventListener('click', () => {
    isShuffling = !isShuffling;
    shuffleButton.textContent = isShuffling ? 'Shuffle On' : 'Shuffle Off';
});

loopButton.addEventListener('click', () => {
    isLooping = !isLooping;
    loopButton.textContent = isLooping ? 'Loop On' : 'Loop Off';
});

audio.addEventListener('ended', () => {
    nextSong();
});

function loadSong(index) {
    const song = playlist[index];
    audio.src = song.path;
    audio.play();
    if (!isLooping) {
        queue.shift(); // Remove the song from the queue once it's played
        updateQueueDisplay();
    }
}

function nextSong() {
    if (isShuffling) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        loadSong(queue[randomIndex]);
        queue.splice(randomIndex, 1); // Remove the played song from the queue
    } else {
        if (queue.length > 0) {
            loadSong(queue[0]);
        } else {
            audio.pause();
        }
    }
}

function addToQueue(index) {
    queue.push(index);
    updateQueueDisplay();
}

function removeFromQueue(index) {
    queue.splice(index, 1);
    updateQueueDisplay();
}

function updateQueueDisplay() {
    queueList.innerHTML = '';
    queue.forEach((songIndex, idx) => {
        const song = playlist[songIndex];
        const queueItem = document.createElement('li');
        queueItem.className = 'queue-item';
        queueItem.innerHTML = `
            <span>${song.name} - ${song.author}</span>
            <button onclick="removeFromQueue(${idx})">Remove</button>
        `;
        queueList.appendChild(queueItem);
    });
}