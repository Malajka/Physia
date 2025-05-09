import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ModalProps } from "./Modal";
import { Modal } from "./Modal";

function setupModal(props: Partial<ModalProps> = {}) {
  const defaultProps: ModalProps = {
    open: true,
    onClose: vi.fn(),
    title: "Test Title",
    children: <div>Modal Content</div>,
    footer: <button>OK</button>,
  };
  return render(<Modal {...defaultProps} {...props} />);
}

describe("Modal", () => {
  it("renders when open", () => {
    const { getByRole, getByText } = setupModal();
    expect(getByRole("dialog")).toBeInTheDocument();
    expect(getByText("Test Title")).toBeInTheDocument();
    expect(getByText("Modal Content")).toBeInTheDocument();
    expect(getByText("OK")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { queryByRole } = setupModal({ open: false });
    expect(queryByRole("dialog")).toBeNull();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = setupModal({ onClose });
    const backdrop = container.querySelector(".absolute.inset-0");
    expect(backdrop).toBeInTheDocument();
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    setupModal({ onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
