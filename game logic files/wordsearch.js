difficulty = 1;

let topofsearch = height * .1;
let leftofsearch = width * .25;
let boardWidth = 0;
let boardHeight = 0;


let backgroundimage = 'bg' + (Math.random() * 8 | 0).toString() + '.jpg';
document.body.style.backgroundColor = 'grey';
document.body.style.backgroundImage = 'url(../images/' + backgroundimage.toString() + ')';
document.body.style.backgroundRepeat = 'no-repeat';


let colors = ['red', 'yellow', 'teal', 'grey', 'black', 'purple', 'blue', 'green', 'orange',];

let TIMEOUT1 = 10;
let TIMEOUT2 = 20;

class WordSearch extends Matrix {
    constructor(rows, cols, w, h, x, y) {
        super(rows, cols);
        this.height = h;
        this.width = w;
        this.startx = x || 0;
        this.starty = y || 0;
        this.row_size = (h) / this.rows;
        this.col_size = (w) / this.cols;
        this.cover_letters = this.values.map(col => {
            return col.map(() => getRandom(alphabet.split('')))
        });
        this.map(() => {
            return '?';
        });
        this.divsM = this.copy();
        this.words = [];
        this.init();
    }

    addWord(string, direction, i, j) {
        let letters = string.split('');
        if (direction === undefined) {
            //0 is horizontal, 1 is vertical, 2 is diagonal;
            direction = getRandom(3);
        }
        if (i === undefined || j === undefined) {
            i = getRandom(this.cols - (direction === 1 ? 0 : string.length));
            j = getRandom(this.rows - (direction === 0 ? 0 : string.length));
        }
        let checkVal = (val, i, j) => {
            let orig = this.values[i][j];
            return orig === '?' || orig === val;
        };
        let check = letters.filter((l, index) => checkVal(l, direction === 1 ? i : i + index, direction === 0 ? j : (j + index)));
        if (check.length === letters.length) {
            letters.forEach((letter, index) => {
                this.values[direction === 1 ? i : i + index][direction === 0 ? j : (j + index)] = letter;
            });
            this.words.push({
                word: string, dir: direction, i: i, j: j,
                endi: direction === 1 ? i : i + string.length - 1,
                endj: direction === 0 ? j : j + string.length - 1
            });
        } else {
            throw 'word is blocked'
        }
    }

    removeWord(string) {
        let found = this.words.filter(word => word.word === string);
        if (found.length === 0) throw 'word not found';
        let {word, dir, i, j} = found[0];
        let checkValue = (val, check_i, check_j) => {
            let candidates = this.words.filter(each => {
                let notTargetWord = each.word !== word;
                let containsLetter = each.word.match(val);
                let wordIsWithinDistanceHorizontally = check_i - each.i >= 0 && check_i - each.i < each.word.length;
                let wordIsWithinDistanceVertically = check_j - each.j >= 0 && check_j - each.j < each.word.length;
                return notTargetWord && containsLetter && wordIsWithinDistanceHorizontally && wordIsWithinDistanceVertically;
            });
            if (candidates.length) {
                let round2 = candidates.filter(each => {
                    let splitWord = each.word.split(''); //array of the word
                    let indices = splitWord.reduce((a, b, index) => {
                        if (b === val) { //find all occurrences of the value we're looking for
                            a.push(index);
                        }
                        return a;
                    }, []);
                    let found = indices.map(index => {
                        if (each.dir === 0) { //if its horizontal, then the value should be 'index' steps away from the each.i, the start point
                            if (check_i - each.i === index) {
                                return true;
                            }
                        }
                        if (each.dir === 1) { //same for vertical
                            if (check_j - each.j === index) {
                                return true;
                            }
                        }
                        if (each.dir === 2) { //and diagonal
                            if (check_j - each.j === index && check_i - each.i === index) {
                                return true;
                            }
                        }
                        return false;
                    });
                    return found.reduce((a, b) => a || b)
                });
                return !round2.length;
            }
            return true;
        };
        word.split('').forEach((letter, index) => {
            if (checkValue(letter, dir === 1 ? i : i + index, dir === 0 ? j : (j + index))) {
                this.values[dir === 1 ? i : i + index][dir === 0 ? j : (j + index)] = '?';
            }

        });
        this.words.splice(this.words.indexOf(found[0]), 1);
        this.drawReal();

    }

