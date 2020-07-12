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
        this.isfromCenter = false;
        this.USING_NEW_TRANSFORM = false;
        this.isFlipped = false;
    }

    init(){
        console.error('DomObject ' + this.type + ' doesnt have an init function');
    }
    get vector() {
        return new Vector(this.x, this.y);
    }

    get x() {
        let val = 0;
        if(this.USING_NEW_TRANSFORM) {
            val = this.shape.style.transform.match(/translateX\(-?\d+.*d*px\)/);
            if(val){
                val = val[0].match(/-?\d+.*\d*/)[0];
            }
        }else{
            val = this.shape.style.left || this.p.x;
        }
        if(this.isFlipped  && this.USING_NEW_TRANSFORM && val !== null){
            val = parseInt(val)*3 + this.width;
        }
        return (val !== null? parseInt(val)  + (this.isfromCenter? this.width/2 : 0) : this.p.x) //* (this.isFlipped && this.USING_NEW_TRANSFORM? 2 :1)
    }
    get realX(){
        return this.shape.offsetLeft;
    }
    get realY(){
        return this.shape.offsetTop;
    }

    set x(val) {
        this.p.x = val;
        val = val - ((this.isRectangle&&!this.isfromCenter) ? 0 : this.width/2);
        if(this.USING_NEW_TRANSFORM){
            let value =  this.shape.style.transform;
            if(this.isFlipped) val = (val + this.width)/3;
            value.match(/translateX\(-?\d+\.?\d*px\)/g) !== null ?
                (this.shape.style.transform = value.replace(/translateX\(-?\d+\.?\d*px\)/g, 'translateX(' + val + 'px)') ):
                (this.shape.style.transform += ' translateX(' + val + 'px)');
            this.shape.style.transformOrigin = val + (this.isfromCenter && !this.isFlipped? this.width/2 :0) + 'px ' + this.y + 'px'
        }else{
            this.set('left', val  + 'px')
        }
    }

    get y() {
        let val = 0;
        if(this.USING_NEW_TRANSFORM) {
            val = this.shape.style.transform.match(/translateY\(-?\d+.*d*px\)/g)
            if(val){
                val = val[0].match(/-?\d+.*\d*/)[0];
            }
        }else{
            val = this.shape.style.top || this.p.y;
        }
        return val !== null? parseInt(val) + (this.isfromCenter? this.height/2 : 0) : this.p.y;
    }

    set y(val) {
        this.p.y = val;
        val =  val - ((this.isRectangle&&!this.isfromCenter) ? 0 : this.height/2)
        if(this.USING_NEW_TRANSFORM){
            let value =  this.shape.style.transform;
            value.match(/translateY\(-?\d+\.?\d*px\)/g) !== null ?
                this.shape.style.transform = value.replace(/translateY\(-?\d+\.?\d*px\)/g, 'translateY(' + val + 'px)') :
                this.shape.style.transform += ' translateY(' + val + 'px)';
            this.shape.style.transformOrigin = this.x + 'px ' + val + 'px'
        }else{
            this.set('top', val + 'px');
        }
    }


    rotateTo(num) {
        let tran =  this.shape.style.transform;
        this.shape.style.transform.match(/rotate\(-?\d+\.?\d*deg\)/g) !== null ?
            this.shape.style.transform = tran.replace(/rotate\(-?\d+\.?\d*deg\)/g, 'rotate(' + num + 'deg)') :
            this.shape.style.transform += ' rotate(' + num + 'deg)'
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
    get width(){
        return this.shape.offsetWidth;
    }
    get height(){
        return this.shape.offsetHeight;
    }
    set width(val){
        this.set('width',val);
    }
    set height(val){
        this.set('height',val);
    }
    get angle(){
        return this.theta;
    }
    set angle(val){
        this.rotateTo(val);
        this.theta = parseInt(val)
    }

    get zIndex(){
        return parseInt(this.shape.style.zIndex)
    }
    set zIndex(val){
        if(typeof val === 'number') val = val.toString();
        this.shape.style.zIndex = val;
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
            this.y = arguments[1];
            this.x = arguments[0];
        }else{
            this.y = p.y;
            this.x = p.x;
        }
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
                this.width -= thickness*2;
                break;
            case 'rectangle':
            case 'circle':
                this.width -= thickness*2;
                this.height -= thickness*2;
                break;
        }
        return this;
    }
    setColor(color){
        this.color = color;
        return this;
    }

    usingNewTransform(){
        let [x,y] = [this.x,this.y];
        this.x = (this.isfromCenter ? this.width / 2 : 0);
        this.y = (this.isfromCenter ? this.height / 2 : 0);
        this.USING_NEW_TRANSFORM = true;
        this.x = x;
        this.y = y;
        return this;
    }

    withNoCss(){
        let empty = {
            width: '',
            height: '',
            fontSize: '',
            border: '',
            borderRadius: '',
            position: '',
            top: '',
            left: '',
            transform: '',
            transformOrigin: '',
            color: '',
            backgroundColor: '',
            margin: '',
            padding:'',
        };
        Object.assign(this.shape.style,empty);
        return this;
    }

    withId(string){
        this.shape.id = string;
        return this;
    }

    addClass(string){
        if(arguments.length>1){
            for(let i = 0; i<arguments.length; i++){
                this.shape.classList.add(arguments[i]);
            }
            return this;
        }
        this.shape.classList.add(string);
        return this;
    }
    removeClass(string){
        if(arguments.length>1){
            for(let i = 0; i<arguments.length; i++){
                this.shape.classList.remove(arguments[i]);
            }
            return this;
        }
        this.shape.classList.remove(string);
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

    detach(obj){
        this.attachments[obj.type + 's'].splice(this.attachments[obj.type + 's'].indexOf(obj),1);
    }

    detachSelf(){
        return this.shape.parentNode.removeChild(this.shape);
    }

    fromCenter(){
        this.x =  this.x - this.width/2;
        this.y = this.y - this.height/2;
        this.isfromCenter = true;
        return this;

    }

    static attach(node){
        document.body.appendChild(node);
        return node
    }

    flip(dir){
        let current_dir = '';
        let flipped = this.get('transform');
        let x = this.p.x;
        if(this.isFlipped || flipped.includes('scaleX(-1)')){
            current_dir = 'left';
            this.isFlipped = true;
        }else{
            current_dir = 'right';
            this.isFlipped = false;
        }
        if(dir === current_dir) return;
        if(current_dir === 'right'){
            this.isFlipped = true;
            this.shape.style.transform += ' scaleX(-1)';
        }else{
            this.isFlipped = false;
            this.shape.style.transform = this.shape.style.transform.replace('scaleX(-1)', '');
        }
        this.x =x
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
        this.isRectangle = (!!r && !!h) || this.isLine; //if r and h are given, then it must be a square
        this.radius = r || 1; //if isRect then this is w
        this.w = this.isRectangle? r: r*2;
        this.h = h || 0;
        this.theta = theta || 0;
        this.shape = document.createElement('div');
        this.init();
    }

    init() {
        Object.assign(this.shape.style, {
            height: (this.isRectangle ? this.h : this.radius * 2) + 'px',
            width: (this.isRectangle ? this.w : this.radius * 2) + 'px',
            transformOrigin: (this.isLine ? '0% 50%' : 'center center'),
            borderRadius: this.isRectangle ? '' : '50%',
            position: 'absolute',
        });
        this.y = this.p.y - (this.isRectangle ? 0 : this.radius);
        this.x = this.p.x - (this.isRectangle ? 0 : this.radius);
        this.color = this.DEFAULT_COLOR;
        this.angle = this.theta;
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

class Arrow extends LineFromPoints{
    constructor(x1,y1,x2,y2,thickness){
        super(x1,y1,x2,y2,thickness)
        this.leftSide = {};
        this.rightSide = {};
        this.point = {}
        this.createArrow()
    }
    createArrow(){
        let l = this.length>this.thickness*5? this.thickness*5 : this.length/2;
        this.leftSide = new LineFromAngle(0,0,l,-30,this.thickness);
        this.leftSide.shape.style.borderRadius = "0 "+this.thickness+"px "+this.thickness+"px 0";
        this.attach(this.leftSide);
        this.rightSide = new LineFromAngle(0,0,l,30,this.thickness);
        this.rightSide.shape.style.borderRadius = "0 "+this.thickness+"px "+this.thickness+"px 0";
        this.attach(this.rightSide);
        this.point = new Circle(0,this.thickness/2,this.thickness/2)
        this.attach(this.point)
        this.shape.style.borderRadius = this.thickness/2 + 'px';
    }
    set color(string){
        this.shape.style.backgroundColor = string.toString();
        if(this.leftSide && Object.keys(this.leftSide).length>0) this.leftSide.shape.style.backgroundColor = string;
        if(this.rightSide && Object.keys(this.rightSide).length>0) this.rightSide.shape.style.backgroundColor = string;
        if(this.point && Object.keys(this.point).length>0) this.point.shape.style.backgroundColor = string;
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
        this.isRectangle = true;
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
    get size(){
        return this.shape.style.fontSize;
    }
    set size(string){
        this.set('fontSize', string)
    }

    init() {
        Object.assign(this.shape.style, {
            position: 'absolute',
            color: 'white',
            margin: '0',
            padding: '0'
        });
        this.y = this.p.y;
        this.x = this.p.x;
        this.text = document.createTextNode(this.stringVal);
        this.shape.appendChild(this.text);
        document.body.appendChild(this.shape)
    }
}

class Img extends DomObject{
    constructor(image,x,y,r,h,theta){
        super(x,y);
        this.type = 'img';
        this.isRectangle = true;
        this.radius = r ;
        this.w = r;
        this.h = h || 1;
        this.theta = theta || 0;
        this.shape = new Image();
        this.src = image;
        this.onLoadCallback = {};
        this.loaded = false;
        this.init();
    }

    init() {
        if(this.src instanceof HTMLElement){
            this.shape = this.src;
        }else{
            this.shape.src = this.src;
        }
        Object.assign(this.shape.style, {
            height: this.h >1 ? this.h + 'px' : '',
            width: (this.w) + 'px',
            transformOrigin: 'center center',
            position: 'absolute',
        });
        this.y = this.p.y;
        this.x = this.p.x;
        this.angle = this.theta
        this.shape.onload= ()=>{
            this.h = parseInt(this.shape.offsetHeight);
            this.loaded = true;
            if(typeof this.onLoadCallback === 'function') this.onLoadCallback();
        };


        document.body.appendChild(this.shape);
    }

    onLoad(fn){
        this.onLoadCallback = fn;
        return this;
    }

}


class LoadingBar extends DomObject{
    constructor(x,y,w,h,start,stop,val){
        super(x,y);
        this.w = w || 100;
        this.h = h || 10;
        this.startVal = start || 0;
        this.stopVal = stop || 100;
        this.currVal = typeof val == 'number'? val : 100;
        this.type = 'health';
        this.barShape = document.createElement('div');
        this.shape = document.createElement('div');
        this.isRectangle = true;
        this.callbacks = {}
        this.init();
    }
    init(){
        Object.assign(this.shape.style,{
            position: 'absolute',
            height: this.h -4 + 'px',
            width: this.w -4 + 'px',
            border: 'solid black 2px',
            top: this.y + 'px',
            left: this.x + 'px',
        });
        Object.assign(this.barShape.style, {
            position: 'absolute',
            height: this.h - 4 + 'px',
            width: '0px',
            backgroundColor: 'green',
        });
        this.value = this.currVal;
        document.body.appendChild(this.shape);
        this.shape.appendChild(this.barShape)
    }
    set(attr, val) {
        if(this.removed) return;
        this.shape.style[attr] = val;
    }
    setBar(attr, val){
        if(this.removed) return;
        this.barShape.style[attr] = val;
    }
    set value(val){
        this.currVal = val;
        let percent = (this.currVal-this.startVal)/(this.stopVal===0?1:this.stopVal);
        this.setBar('width', (this.w-4)*percent + 'px');
        if(this.type === 'health') {
            if (percent > .5) {
                this.setBar('backgroundColor', 'green');
            } else if (percent > .1) {
                this.setBar('backgroundColor', 'yellow');
            } else if (percent >= 0) {
                this.setBar('backgroundColor', 'red');
            }
        }
        if(this.callbacks[val]){
            this.callbacks[val]()
        }
    }
    get value(){
        return this.currVal;
    }
    on(val,callback){
        if(val<this.startVal || val>this.stopVal) console.error(val + ' is outside this bar\'s scope');
        this.callbacks[val] = callback
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

    add(nameorarray, newPath) {
        let path = newPath || this.path
        if (nameorarray instanceof Array) {
            nameorarray.forEach(name => {
                this[name] = ImageLoader.createImg(path + '/' + name + '.png');
            })
        } else if (typeof nameorarray === 'string') {
            this[nameorarray] = ImageLoader.createImg(path + '/' + nameorarray + '.png');
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