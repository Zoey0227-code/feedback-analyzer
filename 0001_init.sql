DROP TABLE IF EXISTS feedback;

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  priority TEXT NOT NULL,
  text TEXT NOT NULL,
  summary TEXT,
  sentiment TEXT,
  theme TEXT,
  urgency TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
