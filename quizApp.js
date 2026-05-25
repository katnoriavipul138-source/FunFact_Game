const firebaseConfig = {
  apiKey: "AIzaSyCKctw55Mcmbq1PMZBNYOTj_FIvyvZKNso",
  authDomain: "quiz-app-70174.firebaseapp.com",
  projectId: "quiz-app-70174",
  storageBucket: "quiz-app-70174.firebasestorage.app",
  messagingSenderId: "543552001522",
  appId: "1:543552001522:web:7ee4ac8b9a540921b8476b",
  measurementId: "G-071PLDBRFK"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let timerInterval = null;
        // --- GAME DATA & STATE ---
        const GK_SUBJECTS = {
            zoology: { name: "Zoology", desc: "Animals & wildlife", icon: "🦁" },
            botany: { name: "Botany", desc: "Plants & nature", icon: "🌿" },
            biology: { name: "Biology", desc: "Life & systems", icon: "🧬" },
            anatomy: { name: "Anatomy", desc: "Human body", icon: "🫀" },
            chemistry: { name: "Chemistry", desc: "Elements & atoms", icon: "🧪" },
            physics: { name: "Physics", desc: "Forces & energy", icon: "⚡" },
            technology: { name: "Technology", desc: "Tech & innovation", icon: "💻" },
            history: { name: "History", desc: "Past & events", icon: "🏛️" },
            geography: { name: "Geography", desc: "Earth & maps", icon: "🌍" },
            civics: { name: "Civics", desc: "Rights & duties", icon: "⚖️" },
            environment: { name: "Environment", desc: "Nature & climate", icon: "🌳" },
            spacescience: { name: "Space Science", desc: "Stars & cosmos", icon: "🚀" },
            astrology: { name: "Astrology", desc: "Signs & stars", icon: "♈" }
        };

        let currentState = {
            user: {
    name: "Guest Player",
    email: null,
    points: 0,
    coins: 0,
    avatar: "👤",
unlockedAvatars: ["default"],

    dailyLogin: {
        lastClaimDate: null,
        streak: 0,
        claimedDays: []
    },

    levelsCompleted: {},
    loggedIn: false
},
            category: null,
            difficulty: null,
            level: null,
            score: 0,
            correctPoints: 0,
            wrongPoints: 0,
            hintPenalty: 0,
            questionIndex: 0,
            timer: 60,
            timerInterval: null

        };

        const CATEGORIES = {
            brain: { name: "Brain Quiz", icon: "🧠" },
            speed: { name: "Speed Round", icon: "⚡" },
            gk: { name: "GK Quiz", icon: "🌍" },
            news: { name: "Current Affairs", icon: "📰" },
            enigma: { name: "Enigma", icon: "🧩" },
            funfact: { name:"FunFact",icon:"🤷"}
        };

async function getQuestions(cat, diff, level) {
    console.log("LEVEL CHECK", level);
    let query = db.collection("questions")
        .where("level", "==", level);
    // GK case
    if (cat === "gk") {
        query = query.where("subject", "==", currentState.gkSubject);
    } else {
        query = query
            .where("category", "==", cat)
            .where("difficulty", "==", diff);
    }
    const snapshot = await query.get();
    let questions = [];
    snapshot.forEach(doc => questions.push(doc.data()));
   questions = shuffleArray(questions);
    questions = shuffleArray(questions);
return questions.slice(0, 5);
}

        const DUMMY_LEADERBOARD = [];
        const AVATARS = [

{
    id: "default",
    emoji: "👤",
    name: "Default",
    price: 0
},

{
    id: "robot",
    emoji: "🤖",
    name: "Robot",
    price: 200
},

{
    id: "alien",
    emoji: "👽",
    name: "Alien",
    price: 350
},

{
    id: "devil",
    emoji: "😈",
    name: "Devil",
    price: 500
},

{
    id: "ghost",
    emoji: "👻",
    name: "Ghost",
    price: 800
},

{
    id: "king",
    emoji: "👑",
    name: "King",
    price: 1200
},

{
    id: "dragon",
    emoji: "🐉",
    name: "Dragon",
    price: 1500
},

{
    id: "phoenix",
    emoji: "🔥",
    name: "Phoenix",
    price: 2000
},

{
    id: "ninja",
    emoji: "🥷",
    name: "Ninja",
    price: 2500
},

{
    id: "superhero",
    emoji: "🦸",
    name: "Superhero",
    price: 3000
}

];

        // === THEMES DATA ===
        const THEMES = [
            {
                id: "default",
                name: "Cyber Nova",
                icon: "🌀",
                rarity: "Default",
                price: 0,
                primary: "#00f2ff",
                secondary: "#bc13fe",
                accent: "#ff00de"
            },
            {
                id: "inferno",
                name: "Inferno",
                icon: "🔥",
                rarity: "Rare",
                price: 1000,
                primary: "#ff6b35",
                secondary: "#ff0000",
                accent: "#ffaa00"
            },
            {
                id: "ocean",
                name: "Ocean",
                icon: "🌊",
                rarity: "Rare",
                price: 2000,
                primary: "#00bfff",
                secondary: "#0077be",
                accent: "#00d4ff"
            },
            {
                id: "galaxy",
                name: "Galaxy",
                icon: "🌌",
                rarity: "Epic",
                price: 3500,
                primary: "#9d4edd",
                secondary: "#e0aaff",
                accent: "#ff006e"
            },
            {
                id: "neon-storm",
                name: "Neon Storm",
                icon: "⚡",
                rarity: "Epic",
                price: 5000,
                primary: "#00ffff",
                secondary: "#0099ff",
                accent: "#ff00ff"
            },
            {
                id: "royal-gold",
                name: "Royal Gold",
                icon: "👑",
                rarity: "Legendary",
                price: 7000,
                primary: "#ffd700",
                secondary: "#ffed4e",
                accent: "#ffa500"
            },
            {
                id: "shadow-reaper",
                name: "Shadow Reaper",
                icon: "💀",
                rarity: "Legendary",
                price: 10000,
                primary: "#ff1493",
                secondary: "#8b0000",
                accent: "#ff0000"
            }
        ];

        // --- CORE FUNCTIONS ---
        function init() {
            checkAuth();
            createParticles();
            currentState.user = {
  name: "Guest Player",
  email: null,
  points: 0,
  coins: 0,
  avatar: "👤",
unlockedAvatars: ["default"],

  dailyLogin: {
      lastClaimDate: null,
      streak: 0,
      claimedDays: []
  },

  levelsCompleted: {},
  ownedThemes: ["default"],
  selectedTheme: "default",
  loggedIn: false
};
            updateSidebar();
            renderDailyRewardsGrid();
            renderLeaderboard();
            cleanupOldRooms();
            function applyTheme(themeId){
    console.log("Theme Applied:", themeId);
}

        }

        function createParticles() {
            const container = document.getElementById('particles');
            container.innerHTML = '';
            for (let i = 0; i < 20; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.left = Math.random() * 100 + '%';
                p.style.top = Math.random() * 100 + '%';
                p.style.animationDuration = (Math.random() * 5 + 5) + 's';
                p.style.animationDelay = Math.random() * 5 + 's';
                container.appendChild(p);
            }
        }

function showScreen(screenId) {
    if (screenId === 'multiplayer-screen' && !currentState.user.loggedIn) {
        showPopup(
            'SIGN IN REQUIRED',
            'Please sign in or sign up first to play Multiplayer.'
        );
        showScreen('signup-screen');
        return;
    }

    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.scrollTop = 0;
    });
    document.getElementById(screenId).classList.add('active');
    if(screenId === 'rewards-screen'){
    renderDailyRewardsGrid();
}
    if(screenId === "multiplayer-screen"){
document.getElementById(
'multiplayer-main-options'
).style.display = 'grid';
document.getElementById(
'mp-category-selector'
).style.display = 'none';
document.getElementById(
'mp-subject-selector'
).style.display = 'none';
document.getElementById(
'mp-difficulty-selector'
).style.display = 'none';
document.getElementById(
'room-code-display'
).style.display = 'none';
document.getElementById(
'join-room-container'
).style.display = 'none';
}

    if (screenId === 'levels-screen') {
        renderLevels();
    }
    if (screenId === 'leaderboard-screen') {
        renderLeaderboard();
    }

    closeSidebar();
}

       function toggleSidebar() {
    if (document.getElementById('quiz-screen').classList.contains('active')) return;
    document.getElementById('sidebar').classList.toggle('open');
}

        function closeSidebar() {
            document.getElementById('sidebar').classList.remove('open');
        }

        function updateSidebar() {
            const user = currentState.user;
            document.getElementById("top-coins").innerText = user.coins || 0;
            document.getElementById('sidebar-username').innerText = user.name || "Guest Player";
            document.getElementById('sidebar-points').innerText = user.points;
            
            let completedCount = 0;
            for (let cat in user.levelsCompleted) {
                if (cat === 'gk_subjects') {
                    for (let subId in user.levelsCompleted[cat]) {
                        completedCount += Object.keys(user.levelsCompleted[cat][subId]).length;
                    }
                } else {
                    for (let diff in user.levelsCompleted[cat]) {
                        completedCount += Object.keys(user.levelsCompleted[cat][diff]).length;
                    }
                }
            }
            document.getElementById('sidebar-levels').innerText = completedCount;
            document.getElementById(
'sidebar-avatar'
).innerText =
user.avatar || "👤";

          let rank = "Bronze";
if (user.points >= 12000)
    rank = "Grandmaster";
else if (user.points >= 9000)
    rank = "Master";
else if (user.points >= 7000)
    rank = "Heroic";
else if (user.points >= 5000)
    rank = "Diamond";
else if (user.points >= 3200)
    rank = "Platinum";
else if (user.points >= 1800)
    rank = "Gold";
else if (user.points >= 800)
    rank = "Silver";
            document.getElementById('sidebar-rank').innerText = rank;
            if (user.loggedIn) {
                document.getElementById('auth-buttons').style.display = 'none';
                document.getElementById('user-buttons').style.display = 'flex';
                document.getElementById('delete-account-button').style.display = 'flex';
            } else {
                document.getElementById('auth-buttons').style.display = 'flex';
                document.getElementById('user-buttons').style.display = 'none';
                document.getElementById('delete-account-button').style.display = 'none';
            }
        }

 function signup() {
    const btn = document.querySelector('#signup-screen .btn');
    btn.innerText = "CREATING...";
    btn.disabled = true;
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-pass').value;
    const confirm = document.getElementById('signup-pass-confirm').value;

    if (!name || !email || !pass)
        return alert("Please fill all fields.");

    if (pass !== confirm)
        return alert("Passwords do not match.");

    firebase.auth()
    .createUserWithEmailAndPassword(email, pass)

    .then(async (cred) => {
       btn.innerText = "CREATE ACCOUNT";
       btn.disabled = false;
        await db.collection("users")
        .doc(cred.user.uid)
   .set({
    name: name,
    email: email,
    points: 0,
    coins: 0,
    avatar: "👤",
unlockedAvatars: ["default"],

    dailyLogin: {
        lastClaimDate: null,
        streak: 0,
        claimedDays: []
    },

    levelsCompleted: {},
    createdAt: new Date()
});

        currentState.user = {
            name,
            email,
            points: 0,
            levelsCompleted: {},
            loggedIn: true
        };

        updateSidebar();

        showPopup(
            "WELCOME",
            `Hi ${name}! Account created 😈`
        );

        showScreen('dashboard-screen');
        clearAuthInputs();
    })

   .catch(err => {

btn.innerText = "CREATE ACCOUNT";
btn.disabled = false;

if(err.code === "auth/email-already-in-use"){

alert("Email already registered 😈");

}

else if(err.code === "auth/invalid-email"){

alert("Invalid email format 😢");

}

else if(err.code === "auth/weak-password"){

alert("Password must be at least 6 characters 💀");

}

else{

alert("Signup failed 😢");

}

});
}
function signin() {
    const btn = document.querySelector('#signin-screen .btn');

    btn.innerText = "LOGGING IN...";
    btn.disabled = true;
    const email = document.getElementById('signin-email').value;
    const pass = document.getElementById('signin-pass').value;

    if (!email || !pass)
        return alert("Please fill all fields.");

    firebase.auth()
    .signInWithEmailAndPassword(email, pass)

    .then(async (cred) => {

        const doc = await db.collection("users")
        .doc(cred.user.uid)
        .get();

        const data = doc.data();

        currentState.user = {
    name: data.name,
    email: data.email,
    points: data.points || 0,
    coins: data.coins || 0,
    avatar:
data.avatar || "👤",

unlockedAvatars:
data.unlockedAvatars || ["default"],
    levelsCompleted: data.levelsCompleted || {},

    dailyLogin: data.dailyLogin || {
        lastClaimDate: null,
        streak: 0,
        claimedDays: []
    },

    loggedIn: true
};

        updateSidebar();
        btn.innerText = "LOGIN";
        btn.disabled = false;
        showPopup(
            "WELCOME BACK",
            `Hi ${data.name} 😈`
        );

        showScreen('dashboard-screen');
        clearAuthInputs();
    })

.catch(err => {

btn.innerText = "LOGIN";
btn.disabled = false;

if(
err.code ===
"auth/user-not-found"
){

alert("Account not found 😢");

}

else if(
err.code ===
"auth/wrong-password"
){

alert("Wrong password 💀");

}

else if(
err.code ===
"auth/invalid-email"
){

alert("Invalid email 😈");

}

else if(
err.code ===
"auth/invalid-credential"
){

alert("Wrong email or password 😈");

}

else{

alert("Login failed 😢");

}

});
}
function logout() {

    firebase.auth().signOut();

    currentState.user = {
    name: "Guest Player",
    email: null,
    points: 0,
    coins: 0,
    avatar: "👤",
unlockedAvatars: ["default"],

    dailyLogin: {
        lastClaimDate: null,
        streak: 0,
        claimedDays: []
    },

    levelsCompleted: {},
    loggedIn: false
};

    updateSidebar();

    showScreen('dashboard-screen');
    clearAuthInputs();
}
async function deleteAccount() {

if (!confirm(
"Are you sure you want to delete account?"
)) return;

try {

const user =
firebase.auth().currentUser;

if (!user) {
alert("No user found");
return;
}

const uid = user.uid;

// 🔥 firestore delete
await db.collection("users")
.doc(uid)
.delete();

// 🔥 auth delete
await user.delete();

// 🔥 logout state
currentState.user = {

name: "Guest Player",
email: null,
points: 0,
coins: 0,
avatar: "👤",
unlockedAvatars: ["default"],
levelsCompleted: {},
loggedIn: false

};

updateSidebar();

showScreen("dashboard-screen");

alert("Account deleted 😈🔥");

}

catch(err){

console.log(err);

if(
err.code ===
"auth/requires-recent-login"
){

alert(
"Please login again before deleting account 😈"
);

}

else{

alert(err.message);

}

}
}

        // --- NAVIGATION & SELECTION ---

