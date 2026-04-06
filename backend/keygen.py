#!/usr/bin/env python3
"""
Generate license keys locally. Never share LICENSE_SECRET.
Usage: python keygen.py [count]
"""
import hmac
import hashlib
import base64
import secrets
import sys
import os

from dotenv import load_dotenv
load_dotenv()

LICENSE_SECRET = os.environ.get("LICENSE_SECRET", "")# paste your LICENSE_SECRET here

def generate_key() -> str:
    rand = secrets.token_bytes(11)
    mac = hmac.new(LICENSE_SECRET.encode(), rand, hashlib.sha256).digest()[:4]
    encoded = base64.b32encode(rand + mac).decode()  # exactly 24 chars
    return "-".join(encoded[i:i+6] for i in range(0, 24, 6))

if __name__ == "__main__":
    if not LICENSE_SECRET:
        print("ERROR: Set LICENSE_SECRET at the top of this file.")
        sys.exit(1)
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    for _ in range(count):
        print(generate_key())
