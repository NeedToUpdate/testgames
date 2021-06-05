//TODO fix this garbage
let characters = [
  "cat",
  "spiderman",
  "ultraman",
  "ironman",
  "peppa_pig",
  "spongebob",
  "monkey",
  "tiger",
  "shark",
  "cinderella",
  "elsa",
  "ariel",
  "dead_fish",
  "mr_krabs",
  "thanos",
  "pikachu",
  "dr_strange",
  "superman",
  "genie",
  "simba",
  "captain_marvel",
  "mewtwo",
  "sailor_moon",
  "venom",
  "thor",
  "ultraman2",
  "ultraman3",
  "olaf",
  "hulk",
  "gundam",
  "optimus",
  "snow_white",
  "deadpool",
  "goku",
  "ash",
  "charizard",
  "captain_america",
  "nakoruru",
  "mario",
  "emmet",
  "wyldstyle",
  "tree",
  "link",
  "isabelle",
  "doraemon",
  "hello_kitty",
  "penguin",
  "rainbow",
  "zebra",
  "sofia",
  "baby",
  "starfish",
  "bananaman",
  "arlo",
  "black_widow",
  "shrek",
  "batman",
  "hawkeye",
  "hermione",
  "harry_potter",
  "sleeping_beauty",
  "rapunzel",
  "vision",
  "squirtle",
  "anna",
  "monkey_king",
  "shoe",
  "arceus",
  "luffy",
  "ant",
  "dog",
  "dolphin",
  "whale",
  "zoro",
  "steve",
  "groot",
  "baby_groot",
  "rocket",
];
let powers = [
  "blueenergy",
  "web",
  "bluebeam",
  "fire",
  "pinkenergy",
  "krabbypatty",
  "banana",
  "fire",
  "water",
  "blueenergy",
  "ice",
  "water",
  "nuke",
  "spongebobdollar",
  "blackenergy",
  "yellowelectric",
  "magic",
  "fire",
  "magic",
  "magic",
  "electric",
  "magic",
  "pinkenergy",
  "blackenergy",
  "electric",
  "magic",
  "electric",
  "ice",
  "rock",
  "bluebeam",
  "bullet",
  "bluebeam",
  "bullet",
  "bluebeam",
  "fire",
  "fire",
  "fire",
  "fire",
  "fire",
  "legored",
  "blackenergy",
  "apple",
  "blueenergy",
  "ac_logo",
  "blueenergy",
  "pinkenergy",
  "fish",
  "pinkenergy",
  "fire",
  "robin",
  "water",
  "stars",
  "banana",
  "rock",
  "grenade",
  "onion",
  "blackenergy",
  "arrow",
  "greenenergy",
  "whitemagic",
  "pinkenergy",
  "hairbrush",
  "yellowmagic",
  "water",
  "torch",
  "ki",
  "smellysocks",
  "whitemagic",
  "fire",
  "leaf",
  "bone",
  "water",
  "water",
  "katana",
  "grassblock",
  "leaf",
  "twig",
  "missile",
];
let primary_color = [
  "white",
  "red",
  "red",
  "red",
  "pink",
  "yellow",
  "white",
  "orange",
  "blue",
  "lightblue",
  "lightblue",
  "blue",
  "green",
  "red",
  "purple",
  "yellow",
  "yellow",
  "blue",
  "blue",
  "yellow",
  "red",
  "purple",
  "pink",
  "black",
  "yellow",
  "blue",
  "blue",
  "blue",
  "green",
  "red",
  "red",
  "blue",
  "black",
  "yellow",
  "red",
  "orange",
  "blue",
  "red",
  "red",
  "red",
  "black",
  "green",
  "blue",
  "yellow",
  "blue",
  "pink",
  "blue",
  "pink",
  "red",
  "purple",
  "blue",
  "red",
  "yellow",
  "green",
  "black",
  "green",
  "black",
  "black",
  "blue",
  "red",
  "pink",
  "pink",
  "yellow",
  "blue",
  "pink",
  "yellow",
  "red",
  "white",
  "red",
  "green",
  "yellow",
  "blue",
  "blue",
  "green",
  "lightblue",
  "green",
  "green",
  "red",
];

let powerNames = IMAGE_CONFIG.projectiles.valid_names;

