# Source documents for the Bangladesh grid factor

Put the source files here: BPDB annual reports (FY2022-23 onward), the Petrobangla and BPC annual reports, the
coal operators' reports, the CEA CO2 Baseline Database and the IFI dataset. Then run

    python -m factors.bd_grid.sources

to record each file's SHA-256 in `../sources.json`. A file that later changes is reported and never re-recorded.
Extracted figures go in `../data/<FY>/method_a.json` and `method_b_plants.csv`, each with its document, table and
page. Licensed data (IEA, ecoinvent) needs the owner's approval first.
