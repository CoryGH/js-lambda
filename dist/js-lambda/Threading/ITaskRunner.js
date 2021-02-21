/***
 * @requirefiles {Threading/CallStack.js,Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const ScopeChain = require('../Code/ScopeChain.js');
const ICodeElement = require('../Code/ICodeElement.js');
//#endregion #endif

class ITaskRunner {
    constructor() {
        this._complete = false;
        this._halted = true;
        this._paused = false;
        this._running = false;
        this._root = null;
        //#region #ifdef NODEJS

        //#else
        this._webWorker = null;
        //#endregion #endif
    }

    get Complete() { return (this._complete); }
    get Halted() { return (this._halted); }
    get Paused() { return (this._paused); }
    get Running() { return (this._running); }

    _finalize(result) {
        this._complete = true;
        this._halted = false;
        this._paused = false;
        this._running = false;
    }

    Debug() { throw 'ITaskRunner.Debug() is not implemented!'; }
    Pause() { throw 'ITaskRunner.Pause() is not implemented!'; }
    Run() { throw 'ITaskRunner.Run() is not implemented!'; }
}

//#region #ifdef NODEJS
module.exports = ITaskRunner;
//#endregion #endif