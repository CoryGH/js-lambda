/***
 * @requirefiles {Threading/ITaskRunner.js,Code/ScopeChain.js}
 */

//#region #ifdef NODEJS
const ITaskRunner = require('./ITaskRunner.js');
const ScopeChain = require('../Code/ScopeChain.js');
//#endregion #endif

class CodeTaskRunner extends ITaskRunner {
    constructor(code) {
        super();
        this._callStack = [];
        this._scopeChain = new ScopeChain();
        this._code = code;
        this._debugging = false;
        this._root = CodeTaskRunner.parseCode(code);
    }

    get Debugging() { return (this._debugging); }

    Debug() {
        if (this._root === null) { return; }
        this._paused = false;
        if (this._halted) {
            if (!this._debugging) { throw 'Cannot debug running code!'; }
            this._halted = false;
            let temp = this._root;
            if (this._callStack.length > 0) { temp = this._callStack[this._callStack.length - 1]; }
            if (temp instanceof ICodeElement) {
                switch (temp._stage) {
                    case 'start':
                        temp.start();
                        break;
                    case 'resume':
                        temp.resume();
                        break;
                    case 'complete':
                        temp.complete();
                        break;
                }
            } else {
                throw 'Unrecognized code!';
            }
        } else if (this._complete || (!this._running)) {
            this._complete = false;
            this._debugging = true;
            this._running = true;
            if (this._root instanceof ICodeElement) {
                this._root.start();
            } else {
                throw 'Unrecognized code!';
            }
        }
    }

    Pause() {
        this._paused = true;
    }

    Run() {
        if (this._root === null) { return; }
        this._paused = false;
        if (this._halted) {
            this._halted = false;
            let temp = this._root;
            if (this._callStack.length > 0) { temp = this._callStack[this._callStack.length - 1]; }
            if (temp instanceof ICodeElement) {
                switch (temp._stage) {
                    case 'start':
                        temp.start();
                        break;
                    case 'resume':
                        temp.resume();
                        break;
                    case 'complete':
                        temp.complete();
                        break;
                }
            } else {
                throw 'Unrecognized code!';
            }
        } else if (this._complete || (!this._running)) {
            this._complete = false;
            this._running = true;
            if (this._root instanceof ICodeElement) {
                this._root.start();
            } else {
                throw 'Unrecognized code!';
            }
        }
    }

    static parseCode(code) {
        return (null);
    }
}

//#region #ifdef NODEJS
module.exports = CodeTaskRunner;
//#endregion #endif