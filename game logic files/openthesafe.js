
words = Array.from(words); //just in case
difficulty = 0;

let SKY_COLOR = '#01b7e9';

let IMAGE_PATH = '../images/';


function getAllLetters(arrayofwords) {
    let arrays = [];
    arrayofwords.forEach(word => {
        if (word.match(/\s/)) {
            word = word.replace(/\s/g, '')
        }
        arrays = arrays.concat(word.split(''));

    });
    arrays = Array.from(new Set(arrays));
    return arrays;
}

function getLetterCount(arrayofwords) {
    let obj = {};
    let array = arrayofwords.join().replace(/[,|\s]/gi, '').split('');
    array.forEach(x => {
        if (Object(obj).hasOwnProperty(x)) {
            obj[x] += 1;
        } else {
            obj[x] = 1;
        }
    });
    return obj;
}

function findClosestSquare(num) {
    let sqrt = Math.sqrt(num);
    if (difficulty === 0 && sqrt > 3) {
        sqrt = 3;
    } else if (difficulty === 1 && sqrt > 4) {
        sqrt = 4;
    } else {
        if (sqrt === Math.floor(sqrt)) return [sqrt, sqrt, 0];
    }
    let h = Math.floor(sqrt);
    let w = Math.ceil(sqrt);
    if (Math.abs(w * h - num) > Math.abs((h ** 2) - num)) return [h, h, (h ** 2) - num];
    if (Math.abs(w * h - num) > Math.abs((w ** 2) - num)) return [w, w, (w ** 2) - num];
    return [w, h, h * w - num];
}

function pos2xy(xpos, ypos, size,padding) {
    let top = height * (0.2 - difficulty*0.05)  ;
    let left = width * 0.05;
    padding = padding || width/65;
    return [left + xpos * (size + padding), top + ypos  * (size + padding)]
}

function ind2xy(index) {
    let stack = 8;
    let top = paper.y  + paper.height*0.10;
    let left = paper.x + paper.width*0.1;
    let y = index % stack;
    let x = index / stack | 0;
    let longest = 0;
    for (let i = x; i > 0; i--) { //get the longest word in the previous coloums and get the offsetLeft
        let lastCol = wordarchive.slice((i - 1) * stack,(i) * stack );
        let word = lastCol.reduce((a, b) => {
            if (a.width > b.width) {
                return a;
            } else {
                return b;
            }
        });
        // let word = wordarchive[(i-1)*stack+y] //just get the word to the left
        longest += word.width + 5;
    }
    let yOffset = top;
    yOffset = y===0? top: wordarchive[(index-1)].height + wordarchive[index-1].y +5;
    return [left + longest,yOffset]
}

let currentWords = [];
let typedword = '';
let mistakes = 0;
let wordarchive = [];