function selectCategory(cat) {

    if (cat === "news") {
        showScreen('news-screen');
        loadNews(); // 👈 call API
        return;
    }

    currentState.category = cat;
    currentState.gkSubject = null;
    currentState.difficulty = null;

    if (cat === 'gk') {
        renderSubjects();
        showScreen('subjects-screen');
    } else {
        showScreen('difficulty-screen');
    }
}

        function renderSubjects() {
            const grid = document.getElementById('subjects-grid');
            grid.innerHTML = '';
            
            for (let id in GK_SUBJECTS) {
                const sub = GK_SUBJECTS[id];
                const completed = (currentState.user.levelsCompleted['gk_subjects']?.[id]) || {};
                const count = Object.keys(completed).length;
                
                let status = "Not started";
                let statusColor = "rgba(255, 255, 255, 0.4)";
                if (count >= 10) {
                    status = "Completed";
                    statusColor = "#4CAF50";
                } else if (count > 0) {
                    status = "In Progress";
                    statusColor = "var(--neon-cyan)";
                }

                const card = document.createElement('div');
                card.className = 'subject-card';
                card.style.cssText = `
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: 0.3s;
                    position: relative;
                `;
                card.innerHTML = `
                    <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px;">
                        <div style="font-size: 30px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px;">${sub.icon}</div>
                        <div>
                            <h3 style="margin: 0; font-size: 18px; color: white;">${sub.name}</h3>
                            <p style="margin: 3px 0 0 0; font-size: 11px; opacity: 0.5;">${sub.desc}</p>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                        <span style="font-size: 11px; opacity: 0.7;">10 Levels</span>
                        <span style="font-size: 10px; padding: 2px 8px; border-radius: 4px; background: ${statusColor}1A; color: ${statusColor}; border: 1px solid ${statusColor}4D;">${status}</span>
                    </div>
                `;
                card.onclick = () => selectSubject(id);
                grid.appendChild(card);
            }
        }

  window.selectSubject = function(subId) {
    currentState.gkSubject = subId;
    currentState.difficulty = null;

    console.log("Selected SUBJECT:", subId);

    showScreen('levels-screen');
}

