/**
 * Copies text to the clipboard. The async Clipboard API only exists on secure pages (https or localhost),
 * so on anything else, such as the dev server opened by LAN address, fall back to a hidden text area and execCommand
 */
export async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Refused (permission denied or the page isn't focused): try the fallback
  }
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  previous?.focus({ preventScroll: true });
  return ok;
}
