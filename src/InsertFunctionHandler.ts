import MutationFunctionHandler from './MutationFunctionHandler';
import { Handler } from './types';

/**
 * A MutationFunctionHandler for insertions.
 */
export default class InsertFunctionHandler extends MutationFunctionHandler implements Handler {
  constructor() {
    super('INSERT', false);
  }
}
