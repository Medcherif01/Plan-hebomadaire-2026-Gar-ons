-- ============================================================
-- Schéma Supabase pour Plan Hebdomadaire 2026
-- À exécuter dans l'éditeur SQL de Supabase:
-- https://supabase.com/dashboard/project/mynulijeveqlkvtyjyll/sql/new
-- ============================================================

-- Table: plans (plans hebdomadaires)
-- Remplace la collection MongoDB "plans"
CREATE TABLE IF NOT EXISTS plans (
  week        INTEGER PRIMARY KEY,
  data        JSONB    NOT NULL DEFAULT '[]'::jsonb,
  class_notes JSONB    NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: lesson_plans (plans de leçon IA individuels)
-- Remplace la collection MongoDB "lessonPlans"
CREATE TABLE IF NOT EXISTS lesson_plans (
  id          TEXT PRIMARY KEY,
  week        INTEGER NOT NULL,
  enseignant  TEXT,
  classe      TEXT,
  matiere     TEXT,
  periode     TEXT,
  jour        TEXT,
  filename    TEXT,
  file_buffer TEXT,  -- base64 encoded file
  row_data    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lesson_plans_week_idx ON lesson_plans(week);

-- Table: weekly_lesson_plans (plans hebdomadaires Word générés)
-- Remplace la collection MongoDB "weeklyLessonPlans"
CREATE TABLE IF NOT EXISTS weekly_lesson_plans (
  id          TEXT PRIMARY KEY,
  week        INTEGER NOT NULL,
  classe      TEXT NOT NULL,
  filename    TEXT,
  file_data   TEXT,  -- base64 encoded file
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS weekly_lesson_plans_week_idx ON weekly_lesson_plans(week);

CREATE TRIGGER weekly_lesson_plans_updated_at
  BEFORE UPDATE ON weekly_lesson_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: push_subscriptions (abonnements notifications push)
-- Remplace les collections MongoDB "subscriptions" et "pushSubscriptions"
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           TEXT PRIMARY KEY,  -- endpoint ou username selon le contexte
  username     TEXT NOT NULL,
  subscription JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_username_idx ON push_subscriptions(username);

CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS (Row Level Security) - Désactivé pour le service role
-- Le backend utilise la clé service role qui bypasse le RLS
-- ============================================================

-- Activer RLS sur toutes les tables (sécurité)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique: accès total via service role (backend)
-- Le service role key bypasse automatiquement RLS
-- Aucune politique supplémentaire nécessaire pour le backend

-- ============================================================
-- Variables d'environnement requises (à configurer sur Vercel)
-- ============================================================
-- SUPABASE_URL=https://mynulijeveqlkvtyjyll.supabase.co
-- SUPABASE_SERVICE_ROLE_KEY=<votre clé service role depuis Settings > API>
-- (Remplacer MONGO_URL par ces deux variables)
-- ============================================================
