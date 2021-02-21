/***
 * @requirefiles {Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const ICodeElement = require('./ICodeElement.js');

const def = esprima.parse('new CompilerObjectReference("id")');
//#endregion #endif

class CompilerObjectReference {
    constructor(id) {
        this.id = id;
    }
    static _create(id) {
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            node.cooperative = true;
            if (node.type === 'Literal') {
                if (node.value === 'id') {
                    node.value = id;
                    node.raw = id.toString();
                }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return (wrapper.body[0].expression);
    }
}

//#region #ifdef NODEJS
module.exports = CompilerObjectReference;
//#endregion #endif