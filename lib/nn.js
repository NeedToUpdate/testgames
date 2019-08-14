class NeuralNetwork {


    constructor(layer) {

        this.num_of_inputs = layer;
        this.layers = [];
        this.layer_nodes = [];
        this.num_of_outputs = 0;
        this.output_layer = {};
        this.num_of_layers = arguments.length - 1;
        this.initialized = false;
        this.training = false;
        this.batch = {
            targets: [],
            outputs: [],
        };
        if (arguments.length < 1) {
            console.error('minimum 1 layer');
        }

        this.config = {
            default_type: 'dense',
            activation_fn: 'default',
            learning_rate: 0.1,
            output_activation_fn: 'default',
            default_activation_fn: 'sigmoid',
            weights_start: 'default',
            biases_stat: 'default',
            autoinit: false,
            output_fn: '',
            batch_size: 0, //for batch training
            loss_fn: 'default',
            //genetic stuff
            mutationAmount: 0.01,
            mutationRate: 0.05
        };
        this.error_vals = [];
        this.training_times = 0;
        if (typeof arguments[arguments.length - 1] === "boolean" && arguments[arguments.length - 1]) {
            //autoinit
            this.num_of_layers--;
            this.config.autoinit = true;

        }
        if (arguments.length >= 2) {
            for (let i = 0; i < this.num_of_layers; i++) {
                this.layer_nodes.push(arguments[i]);
                this.layers.push(new Layer(arguments[i], arguments[i + 1]));
            }
            this.layer_nodes.push(arguments[arguments.length - 1]);
            this.num_of_outputs = this.layers[this.num_of_layers - 1].num_of_outputs;
        } else {
            this.layer_nodes.push(layer)
        }


        if (this.config.autoinit) {
            this.initdefault();
        }
    }

    initdefault() {
        this.layers.forEach(layer => {

            Object.assign(layer.config, {
                activation_fn: this.config.activation_fn,
                learning_rate: this.config.learning_rate,
                weights_start: this.config.weights_start,
                biases_start: this.config.biases_start,
                type: this.config.default_type
            })

        });
        this.layers[this.num_of_layers - 1].config.activation_fn = this.config.output_activation_fn;
        this.layers[this.num_of_layers - 1].config.output_layer = true;

        this.layers.forEach(x => x.init());
    }

    addLayer(output_nodes, type, activation_fn, is_output, weights_start, biases_start, autoinit) {

        let l = new Layer(this.layer_nodes[this.num_of_layers], output_nodes);
        this.layers.push(l);
        if (arguments.length < 2) console.log(`%cdon't forget to set config of this layer!`, 'color:teal');
        if (activation_fn && typeof activation_fn === 'string') l.config.activation_fn = activation_fn;
        if (type) l.config.type = type;
        if (typeof is_output === 'boolean') l.config.output_layer = is_output;
        if (weights_start) l.config.weights_start = weights_start;
        if (biases_start) l.config.biases_start = biases_start;
        if (autoinit) l.init();
        this.num_of_layers++;
        this.layer_nodes.push(output_nodes);
        if (is_output) {
            this.num_of_outputs = output_nodes;
            this.output_layer = l;
        }
        return l;
    }

    init() {
        //assumes all settings are finished
        this.training_times = 0;
        this.error_vals = [];
        Object.keys(this.batch).forEach(key => this.batch[key] = []);
        this.layers.forEach(x => x.init());
        if(Object.keys(this.output_layer)<1){
            this.num_of_outputs = this.layers[this.num_of_layers - 1].num_of_outputs;
            this.output_layer = this.layers[this.num_of_layers - 1];
        }

        this.initialized = true;
    }

    removeLayer(index) {

        if (index > this.num_of_layers - 1 || index < 0) {
            console.log('out of bounds, cant remove');
            return undefined;
        }
        this.num_of_layers--;
        this.layers.splice(index, 1);
        this.layer_nodes.splice(index, 1);
        this.layers[index - 1].num_of_outputs = this.layers[index].num_of_inputs;
        this.init();
    }

    randomizeAll() {
        this.layers.forEach(x => x.randomize());
    }

    predict(input_array) {
        if (!this.initialized) {
            this.init();
        }
        //input is array
        if (input_array.length !== this.num_of_inputs) {
            console.error(`input must match input nodes (${this.num_of_inputs})`);
            return undefined;
        }

        //let inputLayer = new Matrix(input_array);
        let next_layer = input_array;
        this.layers.forEach((x) => {
            //inputs goes into the layer
            if (this.training) {
                x.training = true;
            }
            if (this.batch_training) {
                x.batch_training = true;
            }
            next_layer = x.feedForward(next_layer);
            //move to next step

        });

        if (this.config.output_fn) {
            next_layer = next_layer.map(outputs[this.config.output_fn]);
        }

        return next_layer;
    }

    setBatchTrain(num) {
        this.batch_training = true;
        this.config.batch_size = num;
        this.layers.forEach((x, i) => {
            i = this.num_of_layers - 1 - i;
            // through each layer
            if (this.layers[i].config.type === 'lstm') {
                this.layers[i].config.batch_size = num;
                this.layers[i].batch_training = true;
            }
        });
    }

    async asynctrain(input_array, targets) {
        return new Promise(resolve => {
            this.train(input_array, targets, resolve);
        });
    }

    train(input_array, targets, callback) {
        if(!this.initialized){
            console.error('Neural Network not initialized, run nn.init()');
            return;
        }
        if (input_array.length !== this.num_of_inputs) {
            console.error(`input must match input nodes (${this.num_of_inputs})`);
            return undefined;
        }
        if (targets.length !== this.num_of_outputs) {
            console.error(`target must match output nodes (${this.num_of_outputs})`);
            return undefined;
        }


        this.training = true;
        this.training_times++;
        let outputM = new Matrix(this.predict(input_array));
        let targetM = new Matrix(targets);
        let error_array = [];
        if (this.batch_training) {
            if (this.batch.outputs.length < this.config.batch_size - 1) {
                //console.log(this.batch.outputs.length)
                this.batch.outputs.push(outputM);
                this.batch.targets.push(targetM);
                return;
            }
            this.batch.outputs.push(outputM);
            this.batch.targets.push(targetM);
            // console.log(this.batch.targets);
            // console.log(this.batch.outputs);
            error_array = this.batch.outputs.map((matrix, index) => {
                if(this.config.loss_fn !== 'default'){
                    this.error_vals.push(loss_fn[this.config.loss_fn](matrix.toArray(), this.batch.targets[index].toArray()));
                }

                    return matrix.sub(this.batch.targets[index]).toArray();
            });
            Object.keys(this.batch).forEach(key => this.batch[key] = []);
            //console.log(error_array);

        }
        let prev_error;
        if (!this.batch_training) {
            if(this.config.loss_fn !== 'default'){
                this.error_vals.push(loss_fn[this.config.loss_fn](outputM.toArray(),targetM.toArray()));
            }
            prev_error = outputM.sub(targetM).toArray();
            //needs replacement with loss function
        } else {
            prev_error = error_array;
        }

        this.layers.forEach((x, i) => {
            i = this.num_of_layers - 1 - i;
            // backpropagate through each layer
            if (this.batch_training) {
                if (this.layers[i].config.type !== 'lstm') {
                    //reverse this later
                    prev_error.reverse();
                    prev_error = prev_error.map(x => this.layers[i].backPropagate(x));
                    prev_error.reverse();
                } else {
                    prev_error = this.layers[i].backPropagate(prev_error);
                }
            } else {
                prev_error = this.layers[i].backPropagate(prev_error);
            }

            this.layers[i].training = false;
            //move to next step

        });
        //arbitrary value
        if(this.error_vals.length>3000){
            this.error_vals.splice(0, this.error_vals.length - 3000)
        }
        this.training = false;
        if (callback) {
            callback();
        }


    }

    setLearningRate(num) {
        this.layers.forEach(x => x.config.learning_rate = num)
    }

    log() {
        console.groupCollapsed('Neural Net:');
        this.layers.forEach(x => x.log());
        console.groupEnd();
    }

    calc_loss(){
        return this.error_vals.reduce((a,b)=>a+b)/this.error_vals.length;
    }



    //============ Genetic NeuroEvolution Stuff ===============

    map(fn){
        this.layers.forEach(layer=>{
            if(layer.isSpecial()){
                //deal with it specially
                if(layer.isSpecial() === 'lstm'){
                    layer.weights.map(fn);
                    layer.biases.map(fn);
                    layer.forget_weights.map(fn);
                    layer.forget_biases.map(fn);
                    layer.input_sigm_weights.map(fn);
                    layer.input_sigm_biases.map(fn);
                    layer.input_tanh_weights.map(fn);
                    layer.input_tanh_biases.map(fn);
                }else{
                    console.error('layer needs special case');
                }
            }else{
                layer.weights.map(fn);
                layer.biases.map(fn);
            }

        })

    }
    mutate(rate, amount){
        let r = rate || this.config.mutationRate;
        let a = amount || this.config.mutationAmount;
        function mut(x) {
            let b = Math.random() < r;
            let val = (1-Math.random()*2)*a;
            if(x + val >1 || x + val < -1){
                if(val>0){
                    val = 1 - x;
                }else{
                    val = -1 - x;
                }
            }
            return b? x+val : x;
        }
        this.map(mut);
        return this;
    }
    mix(nnB,rate){
        let r = rate || 0.5;
        function pick(a,b){
            return Math.random()<r? a : b;
        }
        let nnA = this.copy();
        nnA.layers.forEach((layer,k)=>{
            if(layer.isSpecial()){
                layer.weights.map((x,i,j)=>pick(x,nnB.layers[k].weights.values[i][j]));
                layer.biases.map((x,i,j)=>pick(x,nnB.layers[k].biases.values[i][j]));
                layer.forget_weights.map((x,i,j)=>pick(x,nnB.layers[k].forget_weights.values[i][j]));
                layer.forget_biases.map((x,i,j)=>pick(x,nnB.layers[k].forget_biases.values[i][j]));
                layer.input_sigm_weights.map((x,i,j)=>pick(x,nnB.layers[k].input_sigm_weights.values[i][j]));
                layer.input_sigm_biases.map((x,i,j)=>pick(x,nnB.layers[k].input_sigm_biases.values[i][j]));
                layer.input_tanh_weights.map((x,i,j)=>pick(x,nnB.layers[k].input_tanh_weights.values[i][j]));
                layer.input_tanh_biases.map((x,i,j)=>pick(x,nnB.layers[k].input_tanh_biases.values[i][j]));
            }else{
                layer.weights.map((x,i,j)=>pick(x,nnB.layers[k].weights.values[i][j]));
                layer.biases.map((x,i,j)=>pick(x,nnB.layers[k].biases.values[i][j]));
            }
        });
        return nnA;

    }
    copy(){
        let newNN = new NeuralNetwork(this.num_of_inputs);
        newNN.layers = this.layers.map(layer=>{
            return layer.copy();
        });
        newNN.config = Object.assign({}, this.config);
        newNN.layer_nodes = Array.from(this.layer_nodes);
        newNN.num_of_outputs = this.num_of_outputs;
        newNN.num_of_layers = this.num_of_layers;
        newNN.output_layer = newNN.layers[newNN.num_of_layers-1];
        newNN.initialized = true;
        return newNN;
    }



}


