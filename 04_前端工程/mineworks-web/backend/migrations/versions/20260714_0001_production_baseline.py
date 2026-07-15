"""MineWorks production database baseline.

Revision ID: 20260714_0001
Revises: None
Create Date: 2026-07-14
"""
from alembic import op

from app.schema import metadata

revision = "20260714_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    metadata.create_all(bind=op.get_bind(), checkfirst=True)


def downgrade() -> None:
    metadata.drop_all(bind=op.get_bind(), checkfirst=True)
