import { expect, test, describe } from "bun:test"
import { buildCartItems, calculateCartTotal } from "../lib/domain/cart.js"

describe("Cart Domain Calculations", () => {
  const mockProducts = [
    { id: "prod_1", name: "Mouse", price: 25 },
    { id: "prod_2", name: "Keyboard", price: 75 }
  ]

  test("buildCartItems joins cart item dictionary with product list", () => {
    const cartDict = { prod_1: 2, prod_2: 1, prod_3: 5 }
    const items = buildCartItems(cartDict, mockProducts)

    expect(items.length).toBe(2)
    expect(items[0]).toEqual({ id: "prod_1", name: "Mouse", price: 25, quantity: 2 })
    expect(items[1]).toEqual({ id: "prod_2", name: "Keyboard", price: 75, quantity: 1 })
  })

  test("buildCartItems filters out zero, negative, or invalid non-integer quantities", () => {
    const cartDict = { prod_1: 0, prod_2: -3, prod_3: "invalid" }
    const items = buildCartItems(cartDict, mockProducts)

    expect(items.length).toBe(0)
  })

  test("calculateCartTotal sums item quantity * price", () => {
    const items = [
      { price: 25, quantity: 2 },
      { price: 75, quantity: 1 }
    ]

    expect(calculateCartTotal(items)).toBe(125)
  })
})
