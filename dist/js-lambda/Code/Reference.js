/***
 * @requirefiles {Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const Compiler = require('../Code/Compiler.js');
//#endregion #endif

class Reference {
    constructor(task, context, name, value) {
        this._task = task;
        this._context = context;
        this._name = name;
        if (arguments.length > 3) { this._context[name] = value; }
    }
    get() { return (this._context[this._name]); }
    set(value) { return (this._context[this._name] = value); }

    static _create(from, state) {
        let left = from.left;
        let right = from.right;
        let body = ((from.body.type === 'BlockStatement') && (from.body.body.length === 1) ? from.body.body[0] : from.body);
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.type === 'Identifier') {
                if (node.name === 'left') {
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
        wrapper.cooperative = true;
        return (wrapper.body[0]);
    }
}

//#region #ifdef NODEJS
module.exports = Reference;
//#endregion #endif