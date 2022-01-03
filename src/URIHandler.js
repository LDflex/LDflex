import { handler } from './handlerUtil'

const NAMESPACE = /^[^]*[#\/]/;
const FRAGMENT = /(?![\/#])[^\/#]*$/

/**
 * Match the value of a NamedNode against a regular expression
 */
function match(term, pattern) {
  return term?.termType === 'NamedNode'
    ? pattern.exec(term.value)?.[0]
    : undefined;
}

/**
 * Gets the namespace of a NamedNode subject
 */
export const namespaceHandler = handler(({ subject }) => match(subject, NAMESPACE));

/**
 * Gets the fragment of a NamedNode subject
 */
export const fragmentHandler = handler(({ subject }) => match(subject, FRAGMENT));

/**
 * Gets the prefix of a NamedNode subject
 */
export const prefixHandler = handler(async (data) => {
  const context = await data.settings.parsedContext;
  const ns = namespaceHandler.handle(data);
  for (const key in context) {
    if (typeof key === 'string' && context[key] === ns) {
      return key;
    }
  }
})
