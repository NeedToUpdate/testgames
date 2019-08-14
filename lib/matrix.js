class Matrix {

    constructor(rows, cols) {

        if (rows instanceof Array) {
            this.rows = rows.length;
            if (typeof rows[0] === "number") {
                //console.log(rows);
                this.cols = 1;
                this.values = rows.map(x => [x]);
            } else {
                this.cols = rows[0].length;
                this.values = [];

                //deep copy the values
                Array(this.rows).fill().forEach((x, i) => {
                    this.values[i] = [];
                    Array(this.cols).fill().forEach((x, j) => {
                        this.values[i][j] = rows[i][j];
                    })
                });
            }


            //console.log(`Made new array with ${this.rows} rows and ${this.cols} columns`)
        } else {
            this.cols = cols;
            this.rows = rows;
            this.values = [];
            Array(rows).fill().forEach((x, i) => {
                this.values[i] = [];
                Array(cols).fill().forEach((x, j) => {
                    this.values[i][j] = 0;
                })
            })
        }
    }

    log() {
        //nicely prints to console
        console.table(this.values);
    }

    map(func) {
        //applies a function to each value in the matrix
        //not sure if i can do softmax here so need exception
        if (func instanceof Exception) { //dont want it to check too many things
            switch (func.name) {
                case 'softmax':
                    return this.softmax();
                case 'dsoftmax':
                    return this.d_softmax();
                default:
                    console.error(`no handler for this exception: ${func.name}`);
                    return this;
            }
        }
        this.values.forEach((arr,i)=>{
            arr.forEach((x,j)=>{
                this.values[i][j] = func(x,i,j);
            });
        });
        return this;
    }

    softmax() {
        let sumArr = this.flatten();
        let max = sumArr.reduce((a, b) => Math.max(a, b));
        let sum = sumArr.reduce((tot, x) => tot += Math.exp(x - max), 0);
        this.values.forEach((arr, i) => {
            arr.forEach((x, j) => {
                this.values[i][j] = Math.exp(this.values[i][j] - max) / sum;
            })
        });
        return this;
        // return arr.map(x=>(Math.exp(x-max)/sum));
    }
    static softmax(arr){
        let sumArr = arr;
        let max = sumArr.reduce((a, b) => Math.max(a, b));
        let sum = sumArr.reduce((tot, x) => tot += Math.exp(x - max), 0);
        return arr.map(x=>(Math.exp(x-max)/sum));
    }
    static d_softmax(arr){
        let sumArr = arr;
        let max = sumArr.reduce((a, b) => Math.max(a, b));
        let sum = sumArr.reduce((tot, x) => tot += Math.exp(x - max), 0);
        return arr.map(x=>{
            let e0 = Math.exp(x-max);
            return (e0*(sum-e0))/(sum*sum);
        });

    }
    d_softmax() {
        let sumArr = this.flatten();
        let max = sumArr.reduce((a, b) => Math.max(a, b));
        let e_sum = sumArr.reduce((tot, x) => tot += Math.exp(x - max), 0);
        this.values.forEach((arr, i) => {
            arr.forEach((x, j) => {
                let e0 = Math.exp(this.values[i][j] - max);
                this.values[i][j] = e0 * (e_sum - e0) / (e_sum * e_sum);
            })
        });
        return this;
    }

    flatten() {
        let sumArr = [];
        this.values.forEach(arr => {
            sumArr = sumArr.concat(arr);
        });
        return sumArr;
    }

    mapOne(func, i, j) {
        //applies function to one value in the matrix
        //function must take in one value and return one value
        this.values[i][j] = func(this.values[i][j]);
        return this;
    }


    add(n) {
        //elemntwise add
        if (n instanceof Matrix) {
            if (this.cols !== n.cols || this.rows !== n.rows) {
                console.error('Matrices must have same number of rows and columns to add pointwise');
                return undefined;
            }
            this.values.forEach((col, i) => {
                col.forEach((x, j) => {
                    this.values[i][j] += n.values[i][j];
                })
            });
            return this;
        } else {
            return this.map(x => x + n);
        }

    }

    static add(matrixA, matrixB) {
        //matrix add
        if (matrixA.cols !== matrixB.cols || matrixA.rows !== matrixB.rows) {
            console.error('Matrices must have same number of rows and columns');
            return undefined;
        }

        let a = matrixA.values;
        let b = matrixB.values;
        let c = [];
        a.forEach((arr, i) => {
            c[i] = [];
            arr.forEach((x, j) => {
                c[i][j] = a[i][j] + b[i][j];
            })
        });

        return new Matrix(c);
    }


    randomize(min, max) {
        //generates random numbers for each value
        //if none is set, then just random values from -1 to 1
        //if min-max is set then its found to those
        //if only one number then limit to that number
        function getRandomInt(min_, max_) {
            min_ = Math.ceil(min_);
            max_ = Math.floor(max_);
            return Math.floor(Math.random() * (max_ + 1 - min_)) + min_;
        }

        if (!arguments.length) {
            this.map(x => (1 - Math.random() * 2));
        } else if (arguments.length === 1) {
            this.map(x => Math.floor(Math.random() * (min + 1)));
        } else {
            this.map(x => getRandomInt(min, max));
        }
        return this;
    }

    //elementwise functions
    mult(n) {
        return this.multiply(n);
    }

    multiply(n) {

        if (n instanceof Matrix) {
            if (this.cols !== n.cols || this.rows !== n.rows) {
                console.error('Matrices must have same number of rows and columns to multiply pointwise');
                return undefined;
            }
            this.values.forEach((col, i) => {
                col.forEach((x, j) => {
                    this.values[i][j] *= n.values[i][j];
                })
            });
            return this;
        } else {
            return this.map(x => x * n);
        }
    }

    sub(n) {
        return this.subtract(n);
    }

    subtract(n) {
        if (n instanceof Matrix) {
            if (this.cols !== n.cols || this.rows !== n.rows) {
                console.error('Matrices must have same number of rows and columns to subtract pointwise');
                return undefined;
            }
            this.values.forEach((col, i) => {
                col.forEach((x, j) => {
                    this.values[i][j] -= n.values[i][j];
                })
            });
            return this;
        } else {
            return this.map(x => x - n);
        }
    }

    static subtract(matrixA, matrixB) {
        return this.add(matrixA, matrixB.copy().mult(-1));
    }

    divide(n) {
        if (n === 0) {
            return undefined;
        }
        return this.multiply(1 / n);
    }

    transpose(copy) {
        let tmp = new Matrix(this.cols, this.rows);

        tmp.values.forEach((row, i) => {
            row.forEach((x, j) => {
                tmp.values[i][j] = this.values[j][i];
            })
        });


        if (copy) {
            return tmp;
        } else {
            this.cols = tmp.cols;
            this.rows = tmp.rows;
            this.values = tmp.values;
            return this;
        }
    }

    static multiply(matrixA, matrixB) {
        if (matrixA.cols !== matrixB.rows) {
            console.error('matrix A\'s rows must match matrix B\'s colums');
            return undefined;
        }
        let result = new Array(matrixA.values.length).fill(0).map(row => new Array(matrixB.values[0].length).fill(0));

        let c = result.map((row, i) => {
            return row.map((val, j) => {
                return matrixA.values[i].reduce((sum, elm, k) => sum + (elm * matrixB.values[k][j]), 0)
            })
        });

        return new Matrix(c);
    }

    static dot(a, b) {
        let c = [];
        a.forEach((x, i) => {
            c[i] = x * b[i];
        });
        return c.reduce((t, x) => t + x);

    }

    copy() {
        //return an new copy
        return new Matrix(this.values);
    }

    toArray() {

        let arr = [];
        if (this.cols === 1) {
            this.values.forEach(x => arr.push(x[0]));

        } else {
            this.values.forEach((col, i) => {
                col.forEach((x, j) => {
                    arr.push(this.values[i][j]);
                })
            });
        }

        return arr;
    }

    //todo add broadcasting (expand aray to fit size)
}

class Exception { //used for functions that cant be solved by Matrix.map()
                  //currently just softmax and dsoftmax
    constructor(string) {
        this.name = string;
    }

}