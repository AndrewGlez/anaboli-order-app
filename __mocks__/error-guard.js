// Mock implementation of @react-native/js-polyfills/error-guard
// This replaces the Flow TypeScript version that breaks Jest

export const ErrorUtils = {
  setGlobalHandler: jest.fn(),
  reportError: jest.fn(),
  getGlobalHandler: () => () => {},
};

export default ErrorUtils;
