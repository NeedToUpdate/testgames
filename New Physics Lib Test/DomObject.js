class Helper{
    static Deg2Rad(deg){
        return deg*180/Math.PI;
    }
    static Rad2Deg(rad){
        return rad*Math.PI/180
    }
}


class DomObject {
    constructor(x, y) {
        this.p = new Vector(x, y);
        this.shape = {};
        this.isRectangle = false;
        this.isLine = false;
        this.removed = false;
        this.radius = 1;
        this.type = 'DomObject';
        this.DEFAULT_COLOR = 'black';
        this.attachments = {};
    }

    init(){
        console.error('DomObject ' + this.type + ' doesnt have an init function');
    }
    get vector() {
        return new Vector(this.x, this.y);
    }

    get x() {
        return parseInt(this.shape.style.left) || this.p.x;
    }

    set x(val) {
        this.p.x = val;
        this.set('left', val - (this.isRectangle ? 0 : this.radius + 1) + 'px')
    }

    get y() {
        return parseInt(this.shape.style.top) || this.p.y;
    }

    set y(val) {
        this.p.y = val;
        this.set('top', val - (this.isRectangle ? 0 : this.radius + 1) + 'px')
    }

    set color(string){
        this.shape.style.backgroundColor = string.toString();
    }
    get color(){
        return this.shape.style.backgroundColor;
    }
    set border(string){
        this.shape.style.border = string.toString();
    }
    get border(){
        return this.shape.style.border;
    }

    get(attr) {
        return this.shape.style[attr];
    }

    getVal(attr) {
        return parseInt(this.shape.style[attr]);
    }

    set(attr, val) {
        if (this.removed) return;
        if(typeof val === 'number'){
            val += 'px';
        }
        this.shape.style[attr] = val;
    }

    mod(attr, val) {
        if (this.removed) return;
        let attribute = this.shape.style[attr];
        let value = parseInt(attribute);
        if (isNaN(value)) {
            let e = new ErrorHandler('attr is not a value');
            return;
        }
        //probably is a beter way for this
        let suffix = attribute.split(value)[1];
        value += val;
        this.shape.style[attr] = value + suffix;
    }

    moveTo(p) {
        if(arguments.length === 2){
            this.set('top', arguments[1] - (this.isRectangle ? 0 : this.r) + 'px');
            this.set('left', arguments[0] - (this.isRectangle ? 0 : this.r) + 'px');
        }
        this.set('top', p.y - (this.isRectangle ? 0 : this.r) + 'px');
        this.set('left', p.x - (this.isRectangle ? 0 : this.r) + 'px');
    }



    rotateTo(num) {
        this.set('transform', 'rotate(' + num + 'deg)')
    }

    attach(div) {
        if (div instanceof DomObject) {
            this.shape.appendChild(div.shape);
            if(!Object.keys(this.attachments).includes(div.type + 's')){
                this.attachments[div.type + 's'] = [];
            }
            this.attachments[div.type + 's'].push(div);
        } else {
            this.shape.appendChild(div)
        }
    }

    asOutline(color,thickness){
        color = (color || this.color);
        thickness = (thickness || 1 );
        this.border = color + ' solid ' + thickness +'px';
        this.color = 'transparent';
        switch(this.type){
            case 'line':
                //this.b.sub(new Vector(-thickness,-thickness));
                this.mod('width', -thickness*2);
                break;
            case 'rectangle':
            case 'circle':
                this.mod('width', -thickness*2);
                this.mod('height', -thickness*2);
                break;
        }
        return this;
    }
    setColor(color){
        this.color = color;
        return this;
    }

    remove() {
        if (this.removed) return;
        this.removed = true;
        try{ //TODO
            this.shape.parentNode.removeChild(this.shape)
        }catch (e) {
            console.error(e)
        }
        //this removes all the children, but they still need to be marked if their objects still exist
        Object.keys(this.attachments).forEach(key=>{
            this.attachments[key].forEach(x=>{
                x.remove();
            })
        })
    }
}


class Div extends DomObject {
    constructor(x, y, r, h, theta) {
        super(x, y);
        this.type = 'div';
        if (r < 0 || h < 0) {
            console.error('radius/width/height is negative, might cause issues with this', this)
        }
        this.isLine = h === 1;
        this.isRectangle = (x && y && r && h) || this.isLine; //if r and h are given, then it must be a square
        this.radius = r || 1; //if isRect then this is w
        this.w = this.isRectangle ? r : 0;
        this.h = h || 0;
        this.theta = theta || 0;
        this.shape = document.createElement('div');
        this.init();
    }

