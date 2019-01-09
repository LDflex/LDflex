import MutationFunctionHandler from './MutationFunctionHandler';

/**
 * A MutationFunctionHandler for insertions.
 */
export default class InsertFunctionHandler extends MutationFunctionHandler {
  constructor() {
    super('INSERT', false);
  }
}
