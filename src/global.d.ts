export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: true;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, listener: (...args: any[]) => void) => void;
      removeListener: (event: string, listener: (...args: any[]) => void) => void;
    };
  }
}