loss_fn = {
    cross_entropy: (output,target)=>{
        let err = 0;
        output.forEach((out,i)=>{
            err += -(target[i]*(Math.log(out)/Math.log(10)) + (1-target[i])*(Math.log(1-out)/Math.log(10)));
        });
        return err;
    },
    mean_squared: (output, target)=>{
        let err = [];
        output.forEach((out,i)=>{
            let e = out-target[i];
            err.push(e*e);
        });
        return err.reduce((a,b)=>a+b)/output.length;
    }

}; //i really dont know if this is right
activations = {
    softmax: new Exception('softmax'),
    sigmoid: x => 1 / (1 + Math.exp(-x)),
    relu: x => Math.max(x, 0),
    tanh: x => (2 / (1 + Math.exp(-2 * x))) - 1,
    linear: x => x,
    lrelu: x => x >= 0 ? x : x * 0.01,
    crelu: x => x >= 0 ? Math.min(x, 1) : 0,
    swish: x => x / (1 + Math.exp(-x)),
};
outputs = {
    sign: x => x >= 0 ? 1 : 0,
    round: x => x >= 0.5 ? 1 : 0,
    push: x => x >= 0.9 ? 1 : x <= 0.1 ? 0 : x,
    relu: x => Math.max(x, 0),
};
d_activations = {
    softmax: new Exception('dsoftmax'),
    sigmoid: x => activations['sigmoid'](x) * (1 - activations['sigmoid'](x)),
    relu: y => y >= 0 ? 1 : 0,
    tanh: x => 1 - (activations['tanh'](x) * activations['tanh'](x)),
    linear: y => 1,
    lrelu: y => y >= 0 ? 1 : 0.01,
    crelu: y => y >= 0 ? 1 : 0,
    swish: x => x + activations['sigmoid'](x) * (1 - x)
};

