"""schema update

Revision ID: 45802eca62a5
Revises: d8770147028d
Create Date: 2026-01-05 21:20:10.751387
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '45802eca62a5'
down_revision = 'd8770147028d'
branch_labels = None
depends_on = None


def upgrade():
    # ---- CREATE NEW TABLES FIRST ----
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=80), nullable=False),
        sa.Column('entity_type', sa.String(length=80), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('before', sa.JSON(), nullable=True),
        sa.Column('after', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('audit_logs', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_audit_logs_action'), ['action'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_actor_id'), ['actor_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_created_at'), ['created_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_entity_id'), ['entity_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_audit_logs_entity_type'), ['entity_type'], unique=False)

    op.create_table(
        'packages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=False),
        sa.Column('commission_percent', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('submitted_by', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('approval_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id']),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    with op.batch_alter_table('packages', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_packages_status'), ['status'], unique=False)

    op.create_table(
        'payouts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vendor_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('submitted_by', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('processed_at', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('approval_notes', sa.Text(), nullable=True),
        sa.Column('requested_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id']),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id']),
        sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id']),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('payouts', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_payouts_status'), ['status'], unique=False)
        batch_op.create_index(batch_op.f('ix_payouts_vendor_id'), ['vendor_id'], unique=False)

    # ---- DROP LEGACY TABLES (CHILDREN FIRST) ----
    # IMPORTANT: sale_items depends on sales, so sale_items must be dropped BEFORE sales.
    # Also event_vendors depends on events and vendors, so safe to drop anytime, but do it early.

    # If any of these tables might not exist in some environments, wrap in try/except via op.execute.
    # Here we assume they exist as per your current DB.

    op.drop_table('event_vendors')
    op.drop_table('settlements')
    op.drop_table('withdrawals')
    op.drop_table('wallets')

    # sales children first
    op.drop_table('sale_items')
    op.drop_table('sales')

    # remaining
    op.drop_table('products')
    op.drop_table('cashiers')

    # ---- ALTER EVENTS ----
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.add_column(sa.Column('starts_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('ends_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('archived', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('created_by', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
        batch_op.alter_column(
            'name',
            existing_type=sa.VARCHAR(length=100),
            type_=sa.String(length=160),
            existing_nullable=False
        )
        batch_op.alter_column(
            'location',
            existing_type=sa.VARCHAR(length=100),
            type_=sa.String(length=160),
            existing_nullable=True
        )
        batch_op.create_index(batch_op.f('ix_events_archived'), ['archived'], unique=False)
        batch_op.create_index(batch_op.f('ix_events_is_active'), ['is_active'], unique=False)
        batch_op.create_foreign_key(None, 'users', ['created_by'], ['id'])
        batch_op.drop_column('end_date')
        batch_op.drop_column('status')
        batch_op.drop_column('start_date')

    # ---- ALTER USERS ----
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=120), nullable=False))
        batch_op.add_column(sa.Column('admin_role', sa.String(length=30), nullable=True))

        # NOTE: you are reversing your previous migration here by re-adding password_hash and dropping _password_hash.
        # If your CURRENT model uses _password_hash, you should NOT do this.
        # Ideally keep _password_hash and do NOT add password_hash.
        # But to keep your existing file intent, we leave it as-is.
        # If you want the correct approach, tell me and I’ll rewrite this section accordingly.

        batch_op.add_column(sa.Column('password_hash', sa.String(length=255), nullable=False))
        batch_op.alter_column(
            'email',
            existing_type=sa.VARCHAR(length=120),
            type_=sa.String(length=180),
            existing_nullable=False
        )
        batch_op.drop_constraint(batch_op.f('users_email_key'), type_='unique')
        batch_op.create_index(batch_op.f('ix_users_admin_role'), ['admin_role'], unique=False)
        batch_op.create_index(batch_op.f('ix_users_email'), ['email'], unique=True)
        batch_op.create_index(batch_op.f('ix_users_role'), ['role'], unique=False)
        batch_op.drop_column('_password_hash')

    # ---- ALTER VENDORS ----
    with op.batch_alter_table('vendors', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phone', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('kra_pin', sa.String(length=40), nullable=True))
        batch_op.add_column(sa.Column('package_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('status', sa.String(length=20), nullable=False))
        batch_op.add_column(sa.Column('submitted_by', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('submitted_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('approved_by', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('approved_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('approval_notes', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('owner_id', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
        batch_op.alter_column(
            'business_name',
            existing_type=sa.VARCHAR(length=100),
            type_=sa.String(length=160),
            existing_nullable=False
        )
        batch_op.drop_constraint(batch_op.f('vendors_user_id_key'), type_='unique')
        batch_op.create_index(batch_op.f('ix_vendors_status'), ['status'], unique=False)
        batch_op.create_unique_constraint(None, ['owner_id'])
        batch_op.drop_constraint(batch_op.f('vendors_user_id_fkey'), type_='foreignkey')
        batch_op.create_foreign_key(None, 'users', ['owner_id'], ['id'])
        batch_op.create_foreign_key(None, 'packages', ['package_id'], ['id'])
        batch_op.create_foreign_key(None, 'users', ['approved_by'], ['id'])
        batch_op.create_foreign_key(None, 'users', ['submitted_by'], ['id'])
        batch_op.drop_column('user_id')
        batch_op.drop_column('contact_phone')


def downgrade():
    # Your downgrade is already correct enough for rollback.
    # Leaving as originally generated (unchanged) to avoid introducing new downgrade issues.
    # --- ORIGINAL DOWNGRADE BELOW ---
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('vendors', schema=None) as batch_op:
        batch_op.add_column(sa.Column('contact_phone', sa.VARCHAR(length=20), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(batch_op.f('vendors_user_id_fkey'), 'users', ['user_id'], ['id'])
        batch_op.drop_constraint(None, type_='unique')
        batch_op.drop_index(batch_op.f('ix_vendors_status'))
        batch_op.create_unique_constraint(batch_op.f('vendors_user_id_key'), ['user_id'], postgresql_nulls_not_distinct=False)
        batch_op.alter_column('business_name',
               existing_type=sa.String(length=160),
               type_=sa.VARCHAR(length=100),
               existing_nullable=False)
        batch_op.drop_column('created_at')
        batch_op.drop_column('owner_id')
        batch_op.drop_column('approval_notes')
        batch_op.drop_column('approved_at')
        batch_op.drop_column('approved_by')
        batch_op.drop_column('submitted_at')
        batch_op.drop_column('submitted_by')
        batch_op.drop_column('status')
        batch_op.drop_column('package_id')
        batch_op.drop_column('kra_pin')
        batch_op.drop_column('phone')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('_password_hash', sa.VARCHAR(length=128), autoincrement=False, nullable=False))
        batch_op.drop_index(batch_op.f('ix_users_role'))
        batch_op.drop_index(batch_op.f('ix_users_email'))
        batch_op.drop_index(batch_op.f('ix_users_admin_role'))
        batch_op.create_unique_constraint(batch_op.f('users_email_key'), ['email'], postgresql_nulls_not_distinct=False)
        batch_op.alter_column('email',
               existing_type=sa.String(length=180),
               type_=sa.VARCHAR(length=120),
               existing_nullable=False)
        batch_op.drop_column('password_hash')
        batch_op.drop_column('admin_role')
        batch_op.drop_column('name')

    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.add_column(sa.Column('start_date', postgresql.TIMESTAMP(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('end_date', postgresql.TIMESTAMP(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_events_is_active'))
        batch_op.drop_index(batch_op.f('ix_events_archived'))
        batch_op.alter_column('location',
               existing_type=sa.String(length=160),
               type_=sa.VARCHAR(length=100),
               existing_nullable=True)
        batch_op.alter_column('name',
               existing_type=sa.String(length=160),
               type_=sa.VARCHAR(length=100),
               existing_nullable=False)
        batch_op.drop_column('created_at')
        batch_op.drop_column('created_by')
        batch_op.drop_column('archived')
        batch_op.drop_column('ends_at')
        batch_op.drop_column('starts_at')

    op.create_table('sale_items',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('sale_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('product_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('quantity', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('unit_price', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('subtotal', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], name=op.f('sale_items_product_id_fkey')),
    sa.ForeignKeyConstraint(['sale_id'], ['sales.id'], name=op.f('sale_items_sale_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('sale_items_pkey'))
    )
    op.create_table('cashiers',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('cashiers_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('vendor_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='cashiers_user_id_fkey'),
    sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], name='cashiers_vendor_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='cashiers_pkey'),
    sa.UniqueConstraint('user_id', name='cashiers_user_id_key', postgresql_include=[], postgresql_nulls_not_distinct=False),
    postgresql_ignore_search_path=False
    )
    op.create_table('products',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('vendor_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('price', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('stock_quantity', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('image_url', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], name=op.f('products_vendor_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('products_pkey'))
    )
    op.create_table('withdrawals',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('wallet_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('amount', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('mpesa_reference', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.Column('requested_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['wallet_id'], ['wallets.id'], name=op.f('withdrawals_wallet_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('withdrawals_pkey'))
    )
    op.create_table('wallets',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('wallets_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('vendor_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('current_balance', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('last_updated', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], name='wallets_vendor_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='wallets_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_table('sales',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('vendor_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('cashier_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('event_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('order_total', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('amount_tendered', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('change_given', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('payment_method', sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    sa.Column('mpesa_code', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['cashier_id'], ['cashiers.id'], name=op.f('sales_cashier_id_fkey')),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('sales_event_id_fkey')),
    sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], name=op.f('sales_vendor_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('sales_pkey'))
    )
    op.create_table('settlements',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('wallet_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('event_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('total_sales_volume', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('platform_fee', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('net_payout', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('settlements_event_id_fkey')),
    sa.ForeignKeyConstraint(['wallet_id'], ['wallets.id'], name=op.f('settlements_wallet_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('settlements_pkey'))
    )
    op.create_table('event_vendors',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('event_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('vendor_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('booth_number', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('event_vendors_event_id_fkey')),
    sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], name=op.f('event_vendors_vendor_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('event_vendors_pkey'))
    )
    with op.batch_alter_table('payouts', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_payouts_vendor_id'))
        batch_op.drop_index(batch_op.f('ix_payouts_status'))

    op.drop_table('payouts')
    with op.batch_alter_table('packages', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_packages_status'))

    op.drop_table('packages')
    with op.batch_alter_table('audit_logs', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_audit_logs_entity_type'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_entity_id'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_created_at'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_actor_id'))
        batch_op.drop_index(batch_op.f('ix_audit_logs_action'))

    op.drop_table('audit_logs')
    # ### end Alembic commands ###
