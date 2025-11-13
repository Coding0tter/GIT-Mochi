export function base64url(buf: ArrayBuffer) {
  let str = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomString(len = 64) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes)
    .map((b) => ("0" + b.toString(16)).slice(-2))
    .join("");
}

export async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64url(digest);
}
