"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lowercaseKeys = lowercaseKeys;
function lowercaseKeys(obj) {
    const entries = Object.entries(obj).map(([key, value]) => [key.toLowerCase(), value]);
    return Object.fromEntries(entries);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL0dlbmVyaWNEQi9kYk1ldGEvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHNDQUdDO0FBSEQsU0FBZ0IsYUFBYSxDQUEwQixHQUFNO0lBQzNELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDckYsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLENBQUMifQ==