import api from "@/lib/api"

export async function downloadFile(endpoint: string, fallbackFilename: string) {
  const response = await api.get<Blob>(endpoint, { responseType: "blob" })
  const contentDisposition = response.headers["content-disposition"] as string | undefined
  const filename = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] || fallbackFilename
  const url = URL.createObjectURL(response.data)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
