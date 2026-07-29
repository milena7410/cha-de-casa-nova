CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  room TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'essencial',
  note TEXT,
  price NUMERIC(10, 2),
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  claimed_by TEXT,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  gift_id INTEGER,
  guest_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gifts_sort_order_idx ON gifts (sort_order, id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at DESC);
