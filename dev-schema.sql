-- =============================================================================
-- pluto-olympus dev schema  (safe to run on a fresh Supabase project)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- company
CREATE TABLE IF NOT EXISTS public.company (
    id                       BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                     TEXT         NOT NULL,
    provider_id              INTEGER,
    data_table               TEXT,
    total_number_soresidents INTEGER      DEFAULT 0,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id  BIGINT      REFERENCES public.company(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- roles
CREATE TABLE IF NOT EXISTS public.roles (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- permissions
CREATE TABLE IF NOT EXISTS public.permissions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    key         TEXT        NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- role_permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id       UUID NOT NULL REFERENCES public.roles(id)       ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id)  ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- case_managers
CREATE TABLE IF NOT EXISTS public.case_managers (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id        BIGINT      NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
    first_name        TEXT        NOT NULL,
    last_name         TEXT        NOT NULL,
    case_manager_name TEXT,
    email             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- platform_activity
CREATE TABLE IF NOT EXISTS public.platform_activity (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL,
    event_action    TEXT        NOT NULL,
    section         TEXT,
    sub_section     TEXT,
    metadata        JSONB,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- resident
CREATE TABLE IF NOT EXISTS public.resident (
    id                          BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id                  BIGINT        REFERENCES public.company(id) ON DELETE SET NULL,
    company_development_unit_id BIGINT,
    first_name                  TEXT          NOT NULL,
    last_name                   TEXT          NOT NULL,
    email                       TEXT,
    address                     TEXT,
    status                      TEXT,
    signed_up_date              TIMESTAMPTZ,
    move_in_date                DATE,
    annual_household_income     NUMERIC(12,2) DEFAULT 0,
    cash_savings                NUMERIC(12,2) DEFAULT 0,
    monthly_income              NUMERIC(12,2) DEFAULT 0,
    monthly_rent                NUMERIC(12,2) DEFAULT 0,
    service_charge              NUMERIC(12,2) DEFAULT 0,
    monthly_mortgage_payment    NUMERIC(12,2) DEFAULT 0,
    debt                        NUMERIC(12,2) DEFAULT 0,
    total_monthly_costs         NUMERIC(12,2) DEFAULT 0,
    current_share               NUMERIC(5,2)  DEFAULT 0,
    maximum_share               NUMERIC(5,2)  DEFAULT 100,
    purchase_price              NUMERIC(12,2),
    percentage_sold             NUMERIC(5,2),
    mortgage_amount             NUMERIC(12,2),
    mortgage_expiry_date        DATE,
    mortgage_rate               NUMERIC(6,4),
    mortgage_term               INTEGER,
    current_lender              TEXT,
    purchase_date               DATE,
    unit_type                   TEXT,
    postcode                    TEXT,
    city                        TEXT,
    county                      TEXT,
    created_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- resident_activity
CREATE TABLE IF NOT EXISTS public.resident_activity (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id     BIGINT      NOT NULL REFERENCES public.resident(id) ON DELETE CASCADE,
    event_action    TEXT        NOT NULL,
    section         TEXT,
    sub_section     TEXT,
    metadata        JSONB,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- client_transaction
CREATE TABLE IF NOT EXISTS public.client_transaction (
    id                  BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id          BIGINT        REFERENCES public.company(id)  ON DELETE SET NULL,
    resident_id         BIGINT        REFERENCES public.resident(id) ON DELETE SET NULL,
    rics_valuation      NUMERIC(12,2),
    transaction_deposit NUMERIC(12,2),
    share_to_purchase   NUMERIC(5,2),
    finance_method      TEXT,
    status              TEXT          NOT NULL DEFAULT 'draft',
    archived            BOOLEAN       NOT NULL DEFAULT FALSE,
    case_manager        UUID,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- resident_documents
CREATE TABLE IF NOT EXISTS public.resident_documents (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id   BIGINT      NOT NULL REFERENCES public.resident(id) ON DELETE CASCADE,
    filename      TEXT        NOT NULL,
    supabase_path TEXT        NOT NULL,
    document_type TEXT,
    document_size BIGINT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- resident_notes
CREATE TABLE IF NOT EXISTS public.resident_notes (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id      BIGINT      NOT NULL REFERENCES public.resident(id) ON DELETE CASCADE,
    parent_id        UUID        REFERENCES public.resident_notes(id) ON DELETE CASCADE,
    author_id        UUID        NOT NULL,
    author_name      TEXT        NOT NULL,
    body             TEXT        NOT NULL,
    attachment_path  TEXT,
    attachment_name  TEXT,
    is_pinned        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resident_notes_resident ON public.resident_notes (resident_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resident_notes_parent   ON public.resident_notes (parent_id);

-- resident_note_reactions
CREATE TABLE IF NOT EXISTS public.resident_note_reactions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id     UUID        NOT NULL REFERENCES public.resident_notes(id) ON DELETE CASCADE,
    author_id   UUID        NOT NULL,
    reaction    TEXT        NOT NULL CHECK (reaction IN ('up', 'down')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (note_id, author_id)
);

-- postcode_data
CREATE TABLE IF NOT EXISTS public.postcode_data (
    postcode        TEXT PRIMARY KEY,
    local_authority TEXT,
    region          TEXT,
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6)
);

-- company_development
CREATE TABLE IF NOT EXISTS public.company_development (
    id                  BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id          BIGINT       NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
    name                TEXT         NOT NULL UNIQUE,
    postcode            TEXT,
    city                TEXT,
    address             TEXT,
    is_shared_ownership BOOLEAN      NOT NULL DEFAULT FALSE,
    is_help_to_buy      BOOLEAN      NOT NULL DEFAULT FALSE,
    housing_provider    TEXT,
    completion_date     DATE,
    management_company  TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- company_development_units
CREATE TABLE IF NOT EXISTS public.company_development_units (
    id                        BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    development_id            BIGINT        NOT NULL REFERENCES public.company_development(id) ON DELETE CASCADE,
    internal_id               TEXT          UNIQUE,
    plot_number               TEXT,
    address_1                 TEXT,
    address_2                 TEXT,
    address_3                 TEXT,
    city                      TEXT,
    county                    TEXT,
    postcode                  TEXT,
    region                    TEXT,
    unit_type                 TEXT,
    lease_type                TEXT,
    status                    TEXT          NOT NULL DEFAULT 'occupied',
    purchase_date             DATE,
    purchase_price            NUMERIC(12,2),
    percentage_sold           NUMERIC(5,2),
    monthly_rent              NUMERIC(12,2),
    specified_rent            NUMERIC(12,2),
    specified_rent_percentage NUMERIC(5,2)  DEFAULT 2.75,
    service_charge            NUMERIC(12,2),
    house_price_index_value   NUMERIC(10,6),
    is_verified               BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- deferred FK on resident now that company_development_units exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'resident_unit_fkey'
    ) THEN
        ALTER TABLE public.resident
            ADD CONSTRAINT resident_unit_fkey
            FOREIGN KEY (company_development_unit_id)
            REFERENCES public.company_development_units(id) ON DELETE SET NULL;
    END IF;
END $$;

-- unit_valuation
CREATE TABLE IF NOT EXISTS public.unit_valuation (
    id                      BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    unit_id                 BIGINT        NOT NULL UNIQUE REFERENCES public.company_development_units(id) ON DELETE CASCADE,
    valuation_date          DATE,
    valuation_amount        NUMERIC(14,2),
    valuation_source        TEXT          DEFAULT 'Land Registry',
    house_price_index_value NUMERIC(10,6),
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- verification_tokens
CREATE TABLE IF NOT EXISTS public.verification_tokens (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token      TEXT        NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- password_history
CREATE TABLE IF NOT EXISTS public.password_history (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hashed_password TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, company_id)
    VALUES (NEW.id, NULLIF((NEW.raw_user_meta_data->>'company')::BIGINT, 0))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_resident_updated_at ON public.resident;
CREATE TRIGGER trg_resident_updated_at
    BEFORE UPDATE ON public.resident
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_client_transaction_updated_at ON public.client_transaction;
CREATE TRIGGER trg_client_transaction_updated_at
    BEFORE UPDATE ON public.client_transaction
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_unit_updated_at ON public.company_development_units;
CREATE TRIGGER trg_unit_updated_at
    BEFORE UPDATE ON public.company_development_units
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_unit_valuation_updated_at ON public.unit_valuation;
CREATE TRIGGER trg_unit_valuation_updated_at
    BEFORE UPDATE ON public.unit_valuation
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- RLS — permissive dev policies (allow all authenticated users everything)
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'profiles','company','roles','permissions','role_permissions',
        'user_roles','case_managers','platform_activity','resident',
        'resident_activity','client_transaction','resident_documents',
        'postcode_data','company_development','company_development_units',
        'unit_valuation','verification_tokens','password_history'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format(
            'DROP POLICY IF EXISTS dev_all ON public.%I;
             CREATE POLICY dev_all ON public.%I USING (true) WITH CHECK (true);',
            tbl, tbl
        );
    END LOOP;
END $$;

-- =============================================================================
-- STORAGE BUCKET
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SEED DATA
-- =============================================================================

INSERT INTO public.company (id, name, provider_id, data_table, total_number_soresidents)
OVERRIDING SYSTEM VALUE VALUES
    (1, 'Acme Housing Association', 1, 'acme_residents',    500),
    (2, 'Bossman Admin Company',    2, 'bossman_residents',   0)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('public.company','id'), GREATEST((SELECT MAX(id) FROM public.company), 1));

INSERT INTO public.roles (id, name) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'user'),
    ('00000000-0000-0000-0000-000000000003', 'bossman')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (id, key, description) VALUES
    ('00000000-0000-0000-0001-000000000001', 'view_valuation',    'Can view valuation pages'),
    ('00000000-0000-0000-0001-000000000002', 'manage_users',      'Can create and manage users'),
    ('00000000-0000-0000-0001-000000000003', 'view_transactions', 'Can view transactions'),
    ('00000000-0000-0000-0001-000000000004', 'view_activity',     'Can view activity logs'),
    ('00000000-0000-0000-0001-000000000005', 'manage_properties', 'Can manage developments and units'),
    ('00000000-0000-0000-0001-000000000006', 'view_insights',     'Can view insight dashboards')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000005'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000006'),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000003'),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000004'),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000006'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000001'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000002'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000003'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000004'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000005'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000006')
ON CONFLICT DO NOTHING;

INSERT INTO public.case_managers (id, company_id, first_name, last_name, case_manager_name, email) VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001', 1, 'Alice', 'Smith', 'alice.smith', 'alice@acme.example.com'),
    ('aaaaaaaa-0000-0000-0000-000000000002', 1, 'Bob',   'Jones', 'bob.jones',   'bob@acme.example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.postcode_data (postcode, local_authority, region) VALUES
    ('E1W1AB', 'City of London', 'London')
ON CONFLICT (postcode) DO NOTHING;

INSERT INTO public.company_development (id, company_id, name, postcode, city, is_shared_ownership, housing_provider, completion_date)
OVERRIDING SYSTEM VALUE VALUES
    (1, 1, 'Riverside Quarter', 'E1W1AB', 'London', TRUE, 'Acme Housing', '2022-06-01')
ON CONFLICT (name) DO NOTHING;

SELECT setval(pg_get_serial_sequence('public.company_development','id'), GREATEST((SELECT MAX(id) FROM public.company_development), 1));

INSERT INTO public.company_development_units
    (id, development_id, internal_id, address_1, postcode, city, unit_type, lease_type,
     status, purchase_date, purchase_price, percentage_sold, monthly_rent, service_charge,
     region, house_price_index_value, is_verified)
OVERRIDING SYSTEM VALUE VALUES
    (1, 1, 'RQ-001', 'Flat 1, Riverside Quarter', 'E1W1AB', 'London', 'flat', 'leasehold',
     'occupied', '2019-03-15', 280000, 25, 850, 120, 'London', 1.2345, TRUE),
    (2, 1, 'RQ-002', 'Flat 2, Riverside Quarter', 'E1W1AB', 'London', 'flat', 'leasehold',
     'occupied', '2020-07-01', 295000, 30, 870, 120, 'London', 1.3012, TRUE)
ON CONFLICT (internal_id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('public.company_development_units','id'), GREATEST((SELECT MAX(id) FROM public.company_development_units), 1));

INSERT INTO public.unit_valuation (unit_id, valuation_date, valuation_amount, valuation_source, house_price_index_value) VALUES
    (1, CURRENT_DATE, 312000.00, 'Land Registry', 1.3800),
    (2, CURRENT_DATE, 331500.00, 'Land Registry', 1.3800)
ON CONFLICT (unit_id) DO NOTHING;
