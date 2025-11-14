export default function (str: string): string {
  return str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, '').trim()
}
