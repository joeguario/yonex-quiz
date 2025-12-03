// --- Players ---
const menPlayers = ['Liam Novak','Ethan Rivera','Noah Chen','Mason Silva','Lucas Patel','Oliver Kim'];
const womenPlayers = ['Ava Rossi','Sophia Zhang','Isabella Torres','Mia Johnson','Amelia Lee','Charlotte Brown'];
const opponentPath = [1,2,3,4,5];

// --- State ---
let tournament = '';
let players = [];
let quizPath = [];
let currentChoice = null;
let remainingOpponents = [];
let currentOpponentIndex = 0;

let menWinner = '';
let womenWinner = '';
let completedTournaments = { Men:false, Women:false };

const container = document.getElementById('quiz-container');

// --- Helpers ---
function clearContainer(){
  container.style.opacity = 0;
  setTimeout(()=>{container.innerHTML=''; container.style.opacity=1;},200);
}

// --- Render tournament label ---
function renderTournamentLabel(){
  const p = document.createElement('p');
  p.id = 'tournament-label';
  p.textContent = `Current Tournament: ${tournament}`;
  return p;
}

// --- Create choice button ---
function createChoiceButton(name, idx){
  const btn = document.createElement('div');
  btn.className = 'choice';
  btn.textContent = name;
  btn.dataset.index = idx;
  btn.onclick = ()=>choosePlayer(idx);
  return btn;
}

// --- Page title as back to start ---
function renderTitle(){
  const title = document.createElement('h1');
  title.textContent = 'Australian Open 2026';
  title.onclick = renderTournamentSelector;
  return title;
}

// --- Tournament selector ---
function renderTournamentSelector(){
  container.innerHTML='';
  const title = renderTitle();
  const choices = document.createElement('div');
  choices.className='choices';

  const menBtn = document.createElement('div');
  menBtn.className='choice';
  menBtn.textContent="Men's Tournament";
  menBtn.onclick=()=>startQuiz('Men');

  const womenBtn = document.createElement('div');
  womenBtn.className='choice';
  womenBtn.textContent="Women's Tournament";
  womenBtn.onclick=()=>startQuiz('Women');

  choices.appendChild(menBtn);
  choices.appendChild(womenBtn);
  container.appendChild(title);
  container.appendChild(choices);
}

// --- Quiz functions ---
function startQuiz(type){
  tournament = type;
  players = (type==='Men')? menPlayers.slice(): womenPlayers.slice();
  quizPath = [];
  currentChoice = null;
  remainingOpponents = opponentPath.slice();
  currentOpponentIndex = 0;
  showFirstQuestion();
}

function showFirstQuestion(){
  container.innerHTML='';
  const title = renderTitle();
  const label = renderTournamentLabel();
  const heading = document.createElement('h2');
  heading.textContent = `Cheer for ${players[0]} or ${players[1]}`;

  const choices = document.createElement('div'); choices.className='choices';
  const left = createChoiceButton(players[0],0); left.id='choice-left';
  const right = createChoiceButton(players[1],1); right.id='choice-right';
  choices.appendChild(left); choices.appendChild(right);

  container.appendChild(title);
  container.appendChild(label);
  container.appendChild(heading);
  container.appendChild(choices);
  highlightCurrentChoice();
}

function showNextQuestion(){
  if(currentOpponentIndex>=remainingOpponents.length){ showResult(); return; }

  container.innerHTML='';
  const title = renderTitle();
  const label = renderTournamentLabel();
  const opponentIdx = remainingOpponents[currentOpponentIndex];
  const heading = document.createElement('h2');
  heading.textContent = `Cheer for ${players[currentChoice]} or ${players[opponentIdx]}`;

  const choices = document.createElement('div'); choices.className='choices';
  const left = createChoiceButton(players[currentChoice], currentChoice); left.id='choice-left';
  const right = createChoiceButton(players[opponentIdx], opponentIdx); right.id='choice-right';
  choices.appendChild(left); choices.appendChild(right);

  container.appendChild(title);
  container.appendChild(label);
  container.appendChild(heading);
  container.appendChild(choices);
  highlightCurrentChoice();
}

function choosePlayer(idx){
  quizPath.push(players[idx]);
  currentChoice = idx;
  highlightCurrentChoice();
  currentOpponentIndex++;
  setTimeout(showNextQuestion, 200);
}

function highlightCurrentChoice(){
  const all = container.querySelectorAll('.choice');
  all.forEach(el=>el.classList.remove('selected'));
  const left = document.getElementById('choice-left');
  const right = document.getElementById('choice-right');
  if(currentChoice===null) return;
  if(left && left.dataset.index===String(currentChoice)) left.classList.add('selected');
  if(right && right.dataset.index===String(currentChoice)) right.classList.add('selected');
}

function getTopPlayers(){
  const freq={};
  quizPath.forEach(p=>freq[p]=(freq[p]||0)+1);
  let max=0; for(const k in freq) if(freq[k]>max) max=freq[k];
  return Object.keys(freq).filter(k=>freq[k]===max);
}

function showResult(){
  const top = getTopPlayers();
  if(top.length===1){
    if(tournament==='Men') menWinner=top[0]; else womenWinner=top[0];
    completedTournaments[tournament]=true;
    proceedAfterTournament();
    return;
  }
  // tie-breaker
  container.innerHTML='';
  const title = renderTitle();
  const label = renderTournamentLabel();
  const heading = document.createElement('h2');
  heading.textContent='Tie! Choose your favorite player:';
  const choices = document.createElement('div'); choices.className='choices';
  top.forEach(p=>{
    const btn = document.createElement('div'); btn.className='choice'; btn.textContent=p;
    btn.onclick=()=>chooseTieBreaker(p); choices.appendChild(btn);
  });
  container.appendChild(title);
  container.appendChild(label);
  container.appendChild(heading);
  container.appendChild(choices);
}

function chooseTieBreaker(player){
  if(tournament==='Men') menWinner=player; else womenWinner=player;
  completedTournaments[tournament]=true;
  proceedAfterTournament();
}

function proceedAfterTournament(){
  if(!completedTournaments.Men){ tournament='Men'; players=menPlayers.slice(); startTournament(); return; }
  if(!completedTournaments.Women){ tournament='Women'; players=womenPlayers.slice(); startTournament(); return; }
  showFinalScreen();
}

function startTournament(){
  quizPath=[]; currentChoice=null; remainingOpponents=opponentPath.slice(); currentOpponentIndex=0;
  showFirstQuestion();
}

function showFinalScreen(){
  container.innerHTML='';
  const title = renderTitle();
  const heading = document.createElement('h2'); heading.textContent='Your Champions!';
  const results = document.createElement('div'); results.className='results';
  const menP = document.createElement('p'); menP.textContent=`Men's Tournament: ${menWinner||'—'}`;
  const womenP = document.createElement('p'); womenP.textContent=`Women's Tournament: ${womenWinner||'—'}`;
  results.appendChild(menP); results.appendChild(womenP);
  const info = document.createElement('div'); info.className='small'; info.textContent='Now submit your details for a chance at a prize!';
  const formLink = document.createElement('a'); formLink.className='btn'; formLink.textContent='Submit Entry';
  formLink.href='YOUR_FORM_LINK_HERE'; formLink.target='_blank'; formLink.rel='noopener noreferrer';

  container.appendChild(title);
  container.appendChild(heading);
  container.appendChild(results);
  container.appendChild(info);
  container.appendChild(formLink);
}

// --- Start ---
renderTournamentSelector();