    init() {
        this.divsM.map((x, i, j) => {
            let p = new P(this.cover_letters[i][j], this.startx + this.width * 0.025 + j * this.col_size, this.starty + i * this.row_size);
            let fontsize = this.row_size < this.col_size ? this.row_size * 0.8 : this.col_size * 0.8;
            p.set('fontSize', fontsize + 'px');
            p.set('color', 'white');
            p.set('textShadow', 'white 1px 1px 1px 1px');
            p.set('margin', 0);
            p.set('padding', 0);
            p.set('zIndex', 10);
            p.set('display', 'none');
            return p;
        })
    }

    reveal() {
        this.divsM.map((p) => {
            p.set('display', '');
            return p;
        })
    }

    draw() {
        this.divsM.map((p, i, j) => {
            p.string = this.values[i][j] === '?' ? this.cover_letters[i][j] : this.values[i][j];

            return p;
        })
    }

    drawReal() {
        this.divsM.map((p, i, j) => {
            p.string = this.values[i][j];
            return p;
        })
    }

    drawEmpty() {
        this.divsM.map((p, i, j) => {
            p.string = this.values[i][j] === '?' ? ' ' : this.values[i][j];
            return p;
        })
    }

    clear() {
        this.values = this.values.map(col => col.map(() => '?'));
        this.words = [];
    }

    generate(array) {
        let tryattempt = 0;
        array = array.filter(x => x.length <= wordM.cols);
        for (let i = 0; i < array.length; i++) {
            let attempts = 0;
            let found = false;

            while (!found) {
                try {
                    wordM.addWord(array[i]);
                    found = true;
                } catch (e) {
                    attempts++;
                    tryattempt++;

                    if (attempts > 100) {
                        wordM.removeWord(array[i - 1]);
                        i -= 2;
                        break;
                    }
                }
            }
            if (tryattempt > 2000) {
                this.clear();
                tryattempt = 0;
                //console.log('splice out ', words[i], i);
                array.splice(i, 1);
                return this.generate(array);
                //throw 'unable to make word search';
            }
        }
        return array;
    }
}


let wordM;
let newwords;
let newwordsP;
let background;
let logicSetUp = false;
let fakeDragger = {
    remove: function () {
    }
};

function setupLogic(rows, cols, w, h, x, y) {
    wordM = new WordSearch(rows, cols, w, h, x, y);
    newwords = wordM.generate(words);
    logicSetUp = true;
    return newwords.length;
}

function win() {
    circles.forEach(div => {
        div.remove();
    });
    redLines.forEach(line => {
        line.remove();
    });
    newwordsP.forEach(word => {
        word.remove();
    });
    wordM.divsM.map((div) => {
        div.set('transition', 'color 2s');
        div.set('color', getRandom(colors));
        div.t = findSpiralT(div.x,div.y);
        div.shootDir = Vector.random();
        return div
    });



    setTimeout(winLoop,1800)
}

let randSpiralXMult = getRandom(7,10);
let randSpiralYMult = getRandom(5,9);
function getSpiralX(num){return (randSpiralXMult*num)*Math.cos(num) + leftofsearch + wordM.width/2}
function getSpiralY(num){return (randSpiralYMult*num)*Math.sin(num) + topofsearch + wordM.height/2 - wordM.row_size/2}
function findSpiralT(x,y){
    let found = 0;
    for(let t=0; t<400; t+=0.1){
        let testx = getSpiralX(t);
        let testy = getSpiralY(t);
        if(Math.abs(x-testx) <25 && Math.abs(y-testy)<25){
            found = t;
            t = 500;
        }
    }
    return found;
}
function smoothPoints(x,y, targetx,targety){
    let currVec = new Vector(x,y);
    let targetVec = new Vector(targetx,targety);
    targetVec.sub(currVec).set(targetVec.mag()/4);
    return currVec.add(targetVec);
}

let WINNING = true;
function winLoop() {
    wordM.divsM.map((div) => {
        if(div.t>0){
            let [x,y] = [getSpiralX(div.t),getSpiralY(div.t)];
            let target = smoothPoints(div.x,div.y,x,y);
            div.set('left', target.x);
            div.set('top',target.y);
            div.t -= 0.15*Math.random();
            if(div.t<=0) div.t = 0;
        }else{
            div.set('left', div.x + div.shootDir.x*10);
            div.set('top', div.y + div.shootDir.y*10);
        }
        return div
    });
    if(WINNING) requestAnimationFrame(winLoop)
}

