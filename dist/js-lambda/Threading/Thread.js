/***
 * @requirefiles {Threading/IThread.js}
 */

//#region #ifdef NODEJS
const IThread = require('./IThread.js');
//#endregion #endif

class Thread extends IThread {
    constructor(id, pool, affinity) {
        super(affinity);
        this._id = id;
        this._pool = pool;
    }
}

//#region #ifdef NODEJS
module.exports = Thread;
//#endregion #endif