class Layer {


    constructor(input_nodes, output_nodes, autoinit) {

        this.num_of_inputs = input_nodes;
        this.num_of_outputs = output_nodes;
        if (this.num_of_inputs === 0 || this.num_of_outputs === 0) {
            console.error('layer has 0 nodes, will cause issues.')
        }

        this.config = {
            type: 'dense',  //can be dense, recurrent or lstm
            type_args: [2, undefined, undefined],  //used for rnns, if blank will default to full
            //arg2 is num of recurrrent nodes 
            //arg3 is offset of the nodes
            //arg1 is time steps to backpropagate through
            biases_start: 'default',
            weights_start: 'default',
            activation_fn: 'default',
            default_activation_fn: 'sigmoid',
            learning_rate: 0.1,
            output_layer: false, //if this is the last layer
            batch_size: 10 //for batch training, will be set by nn train function
        };
        this.training = false; //used to store values if needed
        this.batch_training = false; //used for lstm

        this.weights = {}; //should be the weights of the output gate
        this.biases = {}; //should be biases of the output gate
        this.input_values = {}; //should always be the last input
        this.outputs_calcd = {}; //should be output values before activation fn
        this.output_values = {}; //should always be the last output

        //for LTSM

        this.cellstate_raw_inputs = {};
        this.cellstate_outputs = {};
        this.forget_weights = {};
        this.forget_biases = {};
        this.input_sigm_weights = {};
        this.input_sigm_biases = {};
        this.input_tanh_weights = {};
        this.input_tanh_biases = {};

        this.hidden_error_cache = [];
        this.cellstate_error_cache = [];
        this.cellstate_output_cache = [];
        this.forget_output_cache = [];
        this.i_output_cache = [];  //input gate sigm half
        this.a_output_cache = [];   //input gate tanh half


        //for recurrent
        this.hidden_cache = [];
        this.input_value_cache = [];
        this.outputs_calcd_cache = []; //also used for o_output_cache
        this.output_value_cache = [];

        if (autoinit) {
            this.init();
        }
    }

