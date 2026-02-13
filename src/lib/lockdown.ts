export function startLockdown() {
  if (typeof window === 'undefined') return () => {};

  const isEditableTarget = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  };

  const prevent = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const onContextMenu = (e: MouseEvent) => prevent(e);
  const onCopy = (e: ClipboardEvent) => prevent(e);
  const onCut = (e: ClipboardEvent) => prevent(e);
  const onPaste = (e: ClipboardEvent) => prevent(e);
  const onDragStart = (e: DragEvent) => prevent(e);

  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    // Block devtools + view source shortcuts
    if (key === 'f12') return prevent(e);
    if (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) return prevent(e);
    if (e.ctrlKey && (key === 'u' || key === 's' || key === 'p')) return prevent(e);

    // Best-effort: block copy/paste/select-all shortcuts
    if (e.ctrlKey && (key === 'c' || key === 'x' || key === 'v' || key === 'a')) return prevent(e);

    // Block zoom in/out/reset shortcuts (Ctrl/⌘ + + / - / 0)
    if ((e.ctrlKey || e.metaKey) && (key === '+' || key === '-' || key === '=' || key === '0')) {
      return prevent(e);
    }

    // Best-effort: try to block PrintScreen (cannot fully prevent screenshots at OS level)
    if (key === 'printscreen') return prevent(e);
  };

  const onWheel = (e: WheelEvent) => {
    // Block browser zoom via Ctrl/⌘ + wheel
    if (e.ctrlKey || e.metaKey) {
      return prevent(e);
    }
  };

  // Disable text selection as a best-effort anti-copy measure
  const previousUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = 'none';

  window.addEventListener('contextmenu', onContextMenu, { capture: true });
  window.addEventListener('copy', onCopy, { capture: true });
  window.addEventListener('cut', onCut, { capture: true });
  window.addEventListener('paste', onPaste, { capture: true });
  window.addEventListener('dragstart', onDragStart, { capture: true });
  window.addEventListener('keydown', onKeyDown, { capture: true });
  window.addEventListener('wheel', onWheel, { capture: true, passive: false });

  // Also block selection via mouse on non-editable elements
  const onSelectStart = (e: Event) => {
    if (isEditableTarget(e.target)) return;
    prevent(e);
  };
  document.addEventListener('selectstart', onSelectStart, { capture: true });

  return () => {
    document.body.style.userSelect = previousUserSelect;
    window.removeEventListener('contextmenu', onContextMenu, { capture: true } as any);
    window.removeEventListener('copy', onCopy, { capture: true } as any);
    window.removeEventListener('cut', onCut, { capture: true } as any);
    window.removeEventListener('paste', onPaste, { capture: true } as any);
    window.removeEventListener('dragstart', onDragStart, { capture: true } as any);
    window.removeEventListener('keydown', onKeyDown, { capture: true } as any);
    window.removeEventListener('wheel', onWheel, { capture: true } as any);
    document.removeEventListener('selectstart', onSelectStart, { capture: true } as any);
  };
}

