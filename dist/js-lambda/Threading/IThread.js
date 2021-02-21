
class IThread {
    constructor() {
        this._affinity = affinity;
        this._tasks = [];
    }
}

//#region #ifdef NODEJS
module.exports = IThread;
//#endregion #endif