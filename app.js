const LOBBY_CODE_LENGTH = 5;
const LOBBY_CODE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const songs = [
  { id: "3n3Ppam7vgaVa1iaRUc9Lp", title: "Mr. Brightside", artist: "The Killers" },
  { id: "7ouMYWpwJ422jRcDASZB7P", title: "Take on Me", artist: "a-ha" },
  { id: "2takcwOaAZWiXQijPHIx7B", title: "Blinding Lights", artist: "The Weeknd" },
  { id: "4iV5W9uYEdYUVa79Axb7Rh", title: "Smells Like Teen Spirit", artist: "Nirvana" },
  { id: "5CtI0qwDJkDQGwXD1H1cLb", title: "Bohemian Rhapsody", artist: "Queen" },
  { id: "6habFhsOp2NvshLv26DqMb", title: "Believer", artist: "Imagine Dragons" },
  { id: "5fVZC9GiM4e8vu99W0Xf6J", title: "Shape of You", artist: "Ed Sheeran" },
  { id: "1mea3bSkSGXuIRvnydlB5b", title: "Viva La Vida", artist: "Coldplay" },
  { id: "3AJwUDP919kvQ9QcozQPxg", title: "Yellow", artist: "Coldplay" },
  { id: "1301WleyT98MSxVHPZCA6M", title: "Billie Jean", artist: "Michael Jackson" },
  { id: "7lQ8MOhq6IN2w8EYcFNSUk", title: "Someone You Loved", artist: "Lewis Capaldi" },
  { id: "0eGsygTp906u18L0Oimnem", title: "Hey Ya!", artist: "Outkast" },
];

const state = {
  lobbyName: "",
  lobbyCode: "",
  players: [],
  selectedByPlayer: {},
  roundSongs: [],
  currentSongIndex: 0,
  voteIndex: 0,
  votes: {},
  playlist: [],
};

const lobbyNameInput = document.getElementById("lobbyName");
const createLobbyBtn = document.getElementById("createLobbyBtn");
const lobbyInfo = document.getElementById("lobbyInfo");
const playerNameInput = document.getElementById("playerName");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const playerInfo = document.getElementById("playerInfo");
const playerList = document.getElementById("playerList");
const songPool = document.getElementById("songPool");
const startRoundBtn = document.getElementById("startRoundBtn");
const roundSizeInput = document.getElementById("roundSize");
const roundInfo = document.getElementById("roundInfo");
const swipeCard = document.getElementById("swipeCard");
const turnInfo = document.getElementById("turnInfo");
const songCard = document.getElementById("songCard");
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const playlistList = document.getElementById("playlist");

function generateLobbyCode() {
  const chars = [];
  for (let index = 0; index < LOBBY_CODE_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * LOBBY_CODE_CHARACTERS.length);
    chars.push(LOBBY_CODE_CHARACTERS[randomIndex]);
  }
  return chars.join("");
}

function createLobby() {
  const name = lobbyNameInput.value.trim();
  if (!name) {
    lobbyInfo.textContent = "Bitte zuerst einen Lobby-Namen eingeben.";
    return;
  }

  state.lobbyName = name;
  state.lobbyCode = generateLobbyCode();
  lobbyInfo.textContent = `Lobby „${name}“ erstellt. Code: ${state.lobbyCode}`;
}

function addPlayer() {
  const name = playerNameInput.value.trim();
  if (!name) {
    playerInfo.textContent = "Bitte einen Spielernamen eingeben.";
    return;
  }

  if (state.players.includes(name)) {
    playerInfo.textContent = `„${name}“ ist bereits in der Lobby.`;
    return;
  }

  state.players.push(name);
  state.selectedByPlayer[name] = new Set();
  playerNameInput.value = "";
  playerInfo.textContent = `${name} wurde hinzugefügt.`;
  renderPlayers();
  renderSongPool();
}

function renderPlayers() {
  playerList.innerHTML = "";
  state.players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player;
    playerList.appendChild(li);
  });
}

function onSongSelectionChange(player, songId, checked) {
  if (!state.selectedByPlayer[player]) {
    state.selectedByPlayer[player] = new Set();
  }

  if (checked) {
    state.selectedByPlayer[player].add(songId);
  } else {
    state.selectedByPlayer[player].delete(songId);
  }
}

function renderSongPool() {
  songPool.innerHTML = "";

  songs.forEach((song) => {
    const wrapper = document.createElement("div");
    wrapper.className = "song-row";

    const meta = document.createElement("div");
    meta.className = "song-meta";
    meta.textContent = `${song.title} — ${song.artist}`;

    const checkboxes = document.createElement("div");
    checkboxes.className = "player-checkboxes";

    state.players.forEach((player) => {
      const label = document.createElement("label");
      label.className = "muted";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = state.selectedByPlayer[player]?.has(song.id) || false;
      input.addEventListener("change", () => {
        onSongSelectionChange(player, song.id, input.checked);
      });

      label.appendChild(input);
      label.append(` ${player}`);
      checkboxes.appendChild(label);
    });

    wrapper.appendChild(meta);
    wrapper.appendChild(checkboxes);
    songPool.appendChild(wrapper);
  });
}

