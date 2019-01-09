/**
 * Returns a function that deletes all existing values
 * for the path, and then adds the given values to the path.
 *
 * Requires:
 * - a delete function on the path proxy.
 * - an add function on the path proxy.
 */
export default class SetFunctionHandler {
  execute(path, proxy) {
    const postDeleteProxy = proxy.delete();
    return postDeleteProxy.add.bind(postDeleteProxy);
  }
}
