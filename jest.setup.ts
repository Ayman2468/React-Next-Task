// jest.setup.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Polyfill browser APIs for MSW Node
(global as any).BroadcastChannel = class {
  constructor(name: string) {}
  postMessage(msg: any) {}
  close() {}
  onmessage = null;
};

(global as any).TransformStream = class {};
(global as any).WritableStream = class {};
(global as any).ReadableStream = class {};

// Optional: mock fetch if not using jsdom
if (!global.fetch) {
  (global as any).fetch = require('node-fetch');
}