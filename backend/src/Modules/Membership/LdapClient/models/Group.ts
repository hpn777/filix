/**
 * Represents an LDAP group
 */
export interface GroupProperties {
  dn?: string
  cn?: string
  gidNumber?: number
  member?: string[]
  memberOf?: string[]
  [key: string]: any
}

export class Group implements GroupProperties {
  dn?: string
  cn?: string
  gidNumber?: number
  member?: string[]
  memberOf?: string[]
  [key: string]: any

  constructor(properties?: GroupProperties) {
    if (properties) {
      for (const property in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, property)) {
          this[property] = properties[property]
        }
      }
    }
  }
}

export default Group
