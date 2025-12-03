// --- Players ---
const menPlayers = ['Liam Novak', 'Ethan Rivera', 'Noah Chen', 'Mason Silva', 'Lucas Patel', 'Oliver Kim'];
const womenPlayers = ['Ava Rossi', 'Sophia Zhang', 'Isabella Torres', 'Mia Johnson', 'Amelia Lee', 'Charlotte Brown'];
const opponentPath = [1, 2, 3, 4, 5];

// --- Player Photos (replace URLs with actual images) ---
const menPhotos = [
    'https://via.placeholder.com/120?text=Liam',
    'https://via.placeholder.com/120?text=Ethan',
    'https://via.placeholder.com/120?text=Noah',
    'https://via.placeholder.com/120?text=Mason',
    'https://via.placeholder.com/120?text=Lucas',
    'https://via.placeholder.com/120?text=Oliver'
];

const womenPhotos = [
    'https://via.placeholder.com/120?text=Ava',
    'https://via.placeholder.com/120?text=Sophia',
    'https://via.placeholder.com/120?text=Isabella',
    'https://via.placeholder.com/120?text=Mia',
    'https://via.placeholder.com/120?text=Amelia',
    'https://via.placeholder.com/120?text=Charlotte'
];

// --- State ---
let tournament = '';
let players = [];
let playerPhotos = [];
let quizPath = [];
let currentChoice = null;
let remainingOpponents = [];
let currentOpponentIndex = 0;

let menWinner = '';
let womenWinner = '';
let completedTournaments = { Men: false, Women: false };

const container = document.getElementById('quiz-container');

// --- Helpers ---
function clearContainer() {
    container.style.opacity = 0;
    setTimeout(() => { container.innerHTML = ''; container.style.opacity = 1; }, 200);
}

// --- Tournament label ---
function renderTournamentLabel() {
    const p = document.createElement('p');
    p.id = 'tournament-label';
    p.textContent = `Current Tournament: ${tournament}`;
    return p;
}

// --- Current Favorite ---
function renderCurrentFavorite() {
    const p = document.createElement('p');
    p.id = 'current-favorite';
    p.className = 'small';
    p.style.display = 'none';
    return p;
}

// --- Create choice button ---
function createChoiceButton(name, idx) {
    const btn = document.createElement('div');
    btn.className = 'choice';
    btn.textContent = name;
    btn.dataset.index = idx;
    btn.onclick = () => choosePlayer(idx);

    // Set background
    if (playerPhotos[idx]) btn.style.backgroundImage = `url('${playerPhotos[idx]}')`;
    btn.style.backgroundSize = 'cover';
    btn.style.backgroundPosition = 'center';

    return btn;
}

// --- Page title (back to start) ---
function renderTitle() {
    const title = document.createElement('h1');
    title.textContent = 'Australian Open 2026';
    title.onclick = renderTournamentSelector;
    return title;
}

// --- Tournament selector ---
function renderTournamentSelector() {
    container.innerHTML = '';
    const title = renderTitle();

    // Intro copy
    const intro = document.createElement('p');
    intro.textContent = "Welcome to the Australian Open 2026 Quiz! Cheer for your favorite players and see who becomes your champion.";
    intro.className = 'intro-copy';

    const choices = document.createElement('div');
    choices.className = 'choices';

    const menBtn = document.createElement('div');
    menBtn.className = 'choice';
    menBtn.textContent = "Men's Tournament";
    menBtn.onclick = () => startQuiz('Men');

    const womenBtn = document.createElement('div');
    womenBtn.className = 'choice';
    womenBtn.textContent = "Women's Tournament";
    womenBtn.onclick = () => startQuiz('Women');

    // Add "or" between buttons
    const orSpan = document.createElement('span');
    orSpan.textContent = 'or';
    orSpan.style.alignSelf = 'center';
    orSpan.style.margin = '0 10px';
    orSpan.style.fontWeight = 'bold';
    orSpan.style.color = '#333';

    choices.appendChild(menBtn);
    choices.appendChild(orSpan);
    choices.appendChild(womenBtn);

    container.appendChild(title);
    container.appendChild(intro);
    container.appendChild(choices);
}


// --- Start quiz ---
function startQuiz(type) {
    tournament = type;
    players = (type === 'Men') ? menPlayers.slice() : womenPlayers.slice();
    playerPhotos = (type === 'Men') ? menPhotos.slice() : womenPhotos.slice();
    quizPath = [];
    currentChoice = null;
    remainingOpponents = opponentPath.slice();
    currentOpponentIndex = 0;
    showFirstQuestion();
}

