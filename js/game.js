var gBoard;

const bomb = '💣';

var gHintITimer;
var gmodalTimer;
var gSecInterval;

var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    isHint: false,
    lifesCount: 3,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};




function initGame() {
    gBoard = buildBoard(gLevel.SIZE);
    clearTimeout(gmodalTimer);
    gmodalTimer = null;
    clearTimeout(gHintITimer);
    gHintITimer = null;
    clearInterval(gSecInterval);
    gSecInterval;
    gGame = {
        isOn: false,
        isHint: false,
        lifesCount: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };

    var elTime = document.querySelector('.timer');
    elTime.innerHTML = gGame.secsPassed;
    printBottomMenu();
    renderBoard(gBoard);
}

function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);

        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i].push(cell);

        }
    }

    return board;
}

function cellNegsCount(board, idx, jdx) {
    var currCell = board[idx][jdx];
    for (var i = idx - 1; i <= idx + 1; i++) {

        for (var j = jdx - 1; j <= jdx + 1; j++) {
            if (i === idx && j === jdx ||
                i < 0 || j < 0 || i === board.length ||
                j === board[0].length)
                continue;
            if (board[i][j].isMine === true) {
                currCell.minesAroundCount++;
            }
        }
    }
}

// function setMinesNegsCount(board) {
//     for (var i = 0; i < board.length; i++) {

//         for (var j = 0; j < board[0].length; j++) {
//             cellNegsCount(board, i, j);

//         }
//     }
// }


function renderBoard(board) {
    var strHtml = '<table border="1px"><tbody>';
    var elBoard = document.querySelector('.board')
    for (var i = 0; i < board.length; i++) {

        strHtml += '<tr>';
        for (var j = 0; j < board[0].length; j++) {

            var className = 'cell cell' + i + '-' + j;
            var leftClick = `onclick="cellClicked(this,${i},${j})"`;
            var rightClick = `oncontextmenu="cellMarked(this,${i},${j})"`;

            strHtml += '<td ' + leftClick + rightClick + ' class="' + className + '">' + ' ' + '</td>';
        }
        strHtml += '</tr>';
    }

    strHtml += '</tbody></table>';
    elBoard.innerHTML = strHtml;

}

function expandShown(board, idx, jdx) {
    
    for (var i = idx - 1; i <= idx + 1; i++) {

        for (var j = jdx - 1; j <= jdx + 1; j++) {
            if (i === idx && j === jdx ||
                i < 0 || j < 0 || i === board.length ||
                j === board[0].length)
                continue;
            if (gBoard[i][j].isMarked === true) continue;
            if (gGame.isHint === false && board[i][j].isShown === true) continue;

            cellNegsCount(gBoard, i, j);
            toggleCell(i, j, board[i][j].minesAroundCount);
            if (gGame.isHint === false) {
                gGame.shownCount++;
            }

            if (board[i][j].minesAroundCount === 0 && board[i][j].isShown === false) {
                board[i][j].isShown === true;
            }
            gBoard[i][j].minesAroundCount = 0;
        }
    }

}


function cellClicked(elCell, i, j) {
    if (!gGame.isOn && gGame.secsPassed > 0) return
    if (!gGame.isOn && gBoard[i][j].isShown === false) {
        gSecInterval = setInterval(secCount, 1000)
        cellNegsCount(gBoard, i, j);
        toggleCell(i, j, gBoard[i][j].minesAroundCount);
        randomMines(gBoard, gLevel.MINES);
        gGame.isOn = true;
        gGame.shownCount++;
    }

    if (gGame.isOn === false || gBoard[i][j].isShown === true) return;
    if (gBoard[i][j].isMarked === true) return;


    gGame.shownCount++;
    cellNegsCount(gBoard, i, j);
    toggleCell(i, j, gBoard[i][j].minesAroundCount);
    if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isMine === false ||
        gGame.isHint === true) {
        expandShown(gBoard, i, j);
        if (gGame.isHint === true) {
            gHintITimer = setTimeout(() => {
                expandShown(gBoard, i, j);
                toggleCell(i, j, gBoard[i][j].minesAroundCount);
                gGame.isHint = false;
                gGame.shownCount--;
            }, 3000);
        }

    }

    gBoard[i][j].minesAroundCount = 0;

    if (gBoard[i][j].isMine === true && gGame.isHint === false) {
        if (gGame.lifesCount > 0) {
            showModal('you clicked on a bomb! life down!!!');
            removeLife();
            toggleCell(i, j);
            gGame.lifesCount--;
            gGame.shownCount--;
        } else {
            showMines(gBoard);
            gGame.isOn = false;
            elCell.innerHTML = bomb;
            clearInterval(gSecInterval)
            gSecInterval = null;
            var smiley = document.querySelector('.smiley');
            showModal('You Lost!!');
            smiley.innerHTML = '😵';
        }
    }

    checkGameOver();

}



