
class Scope {
    constructor() {
        this._scope = { };
        this._constants = [];
    }

    declareConstant(name, value) {
        if (this._scope.hasOwnProperty(name)) {
            if (this._constants.indexOf(name) >= 0) { throw 'Constant variable [' + name + '] cannot be redefined.'; }
            throw 'Variable [' + name + '] is already defined.';
        }
        this._constants.push(name);
        this._scope[name] = value;
    }

    declareVariable(name, value) {
        if (this._scope.hasOwnProperty(name)) {
            if (this._constants.indexOf(name) >= 0) { throw 'Constant variable [' + name + '] cannot be redefined.'; }
            throw 'Variable [' + name + '] is already defined.';
        }
        this._scope[name] = value;
    }

    deleteVariable(name) {
        if (!this._scope.hasOwnProperty(name)) { throw 'Variable [' + name + '] is not defined.'; }
        if (this._constants.indexOf(name) >= 0) { throw 'Constant variable [' + name + '] cannot be deleted.'; }
        delete this._scope[name];
    }

    getValue(name) { return (this._scope[name]); }

    scope() { return (this._scope); }

    setValue(name, value) {
        if (!this._scope.hasOwnProperty(name)) { throw 'Variable [' + name + '] is not defined.'; }
        if (this._constants.indexOf(name) >= 0) { throw 'Constant variable [' + name + '] cannot be changed.'; }
        this._scope[name] = value;
    }
}

//#region #ifdef NODEJS
module.exports = Scope;
//#endregion #endif