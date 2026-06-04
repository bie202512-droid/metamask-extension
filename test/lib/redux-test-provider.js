const React = require('react');
const { Provider } = require('react-redux');

/**
 * Redux Provider for unit/integration tests.
 *
 * @param {{ store: import('redux').Store; children: React.ReactNode }} props
 */
function MetaMaskTestReduxProvider({ store, children }) {
  return React.createElement(
    Provider,
    { store, stabilityCheck: 'never', noopCheck: 'never' },
    children,
  );
}

module.exports = { MetaMaskTestReduxProvider };
