import { expect, test, describe } from "bun:test"
import { serializeProduct } from "../lib/domain/serializers/product.js"
import { serializeAddress } from "../lib/domain/serializers/address.js"
import { serializeOrder } from "../lib/domain/serializers/order.js"

describe("Domain Serializers", () => {
  test("serializeProduct formats ISO dates and parses comma-separated images", () => {
    const rawProduct = {
      id: "prod_1",
      name: "Wireless Earbuds",
      description: "Desc",
      mrp: 100,
      price: 80,
      images: "/p1.png,/p2.png",
      category: "Audio",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
      ratings: [
        {
          id: "rat_1",
          rating: 5,
          review: "Great",
          createdAt: new Date("2026-01-03T00:00:00Z"),
          updatedAt: new Date("2026-01-03T00:00:00Z")
        }
      ]
    }

    const serialized = serializeProduct(rawProduct)

    expect(serialized.images).toEqual(["/p1.png", "/p2.png"])
    expect(serialized.createdAt).toBe("2026-01-01T00:00:00.000Z")
    expect(serialized.rating[0].createdAt).toBe("2026-01-03T00:00:00.000Z")
  })

  test("serializeOrder formats nested address and orderItems products safely", () => {
    const rawOrder = {
      id: "ord_1",
      total: 160,
      status: "ORDER_PLACED",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      address: {
        id: "addr_1",
        name: "Test User",
        createdAt: new Date("2026-01-01T00:00:00Z")
      },
      orderItems: [
        {
          id: "item_1",
          productId: "prod_1",
          quantity: 2,
          price: 80,
          product: {
            id: "prod_1",
            name: "Earbuds",
            images: "/img.png",
            createdAt: new Date("2026-01-01T00:00:00Z")
          }
        }
      ]
    }

    const serialized = serializeOrder(rawOrder)

    expect(serialized.id).toBe("ord_1")
    expect(serialized.address.createdAt).toBe("2026-01-01T00:00:00.000Z")
    expect(serialized.orderItems[0].product.images).toEqual(["/img.png"])
  })

  test("handles null or undefined input gracefully", () => {
    expect(serializeProduct(null)).toBeNull()
    expect(serializeOrder(null)).toBeNull()
    expect(serializeAddress(null)).toBeNull()
  })
})
