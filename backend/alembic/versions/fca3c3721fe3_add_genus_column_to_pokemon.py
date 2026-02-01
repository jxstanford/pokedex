"""add genus column to pokemon"""

from alembic import op
import sqlalchemy as sa

revision = "fca3c3721fe3"
down_revision = "202405030001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("pokemon", sa.Column("genus", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("pokemon", "genus")