function setupBoard() {
    if (!logicSetUp) setupLogic(7 + 3 * difficulty, 7 + 3 * difficulty);
    background = new Div(wordM.startx, wordM.starty, 'black', wordM.width, wordM.height, true);
    background.set('backgroundImage', 'linear-gradient(to top left, #59c173, #a17fe0, #5d26c1)');
    background.set('borderRadius', '20px');
    background.set('border', 'solid 3px white');
    background.set('boxShadow', 'rgba(255,255,255,0.5) 0px 0px 5px 5px');
    wordM.reveal();
    wordM.drawEmpty();
    setTimeout(() => wordM.drawReal(), TIMEOUT1);
    setTimeout(() => wordM.draw(), TIMEOUT2);
    newwordsP = [];
    newwords.forEach((word, i) => {
        let x = leftofsearch + wordM.col_size * wordM.cols + 10 + 20;
        let y = topofsearch + i * 35;
        if (y > height * .9) {
            x += 70;
            y = height * 0.1 + (i - 11) * 35
        }
        let w = new P(word, x, y);
        w.set('fontSize', wordM.row_size / 2);
        w.set('color', 'white');
        w.set('margin', 0);
        newwordsP.push(w)
    });
    document.body.addEventListener('mouseup', () => {
        stopdrag();
    });
    document.body.addEventListener('touchend', () => {
        stopdrag();
    });
    document.body.addEventListener('touchmove', ev => {
        let touch = ev.touches[0];
        let x = Math.floor((touch.clientX - leftofsearch) / (wordM.col_size));
        let y = Math.floor((touch.clientY - topofsearch) / (wordM.row_size));
        drag(touch, y, x)
    });
    document.body.addEventListener('mousemove', (ev) => {
        let x = Math.floor((ev.clientX - leftofsearch) / (wordM.col_size));
        let y = Math.floor((ev.clientY - topofsearch) / (wordM.row_size));
        drag(ev, y, x)
    });

    wordM.divsM.map((p, i, j) => {
        p.shape.addEventListener('mousedown', (ev) => {
            startdrag(ev, i, j)
        });
        // p.shape.addEventListener('mousemove', ev => {
        //     drag(ev, i, j)
        // });
        p.shape.addEventListener('touchstart', (ev) => {
            startdrag(ev.touches[0], i, j)
        });
        // p.shape.addEventListener('touchmove', ev => {
        //     ev = ev.touches[0];
        //     let r = wordM.row_size;
        //     let x = Math.floor((ev.clientX - leftofsearch + r / 5) / (wordM.col_size));
        //     let y = Math.floor((ev.clientY - topofsearch) / (r));
        //     drag(ev, x, y)
        // });
        return p;
    });


}


let dragger = fakeDragger;
let overlayDragger = fakeDragger;
let dragging = false;
let startpos = {};
let endpos = {};
let startcoords = {};

function startdrag(ev, i, j) {
    if (!dragging) {
        let r = wordM.row_size > wordM.col_size ? wordM.col_size : wordM.row_size;
        startpos = {i: i, j: j};
        startcoords = {
            x: wordM.divsM.values[i][j].x - wordM.col_size/4,
            y: wordM.divsM.values[i][j].y + wordM.row_size/8,
        };
        dragger = new Div(startcoords.x , startcoords.y, 'lightblue', r / 1.5, r / 1.5, true);
        //minus 4 for the border size
        overlayDragger = new Div(startcoords.x -4, startcoords.y -4, 'red', r / 1.5, r / 1.5, true);
        dragger.set('borderRadius', r / 2 + 'px');
        dragger.set('transformOrigin', r / 2 + 'px 50%');
        dragger.set('zIndex', 0);
        dragger.set('display', 'none');
        overlayDragger.set('borderRadius', r / 2 + 'px');
        overlayDragger.set('transformOrigin', r / 2 + 'px 50%');
        overlayDragger.set('zIndex', 10);
        overlayDragger.set('border', 'red solid 4px')
        dragging = true;
    }
}

let circles = [];

let redLines = [];

