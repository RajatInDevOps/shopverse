import { useEffect, useState } from 'react'
import { addToBasket, basketTotal, formatPrice } from './basket.js'

// Both backends are reached through the ingress on the same origin, so these
// are relative paths. An absolute URL would pin the storefront to one
// environment and break the moment it is deployed anywhere else.
const CATALOG = '/api/catalog/products'
const ORDERS = '/api/orders/orders'

export default function App() {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)
  const [lines, setLines] = useState([])
  const [confirmation, setConfirmation] = useState(null)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    fetch(CATALOG)
      .then((r) => {
        if (!r.ok) throw new Error(`catalog answered ${r.status}`)
        return r.json()
      })
      .then(setProducts)
      .catch((e) => setError(e.message))
  }, [])

  async function placeOrder() {
    setPlacing(true)
    setError(null)
    try {
      const response = await fetch(ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: 'demo', lines }),
      })
      if (!response.ok) throw new Error(`orders answered ${response.status}`)
      setConfirmation(await response.json())
      setLines([])
    } catch (e) {
      setError(e.message)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="shell">
      <header className="masthead">
        <div className="wordmark">
          <span className="mark" aria-hidden="true" />
          ShopVerse
        </div>
        <div className="services">
          <ServicePill name="web" stack="React" />
          <ServicePill name="catalog" stack="Go" />
          <ServicePill name="orders" stack="Python" />
        </div>
      </header>

      <main className="grid">
        <section>
          <h1>Workspace goods</h1>
          <p className="lede">
            Three services, three languages, one deployment. This page is served by
            nginx in Kubernetes; the products come from the Go service and the
            checkout from the Python one.
          </p>

          {error && <p className="error">Could not reach a service: {error}</p>}
          {!products && !error && <p className="muted">Loading the catalogue…</p>}

          <div className="products">
            {(products || []).map((p) => (
              <article key={p.id} className="product">
                <div className="product-head">
                  <h2>{p.name}</h2>
                  <span className="sku">{p.id}</span>
                </div>
                <div className="product-foot">
                  <span className="price">{formatPrice(p.price)}</span>
                  <span className="stock">{p.stock} in stock</span>
                </div>
                <button onClick={() => setLines((l) => addToBasket(l, p))}>Add to basket</button>
              </article>
            ))}
          </div>
        </section>

        <aside className="basket">
          <h2>Basket</h2>
          {lines.length === 0 && <p className="muted">Nothing yet.</p>}

          {lines.map((line) => (
            <div key={line.sku} className="line">
              <span className="line-name">
                {line.name} <span className="muted">× {line.quantity}</span>
              </span>
              <span className="line-price">{formatPrice(line.price * line.quantity)}</span>
            </div>
          ))}

          {lines.length > 0 && (
            <>
              <div className="total">
                <span>Total</span>
                <span>{formatPrice(basketTotal(lines))}</span>
              </div>
              <button className="checkout" onClick={placeOrder} disabled={placing}>
                {placing ? 'Placing…' : 'Place order'}
              </button>
            </>
          )}

          {confirmation && (
            <div className="confirmation">
              <strong>Order {confirmation.id} confirmed</strong>
              <span>{formatPrice(confirmation.total)} · handled by the Python service</span>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}

function ServicePill({ name, stack }) {
  return (
    <span className="pill">
      <b>{name}</b>
      <span>{stack}</span>
    </span>
  )
}
