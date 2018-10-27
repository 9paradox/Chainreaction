"use strict"

document.addEventListener('load', init());

var clickable;
var sizeSelect;
var allCell;
var _BoardSize;
var _CellMaxAtom;
var PlayerTurn;
var Cell = [];

function getEle(by, as) {
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
    clickable = true;
    _BoardSize = {
        r: 10,
        c: 8
    };
    _CellMaxAtom = 4;
    PlayerTurn = "green";

    sizeSelect = getEle("id", "SizeSelect");
    allCell = getEle("id", "allCell");

    setGrid(_BoardSize);

    allCell.addEventListener('click', function (e) {
        e.preventDefault();
        if (e.target.id != this.id && clickable) {
            if (e.target.tagName == "DIV") {
                addAtom(e.target, false);
            } else {
                addAtom(e.target.parentNode, false);
            }
        }else{
            
            console.log("click");
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
            }else{
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
    ele.setAttribute("atomType", "");
    ele.setAttribute("atoms", "0");
    return ele;
}

function getMaxAtom(i, j) {
    if ((i == 0 && j == 0) || (i == _BoardSize.r - 1 && j == 0) || (i == _BoardSize.r - 1 && j == _BoardSize.c - 1) || (i == 0 && j == _BoardSize.c - 1)) {
        return _CellMaxAtom - 1;
    } else if ((i > 0 && j == 0) || (i == 0 && j >= 0) || (i == _BoardSize.r - 1 && j >= 0) || (i > 0 && j == _BoardSize.c - 1)) {
        return _CellMaxAtom - 2;
    } else {
        return _CellMaxAtom - 3;
    }
}

function checkWin(){
    
}

function addAtom(target, split) {
    if (parseInt(target.getAttribute("criticalMass")) <= _CellMaxAtom) {
        if (split == false) {
            if ((target.getAttribute("atomType") == PlayerTurn || target.getAttribute("atomType") == "")) {  
                appendAtom(target, split);
            }
        }else{
                appendAtom(target, split); 
        }
    }

    // checkWin();
}

function appendAtom(target, split){
    if (parseInt(target.getAttribute("criticalMass")) == _CellMaxAtom) {
        splitAtoms(target);
        return;
    } else {
        if (parseInt(target.getAttribute("atoms")) == 0) {
            if(split==true){
                var atom = newAtom(PlayerTurn);
            }else{
                var atom = newAtom(PlayerTurn); 
            }
            
            target.appendChild(atom);
        } else {
            if(split==true){
                upgradeAtom(target.firstChild, PlayerTurn, parseInt(target.getAttribute("atoms")) + 1);
            }else{
                upgradeAtom(target.firstChild, PlayerTurn, parseInt(target.getAttribute("atoms")) + 1);
            }
                
        }
    }

    target.setAttribute("criticalMass", parseInt(target.getAttribute("criticalMass")) + 1);
    target.setAttribute("atoms", parseInt(target.getAttribute("atoms")) + 1);
    // console.log(target.getAttribute("id") + " : " + target.getAttribute("atoms"));

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


function splitAtoms(target) {
    clickable = false;
    var temp = target;
    var id = target.getAttribute("id").toString().split("_");
    var adjCell = getAdjCel(parseInt(id[0]), parseInt(id[1]));

    target.innerHTML="";
    animateAtoms(temp, adjCell);
    
    setTimeout(function () {
        removeAtoms(target);
        for (var p in adjCell) {
            if (adjCell[p][1] != null)
                addAtom(adjCell[p][1], true);
        }
        setPlayerTurn();
        clickable = true;
    }, 390*adjCell.length);

}

function animateAtoms(target, adjCell) {
    var i = 0;
    var atom = [];
    for (i = 0; i < parseInt(target.getAttribute("atoms"))+1 ; i++) {
        atom[i] = newAtom(PlayerTurn);
        var px = 54*(i);
        atom[i].style.top = (parseInt(atom[i].style.top) - (px))+"px";
        target.appendChild(atom[i]);
    }

    i = 0;
    for (var p in adjCell) {
        if (adjCell[p][1] != null) {
            var x = { 
                cell : adjCell[p][0], 
                atm : atom[i]
            };
            (function (h) {
                setTimeout(function () {
                    var dir = h.cell;
                    var a = h.atm;
                    moveAtom(a, dir, 60);
                    
                }, 390);
            })(x);
            i++;

        }
    }
}

function removeAtoms(target) {

    var id = target.getAttribute("id").toString().split("_");
    target.setAttribute("atomType", "");
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

    // console.log(i + " " + j + " " + (j + 1));

    if ((i - 1) >= 0) {
        adjCell[0][1] = getEle("id", (i - 1) + "_" + j);
    }

    if ((j + 1) < _BoardSize.c) {
        adjCell[1][1] = getEle("id", i + "_" + (j + 1));
    }

    if ((i + 1) < _BoardSize.r) {
        adjCell[2][1] = getEle("id", (i + 1) + "_" + j);
    }

    if ((j - 1) >= 0) {
        adjCell[3][1] = getEle("id", i + "_" + (j - 1));
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
    var cells = getEle('class', 'cell');
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
    //moveAtom(target, "top", 100);
}

function moveAtom(target, dir, px) {
    
    switch (dir) {
        case "top":
            target.style.top = (parseInt(target.style.top) - (px))+"px";
            
            break;

        case "right":
            target.style.left = (parseInt(target.style.left) + (px))+"px";
            break;

        case "bottom":
            target.style.top = (parseInt(target.style.top) + (px))+"px";
            break;

        case "left":
            target.style.left = (parseInt(target.style.left) - (px))+"px";
            break;
    }
}