-- Supprimer les anciennes policies et recréer des plus simples sans circular reference
DROP POLICY IF EXISTS profiles_own_select ON profiles;
DROP POLICY IF EXISTS profiles_own_insert ON profiles;
DROP POLICY IF EXISTS profiles_own_update ON profiles;

-- Permettre à chaque utilisateur de lire son propre profil (simple, sans sous-requête circulaire)
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Permettre à chaque utilisateur de créer son profil
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Permettre à chaque utilisateur de modifier son propre profil
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Permettre aussi la lecture publique du profil (pour les admins qui lisent d'autres profils)
CREATE POLICY "profiles_admin_select" ON profiles FOR SELECT
  TO authenticated USING (true);