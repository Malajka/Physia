import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSingleSelection } from "./useSingleSelection";

describe("useSingleSelection", () => {
  it("initially selected is null", () => {
    const { result } = renderHook(() => useSingleSelection<number>());
    expect(result.current.selected).toBeNull();
  });

  it("toggle sets selected to value", () => {
    const { result } = renderHook(() => useSingleSelection<number>());
    act(() => {
      result.current.toggle(5);
    });
    expect(result.current.selected).toBe(5);
  });

  it("toggle with same value resets selected to null", () => {
    const { result } = renderHook(() => useSingleSelection<number>());
    act(() => {
      result.current.toggle(5);
    });
    act(() => {
      result.current.toggle(5);
    });
    expect(result.current.selected).toBeNull();
  });

  it("toggle with different value changes selected", () => {
    const { result } = renderHook(() => useSingleSelection<number>());
    act(() => {
      result.current.toggle(5);
    });
    act(() => {
      result.current.toggle(7);
    });
    expect(result.current.selected).toBe(7);
  });
});