function create_player(num) {
  let chosennum = num || getRandom(characters.length);
  if (num === 0) {
    chosennum = 0;
  }
  let char_name = characters[chosennum];
  let powr_name = powers[chosennum];
  let color = primary_color[chosennum];
  switch (char_name) {
    case "dead_fish":
      powr_name = "nuke";
      break;
    case "snow_white":
      powr_name = "bluebird";
      break;
    case "ash":
      powr_name = "poke";
      break;
    case "captain_america":
      powr_name = "cashield";
      break;
    case "nakoruru":
      powr_name = "mamahaha";
      break;
    case "wyldstyle":
      powr_name = "blacklego";
      break;
    case "link":
      powr_name = "zeldabomb";
      break;
    case "tree":
      powr_name = getRandom(2) ? "apple" : "pear";
      break;
    case "rainbow":
      powr_name = "rainbow";
      break;
    case "cat":
      powr_name = "yarn";
      break;
    case "baby":
      powr_name = "baby_bottle";
      break;
    case "batman":
      powr_name = "batarang";
      break;
    case "sleeping_beauty":
      powr_name = "fairy" + (getRandom(3) + 1);
      break;
    case "arceus":
      powr_name = getRandom(powerNames);
      break;
    case "luffy":
      powr_name = "fist";
      break;
    case "groot":
      powr_name = "tree";
      break;
  }
  return { num: chosennum, name: char_name, power: powr_name, color: color };
}

async function choose_your_fighter_2Team(isTeamA) {
  return new Promise((resolve) => {
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
      backgroundColor: "grey",
      borderRadius: width / 96 + "px",
      border: (isTeamA ? "blue" : "red") + " solid " + r(width / 183) + "px",
      zIndex: 2050,
    };
    Object.assign(screen.shape.style, screenstyle);
    let crop = new Rectangle(screenx + r(width / 470), screeny + screenh / 3 - 2, screenw, screenh / 3);
    crop.shape.style.overflow = "hidden";
    crop.shape.style.backgroundColor = "yellow";
    crop.shape.style.border = (isTeamA ? "blue" : "red") + " solid " + r(width / 319) + "px";
    crop.shape.style.zIndex = "2060";

    let images = [];
    let lines = [];
    let text = new P("Choose Your Fighter", screenw / 2, height / 20, width * 0.02 + "px").fromCenter();
    let names = [];
    text.shape.style.zIndex = "2070";
    screen.attach(text);
    function start_the_game(num) {
      crop.remove();
      lines.forEach((line) => {
        line.remove();
      });
      names.forEach((name) => {
        name.remove();
      });
      text.remove();
      screen.remove();
      resolve(num);
    }

    chosen_nums.forEach((num, i) => {
      let img = new Img(IMAGE_PATH + characters[num] + ".png", (screenw / chosen_nums.length) * i + width / 96, 0, screenw / chosen_nums.length - screenw / 40);
      crop.attach(img);
      if (i !== 0) {
        let line = Line.fromPoints(screenx + width / 191 + (screenw / chosen_nums.length) * i, screeny + screenh / 1.5, screenx + +(screenw / chosen_nums.length) * i + width / 47, screeny + screenh / 3 - width / 300, r(width / 219));
        line.shape.style.backgroundColor = isTeamA ? "blue" : "red";
        line.shape.style.zIndex = "2070";
        lines.push(line);
      }
      img.shape.addEventListener("click", () => {
        start_the_game(num);
      });
      let actual_name = characters[num]
        .split("_")
        .map((x) => x[0].toUpperCase() + x.slice(1, x.length))
        .join(" ");
      if (!isNaN(actual_name[actual_name.length - 1])) {
        actual_name = actual_name.slice(0, actual_name.length - 1);
      }
      let name = new P(actual_name, screenx + (screenw / chosen_nums.length) * (i + 0.1) + 10, 5 + screeny + screenh / 1.5);
      name.set("fontSize", width / 50);
      name.set("zIndex", "2070");
      if (name.width + 20 > screenw / chosen_nums.length) {
        name.string = actual_name.slice(0, 7) + "..";
      }
      name.string = name.string.replace(name.string.charAt(0), name.string.charAt(0).toUpperCase());
      names.push(name);
      images.push(img);
    });
  });
}

function setUpCharacter_2Team(isTeamA, num) {
  return new Promise((resolve) => {
    let vals = create_player(num);
    LOADED_IMAGES.add(vals.power + "_projectile", IMAGE_PATH + "projectiles/");
    let player = isTeamA ? playerA : playerB;
    player = new Character(width * (isTeamA ? 0.28 : 0.72), height - 100, vals.name);
    let sprite = new Img(IMAGE_PATH + "/" + vals.name + ".png", 0, 0, width / 8).fromCenter().onLoad(() => {
      player.addSprite(sprite);
      player.team = isTeamA ? "A" : "B";
      player.addForce(VECTORS.gravity);
      player.maxbounds.x = width * 0.79;
      player.minbounds.x = width * 0.21;
      player.maxbounds.y = height - 20;
      player.minbounds.y = height * 0.2;
      player.powerType = vals.power;
      sprite.set("zIndex", "1000");
      THINGS_TO_UPDATE.push(player);
      player.addDeathImage(LOADED_IMAGES.fire.cloneNode());
      if (isTeamA) {
        playerA = player;
      } else {
        playerB = player;
        player.faceLeft();
      }
      return resolve();
    });
  });
}
