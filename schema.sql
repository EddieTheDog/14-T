-- schema.sql
-- 14-T Database Schema

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  person_name TEXT NOT NULL,
  violation_type TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  item_name TEXT,
  product_number TEXT,
  serial_number TEXT,
  photo_base64 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  appeal_note TEXT,
  appeal_flagged INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS people (
  name TEXT PRIMARY KEY,
  total_points INTEGER NOT NULL DEFAULT 0
);
