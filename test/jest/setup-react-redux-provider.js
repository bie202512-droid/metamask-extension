/**
 * react-redux v8+ runs selector stability checks in development that warn when
 * inline selectors return new references. MetaMask has many legacy selectors;
 * disable those checks in unit/integration tests (prod still uses defaults).
 */
jest.mock('react-redux', () => {
  const React = require('react');
  const actual = jest.requireActual('react-redux');

  function Provider({
    stabilityCheck = 'never',
    noopCheck = 'never',
    ...props
  }) {
    return React.createElement(actual.Provider, {
      stabilityCheck,
      noopCheck,
      ...props,
    });
  }

  return {
    ...actual,
    Provider,
  };
});
