
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,

    billing_period VARCHAR(20) NOT NULL
        CHECK (billing_period IN (
            'DAILY',
            'WEEKLY',
            'MONTHLY',
            'YEARLY'
        )),

    price NUMERIC(12,2) NOT NULL
        CHECK (price >= 0),

    minimum_quantity INTEGER NOT NULL DEFAULT 1
        CHECK (minimum_quantity >= 1),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    allow_pause BOOLEAN NOT NULL DEFAULT FALSE,

    allow_early_close BOOLEAN NOT NULL DEFAULT FALSE,

    auto_close BOOLEAN NOT NULL DEFAULT FALSE,

    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);
