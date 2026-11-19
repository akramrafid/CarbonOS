"""
Build a spatially-indexed GeoParquet extract of Bangladesh OpenStreetMap features
relevant to CarbonOS dMRV (forests, waterways, roads, brick kilns/industry, farmland)
from `inference/data/bangladesh-latest.osm.pbf`.

Run once after downloading `bangladesh-latest.osm.pbf`:
    python -m inference.carbon_monitoring.scripts.build_bd_geoparquet
"""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path

import duckdb

SCRIPT_DIR = Path(__file__).resolve().parent
INFERENCE_DIR = SCRIPT_DIR.parent.parent
sys.path.insert(0, str(INFERENCE_DIR))

from carbon_monitoring.osm_intelligence import QUACKOSM_TAGS_FILTER  # noqa: E402
import quackosm  # noqa: E402


def build_geoparquet(pbf_path: Path | None = None, output_path: Path | None = None) -> Path:
    src = pbf_path or (INFERENCE_DIR / "data" / "bangladesh-latest.osm.pbf")
    if not src.is_file():
        raise FileNotFoundError(f"OSM PBF file not found: {src}")

    dst = output_path or (INFERENCE_DIR / "data" / "bangladesh_dmrv.geoparquet")
    raw_parquet = INFERENCE_DIR / "data" / "osm_cache" / "_raw_quackosm.parquet"
    work_dir = INFERENCE_DIR / "data" / "osm_cache" / "quackosm_build"
    work_dir.mkdir(parents=True, exist_ok=True)
    dst.parent.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    print(f"[GeoParquet Build] Extracting filtered Bangladesh OSM features from {src}...")
    quackosm.convert_pbf_to_parquet(
        pbf_path=src,
        tags_filter=QUACKOSM_TAGS_FILTER,
        result_file_path=raw_parquet,
        keep_all_tags=False,
        explode_tags=False,
        sort_result=False,
        working_directory=str(work_dir),
        verbosity_mode="transient",
        ignore_cache=True,
    )
    print(f"[GeoParquet Build] QuackOSM pass completed in {time.time() - t0:.1f}s. Adding spatial bbox pushdown columns...")

    t1 = time.time()
    tmp_dst = dst.with_suffix(".geoparquet.tmp")
    duck_tmp = work_dir / "duckdb_spill"
    duck_tmp.mkdir(parents=True, exist_ok=True)
    con = duckdb.connect(":memory:")
    con.execute(f"SET temp_directory = '{str(duck_tmp).replace(chr(92), '/')}';")
    con.execute("SET memory_limit = '3GB';")
    con.execute("INSTALL spatial; LOAD spatial;")
    con.execute(f"""
        COPY (
            SELECT
                feature_id,
                tags,
                ST_XMin(geometry) AS xmin,
                ST_YMin(geometry) AS ymin,
                ST_XMax(geometry) AS xmax,
                ST_YMax(geometry) AS ymax,
                ST_AsWKB(geometry) AS geom_wkb
            FROM read_parquet('{str(raw_parquet).replace(chr(92), "/")}')
            WHERE geometry IS NOT NULL
            ORDER BY xmin, ymin
        ) TO '{str(tmp_dst).replace(chr(92), "/")}'
        (FORMAT PARQUET, COMPRESSION ZSTD, ROW_GROUP_SIZE 20000);
    """)
    con.close()

    os.replace(tmp_dst, dst)
    if raw_parquet.exists():
        try:
            raw_parquet.unlink()
        except OSError:
            pass

    size_mb = dst.stat().st_size / (1024 * 1024)
    print(f"[GeoParquet Build] Wrote {dst} ({size_mb:.1f} MB) in {time.time() - t1:.1f}s.")
    return dst


if __name__ == "__main__":
    build_geoparquet()
