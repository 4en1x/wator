(function() {
    let A = [];
    let h = 512;
    let boardSize = 128;
    let sharkDensity = 0.1;
    let fishDensity = 0.1;
    let sharkEnergy = 5;
    let sharkEnergyWhenEatFish = 10;
    let fishBornTime = 5;
    let sharkBornTime = 10;
    let ctx;
    let l;
    const neighbors = [[1, 1], [1, 0], [1, -1], [0, -1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    let timer = 0;


    let iter = 0;

    document.addEventListener("DOMContentLoaded", () => {
        ctx = document.getElementById("myCanvas").getContext("2d");
        clearField();
    });

    const colors = {
        "red": "#EC0000",
        "orange": "#ff6900",
        "yellow": "#ffbf00",
        "olive": "#b8d925",
        "green": "#a9ebbc",
        "teal": "#00bab0",
        "blue": "#0080d7",
        "violet": "#7100d0",
        "purple": "#b300ce",
        "pink": "#f20096",
        "brown": "#ad6532",
        "grey": "#767676",
    };

    let boardColorShark = colors["blue"];
    let boardColorFish = colors["green"];
    let blackColor = "#000000";

    startCanvas = () => {
        A = [];

        let localFishDensity = parseInt(document.getElementById("fishDensity").value) / 100.0 || fishDensity;
        let localSharkDensity = parseInt(document.getElementById("sharkDensity").value) / 100.0 || sharkDensity;
        if(localSharkDensity < 0 || localFishDensity < 0 || localSharkDensity + localFishDensity > 1) {
            alert("wrong density");
            return;
        }
        fishDensity = localFishDensity;
        sharkDensity = localSharkDensity;

        fishBornTime = parseInt(document.getElementById("fishBornTime").value) || fishBornTime;
        sharkBornTime = parseInt(document.getElementById("sharkBornTime").value) || sharkBornTime;
        sharkEnergyWhenEatFish = parseInt(document.getElementById("sharkEnergyWhenEatFish").value) || sharkEnergyWhenEatFish;
        sharkEnergy = parseInt(document.getElementById("sharkEnergy").value) || sharkEnergy;

        let boardSizeSelect = document.getElementById("boardSize");
        boardSize = parseInt(boardSizeSelect.options[boardSizeSelect.selectedIndex].text);

        if(!boardSize) {
            alert("please specify board size");
            return;
        }

        l = Math.floor(h / boardSize);

        clearField();
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                let vFish = fishDensity - Math.random();
                let vShark = sharkDensity - Math.random();

                while(vFish > 0 && vShark > 0) {
                    vFish = fishDensity - Math.random();
                    vShark = sharkDensity - Math.random();
                }

                if (vFish > 0) {
                    drawSquare(i * l, j * l, l - 1, boardColorFish);
                    A[i][j] = {
                        value: 1,
                        fishBornTime,
                        iter,
                    };
                }

                if (vShark > 0) {
                    drawSquare(i * l, j * l, l - 1, boardColorShark);
                    A[i][j] = {
                        value: -1,
                        sharkEnergy,
                        sharkBornTime,
                        iter,
                    };
                }
            }
        }
    };

    iteration = () => {
        iterationFish();
        iterationShark();

        drawSquare(0, 0, h, blackColor);
        iter += 1;

        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (A[i][j].value === 1) {
                    drawSquare(i * l, j * l, l - 1, boardColorFish);
                }
                if (A[i][j].value === -1) {
                    drawSquare(i * l, j * l, l - 1, boardColorShark);
                }
            }
        }
    };

    iterationFish = () => {
        for (let i = 0; i < A.length; i++) {
            for (let j = 0; j < A[i].length; j++) {
                if(A[i][j].value === 1 && A[i][j].iter === iter) {
                    let availableCells = availableNeighbors(i, j, 0);
                    if(availableCells.count > 0) {
                        let randomCell = availableCells.cells[Math.floor(Math.random() * availableCells.cells.length)];
                        A[i + randomCell[0]][j + randomCell[1]] = A[i][j];
                        A[i][j] = {
                            value: 0,
                        };

                        A[i + randomCell[0]][j + randomCell[1]].fishBornTime -= 1;
                        A[i + randomCell[0]][j + randomCell[1]].iter += 1;
                        bornNewFish(i + randomCell[0], j + randomCell[1], iter);
                    }
                    else {
                        A[i][j].fishBornTime -= 1;
                        A[i][j].iter += 1;
                    }
                }
            }
        }
    };

    bornNewFish = (i, j, iter) => {
        if(A[i][j].fishBornTime <= 0) {
            let availableCellsForNew = availableNeighbors(i, j, 0);
            if(availableCellsForNew.count > 0) {
                A[i][j].fishBornTime = fishBornTime;
                let randomCellNew = availableCellsForNew.cells[Math.floor(Math.random() * availableCellsForNew.cells.length)];
                A[i + randomCellNew[0]][j + randomCellNew[1]] = {
                    value: 1,
                    fishBornTime,
                    iter: iter + 1,
                };
            }
        }
    };

    bornNewShark = (i, j, iter) => {
        if(A[i][j].sharkBornTime <= 0) {
            let availableCellsForNew = availableNeighbors(i, j, 0);
            if(availableCellsForNew.count > 0) {
                A[i][j].sharkBornTime = sharkBornTime;
                let randomCellNew = availableCellsForNew.cells[Math.floor(Math.random() * availableCellsForNew.cells.length)];
                A[i + randomCellNew[0]][j + randomCellNew[1]] = {
                    value: -1,
                    sharkEnergy,
                    sharkBornTime,
                    iter: iter + 1,
                };
            }
            else{
                let availableCellsForNew = availableNeighbors(i, j, 1);
                if(availableCellsForNew.count > 0) {
                    A[i][j].sharkBornTime = sharkBornTime;
                    let randomCellNew = availableCellsForNew.cells[Math.floor(Math.random() * availableCellsForNew.cells.length)];
                    A[i + randomCellNew[0]][j + randomCellNew[1]] = {
                        value: -1,
                        sharkEnergy,
                        sharkBornTime,
                        iter: iter + 1,
                    };
                }
            }
        }
    };


    iterationShark = () => {
        for (let i = 0; i < A.length; i++) {
            for (let j = 0; j < A[i].length; j++) {
                if(A[i][j].value === -1 && A[i][j].iter === iter) {
                    let availableCells = availableNeighbors(i, j, 1);
                    if(availableCells.count > 0) {
                        let randomCell = availableCells.cells[Math.floor(Math.random() * availableCells.cells.length)];
                        A[i + randomCell[0]][j + randomCell[1]] = A[i][j];
                        A[i][j] = {
                            value: 0,
                        };

                        A[i + randomCell[0]][j + randomCell[1]].sharkEnergy = sharkEnergyWhenEatFish;
                        A[i + randomCell[0]][j + randomCell[1]].sharkBornTime -= 1;
                        A[i + randomCell[0]][j + randomCell[1]].iter += 1;
                        bornNewShark(i + randomCell[0], j + randomCell[1], iter);
                    }
                    else {
                        let availableCells = availableNeighbors(i, j, 0);
                        if(availableCells.count > 0) {
                            let randomCell = availableCells.cells[Math.floor(Math.random() * availableCells.cells.length)];
                            A[i + randomCell[0]][j + randomCell[1]] = A[i][j];
                            A[i][j] = {
                                value: 0,
                            };

                            A[i + randomCell[0]][j + randomCell[1]].sharkEnergy -= 1;
                            A[i + randomCell[0]][j + randomCell[1]].sharkBornTime -= 1;
                            A[i + randomCell[0]][j + randomCell[1]].iter += 1;
                            if(A[i + randomCell[0]][j + randomCell[1]].sharkEnergy <= 0) {
                                A[i + randomCell[0]][j + randomCell[1]] = {
                                    value: 0
                                };
                            }
                            else {
                                bornNewShark(i + randomCell[0], j + randomCell[1], iter)
                            }
                        }
                        else {
                            A[i][j].sharkEnergy -= 1;
                            A[i][j].sharkBornTime -= 1;
                            A[i][j].fishBornTime -= 1;
                            A[i][j].iter += 1;
                            if(A[i][j].sharkEnergy <= 0) {
                                A[i][j] = {
                                    value: 0
                                };
                            }
                        }
                    }
                }
            }
        }
    };

    availableNeighbors = (i, j, value) => {
        let availableCells = {
            count: 0,
            cells: []
        };
        neighbors.forEach(neighbor => {
            if((i + neighbor[0]) >= 0 && (i + neighbor[0]) < A.length
                && (j + neighbor[1]) >= 0 && (j + neighbor[1]) < A.length
                && A[i + neighbor[0]][j + neighbor[1]].value === value
            ) {
                availableCells.count += 1;
                availableCells.cells.push(neighbor);
            }
        });

        return availableCells;
    };

    clearField = () => {
        for (let i = 0; i < boardSize; i++) {
            A[i] = [];
            for (let j = 0; j < boardSize; j++) {
                A[i][j] = {
                    value: 0,
                }
            }
        }
        drawSquare(0, 0, h, blackColor);
    };

    drawSquare = (r, t, size, color) => {
        ctx.beginPath();
        ctx.rect(r, t, size, size);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    };

    changeColorShark = (color) => {
        boardColorShark = colors[color];
        document.getElementById('colorLabelShark').className = "ui empty circular label " + color;
    };

    changeColorFish = (color) => {
        boardColorFish = colors[color];
        document.getElementById('colorLabelFish').className = "ui empty circular label " + color;
    };

    addTimer = () => {
        timer = setInterval(iteration, 100);
        document.getElementById("addTimerButton").classList.add("disabled");
        document.getElementById("clearButton").classList.add("disabled");
        document.getElementById("iterationButton").classList.add("disabled");
    };

    removeTimer = () => {
        clearInterval(timer);
        document.getElementById("addTimerButton").classList.remove("disabled");
        document.getElementById("clearButton").classList.remove("disabled");
        document.getElementById("iterationButton").classList.remove("disabled");
    };

    return {
        changeColorShark,
        changeColorFish,
        startCanvas,
        iteration,
        addTimer,
        removeTimer,
    }
}());
