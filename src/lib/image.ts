/**
 * Client-side image helpers.
 *
 * Photos go through `compressImage` before they are sent anywhere: it caps the
 * longest edge and re-encodes as JPEG, which cuts a 4 MB phone photo to ~100-200 KB.
 * That keeps AI calls cheap and storage small. By default apps built from this
 * starter do NOT keep the photo itself, only what was extracted from it.
 */

export interface CompressOptions {
  /** Longest edge in pixels. 1024 is plenty for vision models. */
  maxEdge?: number
  /** JPEG quality 0-1. */
  quality?: number
  mime?: 'image/jpeg' | 'image/webp'
}

export async function compressImage(file: Blob, options: CompressOptions = {}): Promise<Blob> {
  const { maxEdge = 1024, quality = 0.8, mime = 'image/jpeg' } = options
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get a 2D canvas context.')
    ctx.drawImage(bitmap, 0, 0, width, height)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed.'))),
        mime,
        quality,
      )
    })
  } finally {
    bitmap.close()
  }
}

/** Base64 payload (without the data: prefix) for sending to an Edge Function. */
export async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image.'))
    reader.readAsDataURL(blob)
  })
  return dataUrl.slice(dataUrl.indexOf(',') + 1)
}
