import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Czyszczenie po każdym teście
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver for Radix and other UI libs
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserver;
