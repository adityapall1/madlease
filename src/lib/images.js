export async function resizeImage(file, avatar = false) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG, or WebP image.')
  if (file.size > 25 * 1024 * 1024) throw new Error('Choose an image smaller than 25 MB.')
  const bitmap = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    canvas.width = avatar ? 512 : Math.round(bitmap.width * scale)
    canvas.height = avatar ? 512 : Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (avatar) {
      const side = Math.min(bitmap.width, bitmap.height)
      ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 512, 512)
    } else ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8))
    if (!blob || blob.type !== 'image/webp') throw new Error('This browser could not prepare a WebP image.')
    return blob
  } finally { bitmap.close() }
}
