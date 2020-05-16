difficulty = 0;
let chosen = words[Math.random() * words.length | 0];
FPS = 60;
let letters = chosen.split('');
let colors = ['darkred', 'darkgreen', 'darkgoldenrod', 'purple', 'darkblue', 'darkorange', 'darkcyan', 'darkslategray'];
let extras = ['fire', 'stars'];
let LOADED_IMAGES = new ImageLoader('../images/', extras);

let background = 'bg' + (Math.random() * 8 | 0).toString() + '.jpg';
document.body.style.backgroundColor = 'grey';
document.body.style.backgroundImage = 'url(../images/' + background.toString() + ')';
document.body.style.backgroundRepeat = 'no-repeat';
let timep = id('time');
let timer = 10.00 + letters.length + (20.00 - difficulty * 10);
id('time').innerText = timer.toPrecision(4);


id('jmpright').addEventListener('click', () => {
    timer++;
    id('time').innerText = timer.toPrecision(4);
});
id('jmpleft').addEventListener('click', () => {
    difficulty++;
    difficulty %= 3;
    timer = 10.00 + letters.length + (20.00 - difficulty * 10);
    id('time').innerText = timer.toPrecision(4);
    id('jmpleft').innerText = difficulty;
});
id('jump').addEventListener('click', () => {
    timer--;
    id('time').innerText = timer.toPrecision(4);
});

function play() {
    lasttime = window.performance.now();
    MAINLOOP = setInterval(loop, 1000 / FPS);
    LOOPING = true;
}

let grid = new Matrix(2, 6);
let lines = [];
let gamearea = {};

let setupletters = function () {
    let w = 50; //line width
    let space = 5; //space
    let button_w = 80;
    let button_space = 10;
    let y_calc = height * .35;
    let num = letters.length;

    gamearea = new Div(width / 2 - ((button_w + button_space) * grid.cols / 2) - 15, pos2xy(0, 0)[1] - button_space - 15, 'blue', (button_w + button_space) * grid.cols + 30, (button_w + button_space) * grid.rows + 30, true);
    gamearea.set('backgroundImage', 'linear-gradient(to top left, #59c173, #a17fe0, #5d26c1)');
    gamearea.set('borderRadius', '20px');
    gamearea.set('border', 'solid 3px white');
    gamearea.set('boxShadow', 'rgba(255,255,255,0.5) 0px 0px 5px 5px');

    grid.values.forEach((row, y) => {
        row.forEach((col, x) => {
            let letter = genLetter();
            grid.values[y][x] = genButton(letter, x, y);
            addStartGameTrigger(grid.values[y][x], letter)

        })
    });


    let start_x = (width / 2) - (w + space) * num / 2;
    lines = letters.map((x, i) => {
        if (x !== " ") {
            let l = new Line(start_x + (w + space) * i, y_calc, start_x + w + (w + space) * i, y_calc, 'white');
            l.line.set('height', 2);
            l.line.set('box-shadow', 'black 2px 2px 2px');
            l.target = x;
            return l;
        } else {
            return {};
        }
    });


};
let winner = false;
let gen_times = 0;
let last_letter = -1;
let total_letters = 0;
let max_num_of_letters = 12;

function addStartGameTrigger(btn, letter) {
    if (letter === chosen[0]) {
        btn.div.set('border', 'blue 5px solid');
        btn.div.shape.addEventListener('click', () => {
            if (!LOOPING) {
                grid.map(x => {
                    x.div.set('border', 'white 5px solid');
                    return x;
                });
                play();
            }
        })
    }
}

