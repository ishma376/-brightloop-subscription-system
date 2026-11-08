
ALTER TABLE subscription_plans
ADD COLUMN product_id BIGINT;

ALTER TABLE subscription_plans
ADD CONSTRAINT fk_subscription_plans_product
FOREIGN KEY (product_id)
REFERENCES products(id);

CREATE INDEX idx_subscription_plans_product_id
ON subscription_plans(product_id);
