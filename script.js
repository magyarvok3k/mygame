//------------------------------------------
// USER SYSTEM (login / register)
//------------------------------------------

function loadUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getLoggedInUser() {
    return localStorage.getItem("loggedInUser") || null;
}

function getUserData(username) {
    let users = loadUsers();
    return users.find(u => u.username === username);
}

function updateUserData(updatedUser) {
    let users = loadUsers();
    let index = users.findIndex(u => u.username === updatedUser.username);
    users[index] = updatedUser;
    saveUsers(users);
}

//------------------------------------------
// REGISTER
//------------------------------------------

document.getElementById("registerBtn").onclick = () => {
    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;

    if (!username || !password) return alert("Tölts ki mindent!");

    let users = loadUsers();

    if (users.some(u => u.username === username)) {
        return alert("Ez a név már foglalt!");
    }

    users.push({
        username,
        password,
        score: 0,
        upgrades: {
            bigBox: false,
            doubleClick: false,
            chainUpgrade: 0 // chain upgrade szint
        }
    });

    saveUsers(users);
    alert("Sikeres regisztráció!");
};

//------------------------------------------
// LOGIN
//------------------------------------------

document.getElementById("loginBtn").onclick = () => {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    let users = loadUsers();
    let found = users.find(u => u.username === username && u.password === password);

    if (!found) return alert("Hibás adatok!");

    localStorage.setItem("loggedInUser", username);
    loadPlayer(found);
    showGameUI();
};

//------------------------------------------
// LOGOUT
//------------------------------------------

document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("loggedInUser");
    showLoginUI();
};

//------------------------------------------
// LOAD PLAYER DATA INTO GAME
//------------------------------------------

let score = 0;
let clickValue = 1;
let upgradeBought = false;
let doubleUpgradeBought = false;
let chainUpgradeLevel = 0;

function loadPlayer(player) {
    score = player.score;
    clickValue = player.upgrades.doubleClick ? 2 : 1;
    upgradeBought = player.upgrades.bigBox;
    doubleUpgradeBought = player.upgrades.doubleClick;
    chainUpgradeLevel = player.upgrades.chainUpgrade || 0;

    // Box méret
    if (upgradeBought) {
        document.getElementById("box").style.width = "80px";
        document.getElementById("box").style.height = "80px";
        document.getElementById("upgrade-btn").innerText = "Upgrade Purchased!";
    }

    if (doubleUpgradeBought) {
        document.getElementById("double-upgrade").innerText = "Double Click Purchased!";
    }

    if (maxsizebtn) {
        document.getElementById("box").style.width = "160px";
        document.getElementById("box").style.height = "160px";
        document.getElementById("max-size-btn").innerText = "Max Size Purchased!";
    }

    updateChainUI();
    document.getElementById("score").innerText = score;
}

//------------------------------------------
// SAVE PLAYER DATA
//------------------------------------------

function savePlayer() {
    let username = getLoggedInUser();
    if (!username) return;

    let user = getUserData(username);

    user.score = score;
    user.upgrades.bigBox = upgradeBought;
    user.upgrades.doubleClick = doubleUpgradeBought;
    user.upgrades.chainUpgrade = chainUpgradeLevel;

    updateUserData(user);
}

//------------------------------------------
// GAME SYSTEM
//------------------------------------------

const box = document.getElementById("box");
const scoredisplay = document.getElementById("score");
const gameArea = document.getElementById("game-area");

box.addEventListener("click", () => {
    if (!getLoggedInUser()) return alert("Be kell jelentkezned!");

    score += clickValue + chainUpgradeLevel; // chain upgrade ad hozzá extra click-et
    scoredisplay.innerText = score;
    savePlayer();
    movebox();
});

function movebox() {
if( cubeFrozen) return; // Ha freeze alatt van, ne mozogjon

    const areaWidth = gameArea.clientWidth - box.clientWidth;
    const areaHeight = gameArea.clientHeight - box.clientHeight;

    const randomX = Math.random() * areaWidth;
    const randomY = Math.random() * areaHeight;

    box.style.left = randomX + "px";
    box.style.top = randomY + "px";
}

//------------------------------------------
// UPGRADES
//------------------------------------------

const upgradeBtn = document.getElementById("upgrade-btn");
upgradeBtn.addEventListener("click", () => {
    if (score >= 10 && !upgradeBought) {
        score -= 10;
        upgradeBought = true;

        box.style.width = "80px";
        box.style.height = "80px";
        upgradeBtn.innerText = "Upgrade Purchased!";

        savePlayer();
        scoredisplay.innerText = score;
    }
});

