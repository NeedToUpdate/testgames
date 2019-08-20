class DomObject{
    constructor(x,y){
        this.p = new Vector(x,y)
        this.shape = {};
        this.isRect = false;
        this.isLine = false;
        this.removed = false;
        this.r = 1;
    }
    get vector(){
        return new Vector(this.x,this.y);
    }
    get(attr){
        return this.shape.style[attr];
    }
    getVal(attr){
        return parseInt(this.shape.style[attr]);
    }
    get x(){
        return parseInt(this.shape.style.left) || this.p.x;
    }
    get y(){
        return parseInt(this.shape.style.top) || this.p.y;
    }
    set x(val){
        this.p.x = val;
        this.set('left', val  - (this.isRect ? 0: this.r+1) + 'px')
    }
    set y(val){
        this.p.y = val;
        this.set('top',val - (this.isRect ? 0 : this.r+1) + 'px')
    }
    set(attr, val) {
        if(this.removed) return;
        this.shape.style[attr] = val;
    }
    mod(attr, val){

        if(this.removed) return;
        let attribute = this.shape.style[attr];
        let value = parseInt(attribute);
        if(isNaN(value)) {
            let e = new ErrorHandler('attr is not a value');
            return;
        }
        //probably is a beter way for this
        let suffix = attribute.split(value)[1];
        value+= val;
        this.shape.style[attr] = value + suffix;
    }
    moveTo(p){
        this.set('top',p.y-(this.isRect?0:this.r+1) + 'px');
        this.set('left',p.x-(this.isRect?0:this.r+1) + 'px');
    }
    rotateTo(num){
        this.set('transform','rotate('+num+'deg)')
    }
    add(div){
        if(div instanceof DomObject){
            this.shape.appendChild(div.shape)
        }else{
            this.shape.appendChild(div)
        }
    }
    remove() {
        if(this.removed) return;
        this.removed = true;
        this.shape.parentNode.removeChild(this.shape)
    }
}

class DivLine extends DomObject{
    constructor(x,y,r,rot,color,thickness){
        super();
        this.p = new Vector(x,y)
        this.color = color || "white";
        this.r = r || 1; //if isRect then this is w
        this.w = r;
        this.rot = rot || 0;
        this.shape = document.createElement('div');
        this.h = thickness || 1;
        this.init();
    }
    init(){

        Object.assign(this.shape.style, {
            height: this.h + 'px',
            width: this.r + 'px',
            top: this.p.y  + 'px',
            left: this.p.x + 'px',
            transformOrigin: '0% 50%',
            backgroundColor: this.color,
            position: 'absolute',
            transform: this.rot ? 'rotate(' + this.rot + 'deg)' : ''
        });
        document.body.appendChild(this.shape);
    }
}

