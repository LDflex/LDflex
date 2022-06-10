import { handler } from './handlerUtil';

/**
 * Finds the index at which the break between the namespace and the
 * occurs - then execute a callback with this index as the second arg
 */
function breakIndex(term, cb) {
  if (term?.termType !== 'NamedNode')
    return undefined;
  // Find the index of the last '#' or '/' if no '#' exists
  const hashIndex = term.value.lastIndexOf('#');
  return cb(term.value, hashIndex === -1 ? term.value.lastIndexOf('/') : hashIndex);
}

/**
 * Gets the namespace of a NamedNode subject
 */
export const namespaceHandler = handler(({ subject }) => breakIndex(subject, (str, index) => str.slice(0, index + 1)));

/**
 * Gets the fragment of a NamedNode subject
 */
export const fragmentHandler = handler(({ subject }) => breakIndex(subject, (str, index) => str.slice(index + 1)));

/**
 * Gets the prefix of a NamedNode subject
 */
export const prefixHandler = handler(async data => {
  const context = await data.settings.parsedContext;
  const ns = namespaceHandler.handle(data);
  for (const key in context) {
    if (typeof key === 'string' && context[key] === ns)
      return key;
  }
  return undefined;
});