function stopdrag() {
    dragging = false;
    let found = wordM.words.filter(each => {
        return (startpos.j === each.j && startpos.i === each.i) || (startpos.j === each.endj && startpos.i === each.endi)
    });
    let isright = false;
    let correct = (word) => {
        dragger.set('display', '');
        dragger.set('border', 'lightgreen solid 4px');
       // dragger.mod('left', 0);
        //due to border width it needs to be adjusted;
        dragger.mod('top' -4);
        //dragger.mod('left' -4);
        circles.push(dragger);
        overlayDragger.remove();
        dragger = fakeDragger;
        overlayDragger = fakeDragger;
        //deal with words;
        let found = newwordsP.filter(x => x.string === word)[0];
        let line = new DivLine(found.x, found.y + found.shape.offsetHeight / 2, found.shape.offsetWidth, 0, 'red', 4);
        redLines.push(line)
        newwords.splice(newwords.indexOf(word), 1);
        wordM.words = wordM.words.filter(each => each.word !== word);
        if (newwords.length === 0) {
            win();
        }
        isright = true;
    };
    let wrong = () => {
        if (!isright) {
            dragger.remove();
            overlayDragger.remove();
            dragger = fakeDragger;
            overlayDragger = fakeDragger;
        }
    };
    if (found.length) {
        found.forEach(foundword => {
            let {word, dir, i, j, endi, endj} = foundword;
            if ((endi === endpos.i && endj === endpos.j && i === startpos.i && j === startpos.j)
                || (i === endpos.i && j === endpos.j && endi === startpos.i && endj === startpos.j)) {
                correct(word);
            }
        });
        wrong();

    } else {
        wrong()
    }


}

function drag(ev, i, j) {
    if (dragging) {
        if (!i) i = (ev.clientY - topofsearch) / wordM.row_size | 0;
        if (!j) j = (ev.clientX - leftofsearch) / wordM.col_size | 0;
        let r = wordM.row_size > wordM.col_size ? wordM.col_size : wordM.row_size;
        //overlay
        let coord_dx = ev.clientX - startcoords.x - wordM.col_size / 3;
        let coord_dy = ev.clientY - startcoords.y - wordM.row_size / 3;
        //real dragger logic
        let dy = -(startpos.i - i) * wordM.row_size;
        let dx = -(startpos.j - j) * wordM.col_size;

        let xDiff = j * wordM.col_size + leftofsearch - ev.clientX + wordM.col_size / 3;
        let yDiff = i * wordM.row_size + topofsearch - ev.clientY + wordM.row_size / 3;
        let distanceToReal = Math.sqrt(xDiff ** 2 + yDiff ** 2);

        if (distanceToReal < 25 && (startpos.i === i || startpos.j === j || startpos.i - i === startpos.j - j)) {
            overlayDragger.set('border', 'blue solid 4px')
        } else {
            overlayDragger.set('border', 'red solid 4px')
        }

        let width = Math.sqrt(dy ** 2 + dx ** 2);
        let coordWidth = Math.sqrt(coord_dx ** 2 + coord_dy ** 2);
        dragger.set('width', width + r + 'px');
        overlayDragger.set('width', coordWidth + r + 'px');
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        dragger.rotateTo(angle);
        overlayDragger.rotateTo(Math.atan2(coord_dy, coord_dx) * 180 / Math.PI);
        endpos = {i: i, j: j};
    }
}


id('jmpleft').addEventListener('click', () => {
    // wordM.drawEmpty();
    wordM.words.forEach(word => {
        word.color = getRandom(colors);
    });

    function randomcolor() {
        wordM.words.forEach(word => {
            let xlength = word.endi - word.i + 1;
            let ylength = word.endj - word.j + 1;
            for (let i = 0; i < xlength; i++) {
                for (let j = 0; j < ylength; j++) {
                    if (word.dir === 2 && i === j) {
                        wordM.divsM.values[i + word.i][j + word.j].set('color', word.color);
                    } else if (word.dir === 1 || word.dir === 0) {
                        wordM.divsM.values[i + word.i][j + word.j].set('color', word.color);
                    }
                }
            }

        })
    }

    function white() {
        wordM.divsM.map(div => {
            div.set('color', 'white');
            return div;
        });
    }

    randomcolor();
    setTimeout(() => {
        // wordM.draw();
        white()
    }, 500);
    setTimeout(() => {
        randomcolor()
    }, 700);
    setTimeout(() => {
        white()
    }, 800);
    setTimeout(() => {
        randomcolor()
    }, 900);
    setTimeout(() => {
        white()
    }, 1200);
});

