import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn().mockResolvedValue({ isConnected: true }),
  isAllowed: vi.fn().mockResolvedValue({ isAllowed: true }),
  setAllowed: vi.fn().mockResolvedValue(true),
  requestAccess: vi.fn().mockResolvedValue(true),
  getAddress: vi.fn().mockResolvedValue({ address: "GBXKKRIDJ4Q2DGJKQXBRBF22BZFRLMEEK722LGDQBBOGRPF4IUS65KSHJ" }),
  signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: "AAAA..." }),
}));

Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
});
