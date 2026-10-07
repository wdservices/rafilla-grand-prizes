import { afterEach, describe, expect, it } from "vitest";

import {
  addToCart,
  CART_MAX_QTY_PER_LINE,
  clearCart,
  getCartCount,
  getCartItems,
  removeFromCart,
  resolveCartLines,
  setCartQty,
} from "@/lib/cart-store";

afterEach(() => {
  clearCart();
  window.localStorage.clear();
});

const catalogue = [
  { slug: "car", title: "Car", entryPriceKobo: 250000 },
  { slug: "house", title: "House", entryPriceKobo: 500000 },
];

describe("cart store", () => {
  it("adds lines and merges quantities for the same competition", () => {
    addToCart("car", 10);
    addToCart("house", 1);
    addToCart("car", 5);
    expect(getCartItems()).toEqual([
      { competitionSlug: "car", quantity: 15 },
      { competitionSlug: "house", quantity: 1 },
    ]);
    expect(getCartCount()).toBe(16);
  });

  it("caps quantity per line and ignores invalid input", () => {
    addToCart("car", 999);
    expect(getCartItems()[0]?.quantity).toBe(CART_MAX_QTY_PER_LINE);
    addToCart("", 2);
    addToCart("house", 0);
    expect(getCartItems()).toHaveLength(1);
  });

  it("updates and removes lines", () => {
    addToCart("car", 4);
    setCartQty("car", 2);
    expect(getCartItems()[0]?.quantity).toBe(2);
    setCartQty("car", 0);
    expect(getCartItems()).toHaveLength(0);
    addToCart("car", 1);
    removeFromCart("car");
    expect(getCartItems()).toHaveLength(0);
  });

  it("persists across store reloads via localStorage", () => {
    addToCart("car", 3);
    const raw = window.localStorage.getItem("raffila:cart:v1");
    expect(raw).toContain("car");
  });

  it("resolves live prices and totals, dropping unknown slugs", () => {
    const { lines, subtotalKobo, totalQty } = resolveCartLines(
      [
        { competitionSlug: "car", quantity: 10 },
        { competitionSlug: "ghost", quantity: 2 },
      ],
      catalogue,
    );
    expect(lines).toHaveLength(1);
    expect(lines[0]?.lineTotalKobo).toBe(2500000);
    expect(subtotalKobo).toBe(2500000);
    expect(totalQty).toBe(10);
  });

  it("clamps quantity to remaining stock", () => {
    const { lines } = resolveCartLines(
      [{ competitionSlug: "car", quantity: 10 }],
      [{ slug: "car", title: "Car", entryPriceKobo: 250000, totalEntries: 100, entriesSold: 96 }],
    );
    expect(lines[0]?.quantity).toBe(4);
    expect(lines[0]?.remaining).toBe(4);
  });
});
