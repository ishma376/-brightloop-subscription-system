
CREATE TABLE IF NOT EXISTS public.discounts (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    discount_type VARCHAR(20) NOT NULL
        CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),

    value NUMERIC(12,2) NOT NULL
        CHECK (value > 0),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT percentage_discount_limit
        CHECK (
            discount_type <> 'PERCENTAGE'
            OR value <= 100
        )
);

