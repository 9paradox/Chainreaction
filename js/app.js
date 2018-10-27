"use strict"

document.addEventListener('load', init());

var _FPS;
var _BoardSize;
var _CellMaxAtom;

var clickable;
var allCell;
var gameStarted;
var PlayerTurn;

var playBtn;
var pauseBtn;
var resumeBtn;
var restartBtn;
var againBtn;

function $(by, as) {
    switch (by) {
        case "id":
            return document.getElementById(as);
            break;

        case "class":
            return document.getElementsByClassName(as);
            break;

        case "name":
            return document.getElementsByName(as);
            break;

        case "tag":
            return document.getElementsByTagName(as);
            break;
    }
}

function init() {
    _FPS = 15;
    _BoardSize = {
        r: 10,
        c: 8
    };
    _CellMaxAtom = 4;
    
    gameStarted = 0;
    clickable = true;
    PlayerTurn = "green";

    allCell = $("id", "allCell");

    setGrid(_BoardSize);

    

    playBtn = $("id", "playbtn");
    playBtn.addEventListener('click', function () {
        $("id", "startMenu").style.display = "none";
        $("id", "gameMenu").style.display = "";
    });

    pauseBtn = $("id", "pausebtn");
    pauseBtn.addEventListener('click', function () {
        $("id", "pauseMenu").style.display = "";
    });

    resumeBtn = $("id", "resumebtn");
    resumeBtn.addEventListener('click', function () {
        $("id", "pauseMenu").style.display = "none";
    });

    restartBtn = $("id", "restartbtn");
    restartBtn.addEventListener('click', function () {
        $("id", "pauseMenu").style.display = "none";
        init();
    });

    againBtn = $("id", "againbtn");
    againBtn.addEventListener('click', function () {
        window.location = "";
    });
	
	allCell.addEventListener('click', function (e) {
        e.preventDefault();
        if (e.target.id != this.id && clickable) {
            if (e.target.tagName == "DIV") {
                addAtom(e.target, false);
            } else {
                addAtom(e.target.parentNode, false);
            }
            gameStarted++;
        } else {
            console.log("wait");
        }
    });
}

function setGrid(size) {
    allCell.innerHTML = '';
    for (var i = 0; i < size.r; i++) {
        for (var j = 0; j < size.c; j++) {
            var cell;
            if (j == 0) {
                cell = newCell(i, j, "rowCell cell");
            } else {
                cell = newCell(i, j, "cell");
            }
            allCell.appendChild(cell);
        }

    }
}

function newCell(i, j, className) {
    var ele = document.createElement("DIV");
    ele.setAttribute("class", className);
    ele.setAttribute("id", i + "_" + j);
    ele.setAttribute("criticalMass", getMaxAtom(i, j));
    ele.setAttribute("atomType", " ");
    ele.setAttribute("atoms", "0");
    return ele;
}

function getMaxAtom(i, j) {
    if ((i == 0 && j == 0) || (i == _BoardSize.r - 1 && j == 0) || (i == _BoardSize.r - 1 && j == _BoardSize.c - 1) || (i == 0 && j == _BoardSize.c - 1)) {
        return _CellMaxAtom - 3;
    } else if ((i > 0 && j == 0) || (i == 0 && j >= 0) || (i == _BoardSize.r - 1 && j >= 0) || (i > 0 && j == _BoardSize.c - 1)) {
        return _CellMaxAtom - 2;
    } else {
        return _CellMaxAtom - 1;
    }
}

function checkWin() {
    var Cell = $("id","allCell").querySelectorAll('div:not([atomType=" "])');
    // console.log(Cell);
    var lastPlayer = Cell[0].getAttribute("atomType");
    var playerScore = 0;
    if (gameStarted > 1) {
        for (var p =0;p < Cell.length;p++) {
            if (Cell[p].getAttribute("atomType") == lastPlayer && parseInt(Cell[p].getAttribute("atoms")) > 0) {
                playerScore++;
                // console.log(Cell[p].getAttribute("atomType") + " | " + Cell.length);
            }else{
                break;
            }
        }
        if (Cell.length == playerScore) {
            // console.log("Win = " + lastPlayer);
            clickable = false;
            // alert("Win "+lastPlayer);
            showGameOverMennu(lastPlayer);
        }
        
    }
}

function showGameOverMennu(player) {
    var t = player;
    if (player == "green") {
        player= "blue";
    } else {
        player = "yellow";
    }
    $("id", "pauseMenu").style.display = "none";
    $("id", "playerWinImg").src = "img/" + t + "3.gif";
    $("id", "playerWinText").innerHTML = "Player " + player.toString().toUpperCase() + " Wins !";
    $("id", "gameoverMenu").style.display = "";
}

function addAtom(target, split) {
    if (parseInt(target.getAttribute("atoms")) <= parseInt(target.getAttribute("criticalMass"))) {
        if (split == false) {
            if ((target.getAttribute("atomType") == PlayerTurn || target.getAttribute("atomType") == " ")) {
                appendAtom(target, split);
            }
        } else {
            appendAtom(target, split);
        }
    }
    // setTimeout(function () { checkWin(); },100*Cell.length);
}

