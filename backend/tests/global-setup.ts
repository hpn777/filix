export default async function globalSetup(): Promise<void> {
  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env

  if (env?.IN_DOCKER === 'true') {
    return
  }

  // Local runs can enable additional hooks here if needed
}
