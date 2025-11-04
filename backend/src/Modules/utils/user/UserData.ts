type Email = string
type AuthToken = string
type Password = string

export interface UserData {
  id: number
  userName: string
  password: Password
  email: Email
  config: Object
  displayName: string
  active: boolean
  authToken: AuthToken
  tokenCreated: Date
  firstLogin: boolean
  removed: boolean | undefined
}