function clickHandler(string) {
    if (currentWords.length < 1) {
        //if its a new word
        words.forEach(word => {
            if (word.startsWith(string)) {
                currentWords.push(word);
            }
        });
        if (currentWords.length > 0) {
            //successful letter --> create new word array
            typedword += string;
            let xy = ind2xy(wordarchive.length);
            let newword = new P(string, xy[0], xy[1]);
            newword.set('font-size', (width/30 |0) + 'px');
            newword.set('textShadow', 'blue 1px 1px 2px');
            newword.set('fontFamily', 'quikhand');
            newword.set('color', 'darkblue');
            newword.set('weight', 'bolder');
            wordarchive.push(newword)
        } else {
            typedword = '';
            keypad.set('boxShadow', 'red 0px 0px '+ r(width/180) +'px '+ r(width/180) +'px');
            setTimeout(reset, 500);
        }
    } else {
        let spaced = undefined;
        if (currentWords.filter(word => word.replace(typedword, '').startsWith(' ')).length >= 1) {
            spaced = typedword + ' ';
        }
        let tempwords = currentWords.filter(word => {
                if (word.startsWith(typedword + string)) {
                    return true;
                }
                if (word.startsWith(spaced + string)) {
                    typedword = spaced;
                    return true;
                }
            }
        );
        if (tempwords.length < 1) {
            mistakes++;
            if (mistakes > 2) {
                let l = lights[mistakes - 1];
                l.set('backgroundImage', 'radial-gradient(#f00 0%, #b00 100%)');
                l.set('boxShadow', 'rgba(255,0,0,0.3) 0px 0px 2px 2px');
                setAll('boxShadow', 'red 2px 2px 3px');
                keypad.set('boxShadow', 'red 0px 0px '+ r(width/180) +'px '+ r(width/180) +'px');
                mistakes = 0;
                typedword = '';
                currentWords = [];
                wordarchive[wordarchive.length - 1].remove();
                wordarchive.splice(wordarchive.length - 1);
                setTimeout(reset, 500);
            } else {
                keypad.set('boxShadow', 'red 0px 0px '+ r(width/180) +'px '+ r(width/180) +'px');
                let l = lights[mistakes - 1];
                l.set('backgroundImage', 'radial-gradient(#f00 0%, #b00 100%)');
                l.set('boxShadow', 'rgba(255,0,0,0.3) 0px 0px 2px 2px');
                setTimeout(() => {
                        keypad.set('boxShadow', '')
                    }, 500
                )
            }
        } else {
            //successful next letter -> add to current word
            typedword += string;
            currentWords = tempwords;
            wordarchive[wordarchive.length - 1].shape.innerText = typedword;
            if (typedword.length > 7 && !wordarchive[wordarchive.length - 1].smaller) {
                wordarchive[wordarchive.length - 1].set('font-size', '1.5em');
                wordarchive[wordarchive.length - 1].smaller = true;
            }
            if (typedword.length > 15 && !wordarchive[wordarchive.length - 1].supersmall) {
                wordarchive[wordarchive.length - 1].set('font-size', '1em');
                wordarchive[wordarchive.length - 1].supersmall = true;
            }
            if (currentWords.filter(x => typedword.match(x)).length > 0) {
                //winner
                words.splice(words.indexOf(typedword), 1);
                let l = wordlights[wordarchive.length - 1];
                l.set('backgroundImage', 'radial-gradient(#00f 0%, #00b 100%)');
                l.set('boxShadow', 'rgba(0,0,255,0.6) 0px 0px 2px 2px');
                typedword = '';
                currentWords = [];
                mistakes = 0;
                correctword();
                if (words.length === 0) {
                    win();
                }
            }
        }
    }

}

function reset() {
    setAll('boxShadow', 'blue 2px 2px 2px');
    lights.forEach(l => {
        l.set('backgroundImage', 'radial-gradient(#0f0 0%, #0b0 100%)');
        l.set('boxShadow', 'rgba(0,255,0,0.3) 0px 0px 2px 2px')
    });
    keypad.set('boxShadow', '')
}

function correctword() {
    setAll('boxShadow', '#0f0 2px 2px 2px');
    keypad.set('boxShadow', '#0f0 0px 0px '+ r(width/180) +'px '+ r(width/180) +'px');
    setTimeout(() => {
            setAll('boxShadow', 'blue 2px 2px 2px');
            keypad.set('boxShadow', '')
        }, 1500
    );
    lights.forEach(l => {
        l.set('backgroundImage', 'radial-gradient(#0f0 0%, #0b0 100%)');
        l.set('boxShadow', 'rgba(0,255,0,0.3) 0px 0px 2px 2px')
    })
}

let chars = [];

function animatewin() {
    chars.forEach(x => {
        x.update()
    });
}