function collectSelectedSongs() {
  const selectedSongIds = new Set();
  Object.values(state.selectedByPlayer).forEach((songSet) => {
    songSet.forEach((id) => selectedSongIds.add(id));
  });

  return songs.filter((song) => selectedSongIds.has(song.id));
}

function collectRoundSongs(roundSize) {
  const shuffledSongs = [...collectSelectedSongs()];
  for (let currentIndex = shuffledSongs.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
    [shuffledSongs[currentIndex], shuffledSongs[randomIndex]] = [shuffledSongs[randomIndex], shuffledSongs[currentIndex]];
  }
  return shuffledSongs.slice(0, roundSize);
}

function startRound() {
  if (!state.lobbyName) {
    roundInfo.textContent = "Bitte zuerst eine Lobby erstellen.";
    return;
  }

  if (state.players.length < 2) {
    roundInfo.textContent = "Bitte mindestens 2 Spieler hinzufügen.";
    return;
  }

  const availableSongs = collectSelectedSongs();
  const requestedRoundSize = Number(roundSizeInput.value) || 5;
  const clampedRoundSize = Math.min(requestedRoundSize, availableSongs.length);
  const roundSize = Math.max(1, clampedRoundSize);
  const roundSongs = collectRoundSongs(roundSize);

  if (!roundSongs.length) {
    roundInfo.textContent = "Bitte zuerst beliebte Songs für mindestens einen Spieler auswählen.";
    return;
  }

  state.roundSongs = roundSongs;
  state.currentSongIndex = 0;
  state.voteIndex = 0;
  state.votes = {};

  roundInfo.textContent = `Runde gestartet: ${roundSongs.length} Songs`;
  swipeCard.classList.remove("hidden");
  renderCurrentSong();
}

function renderCurrentSong() {
  const song = state.roundSongs[state.currentSongIndex];
  const activePlayer = state.players[state.voteIndex];

  if (!song || !activePlayer) {
    finishRound();
    return;
  }

  turnInfo.textContent = `${activePlayer} stimmt jetzt ab (${state.currentSongIndex + 1}/${state.roundSongs.length})`;
  songCard.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = song.title;

  const artist = document.createElement("p");
  artist.className = "muted";
  artist.textContent = song.artist;

  const iframe = document.createElement("iframe");
  iframe.src = `https://open.spotify.com/embed/track/${song.id}?utm_source=generator`;
  iframe.width = "100%";
  iframe.height = "152";
  iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
  iframe.loading = "lazy";

  const spotifyLink = document.createElement("a");
  spotifyLink.href = `https://open.spotify.com/track/${song.id}`;
  spotifyLink.target = "_blank";
  spotifyLink.rel = "noopener noreferrer";
  spotifyLink.textContent = "Song in Spotify öffnen";

  songCard.append(title, artist, iframe, spotifyLink);
}

function voteCurrentSong(liked) {
  const song = state.roundSongs[state.currentSongIndex];
  const player = state.players[state.voteIndex];

  if (!song || !player) {
    return;
  }

  if (!state.votes[song.id]) {
    state.votes[song.id] = {};
  }

  state.votes[song.id][player] = liked;

  state.voteIndex += 1;

  if (state.voteIndex >= state.players.length) {
    const allLiked = state.players.every((name) => state.votes[song.id][name] === true);
    if (allLiked && !state.playlist.some((entry) => entry.id === song.id)) {
      state.playlist.push(song);
      renderPlaylist();
    }

    state.voteIndex = 0;
    state.currentSongIndex += 1;
  }

  if (state.currentSongIndex >= state.roundSongs.length) {
    finishRound();
    return;
  }

  renderCurrentSong();
}

function renderPlaylist() {
  playlistList.innerHTML = "";
  state.playlist.forEach((song) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = `${song.title} — ${song.artist} · `;

    const link = document.createElement("a");
    link.href = `https://open.spotify.com/track/${song.id}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "öffnen";

    li.append(label, link);
    playlistList.appendChild(li);
  });
}

function finishRound() {
  swipeCard.classList.add("hidden");
  roundInfo.textContent = "Runde beendet! Du kannst direkt eine neue Runde starten, um die Playlist weiter auszubauen.";
}

createLobbyBtn.addEventListener("click", createLobby);
addPlayerBtn.addEventListener("click", addPlayer);
startRoundBtn.addEventListener("click", startRound);
likeBtn.addEventListener("click", () => voteCurrentSong(true));
dislikeBtn.addEventListener("click", () => voteCurrentSong(false));

renderSongPool();
renderPlaylist();
