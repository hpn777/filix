/**
 * Represents an LDAP user account
 */
export interface UserProperties {
  dn?: string
  sn?: string
  cn?: string
  gidNumber?: number
  uid?: string
  displayName?: string
  mail?: string
  groups?: Array<{ cn?: string; [key: string]: any }>
  [key: string]: any
}

export class User implements UserProperties {
  dn?: string
  sn?: string
  cn?: string
  gidNumber?: number
  uid?: string
  displayName?: string
  mail?: string
  groups?: Array<{ cn?: string; [key: string]: any }>
  [key: string]: any

  constructor(properties?: UserProperties) {
    if (properties) {
      for (const property in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, property)) {
          this[property] = properties[property]
        }
      }
    }
  }

  /**
   * Checks to see if the user is a member of the specified group
   * @param group The name of the group to check for membership
   * @returns true if user is a member, false otherwise
   */
  isMemberOf(group: string): boolean {
    if (!group) return false

    return (this.groups || []).some(
      item => ((item || {}).cn || '').toLowerCase() === (group || '').toLowerCase()
    )
  }
}

export default User