function win() {
    setTimeout(() => {
            cleanupkeypad().then(() => {
                    id('safeimg').style.animationDirection = 'reverse';
                    id('safeimg').style.animationDuration = '4s';
                    id('safeimg').style.zIndex = '10000';
                    let charnum = 25 + difficulty * 50;
                    safe.sprite.set('left', width/2 - safe.width/2);
                    safe.sprite.set('top', height - safe.height);
                    setTimeout(()=>{
                        safe.sprite.set('transform-origin','');
                        safe.sprite.set('transform','');
                        safe.sprite.set('animation-fill-mode','');
                        safe.sprite.set('animation-name','');
                        safe.sprite.set('animation-duration','');
                        safe.sprite.set('animation-direction','');
                    },100)
                    let prom = new Promise(resolve => {
                        for (let i = 0; i < charnum; i++) {
                            let char = new Character(width/2, height - safe.height/2, 'treasure' + (Math.random() * 7 | 0));
                            char.maxbounds.y = height*0.9;
                            char.hasBounce = true;
                            char.bounce_coeff = 1;
                            let img = new Img(IMAGE_PATH + char.name + '.png', width/2, height*0.95, r(width/19)).fromCenter().usingNewTransform();
                            img.onLoad(() => {
                                img.set('zIndex', '110')
                                    char.addSprite(img);
                                    char.addForce(VECTORS.gravity);
                                        chars.push(char);
                                        if (charnum === chars.length) {
                                            chars.forEach(char => {
                                                setTimeout(() => {
                                                    char.addForce(new Vector(Math.random() * 40 - 20, Math.random() * 10 - 30));
                                                }, (3500 + 3000 * difficulty) * Math.random())
                                            });
                                            resolve()

                                        }
                            })
                        }
                    });
                    prom.then(() => {
                        id('black_square').style.backgroundColor = '#d0f2fe';
                        createFallbackLoopFunction(animatewin).start()
                    })
                    ;
                }
            )
        }, 1000
    );
}

async function cleanupkeypad() {
    //keypad lights wordarchive word lights lettersM
    return new Promise(resolve => {
        lettersM.map(x => {
            x.kill();
            return x;
        });
        setTimeout(() => {
            paper.remove();
            keypad.remove();
            lights.forEach(l => {
                l.remove();
            });
            wordlights.forEach(l => {
                l.remove();
            });
            wordarchive.forEach(p => {
                p.remove();
            });
            requestAnimationFrame(resolve);
        }, 1000)
    });


}

function setAll(attr, val) {
    lettersM.map((x, i, j) => {
        if (!x) {
        }
        x.set(attr, val);
        return x;
    })
}

