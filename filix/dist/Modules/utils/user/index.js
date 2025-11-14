"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = exports.superAdminRoleId = void 0;
const tslib_1 = require("tslib");
const roles_json_1 = tslib_1.__importDefault(require("../../../fixtures/roles.json"));
exports.superAdminRoleId = roles_json_1.default.find(r => r.roleName === 'superadmin' && r.id === 1)?.id;
const isSuperAdmin = (subscriptionManager, userId) => {
    const membershipDP = subscriptionManager.getDefaultMembershipModule();
    const userRolesTable = membershipDP.evH?.get('user_roles');
    if (!userRolesTable)
        return false;
    const userRoles = userRolesTable.getData();
    const isSuperAdmin = userRoles.find(ur => ur.user_id === userId && ur.roles_id === exports.superAdminRoleId);
    return !!isSuperAdmin;
};
exports.isSuperAdmin = isSuperAdmin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy91dGlscy91c2VyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxzRkFBZ0Q7QUFHbkMsUUFBQSxnQkFBZ0IsR0FBRyxvQkFBSyxDQUFDLElBQUksQ0FDeEMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FDL0MsRUFBRSxFQUFFLENBQUE7QUFFRSxNQUFNLFlBQVksR0FBRyxDQUMxQixtQkFBd0MsRUFDeEMsTUFBYyxFQUNkLEVBQUU7SUFDRixNQUFNLFlBQVksR0FBRyxtQkFBbUIsQ0FBQywwQkFBMEIsRUFBRSxDQUFBO0lBQ3JFLE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBRTFELElBQUksQ0FBQyxjQUFjO1FBQUUsT0FBTyxLQUFLLENBQUE7SUFFakMsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzFDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQ2pDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sS0FBSyxNQUFNLElBQUksRUFBRSxDQUFDLFFBQVEsS0FBSyx3QkFBZ0IsQ0FDaEUsQ0FBQTtJQUVELE9BQU8sQ0FBQyxDQUFDLFlBQVksQ0FBQTtBQUN2QixDQUFDLENBQUE7QUFmWSxRQUFBLFlBQVksZ0JBZXhCIn0=