import { expect, test, describe } from "bun:test"
import { ELECTRONICS_CATEGORIES, isElectronicsCategory, parseImages, serializeImages } from "../lib/constants/categories.js"

describe("Category Constants & Utilities", () => {
  test("ELECTRONICS_CATEGORIES contains expected electronics categories", () => {
    expect(ELECTRONICS_CATEGORIES).toContain("Audio")
    expect(ELECTRONICS_CATEGORIES).toContain("Computers")
    expect(ELECTRONICS_CATEGORIES).toContain("Mobile Devices")
    expect(ELECTRONICS_CATEGORIES).toContain("Cameras")
    expect(ELECTRONICS_CATEGORIES).toContain("Wearables")
    expect(ELECTRONICS_CATEGORIES).toContain("Accessories")
  })

  test("isElectronicsCategory correctly validates category values", () => {
    expect(isElectronicsCategory("Audio")).toBe(true)
    expect(isElectronicsCategory("Wearables")).toBe(true)
    expect(isElectronicsCategory("  Cameras  ")).toBe(true)
    expect(isElectronicsCategory("Clothing")).toBe(false)
    expect(isElectronicsCategory("Food & Drink")).toBe(false)
    expect(isElectronicsCategory(null)).toBe(false)
  })

  test("serializeImages and parseImages work round-trip", () => {
    const imagesArr = ["/products/1.jpg", "/products/2.jpg"]
    const serialized = serializeImages(imagesArr)
    expect(serialized).toBe("/products/1.jpg,/products/2.jpg")

    const parsed = parseImages(serialized)
    expect(parsed).toEqual(imagesArr)
  })
})
