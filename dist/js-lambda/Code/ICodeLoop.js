
//#region #ifdef NODEJS
const ICodeElement = require('./ICodeElement.js');
//#endregion #endif

class ICodeLoop extends ICodeElement {
    constructor(task, requires, next) {
        super(task, requires, next);
    }

    resume(previousResult) {
        super.resume.apply(this, arguments);
    }

    start(previousResult) {
        super.start.apply(this, arguments);
    }
}

//#region #ifdef NODEJS
module.exports = ICodeLoop;
//#endregion #endif