    init() {
        //clear the stuff just in case
        if (this.config.activation_fn === 'default') {
           // console.log(`%cno activation function selected for layer, using default: (${this.config.default_activation_fn})`, 'color:orange');
            this.config.activation_fn = this.config.default_activation_fn;
        }
        if (this.weights) {
            this.weights = {};
            this.biases = {};
            this.input_values = this.raw_outputs = this.outputs_calcd = this.output_values = {};
        }
        if (this.config.type === 'lstm') {
            this.cellstate_raw_inputs = {};
            this.cellstate_outputs = {};
            this.forget_weights = {};
            this.input_sigm_weights = {};
            this.input_tanh_weights = {};
            this.forget_biases = {};
            this.input_sigm_biases = {};
            this.input_tanh_biases = {};
            this.hidden_error_cache = [];
            this.cellstate_error_cache = [];
            this.cellstate_output_cache = [];
            this.forget_output_cache = [];
            this.i_output_cache = [];  //input gate sigm half
            this.a_output_cache = [];   //input gate tanh half
        }
        //create weight matrix
        switch (this.config.type) {
            case 'lstm':
                if (this.batch_training) {
                    this.config.type_args[0] = this.config.batch_size;
                }
                if (!this.config.type_args[1] || this.config.type_args[1] > this.num_of_outputs) {
                    this.config.type_args[1] = this.num_of_outputs;
                }
                //forget gate
                this.forget_weights = new Matrix(this.num_of_outputs, this.num_of_inputs + this.config.type_args[1]);
                this.forget_biases = new Matrix(this.num_of_outputs, 1);
                //input gate sigmoid half
                this.input_sigm_weights = new Matrix(this.num_of_outputs, this.num_of_inputs + this.config.type_args[1]);
                this.input_sigm_biases = new Matrix(this.num_of_outputs, 1);
                //input gate tanh half
                this.input_tanh_weights = new Matrix(this.num_of_outputs, this.num_of_inputs + this.config.type_args[1]);
                this.input_tanh_biases = new Matrix(this.num_of_outputs, 1);
                //output gate
                this.weights = new Matrix(this.num_of_outputs, this.num_of_inputs + this.config.type_args[1]);
                this.biases = new Matrix(this.num_of_outputs, 1);
                //fill caches

                let caches = [
                    this.hidden_error_cache,
                    this.cellstate_error_cache,
                    this.cellstate_output_cache,
                    this.forget_output_cache,
                    this.i_output_cache,
                    this.a_output_cache,
                    this.outputs_calcd_cache,


                ];

                caches.forEach(cache => {

                    while (cache.length < this.config.type_args[0] + 1) {
                        cache.push(new Matrix(Array(this.config.type_args[1]).fill(0)));
                    }

                });
                while (this.input_value_cache.length < this.config.type_args[0] + 1) {
                    this.input_value_cache.push(new Matrix(Array(this.config.type_args[1] + this.num_of_inputs).fill(0)));
                }


                break;
            case 'dense':
                this.weights = new Matrix(this.num_of_outputs, this.num_of_inputs);
                this.biases = new Matrix(this.num_of_outputs, 1);
                break;
            case 'recurrent':
                this.input_value_cache = [];
                this.output_value_cache = [];
                this.outputs_calcd_cache = [];
                this.hidden_cache = [];
                this.biases = new Matrix(this.num_of_outputs, 1);
                if (!this.config.type_args[1] || this.config.type_args[1] > this.num_of_outputs) {
                    this.config.type_args[1] = this.num_of_outputs;
                }
                this.weights = new Matrix(this.num_of_outputs, this.num_of_inputs + this.config.type_args[1]);
                break;
            default:
                console.error('using the default case, maybe a typo for layer type');
                this.weights = new Matrix(this.num_of_outputs, this.num_of_inputs);
        }

        //initialize starting weight values
        if (this.config.weights_start === '' || this.config.weights_start === 'random' || this.config.weights_start === 'default') {
            if (this.config.type === 'lstm') {
                this.forget_weights.randomize();
                this.input_sigm_weights.randomize();
                this.input_tanh_weights.randomize();
            }
            this.weights.randomize();
        } else if (typeof this.config.weights_start === 'number') {
            if (this.config.type === 'lstm') {
                this.forget_weights.map(x => this.config.weights_start);
                this.input_sigm_weights.map(x => this.config.weights_start);
                this.input_tanh_weights.map(x => this.config.weights_start);
            }
            this.weights.map(x => this.config.weights_start);
        }

        if (this.config.biases_start === '' || this.config.biases_start === 'random' || this.config.biases_start === 'default') {
            if (this.config.type === 'lstm') {
                this.forget_biases.randomize();
                this.input_sigm_biases.randomize();
                this.input_tanh_biases.randomize();
            }
            this.biases.randomize();
        } else if (typeof this.config.weights_start === 'number') {
            if (this.config.type === 'lstm') {
                this.forget_biases.map(x => this.config.biases_start);
                this.input_sigm_biases.map(x => this.config.biases_start);
                this.input_tanh_biases.map(x => this.config.biases_start);
            }
            this.biases.map(x => this.config.biases_start);
        }
        this.input_values = new Matrix(Array(this.num_of_inputs).fill(0));
        this.output_values = new Matrix(Array(this.num_of_outputs).fill(0));
    }

