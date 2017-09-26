"use strict";
window.onload = function() {
    let toggle, sidebarLoginMenu, sidebarProfileMenu, thereIsLogin, thereIsProfile,
        wrapper = document.querySelector("#wrapper"),
        menuToggleButton = document.querySelector("#menu-toggle"),
        login = document.querySelector("#login"),
        profile = document.querySelector("#profile"),
        statusBox = document.querySelector(".box-status"),
        statusText = statusBox.querySelector(".text-status");

    toggle = function() {
        if (menuToggleButton.getAttribute("data-active") === "false") {
            wrapper.classList.add("active");
            menuToggleButton.setAttribute("data-active", "true");
        } else {
            wrapper.classList.remove("active");
            menuToggleButton.setAttribute("data-active", "false");
            if (sidebarLoginMenu) sidebarLoginMenu.hidden = true;
            if (sidebarProfileMenu) sidebarProfileMenu.hidden = true;
        }
    };

    thereIsLogin = function () {
        sidebarLoginMenu = document.querySelector("#sidebar-login-menu");
        login.onclick = function () {
            sidebarLoginMenu.hidden = !sidebarLoginMenu.hidden;
            if (menuToggleButton.getAttribute("data-active") === "false") toggle();
        };
    };

    thereIsProfile = function () {
        let searchButton,
            logout = document.querySelector("#logout"),
            gameBox = document.querySelector("#box-game");

        sidebarProfileMenu = document.querySelector("#sidebar-profile-menu");
        searchButton = sidebarProfileMenu.querySelector("button");

        logout.onclick = function () {
            let d = new Date(Date.now() - 3600 * 1000);
            d = d.toUTCString();
            document.cookie = "hash='';expires=" + d +";";
            //document.cookie = "login='';expires=" + d +";";
            location.reload();
        };

        profile.onclick = function () {
            sidebarProfileMenu.hidden = !sidebarProfileMenu.hidden;
            if (menuToggleButton.getAttribute("data-active") === "false") toggle();
        };

        searchButton.onclick = function () {
            let button = this, statusButton, changeButton, waitCount, getCookie, hash, params, callback, timerId;

            statusButton = button.getAttribute("data-search");

            changeButton = function (image) {
                switch (image) {
                    case "false":
                        button.setAttribute("class", "btn btn-success");
                        button.setAttribute("data-search", "false");
                        button.querySelector("i").setAttribute("class", "");
                        button.querySelector("span").innerHTML = "Search game";
                        statusText.innerHTML = "Click <a href=\"\">\"Search game\"</a> in your profile to start the game.";
                        break;
                    case "wait":
                        button.disabled = true;
                        button.setAttribute("class", "btn btn-primary");
                        button.setAttribute("data-search", "wait");
                        button.querySelector("i").setAttribute("class", "fa fa-spinner fa-pulse");
                        button.querySelector("span").innerHTML = "Wait...";
                        statusText.innerHTML = "Searching for players...";
                        break;
                    case "ingame":
                        button.setAttribute("class", "btn btn-danger");
                        button.setAttribute("data-search", "ingame");
                        button.querySelector("i").setAttribute("class", "");
                        button.querySelector("span").innerHTML = "Leave this game";
                        button.disabled = false;
                        break;
                }
            };

            waitCount = (function() {
                let count = 10;

                return function(newCount) {
                    count = (newCount) ? newCount : count;
                    return --count;
                };
            })();

            getCookie = function(name) {
                let matches = document.cookie.match(new RegExp(
                    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                ));
                return matches ? decodeURIComponent(matches[1]) : undefined;
            };

            hash = getCookie("hash");
            params = `hash=${hash}`;

            switch (statusButton) {
                case "false":
                    Ajax.createRequest("POST", "php/server.php", params+"&validate=1")
                        .then(function (response) {
                        return new Promise(function (resolve, reject) {
                            let responseCode;

                            try {
                                response = JSON.parse(response);
                                responseCode = response['code'];
                                return resolve(responseCode);
                            } catch (e){
                                return reject();
                            }
                        });
                    }).then(function (responseCode) {
                        console.log(responseCode);
                    }).catch(function () {
                        console.log("ERROR PROMISE!");
                    });
                    /*callback = function (responseCode, response) {
                        switch (responseCode) {
                            case "ok": initSearch(); break;
                        }
                    };
                    Ajax.createRequest("POST", "php/server.php", params+"&validate=1", callback);

                    changeButton("wait");

                    let initSearch = function () {
                        let createGame = function () {
                            clearInterval(idInterval);
                            statusBox.classList.add("box-top");
                            changeButton("ingame");
                            Checkerboard.init(hash, statusText, gameBox);
                        };
                        let i = 0;

                        timerId = setTimeout(function send() {
                            callback = function (responseCode, response) {
                                switch (responseCode) {
                                    case "6": //"Enemy data."
                                        statusText.innerHTML = "Creating a game...";
                                        createGame();
                                        break;
                                    case "7": //"Enemy data."
                                        statusText.innerHTML = "Creating a game...";
                                        createGame();
                                        break;
                                    case "4": //"Player not found."
                                        statusText.innerHTML = "Player not found.";
                                        break;
                                    case "5": //"There are no players in the search mode."
                                        let count = waitCount();

                                        if (statusText.innerHTML === "Searching for players...") {
                                            statusText.innerHTML += "<br>There are no players in the search mode.";
                                        }

                                        if (count <= 0) {
                                            button.disabled = false;
                                            button.querySelector("span").innerHTML = "Wait...";
                                        } else {
                                            button.querySelector("span").innerHTML = `Wait...(${count})`;
                                        }
                                        if (++i <= 10) {
                                            console.log(i);
                                            setTimeout(send, 1000);
                                        }else console.log("END");
                                }
                            };
                            Ajax.createRequest("POST", "php/server_interval.php", params, callback);
                        }, 1000);
                    };*/
                    break;
                case "wait":
                    clearTimeout(timerId);
                    Ajax.createRequest("POST", "php/server.php", params+"&cancelwait=1");
                    changeButton("false");
                    break;
                case "ingame":
                    Checkerboard.leave();
                    changeButton("false");
            }
        };
    };

    menuToggleButton.onclick = toggle;

    if (login) thereIsLogin();
    if (profile) thereIsProfile();
};

    /*findGameButton.onclick = function() {
        let playerID = playerIdText.value;

        if (playerID !== "") {
            let params, callback, searchGame, idInterval;

            params = `playerID=${playerID}`;
            callback = function (request) {
                let response = request.responseText, responseCode;

                try {
                    response = JSON.parse(response);
                    responseCode = response['code'];
                } catch (e){
                    response = false;
                }

                if (response) {
                    switch (responseCode) {
                        case "4": //"Player not found."
                            searchGame = false;
                            break;
                        case "3": //"The course of the opponent."
                            searchGame = true;
                            statusLabel.closest(".box-status").classList.add("box-top");
                            break;
                        case "2": //"Your turn."
                            searchGame = true;
                            statusLabel.closest(".box-status").classList.add("box-top");
                            break;
                        case "1": //"Player is already waiting."
                            searchGame = true;
                            statusLabel.closest(".box-status").classList.add("box-top");
                            break;
                        case "0": //"Player started waiting."
                            searchGame = true;
                            statusLabel.closest(".box-status").classList.add("box-top");
                            break;
                        default: //"Empty response."
                        //searchGame = false;
                    }
                }
            };

            Ajax.createRequest("POST", "php/server.php", params, callback);

            idInterval = setInterval(function () {
                if (searchGame === true) {
                    callback = function (request) {
                        let response = request.responseText, responseCode;

                        try {
                            response = JSON.parse(response);
                            responseCode = response['code'];
                        } catch (e){
                            response = false;
                        }

                        if (response) {
                            switch (responseCode) {
                                case "6": //"Enemy data."
                                    clearInterval(idInterval);
                                    Checkerboard.init(playerID, statusLabel, game);
                                    break;
                                case "7": //"Enemy data."
                                    clearInterval(idInterval);
                                    Checkerboard.init(playerID, statusLabel, game);
                                    break;
                                case "4": //"Player not found."
                                    console.log("Player not found.");
                                    break;
                                case "5": //"There are no players in the search mode."
                                    console.log("There are no players in the search mode.");
                                    break;
                                default:
                                    console.log(response);
                            }
                        }
                    };

                    Ajax.createRequest("POST", "php/server_interval.php", params, callback);
                } else if(searchGame === false) {
                    clearInterval(idInterval);
                }
            }, 1500);
        }
    };*/
