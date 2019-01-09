import MutationExpressionHandler from './MutationExpressionHandler';

/**
 * A MutationExpressionHandler for deletions.
 */
export default class DeleteExpressionHandler extends MutationExpressionHandler {
  constructor() {
    super('DELETE');
  }
}