    feedForward(input_array) {

        if (input_array.length !== this.num_of_inputs) {
            console.error(`input must match input nodes (${this.num_of_inputs})`);
            return undefined;
        }
        //prep the inputs for rnn and others
        switch (this.config.type) {
            case 'lstm':
                while (this.hidden_cache.length < this.config.type_args[0] + 1) {
                    this.hidden_cache.push(Array(this.config.type_args[1]).fill(0));
                }
                input_array = input_array.concat(this.hidden_cache[this.config.type_args[0]]);
                if (this.training) {
                    this.input_value_cache.push(new Matrix(input_array));
                    if (this.input_value_cache.length > this.config.type_args[0] + 1) {
                        this.input_value_cache.splice(0, 1);
                    }
                }
                return this.feedForwardLSTM(input_array);
            case 'recurrent':
                while (this.hidden_cache.length < this.config.type_args[0] + 1) {
                    this.hidden_cache.push(Array(this.config.type_args[1]).fill(0));
                }
                input_array = input_array.concat(this.hidden_cache[this.config.type_args[0]]);
                if (this.training) {
                    this.input_value_cache.push(new Matrix(input_array));
                    if (this.input_value_cache.length > this.config.type_args[0] + 1) {
                        this.input_value_cache.splice(0, 1);
                    }
                }
                break;
            case 'dense':
            // dense is default anyway for now
            default:
                //nothing
                break;
        }

        this.input_values = new Matrix(input_array);
        //apply weights to each node in the layer
        this.raw_outputs = Matrix.multiply(this.weights, this.input_values);
        //add the biases
        this.outputs_calcd = this.raw_outputs.copy().add(this.biases);
        if (this.config.type === 'recurrent' && this.training) {
            this.outputs_calcd_cache.push(this.outputs_calcd);
            if (this.outputs_calcd_cache.length > this.config.type_args[0] + 1) {
                this.outputs_calcd_cache.splice(0, 1);
            }
        }
        //apply activation function
        this.output_values = this.outputs_calcd.copy().map(activations[this.config.activation_fn]);

        if (this.config.type === 'recurrent' && this.training) {
            this.output_value_cache.push(this.output_values);
            if (this.output_value_cache.length > this.config.type_args[0] + 1) {
                this.output_value_cache.splice(0, 1);
            }
        }

        //deal with data for rnns
        let final_output = this.output_values.toArray();
        switch (this.config.type) {
            case 'recurrent':
                let rn_offset = 0;
                if (this.config.type_args[2]) {
                    rn_offset = this.config.type_args[2];
                }
                this.hidden_cache.push(final_output.slice(rn_offset, this.config.type_args[1]));
                if (this.hidden_cache.length > this.config.type_args[0] + 1) {
                    this.hidden_cache.splice(0, 1);
                }
                break;
            case 'dense':
            // dense is default anyway for now
            default:
                //nothing
                break;
        }


        return final_output;
    }

