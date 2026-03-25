import sqlite3

conn = sqlite3.connect("techtunes.db")
cur = conn.cursor()

# Create nonprofits table if it doesn't exist
cur.execute("""
    CREATE TABLE IF NOT EXISTS nonprofits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR UNIQUE NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        password_hash VARCHAR NOT NULL,
        is_verified BOOLEAN NOT NULL DEFAULT 0,
        balance INTEGER NOT NULL DEFAULT 0
    )
""")

# Recreate sessions with user_id nullable and nonprofit_id added
cur.execute("ALTER TABLE sessions RENAME TO sessions_old")
cur.execute("""
    CREATE TABLE sessions (
        token VARCHAR PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        nonprofit_id INTEGER REFERENCES nonprofits(id)
    )
""")
cur.execute("INSERT INTO sessions (token, user_id) SELECT token, user_id FROM sessions_old")
cur.execute("DROP TABLE sessions_old")

conn.commit()
conn.close()
print("Migration complete.")
