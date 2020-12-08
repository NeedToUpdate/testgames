class Puzzle extends Rectangle {
    constructor(word, x, y, w, h, team) {
        super(x, y, w, h);
        this.asOutline('black');
        this.team = team;
        this.word = word;
        this.letters = word.split('').map(x=>x===' '? -1:x);
        this.solvedLetters = Array(word.length).fill(' ');
        this.attemptedLetters = [];
        this.lines = [];
        this.letterDivs = [];
        this.wrongLetterDivs = [];
        this.lastLetter = {};
        this.inputBox = {};
        this.INTERNAL_TITLE_STRING = team === 'A' ? 'Team Blue' : 'Team Red';
        this.INTERNAL_TITLE_DIV = {};
        this.createLines();
        this.createTitle();
        this.styleUp(team);
    }

    get title() {
        return this.INTERNAL_TITLE_STRING;
    }

    set title(string) {
        this.INTERNAL_TITLE_STRING = string;
        this.INTERNAL_TITLE_DIV.string = string
    }

    get isFinished(){
        return this.letters.filter(x=>x!==-1).length===0;
    }

    createLines() {
        let x = this.width * .01;
        let maxwidth = this.width * .98;
        let y = this.height * .8;
        let linewidth = (maxwidth * 0.9) / (this.word.length);
        if (linewidth > width * .06) linewidth = width * .06;
        for (let i = 0; i < this.word.length; i++) {
            let x1 = x + maxwidth / 2 - (linewidth) * ((this.word.length - 1) / 2) + i * linewidth + linewidth * 0.05;
            let x2 = x1 + linewidth * 0.9;
            let l = new LineFromPoints(x1, y, x2, y, 3).fromCenter();
            let p = new P(this.letters[i] === -1? ' ': this.letters[i],(x1-linewidth/10), y);
            p.size = linewidth*0.8;
            p.y -= p.height;
            p.color = 'transparent';
            this.attach(p);
            this.letterDivs.push(p);
            this.lines.push(l);
            this.attach(l)
        }
    }

    createTitle() {
        let title = new P(this.INTERNAL_TITLE_STRING, this.width / 2, this.height * .1).fromCenter()
        title.size = r(width/29) +  'px';
        title.width = this.width * .98;
        title.x = this.width / 2
        title.y += height/80
        title.set('textAlign', 'center')
        this.attach(title)
        this.INTERNAL_TITLE_DIV = title
    }

    styleUp(team) {
        if (team === 'A') {
            this.set('backgroundColor', 'royalblue');
            this.border = r(width/310) + 'px solid blue';
            this.set('borderRadius', r(width/73) + 'px');
            this.set('boxShadow', r(width/400)+'px ' + r(width/400)+'px ' + r(width/400)+'px ' + r(width/400)+'px black');
            this.lines.forEach((l,i) => {
                l.set('backgroundColor', 'cyan')
                if(this.letters[i] === ' ' || this.letters[i] === -1){
                    l.color = 'transparent';
                }
                l.set('borderRadius', r(width/310) + 'px ')
            })
            this.INTERNAL_TITLE_DIV.color = 'white'
        } else {
            this.set('backgroundColor', 'indianred');
            this.border = r(width/310) + 'px solid red';
            this.set('borderRadius', r(width/73) + 'px');
            this.set('boxShadow', r(width/400)+'px ' + r(width/400)+'px ' + r(width/400)+'px ' + r(width/400)+'px black');
            this.lines.forEach((l,i) => {
                l.set('backgroundColor', 'maroon');
                if(this.letters[i] === ' ' || this.letters[i] === -1){
                    l.color = 'transparent';
                }
                l.set('borderRadius', r(width/310) + 'px ')
            })
            this.INTERNAL_TITLE_DIV.color = 'white'
        }
    }

    createInputBox(x, y, w, h) {
        let box = new Rectangle(x, y, w, h).asOutline(this.team === 'A' ? 'blue' : 'red', r(width/239));
        box.color = this.team === 'A' ? 'royalblue' : 'indianred';
        box.set('borderRadius', r(width/191) + 'px');
        this.inputBox = box;
        let input = document.createElement('input');
        let inputBoxWidth = w / 3;
        let button = new Rectangle(box.width * 0.1, inputBoxWidth * 1.8 + 20, box.width * .8 - 10, box.height * .1).asOutline('green', r(width/319));
        button.color = 'limegreen';
        button.set('borderRadius', 5);
        button.set('textAlign', 'center');
        button.set('color', 'darkgreen');
        button.set('fontWeight', 'bolder');
        button.set('fontSize', r(width/60) + 'px');
        button.set('cursor', 'pointer');
        button.shape.innerText = 'Ready!';
        box.attach(input);
        box.attach(button);
        let style = {
            width: inputBoxWidth + 'px ',
            height: inputBoxWidth * 1.5 + 'px ',
            top: box.height * 0.1 + 'px ',
            left: box.width / 2 - inputBoxWidth / 2 - 4 + 'px ',
            position: 'absolute',
            fontSize: w / 2 + 'px',
            textAlign: 'center',
            backgroundColor: this.team === 'A' ? 'lightblue' : 'salmon',
            color: this.team === 'A' ? 'blue' : 'red'
        };
        Object.assign(input.style, style);
        input.setAttribute('maxlength', '1');
        input.addEventListener('keypress', () => {
            input.blur()
        });
        let letter = '';
        let display = {}

        function cancel() {
            if (Object.keys(display).length > 0) display.remove();
            input.style.display = '';
            letter = '';
            input.value = '';
            button.color = 'limegreen';
            button.border = 'green solid ' + r(width/319) + 'px';
            button.set('color', 'green');
            box.ready = false;
        }

        button.shape.addEventListener('click', () => {
            if(!box.ready && input.value !== ''){
                button.color = 'grey';
                button.border = 'darkgrey solid ' + r(width/319) + 'px';
                button.set('color', 'darkgrey');
                box.ready = true;
                letter = input.value.toLowerCase();
                display = new P(letter, box.width / 2 - inputBoxWidth / 2 + height/43, 0);
                input.style.display = 'none';
                display.color = this.team === 'A' ? 'cyan' : 'orange';
                display.size = w / 2;
                display.set('textAlign', 'center');
                box.attach(display);
                display.shape.addEventListener('click', cancel)
            }
        });
        return {
            getLetter: function () {
                return letter;
            },
            reset: function () {
                cancel()
            },
            getDiv: function () {
                return display;
            },
            remove: function () {
                box.remove();
            }
        }
    }

    addNewWord(string) {
        //TODO remove this from the init functions and add this func
        //test with OBJ.keys
        //exception for spaces
        this.word = string;
        this.lines.forEach(line => {
            if(checkObj(line))  line.remove();
        });
        this.lines = [];
        this.letterDivs.forEach(d=>{
            if(checkObj(d))  d.remove();
        });
        this.letterDivs = [];
        this.wrongLetterDivs.forEach(d=>{
            if(checkObj(d))  d.remove();
        });
        this.wrongLetterDivs = [];
        this.letters = string.split('').map(x=>x===' '? -1:x);
        this.solvedLetters = Array(string.length).fill(' ');
        this.createLines();
        this.styleUp(this.team)
        this.flash();
    }

    flash() {
        this.set('boxShadow', '0 0 ' + r(width/119) + 'px ' + r(width/119) + 'px ' + (this.team === 'A' ? 'cyan' : 'orange'));
        setTimeout(() => {
            this.set('boxShadow', r(width/400)+'px ' + r(width/400)+'px ' + r(width/400)+'px ' + r(width/400)+'px black');
        }, 1000)
    }

    checkLetter(string) {
        if (this.letters.includes(string)) {
            return this.letters.reduce((a, b) => (b === string ? 1 : 0) + a, 0)
        } else {
            return 0;
        }
    }

    undoLetter(){
        this.lastLetter.index.forEach(i=>{
            this.letters[i] = this.lastLetter.letter;
            this.solvedLetters[i] = ' ';
            this.hideLetter(i)
        })
    }
    confirmLetter(string) {
        let cache = {
            letter: string,
            index: [],
        }
        if (this.letters.includes(string)) {
            this.letters.forEach((x,i)=>{
                if(x===string){
                    cache.index.push(i);
                    this.letters[i] = -1;
                    this.solvedLetters[i] = string;
                }
            });
            console.log('team ' + this.team + ' submitted letter ' + string)
        }else{
            this.attemptedLetters.push(string);
            if(this.wrongLetterDivs.length>10){
                this.wrongLetterDivs[0].remove();
                this.wrongLetterDivs.shift();
                this.wrongLetterDivs.forEach(div=>{
                    div.x -= r(width/38)
                })
            }
            let p = new P(string,this.wrongLetterDivs.length*r(width/38) + this.width*0.05, this.height*0.8, r(width/60));
            p.color = 'white';
            this.attach(p);
            this.wrongLetterDivs.push(p)
        }
        //check if done
        this.lastLetter = cache;
        return this.letters.filter(x=>x!==-1).length===0;
    }
    revealLetter(index) {
        this.letterDivs[index].color = 'white'
    }
    hideLetter(index){
        this.letterDivs[index].color = 'transparent'
    }
}
