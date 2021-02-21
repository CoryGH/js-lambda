/***
 * @requirefiles {Threading/ICodeElement.js,Code/VariableDeclarator.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');
const VariableDeclarator = require('./VariableDeclarator.js');

const def = esprima.parse('new VariableDeclaration(task, [], next, [declarations], "kind")');
//#endregion #endif

class VariableDeclaration extends ICodeElement {
    constructor(task, requires, next, declarations, kind) {
        super(task, requires, next);
        this._declarations = declarations;
        this._kind = kind;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        VariableDeclaration._main(this, this._task, this._declarations, this._kind);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = -1;
        if (!this._task._paused) {
            this._schedulingTime.stop();
            VariableDeclaration._main(this, this._task, this._declarations, this._kind);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let kind = from.kind;
        let declarations = from.declarations;
        let temp = [];
        for (let i = 0; i < declarations.length; i++) {
            temp = temp.concat(VariableDeclarator._create(declarations[i], state));
        }
        for (let i = 0; i < temp.length; i++) {
            temp[i] = temp[i].created;
        }
        declarations = temp;
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (node.name === 'declarations') { ICodeElement._replace(wrapper, parents[0], declarations); }
            } else if (node.type === 'Literal') {
                if (node.value === 'kind') {
                    node.value = kind;
                    node.raw = '"' + kind.replace(/\"/g, '\\"');
                }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(variableDeclaration, task, declarations, kind) {
        variableDeclaration._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            variableDeclaration._schedulingTime.stop();
            return;
        }
        if (variableDeclaration._stage === 'complete') { variableDeclaration.complete(); }
        else {
            let index = parseInt(variableDeclaration._stage) + 1;
            if (index < declarations.length) {
                variableDeclaration._runningTime.start();
                declarations[index].start().then((result) => {
                    variableDeclaration._runningTime.stop();
                    variableDeclaration._stage = index;
                    variableDeclaration._schedulingTime.stop();
                    setTimeout(VariableDeclaration._main, 0, variableDeclaration, task, kind, declarations);
                }).catch((reason) => {
                    variableDeclaration._runningTime.stop();
                    variableDeclaration.error(reason);
                });
            } else {
                variableDeclaration._stage = 'complete';
            }
        }
    }
}

//#region #ifdef NODEJS
module.exports = VariableDeclaration;
//#endregion #endif