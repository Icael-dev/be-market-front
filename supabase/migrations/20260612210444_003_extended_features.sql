-- Wishlist table
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Banners table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text TEXT,
  position TEXT DEFAULT 'home',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
('shipping_fee', '2500', 'Frais de livraison standard en FCFA'),
('free_shipping_threshold', '50000', 'Montant minimum pour livraison gratuite en FCFA'),
('tax_rate', '0', 'Taux de taxe en pourcentage'),
('currency', 'FCFA', 'Devise utilisee'),
('store_name', 'Electronica', 'Nom de la boutique'),
('store_email', 'contact@electronica.tg', 'Email de contact'),
('store_phone', '+228 90 00 00 00', 'Telephone de contact');

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlist
CREATE POLICY "wishlist_own_select" ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "wishlist_own_insert" ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_own_delete" ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for banners (public read, admin write)
CREATE POLICY "banners_public_select" ON public.banners FOR SELECT
  USING (true);
CREATE POLICY "banners_admin_insert" ON public.banners FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
CREATE POLICY "banners_admin_update" ON public.banners FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
CREATE POLICY "banners_admin_delete" ON public.banners FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

-- RLS Policies for blog_posts (public read published, admin write)
CREATE POLICY "blog_public_select" ON public.blog_posts FOR SELECT
  USING (is_published = true OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
CREATE POLICY "blog_admin_insert" ON public.blog_posts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
CREATE POLICY "blog_admin_update" ON public.blog_posts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
CREATE POLICY "blog_admin_delete" ON public.blog_posts FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

-- RLS Policies for settings (public read, admin write)
CREATE POLICY "settings_public_select" ON public.settings FOR SELECT
  USING (true);
CREATE POLICY "settings_admin_update" ON public.settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

-- Indexes
CREATE INDEX idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_product ON public.wishlist(product_id);
CREATE INDEX idx_banners_active ON public.banners(is_active) WHERE is_active = true;
CREATE INDEX idx_blog_published ON public.blog_posts(is_published, published_at) WHERE is_published = true;

-- Update trigger for banners
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update trigger for blog_posts
CREATE TRIGGER update_blog_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update trigger for settings
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();