window.selectDifficulty = function(diff) {
    currentState.difficulty = diff;

    console.log("Selected DIFF:", diff); // debug

    showScreen('levels-screen');
}

        function renderLevels() {
            const container = document.getElementById('level-container');
            container.innerHTML = '';
            
            const cat = currentState.category;
            const diff = currentState.difficulty;
            const sub = currentState.gkSubject;
            
            let title = CATEGORIES[cat].name;
            if (sub) title += ` / ${GK_SUBJECTS[sub].name}`;
            else if (diff) title += ` / ${diff.toUpperCase()}`;
            
            document.querySelector('#levels-screen .section-title').innerHTML = `SELECT <span>LEVEL</span><br><small style="font-size: 12px; opacity: 0.6; letter-spacing: 2px;">${title}</small>`;

            const completed = sub 
                ? (currentState.user.levelsCompleted['gk_subjects']?.[sub] || {})
                : (currentState.user.levelsCompleted[cat]?.[diff] || {});
            
            const totalLevels = 10;
            const maxAvailableLevel = 7;
            
            for (let i = 1; i <= totalLevels; i++) {
                const node = document.createElement('div');
const isUnlocked =
(
    i <= maxAvailableLevel
)
&&
(
    i === 1 ||
    (
        completed[String(i - 1)] &&
        completed[String(i - 1)] >= 3
    )
);
                
                node.className = `level-node ${isUnlocked ? 'unlocked' : 'locked'}`;
                node.innerText = i;
                
                if (isUnlocked) {
                    node.onclick = () => startQuiz(i);
                }
                container.appendChild(node);
            }
        }

        // --- QUIZ LOGIC ---
        
let roomListener = null;
        let currentQuestions = [];
         let isMultiplayer = false;
        let multiplayerRoomCode = "";
        let multiplayerStarted = false;
window.addEventListener(
'beforeunload',

async ()=>{

await handlePlayerDisconnect();

await deleteRoomIfHost();

}
);
console.log("CAT:", currentState.category);
console.log("DIFF:", currentState.difficulty);

async function startQuiz(level) {
console.log("LEVEL:", level);
    // 🔹 Guest check
    let completedTotal = 0;
    const lc = currentState.user.levelsCompleted;

    for (let c in lc) {
        for (let d in lc[c]) {
            completedTotal += Object.keys(lc[c][d]).length;
        }
    }

    if (!currentState.user.loggedIn && completedTotal >= 3) {
        showPopup("ACCESS DENIED", "You've finished 3 levels as a guest");
        showScreen('signup-screen');
        return;
    }

    // 🔥 Firebase se questions lao
    currentQuestions = await getQuestions(
        currentState.category,
        currentState.difficulty,
        level
    );
console.log(currentQuestions);
    // ❌ agar kuch nahi mila
if (currentQuestions.length === 0) {

    showPopup(
        "COMING SOON 🚧",
        "Next levels are coming soon 😈"
    );

    return;
}

    // 🔹 state set
    currentState.level = level;
    currentState.score = 0;
    currentState.questionIndex = 0;
    currentState.correctPoints = 0;
    currentState.wrongPoints = 0;
    currentState.hintPenalty = 0;

    currentState.levelAlreadyCompleted = false;
    if (currentState.category === "gk") {
        currentState.levelAlreadyCompleted = !!currentState.user.levelsCompleted?.gk_subjects?.[currentState.gkSubject]?.[level];
    } else {
        currentState.levelAlreadyCompleted = !!currentState.user.levelsCompleted?.[currentState.category]?.[currentState.difficulty]?.[level];
    }

    console.log("Loaded Questions:", currentQuestions); // debug

    // 🔹 start quiz
    showScreen('quiz-screen');
    loadQuestion();
    startTimer();
}

function loadQuestion() {
    const q = currentQuestions[currentState.questionIndex];
let topLabel = currentState.category;

// 🔥 GK subject name
if(currentState.category === "gk" && currentState.gkSubject){

    topLabel =
    GK_SUBJECTS[currentState.gkSubject].name;

}

// 🔥 non-GK difficulty
if(
    currentState.category !== "gk"
    &&
    currentState.difficulty
){

    topLabel +=
    " • " +
    currentState.difficulty;

}

document.getElementById("quizCategory").innerText =
topLabel.toUpperCase();

currentState.hintUsed = false;
    document.getElementById('quiz-progress').innerText = `Q${currentState.questionIndex + 1} / 5`;
    document.getElementById('question-text').innerHTML =
        `<span style="color: var(--neon-cyan); font-family: var(--f-display);">
        QUES ${currentState.questionIndex + 1}:</span> ${q.text}`;

    const optionsBox = document.getElementById('options-container');
    optionsBox.innerHTML = '';

    // 🔥 STEP A: attach correct flag
    let options = q.options.map((opt, index) => ({
        text: opt,
        isCorrect: index === q.correct
    }));

    // 🔥 STEP B: shuffle options
 options = shuffleArray(options);
        // 🔥 HINT RESET + SHOW LOGIC
document.getElementById("hintBox").style.display = "none";
document.getElementById("hintBox").innerText = "";
document.getElementById("hintBtn").disabled = false;

// 👇 ONLY show hint outside multiplayer and for Enigma/FunFact
const showHintButton = !isMultiplayer && (currentState.category === "enigma" || currentState.category === "funfact");
document.getElementById("hintBtn").style.display = showHintButton ? "block" : "none";

const timeShop = document.getElementById("time-shop");
if (timeShop) {
    timeShop.style.display = isMultiplayer ? "none" : "flex";
}
    // 🔥 STEP C: render
    options.forEach((opt, idx) => {
        const btn = document.createElement('div');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.dataset.correct = opt.isCorrect;
        btn.onclick = () => checkAnswer(opt.isCorrect, btn, optionsBox);

        optionsBox.appendChild(btn);
    });
}

function checkAnswer(isCorrect, btn, optionsBox) {

    const allBtn = optionsBox.querySelectorAll(".option-btn");

    // disable all buttons
    allBtn.forEach((b) => {
        b.style.pointerEvents = "none";
    });

    // ✅ CORRECT
    if (isCorrect) {

        btn.classList.add("correct");

        currentState.score++;

        // 🔥 add points
        const earned = calculatePoints(true);

        currentState.correctPoints += earned;

        if (!isMultiplayer && !currentState.levelAlreadyCompleted) {
            currentState.user.points += earned;
            updateSidebar();
            saveCurrentUser();
        }

    }

    // ❌ WRONG
    else {

        btn.classList.add("incorrect");

        // 🔥 deduct points
        const lost = calculatePoints(false);

        currentState.wrongPoints += Math.abs(lost);

        if (!isMultiplayer && !currentState.levelAlreadyCompleted) {
            currentState.user.points += lost;

            // 💀 prevent negative
            if (currentState.user.points < 0) {
                currentState.user.points = 0;
            }

            updateSidebar();
            saveCurrentUser();
        }

        // 🔥 show correct answer
        allBtn.forEach((b) => {

            if (b.dataset.correct === "true") {

                b.classList.add("correct");

            }

        });

    }

    // next question
    setTimeout(() => {

        currentState.questionIndex++;

        if (currentState.questionIndex < currentQuestions.length) {

            loadQuestion();

        }

        else {

            finishQuiz();

        }

    }, 1000);

}

