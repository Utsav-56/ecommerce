export function validateCartQuantity(quantity) {
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty <= 0 || !Number.isFinite(qty)) {
    return { valid: false, error: 'Quantity must be a positive integer.' }
  }
  return { valid: true, value: qty }
}

export function validateAddressInput({ name, email, street, city, state, zip, country, phone }) {
  const fields = { name, email, street, city, state, zip, country, phone }
  for (const [key, val] of Object.entries(fields)) {
    if (!val || typeof val !== 'string' || !val.trim()) {
      return { valid: false, error: `Field '${key}' is required.` }
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Invalid email address.' }
  }

  return {
    valid: true,
    value: {
      name: name.trim(),
      email: email.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country.trim(),
      phone: phone.trim()
    }
  }
}
