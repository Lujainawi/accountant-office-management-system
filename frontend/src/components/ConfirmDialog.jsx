import { useEffect, useRef } from "react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import DangerButton from "./DangerButton";

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmDanger = false,
}) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement;

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function restoreFocus() {
    if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === "function") {
      previouslyFocusedRef.current.focus();
    }
  }

  function handleCancel(event) {
    event.preventDefault();
    dialogRef.current?.close();
    restoreFocus();
    onCancel();
  }

  function handleConfirm(event) {
    event.preventDefault();
    dialogRef.current?.close();
    restoreFocus();
    onConfirm();
  }

  function handleDialogCancel(event) {
    event.preventDefault();
    handleCancel(event);
  }

  const ConfirmButton = confirmDanger ? DangerButton : PrimaryButton;

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onCancel={handleDialogCancel}
    >
      <div className="confirm-dialog__content">
        <h2 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h2>
        <p id="confirm-dialog-description" className="confirm-dialog__description">
          {description}
        </p>
        <div className="confirm-dialog__actions">
          <SecondaryButton type="button" onClick={handleCancel}>
            {cancelLabel}
          </SecondaryButton>
          <ConfirmButton type="button" onClick={handleConfirm}>
            {confirmLabel}
          </ConfirmButton>
        </div>
      </div>
    </dialog>
  );
}
