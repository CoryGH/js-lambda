/***
 * @requirefiles {Threading/ITask.js}
 */

//#region #ifdef NODEJS
const ITask = require('./ITask.js');
//#endregion #endif

class Fiber extends ITask {
    constructor() {
        super();

    }
}

//#region #ifdef NODEJS
module.exports = Fiber;
//#endregion #endif