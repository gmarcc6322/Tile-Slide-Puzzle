class Game {
    constructor(gameLevel, localGameDataObject, moves, board) {
        this.container = document.querySelector(".board");
        this.gameLevel = gameLevel;
        this.rows = 2;
        this.cols = 3;
        this.cellsCount = this.rows * this.cols;
        this.START_BOARD_ARR = Game.generateStartBoard(this.cellsCount);
        this.isWin = false;
        this.localGameData = localGameDataObject || {};
        if (!this.localGameData[gameLevel] || typeof this.localGameData[gameLevel] !== "object") {
            this.localGameData[gameLevel] = { isAccessible: true };
        }
        this.isComplitedByHuman = true;
        this.board = board || this.createRandomBoard();
        this.move = this.move.bind(this);
        this.moveCount = moves || 0;

        this.init(this.board);

        this.renderResultsTable(this.localGameData);

        document.querySelector("#save").addEventListener("click", () => {
            this.reset();
        });
        const swipes = new Hammer(this.container);
        swipes.get("swipe").set({
            direction: Hammer.DIRECTION_ALL,
        });
        swipes.on("swipeleft swiperight swipeup swipedown", this.moveControls.bind(this));
        document.addEventListener("keyup", this.moveControls.bind(this));
    }
    static convertArrayToBoard(boardArray) {
        return boardArray.reduce((board, cell, idx) => {
            board[idx] = cell;
            return board;
        }, {});
    }
    static generateStartBoard(cellsCount) {
        let startBoardArr = [];

        for (let i = 1; i < cellsCount; i++) {
            startBoardArr.push(i);
        }
        startBoardArr.push("empty");

        return startBoardArr;
    }
    canBoardWin(array) {
        // Check if Start board is the same after ramdomize
        let startBoardPosition = array.every((el, idx) => {
            return el === this.START_BOARD_ARR[idx];
        });

        if (startBoardPosition) return false;

        // Check can board win
        let parity = 0;

        let gridWidth = this.cols;

        let row = 0;
        let blankRow = 0;

        for (let i = 0; i < array.length; i++) {
            if (i % gridWidth == 0) {
                row++;
            }
            if (array[i] == "empty") {
                blankRow = row;
                continue;
            }
            for (let j = i + 1; j < array.length; j++) {
                if (array[i] > array[j] && array[j] != "empty") {
                    parity++;
                }
            }
        }

        if (gridWidth % 2 == 0) {
            if (blankRow % 2 == 0) {
                return parity % 2 == 0;
            } else {
                return parity % 2 != 0;
            }
        } else {
            return parity % 2 == 0;
        }
    }
    checkWin() {
        return this.START_BOARD_ARR.every((number, index) =>
            this.board[index] !== "empty"
                ? this.board[index].props.number === number
                : this.board[index] === number
        );
    }
    createRandomBoard() {
        let randomBoard = this.START_BOARD_ARR.concat().sort(() => Math.random() - 0.5);

        if (this.canBoardWin(randomBoard)) {
            return Game.convertArrayToBoard(randomBoard);
        }

        return this.createRandomBoard();
    }
    getIndex(number) {
        for (let index = 0; index < this.cellsCount; index++) {
            if (this.board[index] === "empty") {
                if (number === "empty") {
                    return index;
                }
            } else if (this.board[index].props.number === number) {
                return index;
            }
        }
    }
    getMoveData(number) {
        if (number === "empty") return undefined;
        const currentIndex = this.getIndex(number),
            sublingsItems = this.getSiblingsIndex(currentIndex),
            possibleMove = ["LEFT", "RIGHT", "TOP", "BOTTOM"].find(
                (direction) =>
                    sublingsItems[direction] != null &&
                    this.board[sublingsItems[direction]] === "empty"
            );
        if (!possibleMove) {
            return;
        }
        return {
            direction: possibleMove,
            from: currentIndex,
            to: sublingsItems[possibleMove],
        };
    }
    getPosition(index) {
        return {
            row: Math.floor(index / this.cols),
            cell: index % this.cols,
        };
    }
    getSiblingsIndex(currentIndex) {
        const leftItemIndex = currentIndex % this.cols === 0 ? null : currentIndex - 1,
            rightItemIndex =
                currentIndex % this.cols === this.cols - 1 ? null : currentIndex + 1,
            topItemIndex = currentIndex < this.cols ? null : currentIndex - this.cols,
            bottomItemIndex =
                currentIndex > this.cellsCount - this.cols - 1
                    ? null
                    : currentIndex + this.cols;
        return {
            LEFT: leftItemIndex,
            RIGHT: rightItemIndex,
            TOP: topItemIndex,
            BOTTOM: bottomItemIndex,
        };
    }
    init(board) {
        const cells = [];

        for (let i = 0; i <= this.cellsCount - 1; i++) {
            const number = board[i];

            if (number !== "empty") {
                const cell = new Cell(
                    {
                        number,
                        onMove: this.move,
                    },
                    this.container,
                    this.rows,
                    this.cols
                );

                this.board[i] = cell;
                cells.push(cell.element);
            } else {
                this.board[i] = number;
            }
        }
        this.render();
        render(cells, this.container);
    }
    reset() {
        this.isWin = false;
        this.isComplitedByHuman = true;
        this.moveCount = 0;
        this.board = this.createRandomBoard();

        document.querySelector(".controls__main").classList.remove("none");
        document.querySelector(".controls__game").classList.remove("none");

        const cells = [];

        for (let i = 0; i <= this.cellsCount - 1; i++) {
            const number = this.board[i];

            if (number !== "empty") {
                const cell = new Cell(
                    {
                        number,
                        onMove: this.move,
                    },
                    this.container,
                    this.rows,
                    this.cols
                );

                this.board[i] = cell;
                cells.push(cell.element);
            } else {
                this.board[i] = number;
            }
        }
        this.container.innerHTML = "";
        this.render();
        render(cells, this.container);
        document.querySelector(".game-stats__moves--value").textContent = this.moveCount;
        document.querySelector(".game-stats").classList.remove("hidden");
    }
    moveControls(event) {
        let from;
        if (event.code === "ArrowUp" || event.type === "swipeup") from = "BOTTOM";
        if (event.code === "ArrowDown" || event.type === "swipedown") from = "TOP";
        if (event.code === "ArrowLeft" || event.type === "swipeleft") from = "RIGHT";
        if (event.code === "ArrowRight" || event.type === "swiperight") from = "LEFT";

        const emptyIndex = this.getIndex("empty"),
            siblings = this.getSiblingsIndex(emptyIndex);
        if (siblings[from] >= 0 && siblings[from] != null) {
            this.move(this.board[siblings[from]]);
        }
    }
    move(cell) {
        if (this.isWin) {
            return;
        }
        const moveData = this.getMoveData(cell.props.number);

        if (moveData) {
            this.board[moveData.to] = cell;
            this.board[moveData.from] = "empty";
        }
        this.moveCount++;
        this.render();

        if (this.checkWin()) {
            this.win();
        }
    }
    render() {
        for (let i = 0; i <= this.cellsCount - 1; i++) {
            const Cell = this.board[i];

            if (Cell !== "empty") {
                Cell.changeProps({
                    canMove: !!this.getMoveData(Cell.props.number),
                    position: this.getPosition(i),
                });
            }
        }
        document.querySelector(".game-stats__moves--value").textContent = this.moveCount;
    }
    renderResultsTable(resultsObject) {
        document.querySelector(
            ".game-stats__local--level"
        ).textContent = `${this.rows}x${this.cols}`;
    }
    renderConsoleBoard() {
        let boardArray = [];
        for (let key in this.board) {
            if (!this.board[key].props) {
                boardArray.push("");
            } else {
                boardArray.push(this.board[key].props.number);
            }
        }

        let boardDim = this.cols;
        console.log("--- board ---");

        for (let row = 0; row < this.rows; row++) {
            let rowStr = "";
            for (let col = 0; col < boardDim; col++) {
                let el = boardArray[col + row * boardDim];

                if (el === "") {
                    rowStr += "ee ";
                } else {
                    rowStr += el.toString().padStart(2, "0") + " ";
                }
            }

            console.log(rowStr);
        }
    }

    win() {
        document.body.classList.remove("innactive");
        document.querySelector(".controls__main").classList.remove("none");
        document.querySelector(".controls__game").classList.remove("none");
        this.isWin = true;

        this.container.innerHTML = "";
        const newGame = createElement("div", {
            className: "win",
            children: [
                createElement("div", {}, `Solved!\nYour result: ${this.moveCount}`),
                createElement("div", {
                    className: "win-controls",
                    children: [
                        createElement(
                            "div",
                            {
                                className: "win-controls__retry",
                            },
                            "Retry again"
                        ),
                    ],
                }),
            ],
        });
        newGame.lastChild.children[0].addEventListener("click", () => {
            this.isWin = true;
            startGame({
                level: this.gameLevel,
                localGameDataObject: this.localGameData,
            });
        });
        render(newGame, this.container);
        if (this.isComplitedByHuman) {
            let playerName = "Unknown Hero";
            const submitResultEl = createElement("div", {
                className: "submit-result popup",
                children: [
                    createElement("div", {}, "Solved!"),
                    createElement("input", {
                        type: "text",
                        placeholder: "What's your name, champ?",
                    }),
                    createElement("button", {}, "Submit"),
                ],
            });
            submitResultEl.children[2].onclick = () => {
                if (submitResultEl.children[1].value.length > 0) {
                    playerName = submitResultEl.children[1].value;
                }
                document.querySelector(".container").classList.remove("innactive");
                submitResultEl.children[1].blur();
                submitResultEl.style.display = "none";
                addSessionScore(this.moveCount, playerName);
            };
            submitResultEl.children[1].addEventListener("keyup", function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    submitResultEl.children[2].click();
                }
            });
            render(submitResultEl, document.querySelector(".popups"));

            submitResultEl.querySelector("input").focus();
            document.querySelector(".container").classList.add("innactive");
        }
    }
}
