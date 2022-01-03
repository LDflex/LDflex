import ComunicaEngine from '@ldflex/comunica';
import { namedNode } from '@rdfjs/data-model';
import ComplexPathResolver from '../../src/ComplexPathResolver';
import ContextProvider from '../../src/ContextProvider';
import DataHandler from '../../src/DataHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import PathFactory from '../../src/PathFactory';
import ThenHandler from '../../src/ThenHandler';
import { fragmentHandler, namespaceHandler, prefixHandler } from '../../src/URIHandler';
import context from '../context';

const FOAF = 'http://xmlns.com/foaf/0.1/';

describe('a query path with a path expression handler', () => {
  const handlers = {
    then: new ThenHandler(),
    [Symbol.asyncIterator]: {
      handle() {
        const iterable = (async function* () {
          yield namedNode('http://ex.org/#1');
          yield namedNode('http://ex.org/#2');
        }());
        return () => iterable[Symbol.asyncIterator]();
      },
    },
    value: DataHandler.sync('subject', 'value'),
    termType: DataHandler.sync('subject', 'termType'),
    prefix: prefixHandler,
    fragment: fragmentHandler,
    namespace: namespaceHandler
  };
  const contextProvider = new ContextProvider(context);
  const resolvers = [
    new ComplexPathResolver(contextProvider),
    new JSONLDResolver(contextProvider),
  ];
  const subject = namedNode('https://example.org/#me');
  const foafPerson = namedNode(`${FOAF}Person`);

  let person;
  let personType;
  let noSubject;
  beforeAll(() => {
    const pathProxy = new PathFactory({ context, queryEngine: new ComunicaEngine(), handlers, resolvers });
    person = pathProxy.create({ subject });
    personType = pathProxy.create({ subject: foafPerson });
    noSubject = pathProxy.create({});
  });

  it(`works with ${FOAF}Person and prefix in context`, async () => {
    expect(personType.namespace).toEqual(FOAF);
    expect(personType.fragment).toEqual('Person');
    expect(await personType.prefix).toEqual('foaf');
  });

  it('works with https://example.org/#me & prefix not in context', async () => {
    expect(person.namespace).toEqual('https://example.org/#');
    expect(person.fragment).toEqual('me');
    expect(await person.prefix).toEqual(undefined);
  });

  it('works with no subject', async () => {
    expect(noSubject.namespace).toEqual(undefined);
    expect(noSubject.fragment).toEqual(undefined);
    expect(await noSubject.prefix).toEqual(undefined);
  });
});