const maxsizebtn = document.getElementById("max-size-btn");
maxsizebtn.addEventListener("click", () => {
    if (score >= 150 && !upgradeBought) {
        score -= 150;
        upgradeBought = true;

        box.style.width = "160px";
        box.style.height = "160px";
        maxsizebtn.innerText = "Max Size Purchased!";

        savePlayer();
        scoredisplay.innerText = score;
    }
});

const doubleUpgrade = document.getElementById("double-upgrade");
doubleUpgrade.addEventListener("click", () => {
    if (score >= 40 && !doubleUpgradeBought) {
        score -= 40;
        doubleUpgradeBought = true;
        clickValue = 2;

        doubleUpgrade.innerText = "Double Click Purchased!";

        savePlayer();
        scoredisplay.innerText = score;
    }
});

// CHAIN UPGRADE

function updateChainUI() {
    const levelEl = document.getElementById("chain-level");
    const costEl = document.getElementById("chain-cost");
    const powerEl = document.getElementById("chain-power");

    const chainCost = 20 * (chainUpgradeLevel + 1);
    const chainPower = chainUpgradeLevel;

    if (levelEl) levelEl.innerText = chainUpgradeLevel;
    if (costEl) costEl.innerText = chainCost;
    if (powerEl) powerEl.innerText = chainPower;
}

// Csak ha létezik a gomb

const chainUpgradeBtn = document.getElementById("chain-upgrade-btn");
if (chainUpgradeBtn) {
    chainUpgradeBtn.addEventListener("click", () => {
        const chainCost = 20 * (chainUpgradeLevel + 1);
        if (score >= chainCost) {
            score -= chainCost;
            chainUpgradeLevel++;
            updateChainUI();
            savePlayer();
            scoredisplay.innerText = score;
        } else {
            alert("Nincs elég pontod a chain upgrade-hez!");
        }
    });
}

// Betöltéskor frissítés
window.addEventListener("load", () => {
    updateChainUI();
});

// Betöltéskor frissítés
window.addEventListener("load", () => {
    updateChainUI();
});

// UI HANDLING

function showLoginUI() {
    document.getElementById("auth").style.display = "block";
    document.getElementById("userPanel").style.display = "none";
    document.getElementById("top-menu").style.display = "none";
    document.getElementById("powerup-section").style.display = "block";
    hideAllTabs();
}

function showGameUI() {
    const user = getLoggedInUser();
    document.getElementById("userDisplay").innerText = user;

    document.getElementById("auth").style.display = "none";
    document.getElementById("userPanel").style.display = "block";
    document.getElementById("top-menu").style.display = "block";

    // SHOW POWER-UP SECTION
    document.getElementById("powerup-section").style.display = "block";

    tabButtons[0].click();
}

// AUTO LOGIN ON LOAD

window.onload = () => {
    const username = getLoggedInUser();
    if (username) {
        let user = getUserData(username);
        loadPlayer(user);
        showGameUI();
    } else {
        showLoginUI();
    }
};

// TAB

const tabButtons = document.querySelectorAll(".tab-btn");
const tabSections = document.querySelectorAll(".tab-section");

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        hideAllTabs();
        document.getElementById(btn.dataset.target).style.display = "block";
    });
});

function hideAllTabs() {
    tabSections.forEach(sec => sec.style.display = "none");
}

let cubeFrozen = false;
const freezeDuration = 10000; // 10 másodperc
const powerUpCost = 1000;

const cube = document.getElementById("box");
const powerUpBtn = document.getElementById("power-up-btn");

// Cube click
cube.addEventListener("click", () => {
    // mindig ad pontot, még freeze alatt is
    score += clickValue + chainUpgradeLevel;
    scoredisplay.innerText = score;
});

powerUpBtn.addEventListener("click", () => {
    if (cubeFrozen) return;

    if (score < powerUpCost) {
        alert("Nincs elég pontod a power up-hoz!");
        return;
    }

    score -= powerUpCost;
    scoredisplay.innerText = score;

    activateFreeze();
});

function activateFreeze() {
    cubeFrozen = true;
    powerUpBtn.disabled = true;
    powerUpBtn.textContent = "Power-Up Active!";

    cube.classList.add("frozen");

    setTimeout(() => {
        cubeFrozen = false;

        cube.classList.remove("frozen");
        powerUpBtn.disabled = false;
        powerUpBtn.textContent =
            "Power up: Freeze the cube for 10 seconds (Cost: 1000)";
    }, freezeDuration);
}

