difficulty = 0;
let chosen = words[Math.random() * words.length | 0];
FPS = 30;
let letters = chosen.split('');
let colors = ['darkred', 'darkgreen', 'darkgoldenrod', 'purple', 'darkblue', 'darkorange', 'darkcyan', 'darkslategray' ]
alphabet = 'abcdefghijklmnopqrstuvwxyz'
extras = ['fire', 'stars']
let LOADED_IMAGES = new ImageLoader('../images/', extras);

let background = 'bg' + (Math.random() * 8 | 0).toString() + '.jpg';
document.body.style.backgroundColor = 'grey'
document.body.style.backgroundImage = 'url(../images/' + background.toString() + ')';
document.body.style.backgroundSize = width + 'px auto';
document.body.style.backgroundRepeat = 'no-repeat';
let timep = id('time')
let date = new Date();

let starttime = 0;
let timer = 10.00 + letters.length + (20.00-difficulty*10);
id('time').innerText = timer.toPrecision(4);


id('jmpright').addEventListener('click',()=>{
    timer++
    id('time').innerText = timer.toPrecision(4);
});
id('jmpleft').addEventListener('click',()=>{
    difficulty++
    difficulty %=3;
    timer = 10.00 + letters.length + (20.00-difficulty*10);
    id('time').innerText = timer.toPrecision(4);
    id('jmpleft').innerText = difficulty;
});
id('jump').addEventListener('click', ()=>{
    timer--
    id('time').innerText = timer.toPrecision(4);
});
function play() {
    lasttime = window.performance.now()
    start();
}

let grid = new Matrix(2, 6);
let lines = [];
setup = function () {
    grid.values.forEach((row, y) => {
        row.forEach((col, x) => {
            let letter = genLetter();
            grid.values[y][x] = genButton(letter, x, y)
            if (letter === chosen[0]) {
                grid.values[y][x].par.set('text-shadow', 'green 0px 0px 10px')
                grid.values[y][x].div.shape.addEventListener('click', () => {
                    if (!LOOPING) {
                        grid.map(x => {
                            x.par.set('text-shadow', '')
                            return x;
                        })
                        play();
                    }

                })
            }
        })
    });
    let w = 50; //line width
    let space = 5; //space width
    let y_calc = height * .35;
    let num = letters.length;

    let start_x = (width / 2) - (w + space) * num / 2;
    lines = letters.map((x, i) => {
        if (x !== " ") {
            let l = new Line(start_x + (w + space) * i, y_calc, start_x + w + (w + space) * i, y_calc, 'white');
            l.line.set('height', 2)
            l.line.set('box-shadow', 'black 2px 2px 2px')
            l.target = x;
            return l;
        } else {
            return {};
        }
    });


}
let winner = false;
let gen_times = 0;
let last_letter = -1;
let total_letters = 0;
let max_num_of_letters = 12

function genLetter() {

    let nextletter = chosen[final_word.length];
    if (!nextletter) {
        return alphabet[Math.random() * 26 | 0];
    }

    if (final_word.length === 0) {
        if (Math.random() > .3 && max_num_of_letters - 1 > total_letters) {
            gen_times++
            total_letters++
            return alphabet[Math.random() * 26 | 0];
        } else {
            gen_times = 0;
            last_letter = final_word.length;
            total_letters++
            return nextletter;
        }
    } else {
        if (Math.random() > .3 && max_num_of_letters - 1 > total_letters) {
            gen_times++
            total_letters++
            return alphabet[Math.random() * alphabet.length | 0];
        } else {
            gen_times = 0;
            last_letter = final_word.length;
            total_letters++
            return nextletter;
        }
    }


}


function genButton(string, x, y) {
    let g = new GameButton(string, [x, y]);
    [x, y] = pos2xy(x, y);
    g.x = x;
    g.y = y;
    g.set('top', y + 'px');
    g.set('left', x + 'px');
    return g;
}

