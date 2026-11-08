
CREATE TABLE public.invoices (

    id BIGSERIAL PRIMARY KEY,

    invoice_number VARCHAR(50) NOT NULL UNIQUE,

    customer_id BIGINT NOT NULL
        REFERENCES public.customers(id),

    subscription_id BIGINT NOT NULL
        REFERENCES public.subscriptions(id),

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN (
            'DRAFT',
            'ISSUED',
            'PARTIALLY_PAID',
            'PAID',
            'OVERDUE',
            'CANCELLED'
        )),

    invoice_date DATE NOT NULL,

    due_date DATE NOT NULL,

    billing_period_start DATE NOT NULL,

    billing_period_end DATE NOT NULL,

    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,

    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,

    balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT invoice_valid_dates
        CHECK (
            due_date >= invoice_date
            AND billing_period_end >= billing_period_start
        ),

    CONSTRAINT invoice_nonnegative_amounts
        CHECK (
            subtotal >= 0
            AND discount_amount >= 0
            AND taxable_amount >= 0
            AND tax_amount >= 0
            AND total_amount >= 0
            AND amount_paid >= 0
            AND balance_due >= 0
        ),

    CONSTRAINT invoice_valid_payment
        CHECK (amount_paid <= total_amount),

    CONSTRAINT invoice_unique_billing_period
        UNIQUE (subscription_id, billing_period_start)
);

CREATE INDEX idx_invoices_customer_id
    ON public.invoices(customer_id);

CREATE INDEX idx_invoices_status_due_date
    ON public.invoices(status, due_date);
