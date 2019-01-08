import VoidHandler from '../../src/VoidHandler';

describe('a VoidHandler instance', () => {
  let handler;
  beforeAll(() => handler = new VoidHandler());

  it('always resolves to undefined', async () => {
    expect(await handler.execute()).toBe(undefined);
  });
});