function animateContainer() {
    container.classList.remove('fade-slide-in');
    void container.offsetWidth;
    container.classList.add('fade-slide-in');
}

function showFirstQuestion() {
    container.innerHTML = '';
    animateContainer();

    const title = renderTitle();
    const label = renderTournamentLabel();

    // New heading just instructs "Choose your player"
    const heading = document.createElement('h2');
    heading.textContent = `Choose your player`;

    // Choices container
    const choices = document.createElement('div'); choices.className = 'choices';
    const left = createChoiceButton(players[0], 0); left.id = 'choice-left';
    const right = createChoiceButton(players[1], 1); right.id = 'choice-right';
    if (currentOpponentIndex > 0) right.classList.add('slide-in-right');

    // Add "or" between buttons
    const orSpan = document.createElement('span');
    orSpan.textContent = 'or';
    orSpan.style.alignSelf = 'center';
    orSpan.style.margin = '0 10px';
    orSpan.style.fontWeight = 'bold';
    orSpan.style.color = '#333';

    choices.appendChild(left);
    choices.appendChild(orSpan);
    choices.appendChild(right);

    const favoriteEl = renderCurrentFavorite();

    container.appendChild(title);
    container.appendChild(label);
    container.appendChild(heading);
    container.appendChild(choices);
    container.appendChild(favoriteEl);

    highlightCurrentChoice();
    updateCurrentFavorite();
}

function showNextQuestion() {
    if (currentOpponentIndex >= remainingOpponents.length) { showResult(); return; }

    container.innerHTML = '';
    animateContainer();

    const title = renderTitle();
    const label = renderTournamentLabel();
    const opponentIdx = remainingOpponents[currentOpponentIndex];

    const heading = document.createElement('h2');
    heading.textContent = `Choose your player`;

    const choices = document.createElement('div'); choices.className = 'choices';
    const left = createChoiceButton(players[currentChoice], currentChoice); left.id = 'choice-left';
    const right = createChoiceButton(players[opponentIdx], opponentIdx); right.id = 'choice-right';
    right.classList.add('slide-in-right');

    // Add "or" between buttons
    const orSpan = document.createElement('span');
    orSpan.textContent = 'or';
    orSpan.style.alignSelf = 'center';
    orSpan.style.margin = '0 10px';
    orSpan.style.fontWeight = 'bold';
    orSpan.style.color = '#333';

    choices.appendChild(left);
    choices.appendChild(orSpan);
    choices.appendChild(right);

    const favoriteEl = renderCurrentFavorite();
    container.appendChild(title);
    container.appendChild(label);
    container.appendChild(heading);
    container.appendChild(choices);
    container.appendChild(favoriteEl);

    highlightCurrentChoice();
    updateCurrentFavorite();
}


// --- Choose a player ---
function choosePlayer(idx) {
    quizPath.push(players[idx]);
    currentChoice = idx;
    highlightCurrentChoice();
    updateCurrentFavorite();
    currentOpponentIndex++;
    setTimeout(showNextQuestion, 200);
}

// --- Highlight current choice ---
function highlightCurrentChoice() {
    const all = container.querySelectorAll('.choice');
    all.forEach(el => el.classList.remove('selected'));
    const left = document.getElementById('choice-left');
    const right = document.getElementById('choice-right');
    if (currentChoice === null) return;
    if (left && left.dataset.index === String(currentChoice)) left.classList.add('selected');
    if (right && right.dataset.index === String(currentChoice)) right.classList.add('selected');
}

// --- Update current favorite ---
function updateCurrentFavorite() {
    const el = document.getElementById('current-favorite');
    if (!el) return;

    if (quizPath.length === 0) {
        el.style.display = 'none';
        return;
    }

    const freq = {};
    quizPath.forEach(name => { freq[name] = (freq[name] || 0) + 1; });
    let max = 0; for (const k in freq) if (freq[k] > max) max = freq[k];
    const top = Object.keys(freq).filter(k => freq[k] === max);

    el.style.display = 'block';
    el.textContent = `Current Favorite: ${top.join(', ')}`;
}

// --- Get top players for final calculation ---
function getTopPlayers() {
    const freq = {};
    quizPath.forEach(p => freq[p] = (freq[p] || 0) + 1);
    let max = 0; for (const k in freq) if (freq[k] > max) max = freq[k];
    return Object.keys(freq).filter(k => freq[k] === max);
}

