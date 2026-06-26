-- Coupon codes table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Stock notifications
CREATE TABLE public.stock_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, product_id)
);

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support ticket messages
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal pages content
CREATE TABLE public.legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flash sales
CREATE TABLE public.flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty points
CREATE TABLE public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Loyalty transactions
CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired')),
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default legal pages
INSERT INTO public.legal_pages (slug, title, content) VALUES
('cgv', 'Conditions Generales de Vente', 'En passant commande sur Electronica, vous acceptez nos conditions generales de vente...'),
('returns', 'Politique de Retour', 'Vous disposez de 7 jours pour retourner un produit...'),
('privacy', 'Politique de Confidentialite', 'Nous nous engageons a proteger vos donnees personnelles...'),
('terms', 'Mentions Legales', 'Electronica - Boutique en ligne d''electronique...');

-- Insert default FAQs
INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
('Quels sont les delais de livraison ?', 'La livraison a Lome prend 24-48h. Pour les autres villes du Togo, comptez 3-5 jours.', 'livraison', 1),
('Comment payer ma commande ?', 'Nous acceptons les paiements via Tmoney, Flooz, ou en especes a la livraison.', 'paiement', 2),
('Puis-je retourner un produit ?', 'Oui, vous avez 7 jours pour retourner un produit defectueux ou non conforme.', 'retours', 3),
('Comment suivre ma commande ?', 'Connectez-vous a votre compte et consultez la section Mes Commandes pour suivre votre livraison.', 'commandes', 4),
('Proposez-vous une garantie ?', 'Tous nos produits sont garantis 1 an minimum.', 'garantie', 5);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "coupons_active_select" ON public.coupons FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "coupons_admin_all" ON public.coupons FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "newsletter_public_insert" ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);
CREATE POLICY "newsletter_self_delete" ON public.newsletter_subscribers FOR DELETE
  USING (email = (SELECT email FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "newsletter_admin_all" ON public.newsletter_subscribers FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "stock_notif_user_insert" ON public.stock_notifications FOR INSERT
  WITH CHECK (true);
CREATE POLICY "stock_notif_user_select" ON public.stock_notifications FOR SELECT
  USING (auth.uid() = user_id OR email IS NOT NULL);
CREATE POLICY "stock_notif_admin_all" ON public.stock_notifications FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "tickets_user_select" ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));
CREATE POLICY "tickets_user_insert" ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_user_update" ON public.support_tickets FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "messages_ticket_select" ON public.support_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true))));
CREATE POLICY "messages_ticket_insert" ON public.support_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "faqs_public_select" ON public.faqs FOR SELECT
  USING (is_active = true);
CREATE POLICY "faqs_admin_all" ON public.faqs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "legal_public_select" ON public.legal_pages FOR SELECT
  USING (true);
CREATE POLICY "legal_admin_all" ON public.legal_pages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "flash_public_select" ON public.flash_sales FOR SELECT
  USING (is_active = true AND starts_at <= NOW() AND ends_at > NOW());
CREATE POLICY "flash_admin_all" ON public.flash_sales FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "loyalty_user_select" ON public.loyalty_points FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "loyalty_user_insert" ON public.loyalty_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loyalty_user_update" ON public.loyalty_points FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "loyalty_trans_user" ON public.loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_coupons_active ON public.coupons(is_active, expires_at);
CREATE INDEX idx_stock_notif_product ON public.stock_notifications(product_id);
CREATE INDEX idx_tickets_status ON public.support_tickets(status, created_at);
CREATE INDEX idx_flash_sales_active ON public.flash_sales(is_active, starts_at, ends_at);

-- Update triggers
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_loyalty_updated_at BEFORE UPDATE ON public.loyalty_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_legal_updated_at BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();