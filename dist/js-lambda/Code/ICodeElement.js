
//#region #ifdef NODEJS
const Stopwatch = require('./Stopwatch.js');
//#endregion #endif

class ICodeElement {
    constructor(task, requires, next) {
        this._schedulingTime = new Stopwatch(process.hrtime.bigint());
        this._runningTime = new Stopwatch();
        this._previousResult = undefined;
        this._scope = null;
        this._task = task;
        this._stage = 'start';
        this._requires = requires;
        this._next = next;
    }
    complete(result) {
        this._task._running = true;
        this._task._callStack.remove();
        if (this._task._paused) {
            this._task._halted = true;
            return;
        }
        if (this._next === null) {
            this._schedulingTime.stop();
            this._task._finalize(result);
        } else if (this._next instanceof ICodeElement) {
            this._schedulingTime.stop();
            this._next.start(result);
        } else if (this._next instanceof Function) {
            this._schedulingTime.stop();
            this._next(result);
        } else {
            this._schedulingTime.stop();
            throw 'Next operation not defined.';
        }
    }
    error(reason) {
        this._schedulingTime.stop();
        this._reject(reason);
    }
    resume(previousResult) {
        this._schedulingTime.start();
        if (arguments.length > 0) { this._previousResult = previousResult; }
        this._task._running = true;
        this._schedulingTime.stop();
    }
    runningTime() { return (this._runningTime.get()); }
    schedulingTime() { return (this._schedulingTime.get()); }
    start(previousResult) {
        this._schedulingTime.start();
        if (arguments.length > 0) { this._previousResult = previousResult; }
        this._task._running = true;
        this._task._callStack.append(this);
    }

    static _findNodes(rootNode, search, func) {
        let retNodes = [];
        let retParents = [];
        let retOnly = (arguments.length < 3);
            ICodeElement._traverse(rootNode, (parents, node) => {
            for (let key in search) {
                if (search.hasOwnProperty(key)) {
                    if (!node.hasOwnProperty(key)) { return; }
                    if (node[key] !== search[key]) { return; }
                }
            }
            if (!retOnly) {
                if (func(parents, node)) {
                    retNodes.push(node);
                    retParents.push({node: node, parents: parents});
                }
            } else {
                retNodes.push(node);
                retParents.push({node: node, parents: parents});
            }
        });
        return ({ nodes: retNodes, nodesAndParents: retParents });
    }

    static _remove(parent, oldNode, breakEarly) {
        if (arguments.length < 3) { breakEarly = { breakEarly: false }; }
        for (let key in parent) {
            if (breakEarly.breakEarly === true) { return; }
            if (parent.hasOwnProperty(key)) {
                let child = parent[key];
                if (child === oldNode) {
                    breakEarly.breakEarly = true;
                    delete parent[key];
                    return;
                }
                if (((typeof child) === 'object') && (child !== null)) {
                    ICodeElement._replace(child, oldNode, newNode);
                }
            }
        }
    }

    static _replace(parent, oldNode, newNode, breakEarly) {
        if (arguments.length < 4) { breakEarly = { breakEarly: false }; }
        for (let key in parent) {
            if (breakEarly.breakEarly === true) { return; }
            if (parent.hasOwnProperty(key)) {
                let child = parent[key];
                if (child === oldNode) {
                    breakEarly.breakEarly = true;
                    parent[key] = newNode;
                    return;
                }
                if (((typeof child) === 'object') && (child !== null)) {
                    ICodeElement._replace(child, oldNode, newNode);
                }
            }
        }
    }

    static _splice(parent, oldNode, newNodes, breakEarly) {
        if (arguments.length < 4) { breakEarly = { breakEarly: false }; }
        for (let key in parent) {
            if (breakEarly.breakEarly === true) { return; }
            if (parent.hasOwnProperty(key)) {
                let child = parent[key];
                if (child === oldNode) {
                    if (parent instanceof Array) {
                        breakEarly.breakEarly = true;
                        Array.prototype.splice.apply(parent, [parseInt(key), 1].concat(newNodes));
                        return;
                    }
                }
                if (((typeof child) === 'object') && (child !== null)) {
                    ICodeElement._splice(child, oldNode, newNodes);
                }
            }
        }
    }

