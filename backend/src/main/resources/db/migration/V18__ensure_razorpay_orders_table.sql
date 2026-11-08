
CREATE TABLE IF NOT EXISTS razorpay_orders (
    id BIGSERIAL PRIMARY KEY,

    invoice_id BIGINT NOT NULL,

    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,

    razorpay_payment_id VARCHAR(100) UNIQUE,

    amount_paise BIGINT NOT NULL,

    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    verified_at TIMESTAMP,

    CONSTRAINT fk_razorpay_orders_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id),

    CONSTRAINT chk_razorpay_order_amount
        CHECK (amount_paise > 0),

    CONSTRAINT chk_razorpay_order_status
        CHECK (status IN ('CREATED', 'PAID', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_razorpay_orders_invoice
    ON razorpay_orders(invoice_id);
