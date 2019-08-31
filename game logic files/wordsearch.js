difficulty = 0;


class WordSearch extends Matrix {
    constructor(rows, cols) {
        super(rows, cols);
        this.height = height;
        this.width = width;
        this.row_size = (height * .8) / this.rows;
        this.col_size = (width * .7) / this.cols;
        this.cover_letters = this.values.map(col => {
            return col.map(val => getRandom(alphabet.split('')))
        });
        this.map((x, i, j) => {
            let letter = '?';
            return letter;
        })
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
            if (orig === '?' || orig === val) {
                return true;
            } else {
                return false;
            }
        };
        let check = letters.filter((l, index) => checkVal(l, direction === 1 ? i : i + index, direction === 0 ? j : (j + index)));
        if (check.length === letters.length) {
            letters.forEach((letter, index) => {
                this.values[direction === 1 ? i : i + index][direction === 0 ? j : (j + index)] = letter;
            });
            this.words.push({word: string, dir: direction, i: i, j: j});
        } else {
            throw 'word is blocked'
        }
    }

    removeWord(string) {
        let found = this.words.filter(word => word.word === string);
        if (found.length === 0) throw 'word not found';
        let {word, dir, i, j} = found[0];
        let checkValue = (val, checki, checkj) => {
            let candidates = this.words.filter(each => {
                let isntthisword = each.word !== word;
                let containsletter = each.word.match(val);
                let wordiswithindistancehorizontally = checki - each.i >= 0 && checki - each.i < each.word.length;
                let wordiswithindistancevertically = checkj - each.j >= 0 && checkj - each.j < each.word.length;
                return isntthisword && containsletter && wordiswithindistancehorizontally && wordiswithindistancevertically;
            });
            if (candidates.length) {
               let round2 = candidates.filter(each => {
                    let splitword = each.word.split(''); //array of the word
                    let indicies = splitword.reduce((a, b, index) => {
                        if (b === val) { //find all occurences of the value we're looking for
                            a.push(index);
                        }
                        return a;
                    }, []);
                    let found = indicies.map(index => {
                        if (each.dir === 0) { //if its horizontal, then the value should be 'index' steps away from the each.i, the start point
                            if (checki - each.i === index) {
                                return true;
                            }
                        }
                        if (each.dir === 1) { //same for vertical
                            if (checkj - each.j === index) {
                                return true;
                            }
                        }
                        if (each.dir === 2) { //and diagonal
                            if (checkj - each.j === index && checki - each.i === index) {
                                return true;
                            }
                        }
                        return false;
                    });
                   return found.reduce((a,b)=>a||b)
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
        this.words.splice(this.words.indexOf(found[0]),1);
        this.drawReal();

    }

    init() {
        this.divsM.map((x, i, j) => {
            let p = new P(this.cover_letters[i][j], this.width * .15 + i * this.col_size, this.height * .05 + j * this.row_size);
            p.set('fontSize', this.row_size + 'px');
            p.set('color', 'black');
            p.set('margin', 0)
            p.set('zIndex', 10)
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
    generate(array){
        let tryattempt = 0;
        array = array.filter(x=>x.length<=wordM.cols)
        for(let i = 0; i<array.length; i++){
            let attempts = 0;
            let found = false;
            if(tryattempt>10000){
                throw 'unable to make word search';
            }
            while(!found){
                try{
                    wordM.addWord(array[i]);
                    found = true;
                }catch (e) {
                    attempts++;
                    tryattempt++;
                    if(attempts>100){
                        wordM.removeWord(array[i-1]);
                        i -=2;
                        break;
                    }
                }
            }
        }
    }
}




let wordM = new WordSearch(7 + 3 * difficulty, 7 + 3 * difficulty);
wordM.generate(words);
wordM.drawEmpty();
setTimeout(()=>wordM.drawReal(), 4000);
setTimeout(()=>wordM.draw(), 5000);

let dragger = {}
let dragging = false;
let startpos = {};
let endpos = {};
function startdrag(ev,i,j){
    if(!dragging) {
        let r = wordM.row_size;
        startpos = {i:i,j:j};
        dragger = new Div(width * .15 + i * wordM.col_size - r / 4, height * .05 + j * r + r / 6, 'blue', r, r, 'true');
        dragger.set('borderRadius', r/2 + 'px');
        dragger.set('transformOrigin', r/2+ 'px 50%')
        dragger.set('zIndex', 0);
        dragging = true;
    }
}
let circles = [];
function stopdrag(){
    dragging = false;
    let found = wordM.words.filter(each=>{
        return each.i === startpos.i && each.j === startpos.j;
    });
    let isright = false;
   let correct = ()=>{
        circles.push(dragger);
        dragger.set('border', 'green solid 5px')
       dragger.mod('left', -3);
        dragger.mod('top', -3)
       isright = true;
    }
    let wrong = ()=>{
        if(!isright) dragger.remove();
    }
    if(found.length){
        found.forEach(foundword=>{
            let {word,dir,i,j} = foundword;
            if(dir===0){
                if(startpos.i + word.length-1 === endpos.i && endpos.j - startpos.j === 0){
                    correct();
                }
            }else
            if(dir===1){
                if(startpos.j + word.length-1 === endpos.j && endpos.i - startpos.i === 0){
                    correct();
                }
            }else
            if(dir===2){
                if(startpos.j + word.length-1 ===  endpos.j && startpos.i + word.length-1 === endpos.i){
                    correct();
                }
            }
        });
        wrong();

    }else{
        wrong()
    }


}
function drag(ev,i,j){
    if(dragging){
        let r = wordM.row_size;
        let dy = -(startpos.j - j)*wordM.row_size;
        let dx = -(startpos.i - i)*wordM.col_size;
        let width = Math.sqrt(dy**2 + dx**2);
        dragger.set('width', width + r + 'px');
        let angle = Math.atan2(dy,dx)*180/Math.PI;
        dragger.rotateTo(angle)
        endpos = {i:i,j:j};
    }
}
document.addEventListener('mouseup', ()=>{
    stopdrag();
});
wordM.divsM.map((p,i,j)=>{
    p.shape.addEventListener('mousedown',(ev)=>{
        startdrag(ev,i,j)
    });
    p.shape.addEventListener('mousemove', ev=>{
        drag(ev,i,j)
    })
    return p;
});