    init() {
        Object.assign(this.shape.style, {
            height: (this.isRectangle ? this.h : this.radius * 2) + 'px',
            width: (this.isRectangle ? this.w : this.radius * 2) + 'px',
            top: this.p.y - (this.isRectangle ? 0 : this.radius + 1) + 'px',
            left: this.p.x - (this.isRectangle ? 0 : this.radius + 1) + 'px',
            transformOrigin: (this.isLine ? '0% 50%' : 'center center'),
            //backgroundColor: 'white',
            borderRadius: this.isRectangle ? '' : '50%',
            position: 'absolute',
            transform: this.theta ? 'rotate(' + this.theta + 'deg)' : ''
        });
        this.color = this.DEFAULT_COLOR;
        document.body.appendChild(this.shape);
    }
}


class LineFromPoints extends Div {
    constructor(x1, y1, x2, y2, thickness) {
        let length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        let theta = new Vector(x2,y2).sub(new Vector(x1,y1)).perp().getAngle();
        super(x1, y1, length, 1, theta);
        this.type = 'line';
        this.a = new Vector(x1, y1);
        this.b = new Vector(x2, y2);
        this.length = length;
        this.theta = theta;
        this.thickness = thickness || 1;
        this.set('height', this.thickness)
    }
}

class LineFromAngle extends Div {
    constructor(x, y, length, theta, thickness) {
        super(x, y, length, 1, theta);
        this.type = 'line';
        this.a = new Vector(x, y);
        this.b = new Vector(this.length * Math.sin(Helper.Deg2Rad(this.theta)), this.length*Math.cos(Helper.Deg2Rad(this.theta)));
        this.length = length;
        this.theta = theta || 0;
        this.thickness = thickness || 1;
        this.set('height', this.thickness);
    }
}

class Line{
    //aliases for the above classes
    static fromPoints(x1, y1, x2, y2, thickness){
        return new LineFromPoints(x1, y1, x2, y2, thickness)
    }
    static fromAngle(x, y, length, theta, thickness){
        return new LineFromAngle(x, y, length, theta, thickness)
    }
    static random(length){
        return new LineFromAngle(0,0,length||1,Math.random()*360 |0);
    }
}

class Circle extends Div{
    constructor(x,y,r){
        super(x,y,r);
        this.type = 'circle';
        this.diameter = r*2;
    }
}

class Rectangle extends Div{
    constructor(x,y,width,height,theta){
        super(x,y,width,height,theta);
        this.type = 'rectangle'
    }
}
class Square extends Div{
    constructor(x,y,width,theta){
        super(x,y,width,width,theta);
        this.type = 'rectangle'
    }
}

class P extends DomObject {
    constructor(string, x, y) {
        super(x, y);
        this.stringVal = string;
        this.type = 'text';
        this.shape = document.createElement('p');
        this.text = {};
        this.removed = false;
        this.init()
    }

    get string() {
        return this.text.data;
    }

    set string(string) {
        this.text.data = string;
    }

    set color(string){
        this.set('color', string.toString())
    }
    get color(){
        return this.shape.style.color;
    }

    init() {
        Object.assign(this.shape.style, {
            position: 'absolute',
            top: this.p.y + 'px',
            left: this.p.x + 'px',
            color: 'white',
        });
        this.text = document.createTextNode(this.stringVal);
        this.shape.appendChild(this.text);
        document.body.appendChild(this.shape)
    }
}

class ImageLoader {
    constructor(path, array_of_names) {
        this.imagepaths = array_of_names.map(x => {
            return {name: x, path: path + x + '.png'};
        });
        this.load();
        this.array_of_names = array_of_names;
        this.path = path;
    }

    get names() {
        return this.array_of_names;
    }

    static createImg(path) {
        let img = new Image();
        img.src = path;
        Object.assign(img.style, new StyleMaker('small').genStyle());
        document.body.appendChild(img);
        return img
    }

    load() {
        this.imagepaths.forEach(obj => {
            this[obj.name] = ImageLoader.createImg(obj.path);
        })
    }

    add(nameorarray) {
        if (nameorarray instanceof Array) {
            nameorarray.forEach(name => {
                this[name] = ImageLoader.createImg(this.path + '/' + name + '.png');
            })
        } else if (typeof nameorarray === 'string') {
            this[nameorarray] = ImageLoader.createImg(this.path + '/' + nameorarray + '.png');
        }
        else {
            console.error('unexpected format to add to ImageLoader')
        }
    }
}