function startTimer() {
    clearInterval(timerInterval); // 🔥 purana band

    // ⚡ SPEED MODE
if(currentState.category === "speed"){

    currentState.timer = 20;
}

// 🌍 ALL OTHER MODES
else{

    currentState.timer = 40;
}

    const timerEl = document.getElementById("timer");
    timerEl.innerText = currentState.timer;

    timerInterval = setInterval(() => {
        
        currentState.timer--;
        timerEl.innerText = currentState.timer;

        if (currentState.timer <= 0) {
            clearInterval(timerInterval); // 🔥 stop
            finishQuiz();
        }
    }, 1000);
}

        async function finishQuiz() {
if(isMultiplayer){

clearInterval(timerInterval);

const usedTime = 60 - currentState.timer;

const roomRef = db.collection("rooms")
.doc(multiplayerRoomCode);

const roomSnap = await roomRef.get();
const roomData = roomSnap.data();

// 🔥 save player result
await roomRef.collection("results")
.doc(currentState.user.name)
.set({

name: currentState.user.name,

score: currentState.score,

time: usedTime

});

// 🔥 wait for both players
const snap = await roomRef
.collection("results")
.get();

if(snap.size < 2){

showPopup(
"WAITING 😈",
"Waiting for opponent..."
);

// 🔥 realtime wait
const unsubscribe = roomRef
.collection("results")
.onSnapshot(async (snapshot)=>{

if(snapshot.size >= 2){

unsubscribe();

closePopup();

let players = [];

snapshot.forEach(doc=>{

players.push(doc.data());

});

// 🔥 winner sort
players.sort((a,b)=>{

if(b.score !== a.score){

return b.score - a.score;

}

return a.time - b.time;

});

const winner = players[0];
// 💰 PAID ROOM WIN REWARD

let totalPrize = 0;

if(roomData.roomType === "paid"){

totalPrize = roomData.betCoins * 2;

// 🔥 latest room data
const latestRoom =
(await roomRef.get()).data();

// 🏆 only winner gets reward
if(
winner.name === currentState.user.name
){

// 🛡️ anti duplicate payout
if(!latestRoom.payoutDone){

await roomRef.update({
payoutDone: true
});

currentState.user.coins += totalPrize;

updateSidebar();

await saveCurrentUser();

showPopup(
"YOU WON 😈🔥",
`You received ${totalPrize} coins`
);

}

}

}

showScreen('result-screen');

document.getElementById(
'result-status'
).innerText =
`🏆 ${winner.name} WINS`;

document.getElementById(
'result-msg'
).innerText =
`Your Score: ${currentState.score}/5`;

document.getElementById(
'result-score'
).innerText =
`${usedTime}s`;

document.getElementById(
'result-score'
).style.color =
"gold";

document.getElementById(
'next-btn'
).style.display = "none";
const backBtn = document.querySelector(
'#result-screen .btn-outline'
);

backBtn.innerText = "BACK TO HOME";

backBtn.onclick = async ()=>{

try{

await db.collection("rooms")
.doc(multiplayerRoomCode)
.delete();

}catch(err){

console.log(err);

}
await deleteRoomIfHost();
showScreen('dashboard-screen');

};
document.getElementById(
'points-breakdown'
).innerHTML = `

<div class="total-earned">

⚔️ MATCH RESULT
${roomData.roomType === "paid"
&& winner.name === currentState.user.name
? `<br>🪙 Prize Pool: ${totalPrize}`
: ""}

<br><br>
🏆 Winner:
${winner.name}

<br>

✅ Score:
${winner.score}/5

<br>

⏱ Time:
${winner.time}s

</div>
`;

setTimeout(()=>{

isMultiplayer = false;

multiplayerStarted = false;

},3000);

}

});

return;
}

// 🔥 get players
let players = [];

snap.forEach(doc => {

players.push(doc.data());

});

// 🔥 sort winner
players.sort((a,b)=>{

if(b.score !== a.score){

return b.score - a.score;

}

return a.time - b.time;

});

const winner = players[0];

// 🔥 show result
showScreen('result-screen');

document.getElementById(
'result-status'
).innerText =
`🏆 ${winner.name} WINS`;

document.getElementById(
'result-msg'
).innerText =
`Your Score: ${currentState.score}/5`;

document.getElementById(
'result-score'
).innerText =
`${usedTime}s`;

document.getElementById(
'result-score'
).style.color =
"gold";

document.getElementById(
'next-btn'
).style.display = "none";
document.querySelector(
'#result-screen .btn-outline'
).innerText = "BACK TO HOME";

document.querySelector(
'#result-screen .btn-outline'
).onclick = ()=>{

showScreen('dashboard-screen');

};

document.getElementById(
'points-breakdown'
).innerHTML = `

<div class="total-earned">

⚔️ MATCH RESULT

<br><br>

🏆 Winner:
${winner.name}

<br>

✅ Score:
${winner.score}/5

<br>

⏱ Time:
${winner.time}s

</div>
`;

// 🔥 stop listener
if(roomListener){

roomListener();

roomListener = null;

}

// 🔥 reset multiplayer
setTimeout(()=>{

isMultiplayer = false;

multiplayerStarted = false;

},3000);

return;
}
            clearInterval(timerInterval);
            showScreen('result-screen');
            
            const passed = currentState.score >= 3;
            const alreadyCompleted = !!currentState.levelAlreadyCompleted;
            const awardRewards = passed && !alreadyCompleted;
            let earnedCoins = 0;

// 🌍 GK
if(currentState.category === "gk"){

    if(awardRewards){
        earnedCoins += 8;
        if(currentState.score === 5){
            earnedCoins += 16;
        }
    }
}

// 🟢 EASY
else if(currentState.difficulty === "easy"){

    if(awardRewards){
        earnedCoins += 5;
        if(currentState.score === 5){
            earnedCoins += 5;
        }
    }
}

// 🟡 MEDIUM
else if(currentState.difficulty === "medium"){

   if(awardRewards){
        earnedCoins += 10;
        if(currentState.score === 5){
            earnedCoins += 15;
        }
    }
}

// 🔴 HARD
else if(currentState.difficulty === "hard"){

    if(awardRewards){
        earnedCoins += 15;
        if(currentState.score === 5){
            earnedCoins += 20;
        }
    }
}

// 💰 add coins
currentState.user.coins += earnedCoins;
            // ⚡ FINAL SPEED BONUS

let speedBonus = 0;

if (!alreadyCompleted) {
    // ⚡ SPEED ROUND
    if (currentState.category === "speed") {

        if (currentState.timer >= 20)
            speedBonus = 15;

        else if (currentState.timer >= 10)
            speedBonus = 10;

        else if (currentState.timer >= 5)
            speedBonus = 5;
    }

    // 🌍 ALL OTHER MODES
    else {

        if (currentState.timer >= 50)
            speedBonus = 50;

        else if (currentState.timer >= 30)
            speedBonus = 30;

        else if (currentState.timer >= 10)
            speedBonus = 20;
    }
}

if (!alreadyCompleted) {
    currentState.user.points += speedBonus;
}
            // 🔥 level complete bonus
if (passed && !alreadyCompleted) {

    // 📚 GK
    if (currentState.category === "gk") {

        currentState.user.points += 30;
    }

    // 🟢 EASY
    else if (currentState.difficulty === "easy") {

        currentState.user.points += 20;
    }

    // 🟡 MEDIUM
    else if (currentState.difficulty === "medium") {

        currentState.user.points += 30;
    }

    // 🔴 HARD
    else if (currentState.difficulty === "hard") {

        currentState.user.points += 50;
    }

    updateSidebar();
    saveCurrentUser();
}
let levelBonus = 0;

if (passed) {

    if (currentState.category === "gk")
        levelBonus = 30;

    else if (currentState.difficulty === "easy")
        levelBonus = 20;

    else if (currentState.difficulty === "medium")
        levelBonus = 30;

    else if (currentState.difficulty === "hard")
        levelBonus = 50;
}

const finalPoints =
    (currentState.correctPoints || 0)
    - (currentState.wrongPoints || 0)
    - (currentState.hintPenalty || 0)
    + speedBonus
    + levelBonus;


document.getElementById("points-breakdown").innerHTML = `

<div class="breakdown-line correct-line">
    <span>✅ Correct</span>
    <span>+${currentState.correctPoints}</span>
</div>

<div class="breakdown-line wrong-line">
    <span>❌ Wrong</span>
    <span>-${currentState.wrongPoints}</span>
</div>


<div class="breakdown-line speed-line">
    <span>⚡ Speed Bonus</span>
    <span>+${speedBonus}</span>
</div>

<div class="breakdown-line bonus-line">
    <span>🏁 Level Complete Bonus</span>
    <span>+${levelBonus}</span>
</div>

<div class="total-earned">
    🏆 POINTS EARNED:
    <span>+${finalPoints}</span>
</div>

<div class="coins-earned">
    🪙 COINS EARNED:
    <span>+${earnedCoins}</span>
</div>
`;

            document.getElementById('result-score').innerText = `${currentState.score} / 5`;
            
            if (passed) {
                document.getElementById('result-status').innerText = "LEVEL COMPLETED";
                document.getElementById('result-msg').innerText = "You've unlocked the next level! 🎉";
                document.getElementById('result-score').style.color = "var(--neon-green)";
                document.getElementById('next-btn').style.display = "block";
                document.getElementById('retry-btn').style.display = "none";
                
                // Save progress
                const cat = currentState.category;
                const diff = currentState.difficulty;
                const sub = currentState.gkSubject;

                if (sub) {

    if (!currentState.user.levelsCompleted['gk_subjects']) {
        currentState.user.levelsCompleted['gk_subjects'] = {};
    }

    if (!currentState.user.levelsCompleted['gk_subjects'][sub]) {
        currentState.user.levelsCompleted['gk_subjects'][sub] = {};
    }

    // 🔥 save only progress
  currentState.user.levelsCompleted['gk_subjects'][sub][String(currentState.level)] =
currentState.score;
}

else {

    if (!currentState.user.levelsCompleted[cat]) {
        currentState.user.levelsCompleted[cat] = {};
    }

    if (!currentState.user.levelsCompleted[cat][diff]) {
        currentState.user.levelsCompleted[cat][diff] = {};
    }

    // 🔥 save only progress
    currentState.user.levelsCompleted[cat][diff][String(currentState.level)] =
currentState.score;
}
                saveCurrentUser();
                updateSidebar();
            } else {
                document.getElementById('result-status').innerText = "LEVEL FAILED";
                document.getElementById('result-msg').innerText = "You need at least 3 points to pass. Try again!";
                document.getElementById('result-score').style.color = "var(--neon-red)";
                document.getElementById('next-btn').style.display = "none";
                document.getElementById('retry-btn').style.display = "block";
            }
        }

        function nextLevel() {
            if (currentState.level < 10) {
                startQuiz(currentState.level + 1);
            } else {
                showScreen('levels-screen');
            }
        }

        function retryLevel() {
            startQuiz(currentState.level);
        }

        function quitQuiz() {
            clearInterval(timerInterval);
            isMultiplayer = false;
            multiplayerStarted = false;
            showScreen('dashboard-screen');
        }

        // --- LEADERBOARD & POPUP ---

