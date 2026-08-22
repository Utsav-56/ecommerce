export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
}

export function isAllowedRole(value) {
  return typeof value === 'string' && Object.values(ROLES).includes(value.trim().toUpperCase())
}
