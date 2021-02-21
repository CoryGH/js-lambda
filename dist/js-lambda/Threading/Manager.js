
//#region #ifdef NODEJS
const OS = require('os');
//#endregion #endif

class Manager {
    constructor(threadCount) {
        this._threads = [];
        if (arguments.length < 1) { threadCount = this.maxThreads; }
        this._spawnThreads(threadCount);
    }

    _spawnThreads(threadCount) {

    }
}

//#region #ifdef NODEJS
module.exports = Manager;
//#endregion #endif