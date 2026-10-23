import { useEffect } from 'react';
let locks = 0;
let originalOverflow = '';
const focusable = (root) => [...root.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]')]
  .filter((el) => el.tabIndex >= 0 && !el.disabled && !el.closest('[hidden], [inert]') && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none');

// Contiene el foco, bloquea el fondo y devuelve el foco al control que abrió el diálogo.
export function useDialog(ref, open, onClose, initialFocusRef) {
  useEffect(() => {
    const root = ref.current;
    if (!open || !root) return undefined;
    const previous = document.activeElement;
    if (locks++ === 0) { originalOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    const background = [];
    let current = root;
    while (current.parentElement) {
      for (const sibling of current.parentElement.children) {
        if (sibling !== current && !sibling.hasAttribute('data-dialog-backdrop')) {
          background.push([sibling, sibling.hasAttribute('inert')]);
          sibling.setAttribute('inert', '');
        }
      }
      current = current.parentElement;
      if (current === document.body) break;
    }
    const focusFirst = () => (initialFocusRef?.current || focusable(root)[0] || root).focus();
    focusFirst();
    const keydown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key !== 'Tab') return;
      const items = focusable(root);
      const first = items[0] || root;
      const last = items[items.length - 1] || root;
      if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    const focusin = (e) => { if (!root.contains(e.target)) focusFirst(); };
    document.addEventListener('keydown', keydown);
    document.addEventListener('focusin', focusin);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('focusin', focusin);
      for (const [element, wasInert] of background) if (!wasInert) element.removeAttribute('inert');
      if (--locks === 0) document.body.style.overflow = originalOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [ref, open, onClose, initialFocusRef]);
}