let keypad = {};
let lights = [];
let wordlights = [];
let paper = {};
let safe = {};
function setupkeypad() {
    letterCount = getLetterCount(words);
    allLetters = shuffle(getAllLetters(words));
    dim = findClosestSquare(allLetters.length);
    lettersM = new Matrix(dim[0], dim[1]);
    if (dim[2] !== 0) {
        if (dim[2] < 0) {
            for (let i = dim[2] * -1; i > 0; i--) {
                let rareLetter = Object.keys(letterCount).reduce((key1, key2) => {
                    if (letterCount[key1] < letterCount[key2]) {
                        return key1
                    } else if (letterCount[key1] > letterCount[key2]) {
                        return key2
                    } else {
                        return (Math.random() < 0.4 ? key2 : key1);
                    }
                });
                let unusedwords = words.filter(x => x.match(rareLetter));
                unusedwords.forEach(word => {
                    words.splice(words.indexOf(word), 1);
                });
                allLetters.splice(allLetters.indexOf(rareLetter), 1);
                delete letterCount[rareLetter];
            }
        } else if (dim[2] > 0) {
            for (let i = dim[2]; i > 0; i--) {
                let remainingletters = alphabet.split('').filter(x => allLetters.indexOf(x) === -1);
                let addletter = shuffle(remainingletters)[0];
                allLetters.push(addletter);
                letterCount[addletter] = 1;
            }
        }
    }
    let colors = ['darkred', 'darkgreen', 'darkgoldenrod', 'purple', 'darkblue', 'darkorange', 'darkcyan', 'darkslategray'];
    colors = colors.splice(Math.random() * colors.length | 0, 1);
    let size = width/12 - dim[0] * 4 + width/120;
    let padding = width/150;


    keypad = new Rectangle(pos2xy(0, 0, size,padding)[0] -padding, pos2xy(0, 0, size,padding)[1] - r(width/28.5), dim[0] * (size + padding) + padding*2, dim[1] * (size + padding) + r(width/14.7))//.asOutline('darkgrey',4);
    keypad.border = 'darkgrey solid '+ r(width/200) +'px ';
    keypad.set('backgroundImage', 'linear-gradient(to bottom right, ' +
        '#eee 0%, #aaa 10%, #ddd 14%, #fff 30%, #999 44%, #ddd 55%, #999 60%, #eee 85%, #ccc 100%' +
        ')');
    keypad.set('borderRadius', r(width/90) +'px');
    keypad.set('zIndex', '100');
    keypad.set('borderBottom', '#655 solid '+ r(width/200) +'px ');
    keypad.set('borderRight', '#766 solid '+ r(width/200) +' ');
    paper = new Img(IMAGE_PATH + 'tornpaper.png', keypad.x+ keypad.width + padding*2, -16, width/1.6);
    lights = new Array(3).fill('').map((x, i) => {
        let l = new Circle(pos2xy(0, 0, 0)[0] + dim[0] * (size + padding) / 2 +padding - r(width/48) + r(width/48)*i, pos2xy(0, 0, 0)[1] - width/230, r(width/180));
        l.set('backgroundImage', 'radial-gradient(#0f0 0%, #0b0 100%)');
        l.set('boxShadow', 'rgba(0,255,0,0.3) 0px 0px 2px 2px');
        l.set('zIndex', '110');
        return l
    });
    wordlights = new Array(words.length).fill('').map((x, i) => {
        let l = new Circle(pos2xy(0, 0, 0)[0] + dim[0] * (size + padding) / 2 + padding - (r(width/70) * words.length / 2) + i * r(width/70),  pos2xy(0,dim[1],size,padding)[1] + size/3, r(width/180));
        l.set('backgroundImage', 'radial-gradient(#544 0%, #655 100%)');
        l.set('boxShadow', 'rgba(0,0,0,0.3) 0px 0px 2px 2px');
        l.set('zIndex', '110');
        return l
    });
    lettersM.map((x, i, j) => {
        let [xx, yy] = pos2xy(i,j, size,padding);
        let p = new StaticGameButton(allLetters[i * dim[1] + j], 0,0);
        //p.sprite.asOutline('lightgrey',4)
        p.sprite.width = size- r(width/120);
        p.sprite.height = size- r(width/120);
        p.sprite.set('border', 'grey solid ' + r(width/240) + 'px')
        p.sprite.set('borderRadius', '10%')
        p.x = xx +size/2 + padding;
        p.y = yy +size/2 + padding;
        p.pDiv.set('fontSize', r(size*0.8) + 'px');
        p.sprite.set('backgroundImage', 'linear-gradient(to bottom right, ' +
            '#eee 0%, #e1e1e1 10%, #ddd 14%, #fff 30%, #ddd 60%, #eee 85%, #ccc 100%' +
            ')');
        //p.sprite.set('font-size', '3em');
        p.sprite.set('backgroundColor', getRandom(colors));
        p.sprite.set('zIndex', '110');
        let [string, pos] = [p.string, p.pos];
        p.div.shape.addEventListener('click', () => {
            // this.div.set('border', '5px solid blue');
            p.div.y += 2;
            p.div.x += 2;
            p.div.set('boxShadow', 'blue 0 0 0');
            setTimeout(() => {
                    //this.div.set('border', '5px solid black')
                p.div.y -= 2;
                p.div.x -= 2;
                    p.div.set('boxShadow', "blue 1px 2px 2px")
                }, 200
            );
            clickHandler(string, pos);
        });

        return p;
    });

}

function setupBackground(){
    return new Promise(resolve=>{
        let background = 'background12.jpg';
        DOMObjectGlobals.body.style.backgroundColor = 'grey';
        DOMObjectGlobals.body.style.backgroundImage = 'url(' + IMAGE_PATH + background.toString() + ')';
        DOMObjectGlobals.body.style.backgroundRepeat = 'no-repeat';
        DOMObjectGlobals.body.style.backgroundSize = width + 'px auto';
        
        let extras = ['fire', 'stars', 'brokenhole', 'safe'];
        LOADED_IMAGES = new ImageLoader(IMAGE_PATH, extras);
        LOADED_IMAGES.add('dynamite_projectile', IMAGE_PATH + 'projectiles');

            
        id('black_square').style.backgroundColor = SKY_COLOR;
        id('black_square').style.height = (height/7 |0) + 'px';
        id('black_square').style.width = (height/7 |0) + 'px';
        id('black_square').style.border = '';
        id('black_square').style.zIndex = '10';




        resolve()
    })
}

