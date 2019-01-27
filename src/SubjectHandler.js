/**
 * Returns a new path starting from the subject of the current path.
 *
 * Requires:
 * - (optional) a subject property on the path proxy
 * - (optional) a parent property on the path proxy
 */
export default class SubjectHandler {
  execute(path) {
    // Traverse parents until we find a subject
    let { subject, parent } = path;
    while (!subject && parent)
      ({ subject, parent } = parent);

    // Resolve the subject if it exists,
    // and return a path starting from that subject
    return !subject ? undefined : Promise.resolve(subject)
      .then(value => path.extend({ subject: value }, null));
  }
}
