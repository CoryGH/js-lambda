
class Semaphore {
    constructor() {
        this._semaphore = 0;
        this._awaiting = [];
    }

    BulkSynchronous(code) {
        return (new Promise((resolve, reject) => {
            if (this._semaphore++ > 1) { this._awaiting.push({ code: code, resolve: resolve, reject: reject }); }
            else {
                code((result) => {
                    setTimeout(() => { resolve(result); }, 0);
                    let awaiting = this._awaiting.shift();
                    while (awaiting !== undefined) {
                        setTimeout(() => { awaiting.resolve(result); }, 0);
                        awaiting = this._awaiting.shift();
                    }
                }, (reason) => {
                    setTimeout(() => { reject(reason); }, 0);
                    let awaiting = this._awaiting.shift();
                    while (awaiting !== undefined) {
                        setTimeout(() => { awaiting.reject(reason); }, 0);
                        awaiting = this._awaiting.shift();
                    }
                });
            }
        }));
    }

    Synchronous(code) {
        return (new Promise((resolve, reject) => {
            let self = this; setTimeout(() => {
                if (this._semaphore++ > 0) {
                    if (code === null) { resolve(); return; }
                    this._awaiting.push({ code: code, resolve: resolve, reject: reject });
                } else {
                    if (code === null) {
                        resolve();
                        let dequeued = this._awaiting.shift();
                        if (dequeued === undefined) { return; }
                        code = dequeued.code;
                        resolve = dequeued.resolve;
                        reject = dequeued.reject;
                    }
                    code(resolve, reject);
                    this._semaphore = 0;
                    if (this._awaiting.length > 0) {  self.Synchronous(null).then((result) => { }).catch((reason) => { }); }
                }
            }, 0);
        }));
    }
}

//#region #ifdef NODEJS
module.exports = Semaphore;
//#endregion #endif