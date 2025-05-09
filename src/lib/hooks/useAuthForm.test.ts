import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAuthForm, type AuthFormSubmitResult } from "./useAuthForm";

function createFakeEvent() {
  return {
    preventDefault: vi.fn(),
    currentTarget: document.createElement("form"),
  } as unknown as React.FormEvent<HTMLFormElement>;
}

describe("useAuthForm", () => {
  it("returns initial state", () => {
    const { result } = renderHook(() => useAuthForm(vi.fn(), ["err1"]));
    expect(result.current.loading).toBe(false);
    expect(result.current.errors).toEqual(["err1"]);
  });

  it("handles successful submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true } as AuthFormSubmitResult);
    const { result } = renderHook(() => useAuthForm(onSubmit));
    const fakeEvent = createFakeEvent();
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });
    expect(onSubmit).toHaveBeenCalled();
    expect(result.current.errors).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it("handles failed submit with error", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: false, error: "fail" } as AuthFormSubmitResult);
    const { result } = renderHook(() => useAuthForm(onSubmit));
    const fakeEvent = createFakeEvent();
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });
    expect(result.current.errors).toBe("fail");
    expect(result.current.loading).toBe(false);
  });

  it("handles thrown error", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAuthForm(onSubmit));
    const fakeEvent = createFakeEvent();
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });
    expect(result.current.errors).toBe("boom");
    expect(result.current.loading).toBe(false);
  });

  it("handles thrown non-Error", async () => {
    const onSubmit = vi.fn().mockRejectedValue("fail");
    const { result } = renderHook(() => useAuthForm(onSubmit));
    const fakeEvent = createFakeEvent();
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });
    expect(result.current.errors).toBe("An unexpected error occurred");
    expect(result.current.loading).toBe(false);
  });
});