function appendAtom(target, split) {
    if (parseInt(target.getAttribute("atoms")) == parseInt(target.getAttribute("criticalMass"))) {
        splitAtoms(target, split);
        return;
    } else {
        if (parseInt(target.getAttribute("atoms")) == 0) {
            var atom = newAtom(PlayerTurn);
            // if (split == false) {
            //     Cell.push(target);
            // }
            target.appendChild(atom);
        } else {
            upgradeAtom(target.firstChild, PlayerTurn, parseInt(target.getAttribute("atoms")) + 1);
        }
    }
    target.setAttribute("atoms", parseInt(target.getAttribute("atoms")) + 1);

    target.setAttribute("atomType", PlayerTurn);
    if (split == false) {
        setPlayerTurn();
    }
}

function getPlayerTurnInverse() {
    if (PlayerTurn == "green") {
        return "red";
    } else {
        return "green";
    }
}


function splitAtoms(target, split) {
    clickable = false;
    var temp = target;
    var id = target.getAttribute("id").toString().split("_");
    var adjCell = getAdjCel(parseInt(id[0]), parseInt(id[1]));

    target.innerHTML = "";
    animateAtoms(temp, adjCell, split);

    var waitForAnimation = setTimeout(function () {
        removeAtoms(target);
        for (var p in adjCell) {
            if (adjCell[p][1] != null)
                addAtom(adjCell[p][1], true);
        }
        if (split == false) {
            // setTimeout(function () {
            setPlayerTurn();
            // }, 100);
        } else {

            for (var q in adjCell) {
                if (adjCell[q][1] != null) {
                    adjCell[q][1].setAttribute("atomType", getPlayerTurnInverse());
                    upgradeAtom(adjCell[q][1].firstChild, getPlayerTurnInverse(), parseInt(adjCell[q][1].getAttribute("atoms")));
                }
            }
        }
        clickable = true;

        // setTimeout(function () { checkWin(); },100*Cell.length);
        checkWin();

    }, 300 * adjCell.length);

}

function animateAtoms(target, adjCell, split) {
    var i = 0;
    var atom = [];
    for (i = 0; i < parseInt(target.getAttribute("atoms")) + 1; i++) {
        
        atom[i] = newAtom(PlayerTurn);
        var px = 54 * (i);
        if(split){
            console.log(target);
            console.log(atom[i]);
        }
        atom[i].style.top = (parseInt(atom[i].style.top) - (px)) + "px";
        target.appendChild(atom[i]);
    }

    i = 0;
    for (var p in adjCell) {
        if (adjCell[p][1] != null) {
            moveAtom(atom[i], adjCell[p][0], 60);
            i++;
        }
    }
}

function removeAtoms(target) {

    var id = target.getAttribute("id").toString().split("_");
    target.setAttribute("atomType", " ");
    target.setAttribute("atoms", "0");
    target.setAttribute("criticalMass", getMaxAtom(parseInt(id[0]), parseInt(id[1])));
    target.innerHTML = "";

}

function getAdjCel(i, j) {

    var adjCell = [
        ["top", null],
        ["right", null],
        ["bottom", null],
        ["left", null]
    ];

    if ((i - 1) >= 0) {
        adjCell[0][1] = $("id", (i - 1) + "_" + j);
    }

    if ((j + 1) < _BoardSize.c) {
        adjCell[1][1] = $("id", i + "_" + (j + 1));
    }

    if ((i + 1) < _BoardSize.r) {
        adjCell[2][1] = $("id", (i + 1) + "_" + j);
    }

    if ((j - 1) >= 0) {
        adjCell[3][1] = $("id", i + "_" + (j - 1));
    }

    return adjCell;
}



function setPlayerTurn() {
    if (PlayerTurn == "green") {
        PlayerTurn = "red";
    } else {
        PlayerTurn = "green";
    }
    setGridBorderColor();
}

function setGridBorderColor() {
    var cells = $('class', 'cell');
    for (var c in cells) {
        if (c < cells.length)
            cells[c].classList.toggle('red-border');
    }
}

function newAtom(color) {
    var ele = document.createElement("IMG");
    ele.setAttribute("class", "atom");
    ele.setAttribute("src", "img/" + color + "1.gif");
    ele.style.top = "0px";
    ele.style.left = "0px";
    return ele;
}

function upgradeAtom(target, color, count) {
    target.setAttribute("src", "img/" + color + "" + count + ".gif");
}

function moveAtom(target, dir, px) {

    switch (dir) {
        case "top":
        moveTo(target, dir, px);
            break;

        case "right":
        moveTo(target, "left", -px);
            break;

        case "bottom":
        moveTo(target, "top", -px);
            break;

        case "left":
        moveTo(target, dir, px);
            break;
    }
}


//////

function moveTo(target, dir, px){
    var opx = (parseInt(target.style[dir]));
    var callback = setInterval(function(){
        if(parseInt(target.style[dir]) == (opx - px)){
            clearInterval(callback);
        }else{
            target.style[dir] = (parseInt(target.style[dir]) - (px/_FPS)) + "px";
        }
    },_FPS);
}