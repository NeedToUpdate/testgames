class GameButton extends Character {
    //position is an array determining their position in a grid, e.g. [0,1] or [4,2]
    constructor(string, pos, color) {
        super(0,0,string);
        this.pDiv = new P(string, 0, 0);
        this.div = new Square(0, 0, 70).fromCenter().usingNewTransform();
        this.div.attach(this.pDiv);
        this.pos = pos;
        this.string = string;
        this.color = color;
        this.generate();
    }

    generate() {
        Object.assign(this.div.shape.style, {
            background: "rgba(215,215,255, 0.3)",
            "text-align": "center",
            border: "5px solid " + this.color,
            borderRadius: "10px",
        });
        let colors = ['darkred', 'darkgreen', 'darkgoldenrod', 'purple', 'darkblue', 'darkorange', 'darkcyan', 'darkslategray'];
        Object.assign(this.pDiv.shape.style, {
            color: getRandom(colors),
            textShadow: "white 0px 0px 5px",
            fontSize: "4em",
            fontWeight: "bold",
            margin: 0,
            position: "relative",
            top: "-5px",
        });
        let fonts = ['arial', 'sans-serif', 'italic', 'times new roman', 'cursive', 'impact'];
        this.pDiv.set('fontFamily', getRandom(fonts));
        this.addSprite(this.div)
    }

    set(attr, val) {
        // if (attr === 'top') {
        //     this.p.y = parseInt(val);
        //     this.maxbounds.y = this.p.y + 40
        // }
        // if (attr === 'left') {
        //     this.p.x = parseInt(val);
        // } TODO maybe erase this
        this.div.set(attr, val);
    }
}

class StaticGameButton extends GameButton {
    constructor(string, x, y) {
        super(string, [x, y]);
        this.p.x = x;
        this.p.y = y;
    }

    generate() {
        Object.assign(this.div.shape.style, {
            position: 'absolute',
            background: "white",
            "text-align": "center",
            border: "5px solid darkgrey",
            borderRadius: "10px",
            boxShadow: "blue 1px 2px 2px",
        });
        this.x = this.pos[0];
        this.y = this.pos[1];

        Object.assign(this.pDiv.shape.style, {
            color: 'transparent',
            textShadow: "rgba(255,255,255,0.5) 2px 2px 3px",
            fontWeight: "bold",
            margin: 0,
            position: "relative",
            top: "-5px",
            "background-clip": "text",
            "-moz-background-clip": "text",
            "-webkit-background-clip": "text",
            backgroundColor: "blue"
        });

        this.addSprite(this.div)
    }
}