    static _checkForType(nodes, type, func) {
        for (let i = nodes.length - 1; i >= 1; i--) {
            if (nodes[i] instanceof type) {
                func(i, nodes[i]);
            }
        }
    }

    static _getFirstOfType(nodes, type, func) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] instanceof type) {
                func(i, nodes[i]);
                return;
            }
        }
    }

    static _getLastOfType(nodes, type, func) {
        for (let i = nodes.length - 1; i >= 1; i--) {
            if (nodes[i] instanceof type) {
                func(i, nodes[i]);
                return;
            }
        }
    }

    static _crossReference(nodes, func) {
        for (let i = nodes.length - 1; i >= 1; i--) {
            for (let j = i - 1; j >= 0; j--) {
                ICodeElement._traverse(nodes[i], (parentsS, nodeS) => {
                    ICodeElement._traverse(nodes[j], (parentsF, nodeF) => {
                        if (nodeF === nodeS) {
                            func(j, parentsF, nodeF, i, parentsS, nodeS);
                        }
                    });
                });
            }
        }
    }

    static _traverse(node, func, parents) {
        if (arguments.length < 3) { parents = []; }
        func(parents, node);
        parents = parents.slice();
        parents.unshift(node);
        for (let key in node) {
            if (node.hasOwnProperty(key)) {
                let child = node[key];
                if (((typeof child) === 'object') && (child !== null)) {
                    if (Array.isArray(child)) {
                        let temp = parents.slice();
                        temp.unshift(child);
                        child.forEach((cNode) => { ICodeElement._traverse(cNode, func, temp); });
                    } else {
                        ICodeElement._traverse(child, func, parents);
                    }
                }
            }
        }
    }

    static _traverseInsideOut(node, func, parents) {
        if (arguments.length < 3) { parents = []; }
        let nParents = parents.slice();
        nParents.unshift(node);
        for (let key in node) {
            if (node.hasOwnProperty(key)) {
                let child = node[key];
                if (((typeof child) === 'object') && (child !== null)) {
                    if (Array.isArray(child)) {
                        let temp = nParents.slice();
                        temp.unshift(child);
                        for (let i = child.length - 1; i >= 0; i--) { ICodeElement._traverseInsideOut(child[i], func, temp); }
                    } else {
                        ICodeElement._traverseInsideOut(child, func, nParents);
                    }
                }
            }
        }
        func(parents, node);
    }

    static _traverseInsideOutDual(nodes, func, parents) {
        if (arguments.length < 3) { parents = [[], []]; }
        let nParents = [parents[0].slice(), parents[1].slice()];
        nParents[0].unshift(nodes[0]);
        nParents[1].unshift(nodes[1]);
        for (let key in nodes[0]) {
            if (nodes[0].hasOwnProperty(key)) {
                let children = [nodes[0][key], nodes[1][key]];
                if (((typeof children[0]) === 'object') && (children[0] !== null)) {
                    if (Array.isArray(children[0])) {
                        let temp = [nParents[0].slice(), nParents[1].slice()];
                        temp[0].unshift(children[0]);
                        temp[1].unshift(children[1]);
                        for (let subKey in children[0]) {
                            if (children[0].hasOwnProperty(subKey)) {
                                ICodeElement._traverseInsideOutDual([children[0][subKey], children[1][subKey]], func, temp);
                            }
                        }
                    } else {
                        ICodeElement._traverseInsideOutDual(children, func, nParents);
                    }
                }
            }
        }
        func(parents, nodes);
    }

    static _valueToLiteral(value) {
        if (value === undefined) {
            return ({
                "type": "Identifier",
                "name": "undefined"
            });
        }
        if (value === null) {
            return ({
                "type": "Literal",
                "value": null,
                "raw": "null"
            });
        }
        if (value === false) {
            return ({
                "type": "Literal",
                "value": false,
                "raw": "false"
            });
        }
        if (value === true) {
            return ({
                "type": "Literal",
                "value": true,
                "raw": "true"
            });
        }
        if ((value instanceof Object) && value.hasOwnProperty('type')) {
            switch (value.type) {
                case 'Literal':
                    return (value);
                case 'Identifier':
                    return (value);
            }
        }
        return ({
            "type": "Literal",
            "value": value,
            "raw": value.toString()
        });
    }
}

//#region #ifdef NODEJS
module.exports = ICodeElement;
//#endregion #endif