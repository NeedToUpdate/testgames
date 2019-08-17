words = Array.from(words); //just in case
difficulty = 0;

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

function pos2xy(xpos, ypos, size) {
    let top = height * 0.1;
    let left = width * 0.1;
    return [left + 45 + xpos * (size + 15), top + 30 + ypos * (size + 15)]
}

function ind2xy(index) {
    let stack = 7;
    let top = 0;//height * 0;
    let left = width * (0.30 + dim[0] * 0.055);
    let y = index % stack;
    let x = index / stack | 0;
    let longest = 0;
    for (let i = x; i > 0; i--) { //get the longest word in the previous coloums and get the offsetLeft
        let last4 = wordarchive.slice((i - 1) * stack);
        let word = last4.reduce((a, b) => {
            if (a.shape.offsetWidth > b.shape.offsetWidth) {
                return a;
            } else {
                return b;
            }
        });
        // let word = wordarchive[(i-1)*stack+y] //just get the word to the left
        longest += word.shape.offsetWidth + 10;
    }
    return [left + longest, top + y * 50]
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
            newword.set('font-size', '3em');
            newword.set('textShadow', 'blue 1px 1px 2px');
            newword.set('fontFamily', 'quikhand')
            newword.set('color', 'darkblue');
            newword.set('weight', 'bolder');
            wordarchive.push(newword)
        } else {
            typedword = '';
            keypad.set('boxShadow', 'red 0px 0px 5px 5px')
            setTimeout(reset, 500);
        }
    } else {
        let spaced = undefined;
        if (currentWords.filter(word => word.replace(typedword, '').startsWith(' ')).length === 1) {
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
            mistakes++
            if (mistakes > 2) {
                let l = lights[mistakes - 1];
                l.set('backgroundImage', 'radial-gradient(#f00 0%, #b00 100%)');
                l.set('boxShadow', 'rgba(255,0,0,0.3) 0px 0px 2px 2px')
                setAll('boxShadow', 'red 2px 2px 3px');
                keypad.set('boxShadow', 'red 0px 0px 5px 5px')
                mistakes = 0;
                typedword = '';
                currentWords = [];
                wordarchive[wordarchive.length - 1].remove();
                wordarchive.splice(wordarchive.length - 1);
                setTimeout(reset, 500);
            } else {
                keypad.set('boxShadow', 'red 0px 0px 5px 5px')
                let l = lights[mistakes - 1];
                l.set('backgroundImage', 'radial-gradient(#f00 0%, #b00 100%)');
                l.set('boxShadow', 'rgba(255,0,0,0.3) 0px 0px 2px 2px')
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
                wordarchive[wordarchive.length - 1].set('font-size', '2.5em')
                wordarchive[wordarchive.length - 1].mod('top', 10)
                wordarchive[wordarchive.length - 1].smaller = true;
            }
            if (currentWords.filter(x => typedword.match(x)).length > 0) {
                //winner
                words.splice(words.indexOf(typedword), 1);
                let l = wordlights[wordarchive.length - 1];
                l.set('backgroundImage', 'radial-gradient(#00f 0%, #00b 100%)');
                l.set('boxShadow', 'rgba(0,0,255,0.6) 0px 0px 2px 2px')
                typedword = '';
                currentWords = [];
                mistakes = 0;
                correctword()
                if (words.length === 0) {
                    win();
                }
            }
        }
    }

}

function reset() {
    setAll('boxShadow', 'blue 2px 2px 2px')
    lights.forEach(l => {
        l.set('backgroundImage', 'radial-gradient(#0f0 0%, #0b0 100%)');
        l.set('boxShadow', 'rgba(0,255,0,0.3) 0px 0px 2px 2px')
    })
    keypad.set('boxShadow', '')
}

