import sys
import os

# Append the parent directory to sys.path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from carbon_monitoring.external_apis import CopernicusClient
from dotenv import load_dotenv

# Explicitly load .env file from the current directory
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

print("Initializing Copernicus Client...")
client = CopernicusClient()

print(f"Username from .env: {client.username}")
print("Attempting CDSE OAuth2 handshake...")
success = client.authenticate()

if success:
    print("CDSE Authentication SUCCESSFUL! OAuth2 Token retrieved successfully.")
else:
    print("CDSE Authentication FAILED. Please double-check your username and password in inference/.env.")
