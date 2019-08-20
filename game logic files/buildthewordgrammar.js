//
// sentences = words.map(x=>{
//     if(x.match(/^[a|e|i|o|u]/)){
//         return "I have an " + x;
//     }else if(x.match(/[s]$/)){
//         return "I have " + x;
//     }else{
//         return "I have a " + x;
//     }
// });


extras = ['fire']
let LOADED_IMAGES = new ImageLoader('../images/', extras);
let loaded = false;

let background = 'bg' + (Math.random() * 8 | 0).toString() + '.jpg';
document.body.style.backgroundColor = 'grey'
document.body.style.backgroundImage = 'url(../images/' + background.toString() + ')';
//document.body.style.backgroundSize = width + 'px auto';
document.body.style.backgroundRepeat = 'no-repeat';


let chosen = sentences[Math.random() * sentences.length | 0];

let letters = chosen.split(' ');

let modes = ['fires', 'monsters', 'ghosts'];
let chosen_mode = Math.random() * 4| 0;
if (chosen_mode === 3) {
    chosen_mode--;
}
let ps = [];
let promises = letters.map((letter, i) => {
    let p = new Promise(resolve => {
        setTimeout(() => {
            let par = {};
            if (letter !== " ") {
                par = new P(letter, Math.random() * (width - 100), Math.random() * 100);
                par.set('color', 'white');
                par.set('text-shadow', 'black 2px 2px 2px')
                par.set('font-size',( width<400? 3: 5 )+'em');
                par.set('z-index', 5);
                par.set('padding',0)
                par.set('margin',0)
                par.shape.addEventListener('mousedown', (ev) => {
                    if (!par.locked) {
                        dropAll()
                        pickup(par, ev)
                    }

                });
                par.shape.addEventListener('touchstart', (ev) => {

                    if (!par.locked) {
                        if (ev.touches.length === 1) {
                            ev = ev.touches[0];
                        } else {
                            ev = ev.touches[ev.touches.length - 1];
                        }

                        dropAll()
                        pickup(par, ev)
                    }
                });
                par.shape.addEventListener('mouseup', (ev) => {
                    drop(par)
                });
            }

            resolve(par)
        }, 500 * i)
    });

    return p;
});
let lines = [];
Promise.all(promises).then(res => {
    ps = res;
    let w = width<400? 30:50; //line width
    let space = 15; //space width
    let y_calc = height - 50;
    let num = ps.length;

    let start_x = (width / 2) - (ps.reduce((tot,a)=>tot+=a.shape.offsetWidth,0) / 2);
    console.log(start_x)

    lines = ps.map((x, i) => {
        w = 0;
        for(let j = i-1; j>=0; j--){
            w+= space + ps[j].shape.offsetWidth;
        }
        if (Object.keys(x).length) {
            let l = new Line(start_x + w, y_calc, start_x + w +  ps[i].shape.offsetWidth, y_calc, 'white');
            l.line.set('height', 2)
            l.line.set('box-shadow', 'black 2px 2px 2px')
            l.target = x.string;
            return l;
        } else {
            return {};
        }

    });
    ps = ps.filter(x => Object.keys(x).length);
    lines = lines.filter(x => Object.keys(x).length);
    setTimeout(() => {
        generateObstacles(modes[chosen_mode]);
        start()
    }, 2000)

});

function dropAll() {
    ps.forEach(x => {
        drop(x)
    })
}

let dragging_offset = new Vector(0, 0);

function drag(ev) {
    ps.forEach(x => {
        if (x.dragging) {
            x.set('top', (ev.clientY - x.shape.offsetHeight/2) + 'px');
            x.set('left', (ev.clientX - x.shape.offsetWidth / 2) + 'px');
        }
    })
}

function pickup(letter, ev) {
    if (!letter.locked && !letter.resetting) {
        letter.set('color', 'blue');
        letter.set('top', (ev.clientY - letter.shape.offsetHeight/2) + 'px');
        letter.set('left', (ev.clientX - letter.shape.offsetWidth / 2) + 'px');
        letter.dragging = true;
    }
}

function drop(letter) {
    if (!letter.locked) {
        letter.set('color', 'white')
        letter.dragging = false;
    }
}

document.addEventListener('mouseup', () => {
    dropAll()
});
document.addEventListener('touchend', () => {
    dropAll()
});

