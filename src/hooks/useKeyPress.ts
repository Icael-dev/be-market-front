import { useEffect, useCallback } from "react";

type KeyHandler = (event: KeyboardEvent) => void;

export function useKeyPress(targetKey: string, handler: KeyHandler, active: boolean = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        handler(event);
      }
    },
    [targetKey, handler]
  );

  useEffect(() => {
    if (!active) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, handleKeyDown]);
}

export function useEscape(handler: KeyHandler, active: boolean = true) {
  useKeyPress("Escape", handler, active);
}

export function useEnter(handler: KeyHandler, active: boolean = true) {
  useKeyPress("Enter", handler, active);
}
