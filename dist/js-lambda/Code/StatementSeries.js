/***
 * @requirefiles {Code/CompilerObjectReference.js,Code/ICodeElement.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');

const defStatement = esprima.parse('() => { statement }');
const def = esprima.parse('new StatementSeries(task, [], next, [statements])');
//#endregion #endif

class StatementSeries extends ICodeElement {
    constructor(task, requires, next, statements) {
        super(task, requires, next);
        this._statements = statements;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        StatementSeries._main(this, this._task, this._statements);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 0;
        if (!this._task._paused) {
            this._schedulingTime.stop();
            StatementSeries._main(this, this._task, this._statements);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        if (from.length < 1) { return ([]); }
        let statements = [];
        let wrapper = JSON.parse(JSON.stringify(def));
        for (let i = 0; i < from.length; i++) {
            let statementWrapper = JSON.parse(JSON.stringify(defStatement));
            ICodeElement._traverse(statementWrapper, (parents, node) => {
                if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
                node.cooperative = true;
                if (node.type === 'Identifier') {
                    if (node.name === 'statement') { ICodeElement._replace(statementWrapper, ((from[i].type === 'BlockStatement') && (from[i].body.length !== 1) ? parents[2] : parents[0]), from[i]); }
                }
            });
            statementWrapper.baseType = 'ICodeElement';
            statements.push(statementWrapper.body[0].expression);
        }
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.type === 'Identifier') {
                if (node.name === 'statements') { ICodeElement._replace(wrapper, parents[1], { type: 'ArrayExpression', elements: statements }); }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([wrapper.body[0].expression]);
    }
    static _main(statementSeries, task, statements) {
        statementSeries._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            statementSeries._schedulingTime.stop();
            return;
        }
        if (statementSeries._stage === 'complete') {
            statementSeries.complete();
        } else {
            try {
                statementSeries._runningTime.start();
                statements[statementSeries._stage]();
                statementSeries._runningTime.stop();
                if (++statementSeries._stage >= statements.length) { statementSeries._stage = 'complete'; }
                statementSeries._schedulingTime.stop();
                setTimeout(StatementSeries._main, 0, statementSeries, task, test, statements);
            } catch (ex) {
                statementSeries._runningTime.stop();
                statementSeries._schedulingTime.stop();
                statementSeries.error(ex);
            }
        }
    }
}

//#region #ifdef NODEJS
module.exports = StatementSeries;
//#endregion #endif