let letterCount = [];
let allLetters = [];
let dim = [];
let lettersM = {};
let LOADED_IMAGES = {};


function introMovie() {
    let bank = new Img(IMAGE_PATH + '/bank.png', width * .1, height/7, width/1.922);
    let burglars = [];
    for (let i = 0; i < 5; i++) {
        let burglar = new Character(width * .8 + (width/35 + (Math.random() * 10 | 0)) * i, height - height/8, 'burglar');
        burglar.maxbounds.y = height - height/20;
        burglar.maxbounds.x = width;
        burglar.MAX_V = width/20;
        burglar.MAX_F = width/20;
        burglar.powerType = 'dynamite';
        burglar.addForce(VECTORS.gravity);
        burglars.push(burglar);
    }
    let bsloaded = 0;
    let playmovie = false;
    let playbtn = {};
    let diffbtn = {};

    bank.shape.onload = function () {
        burglars.forEach(b => {
            let sprite = new Img(IMAGE_PATH + b.name + '.png', 0, 0, width/10).fromCenter();
            sprite.onLoad(() => {
                bsloaded++;
                if (bsloaded === burglars.length) {
                    playbtn.innerText = 'Start';
                    requestAnimationFrame(() => {
                        burglars.forEach(burglar => {
                            burglar.faceLeft();
                            burglar.update();
                        })
                    })
                }
            });
            b.addSprite(sprite)
        });
        playbtn = document.createElement('button');
        let text = document.createTextNode('loading');
        playbtn.append(text);
        playbtn.setAttribute('class', 'bluebtn');
        playbtn.style.top = height * 0.2 + 'px';
        playbtn.style.left = width * 0.8 + 'px';
        playbtn.style.width = width/12 + 'px';
        playbtn.style.height = width/24 + 'px';
        playbtn.style.fontSize= (width / 50 > 24? 24 : width/50 ) + 'px';
        DOMObjectGlobals.body.appendChild(playbtn);
        playbtn.onclick = () => {
            playmovie = true;
            DOMObjectGlobals.body.removeChild(playbtn);
            DOMObjectGlobals.body.removeChild(diffbtn);
            requestAnimationFrame(startmovie)
        };

        diffbtn = document.createElement('button');
        diffbtn.onclick = () => {
            difficulty++;
            difficulty %= 3;
            if (difficulty === 0) {
                diffbtn.innerText = "Tiny"
            } else if (difficulty === 1) {
                diffbtn.innerText = "Small"
            } else if (difficulty === 2) {
                diffbtn.innerText = "Big"
            }
        };

        let text2 = document.createTextNode('Tiny');
        diffbtn.append(text2);
        diffbtn.setAttribute('class', 'bluebtn');
        diffbtn.style.top = height * 0.3 + 'px';
        diffbtn.style.width = width/12 + 'px';
        diffbtn.style.height = width/24 + 'px';
        diffbtn.style.fontSize= (width / 50 > 24? 24 : width/50 ) + 'px';
        diffbtn.style.left = width * 0.8 + 'px';
        DOMObjectGlobals.body.appendChild(diffbtn);
    };

    function startmovie() {
        time = window.performance.now();
        createFallbackLoopFunction(movieloop).start()
    }

    let time = 0;
    let empty = new Character(width * 0.5, height - height/7, 'empty');
    empty.addDeathImage(LOADED_IMAGES.fire.cloneNode());
    let movieending = false;
    let hole = {};
    let playending = false;
    let things_to_update = [];
    FALLBACK_USE_SET_TIMEOUT_ON_SLOWDOWN = true;
    function movieloop() {
        let now = window.performance.now();
        things_to_update.forEach(x=>{
            x.update();
        });
        burglars.forEach(burglar => {
            burglar.update();
            if (now - time < 3000 && Math.random() < 0.01) {
                burglar.hop();
            }
            if (now - time > 3000 && burglar.x > width*0.65 && now - time < 5000) {
                burglar.doJump(getRandom(0.3,0.4))
            }
            if (now - time < 10000 && now - time > 5000 && !burglar.isPoweringUp) {
                if (now - time < 7000) {
                    burglar.powerUp();
                } else if (Math.random() < 0.1) {
                    burglar.powerUp();
                }

            }
            if (burglar.isPoweringUp && now - time > 7000 && now-time <10000) {
                if (Math.random() < 0.5) {
                    let projectile = burglar.shoot();
                    if(projectile){
                        projectile.minbounds.x = width/2;
                        projectile.hasNoBounds = false;
                        projectile.isFragile = true;
                        things_to_update.push(projectile)
                    }
                }
            }

        });
        if (now - time > 10000 && !movieending) {
            empty.kill();
            burglars.forEach(burglar => {
                if (Math.random() < 0.6) {
                    burglar.addForce(Vector.fromAngle(getRandom(30,70)).set(40));
                    burglar.isJumping = true;
                    burglar.doSpin(720, 30);
                }
            });
            movieending = true;
            hole = new Img(LOADED_IMAGES.brokenhole.cloneNode(), width * .5, height*0.8, width/8).fromCenter();
            setTimeout(() => {
                playending = true;
            }, 2000);

        }
        if (playending) {
            burglars.forEach(burglar => {
                if (!burglar.dead) {
                    if (burglar.p.x > width/2) {
                        burglar.doJump(0.3);
                    }
                    if (burglar.p.x < width/2) {
                        burglar.fragile = true;
                        burglar.kill();
                        bsloaded--
                    }
                }
            })
        }
        if (bsloaded === 0) {
            stop(true);
            cleanup();
            //setupkeypad();
        }
    }

    function cleanup() {
        hole.shape.style.animationFillMode = 'forwards';
        bank.shape.style.animationFillMode = 'forwards';
        DOMObjectGlobals.body.style.animationFillMode = 'forwards';

        hole.shape.style.animationName = 'grow2';
        hole.shape.style.animationDuration = '3s';
        bank.shape.style.animationName = 'grow';
        bank.shape.style.animationDuration = '3s';
        DOMObjectGlobals.body.style.animationName = 'zoombg';
        DOMObjectGlobals.body.style.animationDuration = '3s';

        id('black_square').style.backgroundColor = '#1a343f';
        setTimeout(() => {
                safe = new Character(width/5, height/2, 'safe');
                let safeimg = new Img(LOADED_IMAGES.safe.cloneNode(),0,0, width/5).fromCenter().onLoad(() => {
                    safe.addSprite(safeimg);
                    safe.maxbounds.y = height*0.9;
                    safe.addForce(VECTORS.gravity);
                    safe.doJump(3);
                    safeimg.shape.setAttribute("id", 'safeimg');
                    animateSafe();
                    safe.landing_emitter.subscribe('land', () => {
                        hole.shape.style.animationName = 'fadeOut';
                        bank.shape.style.animationName = 'fadeOut';
                        hole.shape.style.animationDuration = '1s';
                        bank.shape.style.animationDuration = '1s';
                        bank.shape.style.left = "-" + r(width/2) +"px";
                        bank.shape.style.top = "-" + r(width/3) +"px";
                        bank.shape.style.width =  width +"px";
                        hole.shape.style.left = r(width/9.6) +"px";
                        hole.shape.style.top = " 0px";
                        hole.shape.style.width = r(width/3) +"px";
                        safeimg.shape.style.animationFillMode = 'forwards';
                        safeimg.shape.style.animationName = 'grow3';
                        safeimg.shape.style.animationDuration = '3s';
                        setTimeout(setupkeypad, 4000)
                    });

                });
            }

            ,
            3500
        )


    }

    let animatingSafe = true;

    function animateSafe() {
        if (!safe.isDoingSpin) {
            safe.doSpin(360, 10).then(x=>{
                animatingSafe = false;
            });
        }
        safe.update();
        if (animatingSafe) {
            requestAnimationFrame(animateSafe)
        }
    }
}

setupBody(id("MAIN_SCREEN")).then(()=>{
    setupBackground().then(()=>{
        introMovie();
        //setupkeypad();
    })
})
