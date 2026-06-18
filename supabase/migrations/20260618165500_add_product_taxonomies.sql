CREATE TABLE product_taxonomies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('color', 'material', 'usage', 'gender')),
  name TEXT NOT NULL,
  UNIQUE(type, name)
);

ALTER TABLE product_taxonomies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Taxonomies are viewable by everyone." ON product_taxonomies FOR SELECT USING (true);
CREATE POLICY "Taxonomies are insertable by admins." ON product_taxonomies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Taxonomies are updatable by admins." ON product_taxonomies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Taxonomies are deletable by admins." ON product_taxonomies FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Migrate existing distinct materials into product_taxonomies
INSERT INTO product_taxonomies (type, name)
SELECT DISTINCT 'material', material FROM products WHERE material IS NOT NULL AND material != '';

-- Add new columns to products
ALTER TABLE products ADD COLUMN color_id UUID REFERENCES product_taxonomies(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN material_id UUID REFERENCES product_taxonomies(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN usage_type_id UUID REFERENCES product_taxonomies(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN gender_id UUID REFERENCES product_taxonomies(id) ON DELETE SET NULL;

-- Link existing materials to the new material_id column
UPDATE products p
SET material_id = t.id
FROM product_taxonomies t
WHERE p.material = t.name AND t.type = 'material';

-- Drop the old text column
ALTER TABLE products DROP COLUMN material;
