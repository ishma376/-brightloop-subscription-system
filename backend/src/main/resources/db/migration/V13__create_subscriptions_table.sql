
CREATE TABLE IF NOT EXISTS public.subscriptions (

    id BIGSERIAL PRIMARY KEY,

    customer_id BIGINT NOT NULL
        REFERENCES public.customers(id),

    quotation_id BIGINT UNIQUE
        REFERENCES public.quotations(id),

    plan_id BIGINT NOT NULL
        REFERENCES public.subscription_plans(id),

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN (
            'DRAFT',
            'CONFIRMED',
            'ACTIVE',
            'PAUSED',
            'CLOSED',
            'CANCELLED'
        )),

    start_date DATE NOT NULL,

    end_date DATE,

    next_billing_date DATE,

    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT subscription_valid_dates
        CHECK (
            end_date IS NULL
            OR end_date >= start_date
        )
);
