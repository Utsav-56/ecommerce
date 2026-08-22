import { expect, test, describe } from "bun:test"
import { initiateEsewaPayment } from "../lib/domain/payments/esewa.js"

describe("Payment Domain Utilities", () => {
  test("initiateEsewaPayment generates signed checkout redirect URL", () => {
    const redirectUrl = initiateEsewaPayment({
      orderId: "order_123",
      totalAmount: 100
    })

    expect(redirectUrl).toContain("/checkout/esewa?")
    expect(redirectUrl).toContain("transaction_uuid=order_123")
    expect(redirectUrl).toContain("amount=100")
    expect(redirectUrl).toContain("signature=")
  })
})
