export function getEnumKeyByValue(
  enumObj: any,
  value: string,
): string | undefined {
  return Object.entries(enumObj).find(
    ([_key, val]: [string, unknown]): boolean => val === value,
  )?.[0]
}
