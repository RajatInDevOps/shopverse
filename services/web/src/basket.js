// basket.js — the storefront's own rules, kept out of the component so they
// can be tested without rendering anything.

/** Money, formatted the way a shop shows it. */
export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

/**
 * The basket total.
 *
 * Rounded once at the end, matching the orders service. If the storefront
 * rounded per line and the service rounded the sum, the customer would see
 * one price and be charged another — the kind of disagreement that only
 * surfaces after someone has paid.
 */
export function basketTotal(lines) {
  const sum = lines.reduce((acc, line) => acc + line.price * line.quantity, 0)
  return Math.round(sum * 100) / 100
}

/**
 * Add one unit of a product, or raise its quantity if already in the basket.
 *
 * Returns a new array rather than mutating: React compares by reference, and
 * an in-place push renders nothing.
 */
export function addToBasket(lines, product) {
  const existing = lines.find((line) => line.sku === product.id)
  if (existing) {
    return lines.map((line) =>
      line.sku === product.id ? { ...line, quantity: line.quantity + 1 } : line,
    )
  }
  return [...lines, { sku: product.id, name: product.name, price: product.price, quantity: 1 }]
}
