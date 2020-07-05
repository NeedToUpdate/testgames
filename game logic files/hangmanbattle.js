let IMAGE_PATH = '../images/'

let MAINARENA = new Rectangle(width*.2,0,width*.6,height*.8).asOutline('black');
let background = 'background' + getRandom(20).toString() + '.jpg';
MAINARENA.set('backgroundColor',  'grey');
MAINARENA.set('backgroundImage',  'url(' + IMAGE_PATH + background.toString() + ')');
MAINARENA.set('backgroundSize', 'cover');
MAINARENA.set('backgroundRepeat','no-repeat');
MAINARENA.set('backgroundPosition', 'center');

let teamAWordPool = Array.from(words);
let teamBWordPool = Array.from(words);


let teamAWord = '';
let teamBWord = '';
function setup() {
    teamAWord = teamAWordPool.splice(getRandom(teamAWordPool.length),1)
    teamBWord = teamBWordPool.splice(getRandom(teamAWordPool.length),1)
}

class Puzzle extends Rectangle{
    constructor(word,x,y,w,h,team){
        super(x,y,w,h);
        this.team = team
        this.word = word;
        this.letters = word.split('');
        this.found_letters = Array(word.length).fill(' ');
        this.lines = []
        this.createLines();
        this.styleUp(team);
    }
    createLines(){
        this.asOutline('black');
        let x = this.width*.01;
        let maxwidth = this.width*.98;
        let y = this.height*.8;
        let linewidth = (maxwidth*0.9)/(this.word.length);
        if(linewidth>width*.06) linewidth = width*.06
        for(let i = 0; i<this.word.length; i++){
            let x1 = x + maxwidth/2 - (linewidth)*((this.word.length-1)/2) + i*linewidth + linewidth*0.05;
            let x2 = x1 + linewidth*0.9;
            let l = new LineFromPoints(x1,y,x2,y,3).fromCenter();
            this.lines.push(l);
            this.attach(l)
        }
    }
    styleUp(team){
        if(team === 'A'){
            this.set('backgroundColor', 'royalblue');
            this.border = '3px solid blue';
            this.set('borderRadius', '13px');
            this.set('boxShadow', '2px 2px 2px 2px black');
            this.lines.forEach(l=>{
                l.set('backgroundColor', 'cyan')
                l.set('borderRadius', '3px')
            })
        }else{
            this.set('backgroundColor', 'indianred');
            this.border = '3px solid red';
            this.set('borderRadius', '13px');
            this.set('boxShadow', '2px 2px 2px 2px black');
            this.lines.forEach(l=>{
                l.set('backgroundColor', 'maroon')
                l.set('borderRadius', '3px')
            })
        }
    }


}