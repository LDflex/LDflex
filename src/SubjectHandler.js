/**
 * Returns an asynchronous iterator to the subject of a path segment.
 *
 * Requires:
 * - a subject property on the path proxy
 */
export default class PathExpressionHandler {
  execute({ subject }) {
    // Return the subject if not set
    if (!subject)
      return subject;

    // Return a function that yields an asynchronous iterator to the subject
    return () => ({
      next: async () => {
        const value = subject;
        subject = null;
        return { value, done: !value };
      },
    });
  }
}