    feedForwardLSTM(input_array) {
        //combine hidden and input
        if (this.batch_training) {
            this.config.type_args[0] = this.config.batch_size;
        }

        let combined = new Matrix(input_array);
        //combine into forget layer + bias + sigmoid
        let forget = Matrix.multiply(this.forget_weights, combined).add(this.forget_biases);
        if (this.training) {
            this.forget_output_cache.push(forget.copy());
            if (this.forget_output_cache.length > this.config.type_args[0] + 1) {
                this.forget_output_cache.splice(0, 1);
            }
        }
        forget.map(activations['sigmoid']);

        //combine into input layer x2 multiplied
        let inputS = Matrix.multiply(this.input_sigm_weights, combined).add(this.input_sigm_biases);
        if (this.training) {
            this.i_output_cache.push(inputS.copy());
            if (this.i_output_cache.length > this.config.type_args[0] + 1) {
                this.i_output_cache.splice(0, 1);
            }
        }
        inputS.map(activations['sigmoid']);
        let inputT = Matrix.multiply(this.input_tanh_weights, combined).add(this.input_tanh_biases);
        if (this.training) {
            this.a_output_cache.push(inputT.copy());
            if (this.a_output_cache.length > this.config.type_args[0] + 1) {
                this.a_output_cache.splice(0, 1);
            }
        }
        inputT.map(activations['tanh']);
        let inputST = inputS.copy().multiply(inputT);

        //combine into output layer
        let o_output = Matrix.multiply(this.weights, combined).add(this.biases);

        if (this.training) {
            this.outputs_calcd_cache.push(o_output.copy());
            if (this.outputs_calcd_cache.length > this.config.type_args[0] + 1) {
                this.outputs_calcd_cache.splice(0, 1);
            }
        }
        o_output.map(activations['sigmoid']);

        //step 2 * cell state
        //step 3 + step 5  --> new cellstate
        if (Object.keys(this.cellstate_raw_inputs).length < 1) {
            this.cellstate_raw_inputs = new Matrix(Array(this.config.type_args[1]).fill(0));
        }
        this.cellstate_outputs = this.cellstate_raw_inputs.copy().multiply(forget).add(inputST);

        //step 6 tanh's pointwise and * step 4 ---> new hidden + output
        this.output_values = this.cellstate_outputs.copy().map(activations['tanh']).multiply(o_output);

        this.hidden_cache.push(this.output_values.toArray());
        if (this.hidden_cache.length > this.config.type_args[0] + 1) {
            this.hidden_cache.splice(0, 1);
        }
        if (this.training) {
            this.cellstate_output_cache.push(this.cellstate_outputs.copy());
            if (this.cellstate_output_cache.length > this.config.type_args[0] + 1) {
                this.cellstate_output_cache.splice(0, 1);
            }
        }
        this.cellstate_raw_inputs = this.cellstate_outputs;
        return this.output_values.toArray();

    }

    backPropagate(error_array) {

        if (this.config.type === 'recurrent') {
            return this.backPropagateThroughTime(error_array);
        }
        if (this.config.type === 'lstm') {
            return this.backPropagateThroughTimeLSTM(error_array);
        }
        //difference of the target - output is the main error that needs to be split up
        let errors = new Matrix(error_array);
        //need to get the change over time of the nodes, so get derivative first
        let gradients = this.outputs_calcd.copy();
        gradients.map(d_activations[this.config.activation_fn]); //here
        //multiplied by the error, this gets the errors adjusted for the weight amounts
        gradients.multiply(errors);
        //dont overfit, so we scale down the errors
        gradients.multiply(this.config.learning_rate);
        //since we need to use the weights to calculate the error, we do that first
        //before adjusting the weights
        //by multiplying the errors by weights, we distribute the weights proportionally
        let wT = this.weights.transpose(true);
        //we can now calclulate the next errors proportionally
        let nexterror = Matrix.multiply(wT, errors);
        //now that were done with the weights, we can use them to calculate the delta and add them to the weights
        let weights_deltas = Matrix.multiply(gradients, this.input_values.transpose(true));
        this.biases.sub(gradients);
        this.weights.sub(weights_deltas);
        //changed to sub cause the error is now flipped to match cross-entropy
        return nexterror.toArray();
    }

