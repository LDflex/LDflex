import PathProxy from '../../src/PathProxy';
import JSONLDResolver from '../../src/JSONLDResolver';
import LanguageResolver from '../../src/LanguageResolver';
import { createQueryEngine } from '../util';
import { namedNode, literal } from '@rdfjs/data-model';
import defaultHandlers from '../../src/defaultHandlers';
import LanguageHandler from '../../src/LanguageHandler';

import context from '../context';

const subject = namedNode('https://example.org/#me');
const queryEngine = createQueryEngine([
  literal('Tomato', 'en'),
  literal('Second Tomato', 'en'),
  literal('Tomaat', 'nl'),
  literal('Tomate', 'de'),
  literal('zweite Tomate', 'de'),
]);

describe('querying a language with @langcode', () => {
  let tomato;
  beforeAll(() => {
    const resolvers = [
      new LanguageResolver(context),
      new JSONLDResolver(context),
    ];

    const pathProxy = new PathProxy({ handlers: defaultHandlers, resolvers });
    tomato = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results in the selected language', async () => {
    const dutchLabel = await tomato.label['@nl'];
    expect(`${dutchLabel}`).toEqual('Tomaat');

    const englishLabel = await tomato.label['@en'];
    expect(`${englishLabel}`).toEqual('Tomato');

    const germanLabel = await tomato.label['@de'];
    expect(`${germanLabel}`).toEqual('Tomate');
  });
});

describe('querying a language with the language handler', () => {
  let tomato;
  beforeAll(() => {
    const resolvers = [
      new LanguageResolver(context),
      new JSONLDResolver(context),
    ];

    const pathProxy = new PathProxy({ handlers: { ...defaultHandlers,
      en: new LanguageHandler('en'),
      de: new LanguageHandler('de'),
      nl: new LanguageHandler('nl'),
    }, resolvers });
    tomato = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results in the selected language via the language handler', async () => {
    const dutchLabel = await tomato.label.nl;
    expect(`${dutchLabel}`).toEqual('Tomaat');

    const englishLabel = await tomato.label.en;
    expect(`${englishLabel}`).toEqual('Tomato');

    const germanLabel = await tomato.label.de;
    expect(`${germanLabel}`).toEqual('Tomate');
  });
});

describe('language defaults', () => {
  let tomato;
  beforeAll(() => {
    context['@context']['@language'] = 'de';

    const resolvers = [
      new LanguageResolver(context),
      new JSONLDResolver(context),
    ];

    const pathProxy = new PathProxy({ handlers: { ...defaultHandlers,
      en: new LanguageHandler('en'),
      de: new LanguageHandler('de'),
      nl: new LanguageHandler('nl'),
    }, resolvers });
    tomato = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results in the current language from the context', async () => {
    const germanLabel = await tomato.label;
    expect(`${germanLabel}`).toEqual('Tomate');
  });

  it('returns an async iterator', async () => {
    let counter = 0;

    const results = ['Tomate', 'zweite Tomate'];

    for await (const item of tomato.label.de) {
      expect(item.toString()).toEqual(results[counter]);
      counter++;
    }
  });


  it('returns results an async iterator for a default value', async () => {
    let counter = 0;

    const results = ['Tomate', 'zweite Tomate'];

    for await (const item of tomato.label) {
      expect(item.toString()).toEqual(results[counter]);
      counter++;
    }
  });
});

