/***
 * @requirefiles {Code/CompilerObjectReference.js,Code/ICodeElement.js,Code/Property.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');
const Property = require('./Property.js');

const def = esprima.parse('new ObjectExpression(task, [], next, [properties])');
//#endregion #endif

class ObjectExpression extends ICodeElement {
    constructor(task, requires, next, properties) {
        super(task, requires, next);
        this._properties = properties;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        ObjectExpression._main(this, this._task, this._properties);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'init';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            ObjectExpression._main(this, this._task, this._properties);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let properties = [];
        let wrapper = JSON.parse(JSON.stringify(def));
        for (let i = 0; i < from.properties.length; i++) {
            properties.push(Property._create(from.properties[i]));
        }
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (node.name === 'properties') { ICodeElement._replace(wrapper, parents[0], properties); }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(objectExpression, task, properties, obj) {
        objectExpression._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            objectExpression._schedulingTime.stop();
            return;
        }
        if (objectExpression._stage === 'init') {
            try {
                objectExpression._runningTime.start();
                obj = { };
                objectExpression._runningTime.stop();
                objectExpression._stage = 0;
                objectExpression._schedulingTime.stop();
                setTimeout(ObjectExpression._main, 0, objectExpression, task, properties, obj);
            } catch (ex) {
                objectExpression._runningTime.stop();
                objectExpression._schedulingTime.stop();
                objectExpression.error(ex);
            }
        } else if ((typeof Number(objectExpression._stage) === 'number') && ((Number(objectExpression._stage) % 1) === 0)) {
            if (objectExpression._stage < properties.length) {
                properties[objectExpression._stage].next = (objR) => {
                    objectExpression._stage++;
                    if (objectExpression._stage >= properties.length) {
                        objectExpression._stage = 'complete';
                    }
                    objectExpression._schedulingTime.stop();
                    setTimeout(ObjectExpression._main, 0, objectExpression, task, properties, objR);
                };
                properties[objectExpression._stage].start(obj);
            } else {
                objectExpression._stage = 'complete';
                objectExpression._schedulingTime.stop();
                setTimeout(ObjectExpression._main, 0, objectExpression, task, properties, obj);
            }
        } else if (objectExpression._stage === 'complete') {
            objectExpression.complete(obj);
        }
    }
}

//#region #ifdef NODEJS
module.exports = ObjectExpression;
//#endregion #endif