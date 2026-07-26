// This file runs BEFORE jest-environment is loaded
// It mocks @react-native/js-polyfills/error-guard to prevent Flow syntax errors

const path = require('path');

// Register the mock module before any imports
jest.mock('@react-native/js-polyfills/error-guard', () => {
  return {
    ErrorUtils: {
      setGlobalHandler: jest.fn(),
      reportError: jest.fn(),
      getGlobalHandler: () => () => {},
    },
  };
});
