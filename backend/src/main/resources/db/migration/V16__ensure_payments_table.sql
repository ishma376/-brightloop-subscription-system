
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,

    invoice_id BIGINT NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    payment_method VARCHAR(50) NOT NULL,

    reference_number VARCHAR(100),

    payment_date DATE NOT NULL,

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id),

    CONSTRAINT chk_payments_amount
        CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id
    ON payments(invoice_id);
