import { handler } from './handlerUtil';

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

/**
 * @returns An handler that returns an RDF list as an array
 */
export function listHandler() {
  return handler((_, path) => async () => {
    let _path = await path;
    const list = [];
    while (_path && _path.value !== `${RDF}nil`) {
      list.push(_path[`${RDF}first`]);
      _path = await _path[`${RDF}rest`];
    }
    return (await Promise.all(list)).filter(value => value !== undefined);
  });
}

/**
 * @param {Boolean} set Emits set if True, array otherwise
 * @returns An handler that returns an RDF collection as an array or set
 */
export function containerHandler(set) {
  return handler((_, path) => async () => {
    let container = [];
    let elem;
    let count = 0;
    // eslint-disable-next-line no-cond-assign
    while (elem = await path[`${RDF}_${++count}`])
      container.push(elem);

    container = await Promise.all(container);
    return set ? new Set(container) : container;
  });
}

/**
 * @returns An handler that returns an RDF collection according to its RDF:type
 */
export function collectionHandler() {
  return handler((pathData, path) => async () => {
    // TODO: Handle cases where multiple classes may be present (e.g. if inferencing is on)
    switch ((await path[`${RDF}type`])?.value) {
    case `${RDF}List`:
      return listHandler().handle(pathData, path)();
    case `${RDF}Bag`:
      return containerHandler(true).handle(pathData, path)();
    case `${RDF}Alt`:
    case `${RDF}Seq`:
    case `${RDF}Container`:
      return containerHandler(false).handle(pathData, path)();
    default:
      // In this case none of the appropriate containers apply
      return path;
    }
  });
}
