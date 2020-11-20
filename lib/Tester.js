function createSlider(){
    let slider = document.createElement('input')
    slider.setAttribute('type','range')
    return slider;
}
function createButton(){
    let button = document.createElement('button');
    return button
}
class Tester{
    constructor(){}
}
class TestObj{
    constructor(numOfSliders,numOfCheckBoxes,numOfBbuttons){
        this.numOfSliders = numOfSliders;
        this.numOfCheckBoxes = numOfCheckBoxes;
        this.numOfBbuttons = numOfBbuttons;
        this.sliders = [];
        this.buttons = [];
        this.mainBG = new Rectangle(width-250,0,200,200).setColor('transparent')
        this.textDiv = new P('tester on').setColor('white')
        this.textDiv.set('position','')
        for(let i = 0; i<numOfSliders; i++){
            let slider = createSlider();
            slider.style.width = this.mainBG.width
            this.mainBG.attach(slider);
            this.sliders.push(slider);
        }
        for(let i = 0; i<numOfBbuttons; i++){
            let button = createButton();
            this.mainBG.attach(button);
            this.buttons.push(button);
        }
        this.mainBG.attach(this.textDiv)
        
    }
    setSlider(num){
        return {
            func: (fun)=>{
                this.sliders[num].oninput = fun
                return this;
            },
            scale: (n,x1,x2)=>{
                this.sliders[num].setAttribute('min',x1)
                this.sliders[num].setAttribute('max',x2)
                this.sliders[num].value = n;
                return this;
            },
            value: (val)=>{
                this.sliders[num].value = val;
                return this;
            }
        }
    }
    setButton(num){
        return {
            name: (name)=>{
                this.buttons[num].innerText = name;
                return this;
            },
            func: (fun)=>{
                this.buttons[num].onclick = fun;
                return this;
            }
        }
    }
    getSlider(num){
        return {
            value: this.sliders[num].value
        }
    }
    set text(text){
        this.textDiv.string = text;
    }                                                                                                                                                 
}