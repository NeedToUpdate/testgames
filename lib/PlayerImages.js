let characters = [
    'cat',
    'spiderman', 'ultraman', 'ironman',
    'peppapig', 'spongebob', 'monkey',
    'tiger', 'shark', 'cinderella',
    'elsa', 'ariel', 'deadfish', 'mrkrabs', 'thanos', 'pikachu', 'drstrange',
    'superman', 'genie', 'simba', 'captainmarvel', 'mewtwo', 'sailormoon', 'venom', 'thor',
    'ultraman2', 'ultraman3', 'olaf', 'hulk', 'gundam', 'optimus', 'snowwhite', 'deadpool',
    'goku', 'ash', 'charizard', 'captainamerica', 'nakoruru', 'mario', 'emmet', 'wyldstyle',
    'tree', 'link', 'isabelle', 'doraemon', 'hellokitty', 'penguin','rainbow','zebra','sofia',
    'baby', 'starfish', 'bananaman' , 'arlo' ,
];
let powers = [
    'blueenergy',
    'web', 'bluebeam', 'fire',
    'pinkenergy', 'krabbypatty', 'banana',
    'fire', 'water', 'blueenergy',
    'ice', 'water', 'nuke', 'water', 'blackenergy', 'electric', 'magic',
    'fire', 'magic', 'magic', 'electric', 'magic', 'pinkenergy', 'blackenergy', 'electric',
    'magic', 'electric', 'ice', 'rock', 'bluebeam', 'bullet', 'bluebeam', 'bullet',
    'bluebeam', 'fire', 'fire', 'fire', 'fire', 'fire', 'legored', 'blackenergy',
    'apple', 'blueenergy', 'water', 'blueenergy', 'pinkenergy', 'fish', 'pinkenergy','fire','robin',
    'water', 'stars' , 'banana', 'rock' ,
];

function create_player(num) {
    let chosennum = num || getRandom(characters.length);
    if (num === 0) {
        chosennum = 0;
    }
    let char_name = characters[chosennum];
    let powr_name = powers[chosennum];
    switch(char_name){
        case 'deadfish':
            powr_name = 'nuke';
            break;
        case 'snowwhite':
            powr_name = 'bluebird';
            break;
        case 'ash':
            powr_name = 'poke';
            break;
        case 'captainamerica':
            powr_name = 'cashield';
            break;
        case 'nakoruru':
            powr_name = 'mamahaha';
            break;
        case 'wyldstyle':
            powr_name = 'blacklego';
            break;
        case 'link':
            powr_name = 'zeldabomb';
            break;
        case 'tree':
            powr_name = getRandom(2) ? 'apple' : 'pear';
            break;
        case 'rainbow':
            powr_name = 'rainbow';
            break;
        case 'cat':
            powr_name = 'yarn';
            break;
       case 'baby':
            powr_name = 'baby_bottle';
            break;
    }
    return {num: chosennum, name: char_name, power: powr_name};
}



async function choose_your_fighter_2Team(isTeamA) {
    return new Promise(resolve => {
        let num_of_choices = 4;
        let chosen_nums = [];
        for (let i = 0; i < num_of_choices; i++) {
            let num = getRandom(characters.length);
            while (chosen_nums.includes(num)) {
                num = getRandom(characters.length);
            }
            chosen_nums.push(num);
        }
        let screenx = isTeamA ? width * 0.1 : width * 0.6;
        let screenw = width * 0.35;
        let screeny = height * 0.3;
        let screenh = height * 0.3;
        let screen = new Rectangle(screenx, screeny, screenw, screenh);
        let screenstyle = {
            backgroundColor: 'grey',
            borderRadius: '10px',
            border: (isTeamA ? 'blue' : 'red') + ' solid 5px',
            zIndex: 2050,
        };
        Object.assign(screen.shape.style, screenstyle);
        let crop = new Rectangle(screenx + 2, screeny + screenh / 3 - 2, screenw, screenh / 3);
        crop.shape.style.overflow = 'hidden';
        crop.shape.style.backgroundColor = 'yellow';
        crop.shape.style.border = (isTeamA ? 'blue' : 'red') + ' solid 3px';
        crop.shape.style.zIndex = '2060';

        let images = [];
        let lines = [];
        let text = new P('Choose Your Fighter', screenx + screenw / 3, screeny + 10).fromCenter();
        let names = [];
        text.shape.style.fontSize = width * 0.02 + 'px';
        text.shape.style.zIndex = '2070';

        function start_the_game(num) {
            crop.remove();
            lines.forEach(line => {
                line.remove();
            });
            names.forEach(name => {
                name.remove();
            });
            text.remove();
            screen.remove();
            resolve(num);
        }

        chosen_nums.forEach((num, i) => {
            let img = new Img(IMAGE_PATH + characters[num] + '.png', ((screenw / chosen_nums.length)) * i + 10, 0, (screenw / chosen_nums.length) - 20);
            crop.attach(img);
            if (i !== 0) {
                let line = Line.fromPoints(screenx + 5 + (screenw / chosen_nums.length) * i, screeny + screenh / 1.5, screenx + 5 + (screenw / chosen_nums.length) * i + 20, screeny + screenh / 3);
                line.shape.style.backgroundColor = (isTeamA ? 'blue' : 'red');
                line.shape.style.height = '4px';
                line.shape.style.zIndex = '2070';
                lines.push(line);
            }
            img.shape.addEventListener('click', () => {
                start_the_game(num);
            });
            let name = new P(characters[num], screenx + (screenw / chosen_nums.length) * (i + .1) + 10, 5 + screeny + screenh / 1.5);
            name.set('fontSize', width / 50);
            name.set('zIndex', '2070');
            if (name.width + 20 > screenw / chosen_nums.length) {
                name.string = characters[num].slice(0, 7) + '..'
            }
            name.string = name.string.replace(name.string.charAt(0), name.string.charAt(0).toUpperCase());
            names.push(name);
            images.push(img);
        });

    });
}

function setUpCharacter_2Team(isTeamA, num) {
    return new Promise(resolve => {
        let vals = create_player(num);
        LOADED_IMAGES.add(vals.power + '_projectile', IMAGE_PATH + 'projectiles/');
        let player = isTeamA ? playerA : playerB;
        player = new Character(width * (isTeamA ? .28 : .72), height - 100, vals.name);
        let sprite = new Img(IMAGE_PATH + '/' + vals.name + '.png', 0, 0, width / 8).fromCenter().onLoad(() => {
            player.addSprite(sprite);
            player.team = (isTeamA ? 'A' : 'B');
            player.addForce(VECTORS.gravity);
            player.maxbounds.x = width * .79;
            player.minbounds.x = width * .21;
            player.maxbounds.y = height - 20;
            player.minbounds.y = height * .2;
            player.powerType = vals.power;
            sprite.set('zIndex', '1000');
            THINGS_TO_UPDATE.push(player);
            player.addDeathImage(LOADED_IMAGES.fire.cloneNode());
            if (isTeamA) {
                playerA = player;
            } else {
                playerB = player;
                player.faceLeft()
            }
            return resolve();
        });
    })
}