class Div extends DomObject{
    constructor(x, y, color, r, h, isRect, rot, isLine) {
        super();
        this.p = new Vector(x,y)
        this.color = color;
        this.r = r || 1; //if isRect then this is w
        this.w = isRect ? r : 0;
        this.h = h || 0;
        this.rot = rot || 0;
        this.shape = document.createElement('div');
        this.isRect = isRect;
        this.isLine = isLine;
        this.init();

    }
    init(){

        Object.assign(this.shape.style, {
            height: (this.isRect ? this.h : this.r * 2) + 'px',
            width: (this.isRect ? this.w : this.r * 2) + 'px',
            top: this.p.y - (this.isRect ? 0 : this.r+1) + 'px',
            left: this.p.x  - (this.isRect ? 0: this.r+1) + 'px',
            border: (this.color ? this.color : 'white') + ' solid 1px',
            transformOrigin: (this.isLine? '0% 50%':'center center'),
            //backgroundColor: 'white',
            borderRadius: this.isRect ? '' : '50%',
            position: 'absolute',
            transform: this.rot ? 'rotate(' + this.rot + 'deg)' : ''
        });
        document.body.appendChild(this.shape);
    }

}
class P extends DomObject{
    constructor(string,x,y){
        super(x,y);
        this.string = string;
        this.shape = document.createElement('p');
        this.text = {}
        this.removed = false;
        this.init()

    }
    init(){

        Object.assign(this.shape.style,{
            position:'absolute',
            top: this.p.y + 'px',
            left: this.p.x + 'px',
            color: 'white',
        })
       this.text = document.createTextNode(this.string)
       this.shape.appendChild(this.text)
       document.body.appendChild(this.shape)
    }

}
class ImageLoader{
    constructor(path, array_of_names){
        this.imagepaths = array_of_names.map(x=>{
            return {name: x, path:path+x+'.png'};
        });
        this.load();
    }
    load(){
        this.imagepaths.forEach(obj=>{
            let img = ImageLoader.createImg(obj.path);
            this[obj.name] = img;
        })
    }
    static createImg(path){
        let img = new Image();
        img.src = path;
        Object.assign(img.style,new StyleMaker('small').genStyle() );
        document.body.appendChild(img)
        return img
    }
}
class StyleMaker{
    constructor(type){
        this.type = type;
        this.default = {
            position: 'absolute',
            top: '0px',
            left: '0px',
        };
        this.genStyle();
    }
    genStyle(){
        if (!this.type) return this.default;
        if(this.type === 'small') {
            this.default.width = '50px';
            return this.default;
        }
    }
}
class Img {
    constructor(src, x, y, w, loadcenter, rot, h) {
        this.x = x;
        this.y = y;
        this.w = w || -1;
        this.h = h || -1;
        this.rot = rot || 0;
        this.shape = {};
        this.shape.src = '';
        this.permaload = false;
        this.loadcenter = loadcenter;
        if(typeof src === "string"){
            this.shape = document.createElement("img");
            this.shape.src = src;
        }else{
            this.shape = src;
        }
        this.removed = false;
        if(this.y === 'bottom' && typeof src === 'string'){
            this.shape.onload = ()=>{
                this.draw();
                this.y = height - this.shape.height;
                this.set('top', this.y + 'px')
            }
        }else{
            this.draw();
        }

    }
    onload(){
        return;
    }
    draw() {

        if(this.removed) return;
        document.body.appendChild(this.shape);
        let style = {
            position: "absolute",
            top: this.y -(this.loadcenter?this.shape.height : 0) + "px",
            left: this.x -(this.loadcenter?this.shape.width : 0)  + "px",
            transform: this.rot? "rotate(" + this.rot +"deg)" : "",
        };
        if (this.w > -1) {
            style.width = this.w + 'px';
        }
        if (this.h > -1) {
            style.height = this.h + 'px';
        }
        Object.assign(this.shape.style, style);
        requestAnimationFrame(this.onload);
    }

    set(attr, val) {
        if(this.removed) return;
        if(attr === 'top' && this.loadcenter){
            val = parseInt(val,10);
            val-= this.shape.height/2;
            val += 'px'
        }
        if(attr === 'left' && this.loadcenter){
            val = parseInt(val,10);
            val-= this.shape.width/2;
            val += 'px'
        }

        this.shape.style[attr] = val ;
    }
    get vector(){
        return new Vector(this.x, this.y)
    }
    get angle(){
        //very specific, only used when rotation is already set
        let rotation = this.shape.style.transform
        let angle = 0;
        if(rotation.match('rotate')){
            angle = parseInt(this.shape.style.transform.replace(/[rotate(|)]/gi, ""));
            if(!isNaN(angle)){
                return angle;
            }else{
                return 0
            }
        }else {
            return 0;
        }
    }
    set angle(val){

        this.shape.style.transform = "rotate("+ val + 'deg)';
        this.rot = val;
    }
    mod(attr, val){

        if(this.removed) return;

        if(attr === "rotate"){
            let angle = parseInt(this.shape.style.transform.replace(/[rotate(|)]/gi, ""));
            if(!isNaN(angle)){
                angle += val;
            }else{
                angle = val;
            }
            this.shape.style.transform = "rotate("+ angle + 'deg)'
            return;

        }
        let attribute = this.shape.style[attr];
        let value = parseInt(attribute);
        if(isNaN(value)) {
            let e = new ErrorHandler('attr is not a value', this);
            return;
        }
        //probably is a beter way for this
        let suffix = attribute.split(value)[1];
        value+= val;
        this.shape.style[attr] = value + suffix;
    }
    destroy() {
        if(this.removed) return;
        if (this.shape) {
            if(!this.permaload){
                document.body.removeChild(this.shape);
                this.shape = undefined;
                this.removed = true;
            }else{
                this.set('width', '50');
                this.set('top', '0');
                this.set('left', '0');
                this.shape = undefined;
                this.removed = true;
            }

        }
    }
}