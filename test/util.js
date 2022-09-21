export function deindent(string) {
  const first = (/^ +/m).exec(string)[0];
  const indent = !first ? /^/ : new RegExp(`^ {${first.length}}?`, 'mg');
  return string.trim().replace(indent, '');
}

export function createQueryEngine(variableNames, results, removeQuestionmark = false) {
  if (!results) {
    results = variableNames;
    variableNames = ['?value'];
  }
  return {
    execute: jest.fn(async function*() {
      for (let result of results) {
        if (!Array.isArray(result))
          result = [result];
        const bindings = variableNames.map((name, i) => [removeQuestionmark ? name.substring(1) : name, result[i]]);
        yield new Map(bindings);
      }
    }),
  };
}
