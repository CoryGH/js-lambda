/***
 * @requirefiles {Code/CompilerObjectReference.js,Code/ICodeElement.js,Code/SwitchCase.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');
const SwitchCase = require('./SwitchCase.js');

const def = esprima.parse('new SwitchStatement(task, [], next, () => { return (discriminant); }, [cases])');
//#endregion #endif

class SwitchStatement extends ICodeElement {
    constructor(task, requires, next, discriminant, cases) {
        super(task, requires, next);
        this._discriminant = discriminant;
        this._cases = cases;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        SwitchStatement._main(this, this._task, this._discriminant, this._cases);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'check';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            SwitchStatement._main(this, this._task, this._discriminant, this._cases);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let discriminant = from.discriminant;
        let cases = [];
        let wrapper = JSON.parse(JSON.stringify(def));
        for (let i = 0; i < from.cases.length; i++) {
            cases.push(SwitchCase._create(from.cases[i]));
        }
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (node.name === 'discriminant') { ICodeElement._replace(((from.discriminant.type === 'BlockStatement') && (from.discriminant.body.length !== 1) ? parents[2] : parents[0]), node, discriminant); }
                else if (node.name === 'cases') { ICodeElement._replace(wrapper, parents[0], cases); }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(switchStatement, task, discriminant, cases) {
        switchStatement._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            switchStatement._schedulingTime.stop();
            return;
        }
        switch (switchStatement._stage) {
            case 'check':
                try {
                    switchStatement._runningTime.start();
                    if (discriminant()) {
                        switchStatement._runningTime.stop();
                        switchStatement._stage = 'cases';
                    } else {
                        switchStatement._stage = '';
                    }
                    switchStatement._schedulingTime.stop();
                    setTimeout(SwitchStatement._main, 0, switchStatement, task, discriminant, cases);
                } catch (ex) {
                    switchStatement._runningTime.stop();
                    switchStatement._schedulingTime.stop();
                    switchStatement.error(ex);
                }
                break;
            case 'cases':
                try {
                    switchStatement._runningTime.start();
                    cases();
                    switchStatement._runningTime.stop();
                    switchStatement._stage = 'complete';
                    switchStatement._schedulingTime.stop();
                    setTimeout(SwitchStatement._main, 0, switchStatement, task, discriminant, cases);
                } catch (ex) {
                    switchStatement._runningTime.stop();
                    switchStatement._schedulingTime.stop();
                    switchStatement.error(ex);
                }
                break;
            case 'complete':
                switchStatement.complete();
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = SwitchStatement;
//#endregion #endif