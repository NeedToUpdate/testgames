difficulty = 0;
let chosen = words[Math.random() * words.length | 0];
let IMAGE_PATH = '../../images/';
let letters = chosen.split('');
let colors = ['darkred', 'darkgreen', 'darkgoldenrod', 'purple', 'darkblue', 'darkorange', 'darkcyan', 'darkslategray'];
let extras = ['fire', 'stars'];
let LOADED_IMAGES = new ImageLoader(IMAGE_PATH, extras);

let background = 'bg' + (Math.random() * 8 | 0).toString() + '.jpg';
document.body.style.backgroundColor = 'grey';
document.body.style.backgroundImage = 'url(' + IMAGE_PATH + background.toString() + ')';
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

let grid = Array(2).fill(Array(6).fill({}));
let lines = [];
let gamearea = {};
LOOPING = false;

let setupletters = function () {
    let w = 50; //line width
    let space = 5; //space
    let button_w = 80;
    let button_space = 10;
    let y_calc = height * .35;
    let num = letters.length;

    gamearea = new Rectangle(width / 2 - ((button_w + button_space) * grid[0].length / 2) - 15, pos2xy(0, 0)[1] - button_space - 55, (button_w + button_space) * grid[0].length + 30, (button_w + button_space) * grid.length+ 30);
    gamearea.set('backgroundImage', 'linear-gradient(to top left, #59c173, #a17fe0, #5d26c1)');
    gamearea.set('borderRadius', '20px');
    gamearea.set('border', 'solid 3px white');
    gamearea.set('boxShadow', 'rgba(255,255,255,0.5) 0px 0px 5px 5px');

    grid = grid.map((row, y) => {
        return row.map((col, x) => {
            let letter = genLetter();
            let btn = genButton(letter, x, y)
            addStartGameTrigger(btn, letter)
            return btn;
        })
    });
    let start_x = (width / 2) - (w + space) * num / 2;
    lines = letters.map((x, i) => {
        if (x !== " ") {
            let l = Line.fromPoints(start_x + (w + space) * i, y_calc - button_space * 2, start_x + w + (w + space) * i, y_calc - button_space * 2, 2);
            l.color = 'white';
            l.set('box-shadow', 'black 2px 2px 2px');
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
                grid.forEach(row => {
                    row.forEach((x) => {
                         x.div.set('border', 'white 5px solid');
                })});
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
    let pos = [x, y];
    let g = new GameButton(string, pos, winner ? 'limegreen' : 'white');
    [x, y] = pos2xy(x, y);
    g.x = x;
    g.y = y;
    g.maxbounds.y = y + 35;
    g.addForce(VECTORS.gravity);
    g.sprite.shape.addEventListener('click', () => {
        if (Math.random() < 0.05) {
            if (Math.random() < 0.5) {
                g.jumpRight();
            } else {
                g.jumpLeft();
            }
        } else {
            clickHandler(string, pos);
        }

    });
    return g;
}

function pos2xy(xpos, ypos) {
    let top = height * 0.4;
    let left = width / 2 - 70 * grid[0].length / 2;
    return [left + xpos * 85, top + 30 + ypos * 85]
}

let final_word = "";
let final_letters = [];

function replaceButton(pos, correct) {
    if (correct) {
        grid[pos[1]][pos[0]].addDeathImage(LOADED_IMAGES.stars.cloneNode());
        grid[pos[1]][pos[0]].kill();
    } else {
        grid[pos[1]][pos[0]].kill();
    }
    total_letters--;
    if (grid[pos[1]][pos[0]].dead) {
        setTimeout(() => {
                let letter = genLetter();
                let newbtn = genButton(letter, pos[0], pos[1]);
                if (grid[pos[1]][pos[0]].hasSprite) {
                    grid[pos[1]][pos[0]].div.remove();
                }
                if (!LOOPING) addStartGameTrigger(newbtn, letter);
                grid[pos[1]][pos[0]] = newbtn;

        }, 500)
    }

}

function clickHandler(string, pos) {
    if (final_word.length >= chosen.length) {
        if (!winner) win();
        return
    }
    let currentLine = lines[final_word.length];
    let temp_p = new P(string, currentLine.x, currentLine.y - 134, "white");
    temp_p.set('fontSize', '4em');
    temp_p.x += (50 - temp_p.shape.offsetWidth) / 2;
    let temp = final_word + string;
    if (chosen.startsWith(temp)) {
        //CORRECT
        final_word += string;
        final_letters.push(temp_p);
        replaceButton(pos, true);
        grid.forEach((row, y) => {
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
    grid.forEach(row => {
        row.forEach((x) => {
            x.set(attr, val);
        })
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
            grid.forEach(row => {
                row.forEach((x) => {
                    x.kill();
                })
            });
            stop();
        }
        timep.innerText = timer;
    }
    grid.forEach(row => {
        row.forEach((x) => {
            x.update();
        })
    });
    lasttime = window.performance.now();

};
loop = function () {
    grid.forEach(row => {
        row.forEach(
            x => {
                if (Math.random() < 0.003 + difficulty * 0.001) {
                    x.jumpUp();
                }
                if (Math.random() < 0.006 + difficulty * 0.003 + (difficulty > 1 ? 0.5 : 0)) {
                    if (difficulty > 0) {
                        x.doSpin(180, 10)
                    } else {
                        x.doSpin(360, 10);
                    }
                }
            })
    });
    draw();
    if (LOOPING) requestAnimationFrame(loop)
};
setupletters();