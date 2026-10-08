import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DateTimeField } from "@/components/raffila/admin/competitions";

/**
 * The regression: a native `datetime-local` input only opens its picker from
 * the small trailing icon. Clicking anywhere else silently selected a text
 * segment, so operators could not set a date. The whole field must be a target.
 */
describe("DateTimeField", () => {
  it("opens the native picker when the field is clicked anywhere", () => {
    const onChange = vi.fn();
    render(
      <DateTimeField id="dt" label="Draw date" value="2026-10-09T21:00" onChange={onChange} />,
    );
    const input = screen.getByLabelText("Draw date") as HTMLInputElement;

    const showPicker = vi.fn();
    Object.defineProperty(input, "showPicker", { value: showPicker, configurable: true });

    fireEvent.click(input);
    expect(showPicker).toHaveBeenCalledTimes(1);
  });

  it("does not throw when showPicker is unavailable (older browsers)", () => {
    const onChange = vi.fn();
    render(
      <DateTimeField id="dt2" label="Start date" value="2026-10-08T01:02" onChange={onChange} />,
    );
    const input = screen.getByLabelText("Start date") as HTMLInputElement;
    // No showPicker property at all — the click must stay harmless.
    expect(() => fireEvent.click(input)).not.toThrow();
  });

  it("does not throw when showPicker rejects (picker already open)", () => {
    const onChange = vi.fn();
    render(
      <DateTimeField id="dt3" label="Draw date 3" value="2026-10-09T21:00" onChange={onChange} />,
    );
    const input = screen.getByLabelText("Draw date 3") as HTMLInputElement;
    Object.defineProperty(input, "showPicker", {
      value: () => {
        throw new Error("already showing");
      },
      configurable: true,
    });
    expect(() => fireEvent.click(input)).not.toThrow();
  });

  it("still reports typed/segment changes", () => {
    const onChange = vi.fn();
    render(
      <DateTimeField id="dt4" label="Draw date 4" value="2026-10-09T21:00" onChange={onChange} />,
    );
    const input = screen.getByLabelText("Draw date 4") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2026-11-01T10:30" } });
    expect(onChange).toHaveBeenCalledWith("2026-11-01T10:30");
  });
});
