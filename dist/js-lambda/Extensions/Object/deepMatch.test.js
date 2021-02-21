let deepMatch = require('./deepMatch.node.js');

describe('Object.deepMatch', () => {
    it('should check string', () => {
        let test = 'a';
        let check = 'a';
        let negatives = ['b', 2, null, undefined];
        expect(deepMatch(test, check)).toBe(true);
        negatives.forEach((value) => { expect(deepMatch(test, value)).toBe(false); });
    });
    it('should check number', () => {
        let test = 2;
        let check = 2;
        let negatives = ['a', 1, null, undefined];
        expect(deepMatch(test, check)).toBe(true);
        negatives.forEach((value) => { expect(deepMatch(test, value)).toBe(false); });
    });
    it('should check null', () => {
        let test = null;
        let check = null;
        let negatives = ['a', 2, undefined];
        expect(deepMatch(test, check)).toBe(true);
        negatives.forEach((value) => { expect(deepMatch(test, value)).toBe(false); });
    });
    it('should check undefined', () => {
        let test = undefined;
        let check = undefined;
        let negatives = ['1', 2, null];
        expect(deepMatch(test, check)).toBe(true);
        negatives.forEach((value) => { expect(deepMatch(test, value)).toBe(false); });
    });
    it('should check objects', () => {
        let test = { a: 1, b: 'b', c: 3.3 };
        let check = { a: 1, b: 'b', c: 3.3 };
        let negatives = [
            { a: 2, b: 'b', c: 3.3 },
            { a: 1, b: 'a', c: 3.3 },
            { a: 1, b: 'b', c: 1.2 }
        ];
        expect(deepMatch(test, check)).toBe(true);
        negatives.forEach((value) => { expect(deepMatch(test, value)).toBe(false); });
    });
    it('should check arrays', () => {
        let test = [1, 'b', 3.3];
        let check = [1, 'b', 3.3];
        let negatives = [
            [2, 'b', 3.3],
            [1, 'a', 3.3],
            [1, 'b', 1.2]
        ];
        expect(deepMatch(test, check)).toBe(true);
        negatives.forEach((value) => { expect(deepMatch(test, value)).toBe(false); });
    });
    it('should recurse into objects', () => {
        let test = { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 };
        let check = { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 };
        let negatives = [
            { a: 1, b: 'b', c: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 } },
            { a: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, b: 'b', c: 3.3 },
            { a: 1, b: { a: 1, b: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: 1, b: 'b', c: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } } }, c: 3.3 },
            { a: 1, b: { a: { a: { a: 1, b: 'b', c: 3.3 }, b: 'b', c: 3.3 }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: { a: 1, b: 'b', c: 3.3 }, c: 3.3 }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 2, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 2, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'a', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 2, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'a', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 1.2 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'a', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 1.2 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 1.2 },
            { b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 } },
            { a: 1, b: { b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b' }, c: 3.3 },
            { a: 1, b: { a: { b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b' }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b' } }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3 }, c: 3.3, d: 4 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 } }, b: 'b', c: 3.3, d: 4 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3 }, d: 4 }, b: 'b', c: 3.3 }, c: 3.3 },
            { a: 1, b: { a: { a: 1, b: 'b', c: { a: 1, b: 'b', c: 3.3, d: 4 } }, b: 'b', c: 3.3 }, c: 3.3 }
        ];
        expect(deepMatch(test, check)).toBe(true);
        negatives.forEach((value) => { expect(deepMatch(test, value)).toBe(false); });
    });
    it('should recurse arrays', () => {
        let test = [1, [[1, 'b', [1, 'b', 3.3]], 'b', 3.3], 3.3];
        let check = [1, [[1, 'b', [1, 'b', 3.3]], 'b', 3.3], 3.3];
        let negatives = [
            [2, [[1, 'b', [1, 'b', 3.3]], 'b', 3.3], 3.3],
            [1, [[2, 'b', [1, 'b', 3.3]], 'b', 3.3], 3.3],
            [1, [[1, 'a', [1, 'b', 3.3]], 'b', 3.3], 3.3],
            [1, [[1, 'b', [2, 'b', 3.3]], 'b', 3.3], 3.3],
            [1, [[1, 'b', [1, 'a', 3.3]], 'b', 3.3], 3.3],
            [1, [[1, 'b', [1, 'b', 1.2]], 'b', 3.3], 3.3],
            [1, [[1, 'b', [1, 'b', 3.3]], 'a', 3.3], 3.3],
            [1, [[1, 'b', [1, 'b', 3.3]], 'b', 1.2], 3.3],
            [1, [[1, 'b', [1, 'b', 3.3]], 'b', 3.3], 1.2],
            [[[1, 'b', [1, 'b', 3.3]], 'b', 3.3], 1, 3.3],
            [1, 3.3, [[1, 'b', [1, 'b', 3.3]], 'b', 3.3]],
            [1, ['b', [1, 'b', [1, 'b', 3.3]], 3.3], 3.3],
            [1, ['b', 3.3, [1, 'b', [1, 'b', 3.3]]], 3.3],
            [1, [[1, 'b', ['b', 1, 3.3]], 'b', 3.3], 3.3],
            [1, [[1, 'b', [1, 3.3, 'b']], 'b', 3.3], 3.3],
            [1, [[1, 'b', [1, 'b', 3.3]], 'b', 3.3], 3.3, 4],
            [1, [[1, 'b', [1, 'b', 3.3]], 'b', 3.3, 4], 3.3],
            [1, [[1, 'b', [1, 'b', 3.3], 4], 'b', 3.3], 3.3],
            [1, [[1, 'b', [1, 'b', 3.3, 4]], 'b', 3.3], 3.3],
            [1, 3.3],
            [1, ['b', 3.3], 3.3],
            [1, [[1, 'b'], 'b', 3.3], 3.3],
            [[[1, 'b', [1, 'b', 3.3]], 'b', 3.3], 3.3],
            [1, [[1, 'b', [1, 'b', 3.3]], 'b', 3.3]],
            [1, [[1, 'b', [1, 'b', 3.3]], 3.3], 3.3],
            [1, [[1, 'b', [1, 'b', 3.3]], 'b'], 3.3],
            [1, [['b', [1, 'b', 3.3]], 'b', 3.3], 3.3],
            [1, [[1, [1, 'b', 3.3]], 'b', 3.3], 3.3],
            [1, [[1, 'b', ['b', 3.3]], 'b', 3.3], 3.3],
            [1, [[1, 'b', [1, 3.3]], 'b', 3.3], 3.3],
            [1, [[1, 'b', [1, 'b']], 'b', 3.3], 3.3]
        ];
        expect(deepMatch(test, check)).toBe(true);
        negatives.forEach((value) => { expect(deepMatch(test, value)).toBe(false); });
    });
    it('should recurse into mixed objects and arrays', () => {
        let test = { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 };
        let check = { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 };
        let negatives = [
            [1, [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3], 3.3],
            { a: 1, b: ['b', { a: 1, b: 'b', c: [1, 'b', 3.3] }, 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 3.3, 'b'], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: ['b', 1, 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 3.3, 'b'] }, 'b', 3.3], c: 3.3 },
            { a: 2, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 2, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'a', c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [2, 'b', 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'a', 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 1.2] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'a', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 1.2], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3], c: 1.2 },
            { b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3] },
            { a: 1, b: ['b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b'], c: 3.3 },
            { a: 1, b: [{ b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b' }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: ['b', 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 3.3] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b'] }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3, d: 4 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3] }, 'b', 3.3, 4], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3], d: 4 }, 'b', 3.3], c: 3.3 },
            { a: 1, b: [{ a: 1, b: 'b', c: [1, 'b', 3.3, 4] }, 'b', 3.3], c: 3.3 }
        ];
        expect(deepMatch(test, check)).toBe(true);
        negatives.forEach((value) => { expect(deepMatch(test, value)).toBe(false); });
    });
    it('should support deep matching with recursive references', () => {
        let a = { a: 'a', b: null};
        let b = { a: a, b: 'b'};
        a.b = b;
        let test = { a: a, b: [{ a: 1, b: b, c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 };
        let ca = { a: 'a', b: null};
        let cb = { a: ca, b: 'b'};
        ca.b = cb;
        let check = { a: ca, b: [{ a: 1, b: cb, c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 };
        let na = { a: 'a', b: null};
        let nb = { a: na, b: 'b', c: 'c'};
        na.b = nb;
        let negative = { a: na, b: [{ a: 1, b: nb, c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 };
        let n2a = { b: null};
        let n2b = { a: n2a, b: 'b'};
        n2a.b = n2b;
        let negative2 = { a: n2a, b: [{ a: 1, b: n2b, c: [1, 'b', 3.3] }, 'b', 3.3], c: 3.3 };
        expect(deepMatch(test, check)).toBe(true);
        expect(deepMatch(test, negative)).toBe(false);
        expect(deepMatch(test, negative2)).toBe(false);
    });
});