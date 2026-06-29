import os
import requests
import json
import time
from typing import Dict, List, Optional

class CopernicusClient:
    """
    Client for Copernicus Data Space Ecosystem (CDSE) API.
    Used to search and download raw Sentinel-1 & Sentinel-2 products.
    """
    def __init__(self):
        self.username = os.getenv("COPERNICUS_USERNAME", "")
        self.password = os.getenv("COPERNICUS_PASSWORD", "")
        self.token_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
        self.catalogue_url = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
        self.access_token = None
        self.token_expiry = 0

    def authenticate(self) -> bool:
        """
        Retrieves OAuth2 Access Token using username/password credentials.
        """
        if not self.username or not self.password:
            print("[Copernicus API] Credentials missing. Skipping authentication.")
            return False
            
        try:
            payload = {
                "client_id": "cdse-public",
                "grant_type": "password",
                "username": self.username,
                "password": self.password
            }
            response = requests.post(self.token_url, data=payload, timeout=15)
            if response.status_code == 200:
                result = response.json()
                self.access_token = result.get("access_token")
                # Store simple expiry representation
                self.token_expiry = time.time() + result.get("expires_in", 600)
                print("[Copernicus API] Authenticated successfully.")
                return True
            else:
                print(f"[Copernicus API] Auth failed (status {response.status_code}): {response.text}")
                return False
        except Exception as e:
            print(f"[Copernicus API] Auth exception: {e}")
            return False

    def search_products(self, bbox: List[float], start_date: str, end_date: str, platform: str = "Sentinel2") -> List[Dict]:
        """
        Searches CDSE catalogue for products overlapping a bounding box (min_lng, min_lat, max_lng, max_lat).
        """
        # Format dates to ISO
        s_date = f"{start_date}T00:00:00.000Z"
        e_date = f"{end_date}T23:59:59.999Z"
        
        # Bounding box as WKT Polygon: POLYGON((lng1 lat1, lng2 lat1, lng3 lat2, ...))
        wkt_polygon = f"POLYGON(({bbox[0]} {bbox[1]}, {bbox[2]} {bbox[1]}, {bbox[2]} {bbox[3]}, {bbox[0]} {bbox[3]}, {bbox[0]} {bbox[1]}))"
        
        query_filter = (
            f"ContentDate/Start gt {s_date} and ContentDate/Start lt {e_date} "
            f"and OData.CSC.Intersects(area=geography'{wkt_polygon}') "
            f"and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'platformShortName' and att/Value eq '{platform}')"
        )
        
        params = {
            "$filter": query_filter,
            "$top": 10,
            "$orderby": "ContentDate/Start desc"
        }

        try:
            response = requests.get(self.catalogue_url, params=params, timeout=15)
            if response.status_code == 200:
                results = response.json().get("value", [])
                print(f"[Copernicus API] Found {len(results)} raw {platform} products.")
                return results
            else:
                print(f"[Copernicus API] Search failed: {response.text}")
                return []
        except Exception as e:
            print(f"[Copernicus API] Search exception: {e}")
            return []

    def download_product(self, product_id: str, output_path: str) -> bool:
        """
        Downloads a product file by ID using OData stream endpoint.
        """
        if not self.access_token:
            if not self.authenticate():
                return False
                
        download_url = f"https://zipper.dataspace.copernicus.eu/odata/v1/Products({product_id})/$value"
        headers = {"Authorization": f"Bearer {self.access_token}"}

        try:
            print(f"[Copernicus API] Ingesting product {product_id}...")
            with requests.get(download_url, headers=headers, stream=True, timeout=60) as r:
                if r.status_code == 200:
                    with open(output_path, 'wb') as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)
                    print(f"[Copernicus API] Product downloaded to {output_path}")
                    return True
                else:
                    print(f"[Copernicus API] Download failed (status {r.status_code})")
                    return False
        except Exception as e:
            print(f"[Copernicus API] Download exception: {e}")
            return False


class EarthdataClient:
    """
    Client for NASA Earthdata API.
    Used to query Landsat collections and GEDI LiDAR footprint parameters.
    """
    def __init__(self):
        self.username = os.getenv("EARTHDATA_USERNAME", "")
        self.password = os.getenv("EARTHDATA_PASSWORD", "")
        self.cmr_search_url = "https://cmr.earthdata.nasa.gov/search/granules.json"

    def search_gedi_lidar(self, bbox: List[float], start_date: str, end_date: str) -> List[Dict]:
        """
        Queries NASA's Common Metadata Repository (CMR) for GEDI L2B canopy height footprints.
        bbox: [min_lng, min_lat, max_lng, max_lat]
        """
        # Concept ID for GEDI L2B: C1516160100-LPDAAC_ECS (or general query by shortname)
        params = {
            "short_name": "GEDI02_B",
            "temporal": f"{start_date}T00:00:00Z,{end_date}T23:59:59Z",
            "bounding_box": f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}",
            "page_size": 10
        }

        try:
            headers = {"Accept": "application/json"}
            response = requests.get(self.cmr_search_url, params=params, headers=headers, timeout=15)
            if response.status_code == 200:
                entries = response.json().get("feed", {}).get("entry", [])
                print(f"[NASA Earthdata] Found {len(entries)} GEDI LiDAR granules.")
                return entries
            else:
                print(f"[NASA Earthdata] CMR query failed: {response.text}")
                return []
        except Exception as e:
            print(f"[NASA Earthdata] CMR query exception: {e}")
            return []

    def download_hdf5_data(self, download_url: str, output_path: str) -> bool:
        """
        Downloads NASA HDF5/GeoTIFF files using Earthdata credentials.
        """
        if not self.username or not self.password:
            print("[NASA Earthdata] Credentials missing. Cannot download secure datasets.")
            return False

        try:
            # NASA redirects to OAuth, requests handles authentication challenge via auth parameter
            session = requests.Session()
            session.auth = (self.username, self.password)
            
            print(f"[NASA Earthdata] downloading dataset from {download_url}...")
            with session.get(download_url, stream=True, timeout=60) as r:
                # Handle redirection auth handshake
                if r.history:
                    # Session automatically preserves auth headers across redirects
                    pass
                if r.status_code == 200:
                    with open(output_path, 'wb') as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)
                    print(f"[NASA Earthdata] Dataset written to {output_path}")
                    return True
                else:
                    print(f"[NASA Earthdata] Download failed: status {r.status_code}")
                    return False
        except Exception as e:
            print(f"[NASA Earthdata] Download exception: {e}")
            return False
