difficulty = 1;

let topofsearch = height*.1;
let leftofsearch = width*.1;

document.body.style.backgroundImage = 'url(../images/bg0.jpg)'


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
            let p = new P(this.cover_letters[i][j], leftofsearch + i * this.col_size, topofsearch + j * this.row_size);
            p.set('fontSize', this.row_size + 'px');
            p.set('color', 'white');
            p.set('textShadow', 'white 1px 1px 1px 1px')
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
    clear(){
        this.values = this.values.map(col=>col.map(()=>'?'));
        this.words = [];
    }
    generate(array){
        let tryattempt = 0;
        array = array.filter(x=>x.length<=wordM.cols);
        for(let i = 0; i<array.length; i++){
            let attempts = 0;
            let found = false;

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
            if(tryattempt>10000){
                this.clear();
                tryattempt = 0;
                console.log('splice out ', words[i], i)
                array.splice(i,1)
                return this.generate(array);
                //throw 'unable to make word search';
            }
        }
        return array;
    }
}




let wordM = new WordSearch(7 + 3 * difficulty, 7 + 3 * difficulty);
let background = new Div(leftofsearch - 20,topofsearch - 20, 'black', wordM.col_size*wordM.cols, wordM.row_size*wordM.rows +40, true)

background.set('backgroundImage', 'linear-gradient(to top left, #59c173, #a17fe0, #5d26c1)');
background.set('borderRadius', '20px');
background.set('border', 'solid 3px white');
background.set('boxShadow', 'rgba(255,255,255,0.5) 0px 0px 5px 5px')
let newwords = wordM.generate(words);
wordM.drawEmpty();
setTimeout(()=>wordM.drawReal(), 4000);
setTimeout(()=>wordM.draw(), 5000);
let newwordsP = [];
newwords.forEach((word,i)=>{
    let x = leftofsearch + wordM.col_size * wordM.cols + 10;
    let y = topofsearch + i*35;
    if(y>height*.9){
        x+= 70;
        y = height*0.1 + (i-11)*35
    }
    let w = new P(word, x, y);
    w.set('fontSize', wordM.row_size/2);
    w.set('color', 'white');
    w.set('margin', 0);
    newwordsP.push(w)
})



let dragger = {}
let dragging = false;
let startpos = {};
let endpos = {};
function startdrag(ev,i,j){
    if(!dragging) {
        let r = wordM.row_size;
        startpos = {i:i,j:j};
        dragger = new Div(leftofsearch + i * wordM.col_size - r / 5, topofsearch + j * r + r / 3, 'lightblue', r/1.5, r/1.5, 'true');
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
   let correct = (word)=>{
        circles.push(dragger);
        dragger.set('border', 'lightgreen solid 4px')
       dragger.mod('left', -3);
        dragger.mod('top', -3)
       dragger = {};
        //deal with words;
       let found = newwordsP.filter(x=>x.string === word)[0];
       let line = new DivLine(found.x,found.y + found.shape.offsetHeight/2,found.shape.offsetWidth, 0, 'red', 4)
       newwords.splice(newwords.indexOf(word),1);
       if(newwords.length===0){
           console.log('ding ding ding')
       }
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
                    correct(word);
                }
            }else
            if(dir===1){
                if(startpos.j + word.length-1 === endpos.j && endpos.i - startpos.i === 0){
                    correct(word);
                }
            }else
            if(dir===2){
                if(startpos.j + word.length-1 ===  endpos.j && startpos.i + word.length-1 === endpos.i){
                    correct(word);
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
document.addEventListener('touchend', ()=>{
    stopdrag();
});
wordM.divsM.map((p,i,j)=>{
    p.shape.addEventListener('mousedown',(ev)=>{
        startdrag(ev,i,j)
    });
    p.shape.addEventListener('mousemove', ev=>{
        drag(ev,i,j)
    }) ;
    p.shape.addEventListener('touchstart',(ev)=>{
        console.log('touch')
        startdrag(ev.touches[0],i,j)
    });
    p.shape.addEventListener('touchmove', ev=>{
        ev = ev.touches[0]
        let r = wordM.row_size;
        let x = Math.floor((ev.clientX - leftofsearch + r/5)/(wordM.col_size))
        let y = Math.floor((ev.clientY - topofsearch)/(r))
        drag(ev,x,y)
    });
    return p;
});


id('jmpleft').addEventListener('click',()=>{
   // wordM.drawEmpty();
    function lightblue(){
        wordM.divsM.map((div,i,j)=>{
            if(div.string === wordM.values[i][j]){
                div.set('color', 'lightblue');
            }
            return div;
        })
    }
    function white(){
        wordM.divsM.map(div=>{
            div.set('color', 'white');
            return div;
        });
    }
    lightblue();
    setTimeout(()=>{
       // wordM.draw();
        white()
    },500);
    setTimeout(()=>{
        lightblue()
    },700)  ;
    setTimeout(()=>{
        white()
    },800)  ;
    setTimeout(()=>{
        lightblue()
    },900) ;
    setTimeout(()=>{
        white()
    },1200);
});
