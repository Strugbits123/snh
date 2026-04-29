/**
 * Client-side helper to call the Wix API via our secure server-side proxy.
 */
export async function wixProxy(module, method, ...args) {
  const res = await fetch('/api/wix-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module, method, args }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Wix Proxy Error");
  }
  return res.json();
}