async function renderLeaderboard() {

    const container =
    document.getElementById('leaderboard-container');

    container.innerHTML = "Loading...";

    try {

        const snapshot =
        await db.collection("users").get();

        let players = [];

        snapshot.forEach(doc => {

            const data = doc.data();

         players.push({

    username: data.name || "Unknown",

    points: data.points || 0,

    avatar: data.avatar || "👤"
});
        });

        // 🔥 high → low
        players.sort((a, b) => b.points - a.points);

        // 🔥 filter out zero-point users
        players = players.filter(p => p.points > 0);

        container.innerHTML = "";

        if (players.length === 0) {
            container.innerHTML = "<div style='text-align:center; padding:40px; color:rgba(255,255,255,0.5); font-size:16px;'>No any player in leaderboard</div>";
            return;
        }

        players.forEach((p, i) => {

            const div = document.createElement('div');

            div.className = 'leader-item';

            div.innerHTML = `

            <div style="display:flex; align-items:center; gap:15px;">

                <span class="leader-rank">
                    #${i + 1}
                </span>

                <div style="
display:flex;
align-items:center;
gap:12px;
">

<div style="
font-size:28px;
width:45px;
height:45px;
display:flex;
align-items:center;
justify-content:center;
background:rgba(255,255,255,0.05);
border-radius:50%;
border:1px solid rgba(255,255,255,0.1);
">
${p.avatar}
</div>

<span style="
font-family: var(--f-display);
">
${p.username}
</span>

</div>

            </div>

            <div style="color: var(--neon-cyan); font-weight:bold;">
                ${p.points} PTS
            </div>
            `;

            container.appendChild(div);
        });

    } catch(err) {

        console.error(err);

        container.innerHTML =
        "Failed to load leaderboard 😢";
    }
}

        function showPopup(title, msg) {
            document.getElementById('popup-title').innerText = title;
            document.getElementById('popup-msg').innerText = msg;
            document.getElementById('overlay-popup').style.display = 'flex';
        }

        function closePopup() {
            document.getElementById('overlay-popup').style.display = 'none';
        }
function getDailyRewardAmount(day) {

    if(day === 1) return 5;
    if(day === 2) return 10;

    return 20 + ((day - 3) * 5);
}

function checkDailyRewardAvailability() {

    const lastDate = currentState.user.dailyLogin.lastClaimDate;

    if(!lastDate) return true;

    const today = new Date().toDateString();
    const saved = new Date(lastDate).toDateString();

    return today !== saved;
}

function renderDailyRewardsGrid() {

    const grid = document.getElementById('daily-rewards-grid');

    grid.innerHTML = '';

    const streak = currentState.user.dailyLogin.streak;

    const canClaim = checkDailyRewardAvailability();

    for(let i=1;i<=30;i++) {

        let status = 'locked';

        if(currentState.user.dailyLogin.claimedDays.includes(i)) {
            status = 'claimed';
        }
        else if(canClaim && i === streak + 1) {
            status = 'claimable';
        }

        const box = document.createElement('div');

        box.className = `reward-day ${status}`;

        box.innerHTML = `
            <span class="day-num">DAY ${i}</span>
            <span class="reward-icon">🪙</span>
            <span class="coin-amount">${getDailyRewardAmount(i)}</span>
        `;

        // Add click handler only for claimable cards
        if(status === 'claimable') {
            box.style.cursor = 'pointer';
            box.addEventListener('click', () => claimDailyReward());
        }

        grid.appendChild(box);
    }

    document.getElementById('current-streak').innerText = streak;

    // Update reward status message
    const statusMsg = document.getElementById('reward-status-text');
    
    if(canClaim) {
        statusMsg.innerText = "✨ Reward Available Now! Click to claim.";
    } else {
        const lastClaim = currentState.user.dailyLogin.lastClaimDate;
        if(lastClaim) {
            const lastClaimTime = new Date(lastClaim).getTime();
            const nextClaimTime = lastClaimTime + (24 * 60 * 60 * 1000);
            const now = Date.now();
            const diff = nextClaimTime - now;
            
            if(diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                const timeStr = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
                statusMsg.innerText = `⏱️ Next reward in ${timeStr}`;
            }
        }
    }
}

function claimDailyReward() {

    if(!checkDailyRewardAvailability()) return;

  let nextDay =
currentState.user.dailyLogin.streak + 1;

// 🔥 reset after 30
if(nextDay > 30){

    nextDay = 1;

    currentState.user.dailyLogin.claimedDays = [];

}

const reward =
getDailyRewardAmount(nextDay);

currentState.user.coins += reward;

currentState.user.dailyLogin.streak = nextDay;

currentState.user.dailyLogin.claimedDays.push(nextDay);

    currentState.user.dailyLogin.lastClaimDate = new Date().toISOString();

    if(nextDay === 7) {
        currentState.user.coins += 50;
    }

    if(nextDay === 30) {
        currentState.user.coins += 300;
    }

    saveCurrentUser();

    updateSidebar();

    renderDailyRewardsGrid();
    let bonusText = "";

if(nextDay === 7){
    bonusText = "\n\n🎉 7 DAY STREAK BONUS: +50 Coins";
}

if(nextDay === 30){
    bonusText = "\n\n👑 30 DAY STREAK BONUS: +300 Coins";
}

showPopup(
    "REWARD CLAIMED",
    `You received ${reward} coins${bonusText}`
);

}

function showHint() {

    // ❌ already used
    if (currentState.hintUsed)
        return;
    // ❌ not enough coins
if(currentState.user.coins < 15){

    showPopup(
        "NOT ENOUGH COINS 😭",
        "You need 15 coins to use hint."
    );

    return;
}

    const q = currentQuestions[currentState.questionIndex];

    // 🔥 show hint text
    document.getElementById("hintBox").innerText =
        q.hint || "No hint available";

    document.getElementById("hintBox").style.display = "block";
    // 💰 deduct coins
currentState.user.coins -= 15;

updateSidebar();

saveCurrentUser();

    updateSidebar();
     saveCurrentUser();

    currentState.hintUsed = true;

    // 🔥 disable button
    document.getElementById("hintBtn").disabled = true;
}

