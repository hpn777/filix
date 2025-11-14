// TODO: Prawdopodobnie ten kod jest do usunięcia jak się zastosuje zasadę "You Ain't Gonna Need It".
// Kod był przydatny podczas analizowania aplikacji. Nie jest wykorzystywany w aplikacji.
// To może warto przenieść w jakiś nowy folder typu /developer/tools/analyse/code-snippets.

export interface Header {
  name: string
  type: string
  title: string
}

export function joinColumnNamesWithData(headers: Header[], dataRow: any) {
  return getColumnsNames(headers).map((columnName: string, index: number) => ({
    [columnName]: dataRow[index],
  }))
}

const getColumnsNames = (headers: Header[]): string[] =>
  headers.map((header: Header): string => header.name)
