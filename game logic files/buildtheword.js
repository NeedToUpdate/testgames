difficulty = 2;

extras = ['fire'];
let IMAGE_PATH = '../images/';
let LOADED_IMAGES = new ImageLoader(IMAGE_PATH, extras);
let loaded = false;

let background = 'bg' + (Math.random() * 8 | 0).toString() + '.jpg';
document.body.style.backgroundColor = 'grey';
document.body.style.backgroundImage = 'url(' + IMAGE_PATH + background.toString() + ')';
//document.body.style.backgroundSize = width + 'px auto';
document.body.style.backgroundRepeat = 'no-repeat';

let chosen = GRAMMAR_MODE ? sentences[Math.random() * sentences.length | 0] : words[Math.random() * words.length | 0];

let letters = chosen.split(GRAMMAR_MODE ? ' ' : '');

let modes = ['flyers', 'monsters', 'ghosts', 'aliens'];
let chosen_mode = Math.random() * 4 | 0;
if (chosen_mode === 3) {
    //chosen_mode--;
    //to make the 3rd mode more popular
}
let ps = [];
let promises = letters.map((letter, i) => {
    return new Promise(resolve => {
        setTimeout(() => {
            let par = {};
            if (letter !== " ") {
                par = new P(letter, Math.random() * (width - 200) + 100, Math.random() * 100);
                par.set('color', 'white');
                par.set('text-shadow', 'black 2px 2px 2px');
                par.set('font-size', (GRAMMAR_MODE ? (width < 400 ? 2 : 3) : (width < 400 ? 3 : 5) )+ 'em');
                par.set('z-index', 5);
                par.shape.addEventListener('mousedown', (ev) => {
                    if (!par.locked) {
                        dropAll();
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
                        dropAll();
                        pickup(par, ev)
                    }
                });
                par.shape.addEventListener('mouseup', () => {
                    drop(par)
                });
            }
            resolve(par)
        }, 500 * i)
    });
});
let lines = [];
Promise.all(promises).then(res => {
    ps = res;
    let w = width < 400 ? 30 : 50; //line width
    let space = GRAMMAR_MODE ? 15 : 5; //space width
    let y_calc = height - 50;
    let num = ps.length;

    let start_x = (width / 2) - (GRAMMAR_MODE ? (ps.reduce((tot, a) => tot + a.shape.offsetWidth, 0) / 2) : ((w + space) * num / 2));

    lines = ps.map((x, i) => {
        if (GRAMMAR_MODE) {
            w = 0;
            for (let j = i - 1; j >= 0; j--) {
                w += space + ps[j].width;
            }
        }
        if (Object.keys(x).length) {
            let l = {};
            if (GRAMMAR_MODE) {
                l = Line.fromPoints(start_x + w, y_calc, start_x + w + ps[i].width, y_calc, 2);
            } else {
                l = Line.fromPoints(start_x + (w + space) * i, y_calc, start_x + w + (w + space) * i, y_calc, 2);
            }

            l.color = 'white';
            l.set('box-shadow', 'black 2px 2px 2px');
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
    }, 1000)

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
            let newY = (ev.clientY - x.shape.offsetHeight / 2);
            let newX = (ev.clientX - x.shape.offsetWidth / 2);
            if(newY>(height-x.shape.offsetHeight / 2)) newY = (height-x.shape.offsetHeight / 2);
            if(newY<x.shape.offsetHeight / -2) newY =x.shape.offsetHeight / -2;
            if(newX>(width-x.shape.offsetWidth / 2)) newX = (width-x.shape.offsetWidth / 2);
            if(newX<x.shape.offsetWidth / -2) newX = x.shape.offsetWidth / -2;
            x.y = newY;
            x.x = newX;
        }
    })
}

function pickup(letter, ev) {
    if (!letter.locked && !letter.resetting) {
        letter.set('color', 'blue');
        let newY = (ev.clientY - letter.shape.offsetHeight / 2);
        let newX = (ev.clientX - letter.shape.offsetWidth / 2);
        if(newY>height) newY = height;
        if(newY<0) newY = 0;
        if(newX>width) newX = width;
        if(newX<0) newX = 0;
        letter.y = newY;
        letter.x = newX;
        letter.dragging = true;
    }
}

