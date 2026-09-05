import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "@/hooks/useCountdown";

describe("useCountdown hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("initializes with correct breakdown from totalSeconds", () => {
    const { result } = renderHook(() => useCountdown(90061));
    expect(result.current.d).toBe(1);
    expect(result.current.h).toBe(1);
    expect(result.current.m).toBe(1);
    expect(result.current.s).toBe(1);
    expect(result.current.expired).toBe(false);
  });

  it("decrements by 1 each second", () => {
    const { result } = renderHook(() => useCountdown(5));
    expect(result.current.s).toBe(5);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.s).toBe(4);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.s).toBe(3);
  });

  it("reaches zero and marks expired", () => {
    const { result } = renderHook(() => useCountdown(2));
    expect(result.current.expired).toBe(false);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.d).toBe(0);
    expect(result.current.h).toBe(0);
    expect(result.current.m).toBe(0);
    expect(result.current.s).toBe(0);
    expect(result.current.expired).toBe(true);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.expired).toBe(true);
    expect(result.current.s).toBe(0);
  });

  it("handles zero input as immediately expired", () => {
    const { result } = renderHook(() => useCountdown(0));
    expect(result.current.expired).toBe(true);
    expect(result.current.d).toBe(0);
    expect(result.current.h).toBe(0);
    expect(result.current.m).toBe(0);
    expect(result.current.s).toBe(0);
  });
});
