"""pytest bootstrap: point DATABASE_URL at a throwaway database before any test module is imported."""
import _isolated_db  # noqa: F401
