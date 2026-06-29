import sys
import os
import requests

# Append the parent directory to sys.path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from carbon_monitoring.external_apis import EarthdataClient
from dotenv import load_dotenv

# Explicitly load .env file from the current directory
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

print("Initializing NASA Earthdata Client...")
client = EarthdataClient()

print(f"Username from .env: {client.username}")
print("Querying GEDI LiDAR footprints over the Sundarbans...")

# Sundarbans bounding box: [min_lng, min_lat, max_lng, max_lat]
bbox = [89.4, 22.0, 89.8, 22.4]
granules = client.search_gedi_lidar(bbox, "2020-01-01", "2023-01-01")

if len(granules) > 0:
    print(f"Query successful! Found GEDI footprint: {granules[0].get('title')}")
    
    # Extract the download link (HTTP download URL)
    links = granules[0].get("links", [])
    download_url = None
    for link in links:
        if "href" in link and link.get("rel", "").endswith("data#"):
            download_url = link["href"]
            break
            
    if download_url:
        print(f"Attempting secure NASA Earthdata handshake for URL: {download_url}...")
        
        # Test download of first 100 bytes of the file to verify credentials without fetching gigabytes
        try:
            session = requests.Session()
            session.auth = (client.username, client.password)
            headers = {"Range": "bytes=0-99"} # Only query the first 100 bytes
            
            res = session.get(download_url, headers=headers, timeout=15)
            # If authenticated successfully, NASA should return 200 or 206 (Partial Content)
            if res.status_code in [200, 206]:
                print("NASA Earthdata Authentication SUCCESSFUL! Handshake completed.")
            else:
                print(f"NASA Earthdata Authentication FAILED (status {res.status_code}): {res.text[:200]}")
        except Exception as e:
            print(f"NASA Earthdata connection error: {e}")
    else:
        print("No download URL found in GEDI granule metadata.")
else:
    print("No GEDI footprints found overlapping the Sundarbans coordinates in NASA catalog.")
