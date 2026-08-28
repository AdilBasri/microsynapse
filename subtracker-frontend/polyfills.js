// Polyfill DOMException BEFORE React Native InitializeCore / setUpDefaultReactNativeEnvironment
if (typeof globalThis.DOMException === 'undefined') {
  globalThis.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'Error';
    }
  };
}

if (typeof global.DOMException === 'undefined') {
  global.DOMException = globalThis.DOMException;
}