// --- Show result or tie-breaker ---
function showResult() {
    const top = getTopPlayers();
    if (top.length === 1) {
        if (tournament === 'Men') menWinner = top[0]; else womenWinner = top[0];
        completedTournaments[tournament] = true;
        proceedAfterTournament();
        return;
    }
    // tie-breaker
    container.innerHTML = '';
    animateContainer();

    const title = renderTitle();
    const label = renderTournamentLabel();
    const heading = document.createElement('h2');
    heading.textContent = 'Tie! Choose your favorite player:';

    const choices = document.createElement('div'); choices.className = 'choices';
    top.forEach((p, i) => {
        const btn = document.createElement('div'); btn.className = 'choice'; btn.textContent = p;
        if (i === 1) btn.classList.add('slide-in-right');
        const idx = players.indexOf(p);
        if (playerPhotos[idx]) btn.style.backgroundImage = `url('${playerPhotos[idx]}')`;
        btn.style.backgroundSize = 'cover';
        btn.style.backgroundPosition = 'center';
        btn.onclick = () => chooseTieBreaker(p);
        choices.appendChild(btn);
    });

    const favoriteEl = renderCurrentFavorite();
    container.appendChild(title);
    container.appendChild(label);
    container.appendChild(heading);
    container.appendChild(choices);
    container.appendChild(favoriteEl);

    updateCurrentFavorite();
}

// --- Tie-breaker choice ---
function chooseTieBreaker(player) {
    quizPath.push(player);
    updateCurrentFavorite();
    if (tournament === 'Men') menWinner = player; else womenWinner = player;
    completedTournaments[tournament] = true;
    proceedAfterTournament();
}

// --- Continue after tournament ---
function proceedAfterTournament() {
    if (!completedTournaments.Men) { tournament = 'Men'; players = menPlayers.slice(); playerPhotos = menPhotos.slice(); startTournament(); return; }
    if (!completedTournaments.Women) { tournament = 'Women'; players = womenPlayers.slice(); playerPhotos = womenPhotos.slice(); startTournament(); return; }
    showFinalScreen();
}

// --- Start new tournament ---
function startTournament() {
    quizPath = []; currentChoice = null; remainingOpponents = opponentPath.slice(); currentOpponentIndex = 0;
    showFirstQuestion();
}

// --- Final Screen ---
function showFinalScreen() {
    container.innerHTML = '';
    animateContainer();

    const title = renderTitle();
    const heading = document.createElement('h2'); heading.textContent = 'Your Champions!';

    const results = document.createElement('div'); results.className = 'results';

    // Men Winner Button
    if (menWinner) {
        const menBtn = document.createElement('div');
        menBtn.className = 'winner celebrate';
        menBtn.textContent = menWinner;
        const idx = menPlayers.indexOf(menWinner);
        if (idx !== -1) menBtn.style.backgroundImage = `url('${menPhotos[idx]}')`;
        menBtn.style.backgroundSize = 'cover';
        menBtn.style.backgroundPosition = 'center';
        results.appendChild(menBtn);
    }

    // Women Winner Button
    if (womenWinner) {
        const womenBtn = document.createElement('div');
        womenBtn.className = 'winner celebrate';
        womenBtn.textContent = womenWinner;
        const idx = womenPlayers.indexOf(womenWinner);
        if (idx !== -1) womenBtn.style.backgroundImage = `url('${womenPhotos[idx]}')`;
        womenBtn.style.backgroundSize = 'cover';
        womenBtn.style.backgroundPosition = 'center';
        results.appendChild(womenBtn);
    }

    const info = document.createElement('div'); info.className = 'small';
    info.textContent = 'Now submit your details for a chance at a prize!';

    const formLink = document.createElement('a'); formLink.className = 'btn';
    formLink.textContent = 'Submit Entry';
    formLink.href = 'YOUR_FORM_LINK_HERE';
    formLink.target = '_blank';
    formLink.rel = 'noopener noreferrer';

    container.appendChild(title);
    container.appendChild(heading);
    container.appendChild(results);
    container.appendChild(info);
    container.appendChild(formLink);

    // Footer with start over icon using HTML entity
    const footer = document.createElement('div');
    footer.style.marginTop = '20px';
    footer.style.textAlign = 'center';

    const restartIcon = document.createElement('span');
    restartIcon.innerHTML = '&#10227;';  // ⟳ HTML entity
    restartIcon.style.fontSize = '2rem';
    restartIcon.style.cursor = 'pointer';
    restartIcon.title = 'Start Over';
    restartIcon.onclick = renderTournamentSelector;

    footer.appendChild(restartIcon);
    container.appendChild(footer);



}

// --- Start ---
renderTournamentSelector();
