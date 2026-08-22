export function serializeAddress(address) {
  if (!address) return null
  return {
    ...address,
    createdAt: address.createdAt ? new Date(address.createdAt).toISOString() : new Date().toISOString()
  }
}
