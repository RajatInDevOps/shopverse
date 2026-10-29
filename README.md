# ShopVerse

A small storefront built as three services in three languages, so that a
delivery pipeline has something real to carry.

| Service   | Language        | Port | Route           | Does |
|-----------|-----------------|------|-----------------|------|
| `web`     | React (Vite)    | 80   | `/`             | The storefront a customer sees |
| `catalog` | Go              | 8080 | `/api/catalog`  | Products and stock levels |
| `orders`  | Python (FastAPI)| 8000 | `/api/orders`   | Baskets and checkout |

## There are no Dockerfiles here, on purpose

This repository contains application source and nothing else — no Dockerfile,
no Kubernetes manifest, no CI file, no compose file. Those are written by
DevSandbox from the code itself, which is the point: a team should not have to
hand-write the same four files for every service before anything can ship.

## Running the tests by hand

Each service carries its own tests, and they are the project's own — nothing
here is generated.

```bash
cd services/catalog && go test ./...
cd services/orders  && pip install -r requirements.txt && pytest
cd services/web     && npm install && npm test
```

## How the services talk

The storefront calls `/api/catalog/products` and `/api/orders/orders` as
relative paths on its own origin. The ingress routes `/api/<service>` to the
right container and strips the prefix, so each service sees a clean path and
nothing is hard-coded to an environment.
