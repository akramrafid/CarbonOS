#!/usr/bin/env python3
"""
sign_provenance_cli.py - Standalone External Validator CLI

Enables independent validators, VVBs, and community verifiers to inspect, sign,
and verify carbon monitoring provenance records using Ed25519 digital signatures.
Can run 100% offline or submit directly to a running Carbon Zero BD API.
"""

import argparse
import sys
import json
import urllib.request
import urllib.error

# Cryptography Ed25519 primitives
try:
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.exceptions import InvalidSignature
except ImportError:
    print("Error: 'cryptography' library is required. Install via: pip install cryptography", file=sys.stderr)
    sys.exit(1)


def cmd_generate_keys(args):
    priv = ed25519.Ed25519PrivateKey.generate()
    pub = priv.public_key()
    priv_hex = priv.private_bytes_raw().hex()
    pub_hex = pub.public_bytes_raw().hex()
    
    output = {
        "private_key_hex": priv_hex,
        "public_key_hex": pub_hex,
        "algorithm": "Ed25519",
        "instructions": "Store the private key securely. Share the public key with the project registry."
    }
    print(json.dumps(output, indent=2))


def cmd_sign(args):
    try:
        priv_bytes = bytes.fromhex(args.private_key)
        priv_key = ed25519.Ed25519PrivateKey.from_private_bytes(priv_bytes)
        sig = priv_key.sign(args.hash.encode("utf-8"))
        sig_hex = sig.hex()
        pub_hex = priv_key.public_key().public_bytes_raw().hex()
        
        output = {
            "record_hash": args.hash,
            "signature_hex": sig_hex,
            "public_key_hex": pub_hex
        }
        print(json.dumps(output, indent=2))
    except Exception as e:
        print(f"Error signing record hash: {e}", file=sys.stderr)
        sys.exit(1)


def cmd_verify(args):
    try:
        pub_bytes = bytes.fromhex(args.public_key)
        pub_key = ed25519.Ed25519PublicKey.from_public_bytes(pub_bytes)
        sig_bytes = bytes.fromhex(args.signature)
        pub_key.verify(sig_bytes, args.hash.encode("utf-8"))
        print(json.dumps({
            "record_hash": args.hash,
            "public_key_hex": args.public_key,
            "status": "VALID",
            "message": "Ed25519 signature is authentic and untampered."
        }, indent=2))
    except (InvalidSignature, ValueError) as e:
        print(json.dumps({
            "record_hash": args.hash,
            "public_key_hex": args.public_key,
            "status": "INVALID",
            "message": f"Cryptographic verification failed: {e}"
        }, indent=2))
        sys.exit(1)


def cmd_sign_remote(args):
    base_url = args.api_url.rstrip("/")
    prov_url = f"{base_url}/api/carbon/provenance/{args.result_id}"
    
    print(f"Fetching provenance record for result {args.result_id} from {prov_url}...")
    try:
        req = urllib.request.Request(prov_url, headers={"User-Agent": "Validator-CLI/2.0"})
        with urllib.request.urlopen(req) as response:
            prov_data = json.loads(response.read().decode())
    except urllib.error.URLError as e:
        print(f"Failed to reach API endpoint: {e}", file=sys.stderr)
        sys.exit(1)

    record_hash = prov_data.get("record_hash")
    if not record_hash:
        print("API returned invalid provenance object without record_hash", file=sys.stderr)
        sys.exit(1)

    print(f"Target Record Hash: {record_hash}")
    priv_bytes = bytes.fromhex(args.private_key)
    priv_key = ed25519.Ed25519PrivateKey.from_private_bytes(priv_bytes)
    sig_hex = priv_key.sign(record_hash.encode("utf-8")).hex()
    pub_hex = priv_key.public_key().public_bytes_raw().hex()

    submit_url = f"{base_url}/api/carbon/provenance/{args.result_id}/sign"
    payload = {
        "validator_id": args.validator_id,
        "validator_name": args.validator_name,
        "validator_organization": args.validator_org,
        "public_key_hex": pub_hex,
        "signature_hex": sig_hex,
        "comments": args.comments or "Independent VVB verification passed."
    }

    try:
        post_data = json.dumps(payload).encode("utf-8")
        post_req = urllib.request.Request(
            submit_url,
            data=post_data,
            headers={"Content-Type": "application/json", "User-Agent": "Validator-CLI/2.0"}
        )
        with urllib.request.urlopen(post_req) as post_resp:
            resp_json = json.loads(post_resp.read().decode())
            print("Successfully submitted validator co-signature:")
            print(json.dumps(resp_json, indent=2))
    except urllib.error.URLError as e:
        print(f"Failed to submit signature: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Carbon Zero BD - Decentralized Validator Provenance Signer & Verifier"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Key generation
    subparsers.add_parser("generate-keys", help="Generate a new Ed25519 keypair for an auditor")

    # Local sign
    sign_parser = subparsers.add_parser("sign", help="Sign a provenance record_hash locally")
    sign_parser.add_argument("--hash", required=True, help="SHA-256 provenance record hash")
    sign_parser.add_argument("--private-key", required=True, help="64-character hex private key")

    # Local verify
    verify_parser = subparsers.add_parser("verify", help="Verify an Ed25519 signature over a record_hash")
    verify_parser.add_argument("--hash", required=True, help="SHA-256 provenance record hash")
    verify_parser.add_argument("--signature", required=True, help="128-character hex signature")
    verify_parser.add_argument("--public-key", required=True, help="64-character hex public key")

    # Remote sign & submit
    remote_parser = subparsers.add_parser("sign-remote", help="Fetch provenance from API, sign hash, and submit")
    remote_parser.add_argument("--api-url", default="http://localhost:8000", help="Base URL of Carbon Zero BD backend")
    remote_parser.add_argument("--result-id", required=True, help="CarbonResult ID to inspect and sign")
    remote_parser.add_argument("--private-key", required=True, help="Validator Ed25519 private key hex")
    remote_parser.add_argument("--validator-id", required=True, help="Unique validator ID (e.g. VVB-007)")
    remote_parser.add_argument("--validator-name", required=True, help="Name of the lead auditor")
    remote_parser.add_argument("--validator-org", required=True, help="Accredited organization / VVB name")
    remote_parser.add_argument("--comments", help="Optional verification audit notes")

    args = parser.parse_args()
    if args.command == "generate-keys":
        cmd_generate_keys(args)
    elif args.command == "sign":
        cmd_sign(args)
    elif args.command == "verify":
        cmd_verify(args)
    elif args.command == "sign-remote":
        cmd_sign_remote(args)


if __name__ == "__main__":
    main()
