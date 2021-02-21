/**
 * Object extension utilized for deep matching of objects.
 * @param {*} a Object to be matched against.
 * @param {*} b Object to be matched.
 * @param {Array} [state] Internal state object.
 * @return {boolean}
 */
const deepMatch = function (a, b, state) {
    if (arguments.length > 2) {
        for (let i = state.length - 1; i >= 0; i--) {
            if ((state[i].a instanceof Object) && (state[i].b instanceof Object)) {
                if ((state[i].a === a) && (state[i].b === b)) {
                    return (true);
                }
            }
        }
    }
    if ((a instanceof Object) && (b instanceof Object)) {
        if (arguments.length < 3) { state = [{ a: a, b: b }]; }
        else { state.push({ a: a, b: b }); }
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) { return (false); }
            for (let i = 0; i < a.length; i++) { if (!deepMatch(a[i], b[i], state)) { return (false); } }
        }
        for (let key in a) {
            if (a.hasOwnProperty(key)) {
                if (!b.hasOwnProperty(key)) { return (false); }
                if ((parseInt(key).toString() !== key.toString()) || (parseInt(key) < 0) || (parseInt(key) >= a.length)) {
                    if (!deepMatch(a[key], b[key], state)) { return (false); }
                }
            }
        }
        for (let key in b) {
            if (b.hasOwnProperty(key)) {
                if (!a.hasOwnProperty(key)) { return (false); }
            }
        }
    } else {
        return (a === b);
    }
    return (true);
};

Object.defineProperty(Object.prototype, 'deepMatch', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (other) { return (deepMatch(this, other)); }
});

//#region #ifdef NODEJS
module.exports = deepMatch;
//#endregion #endif