//for later impl
// function createBomb(board, i, j) {
//     board[i][j].isMine = true;

// }

function cellMarked(elCell, i, j) {

    if (gGame.isOn === false || gBoard[i][j].isShown === true) return;

    if (!gBoard[i][j].isMarked) {
        //update model
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        //update dom
        elCell.classList.remove("cell");
        elCell.classList.add("marked");
        checkGameOver(gBoard);
    } else {
        //update model
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        //update dom
        elCell.classList.remove("marked");
        elCell.classList.add("cell");

    }

}

function checkGameOver() {
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {

        clearInterval(gSecInterval);
        gSecInterval = null;
        gGame.isOn = false;
        var smiley = document.querySelector('.smiley');
        smiley.innerHTML = '😎';
        showModal('You Won!!');
    }

}

function toggleCell(i, j, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${i}-${j}`);
    if (gBoard[i][j].isShown === false) {
        if (gBoard[i][j].isMine === true) {

            elCell.innerHTML = bomb;
            elCell.classList.remove("cell");
            elCell.classList.add("shown");
            gBoard[i][j].isShown = true;
        } else {
            if (value === 0) {
                value = '';
            }
            elCell.innerHTML = value;
            elCell.classList.remove("cell");
            elCell.classList.add("shown");
            gBoard[i][j].isShown = true;
        }
    } else {
        elCell.innerHTML = '';
        elCell.classList.remove("shown");
        elCell.classList.add("cell");
        gBoard[i][j].isShown = false;

    }

}

function showMines(board) {

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board[0].length; j++) {

            if (board[i][j].isMine === true && board[i][j].isShown === false) toggleCell(i, j, bomb);


        }
    }
}

function randomMines(board, numOfMines) {
    var i = 0;
    while (i < numOfMines) {
        var ranRow = getRandomIndex(0, board.length - 1);
        var ranColl = getRandomIndex(0, board.length - 1);
        if (board[ranRow][ranColl].isMine === false && board[ranRow][ranColl].isShown === false) {
            board[ranRow][ranColl].isMine = true;
            i++;
        }
    }
}




function printBottomMenu() {

    var strHtml = '<table border="1px"><tbody><tr>';
    var elMenu = document.querySelector('.bottomMenu');
    var leftClick = `onclick="hintClicked(this)"`;
    for (var i = 0; i < 3; i++) {
        var className = 'menuCell life';
        strHtml += '<td ' + ' class="' + className + '">' + '' + '💖</td>';
    }
    strHtml += '<td onclick="initGame()"' + ' class="' + 'menuCell smiley' + '">' + '' + '🙂</td>';
    for (var j = 0; j < 3; j++) {
        className = 'menuCell hint';
        strHtml += '<td ' + leftClick + ' class="' + className + '">' + '' + '💡</td>';
    }
    strHtml += '</tr>';
    strHtml += '</tbody></table>';
    elMenu.innerHTML = strHtml;
}

function hintClicked(elHint) {
    if (gGame.isOn === false) return;
    if (elHint.classList.contains('hint')) {
        gGame.isHint = true;
        clearTimeout(gHintITimer);
        gHintITimer = null;
        elHint.classList.remove('hint');
        elHint.innerHTML = '';
    }

}

function removeLife() {
    var elLife = document.querySelector('.life');
    elLife.innerHTML = '';
    elLife.classList.remove('life');

}


function showModal(msg) {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block';
    clearTimeout(gmodalTimer);
    gmodalTimer = null;
    if (gGame.lifesCount === 1) {
        msg = 'last Life!!';
    }
    elModal.innerHTML = `<p>${msg}</p>`;

    gmodalTimer = setTimeout(() => {
        elModal.style.display = 'none';
    }, 3000);


}




function secCount() {
    gGame.secsPassed += 1;
    var elTime = document.querySelector('.timer');
    elTime.innerHTML = gGame.secsPassed;



}

// function printTopMenu() {


//     var strHtml = '<table border="1px"><tbody><tr>';
//     var elMenu = document.querySelector('.topMenu')
//     var leftClick = `onclick="hintClicked(this)"`
//     for (var i = 0; i < 5; i++) {
//         var className = 'menuLVL';
//         strHtml += '<td ' + ' class="' + className + '">' + '' + '</td>'
//     }

//     strHtml += '</tr>'
//     strHtml += '</tbody></table>'
//     elMenu.innerHTML = strHtml
// }


function easy() {
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    initGame();

}

function medium() {
    gLevel.SIZE = 8;
    gLevel.MINES = 12;

    initGame();

}

function hard() {
    gLevel.SIZE = 12;
    gLevel.MINES = 30;

    initGame();

}
function getRandomIndex(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}