function correctword() {
    setAll('boxShadow', '#0f0 2px 2px 2px');
    keypad.set('boxShadow', '#0f0 0px 0px 5px 5px')
    setTimeout(() => {
            setAll('boxShadow', 'blue 2px 2px 2px')
            keypad.set('boxShadow', '')
        }, 1500
    )
    lights.forEach(l => {
        l.set('backgroundImage', 'radial-gradient(#0f0 0%, #0b0 100%)');
        l.set('boxShadow', 'rgba(0,255,0,0.3) 0px 0px 2px 2px')
    })
}

let chars = [];

function animatewin() {
    chars.forEach(x => {
        x.update()
    })
    requestAnimationFrame(animatewin)
}

function win() {
    setTimeout(() => {
            cleanupkeypad().then(() => {
                    id('safeimg').style.animationDirection = 'reverse'
                    id('safeimg').style.animationDuration = '4s'
                    id('safeimg').style.zIndex = '10000'
                    let charnum = 5 + difficulty * 65;
                    let prom = new Promise(resolve => {
                        for (let i = 0; i < charnum; i++) {
                            let char = new Character(420, 400, 'treasure' + (Math.random() * 7 | 0));
                            char.bounds.y = 400;
                            let img = new Img('../images/' + char.name + '.png', 420, 400, 50);
                            img.shape.onload = () => {
                                requestAnimationFrame(() => {
                                    char.addSprite(img);

                                    requestAnimationFrame(() => {

                                        chars.push(char);
                                        if (charnum === chars.length) {

                                            chars.forEach(char => {
                                                setTimeout(() => {
                                                    char.a.add(new Vector(Math.random() * 40 - 20, Math.random() * 10 - 30));
                                                }, (3500 + 3000 * difficulty) * Math.random())
                                            })
                                            shotout = true;

                                            resolve()

                                        }
                                    })
                                })


                            }
                        }
                    });
                    prom.then(() => {
                        requestAnimationFrame(animatewin)
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
            x.correctkill();
            return x;
        })
        setTimeout(() => {
            paper.destroy()
            keypad.remove();
            lights.forEach(l => {
                l.remove();
            })
            wordlights.forEach(l => {
                l.remove();
            })
            wordarchive.forEach(p => {
                p.remove();
            })
            requestAnimationFrame(resolve);
        }, 1000)
    });


}

function setAll(attr, val) {
    lettersM.map((x, i, j) => {
        if (!x) {
        }
        x.set(attr, val)
        return x;
    })
}

let keypad = {};
let lights = [];
let wordlights = [];
let paper = {};

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
    let colors = ['darkred', 'darkgreen', 'darkgoldenrod', 'purple', 'darkblue', 'darkorange', 'darkcyan', 'darkslategray']
    colors = colors.splice(Math.random() * colors.length | 0, 1);
    let size = 70 - dim[0] * 4;
    paper = new Img('../images/tornpaper.png', ind2xy(0)[0] - 90, ind2xy(0)[1] - 20, 600)
    keypad = new Div(pos2xy(0, 0, 0)[0] - 12, pos2xy(0, 0, 0)[1] - 32, 'grey', dim[0] * (size + 20), dim[1] * (size + 20) + 50, true)
    keypad.set('backgroundImage', 'linear-gradient(to bottom right, ' +
        '#eee 0%, #aaa 10%, #ddd 14%, #fff 30%, #999 44%, #ddd 55%, #999 60%, #eee 85%, #ccc 100%' +
        ')')
    keypad.set('borderRadius', '10px');
    keypad.set('border', 'darkgrey 4px solid')
    lights = new Array(3).fill('').map((x, i) => {
        let l = new Div(pos2xy(0, 0, 0)[0] + dim[0] * (size + 20) / 2 - 30 + 20 * i, pos2xy(0, 0, 0)[1] - 15, 'none', 5);
        l.set('backgroundImage', 'radial-gradient(#0f0 0%, #0b0 100%)');
        l.set('boxShadow', 'rgba(0,255,0,0.3) 0px 0px 2px 2px')
        return l
    });
    wordlights = new Array(words.length).fill('').map((x, i) => {
        let l = new Div(pos2xy(0, 0, 0)[0] + dim[0] * (size + 20) / 2 - (14 * words.length / 2) + i * 14, pos2xy(0, dim[1], size)[1] + 15, 'none', 5);
        l.set('backgroundImage', 'radial-gradient(#544 0%, #655 100%)');
        l.set('boxShadow', 'rgba(0,0,0,0.3) 0px 0px 2px 2px')
        return l
    });
    lettersM.map((x, i, j) => {
        let [xx, yy] = pos2xy(i, j, size);
        let p = new StaticGameButton(allLetters[i * dim[1] + j], xx, yy);
        p.set('width', size + 'px');
        p.set('height', size + 'px');
        p.set('backgroundImage', 'linear-gradient(to bottom right, ' +
            '#eee 0%, #e1e1e1 10%, #ddd 14%, #fff 30%, #ddd 60%, #eee 85%, #ccc 100%' +
            ')')
        p.par.set('font-size', '3em');
        p.par.set('backgroundColor', getRandom(colors))
        return p;
    });

}

let background = 'background12.jpg';
document.body.style.backgroundColor = 'grey';
document.body.style.backgroundImage = 'url(../images/' + background.toString() + ')';
document.body.style.backgroundRepeat = 'no-repeat';

//words = ['singing','playing','barking','learning','watching','sleeping','drawing','doing','sitting','swimming','getting','running','stopping','putting','cutting','dancing','writing','coming','closing','riding','drixving'];
let letterCount = [];
let allLetters = [];
let dim = [];
let lettersM = {};

let extras = ['dynamiteball', 'fire', 'stars', 'brokenhole', 'safe'];
LOADED_IMAGES = new ImageLoader('../images/', extras);

function introMovie() {
    let bank = new Img('../images/bank.png',width*.1, height-370, 500 );
    let burglars = [];
    for (let i = 0; i < 5; i++) {
        let burglar = new Character(width*.8 + (25 + (Math.random() * 10 | 0)) * i,height - 50, 'burglar');
        burglar.bounds.y = height - 50;
        burglar.bounds.x = width;
        burglar.max_v = 10;
        burglar.powertype = 'dynamite';
        burglars.push(burglar);
    }
    let bsloaded = 0;
    let playmovie = false;
    let playbtn = {}
    let diffbtn = {};

    bank.shape.onload = function () {
        burglars.forEach(b => {
            let sprite = new Img('../images/' + b.name + '.png', 100, 100, 90);
            sprite.shape.onload = function () {
                bsloaded++;
                if (bsloaded === burglars.length) {
                    playbtn.innerText = 'Start'
                    requestAnimationFrame(() => {
                        burglars.forEach(burglar => {
                            burglar.faceleft();
                            burglar.update();
                        })
                    })

                }
            };
            b.addSprite(sprite)
        })
        playbtn = document.createElement('button');
        let text = document.createTextNode('loading');
        playbtn.append(text)
        playbtn.setAttribute('class', 'bluebtn');
        playbtn.style.top = '160px';
        playbtn.style.left = '750px';
        document.body.appendChild(playbtn);
        playbtn.onclick = () => {
            playmovie = true;
            document.body.removeChild(playbtn)
            document.body.removeChild(diffbtn)
            requestAnimationFrame(startmovie)
        }

        diffbtn = document.createElement('button');
        diffbtn.onclick = () => {
            difficulty++
            difficulty %= 3;
            if (difficulty === 0) {
                diffbtn.innerText = "Tiny"
            } else if (difficulty === 1) {
                diffbtn.innerText = "Small"
            } else if (difficulty === 2) {
                diffbtn.innerText = "Big"
            }
        }

        let text2 = document.createTextNode('Tiny');
        diffbtn.append(text2);
        diffbtn.setAttribute('class', 'bluebtn');
        diffbtn.style.top = '110px';
        diffbtn.style.left = '750px';
        document.body.appendChild(diffbtn);
    };

    function startmovie() {
        time = window.performance.now();
        requestAnimationFrame(movieloop)
    }

    let time = 0;
    let empty = new Character(width*0.1 + 450, height-60, 'empty');
    let movieending = false;
    let hole = {};
    let safe = {};
    let playending = false;

    function movieloop(now) {
        burglars.forEach(burglar => {
            burglar.update();
            if (now - time < 3000 && Math.random() < 0.01) {
                burglar.hop();
            }
            if (now - time > 3000 && burglar.p.x > 670 && now - time < 5000) {
                burglar.jumpfwd(0.2)
            }
            if (now - time < 10000 && burglar.p.x < 670 && now - time > 5000 && (!burglar.extras.attack ? !burglar.extras.attack : burglar.extras.attack.dead)) {
                if (now - time < 7000) {
                    burglar.powerup();
                } else if (Math.random() < 0.01) {
                    burglar.powerup();
                }

            }
            if (burglar.extras.attack) {
                burglar.extras.attack.minbounds.x = 500;
            }
            if (burglar.extras.attack && now - time > 7000) {
                if (Math.random() < 0.5) {
                    burglar.shoot();
                }
            }

        })
        if (now - time > 10000 && !movieending) {
            empty.kill();
            burglars.forEach(burglar => {
                if (Math.random() < 0.6) {
                    burglar.jumpbkwd(5);
                    burglar.spin();
                }
            })
            movieending = true;
            setTimeout(() => {
                hole = new Img(LOADED_IMAGES.brokenhole,width*0.1 + 350, height-150, 100);

                playending = true;
            }, 2000);

        }
        if (playending) {
            burglars.forEach(burglar => {
                if (!burglar.dead) {
                    if (burglar.p.x > 450) {
                        burglar.jumpfwd(0.2);
                    }
                    if (burglar.p.x < 450) {
                        burglar.fragile = true;
                        burglar.kill();
                        bsloaded--
                    }
                }
            })
        }
        if (bsloaded === 0) {
            playmovie = false;
            cleanup();
            //setupkeypad();
        }

        if (playmovie) {
            requestAnimationFrame(movieloop);
        }
    }

    function cleanup() {


        hole.shape.style.animationFillMode = 'forwards';
        bank.shape.style.animationFillMode = 'forwards';
        document.body.style.animationFillMode = 'forwards';

        hole.shape.style.animationName = 'grow2';
        hole.shape.style.animationDuration = '3s';
        bank.shape.style.animationName = 'grow';
        bank.shape.style.animationDuration = '3s';
        document.body.style.animationName = 'zoombg';
        document.body.style.animationDuration = '3s';
        setTimeout(() => {
                safe = new Character(150, 200, 'safe');
                let safeimg = new Img(LOADED_IMAGES.safe, 150, 200, 200);
                safe.addSprite(safeimg);

                safe.bounds.y = 380
                safeimg.shape.setAttribute("id", 'safeimg')


                requestAnimationFrame(() => {
                        animateSafe();
                        setTimeout(() => {
                            safe.landing_emitter.subscribe('land', () => {
                                animatingSafe = false;
                                hole.shape.style.animationName = 'fadeOut';
                                bank.shape.style.animationName = 'fadeOut';
                                hole.shape.style.animationDuration = '1s';
                                bank.shape.style.animationDuration = '1s';
                                bank.shape.style.left = "-500px";
                                bank.shape.style.top = "-300px";
                                bank.shape.style.width = "1000px";
                                hole.shape.style.left = "100px";
                                hole.shape.style.top = " 0px";
                                hole.shape.style.width = "300px";
                                safeimg.shape.style.animationFillMode = 'forwards';
                                safeimg.shape.style.animationName = 'grow3';
                                safeimg.shape.style.animationDuration = '3s';
                                setTimeout(setupkeypad, 4000)
                            });
                        }, 100)
                    }
                );


            }

            ,
            3500
        )


    }

    let animatingSafe = true;

    function animateSafe() {

        if (!safe.spinning) {
            safe.spin(360);
        }
        safe.jumpfwd(5);
        safe.update();
        if (animatingSafe) {
            requestAnimationFrame(animateSafe)
        }
    }
}


introMovie()

//setupkeypad();
