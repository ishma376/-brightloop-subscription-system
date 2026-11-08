
CREATE TABLE IF NOT EXISTS public.quotations (
    id BIGSERIAL PRIMARY KEY,

    quotation_number VARCHAR(50) NOT NULL UNIQUE,

    customer_id BIGINT NOT NULL
        REFERENCES public.customers(id),

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN (
            'DRAFT',
            'SENT',
            'CONFIRMED',
            'CANCELLED'
        )),

    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,

    valid_until DATE,

    notes TEXT,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT quotation_valid_date
        CHECK (
            valid_until IS NULL
            OR valid_until >= quotation_date
        )
);
