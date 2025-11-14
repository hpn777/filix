export default async function setup(): Promise<void> {
  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env

  if (!env) {
    return
  }

  if (!env.NODE_ENV) {
    env.NODE_ENV = 'test'
  }

  if (!env.TZ) {
    env.TZ = 'UTC'
  }
}
