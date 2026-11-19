/**
 * Liest ein Foto ein und verkleinert es (längste Seite max. 1200 px, JPEG).
 * iPhone-Fotos haben sonst mehrere MB und blähen Datenbank und Sicherung auf.
 */
export async function readPhotoResized(file: File, maxSize = 1200): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Foto konnte nicht verarbeitet werden.')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', 0.82)
}
