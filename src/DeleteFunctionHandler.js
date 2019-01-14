import MutationFunctionHandler from './MutationFunctionHandler';

/**
 * A MutationFunctionHandler for deletions.
 */
export default class DeleteFunctionHandler extends MutationFunctionHandler {
  constructor() {
    super('DELETE', true);
  }
}
