/* script.js
   DOM-only rendering (no big template strings)
   Quiz features:
   - Men/Women chooser
   - Sticky choice logic (sticky player remains on left)
   - Next opponent slides in on right
   - Tie-breaker that asks user to choose between tied players
   - Independent flow: whichever tournament user starts, both tournaments will complete
*/

/* --- Configuration / players --- */
const menPlayers = ['Liam Novak','Ethan Rivera','Noah Chen','Mason Silva','Lucas Patel','Oliver Kim'];
const womenPlayers = ['Ava Rossi','Sophia Zhang','Isabella Torres','Mia Johnson','Amelia Lee','Charlotte Brown'];

/* indices of opponents after the first question (0-based indices) */
const opponentPath = [1,2,3,4,5];

/* --- State --- */
let tournament = '';              // 'Men' or 'Women'
let players = [];                 // current tournament's players array
let quizPath = [];                // log of selections (player names) for current tournament
let currentChoice = null;         // index of sticky selected player
let remainingOpponents = [];      // opponent indices queue
let currentOpponentIndex = 0;

let menWinner = '';
let womenWinner = '';

let completedTournaments = { Men: false, Women: false };

/* container ref */
const container = document.getElementById('quiz-container');

/* Utility: clear container safely (allowed) */
function clearContainer(){
  container.innerHTML = '';
}

/* --- Render: Tournament selector --- */
function renderTournamentSelector(){
  clearContainer();

  const title = document.createElement('h2');
  title.textContent = 'Choose Your Tournament';

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

  choices.appendChild(menBtn);
  choices.appendChild(womenBtn);

  container.appendChild(title);
  container.appendChild(choices);
}

/* --- Helpers to render components without HTML strings --- */
function renderTournamentLabel(){
  const p = document.createElement('p');
  p.id = 'tournament-label';
  p.textContent = `Current Tournament: ${tournament}`;
  return p;
}

function createChoiceButton(playerName, idx){
  const btn = document.createElement('div');
  btn.className = 'choice';
  btn.textContent = playerName;
  btn.dataset.index = String(idx);
  btn.onclick = () => choosePlayer(idx);
  return btn;
}

/* --- Start quiz for chosen tournament --- */
function startQuiz(type){
  tournament = type;
  players = (type === 'Men') ? menPlayers.slice() : womenPlayers.slice();
  quizPath = [];
  currentChoice = null;
  remainingOpponents = opponentPath.slice();
  currentOpponentIndex = 0;

  // render first question
  showFirstQuestion();
}

/* --- First question: players[0] vs players[1] --- */
function showFirstQuestion(){
  clearContainer();

  const label = renderTournamentLabel();
  const heading = document.createElement('h2');
  heading.textContent = `Cheer for ${players[0]} or ${players[1]}`;

  const choices = document.createElement('div');
  choices.className = 'choices';

  const left = createChoiceButton(players[0], 0);
  left.id = 'choice-left';
  const right = createChoiceButton(players[1], 1);
  right.id = 'choice-right';

  choices.appendChild(left);
  choices.appendChild(right);

  container.appendChild(label);
  container.appendChild(heading);
  container.appendChild(choices);

  highlightCurrentChoice();
}

/* --- Show next question: sticky choice vs next opponent --- */
function showNextQuestion(){
  // finished all opponents for this tournament
  if(currentOpponentIndex >= remainingOpponents.length){
    showResult();
    return;
  }

  clearContainer();

  const label = renderTournamentLabel();
  const opponentIdx = remainingOpponents[currentOpponentIndex];

  const heading = document.createElement('h2');
  heading.textContent = `Cheer for ${players[currentChoice]} or ${players[opponentIdx]}`;

  const choices = document.createElement('div');
  choices.className = 'choices';

  const left = createChoiceButton(players[currentChoice], currentChoice);
  left.id = 'choice-left';
  const right = createChoiceButton(players[opponentIdx], opponentIdx);
  right.id = 'choice-right';

  choices.appendChild(left);
  choices.appendChild(right);

  container.appendChild(label);
  container.appendChild(heading);
  container.appendChild(choices);

  highlightCurrentChoice();
}

/* --- User picks a player (by index) --- */
function choosePlayer(choiceIndex){
  // log the selection as the player's name
  quizPath.push(players[choiceIndex]);

  // update sticky choice to whatever was chosen
  currentChoice = choiceIndex;

  // visually highlight immediately
  highlightCurrentChoice();

  // increment opponent pointer and proceed (small delay keeps highlight visible)
  currentOpponentIndex++;
  setTimeout(showNextQuestion, 200);
}