document.addEventListener('mousemove', (ev) => {
    drag(ev)
});
document.addEventListener('touchmove', (ev) => {
    if (ev.touches.length > 1) {
        ev = ev.touches[ev.touches.length - 1];
    } else {
        ev = ev.touches[0];
    }

    drag(ev)
});
let fires = [];
let monsters = [];
let powers = ['iceball', 'electricball', 'magicball', 'fire', 'waterball', 'blackenergyball', 'blueenergyball', 'tornadoball', 'pinkenergyball']

function generateObstacles(mode) {
    switch (mode) {
        case modes[0]:
            let firenum = (Math.random() * (difficulty * 2 + 1) | 0) + 5 + (difficulty>2? 5 : 0);
            if (Math.random() < (0.4 + difficulty / 10)) {
                monsters.push(new Character(width*Math.random(), 300, 'monster' + (Math.random() * 30 | 0)));
                monsters[0].bounds.y = height - 150;
                monsters[0].bounds.x = width
                monsters[0].addSprite(new Img('../images/' + monsters[0].name + '.png', monsters[0].x, 300, 200));
                requestAnimationFrame(() => {
                    monsters[0].sprite.shape.addEventListener('click', () => {
                        let n = Math.random()
                        monsters[0].a.add(new Vector(n*40-20,-30))
                       /* if (n > .7) {
                            monsters[0].jumpleft();
                        } else if (n > .3) {
                            monsters[0].jump()
                        } else {
                            monsters[0].jumpright();
                        }*/
                    })
                })
            } else {
                firenum += 2;
            }

            for (let i = 0; i < firenum; i++) {
                let xx = Math.random() * width*0.05 + (width*.8 / firenum) * i + (Math.random() * 40 - 20);
                let yy = Math.random() * height;
                if (xx > width*.3 && xx < width*.7 && yy > height*.7) {
                    yy -= height*.4;
                }
                fires.push(new PowerBall(xx, yy, powers[Math.random() * powers.length | 0]));
            }
            fires.forEach(fire => {
                fire.addSprite(new Img('../images/' + fire.name + '.png', 100, 100, 50));
                fire.nobounds = true;
            });


            // let point = new Div(fire_x_test,fire_y_test,'black',5)
            requestAnimationFrame(() => {
                fires.forEach(fire => {
                    fire.orbit(new Vector(Math.random() * 40 - 20, Math.random() * 40 - 20));
                });
            });
            break;
        case modes[1]:
            let num = (Math.random()*2  | 0) + difficulty + 1 + (difficulty>2? 1 : 0);

            for (let i = 0; i < num; i++) {

                let mon = new Character(width*.1 + ((width*.8)/ num) * i, 300, 'monster' + (Math.random() * 30 | 0));
                mon.addSprite(new Img('../images/' + mon.name + '.png', mon.x, 300, 200))
                requestAnimationFrame(() => {
                    mon.sprite.shape.addEventListener('click', () => {
                        let n = Math.random()
                        mon.a.add(new Vector(n*40-20,-30))
                        /*
                        if (n > .7) {
                            mon.jumpleft();
                        } else if (n > .3) {
                            mon.jump()
                        } else {
                            mon.jumpright();
                        }*/
                    })
                })
                mon.bounds.x = width
                mon.bounds.y = height - 100;
                monsters.push(mon)

            }
            break;
        case modes[2]:

            let chasenum = (Math.random() * (difficulty * 3) | 0) + 4 + (difficulty>2? 3 : 0);
            for (let i = 0; i < chasenum; i++) {
                let xx = Math.random() * width*0.05 + (width*.8 / chasenum) * i + (Math.random() * 40 - 20);
                let yy = Math.random() * 300;
                if (xx > width*.3 && xx < width*.7 && yy > height*.7) {
                yy -= height*.4;
                }
                fires.push(new Character(xx, yy, 'ghost' + i % 11));
            }
            fires.forEach(fire => {
                fire.addSprite(new Img('../images/' + fire.name + '.png', 100, 100, 50));
                fire.bounds = {x: width, y: height}
                fire.antigrav = true;
                fire.max_v = Math.random() * 7 + 9 * difficulty;
                fire.max_f = Math.random() * (difficulty*1.1 + .6) / (9 - (difficulty ));
            });


        default:
    }
    id('jmpleft').innerText = diff2word(difficulty)
    
    id('jump').innerText = modes[chosen_mode]
    
    loaded = true;
}

