"use strict";

var Checkerboard = (function() {
    const _data = {
        status: 0,
        board: null,
        hash: null,
        statusLabel: null,
        colorOfPlayer: null,
        colorOfEnemy: null,
        checkerboard: null,
        clickOfPlayer: {click: null, clickRow: null, clickCol: null},
        selectedChecker: {checker: null, checkerRow: null, checkerCol: null, id: null},
        moveIsOver: -1,
        stepCount: 0,
        effectiveCheckers: [],
        acceptableSteps: [],
        game: null,
        idInterval: 0
    };

    return {
        stepCounter: (function() {
            var count = 0;

            return function() {
                return ++count;
            };
        })(),
        statDump: function(json = false) {
            _data.stepCount = this.stepCounter();

            if (json) {
                var logJSON = JSON.stringify(_data, function(key, value) {
                    return (key === "board") ? "...VIRTUALBOARD..." : value;
                }, 2);

                console.log(logJSON);
            } else {
                console.log(`===============dump[${_data.stepCount}]===============`);

                console.log(`Color of player: 	${_data.colorOfPlayer}`);
                console.log(`Color of enemy: 	${_data.colorOfEnemy}`);
                console.log(`Move is over: 		${_data.moveIsOver}`);
                console.log(`Step count: 		${_data.stepCount}`);

                console.log("[Click of player]\n");
                console.log(_data.clickOfPlayer);
                console.log("\n");

                console.log("[Selecred checker]\n");
                console.log(_data.selectedChecker);
                console.log("\n");

                console.log("[Effective checkers]\n");
                console.log(_data.effectiveCheckers);
                console.log("\n");

                console.log("[Acceptable steps]: \n");
                console.log(_data.acceptableSteps);

                console.log("=====================================");
            }
        },
        init: function(hash, statusLabel, game) {
            let self = this, initialize, initBoard,
                preloader = document.createElement("div"),
                loader = document.createElement("div"),
                load = document.createElement("div"),
                cube1 = document.createElement("div"),
                cube2 = document.createElement("div");

            initBoard = function (responseCode, response) {
                if (responseCode === "board") {
                    let responseData = JSON.parse(response['data']);
                    _data.status = responseData['status'];
                    _data.board = JSON.parse(response['board']);
                    _data.colorOfPlayer = responseData['owner'];
                    _data.colorOfEnemy = (_data.colorOfPlayer === "white") ? "black" : "white";
                }
            };

            Ajax.createRequest("POST", "php/server.php", `hash=${hash}&initboard=1`, initBoard);

            initialize = function () {
                let addChecker, createCell,
                    checkerWhite = "checker-white",
                    checkerBlack = "checker-black",
                    checkerBlackQueen = "checker-black-queen",
                    checkerWhiteQueen = "checker-white-queen",
                    waitingEnemy, params, cells;

                addChecker = function(cell, i, j) {
                    let checker = document.createElement("div");

                    switch (_data.board[i][j]) {
                        case "w": checker.classList.add(checkerWhite); break;
                        case "b": checker.classList.add(checkerBlack); break;
                        case "B": checker.classList.add(checkerBlackQueen); break;
                        case "W": checker.classList.add(checkerWhiteQueen); break;
                        default: return;
                    }

                    cell.appendChild(checker);
                };

                createCell = function(color, i, j) {
                    let cell = document.createElement("div");

                    cell.setAttribute("id", "r" + i + "c" + j);
                    cell.classList.add("cell-" + color);
                    _data.checkerboard.appendChild(cell);

                    if (_data.status === "2") {
                        cell.onclick = (color === "black") ? self.forClick.bind(self) : null;
                    }
                };

                waitingEnemy = function (responseCode, response) {
                    switch (responseCode) {
                        case "9":
                            clearInterval(_data.idInterval);
                            statusLabel.innerHTML = "Your turn.";

                            _data.board = JSON.parse(response['data']);
                            self.reinit();
                            for (let i = 0, length = cells.length; i < length; ++i) {
                                cells[i].onclick = self.forClick.bind(self);
                            }
                            _data.checkerboard.classList.remove("waiting-move");
                            break;
                        case "10": {
                            location.reload();
                        }
                    }
                };

                for (let i = 0, row = _data.board.length; i < row; ++i) {
                    for (let j = 0, col = _data.board[i].length; j < col; ++j) {
                        if (i === 0 || i % 2 === 0) {
                            if (j === 0 || j % 2 === 0) createCell("white", i, j);
                            else createCell("black", i, j);
                        } else {
                            if (j === 0 || j % 2 === 0) createCell("black", i, j);
                            else createCell("white", i, j);
                        }

                        addChecker(document.getElementById("r" + i + "c" + j), i, j);
                    }
                }

                if (_data.status === "3") {
                    statusLabel.innerHTML = "The opponent makes a move....";
                    _data.checkerboard.classList.add("waiting-move");
                    cells = document.querySelectorAll(".cell-black");
                    for (let i = 0, length = cells.length; i < length; ++i) cells[i].onclick = null;

                    params = `hash=${_data.hash}&check=1`;

                    _data.idInterval = setInterval(function () {
                        Ajax.createRequest("POST", "php/server_interval.php", params, waitingEnemy);
                    }, 1500);

                } else if(_data.status === "2") {
                    statusLabel.innerHTML = "Your turn.";
                }
            };

            _data.hash = hash;
            _data.game = game;
            _data.statusLabel = statusLabel;
            _data.checkerboard = document.createElement("div");
            _data.checkerboard.classList.add("checkerboard");

            preloader.classList.add("preloader");
            loader.classList.add("loader");
            load.classList.add("spinner");
            cube1.classList.add("cube1");
            cube2.classList.add("cube2");

            _data.checkerboard.appendChild(preloader);
            preloader.appendChild(loader);
            load.appendChild(cube1);
            load.appendChild(cube2);
            loader.appendChild(load);
            _data.game.appendChild(_data.checkerboard);

            _data.idInterval = setInterval(function () {
                if (_data.board !== null) {
                    clearInterval(_data.idInterval);
                    _data.checkerboard.removeChild(preloader);
                    initialize();
                }
            }, 1000);
        },
        reinit: function () {
            let checkerList, addChecker,
                cellWhite = "checker-white",
                cellBlack = "checker-black",
                cellBlackQueen = "checker-black-queen",
                cellWhiteQueen = "checker-white-queen";

            checkerList = document.querySelectorAll(`.${cellWhite}, .${cellBlack}, .${cellBlackQueen}, .${cellWhiteQueen}`);

            for (let i = 0, length = checkerList.length; i < length; ++i) {
                checkerList[i].parentNode.removeChild(checkerList[i]);
            }

            addChecker = function(cell, i, j) {
                let checker = document.createElement("div");

                switch (_data.board[i][j]) {
                    case "w": checker.classList.add(cellWhite); break;
                    case "b": checker.classList.add(cellBlack); break;
                    case "B": checker.classList.add(cellBlackQueen); break;
                    case "W": checker.classList.add(cellWhiteQueen); break;
                    default: return;
                }

                cell.appendChild(checker);
            };

            for (let i = 0, row = _data.board.length; i < row; ++i) {
                for (let j = 0, col = _data.board[i].length; j < col; ++j) {
                    addChecker(document.getElementById("r" + i + "c" + j), i, j);
                }
            }
        },
        getRow: function() {
            var id = this.getAttribute("id");
            return +id.substring(1,2);
        },
        getCol: function() {
            var id = this.getAttribute("id");
            return +id.substring(3);
        },
        selectChecker: function() {
            _data.selectedChecker.checker = _data.clickOfPlayer.click.querySelector("div");
            _data.selectedChecker.checker.classList.add("selected");
            _data.selectedChecker.checkerRow = _data.clickOfPlayer.clickRow;
            _data.selectedChecker.checkerCol = _data.clickOfPlayer.clickCol;

            var id = setInterval(function() {
                _data.selectedChecker.checker.hidden = _data.selectedChecker.checker.hidden ? false : true;
            }, 500);

            _data.selectedChecker.checker.setAttribute("id", `I:${id}`);
            _data.selectedChecker.id = id;
        },
        unselectChecker: function() {
            _data.selectedChecker.checker.classList.remove("selected");
            _data.selectedChecker.checker.removeAttribute("id");
            _data.selectedChecker.checker.hidden = false;
            clearInterval(_data.selectedChecker.id);

            _data.selectedChecker.checker = null;
            _data.selectedChecker.checkerRow = null;
            _data.selectedChecker.checkerCol = null;
            _data.selectedChecker.id = null;
        },
        findEnemies: function() {
            var foundPoints = [], checkerList, checkerRow, checkerCol;
            checkerList = document.querySelectorAll(`.checker-${_data.colorOfPlayer}, .checker-${_data.colorOfPlayer}-queen`);

            for (let i = 0, length = checkerList.length; i < length; ++i) {
                checkerRow = this.getRow.call(checkerList[i].parentElement);
                checkerCol = this.getCol.call(checkerList[i].parentElement);

                if (this.getAcceptableSteps(checkerRow, checkerCol, true)) {
                    foundPoints.push("r" + this.getRow.call(checkerList[i].parentElement) + "c" + this.getCol.call(checkerList[i].parentElement));
                }
            }

            _data.effectiveCheckers = foundPoints;
        },
        getAcceptableSteps: function(checkerRow, checkerCol, findEnemies, conditionsOfVictory = false) {
            var cells = [],
                checkerMask = _data.board[checkerRow][checkerCol],
                colorOfPlayer = _data.colorOfPlayer,
                colorOfEnemy = _data.colorOfEnemy;

            if (conditionsOfVictory) {
                colorOfPlayer = _data.colorOfEnemy;
                colorOfEnemy = _data.colorOfPlayer;
            }

            var validate = function(value) {
                var re = /^r[0-7]c[0-7]$/;
                value += "";
                if (value.match(re) !== null) return true;

                return false;
            };

            var getCells = function() {
                var cells = [];

                if (checkerMask === "W" || checkerMask === "B") {
                    var fl = Array(),
                        fr = Array(),
                        bl = Array(),
                        br = Array(),
                        point;

                    for (let i = checkerRow - 1; i >= 0; --i) {
                        point = "r" + i + "c" + (checkerCol - (checkerRow - i));

                        if (validate(point)) fl.push("fl:" + point);
                        else fl.push(null);

                        point = "r" + i + "c" + (checkerCol + (checkerRow - i));

                        if (validate(point)) fr.push("fr:" + point);
                        else fr.push(null);
                    }

                    for (let i = checkerRow + 1; i <= 7; ++i) {
                        point = "r" + i + "c" + (checkerCol + (checkerRow - i));

                        if (validate(point)) bl.push("bl:" + point);
                        else bl.push(null);

                        point = "r" + i + "c" + (checkerCol - (checkerRow - i));

                        if (validate(point)) br.push("br:" + point);
                        else br.push(null);
                    }

                    cells.push(fl, fr, bl, br);

                    return cells;
                } else if (checkerMask === "w") {
                    var forward = checkerRow - 1,
                        backward =  checkerRow + 1;
                } else if (checkerMask === "b") {
                    var forward = checkerRow + 1,
                        backward =  checkerRow - 1;
                }

                var left = checkerCol - 1,
                    right = checkerCol + 1,
                    fl = "r" + forward + "c" + left,
                    fr = "r" + forward + "c" + right,
                    bl = "r" + backward + "c" + left,
                    br = "r" + backward + "c" + right;

                if (validate(fl)) cells.push("fl:" + fl);
                else cells.push(null);

                if (validate(fr)) cells.push("fr:" + fr);
                else cells.push(null);

                if (validate(bl)) cells.push("bl:" + bl);
                else cells.push(null);

                if (validate(br)) cells.push("br:" + br);
                else cells.push(null);

                return cells;
            };

            var getSteps = function(point) {
                if (point !== null) {
                    var row = +point.substring(4,5),
                        col = +point.substring(6),
                        enemyChecker = [];
                    //	= virtualBoard[row][col];

                    if (_data.board[row][col] === colorOfEnemy.substring(0, 1) || _data.board[row][col] === colorOfEnemy.substring(0, 1).toUpperCase()) {
                        if (checkerRow > row) {
                            if (checkerCol > col) {
                                --row;
                                --col;
                            } else if (checkerCol < col) {
                                --row;
                                ++col;
                            }
                        } else if (checkerRow < row) {
                            if (checkerCol > col) {
                                ++row;
                                --col;
                            } else if (checkerCol < col) {
                                ++row;
                                ++col;
                            }
                        }

                        if (validate("r" + row + "c" + col) && (_data.board[row][col] === " ")) {
                            if (!findEnemies) {
                                enemyChecker.push("r" + point.substring(4,5) + "c" + point.substring(6));
                                enemyChecker.push("r" + row + "c" + col);
                            } else return true;
                        }
                    } else if (_data.board[row][col] === " ") {
                        if (!findEnemies) {
                            if ((point.indexOf("bl:") === -1) && (point.indexOf("br:") === -1)) acceptableSteps.push("r" + row + "c" + col);
                        }
                    }

                    if (!findEnemies) {
                        if (enemyChecker.length > 0) enemies.push(enemyChecker);
                    }
                }
            };

            var getStepsQueen = function (cells) {
                var count = false,
                    enemyChecker = [],
                    point;

                for (let i = 0; i < cells.length; ++i) {
                    point = cells[i];

                    if (point !== null) {
                        var row = +point.substring(4,5),
                            col = +point.substring(6);

                        if (_data.board[row][col].toLowerCase() === colorOfPlayer.substring(0, 1).toLowerCase() || _data.board[row][col] === "k") {
                            break;
                        } else if (_data.board[row][col] === colorOfEnemy.substring(0, 1) || _data.board[row][col] === colorOfEnemy.substring(0, 1).toUpperCase()) {
                            if (!findEnemies) {
                                if (!count) {
                                    enemyChecker.push("r" + row + "c" + col);
                                    count = true;
                                } else break;
                            } else count = count ? false : true;
                        } else if (_data.board[row][col] === " ") {
                            if (!findEnemies) {
                                if (count) {
                                    enemyChecker.push("r" + row + "c" + col);
                                } else acceptableSteps.push("r" + row + "c" + col);
                            } else if (count) return true;
                        }
                    }
                }

                if (!findEnemies && enemyChecker.length > 1) enemies.push(enemyChecker);
            };

            if (findEnemies) {
                cells = getCells();

                if (checkerMask === "W" || checkerMask === "B") {
                    for (let i = 0, length = cells.length; i < length; ++i) {
                        if (getStepsQueen(cells[i])) return true;
                    }
                } else {
                    for (let i = 0, length = cells.length; i < length; ++i) {
                        if (getSteps(cells[i])) return true;
                    }
                }
            } else {
                var acceptableSteps = [], enemies = [], result = [],
                    cells = getCells();

                if (checkerMask === "W" || checkerMask === "B") {
                    cells.forEach(getStepsQueen);
                } else cells.forEach(getSteps);

                result.push(acceptableSteps, enemies);
                _data.acceptableSteps = result;
            }
        },
        toStep: function(acceptableSteps) {
            var	clickPoint = "r" + _data.clickOfPlayer.clickRow + "c" + _data.clickOfPlayer.clickCol,
                checkerMask = _data.board[_data.selectedChecker.checkerRow][_data.selectedChecker.checkerCol];

            var step = function() {
                var clickRow = _data.clickOfPlayer.clickRow,
                    clickCol = _data.clickOfPlayer.clickCol,
                    click = _data.clickOfPlayer.click,
                    checker;

                click.appendChild(document.createElement("div"));
                checker = click.querySelector("div");

                switch (checkerMask) {
                    case "w":
                        if (clickRow === 0) {
                            checker.classList.toggle("checker-white-queen", true);
                            _data.board[clickRow][clickCol] = "W";
                        } else {
                            checker.classList.toggle("checker-white", true);
                            _data.board[clickRow][clickCol] = "w";
                        }
                        break;
                    case "W":
                        checker.classList.toggle("checker-white-queen", true);
                        _data.board[clickRow][clickCol] = "W";
                        break;
                    case "b":
                        if (clickRow === 7) {
                            checker.classList.toggle("checker-black-queen", true);
                            _data.board[clickRow][clickCol] = "B";
                        } else {
                            checker.classList.toggle("checker-black", true);
                            _data.board[clickRow][clickCol] = "b";
                        }
                        break;
                    case "B":
                        checker.classList.toggle("checker-black-queen", true);
                        _data.board[clickRow][clickCol] = "B";
                }
            };

            if (_data.acceptableSteps[1].length > 0) {
                var enemyChecker, enemyRow, enemyCol,
                    foundStep = false;

                findStep:
                    for (let i = 0, length = _data.acceptableSteps[1].length; i < length; ++i) {
                        for (let j = 1, len = _data.acceptableSteps[1][i].length; j < len; ++j) {
                            if (clickPoint === _data.acceptableSteps[1][i][j]) {
                                _data.selectedChecker.checker.parentElement.removeChild(_data.selectedChecker.checker);
                                _data.board[_data.selectedChecker.checkerRow][_data.selectedChecker.checkerCol] = " ";

                                enemyChecker = this.getChecker(_data.acceptableSteps[1][i][0]);
                                enemyRow = this.getRow.call(enemyChecker);
                                enemyCol = this.getCol.call(enemyChecker);
                                enemyChecker.querySelector("div").classList.add("killed");
                                _data.board[enemyRow][enemyCol] = "k";

                                this.unselectChecker();
                                foundStep = true;
                                break findStep;
                            }
                        }
                    }

                if (foundStep) {
                    step();
                    this.getAcceptableSteps(_data.clickOfPlayer.clickRow, _data.clickOfPlayer.clickCol, false);
                    if (_data.acceptableSteps[1].length > 0) {
                        this.selectChecker();
                        this.toPrompt();
                        this.toPrompt(_data.acceptableSteps);
                        return 0;
                    } else {
                        var delKilled = function(enemyChecker) {
                            _data.board[this.getRow.call(enemyChecker.parentElement)][this.getCol.call(enemyChecker.parentElement)] = " ";
                            enemyChecker.parentElement.removeChild(enemyChecker);
                        };

                        document.querySelectorAll(".killed").forEach(delKilled.bind(this));

                        return 1;
                    }
                }
            } else if (_data.acceptableSteps[0].indexOf(clickPoint) !== -1) {
                _data.selectedChecker.checker.parentElement.removeChild(_data.selectedChecker.checker);
                step();

                _data.board[_data.selectedChecker.checkerRow][_data.selectedChecker.checkerCol] = " ";
                this.unselectChecker();
                return 1;
            }

            return (_data.moveIsOver === -1) ? -1 : 0;
        },
        getChecker: function(id) {
            return document.querySelector("#" + id);
        },
        toPrompt: function(foundPoints, click) {
            var checker, checkerPrompt, points = Array();

            if (typeof foundPoints === "undefined") {
                checkerPrompt = document.querySelectorAll(".prompt");
                checkerPrompt.forEach(function(checkerPrompt) {checkerPrompt.classList.remove("prompt")});
                return;
            } else if (!click) {
                if (foundPoints[1].length > 0) {
                    for (let i = 0, length = foundPoints[1].length; i < length; ++i) {
                        foundPoints[1][i].splice(0,1);
                        foundPoints[1][i].forEach(function(step) {points.push(step)});
                    }

                    for (let i = points.length; i--;) {
                        checker = this.getChecker(points[i]);
                        if (!checker.querySelector(".selected")) checker.classList.add("prompt");
                    }
                } else if (foundPoints[0].length > 0) {
                    for (let i = foundPoints[0].length; i--;) {
                        checker = this.getChecker(foundPoints[0][i]);
                        if (!checker.querySelector(".selected")) checker.classList.add("prompt");
                    }
                }
            } else {
                for (let i = foundPoints.length; i--;) {
                    checker = this.getChecker(foundPoints[i]);
                    if (!checker.querySelector(".selected")) checker.classList.add("prompt");
                }

                _data.clickOfPlayer.click.classList.add("bad-choice");

                setTimeout(function() {
                    checkerPrompt = document.querySelectorAll(".prompt, .bad-choice");
                    checkerPrompt.forEach(function(checkerPrompt) {
                        checkerPrompt.classList.remove("prompt");
                        checkerPrompt.classList.remove("bad-choice");
                    });
                }, 600);
            }
        },
        finishMove: function() {
            let self = this, cells, params, waitingEnemy;

            _data.statusLabel.innerHTML = "The opponent makes a move...";
            _data.checkerboard.classList.add("waiting-move");
            _data.clickOfPlayer.click = null;
            _data.clickOfPlayer.clickRow = null;
            _data.clickOfPlayer.clickCol = null;
            _data.moveIsOver = -1;
            _data.effectiveCheckers = [];
            _data.acceptableSteps = [];
            cells = document.querySelectorAll(".cell-black");

            for (let i = 0, length = cells.length; i < length; ++i) cells[i].onclick = null;

            params = `hash=${_data.hash}&boardData=` + JSON.stringify(_data.board);
            Ajax.createRequest("POST", "php/server_interval.php", params);

            waitingEnemy = function (responseCode, response) {
                switch (responseCode) {
                    case "9":
                        clearInterval(_data.idInterval);
                        _data.statusLabel.innerHTML = "Your turn.";

                        _data.board = JSON.parse(response['data']);
                        self.reinit();
                        for (let i = 0, length = cells.length; i < length; ++i) {
                            cells[i].onclick = self.forClick.bind(self);
                        }
                        _data.checkerboard.classList.remove("waiting-move");
                        break;
                    case "10": {
                        location.reload();
                    }
                }
            };

            params = `hash=${_data.hash}&check=1`;

            _data.idInterval = setInterval(function () {
                Ajax.createRequest("POST", "php/server_interval.php", params, waitingEnemy);
            }, 1500);
        },
        forClick: function(event) {
            var checkerMask;

            _data.clickOfPlayer.click = event.currentTarget;
            _data.clickOfPlayer.clickRow = this.getRow.call(_data.clickOfPlayer.click);
            _data.clickOfPlayer.clickCol = this.getCol.call(_data.clickOfPlayer.click);
            checkerMask = _data.board[_data.clickOfPlayer.clickRow][_data.clickOfPlayer.clickCol];

            if (checkerMask === _data.colorOfPlayer.substring(0,1) || checkerMask === _data.colorOfPlayer.substring(0,1).toUpperCase()) {
                this.findEnemies();

                if (_data.selectedChecker.checker === null) {
                    if (_data.effectiveCheckers.length > 0) {
                        if (_data.effectiveCheckers.indexOf("r" + _data.clickOfPlayer.clickRow + "c" + _data.clickOfPlayer.clickCol) !== -1) {
                            this.selectChecker();
                            this.getAcceptableSteps(_data.selectedChecker.checkerRow, _data.selectedChecker.checkerCol, false);
                            this.toPrompt(_data.acceptableSteps);
                        } else {
                            this.toPrompt();
                            this.toPrompt(_data.effectiveCheckers, _data.clickOfPlayer.click);
                        }
                    } else {
                        this.getAcceptableSteps(_data.clickOfPlayer.clickRow, _data.clickOfPlayer.clickCol, false);

                        if (_data.acceptableSteps[0].length > 0) {
                            this.selectChecker();
                            this.toPrompt(_data.acceptableSteps);
                        } else this.toPrompt(_data.effectiveCheckers, _data.clickOfPlayer.click);
                    }
                } else if (_data.moveIsOver !== 0) {
                    if (_data.effectiveCheckers.length > 0) {
                        if (_data.effectiveCheckers.indexOf("r" + _data.clickOfPlayer.clickRow + "c" + _data.clickOfPlayer.clickCol) !== -1) {
                            this.unselectChecker();
                            this.selectChecker();
                            this.toPrompt();
                            this.getAcceptableSteps(_data.selectedChecker.checkerRow, _data.selectedChecker.checkerCol, false);
                            this.toPrompt(_data.acceptableSteps);
                        } else {
                            this.unselectChecker();
                            this.toPrompt();
                            this.toPrompt(_data.effectiveCheckers, _data.clickOfPlayer.click);
                        }
                    } else {
                        this.unselectChecker();
                        this.toPrompt();
                        this.getAcceptableSteps(_data.clickOfPlayer.clickRow, _data.clickOfPlayer.clickCol, false);

                        if (_data.acceptableSteps[0].length > 0) {
                            this.selectChecker(_data.clickOfPlayer.click);
                            this.toPrompt(_data.acceptableSteps);
                        } else this.toPrompt(_data.effectiveCheckers, _data.clickOfPlayer.click);
                    }
                }
            } else if (checkerMask === " " && _data.selectedChecker.checker !== null) {
                this.getAcceptableSteps(this.getRow.call(_data.selectedChecker.checker.parentElement), this.getCol.call(_data.selectedChecker.checker.parentElement), false);

                if (_data.acceptableSteps[1].length > 0 || _data.acceptableSteps[0].length > 0) {
                    if (_data.moveIsOver === -1) {
                        /*	saveVirtualBoard = Array();
                            virtualBoard.forEach(function(subArray) {
                                saveVirtualBoard.push(subArray.slice(0));
                            });
                            saveOwner = owner;*/
                    }
                    _data.moveIsOver = this.toStep(_data.acceptableSteps);

                    if (_data.moveIsOver === 1) {
                        /*	stepBackButton.removeAttribute("disabled");
                            soundOfStep.currentTime = 0;
                            soundOfStep.play();*/
                        if (this.conditionsOfVictory()) {
                            this.win();
                        } else {
                            this.toPrompt();
                            this.finishMove();
                        }


                        /*	if (victory(owner)) {
                                victoryWindow.querySelector(".b-popup-content div").innerHTML = "Color of winner: " + owner.toUpperCase();
                                victoryWindow.classList.add("b-popup-active");
                            } else {
                                owner = (owner === "white") ? "black" : "white";
                            }*/
                    } else if (_data.moveIsOver === 0) {
                        /*	soundOfStep.currentTime = 0;
                            soundOfStep.play();*/
                    }
                }
            }
            //this.statDump();
        },
        conditionsOfVictory: function () {
            let checkersOfEnemy = document.querySelectorAll(`.checker-${_data.colorOfEnemy}, .checker-${_data.colorOfEnemy}-queen`);

            if (checkersOfEnemy.length !== 0) {
                let check = true;
                for (let i = 0, length = checkersOfEnemy.length; i < length; ++i) {
                    let checkerRow = this.getRow.call(checkersOfEnemy[i].parentElement),
                        checkerCol = this.getCol.call(checkersOfEnemy[i].parentElement);
                    this.getAcceptableSteps(checkerRow, checkerCol, false, true);
                    if (_data.acceptableSteps[0].length !== 0) {
                        check = false;
                        break;
                    }
                }
                return check;
            } else return true;
        },
        win: function () {
            let params = `hash=${_data.hash}`;

            Ajax.createRequest("POST", "php/server_interval.php", params+"&winner=1");
            _data.game.innerHTML = "";
            location.reload();
        },
        leave: function () {
            let params = `hash=${_data.hash}`;

            clearInterval(_data.idInterval);
            Ajax.createRequest("POST", "php/server_interval.php", params+"&leave=1");
            _data.game.innerHTML = "";
            location.reload();
        }
    };
})();