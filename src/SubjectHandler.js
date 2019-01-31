/**
 * Returns a new path starting from the subject of the current path.
 *
 * Requires:
 * - (optional) a subject property on the path proxy
 * - (optional) a parent property on the path proxy
 */
export default class SubjectHandler {
  handle(pathData) {
    // Traverse parents until we find a subject
    let { subject, parent } = pathData;
    while (!subject && parent)
      ({ subject, parent } = parent);

    // Resolve the subject if it exists,
    // and return a path starting from that subject
    return !subject ? undefined : Promise.resolve(subject)
      .then(value => pathData.extendPath({ subject: value }, null));
  }
}
