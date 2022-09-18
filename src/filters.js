export class Filter {
  constructor(templateCallback) {
    this.templateCallback = templateCallback;
  }

  toString(variable) {
    return this.templateCallback(variable);
  }
}

export function lang(langcode) {
  return new Filter(variable => `lang(${variable}) = '${langcode}'`);
}

export function langMatches(langcode) {
  return new Filter(variable => `langMatches(lang(${variable}), '${langcode}')`);
}
