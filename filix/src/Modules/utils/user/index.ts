import { SubscriptionManager } from '../../../subscriptionManager'
import roles from '../../../fixtures/roles.json'

// TODO: Move all functions and modules to a separate file
export const superAdminRoleId = roles.find(
  r => r.roleName === 'superadmin' && r.id === 1,
)?.id

export const isSuperAdmin = (
  subscriptionManager: SubscriptionManager,
  userId: number,
) => {
  const membershipDP = subscriptionManager.getDefaultMembershipModule()
  const userRolesTable = membershipDP.evH?.get('user_roles')
  
  if (!userRolesTable) return false

  const userRoles = userRolesTable.getData()
  const isSuperAdmin = userRoles.find(
    ur => ur.user_id === userId && ur.roles_id === superAdminRoleId,
  )

  return !!isSuperAdmin
}
