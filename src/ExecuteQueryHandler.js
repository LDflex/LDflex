"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Executes the query represented by a path.
 *
 * Requires:
 * - a queryEngine property in the path settings
 * - a sparql property on the path proxy
 * - (optional) a resultsCache property on the path data
 */
class ExecuteQueryHandler {
    handle(pathData, path) {
        return __asyncGenerator(this, arguments, function* handle_1() {
            var e_1, _a;
            // Try to retrieve the result from cache
            const resultsCache = yield __await(pathData.resultsCache);
            if (resultsCache) {
                for (const result of resultsCache)
                    yield yield __await(result);
                return yield __await(void 0);
            }
            // Retrieve the query engine and query
            const { queryEngine } = pathData.settings;
            if (!queryEngine)
                throw new Error(`${pathData} has no queryEngine setting`);
            const query = yield __await(path.sparql);
            if (query === null || query === undefined)
                throw new Error(`${pathData} has no sparql property`);
            // No results if the query is empty
            if (query.length === 0)
                return yield __await(void 0);
            try {
                // Extract the term from every query result
                for (var _b = __asyncValues(queryEngine.execute(query)), _c; _c = yield __await(_b.next()), !_c.done;) {
                    const bindings = _c.value;
                    yield yield __await(pathData.extendPath({ subject: getSingleTerm(bindings) }, null));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
}
exports.default = ExecuteQueryHandler;
function getSingleTerm(binding) {
    // Extract the first term from the binding map
    if (binding.size !== 1)
        throw new Error('Only single-variable queries are supported');
    for (const subject of binding.values())
        return subject;
}
