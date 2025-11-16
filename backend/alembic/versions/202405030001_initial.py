"""initial schema

Revision ID: 202405030001
Revises: 
Create Date: 2024-05-03 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import pgvector.sqlalchemy

# revision identifiers, used by Alembic.
revision = "202405030001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "pokemon",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("types", sa.ARRAY(sa.String(length=32)), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("generation", sa.Integer(), nullable=False),
        sa.Column("height", sa.Float(), nullable=True),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.Column("abilities", sa.ARRAY(sa.String(length=64)), nullable=True),
        sa.Column("hp", sa.Integer(), nullable=True),
        sa.Column("attack", sa.Integer(), nullable=True),
        sa.Column("defense", sa.Integer(), nullable=True),
        sa.Column("special_attack", sa.Integer(), nullable=True),
        sa.Column("special_defense", sa.Integer(), nullable=True),
        sa.Column("speed", sa.Integer(), nullable=True),
        sa.Column("embedding", pgvector.sqlalchemy.Vector(512), nullable=True),
        sa.Column("model_version", sa.String(length=100), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "analysis_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("ip_address", postgresql.INET(), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
        sa.Column("top_match_id", sa.Integer(), nullable=True),
        sa.Column("top_match_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_index(
        "ix_pokemon_embedding",
        "pokemon",
        ["embedding"],
        postgresql_using="ivfflat",
        postgresql_with={"lists": 100},
        postgresql_ops={"embedding": "vector_cosine_ops"},
    )


def downgrade() -> None:
    op.drop_index("ix_pokemon_embedding", table_name="pokemon")
    op.drop_table("analysis_requests")
    op.drop_table("pokemon")
    op.execute("DROP EXTENSION IF EXISTS vector")
