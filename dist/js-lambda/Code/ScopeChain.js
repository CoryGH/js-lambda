
class ScopeChain {
    constructor() {
        this._scopeChain = [];
        this._rootScope = { };
        this._scope = { };
        this._constants = [];
    }

    appendCodeElement(codeElement) {
        if (codeElement._scope !== null) {
            this.appendScope(codeElement._scope);
        }
        return (this._scope);
    }

    appendScope(scope) {
        for (let key in scope._scope) {
            if (scope._scope.hasOwnProperty(key)) {
                if (this._constants.indexOf(key) >= 0) { throw 'Constant variable [' + key + '] already defined.'; }
                //  if a higher level scoped variable exists save it from the active scope
                if (this._scope.hasOwnProperty(key)) {
                    let notHit = true;
                    for (let i = this._scopeChain.length - 1; i >= 0; i--) {
                        if (this._scopeChain[i]._scope.hasOwnProperty(key)) {
                            this._scopeChain[i]._scope[key] = this._scope[key];
                            notHit = false;
                            break;
                        }
                    }
                    if (notHit) { this._rootScope[key] = this._scope[key]; }
                    this._scope[key] = scope[key];
                } else {
                    if (scope._constants.indexOf(key) >= 0) { this._constants.push(key); }
                    this._scope[key] = scope._scope[key];
                }
            }
        }
        this._scopeChain.push(scope);
    }

    declareConstant(name, value) {
        if (this._scope.hasOwnProperty(name)) {
            if (this._constants.indexOf(name) >= 0) { throw 'Constant variable [' + name + '] cannot be redefined.'; }
            throw 'Variable [' + name + '] is already defined.';
        }
        let current = this._scopeChain.length - 1;
        if (current < 0) { this._rootScope[name] = value; }
        else {
            this._scopeChain[current]._constants.push(name);
            this._scopeChain[current]._scope[name] = value;
        }
        this._constants.push(name);
        this._scope[name] = value;
    }

    declareVariable(name, value) {
        if (this._scope.hasOwnProperty(name)) {
            if (this._constants.indexOf(name) >= 0) { throw 'Constant variable [' + name + '] cannot be redefined.'; }
            throw 'Variable [' + name + '] is already defined.';
        }
        let current = this._scopeChain.length - 1;
        if (current < 0) { this._rootScope[name] = value; }
        else { this._scopeChain[current]._scope[name] = value; }
        this._scope[name] = value;
    }

    deleteVariable(name) {
        if (!this._scope.hasOwnProperty(name)) { throw 'Variable [' + name + '] is not defined.'; }
        if (this._constants.indexOf(name) >= 0) { throw 'Constant variable [' + name + '] cannot be deleted.'; }
        let current = this._scopeChain.length - 1;
        if (current < 0) { delete this._rootScope[name]; }
        else { delete this._scopeChain[current]._scope[name]; }
        delete this._scope[name];
    }

    getValue(name) { return (this._scope[name]); }

    remove() {
        let scope = this._scope.pop();
        this.removeScope(scope);
    }

    removeScope(scope) {
        let removed = [];
        for (let key in scope._scope) {
            if (scope._scope.hasOwnProperty(key)) {
                if (this._scope.hasOwnProperty(key)) {
                    scope._scope[key] = this._scope[key];
                    delete this._scope[key];
                    let c = this._constants.indexOf(key);
                    if (c >= 0) { this._constants.splice(c, 1); }
                    removed.push(key);
                }
            }
        }
        for (let i = removed.length - 1; i >= 0; i--) {
            for (let s = this._scopeChain.length - 1; s >= 0; s--) {
                if (this._scopeChain[s]._scope.hasOwnProperty(removed[i])) {
                    this._scope[removed[i]] = this._scopeChain[s]._scope[removed[i]];
                    //  constants can't be added twice so no safety check needed
                }
            }
        }
    }

    scope() { return (this._scope); }

    setValue(name, value) {
        if (!this._scope.hasOwnProperty(name)) { throw 'Variable [' + name + '] is not defined.'; }
        if (this._constants.indexOf(name) >= 0) { throw 'Constant variable [' + name + '] cannot be changed.'; }
        let scope = null;
        for (let i = this._scopeChain.length - 1; i >= 0; i--) {
            if (this._scopeChain[i]._scope !== null) {
                if (this._scopeChain[i]._scope.hasOwnProperty(name)) {
                    this._scopeChain[i]._scope[name] = value;
                    this._scope[name] = value;
                    return (this._scope[name]);
                } else if (scope === null) {
                    scope = this._scopeChain[i]._scope;
                }
            }
        }
        if (this._scopeChain.hasOwnProperty(name)) {
            this._rootScope[name] = value;
            this._scope[name] = value;
            return (this._scope[name]);
        } else if (scope === null) { scope = this._rootScope; }
        scope[name] = value;
        this._scope[name] = value;
        return (this._scope[name]);
    }
}

//#region #ifdef NODEJS
module.exports = ScopeChain;
//#endregion #endif