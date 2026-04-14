export const ROLE_PERMISSIONS = {
  'super-admin': ['*'],
  admin: ['*'],
  cashier: [
    'dashboard-access',
    'customers-access',
    'customers-create',
    'service-orders-access',
    'service-orders-create',
    'service-orders-update',
    'part-sales-access',
    'part-sales-create',
    'part-sales-show',
    'part-sales-edit',
    'cash-management-access',
    'cash-management-manage',
  ],
  staff: [
    'dashboard-access',
    'customers-access',
    'customers-create',
    'service-orders-access',
    'service-orders-create',
    'service-orders-update',
    'part-sales-access',
    'part-sales-create',
    'part-sales-show',
    'part-sales-edit',
    'cash-management-access',
    'cash-management-manage',
  ],
  supervisor: [
    'dashboard-access',
    'customers-access', 'customers-create', 'customers-edit',
    'vehicles-access', 'vehicles-create', 'vehicles-edit',
    'mechanics-access', 'mechanics-create', 'mechanics-update',
    'services-access', 'services-create', 'services-edit',
    'service-orders-access', 'service-orders-create', 'service-orders-update',
    'appointments-access', 'appointments-create', 'appointments-update',
    'parts-access', 'parts-create', 'parts-update',
    'suppliers-access', 'suppliers-create', 'suppliers-update',
    'part-purchases-access', 'part-purchases-create', 'part-purchases-update',
    'part-sales-access', 'part-sales-show', 'part-sales-edit',
    'part-stock-history-access', 'parts-stock-access',
    'reports-access',
    'cash-management-access',
  ],
  mechanic: [
    'dashboard-access',
    'service-orders-access', 'service-orders-update',
    'appointments-access',
    'vehicles-access',
    'customers-access',
    'parts-access',
    'reports-access',
  ],
  customer: [
    'dashboard-access',
    'appointments-access',
    'service-orders-access',
    'vehicles-access',
  ],
}

export function buildPermissionMap(roles = []) {
  const map = {}
  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role] || []
    for (const permission of perms) {
      map[permission] = true
    }
  }
  return map
}

export function buildPermissionMapFromList(permissionList = []) {
  const map = {}
  for (const permission of permissionList) {
    if (typeof permission === 'string' && permission.trim()) {
      map[permission] = true
    }
  }
  return map
}

export function hasPermission(permissionMap, permission) {
  if (!permission) return false
  if (permissionMap['*']) return true
  return Boolean(permissionMap[permission])
}

export function hasAnyPermission(permissionMap, permissions = []) {
  if (!Array.isArray(permissions) || permissions.length === 0) return true
  if (permissionMap['*']) return true
  return permissions.some((permission) => Boolean(permissionMap[permission]))
}
