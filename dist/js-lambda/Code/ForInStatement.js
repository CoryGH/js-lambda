/***
 * @requirefiles {Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const Compiler = require('../Code/Compiler.js');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');
const ICodeLoop = require('./ICodeLoop.js');

const def = esprima.parse('new ForInStatement(task, [], next, leftHolder, left, right, () => {body})');
//#endregion #endif

class ForInStatement extends ICodeLoop {
    constructor(task, requires, next, leftHolder, left, right, body) {
        super(task, requires, next);
        this._leftHolder = leftHolder;
        this._left = left;
        this._right = right;
        this._iterator = null;
        this._body = body;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        ForInStatement._main(this, this._task, this._leftHolder, this._left, this._right, this._iterator, this._body);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'init';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            ForInStatement._main(this, this._task, this._leftHolder, this._left, this._right, this._iterator, this._body);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let left = from.left;
        let right = from.right;
        let body = ((from.body.type === 'BlockStatement') && (from.body.body.length === 1) ? from.body.body[0] : from.body);
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (node.name === 'left') {
                    switch (left.type) {
                        case 'ComputedMemberExpression':

                            break;
                        case 'Identifier':

                            break;
                        case 'VariableDeclaration':

                            break;
                    }
                    if (left === null) {
                        ICodeElement._replace(parents[2], parents[1], []);
                    } else {
                        ICodeElement._replace(((from.left.type === 'BlockStatement') && (from.left.body.length !== 1) ? parents[2] : parents[0]), node, left);
                    }
                } else if (node.name === 'right') {
                    if (right === null) {
                        ICodeElement._replace(parents[2], parents[1], []);
                    } else {
                        ICodeElement._replace(((from.right.type === 'BlockStatement') && (from.right.body.length !== 1) ? parents[2] : parents[0]), node, right);
                    }
                } else if (node.name === 'body') { ICodeElement._replace(wrapper, ((from.body.type === 'BlockStatement') && (from.body.body.length !== 1) ? parents[2] : parents[0]), body); }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static *_looper(source) {
        for (let item in source) {
            yield item;
        }
    }
    static _main(forInStatement, task, leftHolder, left, right, iterator, body) {
        forInStatement._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            forInStatement._schedulingTime.stop();
            return;
        }
        switch (forInStatement._stage) {
            case 'init':
                try {
                    forInStatement._runningTime.start();
                    forInStatement._iterator = ForInStatement._looper(right);
                    forInStatement._runningTime.stop();
                    forInStatement._stage = 'fetch';
                    forInStatement._schedulingTime.stop();
                    setTimeout(forInStatement._main, 0, forInStatement, task, leftHolder, left, right, forInStatement._iterator, body);
                } catch (ex) {
                    forInStatement._runningTime.stop();
                    forInStatement._schedulingTime.stop();
                    forInStatement.error(ex);
                }
                break;
            case 'fetch':
                try {
                    forInStatement._runningTime.start();
                    let value = iterator.next();
                    if (value.done) {
                        forInStatement._runningTime.stop();
                        forInStatement._stage = 'complete';
                    } else {
                        leftHolder[left] = value.value;
                        forInStatement._runningTime.stop();
                        forInStatement._stage = 'loop';
                    }
                    forInStatement._schedulingTime.stop();
                    setTimeout(forInStatement._main, 0, forInStatement, task, leftHolder, left, right, iterator, body);
                } catch (ex) {
                    forInStatement._runningTime.stop();
                    forInStatement._schedulingTime.stop();
                    forInStatement.error(ex);
                }
                break;
            case 'loop':
                try {
                    forInStatement._runningTime.start();
                    body();
                    forInStatement._runningTime.stop();
                    forInStatement._stage = 'fetch';
                    forInStatement._schedulingTime.stop();
                    setTimeout(forInStatement._main, 0, forInStatement, task, leftHolder, left, right, iterator, body);
                } catch (ex) {
                    forInStatement._runningTime.stop();
                    forInStatement._schedulingTime.stop();
                    forInStatement.error(ex);
                }
                break;
            case 'complete':
                forInStatement.complete();
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = ForInStatement;
//#endregion #endif