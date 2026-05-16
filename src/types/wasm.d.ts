/// <reference types="next" />

// WebAssembly module declarations for Rust/WASM integration
declare module '*.wasm' {
  const content: string;
  export default content;
}

// For wasm-pack generated modules, declare like:
// declare module 'your-wasm-pkg' {
//   export function your_function(arg: number): number;
//   // Add your WASM function signatures here
// }
