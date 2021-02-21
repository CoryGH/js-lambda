/***
 * @requirefiles {Code/ICodeElement.js,Code/CompilerObjectReference.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');

const def = esprima.parse('new Property(task, [], next, () => { with (task._scopeChain._scope) { return (key); } }, () => { with (task._scopeChain._scope) { return (value); } }, computed, kind, method, shorthand)');
//#endregion #endif

class Property extends ICodeElement {
    constructor(task, requires, next, keyCalculator, valueCalculator, computed, kind, method, shorthand) {
        super(task, requires, next);
        this._keyCalculator = keyCalculator;
        this._valueCalculator = valueCalculator;
        this._computed = computed;
        this._kind = kind;
        this._method = method;
        this._shorthand = shorthand;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        Property._main(this, this._task, this._keyCalculator, this._valueCalculator, this._computed, this._kind, this._method, this._shorthand);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'key';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            Property._main(this, this._task, this._keyCalculator, this._valueCalculator, this._computed, this._kind, this._method, this._shorthand);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let key = from.key;
        let computed = ICodeElement._valueToLiteral(from.computed);
        let value = from.value;
        let kind = ICodeElement._valueToLiteral(from.kind);
        let method = ICodeElement._valueToLiteral(from.method);
        let shorthand = ICodeElement._valueToLiteral(from.shorthand);
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (node.name === 'key') { ICodeElement._replace(((from.key !== null) && (from.key.type === 'BlockStatement') && (from.key.body.length !== 1) ? parents[2] : parents[0]), node, key); }
                else if (node.name === 'computed') { ICodeElement._replace(((from.computed !== null) && (from.computed.type === 'BlockStatement') && (from.computed.body.length !== 1) ? parents[2] : parents[0]), node, computed); }
                else if (node.name === 'value') {
                    ICodeElement._replace(((from.value !== null) && (from.value.type === 'BlockStatement') && (from.value.body.length !== 1) ? parents[2] : parents[0]), node, value);
                }
                else if (node.name === 'kind') { ICodeElement._replace(((from.kind !== null) && (from.kind.type === 'BlockStatement') && (from.kind.body.length !== 1) ? parents[2] : parents[0]), node, kind); }
                else if (node.name === 'method') { ICodeElement._replace(((from.method !== null) && (from.method.type === 'BlockStatement') && (from.method.body.length !== 1) ? parents[2] : parents[0]), node, method); }
                else if (node.name === 'shorthand') { ICodeElement._replace(((from.shorthand !== null) && (from.shorthand.type === 'BlockStatement') && (from.shorthand.body.length !== 1) ? parents[2] : parents[0]), node, shorthand); }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return (wrapper.body[0].expression);
    }
    static _main(objectExpressionProperty, task, keyCalculator, valueCalculator, computed, kind, method, shorthand, key, value) {
        objectExpressionProperty._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            objectExpressionProperty._schedulingTime.stop();
            return;
        }
        switch (objectExpressionProperty._stage) {
            case 'key':
                try {
                    objectExpressionProperty._runningTime.start();
                    key = keyCalculator();
                    objectExpressionProperty._runningTime.stop();
                    objectExpressionProperty._stage = 'value';
                    objectExpressionProperty._schedulingTime.stop();
                    setTimeout(Property._main, 0, objectExpressionProperty, task, keyCalculator, valueCalculator, computed, kind, method, shorthand, key, value);
                } catch (ex) {
                    objectExpressionProperty._runningTime.stop();
                    objectExpressionProperty._schedulingTime.stop();
                    objectExpressionProperty.error(ex);
                }
                break;
            case 'value':
                try {
                    objectExpressionProperty._runningTime.start();
                    value = valueCalculator();
                    objectExpressionProperty._runningTime.stop();
                    objectExpressionProperty._stage = 'complete';
                    objectExpressionProperty._schedulingTime.stop();
                    setTimeout(Property._main, 0, objectExpressionProperty, task, keyCalculator, valueCalculator, computed, kind, method, shorthand, key, value);
                } catch (ex) {
                    objectExpressionProperty._runningTime.stop();
                    objectExpressionProperty._schedulingTime.stop();
                    objectExpressionProperty.error(ex);
                }
                break;
            case 'complete':
                objectExpressionProperty._runningTime.start();
                this._previousResult[key] = value;
                objectExpressionProperty._runningTime.stop();
                objectExpressionProperty.complete(this._previousResult);
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = Property;
//#endregion #endif