import type { Bindings, Term, StringSparqlQueryable, BindingsResultSupport } from '@rdfjs/types';
import { JsonLdContext, IJsonLdContextNormalizedRaw } from "jsonld-context-parser";

export type MaybePromise<T> = T | Promise<T>

export type HandlerFunction = (pathData: PathData, path: any) => any;
export type Handler<T extends HandlerFunction = HandlerFunction> = { handle: T };
export type Handlers = Record<string | symbol, Handler>;

export interface Resolver {
  supports(...args: any[]): boolean;
  resolve(property: string, pathData: PathData): PathData;
}

export type Resolvers = Resolver[];

export interface Settings {
  context: JsonLdContext,
  handlers?: Handlers,
  parsedContext?: MaybePromise<IJsonLdContextNormalizedRaw>,
  resolvers?: Resolver[],
  queryEngine: StringSparqlQueryable<BindingsResultSupport>;
}

export interface PathData {
  settings: Settings;
  resultsCache?: MaybePromise<Map<string, Term>>;
  extendPath: HandlerFunction; // TODO: Check this
  // extendPath(pathData: PathData, path?: Data): Data;
}


// export interface Data {
//   property: string | undefined;
//   resultsCache?: Data; // TODO: Check - is this optional,
//   results: Data; // TODO CHECK
//   parent?: null,
//   subject?: RDF.Quad_Subject,
//   sparql?: string,
//   predicate?: RDF.Quad_Predicate,
//   proxy?: LDflexProxyHandlers, // TODO: Check
//   settings: LDflexSettings,
//   // TODO: Check below definition
//   extendPath(pathData: Data, path?: Data): Data,
//   [Symbol.asyncIterator]?: AsyncIterableIterator<any>, // TODO: CHECK - is this optional
//   //[x: string]: any // TODO FIX - make better for path property access
//   finalClause?(v: string): [string, string, string] // Generates the final clause for a sparql query
//   [x: string]: any; // TODO make this stricter?
// }




// export type MaybePromise<T> = Promise<T> | T
// export type MaybeFunction<T> = T | (() => T)
// export type MaybeArray<T> = T | T[]
// export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// export type LDflexHandleFunction = (pathData: any, path: any) => any; 

// export interface LDflexHandler {
//     handle : LDflexHandleFunction
// }

// export type LDflexProxyHandlers = {
//     readonly [x: string]: LDflexHandler;
//     readonly [Symbol.asyncIterator]: AsyncIterableIterator<any>;
// } | {
//     readonly __esModule: () => undefined;
// };


// export enum fltr {
//   regex = 'regex',
//   le = '<',
//   ge = '>',
//   leq = '<=',
//   geq = '>=',
//   exists = 'exists',
//   notExists = 'notexists',
//   eq = '=',
//   neq = '!='
// }
