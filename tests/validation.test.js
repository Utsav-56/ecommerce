import { expect, test, describe } from "bun:test"
import { normalizeElectronicsCategory } from "../lib/constants/categories.js"
import { validateCartQuantity } from "../lib/domain/validation.js"
import { isAllowedOrderStatus } from "../lib/constants/order.js"
import { isAllowedPaymentMethod } from "../lib/constants/payment.js"

describe("Domain Validation Boundaries", () => {
  test("normalizeElectronicsCategory trims and case-insensitively returns canonical category", () => {
    expect(normalizeElectronicsCategory("  cameras  ")).toBe("Cameras")
    expect(normalizeElectronicsCategory("audio")).toBe("Audio")
    expect(normalizeElectronicsCategory("WEARABLES")).toBe("Wearables")
    expect(normalizeElectronicsCategory("Clothing")).toBeNull()
  })

  test("validateCartQuantity rejects non-integers, zero, and negative values", () => {
    expect(validateCartQuantity(2)).toEqual({ valid: true, value: 2 })
    expect(validateCartQuantity("5")).toEqual({ valid: true, value: 5 })

    expect(validateCartQuantity(0).valid).toBe(false)
    expect(validateCartQuantity(-1).valid).toBe(false)
    expect(validateCartQuantity(1.5).valid).toBe(false)
    expect(validateCartQuantity("abc").valid).toBe(false)
  })

  test("isAllowedOrderStatus validates against allowed order statuses", () => {
    expect(isAllowedOrderStatus("ORDER_PLACED")).toBe(true)
    expect(isAllowedOrderStatus("DELIVERED")).toBe(true)
    expect(isAllowedOrderStatus("INVALID_STATUS")).toBe(false)
  })

  test("isAllowedPaymentMethod validates supported payment gateways", () => {
    expect(isAllowedPaymentMethod("COD")).toBe(true)
    expect(isAllowedPaymentMethod("ESEWA")).toBe(true)
    expect(isAllowedPaymentMethod("KHALTI")).toBe(true)
    expect(isAllowedPaymentMethod("PAYPAL")).toBe(false)
  })
})