function genLetter() {

    let nextletter = chosen[final_word.length];
    if (!nextletter) {
        return alphabet[Math.random() * 26 | 0];
    }

    if (final_word.length === 0 && total_letters < max_num_of_letters) {
        if (Math.random() > .3 && max_num_of_letters - 1 > total_letters) {
            gen_times++;
            total_letters++;
            return alphabet[Math.random() * 26 | 0];
        } else {
            gen_times = 0;
            last_letter = final_word.length;
            total_letters++;
            return nextletter;
        }
    } else if (final_word.length === 0) {
        total_letters++;
        console.log('here');
        return Array.from(alphabet).filter(x => x !== nextletter)[getRandom(alphabet.length - 1) | 0]
    } else if (final_word.length > 0) {
        if (Math.random() > .3 && max_num_of_letters - 1 > total_letters) {
            gen_times++;
            total_letters++;
            return alphabet[Math.random() * alphabet.length | 0];
        } else {
            gen_times = 0;
            last_letter = final_word.length;
            total_letters++;
            return nextletter;
        }
    }


}


function genButton(string, x, y) {
    let pos = [x,y]
    let g = new GameButton(string, pos, winner? 'limegreen' : 'white');
    [x, y] = pos2xy(x, y);
    g.x = x;
    g.y = y;
    g.set('top', y + 'px');
    g.set('left', x + 'px');
    g.div.shape.addEventListener('click', () => {
        if(Math.random()<0.05){
            if(Math.random()<0.5) {
                g.jumpright();
            }else {

                g.jumpleft();
            }
        }else{
            clickHandler(string, pos);
        }

    });
    return g;
}

function pos2xy(xpos, ypos) {
    let top = height * 0.4;
    let left = width / 2 - 85 * grid.cols / 2;
    return [left + xpos * 85, top + 30 + ypos * 85]
}

let final_word = "";
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
                let letter = genLetter();
                let newbtn = genButton(letter, pos[0], pos[1]);
                if (grid.values[pos[1]][pos[0]].div) {
                    if (document.body.contains(grid.values[pos[1]][pos[0]].div.shape)) {
                        grid.values[pos[1]][pos[0]].div.remove();
                    }
                }
                if (!LOOPING) addStartGameTrigger(newbtn, letter);
                requestAnimationFrame(() => {
                    grid.values[pos[1]][pos[0]] = newbtn;
                })
            })

        }, 500)
    }

}

function clickHandler(string, pos) {
    if (final_word.length >= chosen.length) {
        if (!winner) win();
        return
    }
    let currentLine = lines[final_word.length].line;
    let temp_p = new P(string, currentLine.x, currentLine.y - 134, "white");
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
        replaceButton(pos);
        setTimeout(() => {
            temp_p.set('color', 'red');
            setTimeout(() => {
                temp_p.remove();
            }, 700)
        }, 100)
    }
    if (final_word === chosen) {
        win();
    }
    if (chosen[final_word.length] === " ") {
        final_word += " ";
    }
}

function win() {
    winner = true;
    setAll('border', 'limegreen solid 5px');
    setAllLetters('color', 'limegreen');
    stop();
}

function setAll(attr, val) {
    grid.map((x, i, j) => {
        if (!x) {
            //   console.log(i, j, grid)
        }
        x.set(attr, val);

        return x;
    })
}

function setAllLetters(attr, val) {
    final_letters.forEach(x => {
        x.set(attr, val)
    })
}

let lasttime = window.performance.now();
let draw = function () {
    if (!winner) {
        timer -= (window.performance.now() - lasttime) / 1000;
        timer = timer.toPrecision(4);
        if (timer <= 0) {
            timer = 0;
            id('timep').style.color = "red";
            setAll('border', 'red solid 5px');
            grid.map(x => {
                x.kill();
                return x;
            });
            stop();
        }
        timep.innerText = timer;
    }
    grid.map(x => {
        x.update();
        return x;
    });
    lasttime = window.performance.now();

};
loop = function () {
    grid.map(x => {
        if (Math.random() < 0.003 + difficulty * 0.001) {
            x.jump();
        }
        if (Math.random() < 0.006 + difficulty * 0.003 + (difficulty > 1 ? 0.5 : 0)) {
            if (difficulty > 0) {
                x.halfspin();
            } else {
                x.spin();
            }

        }
        return x;
    });
    draw();
};
setupletters();