function pos2xy(xpos, ypos) {
    let top = height * 0.4;
    let left = width * 0.2;
    return [left + 45 + xpos * 85, top + 30 + ypos * 85]
}

let final_word = ""
let final_letters = [];

function replaceButton(pos, correct) {
    if (correct) {
        grid.values[pos[1]][pos[0]].correctkill();
    } else {
        grid.values[pos[1]][pos[0]].kill();
    }
    total_letters--;
    if (grid.values[pos[1]][pos[0]].dead) {
        setTimeout(() => {
            requestAnimationFrame(() => {
                let newbtn = genButton(genLetter(), pos[0], pos[1]);
                if (grid.values[pos[1]][pos[0]].div) {
                    if (document.body.contains(grid.values[pos[1]][pos[0]].div.shape)) {
                        console.log('hey', pos)

                        grid.values[pos[1]][pos[0]].div.remove();
                    }
                }
                requestAnimationFrame(() => {
                    grid.values[pos[1]][pos[0]] = newbtn;
                })
            })

        }, 500)
    }

}

function clickHandler(string, pos) {
    if (final_word.length >= chosen.length) {
        if(!winner)win();
        return
    }
    let currentLine = lines[final_word.length].line;
    let temp_p = new P(string, currentLine.x, currentLine.y - 124, "white");
    temp_p.set('fontSize', '4em');


    temp_p.x += (50 - temp_p.shape.offsetWidth) / 2;
    let temp = final_word + string;
    if (chosen.startsWith(temp)) {
        //CORRECT
        final_word += string;
        final_letters.push(temp_p);
        replaceButton(pos, true);
        grid.values.forEach((row, y) => {
            row.forEach((col, x) => {
                if (Math.random() < .4 && (x !== pos[0] || y !== pos[1])) {
                    replaceButton([x, y], true)
                }

            })
        })
    } else {
        //WRONG
        replaceButton(pos)
        setTimeout(() => {
            temp_p.set('color', 'red');
            setTimeout(() => {
                temp_p.remove();
            }, 700)
        }, 100)
    }
    console.log(final_word)
    if (final_word === chosen) {
        win();
    }
    if(chosen[final_word.length] === " "){
        final_word += " ";
    }
}

function win() {
    winner = true;
    setAll('border', 'limegreen solid 5px')
    setAllLetters('color', 'limegreen')
    stop();
}

function setAll(attr, val) {
    grid.map((x, i, j) => {
        if (!x) {
            console.log(i, j, grid)
        }
        x.set(attr, val)

        return x;
    })
}

function setAllLetters(attr, val) {
    final_letters.forEach(x => {
        x.set(attr, val)
    })
}
let fakelag = 100;
let lasttime = window.performance.now()
loop = function (now) {
    let dt = now-lasttime;
    if(!winner){
        timer -= (now-lasttime)/1000;
        timer = timer.toPrecision(4)
        if (timer <= 0) {
            id('timep').style.color = "red"
            setAll('border', 'red solid 5px')
            grid.map(x => {
                x.kill()
                return x;
            })

            stop();
        }
        timep.innerText = timer;

    }
    for(let i = 0; i<grid.values.length; i++){
        for(let j = 0; j<grid.values[i].length; j++){
            let x = grid.values[i][j]
            x.update()
            if (Math.random() < 0.002+difficulty*0.001) {
                x.jump();
            }
            if (Math.random() < 0.002+difficulty*0.001 + (difficulty>1?0.5: 0)) {
                if(difficulty>0){
                    x.spinhalf();
                }else{
                    x.spin();
                }

            }
        }
    }
    // grid.map(x => {
    //     x.update(dt)
    //     if (Math.random() < 0.002+difficulty*0.005) {
    //         x.jump();
    //     }
    //     if (Math.random() < 0.002+difficulty*0.005) {
    //         if(difficulty>0){
    //             x.spinhalf();
    //         }else{
    //             x.spin();
    //         }
    //
    //     }
    //
    //     return x;
    // })

    lasttime = now;
    if(LOOPING){
            requestAnimationFrame(loop);


    }
}