function drop(letter) {
    if (!letter.locked) {
        letter.set('color', 'white');
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
let flyers = [];
let monsters = [];
let powers = ['ice_projectile', 'electric_projectile', 'magic_projectile', 'fire', 'water_projectile', 'blackenergy_projectile', 'blueenergy_projectile', 'tornado_projectile', 'pinkenergy_projectile'];

function generateObstacles(mode) {
    switch (mode) {
        case modes[0]:
            //flyers
            let firenum = (Math.random() * (difficulty * 2 + 1) | 0) + 5 + (difficulty > 2 ? 5 : 0);
            if (Math.random() < (0.4 + difficulty / 10)) {
                monsters.push(new Character(width * Math.random(), 300, 'monster' + (Math.random() * 30 | 0)));
                monsters[0].maxbounds.y = height - 150;
                monsters[0].maxbounds.x = width;
				monsters[0].hasNoSkyBox = true;
                let g = new Vector(0, 1);
                g.constant = true;
                monsters[0].forces.push(g);
                let sprite = new Img(IMAGE_PATH + monsters[0].name + '.png', monsters[0].x, 300, 200).fromCenter().usingNewTransform().onLoad(() => {
                    monsters[0].addSprite(sprite);
                    monsters[0].sprite.shape.addEventListener('click', () => {
                        monsters[0].forces.push(Vector.random().set(Math.random() * 10))
                    })
                    monsters[0].addDeathImage(LOADED_IMAGES.fire.cloneNode());
                });
            } else {
                firenum += 2;
            }

            for (let i = 0; i < firenum; i++) {
                let xx = Math.random() * width * 0.05 + (width * .8 / firenum) * i + (Math.random() * 40 - 20);
                let yy = Math.random() * height;
                if (xx > width * .3 && xx < width * .7 && yy > height * .7) {
                    yy -= height * .4;
                }
                flyers.push(new Flyer(xx, yy, powers[Math.random() * powers.length | 0]));
            }
            flyers.forEach(fire => {
                let sprite = new Img(IMAGE_PATH + 'projectiles/' + fire.name + '.png', 100, 100, 50).fromCenter().usingNewTransform().onLoad(() => {
                    fire.addSprite(sprite);
                    flyers.forEach(fire => {
                        fire.doOrbit(fire.p.copy().add(Vector.random(25)), getRandom(2, 5));
                    });
                });
                fire.hasNoBounds = true;
            });
            break;
        case modes[1]:
            let num = (Math.random() * 2 | 0) + difficulty + 1 + (difficulty > 2 ? 1 : 0);
            for (let i = 0; i < num; i++) {
                let mon = new Character(width * .1 + ((width * .8) / num) * i, 300, 'monster' + (Math.random() * 30 | 0));
                let sprite = new Img(IMAGE_PATH + mon.name + '.png', mon.x, 300, 150).fromCenter().usingNewTransform().onLoad(() => {
                    mon.addSprite(sprite);
                    mon.sprite.shape.addEventListener('click', () => {
                        let n = Math.random();
                        mon.forces.push(new Vector(n * 40 - 20, -30))
                    });
                    mon.addDeathImage(LOADED_IMAGES.fire.cloneNode());
                });
                mon.maxbounds.x = width;
                mon.maxbounds.y = height - 100;
				mon.hasNoSkyBox = true;
                mon.forces.push(VECTORS.gravity);
                monsters.push(mon)
            }
            break;
        case modes[2]:
            let chasenum = (Math.random() * (difficulty * 3) | 0) + 4 + (difficulty > 2 ? 3 : 0);
            for (let i = 0; i < chasenum; i++) {
                let xx = Math.random() * width * 0.05 + (width * .8 / chasenum) * i + (Math.random() * 40 - 20);
                let yy = Math.random() * 300;
                if (xx > width * .3 && xx < width * .7 && yy > height * .7) {
                    yy -= height * .4;
                }
                flyers.push(new Flyer(xx, yy, 'ghost' + i % 11));
            }
            flyers.forEach(fire => {
                let sprite = new Img(IMAGE_PATH + fire.name + '.png', 100, 100, 50).fromCenter().usingNewTransform().onLoad(() => {
                    fire.addSprite(sprite);
                    fire.addDeathImage(LOADED_IMAGES.fire.cloneNode());
                });
                fire.maxbounds = {x: width, y: height};
                fire.MAX_V = Math.random() * 7 + 9 * difficulty;
                fire.MAX_F = Math.random() * (difficulty * 1.1 + 1.6) / (9 - (difficulty));
            });
            break;
        case modes[3]:
            let aliennum = chosen.length - (4-difficulty);
            if(aliennum<1) aliennum = 1;
            if(aliennum>chosen.length) aliennum = chosen.length-1;
            let colors = ['red','blue','orange','white','pink','purple','yellow'];
            max_held_positions = aliennum;
            for(let i = 0; i<aliennum; i++){
                let flyer = new Flyer(getRandom(100,width-100),getRandom(50,height-200),'alien'+i);
                let sprite = new Img(IMAGE_PATH + 'invaders/invader' + getRandom(colors) + '.png',0,0,lines[0].width-5).fromCenter().usingNewTransform().onLoad(()=>{
                    flyer.addSprite(sprite);
                    flyer.addDeathImage(LOADED_IMAGES.fire.cloneNode());
                    flyers.push(flyer);
                    flyer.MAX_V = 15;
                    flyer.MAX_F = 3;
                    flyer.heldPosition = getAlienVal();
                    let loc = lines[flyer.heldPosition].p.copy();
                    loc.x += lines[flyer.heldPosition].width/2;
                    loc.y -= flyer.height;
                    flyer.doMoveTo(loc).then(()=>{
                        flyer.doHover();
                    })
                })
            }

    }
    id('jmpleft').innerText = diff2word(difficulty);
    id('jump').innerText = modes[chosen_mode];
    loaded = true;
}

function winningCleanup(mode) {
    switch (mode) {
        case modes[0]:
        case modes[3]:
            held_positions = []
        case modes[2]:
            flyers.forEach(f => {
                f.kill();
            });
        case modes[1]:
            monsters.forEach(m => {
                m.kill();
            });
            stop();
    }
}

function cleanup(mode) {
    switch (mode) {
        case modes[0]:
        case modes[3]:
            held_positions = []
        case modes[2]:
            flyers.forEach(f => {
                f.deathImage = null;
                f.kill()
            });
            flyers = [];
        case modes[1]:
            monsters.forEach(m => {
                m.deathImage = null;
                m.kill()
            });
            monsters = []
    }
}

function reset(letter) {
    requestAnimationFrame(() => {
        if (!letter.locked) {
            letter.set('color', 'red');
            letter.dragging = false;
            letter.resetting = true;
            letter.locked = false;
            setTimeout(() => {
                letter.y = Math.random() * 100;
                letter.x = Math.random() * (width - 200) +100;
                letter.set('color', 'white');
                letter.resetting = false;
            }, 400)

        }
    })
}

let held_positions = [];
let max_held_positions = 0;
function getAlienVal(getEmpty){
    function solvedVals(){
        return lines.map((x,i)=>{
            return x.target.endsWith('done')?i:null
        }).filter(x=>x!==null);
    }
    if(getEmpty){
        let allnums = Array(chosen.length).fill(0).map((x,i)=>i); //array of all the indicies
        let free_nums = allnums.filter(x=>(!held_positions.includes(x) && !solvedVals().includes(x)));
        return getRandom(free_nums)
    }
    let tot = max_held_positions;
    if (held_positions.length>=tot) return null;
    let value = held_positions.length>0?getRandom(chosen.length): 0; //always make sure first position is taken
    while(held_positions.includes(value) || solvedVals().includes(value)){
        value+=1;
        value%=tot+1;
    }
    held_positions.push(value);
    return value;
}

let letters_completed = 0;
let last_check_for_letters = 0;
function loop(now) {
    let dt = now - LAST_TIME;
    flyers.forEach(flyer => {
        flyer.update(dt);
        if (chosen_mode === 2) {//if chasing
            ps.forEach(p => {
                if (p.dragging) {
                    let x = parseInt(p.shape.offsetLeft + p.shape.offsetWidth / 2);
                    let y = parseInt(p.shape.offsetTop + p.shape.offsetHeight / 2);
                    flyer.steerTo(new Vector(x, y))
                }
            })
        }
    });
    if(chosen_mode === 3){
        //if alien mode
        let valid_flyers = flyers.filter(x=>x.isDoingHover);
        if (letters_completed>last_check_for_letters && valid_flyers.length>0) {
            last_check_for_letters = letters_completed;
            let alien = getRandom(valid_flyers);
            alien.stopHover();
            held_positions.splice(held_positions.indexOf(alien.heldPosition),1);
            alien.hasNoBounds = true;
            alien.doFlyTo(new Vector(width/2,-100)).then(()=>{
                alien.deathImage = null;
                alien.kill()
                flyers.splice(flyers.indexOf(alien),1)
            })
        }
        if(Math.random()<(0.0005 + 0.0005*difficulty) && valid_flyers.length>0){
            let alien = getRandom(valid_flyers);
            let newpos = getAlienVal(true);
            let oldpos = alien.heldPosition;
            alien.stopHover();
            held_positions.splice(held_positions.indexOf(oldpos),1);
            held_positions.push(newpos);
            alien.heldPosition = newpos;
            alien.doFlyTo(alien.p.copy().add(new Vector(0,-100))).then(()=> {
                let loc = lines[newpos].p.copy();
                loc.x += lines[newpos].width / 2;
                loc.y -= alien.height;
                alien.doFlyTo(loc).then(()=>{
                    alien.doHover()
                })
            })
        }
    }
    monsters.forEach(monster => {
        monster.update(dt);

        if (Math.random() * 1000 < 5) {
            monster.hop();
        }

        if (Math.random() * 1000 < (monster.health > 30 ? 20 : 5)) {
            monster.hop();
        }
        if (Math.random() * 3000 < 2) {
            monster.jumpUp();
        }
        if (Math.random() * 1000 < 5) {
            monster.jumpLeft();
        }
        if (Math.random() * 1000 < 5) {
            monster.jumpRight();
        }


    });
    ps.forEach(letter => {
            if (!letter.resetting && !letter.locked) {

                let sh = letter.shape;
                let x = parseInt(sh.offsetLeft + sh.offsetWidth / 2);
                let y = parseInt(sh.offsetTop + sh.offsetHeight / 2);
                let l_v = new Vector(x, y);

                flyers.forEach(fire => {
                    let fire_y = fire.p.y;
                    let fire_x = fire.p.x;
                    let f_v = new Vector(fire_x, fire_y);

                    if (l_v.dist(f_v) < fire.h / 2) {
                        reset(letter)
                    }
                });
                monsters.forEach(monster => {
                    let monster_y = monster.p.y;
                    let monster_x = monster.p.x;
                    if (Math.sqrt((monster_x - x) ** 2 + (monster_y - y) ** 2) < 90) {
                        reset(letter)
                    }

                });
                lines.forEach(line => {
                    if (line.target === letter.string) {
                        if (line.a.copy().add(new Vector(line.length / 2, line.length / -2)).dist(new Vector(x, y)) < line.length / 4) {
                            letter.locked = true;
                            letter.set('color', 'green');
                            letter.set('z-index', 0);
                            letter.y = line.a.y - sh.offsetHeight * 0.8;
                            letter.x = line.a.x + line.length / 2 - sh.offsetWidth / 2;
                            letter.dragging = false;
                            line.target += 'done';
                            letters_completed++;
                        }
                    }
                })
            }

        }
    );

    if (loaded && lines.filter(x => !x.target.endsWith('done')).length <= 0) {
        winningCleanup(modes[chosen_mode]);
    }
    LAST_TIME = now;
    if (LOOPING) {
        requestAnimationFrame(loop)
    }
};

id('jmpleft').addEventListener('click', () => {
    if (loaded) {
        difficulty++;
        difficulty %= 4;
        id('jmpleft').innerText = diff2word(difficulty);
        cleanup(modes[chosen_mode]);
        generateObstacles(modes[chosen_mode])
    }

});

id('jump').addEventListener('click', () => {
    if (loaded) {
        cleanup(modes[chosen_mode]);

        chosen_mode++;
        chosen_mode %= modes.length;
        id('jump').innerText = modes[chosen_mode];

        generateObstacles(modes[chosen_mode])
    }
});