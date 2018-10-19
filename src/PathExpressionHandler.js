/**
 * Traverses a path to collect links and nodes into an expression.
 */
export default class PathExpressionHandler {
  async execute(path) {
    const segments = [];
    let current = path;

    // Add all predicates to the path
    while (current.parent) {
      // Obtain and store predicate
      if (!current.predicate)
        throw new Error(`Expected predicate in ${current}`);
      const predicate = await current.predicate;
      segments.unshift({ predicate });

      // Move to parent link
      current = current.parent;
    }

    // Add the root subject to the path
    if (!current.subject)
      throw new Error(`Expected root subject in ${current}`);
    const subject = await current.subject;
    segments.unshift({ subject });

    return segments;
  }
}
