import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGeodesicMetrics,
  estimateExpectedPixel,
  estimateExpectedPolygonAnalysis,
  getBangladeshEcoZone,
  parseLocalBoundaryFileText,
} from '../../src/lib/carbonFallbackEstimator.js';

test('getBangladeshEcoZone identifies Sundarbans and Inland Agroforestry strata', () => {
  const sundarbans = getBangladeshEcoZone(22.25, 89.5);
  assert.equal(sundarbans.stratumCode, 'SUNDARBANS_MANGROVE');

  const agro = getBangladeshEcoZone(22.87271, 89.16845);
  assert.equal(agro.stratumCode, 'INLAND_AGROFORESTRY');
});

test('estimateExpectedPixel returns deterministic unverified baseline pools and metrics', () => {
  const px = estimateExpectedPixel({ lat: 22.87271, lng: 89.16845 });
  assert.equal(px.eoPixelVerified, false);
  assert.equal(px.dataSource, 'expected_offline_baseline');
  assert.ok(Number(px.ndvi) > 0 && Number(px.ndvi) < 1);
  assert.ok(Number(px.biomass) >= 45 && Number(px.biomass) <= 95);
  assert.ok(Number(px.carbon) > 0);
  assert.ok(Number(px.carbonTotal) > Number(px.carbon));
});

test('estimateExpectedPolygonAnalysis produces clipped canopy grid cells and Verra pools', () => {
  const square = [
    [22.85, 89.15],
    [22.85, 89.19],
    [22.89, 89.19],
    [22.89, 89.15],
  ];
  const geo = calculateGeodesicMetrics(square);
  assert.ok(geo.areaHa > 1000);

  const job = estimateExpectedPolygonAnalysis({
    points: square,
    projectName: 'Shyamnagar Expected AOI',
    activeLayer: 'ndvi',
  });
  assert.equal(job.status, 'completed');
  assert.equal(job.is_expected_fallback, true);
  assert.ok(Array.isArray(job.grid_cells) && job.grid_cells.length > 0);
  assert.ok(job.result.tonnes_co2e > 0);
  assert.ok(job.baseline.net_creditable_tco2e > 0);
  assert.equal(job.provenance.data_source, 'expected_offline_baseline');
});

test('parseLocalBoundaryFileText handles both GeoJSON Polygon and KML polygons', () => {
  const geojson = JSON.stringify({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[[89.1, 22.8], [89.2, 22.8], [89.2, 22.9], [89.1, 22.8]]],
    },
  });
  const pts = parseLocalBoundaryFileText('plot.geojson', geojson);
  assert.deepEqual(pts, [
    [22.8, 89.1],
    [22.8, 89.2],
    [22.9, 89.2],
  ]);

  const kml = '<kml><Polygon><outerBoundaryIs><LinearRing><coordinates>89.1,22.8,0 89.2,22.8,0 89.2,22.9,0 89.1,22.8,0</coordinates></LinearRing></outerBoundaryIs></Polygon></kml>';
  const kmlPts = parseLocalBoundaryFileText('plot.kml', kml);
  assert.deepEqual(kmlPts, [
    [22.8, 89.1],
    [22.8, 89.2],
    [22.9, 89.2],
  ]);
});