    backPropagateThroughTime(error_array) {

        //first error
        let errors;
        let nexterrors = error_array;
        let wT = this.weights.transpose(true);
        let deltaWTT = [];
        let gradientsTT = [];

        for (let i = this.input_value_cache.length; i > 0; i--) {
            errors = new Matrix(nexterrors);
            let gradients = this.outputs_calcd_cache[i - 1].copy();
            gradients.map(d_activations[this.config.activation_fn]);
            //multiplied by the error, this gets the errors adjusted for the weight amounts
            gradients.multiply(errors);
            //dont overfit, so we scale down the errors
            gradients.multiply(this.config.learning_rate);
            gradientsTT.push(gradients);
            deltaWTT.push(Matrix.multiply(gradients, this.input_value_cache[i - 1].transpose(true)));
            nexterrors = Matrix.multiply(wT, errors).toArray().slice(this.num_of_inputs);
            while (nexterrors.length < this.num_of_outputs) {
                nexterrors = nexterrors.concat([0]);
            }
        }
        //we can now calculate the next errors proportionally

        let deltaG = gradientsTT.reduce((tot, g) => tot.add(g));
        let deltaW = deltaWTT.reduce((tot, w) => tot.add(w));

        this.biases.sub(deltaG);
        this.weights.sub(deltaW);

        return Matrix.multiply(wT, errors).toArray().slice(0, this.num_of_inputs);
    }

    backPropagateThroughTimeLSTM(error_array) {

        let n = this.config.type_args[0]; //n === t1
        let next_error = error_array;
        let output_errors = [];
        let final_tanh = [];
        let final_sigm = [];
        let final_forg = [];
        let final_outp = [];
        let final_tanh_b = [];
        let final_sigm_b = [];
        let final_forg_b = [];
        let final_outp_b = [];
        for (n; n > 0; n--) {
            let errors = new Matrix(this.batch_training ? error_array[n - 1] : next_error);
            let new_hidden_errors = (this.hidden_error_cache[n + 1] || new Matrix(Array(this.num_of_outputs).fill(0))).copy();
            new_hidden_errors.add(errors);

            let c = new_hidden_errors.copy()//this is right apparently
                .multiply(this.outputs_calcd_cache[n].copy().map(activations['sigmoid']))
                .multiply(this.cellstate_output_cache[n].copy().map(d_activations['tanh']))
                .add((this.cellstate_error_cache[this.config.type_args[0]] || new Matrix(Array(this.config.type_args[1]).fill(0)))
                    .multiply((this.forget_output_cache[n + 1] || new Matrix(Array(this.config.type_args[1]).fill(0))).map(activations['sigmoid'])));
            this.cellstate_error_cache.push(c.copy());
            if (this.cellstate_error_cache.length > this.config.type_args[0] + 1) {
                this.cellstate_error_cache.splice(0, 1);
            }

            let error_tanh_i = c.copy().multiply(this.i_output_cache[n].copy().map(activations['sigmoid']))
                .multiply(this.a_output_cache[n].copy().map(d_activations['tanh']));
            let error_sigm_i = c.copy().multiply(this.a_output_cache[n].copy().map(activations['tanh']))
                .multiply(this.i_output_cache[n].copy().map(d_activations['sigmoid']));
            let error_forget = c.copy().multiply(this.cellstate_output_cache[n - 1] || new Matrix(Array(this.num_of_outputs).fill(0)))
                .multiply(this.forget_output_cache[n].copy().map(d_activations['sigmoid']));
            let error_output = new_hidden_errors.copy().multiply(this.cellstate_output_cache[n].copy().map(activations['tanh']))
                .multiply(this.outputs_calcd_cache[n].copy().map(d_activations['sigmoid']));

            final_tanh_b.push(error_tanh_i);
            final_sigm_b.push(error_sigm_i);
            final_forg_b.push(error_forget);
            final_outp_b.push(error_output);

            let next_tanh = Matrix.multiply(this.input_tanh_weights.transpose(true), error_tanh_i);
            let next_sigm = Matrix.multiply(this.input_sigm_weights.transpose(true), error_sigm_i);
            let next_forg = Matrix.multiply(this.forget_weights.transpose(true), error_forget);
            let next_outp = Matrix.multiply(this.weights.transpose(true), error_output);

            let input_vals = this.input_value_cache[n].copy().toArray();

            let inputM = new Matrix(input_vals).transpose();

            let delta_tanh = Matrix.multiply(error_tanh_i, inputM);
            let delta_sigm = Matrix.multiply(error_sigm_i, inputM);
            let delta_forg = Matrix.multiply(error_forget, inputM);
            let delta_outp = Matrix.multiply(error_output, inputM);

            final_tanh.push(delta_tanh);
            final_sigm.push(delta_sigm);
            final_forg.push(delta_forg);
            final_outp.push(delta_outp);

            let next_errorM = next_tanh.copy().add(next_sigm).add(next_forg).add(next_outp);

            let temp_error = next_errorM.toArray();
            let next_hidden_error = temp_error.splice(this.num_of_inputs + this.config.type_args[1] - this.num_of_outputs, this.num_of_outputs);

            this.hidden_error_cache.push(new Matrix(next_hidden_error));
            if (this.hidden_error_cache.length > this.config.type_args[0]) {
                this.hidden_error_cache.splice(0, 1);
            }

            if (n !== 1 && !this.batch_training) {
                next_error = Array(this.num_of_outputs).fill(0);
            }
            if (this.batch_training) {
                output_errors.push(temp_error);
            } else {
                next_error = temp_error;
            }

        }

        this.input_tanh_weights.sub((final_tanh.reduce((tot, x) => tot.add(x)).mult(this.config.learning_rate)));
        this.input_sigm_weights.sub((final_sigm.reduce((tot, x) => tot.add(x)).mult(this.config.learning_rate)));
        this.forget_weights.sub((final_forg.reduce((tot, x) => tot.add(x)).mult(this.config.learning_rate)));
        this.weights.sub((final_outp.reduce((tot, x) => tot.add(x)).mult(this.config.learning_rate)));

        this.input_tanh_biases.sub((final_tanh_b.reduce((tot, x) => tot.add(x))));
        this.input_sigm_biases.sub((final_sigm_b.reduce((tot, x) => tot.add(x))));
        this.forget_biases.sub((final_forg_b.reduce((tot, x) => tot.add(x))));
        this.biases.sub((final_outp_b.reduce((tot, x) => tot.add(x))));

        if (this.batch_training) {
            return output_errors
        } else {
            return next_error;
        }

    }

