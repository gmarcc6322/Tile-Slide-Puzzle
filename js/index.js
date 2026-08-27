const sessionScores = [];

function getLocalGameData() {
    return {
        2: {
            isAccessible: true,
        },
    };
}

function startGame(props) {
    const level = 2;
    const { moves, board } = props;

    const game = new Game(level, getLocalGameData(), moves, board);
    game.render();
    document.querySelector(".controls__main").classList.remove("none");
    document.querySelector(".controls__game").classList.remove("none");
    document.querySelector(".board").classList.remove("game-over");
    document.querySelector(".game-stats").classList.remove("hidden");
    updateSessionBest();
}

function addSessionScore(score, name) {
    sessionScores.push({ score, name: name || "Unknown Hero" });
    sessionScores.sort((a, b) => a.score - b.score);
    updateSessionBest();
}

function updateSessionBest() {
    const best = sessionScores.length ? sessionScores[0].score : null;
    document.querySelector(".game-stats__local--value").textContent = best != null ? best : "-";
}

document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("close")) {
        event.target.parentElement.classList.toggle("hidden");
        event.target.parentElement.classList.toggle("visible");
        document.querySelector(".container").classList.toggle("innactive");
    }

    if (event.target.classList.contains("innactive")) {
        if (document.querySelector(".popup.visible")) {
            let el = document.querySelector(".popup.visible");
            el.classList.toggle("hidden");
            el.classList.toggle("visible");
            event.target.classList.toggle("innactive");
        }
    }
});

function drawLeaderboard() {
    let tableWrapper = document.querySelector(".leaderboard-table-wrapper");

    tableWrapper.textContent = "";

    if (!sessionScores.length) {
        tableWrapper.textContent = "No results yet";
        return;
    }

    const table = createElement("table", {
        className: "leaderboard-table",
        children: [
            createElement("tr", {
                children: [
                    createElement("th", {}, "Score"),
                    createElement("th", {}, "Player"),
                ],
            }),
        ],
    });
    tableWrapper.append(table);
    sessionScores.forEach((el, idx) => {
        let rowEl = createElement("tr", {
            children: [
                createElement("td", {}, `${idx + 1}. ${el.score}`),
                createElement("td", {}, el.name),
            ],
        });
        table.append(rowEl);
    });
}

function showHidePopup() {
    document.querySelector(`.${this.id}`).classList.toggle("hidden");
    document.querySelector(`.${this.id}`).classList.toggle("visible");
    document.querySelector(".container").classList.toggle("innactive");
}

document.querySelector("#instructions").onclick = showHidePopup;
document.querySelector("#leaderboard").addEventListener("click", function () {
    showHidePopup.apply(this);
    drawLeaderboard();
});

startGame({});
