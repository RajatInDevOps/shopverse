import { describe, expect, it } from 'vitest'
import { addToBasket, basketTotal, formatPrice } from './basket.js'

describe('basketTotal', () => {
  it('multiplies price by quantity', () => {
    expect(basketTotal([{ price: 89, quantity: 2 }, { price: 62.25, quantity: 1 }])).toBe(240.25)
  })

  it('rounds once at the end, agreeing with the orders service', () => {
    // Round per line and this is 99.99; round the sum and it is 100.00.
    // The orders service asserts the same figure, so the price shown here
    // and the price charged there cannot drift apart.
    const lines = [1, 2, 3].map(() => ({ price: 33.333, quantity: 1 }))
    expect(basketTotal(lines)).toBe(100)
  })

  it('is zero for an empty basket', () => {
    expect(basketTotal([])).toBe(0)
  })
})

describe('addToBasket', () => {
  const lamp = { id: 'sku-1', name: 'Aeron Desk Lamp', price: 89 }

  it('adds a product that is not there yet', () => {
    expect(addToBasket([], lamp)).toEqual([
      { sku: 'sku-1', name: 'Aeron Desk Lamp', price: 89, quantity: 1 },
    ])
  })

  it('raises the quantity instead of duplicating the line', () => {
    const once = addToBasket([], lamp)
    const twice = addToBasket(once, lamp)
    expect(twice).toHaveLength(1)
    expect(twice[0].quantity).toBe(2)
  })

  it('returns a new array so React re-renders', () => {
    const lines = []
    expect(addToBasket(lines, lamp)).not.toBe(lines)
  })
})

describe('formatPrice', () => {
  it('shows two decimal places and a currency symbol', () => {
    expect(formatPrice(89)).toBe('$89.00')
  })
})
