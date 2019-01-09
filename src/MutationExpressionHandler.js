import PathProxy from './PathProxy';
import MutationExpressionCallbackHandler from './MutationExpressionCallbackHandler';

/**
 * Returns a function that creates a mutation expression
 * with the current path expression as domain
 * and the given arguments as range.
 * These arguments can either be raw, or other path expressions.
 */
export default class MutationExpressionHandler {
  constructor(mutationType) {
    this._mutationType = mutationType;
  }

  execute(path) {
    const self = this;
    return function () {
      // Wrap the proxy in a new proxy so that we can expose the mutation expression
      const callbackHandler = new MutationExpressionCallbackHandler({
        mutationType: self._mutationType,
        args: arguments,
      });
      return new PathProxy({
        handlers: { ...path.proxyHandler._handlers, mutationExpressions: callbackHandler },
        resolvers: path.proxyHandler._resolvers,
      }).createPath(path);
    };
  }
}
MutationExpressionHandler.INSERT = 'INSERT';
MutationExpressionHandler.DELETE = 'DELETE';