function buyTime(seconds, cost){

    if (isMultiplayer) {
        showPopup(
            "NOT ALLOWED",
            "Time purchase is disabled in multiplayer."
        );
        return;
    }

    // ❌ not enough coins
    if(currentState.user.coins < cost){

        showPopup(
            "NOT ENOUGH COINS 😭",
            `You need ${cost} coins`
        );

        return;
    }

    // 💰 deduct coins
    currentState.user.coins -= cost;

    // ⏳ add time
    currentState.timer += seconds;

    // 🔥 update timer UI
    document.getElementById("timer")
    .innerText = currentState.timer;

    updateSidebar();

    saveCurrentUser();

    showPopup(
        "TIME ADDED ⏳",
        `+${seconds} seconds added`
    );
}
async function loadNews() {
    const container = document.getElementById("news-container");
    container.innerHTML = "Loading news...";

    try {
        const res = await fetch("https://gnews.io/api/v4/top-headlines?country=in&lang=en&token=20e3a37859c7d528256b19c3b3db4406");
        const data = await res.json();

        container.innerHTML = "";

        data.articles.slice(0, 10).forEach(article => {
            const div = document.createElement("div");

            div.style = `
                background: rgba(255,255,255,0.05);
                padding:15px;
                border-radius:10px;
                border:1px solid rgba(255,255,255,0.1);
            `;

            div.innerHTML = `
                <h3 style="color:#00f2ff;">${article.title}</h3>
                <p>${article.description || ""}</p>
                <a href="${article.url}" target="_blank" class="read-btn">
    Read More →
</a>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = "Error loading news 😢";
    }
}  
function goBack() {
    if (isMultiplayer) {
        showScreen('multiplayer-screen');
        return;
    }

    if (currentState.category === "gk") {
        showScreen('subjects-screen'); // ✅ GK ke liye
    } else {
        showScreen('difficulty-screen'); // ✅ baaki sab ke liye
    }
}

function checkAuth() {

    firebase.auth().onAuthStateChanged(async (user) => {

        if (user) {

            const doc = await db.collection("users")
            .doc(user.uid)
            .get();

            const data = doc.data();

          currentState.user = {
    name: data.name,
    email: data.email,
    points: data.points || 0,
    coins: data.coins || 0,
    avatar:
data.avatar || "👤",

unlockedAvatars:
data.unlockedAvatars || ["default"],
    levelsCompleted: data.levelsCompleted || {},

    dailyLogin: data.dailyLogin || {
        lastClaimDate: null,
        streak: 0,
        claimedDays: []
    },

    loggedIn: true
};

            updateSidebar();
        }
    });
}
function clearAuthInputs() {

    // 🔥 signup
    document.getElementById('signup-name').value = "";
    document.getElementById('signup-email').value = "";
    document.getElementById('signup-pass').value = "";
    document.getElementById('signup-pass-confirm').value = "";

    // 🔥 signin
    document.getElementById('signin-email').value = "";
    document.getElementById('signin-pass').value = "";
}

function calculatePoints(isCorrect) {

    // 📚 GK
    if (currentState.category === "gk") {

        return isCorrect ? 12 : -6;
    }

    const diff = currentState.difficulty;

    // 🟢 EASY
    if (diff === "easy") {

        return isCorrect ? 10 : -5;
    }

    // 🟡 MEDIUM
    else if (diff === "medium") {

        return isCorrect ? 15 : -10;
    }

    // 🔴 HARD
    else if (diff === "hard") {

        return isCorrect ? 20 : -15;
    }

    return 0;
}

async function saveCurrentUser() {

    // ❌ guest user skip
    if (!firebase.auth().currentUser)
        return;

    try {

      await db.collection("users")
.doc(firebase.auth().currentUser.uid)
.update({

    points: currentState.user.points,

    coins: currentState.user.coins,

    levelsCompleted:
        currentState.user.levelsCompleted,

    dailyLogin:
        currentState.user.dailyLogin,
        avatar:
currentState.user.avatar,

unlockedAvatars:
currentState.user.unlockedAvatars
});

        console.log("User data saved 😈");

    } catch(err) {

        console.error(err);
    }
}

function shuffleArray(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [array[i], array[j]] =
        [array[j], array[i]];
    }

    return array;
}


 // --- MULTIPLAYER LOGIC ---
 let currentJoinRoomType = "free";
let selectedBetCoins = 0;
let currentRoomType = "free";
        let mpRoomConfig = {
            category: null,
            subject: null,
            difficulty: null
        };
function openCreateRoomSelector(){

    document.getElementById(
        'multiplayer-back-btn'
    ).style.display = 'none';

document.getElementById(
'multiplayer-main-options'
).style.display = 'none';

document.getElementById(
'create-room-type-selector'
).style.display = 'block';

document.getElementById(
'mp-category-selector'
).style.display = 'none';

document.getElementById(
'mp-subject-selector'
).style.display = 'none';

document.getElementById(
'mp-difficulty-selector'
).style.display = 'none';

document.getElementById(
'room-code-display'
).style.display = 'none';

document.getElementById(
'join-room-container'
).style.display = 'none';

}

function selectCreateRoomType(type){

currentRoomType = type;

if(type === "free"){

selectedBetCoins = 0;

showMultiplayerCategories();

}

else{

document.getElementById(
'create-room-type-selector'
).style.display = 'none';

document.getElementById(
'bet-selector'
).style.display = 'block';

updateBetValue();

}

}
function updateBetValue(){

selectedBetCoins = parseInt(
document.getElementById(
'bet-range'
).value
);

document.getElementById(
'bet-value'
).innerText =
`🪙 ${selectedBetCoins}`;

}

function backToRoomTypeSelector(){

document.getElementById(
'bet-selector'
).style.display = 'none';

document.getElementById(
'create-room-type-selector'
).style.display = 'block';

}
function confirmBetSelection(){

// ❌ not enough coins

if(
currentState.user.coins
<
selectedBetCoins
){

showPopup(
"NOT ENOUGH COINS",
`You need ${selectedBetCoins} coins`
);

return;

}

// 💰 deduct coins

currentState.user.coins -= selectedBetCoins;

// 🔥 update UI

updateSidebar();

saveCurrentUser();

// 🔥 hide bet selector

document.getElementById(
'bet-selector'
).style.display = 'none';

// 🔥 open categories

showMultiplayerCategories();

}
function hideCreateRoomType(){

document.getElementById(
'create-room-type-selector'
).style.display = 'none';

document.getElementById(
'multiplayer-main-options'
).style.display = 'grid';

document.getElementById(
        'multiplayer-back-btn'
    ).style.display = 'block';

}
        function showMultiplayerCategories() {
            document.getElementById('multiplayer-main-options').style.display = 'none';
            document.getElementById('create-room-type-selector').style.display = 'none';
            document.getElementById('bet-selector').style.display = 'none';
            document.getElementById('mp-category-selector').style.display = 'block';
            document.getElementById('mp-subject-selector').style.display = 'none';
            document.getElementById('mp-difficulty-selector').style.display = 'none';
            document.getElementById('room-code-display').style.display = 'none';
            document.getElementById('join-room-container').style.display = 'none';
        }

function hideMpCategories() {

    // 🔥 hide categories
    document.getElementById(
        'mp-category-selector'
    ).style.display = 'none';

    // 🔥 show FREE / PAID selector
    document.getElementById(
        'create-room-type-selector'
    ).style.display = 'block';

    // 🔥 back button visible
    document.getElementById(
        'multiplayer-back-btn'
    ).style.display = 'block';
}

        function selectMpCategory(cat) {
            mpRoomConfig.category = cat;
            mpRoomConfig.subject = null;
            
            if (cat === 'gk') {
                renderMpSubjects();
                document.getElementById('mp-category-selector').style.display = 'none';
                document.getElementById('mp-subject-selector').style.display = 'block';
            } else {
                document.getElementById('mp-category-selector').style.display = 'none';
                document.getElementById('mp-diff-back-btn').onclick = showMultiplayerCategories;
                document.getElementById('mp-difficulty-selector').style.display = 'block';
            }
        }

        function renderMpSubjects() {
            const grid = document.getElementById('mp-subjects-grid');
            grid.innerHTML = '';
            for (const id in GK_SUBJECTS) {
                const sub = GK_SUBJECTS[id];
                const card = document.createElement('div');
                card.className = 'game-card';
                card.style.padding = '15px';
                card.style.height = 'auto';
                card.innerHTML = `
                    <div style="font-size: 24px;">${sub.icon}</div>
                    <div style="font-size: 11px; margin-top: 8px;">${sub.name.toUpperCase()}</div>
                `;
                card.onclick = () => selectMpSubject(id);
                grid.appendChild(card);
            }
        }

 function selectMpSubject(subId) {

    mpRoomConfig.category = "gk";

    mpRoomConfig.subject = subId;

    mpRoomConfig.difficulty = "gk";

    // 🔥 hide subject screen
    document.getElementById(
        'mp-subject-selector'
    ).style.display = 'none';

    // 🔥 create room
    createRoom();
}

        function finishMpSetup(diff) {
            mpRoomConfig.difficulty = diff;
            createRoom();
        }

  async function createRoom() {

    const code = Math.random()
    .toString(36)
    .substring(2,8)
    .toUpperCase();
    multiplayerRoomCode = code;

    // 🔥 save firestore room
await db.collection("rooms")
.doc(code)
.set({

code: code,

host: currentState.user.name,
hostUid: firebase.auth().currentUser?.uid || null,

category: mpRoomConfig.category,

difficulty: mpRoomConfig.difficulty || "gk",

subject: mpRoomConfig.subject || null,

roomType: currentRoomType,

betCoins: selectedBetCoins,
payoutDone: false,
hostOnline: true,
player2Online: false,
status: "waiting",

createdAt: new Date()

});

    // 🔥 show code
    document.getElementById(
        'generated-code'
    ).innerText = code;

    let label =
    mpRoomConfig.category.toUpperCase();

    if(mpRoomConfig.subject){

        label +=
        " / " +
        mpRoomConfig.subject.toUpperCase();
    }

    if(mpRoomConfig.difficulty){

        label +=
        " (" +
        mpRoomConfig.difficulty.toUpperCase()
        + ")";
    }

    document.getElementById(
        'room-cat-label'
    ).innerText =
    "ROOM: " + label;

    // 💰 show bet info

if(currentRoomType === "paid"){

document.getElementById(
'bet-display-box'
).innerHTML = `

<div style="
margin-top:15px;
padding:12px;
border-radius:14px;
background:rgba(255,215,0,0.08);
border:1px solid rgba(255,215,0,0.3);
color:gold;
font-family:var(--f-display);
font-size:14px;
box-shadow:0 0 15px rgba(255,215,0,0.12);
">

🪙 BET: ${selectedBetCoins}

<br><br>

🏆 WINNER GETS:
${selectedBetCoins * 2}

</div>
`;

}

else{

document.getElementById(
'bet-display-box'
).innerHTML = "";

}

    document.getElementById(
        'room-code-display'
    ).style.display = 'block';

    const roomBox =
document.getElementById(
'room-code-display'
);

const codeText =
document.getElementById(
'generated-code'
);

// 🔥 reset

roomBox.classList.remove(
'paid-room-ui',
'free-room-ui'
);

codeText.classList.remove(
'paid-room-code'
);

// 💰 paid styling

if(currentRoomType === "paid"){

roomBox.classList.add(
'paid-room-ui'
);

codeText.classList.add(
'paid-room-code'
);

}

// 🆓 free styling

else{

roomBox.classList.add(
'free-room-ui'
);

}

    document.getElementById(
        'mp-difficulty-selector'
    ).style.display = 'none';

    document.getElementById(
        'mp-category-selector'
    ).style.display = 'none';

    document.getElementById(
        'multiplayer-main-options'
    ).style.display = 'none';

    document.getElementById(
        'join-room-container'
    ).style.display = 'none';

    // 😈 realtime listener
  roomListener = db.collection("rooms")
.doc(code)
.onSnapshot(async (doc)=>{

        const data = doc.data();
        // ❌ opponent disconnected

if(
data.status === "full"
&&
data.player2Online === false
&&
multiplayerStarted
){

showPopup(
"OPPONENT LEFT 😈",
"You win by disconnect"
);

currentState.user.coins +=
(data.betCoins || 0) * 2;

updateSidebar();

saveCurrentUser();

await deleteRoomIfHost();

showScreen('dashboard-screen');

return;

}

        if(
    data &&
    data.status === "full" &&
    !multiplayerStarted
){
    multiplayerStarted = true;

            showPopup(
                "MATCH FOUND 😈🔥",
                `${data.host} VS ${data.player2}`
            );

           const waitTime = Math.max(data.startAt - Date.now(), 0);

setTimeout(async ()=>{

closePopup();

currentState.category =
data.category;

currentState.difficulty =
data.difficulty;

currentState.gkSubject =
data.subject || null;

currentQuestions =
await getQuestions(
currentState.category,
currentState.difficulty,
1
);

currentState.questionIndex = 0;

currentState.score = 0;

isMultiplayer = true;

showScreen('quiz-screen');

loadQuestion();

startTimer();

}, waitTime);
        }
    });
}
function setJoinRoomType(type){

currentJoinRoomType = type;

const freeBtn =
document.getElementById(
'join-free-btn'
);

const paidBtn =
document.getElementById(
'join-paid-btn'
);

// 🔥 reset

freeBtn.classList.remove(
'active-join-type',
'join-paid-active'
);

paidBtn.classList.remove(
'active-join-type',
'join-paid-active'
);

// 🆓 free

if(type === "free"){

freeBtn.classList.add(
'active-join-type'
);

}

// 💰 paid

else{

paidBtn.classList.add(
'join-paid-active'
);

}

}
function openJoinRoomTypeSelector(){

    document.getElementById(
        'multiplayer-back-btn'
    ).style.display = 'none';

document.getElementById(
'multiplayer-main-options'
).style.display = 'none';

document.getElementById(
'join-room-type-selector'
).style.display = 'block';

document.getElementById(
'join-room-container'
).style.display = 'none';

document.getElementById(
'create-room-type-selector'
).style.display = 'none';

document.getElementById(
'bet-selector'
).style.display = 'none';

}
function hideJoinRoomTypeSelector(){

document.getElementById(
'join-room-type-selector'
).style.display = 'none';

document.getElementById(
'multiplayer-main-options'
).style.display = 'grid';

document.getElementById(
        'multiplayer-back-btn'
    ).style.display = 'block';

}
function backFromJoinRoomInput(){
    document.getElementById('join-room-container').style.display = 'none';
    document.getElementById('join-room-type-selector').style.display = 'block';
}
function selectJoinRoomType(type){

currentJoinRoomType = type;

document.getElementById(
'join-room-type-selector'
).style.display = 'none';

openJoinRoomModal();

}
        function openJoinRoomModal() {
            document.getElementById('join-room-container').style.display = 'block';
            document.getElementById('room-code-display').style.display = 'none';
            document.getElementById('multiplayer-main-options').style.display = 'none';
            document.getElementById('mp-category-selector').style.display = 'none';
            document.getElementById('mp-subject-selector').style.display = 'none';
            document.getElementById('mp-difficulty-selector').style.display = 'none';
            updateJoinRoomTheme();
            document.getElementById('join-code-input').focus();
        }

        function updateJoinRoomTheme() {
            const container = document.getElementById('join-room-container');
            const input = document.getElementById('join-code-input');
            const joinBtn = document.querySelector('#join-room-container .join-room-submit');
            const cancelBtn = document.querySelector('#join-room-container .join-room-cancel');
            const title = container.querySelector('.nav-section-label');

            const paid = currentJoinRoomType === 'paid';

            container.classList.toggle('paid-join-room', paid);
            input.classList.toggle('paid-join-input', paid);
            joinBtn.classList.toggle('paid-join-btn', paid);
            cancelBtn.classList.toggle('paid-join-cancel', paid);
            title.style.color = paid ? '#ffb84d' : '';
        }

   async function joinRoom() {

    const code = document
    .getElementById('join-code-input')
    .value
    .trim()
    .toUpperCase();
multiplayerRoomCode = code;
    // ❌ invalid code
    if(code.length !== 6){

        showPopup(
            "INVALID CODE",
            "Enter valid 6 digit code 😈"
        );

        return;
    }

    try{

        // 🔥 firestore room fetch
        const roomRef =
        db.collection("rooms")
        .doc(code);

        const roomSnap =
        await roomRef.get();

        // ❌ room not found
        if(!roomSnap.exists){

            showPopup(
                "ROOM NOT FOUND",
                "Invalid room code 😢"
            );

            return;
        }

        const room =
        roomSnap.data();
        // ❌ FREE/PAID mismatch

if(room.roomType !== currentJoinRoomType){

showPopup(
"WRONG ROOM TYPE 😈",
`This is a ${room.roomType.toUpperCase()} room`
);

return;

}

        // ❌ already full
        if(room.status === "full"){

            showPopup(
                "ROOM FULL",
                "Lobby already full 😈"
            );

            return;
        }
        // 💰 paid room entry fee

if(room.roomType === "paid"){

if(currentState.user.coins < room.betCoins){

showPopup(
"NOT ENOUGH COINS 😭",
`Need ${room.betCoins} coins`
);

return;

}

}

// 💰 deduct join coins

if(room.roomType === "paid"){

currentState.user.coins -= room.betCoins;

updateSidebar();

saveCurrentUser();

}
        // 🔥 join room
     const startAt = Date.now() + 5000;

await roomRef.update({

player2:
currentState.user.name,
player2Online: true,
joinedAt:
new Date(),

status:
"full",

startAt: startAt

});

        // 🔥 set multiplayer config
        mpRoomConfig.category =
        room.category;

        mpRoomConfig.subject =
        room.subject || null;

        mpRoomConfig.difficulty =
        room.difficulty || null;

        // 🔥 success popup
        showPopup(
            "MATCH FOUND 😈🔥",
            `${room.host} VS ${currentState.user.name}`
        );

        // 🔥 reset join screen
        document.getElementById(
            'join-code-input'
        ).value = '';

        document.getElementById(
            'join-room-container'
        ).style.display = 'none';

        // 🔥 START QUIZ AFTER THE ROOM STARTS
        const waitTime = Math.max(startAt - Date.now(), 0);

        setTimeout(async ()=>{

if(multiplayerStarted)
return;

multiplayerStarted = true;

closePopup();

currentState.category =
mpRoomConfig.category;

currentState.difficulty =
mpRoomConfig.difficulty;

currentState.gkSubject =
mpRoomConfig.subject;

currentQuestions =
await getQuestions(
currentState.category,
currentState.difficulty,
1
);

currentState.questionIndex = 0;

currentState.score = 0;

isMultiplayer = true;

showScreen('quiz-screen');

loadQuestion();

startTimer();

}, waitTime);

    }

    catch(err){

        console.log(err);

        showPopup(
            "ERROR",
            err.message
        );
    }
}
async function deleteRoomIfHost(){

try{

if(!multiplayerRoomCode)
return;

const roomRef =
db.collection("rooms")
.doc(multiplayerRoomCode);

const roomSnap =
await roomRef.get();

if(!roomSnap.exists)
return;

const room =
roomSnap.data();

const myUid =
firebase.auth().currentUser?.uid;

// 🛡️ only host can delete

if(room.hostUid === myUid){

await roomRef.delete();

console.log(
"Room deleted by host 😈"
);

}

}

catch(err){

console.log(err);

}

}
async function handlePlayerDisconnect(){

try{

if(!multiplayerRoomCode)
return;

const roomRef =
db.collection("rooms")
.doc(multiplayerRoomCode);

const roomSnap =
await roomRef.get();

if(!roomSnap.exists)
return;

const room =
roomSnap.data();

const myName =
currentState.user.name;

// 🏠 host disconnect

if(room.host === myName){

await roomRef.update({

hostOnline: false

});

}

// 👤 player2 disconnect

else if(room.player2 === myName){

await roomRef.update({

player2Online: false

});

}

}

catch(err){

console.log(err);

}

}

async function cleanupOldRooms(){

try{

const snapshot =
await db.collection("rooms").get();

const now = Date.now();

snapshot.forEach(async (doc)=>{

const room = doc.data();

let roomTime = 0;

// 🔥 safe timestamp convert

if(room.createdAt){

if(room.createdAt.toDate){

roomTime =
room.createdAt.toDate().getTime();

}

else{

roomTime =
new Date(room.createdAt).getTime();

}

}

// 🗑️ delete after 1 hour

const oneHour =
60 * 60 * 1000;

if(now - roomTime > oneHour){

await db.collection("rooms")
.doc(doc.id)
.delete();

console.log(
"Old room deleted 😈",
doc.id
);

}

});

}

catch(err){

console.log(err);

}

}


   async function closeLobby() {

    const code =
    document.getElementById(
        'generated-code'
    ).innerText;

    // 🔥 delete firestore room
    await deleteRoomIfHost();

    // 🔥 reset UI
    document.getElementById(
        'room-code-display'
    ).style.display = 'none';

    document.getElementById(
        'multiplayer-main-options'
    ).style.display = 'grid';

    document.getElementById(
        'multiplayer-back-btn'
    ).style.display = 'block';

    mpRoomConfig = {
        category: null,
        subject: null,
        difficulty: null
    };
}

        function copyRoomCode() {
            const code = document.getElementById('generated-code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.querySelector('#room-code-display .btn-outline');
                const originalText = btn.innerText;
                btn.innerText = "COPIED!";
                setTimeout(() => btn.innerText = originalText, 2000);
            });
        }


        // Initialize on load
     window.onload = () => {
    init();
    startRewardTimer();
};
        function startRewardTimer() {

    const statusMsg = document.getElementById('reward-status-text');

    if (!statusMsg) return;

    setInterval(() => {

        const canClaim = checkDailyRewardAvailability();

        if(canClaim) {
            statusMsg.innerText = "✨ Reward Available Now! Click to claim.";
            return;
        }

        const lastClaim = currentState.user.dailyLogin?.lastClaimDate;

        if (!lastClaim) {
            statusMsg.innerText = "✨ Reward Available Now! Click to claim.";
            return;
        }

        const lastClaimTime = new Date(lastClaim).getTime();

        const nextClaimTime = lastClaimTime + (24 * 60 * 60 * 1000);

        const now = Date.now();

        const diff = nextClaimTime - now;

        if (diff <= 0) {
            statusMsg.innerText = "✨ Reward Available Now! Click to claim.";
            renderDailyRewardsGrid();
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));

        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        statusMsg.innerText = `⏱️ Next reward in ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;

    }, 1000);
}

function openAvatarShop(){

    renderAvatarShop();

    showScreen(
        'avatar-shop-screen'
    );
}

function renderAvatarShop(){

    const grid =
    document.getElementById(
        'avatar-shop-grid'
    );

    grid.innerHTML = "";

    AVATARS.forEach(av => {

       const unlocked =
(
currentState.user.unlockedAvatars ||
["default"]
).includes(av.id);

        const selected =
(currentState.user.avatar || "👤")
=== av.emoji;

        const card =
        document.createElement('div');

        card.className =
        `avatar-card
        ${unlocked ? 'unlocked' : 'locked'}
        ${selected ? 'selected' : ''}`;

        card.innerHTML = `

        ${!unlocked ?
        `<div class="lock-icon">🔒</div>`
        : ""}

        <div class="avatar-preview">
            ${av.emoji}
        </div>

        <div class="avatar-name">
            ${av.name}
        </div>

        <div class="avatar-price">
            🪙 ${av.price}
        </div>
        `;

        card.onclick = () =>
        handleAvatar(av);

        grid.appendChild(card);

    });
}

function handleAvatar(av){

    const unlocked =
    (currentState.user.unlockedAvatars || [])
    .includes(av.id);

    // ✅ SELECT
    if(unlocked){

        currentState.user.avatar =
        av.emoji;

        updateSidebar();

        saveCurrentUser();

        renderAvatarShop();

        showPopup(
            "AVATAR SELECTED",
            `${av.name} equipped 😈`
        );

        return;
    }

    // ❌ not enough coins
    if(currentState.user.coins < av.price){

        showPopup(
            "NOT ENOUGH COINS",
            `Need ${av.price} coins`
        );

        return;
    }

    // 💰 buy
    currentState.user.coins -= av.price;

    if (!currentState.user.unlockedAvatars) {
        currentState.user.unlockedAvatars = ["default"];
    }

    currentState.user
    .unlockedAvatars
    .push(av.id);

    currentState.user.avatar =
    av.emoji;

    updateSidebar();

    saveCurrentUser();

    renderAvatarShop();

    showPopup(
        "PURCHASE SUCCESSFUL",
        `${av.name} unlocked 😈🔥`
    );
}
