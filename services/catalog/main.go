// catalog — the product service.
//
// Deliberately dependency-free: the standard library is enough for a catalog,
// and every dependency added here is one more thing to install, scan and
// explain. It starts in milliseconds, which matters when a pipeline brings it
// up and waits for it.
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}

// catalogue is fixed data on purpose. A database would add a dependency, a
// migration and a failure mode, and would demonstrate nothing this service
// does not already show.
var catalogue = []Product{
	{ID: "sku-1", Name: "Aeron Desk Lamp", Price: 89.00, Stock: 12},
	{ID: "sku-2", Name: "Walnut Keyboard Tray", Price: 145.50, Stock: 4},
	{ID: "sku-3", Name: "Linen Chair Cover", Price: 62.25, Stock: 27},
	{ID: "sku-4", Name: "Brass Monitor Stand", Price: 210.00, Stock: 0},
}

// InStock reports the products a customer can actually buy.
//
// Separated from the handler so it can be tested without a server: the rule
// (stock above zero) is the part worth asserting on.
func InStock(all []Product) []Product {
	available := make([]Product, 0, len(all))
	for _, p := range all {
		if p.Stock > 0 {
			available = append(available, p)
		}
	}
	return available
}

func writeJSON(w http.ResponseWriter, payload any) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("encoding response: %v", err)
	}
}

func main() {
	mux := http.NewServeMux()

	// The health endpoint every orchestrator needs: no dependencies, so it
	// answers as soon as the process is listening.
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]string{"status": "ok", "service": "catalog"})
	})

	mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, InStock(catalogue))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("catalog listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
