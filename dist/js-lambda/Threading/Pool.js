/***
 * @requirefiles {Threading/IThread.js}
 */

//#region #ifdef NODEJS
const Diagnostics = require('../../Diagnostics/');
const Event = require('../Event.node.js');
const Iterator = require('../Iterator.node.js');
const IThread = require('./IThread.node.js');
const Thread = require('./IThread.node.js');
const OS = require('os');
//#endregion #endif

class Pool extends Array {
    constructor(name) {
        super();
        this._name = name;
        this._closing = false;
        this._iterator = new Iterator();
        this.Closed = new Event(this, {
            Cancellable: false,
            ReturnAllResults: false,
            Stoppable: false,
            SyncWhenAsync: false
        });
        this.ThreadCreated = new Event(this, {
            Cancellable: false,
            ReturnAllResults: false,
            Stoppable: false,
            SyncWhenAsync: false
        });
        this.ThreadClosed = new Event(this, {
            Cancellable: false,
            ReturnAllResults: false,
            Stoppable: false,
            SyncWhenAsync: false
        });
        this.ThreadClosed.bind(this, () => {
            if (this._closing) {
                if (this.length < 1) { this.Closed.emit(); }
            }
        });
    }

    get maxThreads() {
        //#region #ifdef NODEJS
        return (OS.cpus().length || 4);
        //#else
        return (navigator.hardwareConcurrency || 4);
        //#endregion #endif
    }

    Close(force) {
        this._closing = true;
        return (new Promise((resolve, reject) => {
            let threads = [];
            for (let i = this.length - 1; i >= 0; i--) threads.push(this[i].Close(force === true));
            Promise.all(threads).then((values) => { resolve(); }).catch((reason) => { reject(reason); });
        }));
    }
    Spawn(affinity) {
        return (new Promise((resolve, reject) => {
            try {
                if (this._closing) resolve('pool closing');
                this._iterator.getNextId().then((id) => {
                    try {
                        var ret = new Thread(id, this, (affinity === undefined ? -1 : affinity));
                        this.push(ret);
                        this['k' + ret.threadID.toString()] = ret;
                        if (this._closing) {
                            ret.Close(true, this._manager.localID);
                            resolve('pool closing');
                        } else resolve(ret);
                    } catch (ex) {
                        console.log(ex);
                        reject(E.Throw('THREADSPAWN', 'ICE.Threading.Managed.Pool.Spawn', 'Review the stack trace for more information.', ex));
                    }
                }).catch((reason) => {
                    reject(E.Throw('THREADSPAWN', 'ICE.Threading.Managed.Pool.Spawn', 'Review the stack trace for more information.', reason));
                });
            } catch (ex) {
                console.log(1, reason.stack);
                reject('ICE.Threading.Managed.Pool.Spawn: ' + ex);
            }
        }));
    }
}

//#region #ifdef NODEJS
module.exports = Pool;
//#endregion #endif