package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestInStockHidesSoldOutProducts(t *testing.T) {
	got := InStock(catalogue)

	for _, p := range got {
		if p.Stock == 0 {
			t.Errorf("%s is sold out and should not be offered", p.Name)
		}
	}
	// The fixture deliberately contains one sold-out item, so a filter that
	// returns everything would pass a weaker assertion than this one.
	if len(got) != len(catalogue)-1 {
		t.Errorf("expected exactly one product to be filtered out, got %d of %d",
			len(got), len(catalogue))
	}
}

func TestInStockOnEmptyCatalogue(t *testing.T) {
	// Must return an empty slice, not nil: nil encodes as JSON null and the
	// storefront would render nothing rather than "no products".
	got := InStock(nil)
	if got == nil {
		t.Fatal("InStock returned nil, which encodes as JSON null")
	}
	if len(got) != 0 {
		t.Errorf("expected no products, got %d", len(got))
	}
}

func TestHealthEndpointAnswers(t *testing.T) {
	rec := httptest.NewRecorder()
	writeJSON(rec, map[string]string{"status": "ok", "service": "catalog"})

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("health response is not valid JSON: %v", err)
	}
	if body["status"] != "ok" {
		t.Errorf("status = %q, want ok", body["status"])
	}
}