/* --- Highlight currently sticky choice button --- */
function highlightCurrentChoice(){
  // remove selected class from any existing .choice
  const all = container.querySelectorAll('.choice');
  all.forEach(el => el.classList.remove('selected'));

  // find left/right by id (if present)
  const left = document.getElementById('choice-left');
  const right = document.getElementById('choice-right');

  if(currentChoice === null){
    // nothing chosen yet — no highlight
    return;
  }

  // If left exists and its data-index or text equals the chosen index/name, select it.
  // We stored idx with dataset.index on creation.
  if(left && left.dataset && left.dataset.index === String(currentChoice)){
    left.classList.add('selected');
  }
  if(right && right.dataset && right.dataset.index === String(currentChoice)){
    right.classList.add('selected');
  }
}

/* --- Determine top players for a tournament (returns array of names) --- */
function getTopPlayers(){
  const freq = {};
  quizPath.forEach(name => { freq[name] = (freq[name] || 0) + 1; });

  let max = 0;
  Object.keys(freq).forEach(k => { if(freq[k] > max) max = freq[k]; });

  const top = Object.keys(freq).filter(k => freq[k] === max);
  return top;
}

/* --- Show result or tie-breaker choices --- */
function showResult(){
  clearContainer();

  const topPlayers = getTopPlayers();

  // if there are no selections (shouldn't happen) pick currentChoice if present
  if(topPlayers.length === 0 && currentChoice !== null){
    topPlayers.push(players[currentChoice]);
  }

  // If single winner
  if(topPlayers.length === 1){
    if(tournament === 'Men') menWinner = topPlayers[0];
    else womenWinner = topPlayers[0];

    completedTournaments[tournament] = true;
    proceedAfterTournament();
    return;
  }

  // Tie-breaker: ask user to choose between topPlayers
  const label = renderTournamentLabel();
  const title = document.createElement('h2');
  title.textContent = 'Tie! Choose your favorite player:';

  const choices = document.createElement('div');
  choices.className = 'choices';

  topPlayers.forEach(name => {
    const btn = document.createElement('div');
    btn.className = 'choice';
    btn.textContent = name;
    btn.onclick = () => chooseTieBreaker(name);
    choices.appendChild(btn);
  });

  container.appendChild(label);
  container.appendChild(title);
  container.appendChild(choices);
}

/* --- Tie-breaker selection --- */
function chooseTieBreaker(playerName){
  if(tournament === 'Men') menWinner = playerName;
  else womenWinner = playerName;

  completedTournaments[tournament] = true;
  proceedAfterTournament();
}

/* --- After finishing one tournament, decide next step --- */
function proceedAfterTournament(){
  // If the other tournament is not completed, start it.
  if(!completedTournaments.Men){
    tournament = 'Men';
    players = menPlayers.slice();
    startTournament();
    return;
  }
  if(!completedTournaments.Women){
    tournament = 'Women';
    players = womenPlayers.slice();
    startTournament();
    return;
  }

  // Both complete -> show final screen
  showFinalScreen();
}

/* helper start of tournament when orchestrated by proceedAfterTournament */
function startTournament(){
  quizPath = [];
  currentChoice = null;
  remainingOpponents = opponentPath.slice();
  currentOpponentIndex = 0;
  showFirstQuestion();
}

/* --- Final screen: show winners and entry button --- */
function showFinalScreen(){
  clearContainer();

  const title = document.createElement('h2');
  title.textContent = 'Your Champions!';

  const results = document.createElement('div');
  results.className = 'results';

  const menP = document.createElement('p');
  menP.textContent = `Men's Tournament: ${menWinner || '—'}`;

  const womenP = document.createElement('p');
  womenP.textContent = `Women's Tournament: ${womenWinner || '—'}`;

  results.appendChild(menP);
  results.appendChild(womenP);

  const info = document.createElement('div');
  info.className = 'small';
  info.textContent = 'Now submit your details for a chance at a prize!';

  const formLink = document.createElement('a');
  formLink.className = 'btn';
  formLink.textContent = 'Submit Entry';
  formLink.href = 'YOUR_FORM_LINK_HERE'; // replace with real form URL
  formLink.target = '_blank';
  formLink.rel = 'noopener noreferrer';

  container.appendChild(title);
  container.appendChild(results);
  container.appendChild(info);
  container.appendChild(formLink);
}

/* --- Boot: initial screen --- */
renderTournamentSelector();

/* Export a couple helpers to console for testing (optional) */
window._AOQuiz = {
  renderTournamentSelector,
  startQuiz,
  showFinalScreen,
  getState: () => ({tournament, menWinner, womenWinner, completedTournaments})
};
