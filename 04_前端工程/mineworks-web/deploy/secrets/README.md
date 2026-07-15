# Production secrets

Do not commit real secret files.

Create these files in this folder:

```text
postgres_password.txt
database_url.txt
```

`postgres_password.txt` contains only a long random PostgreSQL password.

`database_url.txt` contains the full SQLAlchemy URL using the same password:

```text
postgresql+psycopg://mineworks_app:REPLACE_WITH_URL_ENCODED_PASSWORD@postgres:5432/mineworks
```

Requirements:

- use at least 32 random characters;
- URL-encode reserved password characters in `database_url.txt`;
- restrict file permissions to the deployment administrator;
- rotate both files together;
- never place either value in Git, screenshots, logs, tickets, or chat messages.
