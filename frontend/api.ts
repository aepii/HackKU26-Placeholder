import { ArchSchema } from './types/chart.types'

const BASE = 'http://localhost:8000'

export async function validateArchitecture(imageUri: string, file?: File): Promise<ArchSchema> {
  const form = new FormData()

  if (file) {
    // Web: real File object from the browser
    form.append('file', file)
  } else {
    // Native device: React Native's special URI object
    form.append('file', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any)
  }

  const response = await fetch(`${BASE}/api/validate-architecture`, {
    method: 'POST',
    body: form,
  })

  if (!response.ok) {
    const error = await response.json()
    throw { response: { data: error } }
  }

  return response.json()
}