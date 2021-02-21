
//#region #ifdef NODEJS
const Semaphore = require('../Threading/Semaphore.js');
//#endregion #endif

class Stopwatch {
    constructor(initialTime) {
        this._average = BigInt(0);
        this._count = BigInt(0);
        this._times = [];
        this._semaphore = new Semaphore();
        this._next = (arguments.length > 0 ? initialTime : null);
    }

    get() {
        return (new Promise((resolve, reject) => {
            this._semaphore.BulkSynchronous((res, rej) => {
                let total = BigInt(0);
                let count = this._times.length;
                for (let i = BigInt(0); i < count; i++) { total += this._times[i]; }
                this._average = ((this._average * this._count) + total) / (this._count + BigInt(count));
                this._count = this._count + BigInt(count);
                this._times.splice(0, count);
                res(this._average);
            }).then((result) => { resolve(result); }).catch((reason) => { reject(reason); });
        }));
    }

    running() {
        return (this._next !== null);
    }

    start() {
        this._next = process.hrtime.bigint();
    }

    stop() {
        this._times.push(process.hrtime.bigint() - this._next);
        this._next = null;
    }
}

//#region #ifdef NODEJS
module.exports = Stopwatch;
//#endregion #endif