function winningCleanup(mode) {
    switch (mode) {
        case modes[0]:
        case modes[2]:
            fires.forEach(f => {
                f.kill();
            })
        case modes[1]:
            monsters.forEach(m => {
                m.kill();
            })
            stop();
    }
}
function cleanup(mode) {
    switch (mode) {
        case modes[0]:
        case modes[2]:
            fires.forEach(f => {
                f.sprite.destroy()
                f.rect.destroy()
            })
            fires = [];
        case modes[1]:
            monsters.forEach(m => {
                m.sprite.destroy()
                m.rect.destroy()
            })
            monsters = []
    }
}
function reset(letter) {
    requestAnimationFrame(() => {
        if (!letter.locked) {

            letter.set('color', 'red')
            letter.dragging = false;
            letter.resetting = true;
            letter.locked = false;
            setTimeout(() => {
                letter.set('top', Math.random() * 100 + 'px');
                letter.set('left', Math.random() * (width - 100) + 'px');
                letter.set('color', 'white');
                letter.resetting = false;
            }, 400)

        }
    })
}

loop = function (now) {
    let dt = now-LAST_TIME;
    fires.forEach(fire => {
        fire.update(dt);
        if (chosen_mode === 2) {//if chasing
            ps.forEach(p => {
                if (p.dragging) {
                    let x = parseInt(p.shape.offsetLeft + p.shape.offsetWidth / 2);
                    let y = parseInt(p.shape.offsetTop + p.shape.offsetHeight / 2);

                    fire.chase(new Vector(x, y))
                }
            })

        }

    });
    monsters.forEach(monster => {
        monster.update(dt);

        if (Math.random() * 1000 < 5) {
            monster.hop();
        }

        if (Math.random() * 1000 < (monster.health > 30 ? 20 : 5)) {
            monster.hop();
        }
        if (Math.random() * 3000 < 2) {
            monster.jump();
        }
        if (Math.random() * 1000 < 5) {
            monster.jumpleft();
        }
        if (Math.random() * 1000 < 5) {
            monster.jumpright();
        }


    });
    ps.forEach(letter => {
            if (!letter.resetting && !letter.locked) {

                let sh = letter.shape
                let x = parseInt(sh.offsetLeft + sh.offsetWidth / 2)
                let y = parseInt(sh.offsetTop + sh.offsetHeight / 2)

                fires.forEach(fire => {
                    let fire_y = fire.p.y + fire.h / 2;
                    let fire_x = fire.p.x + fire.w / 2;
                    let f_v = new Vector(fire_x, fire_y);

                    if (Math.abs(x-fire_x)<sh.offsetWidth/2 && Math.abs(y-fire_y)<sh.offsetHeight/2) {
                        reset(letter)
                    }
                });
                monsters.forEach(monster => {
                    let monster_y = monster.p.y + monster.h / 2;
                    let monster_x = monster.p.x + monster.w / 2;
                    if (Math.abs(x-monster_x)<sh.offsetWidth/2 && Math.abs(y-monster_y)<(sh.offsetHeight/2 + monster.sprite.shape.offsetHeight/3)) {
                        reset(letter)
                    }

                })
                lines.forEach(line => {
                    if (line.target === letter.string) {
                        if (line.a.copy().add(new Vector(line.length/2, sh.offsetHeight/-4)).dist(new Vector(x, y)) < sh.offsetHeight/4) {
                            letter.locked = true;
                            letter.set('color', 'green');
                            letter.set('z-index', 0);
                            letter.set('top',line.a.y -sh.offsetHeight*0.8+'px')
                            letter.set('left',line.a.x + line.length/2 - sh.offsetWidth/2+ 'px')
                            letter.dragging = false;
                            line.target += 'done';
                        }
                    }
                })
            }

        }
    )

    if (loaded && lines.filter(x => !x.target.endsWith('done')).length <= 0) {
        winningCleanup(modes[chosen_mode]);
    }
    LAST_TIME = now;
    if(LOOPING){
        requestAnimationFrame(loop)
    }
};

id('jmpleft').addEventListener('click',()=>{
     if(loaded){
     difficulty++
     difficulty%=4
     id('jmpleft').innerText = diff2word(difficulty)
     cleanup(modes[chosen_mode])
     generateObstacles(modes[chosen_mode])
     }
   
})
id('jump').addEventListener('click',()=>{
    if(loaded){
    cleanup(modes[chosen_mode])
    
    chosen_mode++
    chosen_mode%=modes.length
    id('jump').innerText = modes[chosen_mode]
    
    generateObstacles(modes[chosen_mode])
    }
})