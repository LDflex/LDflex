import MutationExpressionHandler from './MutationExpressionHandler';

/**
 * A MutationExpressionHandler for insertions.
 */
export default class InsertExpressionHandler extends MutationExpressionHandler {
  constructor() {
    super('INSERT');
  }
}
