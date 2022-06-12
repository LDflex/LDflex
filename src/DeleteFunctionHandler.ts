import MutationFunctionHandler from './MutationFunctionHandler';
import { Handler } from './types';

/**
 * A MutationFunctionHandler for deletions.
 */
export default class DeleteFunctionHandler extends MutationFunctionHandler implements Handler {
  constructor() {
    super('DELETE', true);
  }
}
