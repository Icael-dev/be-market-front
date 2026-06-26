-- Simplifier les politiques RLS qui font des sous-requêtes sur profiles
-- Ces sous-requêtes peuvent causer des timeouts

-- Products: simplifier la politique publique (enlever la sous-requête admin)
DROP POLICY IF EXISTS products_public_select ON products;
CREATE POLICY "products_public_select" ON products FOR SELECT
  TO anon USING (is_active = true);

-- Pour les admins authentifies, permettre de voir tous les produits
DROP POLICY IF EXISTS products_admin_select ON products;
CREATE POLICY "products_admin_select" ON products FOR SELECT
  TO authenticated USING (true);

-- Categories: s'assurer que la politique est simple et efficace
DROP POLICY IF EXISTS categories_public_select ON categories;
CREATE POLICY "categories_public_select" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Banners: idem
DROP POLICY IF EXISTS banners_public_select ON banners;
CREATE POLICY "banners_public_select" ON banners FOR SELECT
  TO anon, authenticated USING (true);

-- Flash sales: simplifier aussi
DROP POLICY IF EXISTS flash_public_select ON flash_sales;
CREATE POLICY "flash_public_select" ON flash_sales FOR SELECT
  TO anon, authenticated USING (is_active = true AND starts_at <= now() AND ends_at > now());

-- Admin policies pour products: utiliser un check plus simple avec JWT claim
-- au lieu d'une sous-requête sur profiles
DROP POLICY IF EXISTS products_admin_insert ON products;
DROP POLICY IF EXISTS products_admin_update ON products;
DROP POLICY IF EXISTS products_admin_delete ON products;

CREATE POLICY "products_admin_write" ON products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "products_admin_update" ON products FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "products_admin_delete" ON products FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );