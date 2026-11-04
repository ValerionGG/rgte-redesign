// Décodage d'une page selon l'encodage déclaré (en-tête Content-Type, puis balise meta), UTF-8 par défaut.
// ISO-8859-1 est lu en Windows-1252 (sur-ensemble, comme le font les navigateurs).
export function decodeBody(bytes, contentType = '') {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let cs = (String(contentType).match(/charset=["']?([\w-]+)/i) || [])[1]
  if (!cs) {
    let head = ''
    for (let i = 0; i < Math.min(2048, u8.length); i++) head += String.fromCharCode(u8[i])
    cs = (head.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1]
  }
  cs = (cs || 'utf-8').toLowerCase()
  try { return new TextDecoder(/^(iso-8859-1|latin1|us-ascii)$/.test(cs) ? 'windows-1252' : cs).decode(u8) } catch { return new TextDecoder('utf-8').decode(u8) }
}
