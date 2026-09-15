-- Migration for the dMRV prediction-interval + provenance extension.
--
-- The two new tables (carbon_mrv_groundtruthplot, carbon_mrv_estimateprovenance)
-- will be created automatically the next time init_db() runs, since
-- Base.metadata.create_all() only creates tables that don't exist yet.
--
-- The new columns on the EXISTING farmers_ai_carbonresult table will NOT be
-- created automatically - create_all() never alters existing tables. Run the
-- statements below once, by hand, against your dev SQLite file and your
-- production Postgres database.
--
-- Safe to run more than once? No - re-running will error on "column already
-- exists". Track that this has been applied, the same way you'd track any
-- other migration.

ALTER TABLE farmers_ai_carbonresult ADD COLUMN biomass_lower_90 REAL;
ALTER TABLE farmers_ai_carbonresult ADD COLUMN biomass_upper_90 REAL;
ALTER TABLE farmers_ai_carbonresult ADD COLUMN carbon_lower_90 REAL;
ALTER TABLE farmers_ai_carbonresult ADD COLUMN carbon_upper_90 REAL;
ALTER TABLE farmers_ai_carbonresult ADD COLUMN interval_method VARCHAR(50);

-- Notes:
-- - REAL / VARCHAR(50) work as-is on both SQLite and Postgres. If you're on
--   Postgres specifically, REAL and FLOAT are both fine here.
-- - All five columns are nullable by design: every row that predates this
--   migration legitimately has no interval, and NULL should stay NULL -
--   never backfill these with a guessed value.
-- - Once this has run, call init_db() (or just restart the FastAPI service,
--   since init_db() runs at import) to create the two new tables.
