/**
 * Type definitions for LdapClient module
 */

/**
 * LDAP client configuration
 */
export interface LdapClientConfig {
  url: string
  baseDN: string
  username: string
  password: string
  group?: string // Optional group filter for operations
}

/**
 * LDAP search options
 */
export interface SearchOptions {
  filter: string
  scope: string
  attributes?: string[]
  sizeLimit?: number
  timeLimit?: number
}

/**
 * Parsed LDAP search result entry
 */
export interface LdapEntry {
  dn?: string
  [key: string]: any
}

/**
 * Generic LDAP callback type
 */
export type LdapCallback<T> = (err: LdapError | null, result?: T) => void

/**
 * Authentication callback type
 */
export type AuthCallback = (err: LdapError | null, authenticated: boolean) => void

/**
 * LDAP error structure
 */
export interface LdapError {
  code?: number
  errno?: string
  description?: string
  message?: string
}

/**
 * Range retrieval specifier for paginated attributes
 */
export interface RangeSpecifier {
  attributeName: string
  low: number
  high: number | null
}