function setupScreen() {

    let setupbg, numofwords, goBtn;
    let byP, hP, wP, hPlusP, hMinusP, wPlusP, wMinusP;

    let hVal = 10;
    let wVal = 10;
    let startx = width * 0.3;
    let starty = height * 0.2;
    boardWidth = width * 0.4;
    boardHeight = height * 0.5;
    setupbg = new Div(startx, starty, 'white', boardWidth, boardHeight, true);
    setupbg.set('border', 'solid blue 3px');
    setupbg.set('borderRadius', '10px');
    setupbg.set('backgroundColor', 'lightblue');

    let buttonstyle = {
        fontSize: '2em',
        color: 'black',
        weight: 'bold',
        textShadow: 'white 2px',
        margin: '0px',
        padding: '0px'
    };
    hPlusP = new P('➕', startx + width * 0.05, starty + height * 0.1);
    Object.assign(hPlusP.shape.style, buttonstyle);
    hMinusP = new P('➖', startx + width * 0.05, starty + height * 0.3);
    Object.assign(hMinusP.shape.style, buttonstyle);
    wPlusP = new P('➕', startx + width * 0.15, starty + height * 0.1);
    Object.assign(wPlusP.shape.style, buttonstyle);
    wMinusP = new P('➖', startx + width * 0.15, starty + height * 0.3);
    Object.assign(wMinusP.shape.style, buttonstyle);
    hP = new P('10', startx + width * 0.055, starty + height * 0.22);
    Object.assign(hP.shape.style, buttonstyle);
    wP = new P('10', startx + width * 0.155, starty + height * 0.22);
    Object.assign(wP.shape.style, buttonstyle);
    byP = new P('by', startx + width * 0.105, starty + height * 0.22);
    Object.assign(byP.shape.style, buttonstyle);

    numofwords = new P('0 words', startx + width * 0.25, starty + height * 0.22);
    goBtn = new P('GO!', startx + width * 0.18, starty + height * 0.4);
    Object.assign(numofwords.shape.style, {
        color: 'green',
        fontSize: '2em',
        textShadow: 'white 2px',
        margin: '0px',
        padding: '0px'
    });
    Object.assign(goBtn.shape.style, {
        color: 'red',
        fontSize: '2em',
        textShadow: 'white 2px',
        margin: '0px',
        padding: '0px'
    });

    function updateNum() {
        numofwords.string = 'loading...';
        let calcwidth = width*0.6;
        if (calcwidth > width * 0.95) calcwidth = width * 0.95;
        let calcheight = height * 0.95;
        if (calcheight > height * 0.9) calcheight = height * 0.95;
        let calcstartx = (width - calcwidth) / 2;
        let calcstarty = (height - calcheight) / 2;
        leftofsearch = calcstartx;
        topofsearch = calcstarty;
        //console.log('calcwidth', calcwidth, ' h ', calcheight);
        requestAnimationFrame(() => requestAnimationFrame(() => numofwords.string = setupLogic(wVal, hVal, calcwidth, calcheight, calcstartx, calcstarty) + ' words'));
    }

    updateNum();
    let maxDiff = 2;
    hMinusP.shape.addEventListener('click', () => {
        hVal--;
        if(Math.abs(hVal-wVal)>maxDiff){
            wVal--;
            wP.string = wVal;
        }
        hP.string = hVal;
        updateNum();
    });
    hPlusP.shape.addEventListener('click', () => {
        hVal++;
        if(Math.abs(hVal-wVal)>maxDiff){
            wVal++;
            wP.string = wVal;
        }
        hP.string = hVal;
        updateNum();
    });
    wMinusP.shape.addEventListener('click', () => {
        wVal--;
        if(Math.abs(hVal-wVal)>maxDiff){
          hVal--;
          hP.string = hVal;
        }
        wP.string = wVal;
        updateNum();
    });
    wPlusP.shape.addEventListener('click', () => {
        wVal++;
        if(Math.abs(hVal-wVal)>maxDiff){
            hVal++;
            hP.string = hVal;
        }
        wP.string = wVal;
        updateNum();
    });


    goBtn.shape.addEventListener('click', () => {
        let everything = [setupbg, numofwords, goBtn, byP, hP, wP, hPlusP, hMinusP, wPlusP, wMinusP];
        everything.forEach(thing => {
            thing.remove();
        });
        setupBoard();
    })

}


setupScreen();
//setup();
