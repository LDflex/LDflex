/**
 * Returns a function that requests all results for the given predicates.
 */
export default class GetFunctionHandler {
  handle(pathData, path) {
    return async (...args) => {
      if (args.length === 0)
        throw new Error('At least 1 argument is required for the get function');

      // Could be an array/iterator/object
      if (args.length === 1) {
        const arg = args[0];
        if (Array.isArray(arg)) {
          return path.get(...arg);
        }
        else if (arg[Symbol.asyncIterator]) {
          return (async function* () {
            for await (const input of arg)
              yield path[input];
          }());
        }
        else if ((typeof arg !== 'string') && !arg.termType) {
          const keys = Object.keys(arg);
          return path.get(...keys).then(results => results.reduce((acc, val, i) => {
            acc[keys[i]] = val;
            return acc;
          }, {}));
        }
      }

      return Promise.all(args.map(arg => path[arg]));
    };
  }
}