class StyleMaker {
    constructor(type) {
        this.type = type;
        this.default = {
            position: 'absolute',
            top: '0px',
            left: '0px',
        };
        this.genStyle();
    }

    genStyle() {
        if (!this.type) return this.default;
        if (this.type === 'small') {
            this.default.width = '50px';
            return this.default;
        }
    }
}



class ImgOld {
    constructor(src, x, y, w, loadcenter, theta, h) {
        this.x = x;
        this.y = y;
        this.w = w || -1;
        this.h = h || -1;
        this.theta = theta || 0;
        this.shape = {};
        this.shape.src = '';
        this.permaload = false;
        this.loadcenter = loadcenter;
        if (typeof src === "string") {
            this.shape = document.createElement("img");
            this.shape.src = src;
        } else {
            this.shape = src;
        }
        this.removed = false;
        if (this.y === 'bottom' && typeof src === 'string') {
            this.shape.onload = () => {
                this.draw();
                this.y = height - this.shape.height;
                this.set('top', this.y + 'px');
                this.onload();
            }
        } else {
            this.shape.onload = () => {
                this.onload();
            };
            this.draw();
        }

    }

    get vector() {
        return new Vector(parseInt(this.shape.style.left, 10), parseInt(this.shape.style.top, 10))
    }

    get theta() {
        //very specific, only used when rotation is already set
        let rotation = this.shape.style.transform;
        let theta = 0;
        if (rotation.match('rotate')) {
            theta = parseInt(this.shape.style.transform.replace(/[rotate(|)]/gi, ""));
            if (!isNaN(theta)) {
                return theta;
            } else {
                return 0
            }
        } else {
            return 0;
        }
    }

    set theta(val) {

        this.shape.style.transform = "rotate(" + val + 'deg)';
        this.theta = val;
    }

    onload() {
    }

    get(attr) {
        return this.shape.style[attr];
    }

    getVal(attr) {
        return parseInt(this.shape.style[attr], 10);
    }

    add(div, remove) {
        if (div instanceof DomObject) {
            if (remove) {
                div.shape.parentNode.removeChild(div.shape)
            }
            this.shape.appendChild(div.shape)
        } else {
            this.shape.appendChild(div)
        }
    }

    draw() {

        if (this.removed) return;
        document.body.appendChild(this.shape);

        let style = {
            position: "absolute",

            transform: this.rot ? "rotate(" + this.theta + "deg)" : "",
        };
        if (this.w > -1) {
            style.width = this.w + 'px';
        }
        if (this.h > -1) {
            style.height = this.h + 'px';
        }
        style.top = this.y - (this.loadcenter ? this.shape.style.height : 0) + "px";
        style.left = this.x - (this.loadcenter ? this.shape.style.width : 0) + "px";
        Object.assign(this.shape.style, style);
    }

    set(attr, val) {
        if (this.removed) return;
        if (attr === 'top' && this.loadcenter) {
            val = parseInt(val, 10);
            val -= this.shape.height / 2;
            val += 'px'
        }
        if (attr === 'left' && this.loadcenter) {
            val = parseInt(val, 10);
            val -= this.shape.width / 2;
            val += 'px'
        }

        this.shape.style[attr] = val;
    }

    mod(attr, val) {

        if (this.removed) return;

        if (attr === "rotate") {
            let theta = parseInt(this.shape.style.transform.replace(/[rotate(|)]/gi, ""));
            if (!isNaN(theta)) {
                theta += val;
            } else {
                theta = val;
            }
            this.shape.style.transform = "rotate(" + theta + 'deg)';
            return;

        }
        let attribute = this.shape.style[attr];
        let value = parseInt(attribute);
        if (isNaN(value)) {
            let e = new ErrorHandler('attr is not a value', this);
            return;
        }
        //probably is a beter way for this
        let suffix = attribute.split(value)[1];
        value += val;
        this.shape.style[attr] = value + suffix;
    }

    destroy() {
        if (this.removed) return;
        if (this.shape) {
            if (!this.permaload) {
                try {
                    document.body.removeChild(this.shape);
                } catch (e) {
                    console.log(e)
                }

                this.shape = undefined;
                this.removed = true;
            } else {
                this.set('width', '50');
                this.set('top', '0');
                this.set('left', '0');
                this.shape = undefined;
                this.removed = true;
            }

        }
    }
}