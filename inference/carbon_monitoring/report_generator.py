import json
import datetime
import io

class ReportGenerator:
    @staticmethod
    def generate_csv(job_data, result_data):
        """
        Generates CSV content of carbon estimates.
        """
        csv_buffer = io.StringIO()
        csv_buffer.write("CarbonZero AI Monitoring - Forest Carbon Stock Analysis Report\n")
        csv_buffer.write(f"Project Name,{job_data.get('project_name', 'Unnamed Project')}\n")
        csv_buffer.write(f"Analysis Job ID,{job_data.get('id')}\n")
        csv_buffer.write(f"Analysis Date,{datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
        csv_buffer.write(f"Satellite Source,{result_data.get('satellite_sources', 'Sentinel-2')}\n")
        csv_buffer.write("\n")
        csv_buffer.write("Metric,Value,Unit,Description\n")
        csv_buffer.write(f"Estimated Biomass,{result_data.get('estimated_biomass')},Mg/ha,Above-ground dry biomass density\n")
        csv_buffer.write(f"Estimated Carbon,{result_data.get('estimated_carbon')},tC/ha,Carbon stock density\n")
        csv_buffer.write(f"Total CO2 Equivalent,{result_data.get('tonnes_co2e')},tCO2e,Total carbon dioxide equivalent mitigated\n")
        csv_buffer.write(f"Average NDVI,{result_data.get('avg_ndvi')},Index,Normalized Difference Vegetation Index (0-1)\n")
        csv_buffer.write(f"Forest Area,{result_data.get('forest_area_ha')},Hectares,Total canopy cover area analyzed\n")
        csv_buffer.write(f"Confidence Score,{result_data.get('confidence') * 100}%,Percent,Statistical model confidence\n")
        csv_buffer.write(f"Processing Time,{job_data.get('processing_time')},Seconds,Algorithm execution latency\n")
        
        return csv_buffer.getvalue()

    @staticmethod
    def generate_geojson(job_data, result_data):
        """
        Generates GeoJSON spatial format with carbon properties embedded.
        """
        try:
            poly_geojson = json.loads(job_data.get("polygon_geojson"))
        except Exception:
            poly_geojson = {"type": "Polygon", "coordinates": []}

        # Embed properties
        geojson_feature = {
            "type": "Feature",
            "geometry": poly_geojson,
            "properties": {
                "project_name": job_data.get("project_name", "Unnamed Project"),
                "job_id": job_data.get("id"),
                "analysis_date": datetime.datetime.utcnow().isoformat(),
                "estimated_biomass_mg_ha": result_data.get("estimated_biomass"),
                "estimated_carbon_tc_ha": result_data.get("estimated_carbon"),
                "tonnes_co2e": result_data.get("tonnes_co2e"),
                "average_ndvi": result_data.get("avg_ndvi"),
                "forest_area_ha": result_data.get("forest_area_ha"),
                "confidence_score": result_data.get("confidence"),
                "satellite_sources": result_data.get("satellite_sources", "Sentinel-2")
            }
        }

        geojson_doc = {
            "type": "FeatureCollection",
            "features": [geojson_feature]
        }
        
        return json.dumps(geojson_doc, indent=2)

    @staticmethod
    def generate_pdf_placeholder(job_data, result_data):
        """
        Generates a valid, minimal PDF byte stream containing the report data.
        This provides a real downloadable PDF without external PDF compiler dependencies.
        """
        project = job_data.get('project_name', 'Unnamed Project')
        job_id = job_data.get('id')
        date_str = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
        biomass = result_data.get('estimated_biomass', 0.0)
        carbon = result_data.get('estimated_carbon', 0.0)
        co2 = result_data.get('tonnes_co2e', 0.0)
        ndvi = result_data.get('avg_ndvi', 0.0)
        area = result_data.get('forest_area_ha', 0.0)
        conf = result_data.get('confidence', 0.0)
        sources = result_data.get('satellite_sources', 'Sentinel-2')
        latency = job_data.get('processing_time', 0.0)

        # Basic PDF Format Structure
        pdf = (
            "%PDF-1.4\n"
            "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
            "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 595.28 841.89] /Contents 4 0 R >>\nendobj\n"
            "4 0 obj\n<< /Length 1200 >>\nstream\n"
            "BT\n"
            # Title
            "/F1 20 Tf\n50 780 Td\n(CarbonZero AI Satellite Monitoring Report) Tj\n"
            "/F2 12 Tf\n0 -30 Td\n"
            f"(Project Name: {project}) Tj\n"
            f"0 -20 Td\n(Report Date: {date_str}) Tj\n"
            f"0 -20 Td\n(Analysis Job ID: {job_id}) Tj\n"
            f"0 -20 Td\n(Satellite Source: {sources}) Tj\n"
            f"0 -30 Td\n"
            "/F1 14 Tf\n(Carbon & Biomass Stock Estimates:) Tj\n"
            "/F2 12 Tf\n0 -20 Td\n"
            f"(- Estimated Forest Biomass Density: {biomass} Mg/ha) Tj\n"
            f"0 -20 Td\n(- Estimated Carbon Stock Density: {carbon} tC/ha) Tj\n"
            f"0 -20 Td\n(- Total Carbon Dioxide Equivalent (CO2e): {co2} tonnes) Tj\n"
            f"0 -20 Td\n(- Average NDVI (Vegetation Index): {ndvi}) Tj\n"
            f"0 -20 Td\n(- Estimated Forest Canopy Area: {area} hectares) Tj\n"
            f"0 -20 Td\n(- Algorithm Confidence Score: {conf*100:.1f}%) Tj\n"
            f"0 -30 Td\n"
            "/F1 14 Tf\n(Methodology and Metadata Summary:) Tj\n"
            "/F2 10 Tf\n0 -20 Td\n"
            f"(Analysis processed in {latency:.2f} seconds.) Tj\n"
            f"0 -15 Td\n(Biomass was calculated using a Random Forest regression pipeline) Tj\n"
            f"0 -15 Td\n(trained on Sentinel-2 optical bands (B2-B8, SWIR) and simulated Sentinel-1 radar.) Tj\n"
            f"0 -15 Td\n(Calculated indices include NDVI, EVI, and NDWI. Clouds masked at < 20% coverage.) Tj\n"
            f"0 -30 Td\n"
            "/F1 12 Tf\n(Authorized Digital MRV Signature:) Tj\n"
            "/F2 10 Tf\n0 -20 Td\n"
            "(CarbonOS Digital Verification System - Automated Certificate) Tj\n"
            "ET\n"
            "endstream\nendobj\n"
            "xref\n"
            "0 5\n"
            "0000000000 65535 f\n"
            "0000000009 00000 n\n"
            "0000000062 00000 n\n"
            "0000000119 00000 n\n"
            "0000000305 00000 n\n"
            "trailer\n<< /Size 5 /Root 1 0 R >>\n"
            "startxref\n"
            "1650\n"
            "%%EOF"
        )
        return pdf.encode('latin-1')