    randomize() {
        this.weights.randomize();
        this.biases.randomize();
        return this;
    }


    log() {
        console.groupCollapsed(`${this.config.type} layer with ${this.num_of_inputs}=>${this.num_of_outputs} connections`);
        console.groupCollapsed('weights');
        if (this.weights) {
            this.weights.log();
        } else {
            console.log('layer not initialized');
        }
        console.groupEnd();
        console.groupCollapsed('last raw outputs');
        if (Object.keys(this.raw_outputs).length) {
            this.raw_outputs.log();
        } else {
            console.log('layer never activated');
        }
        console.groupEnd();
        console.groupCollapsed('last outputs + biases');
        if (Object.keys(this.outputs_calcd).length) {
            this.outputs_calcd.log();
        } else {
            console.log('layer never activated');
        }
        console.groupEnd();
        console.groupCollapsed('last outputs + biases + activations');
        if (Object.keys(this.output_values).length) {
            this.output_values.log();
        } else {
            console.log('layer never activated');
        }
        console.groupEnd();
        console.groupEnd();

    }
    isSpecial(){
        let c = this.config.type;
        if(c === 'lstm' || c === 'gru' || c === 'conv'){
            return this.config.type;
        }else{
            return false;
        }
    }
    copy(){
        let l = new Layer(this.num_of_inputs, this.num_of_outputs);
        l.config = Object.assign({},this.config);
        l.init();
        if(!l.isSpecial()){
            l.weights = this.weights.copy();
            l.biases = this.biases.copy();
        }else if(l.isSpecial() === 'lstm'){
            l.forget_weights = this.forget_weights.copy();
            l.forget_biases = this.forget_biases.copy();
            l.input_sigm_weights = this.input_sigm_weights.copy();
            l.input_sigm_biases = this.input_sigm_biases.copy();
            l.input_tanh_weights =this.input_tanh_weights.copy();
            l.input_tanh_biases = this.input_tanh_biases.copy();
        }else{
            console.error('needs special case here: '+ l.isSpecial())
        }
        return l;
    }

}