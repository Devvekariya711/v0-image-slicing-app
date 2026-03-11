#!/usr/bin/env python3
"""
instagrapi_bridge.py — Instagram automation bridge for SocialHub.
Called from Node.js via child_process.spawn().
Uses instagrapi (Instagram private mobile API) — same protocol as the official app.

Usage:
  python instagrapi_bridge.py --action login --account-id ID --username U --password P --session-dir DIR
  python instagrapi_bridge.py --action upload_reel --account-id ID --filepath PATH --caption TEXT --session-dir DIR
  python instagrapi_bridge.py --action validate_session --account-id ID --session-dir DIR

Output: JSON to stdout — { "success": true/false, "error": "...", "url": "..." }

Install dependency:
  pip install instagrapi Pillow
"""

import sys
import json
import argparse
import random
import time
import os
from pathlib import Path


def safe_print(data: dict):
    """Print JSON to stdout and flush immediately."""
    print(json.dumps(data), flush=True)


def human_sleep(min_s: float = 2.5, max_s: float = 6.0):
    """Sleep for a random human-like duration to avoid bot detection."""
    time.sleep(random.uniform(min_s, max_s))


def get_session_path(session_dir: str, account_id: str) -> str:
    Path(session_dir).mkdir(parents=True, exist_ok=True)
    return os.path.join(session_dir, f"{account_id}.json")


def get_client(account_id: str, session_dir: str):
    """Load or create an instagrapi Client with saved session."""
    try:
        from instagrapi import Client
    except ImportError:
        safe_print({"success": False, "error": "instagrapi not installed. Run: pip install instagrapi Pillow"})
        sys.exit(1)

    cl = Client()
    # Real device settings to avoid detection
    cl.set_settings({
        "uuids": {
            "phone_id": str(random.randint(10**14, 10**15)),
            "uuid": str(random.randint(10**14, 10**15)),
            "client_session_id": str(random.randint(10**14, 10**15)),
            "advertising_id": str(random.randint(10**14, 10**15)),
            "android_device_id": "android-" + hex(random.randint(10**10, 10**11))[2:],
        }
    })

    session_path = get_session_path(session_dir, account_id)
    if os.path.exists(session_path):
        try:
            cl.load_settings(session_path)
        except Exception:
            pass  # Will re-login if session is corrupt

    return cl, session_path


def action_login(args):
    cl, session_path = get_client(args.account_id, args.session_dir)

    # Warmup: simulate a human opening the app
    human_sleep(2, 5)

    try:
        cl.login(args.username, args.password)
        human_sleep(3, 7)
        cl.dump_settings(session_path)
        safe_print({"success": True, "action": "login"})
    except Exception as e:
        err = str(e)
        if "challenge_required" in err.lower():
            safe_print({"success": False, "error": f"challenge_required: {err}"})
        elif "bad_password" in err.lower():
            safe_print({"success": False, "error": "incorrect_password"})
        else:
            safe_print({"success": False, "error": err})


def action_validate_session(args):
    cl, session_path = get_client(args.account_id, args.session_dir)

    if not os.path.exists(session_path):
        safe_print({"success": False, "error": "no_session"})
        return

    try:
        # Lightweight call to check session validity
        user_id = cl.user_id
        if not user_id:
            raise Exception("No user_id in session")

        # Ping Instagram gently — get own account info
        human_sleep(1, 3)
        info = cl.account_info()
        human_sleep(1, 2)

        # Refresh session file
        cl.dump_settings(session_path)
        safe_print({"success": True, "username": info.username, "action": "validate_session"})
    except Exception as e:
        safe_print({"success": False, "error": str(e)})


def action_upload_reel(args):
    cl, session_path = get_client(args.account_id, args.session_dir)

    if not os.path.exists(session_path):
        safe_print({"success": False, "error": "no_session — please login first"})
        return

    filepath = args.filepath
    if not os.path.exists(filepath):
        safe_print({"success": False, "error": f"File not found: {filepath}"})
        return

    # Warmup delay — mimic human opening the post composer
    human_sleep(3, 8)

    try:
        media = cl.clip_upload(
            path=filepath,
            caption=args.caption or "",
        )
        human_sleep(2, 5)
        cl.dump_settings(session_path)

        url = f"https://www.instagram.com/reel/{media.code}/"
        safe_print({"success": True, "media_id": str(media.pk), "url": url, "action": "upload_reel"})
    except Exception as e:
        err = str(e)
        if "challenge_required" in err.lower():
            safe_print({"success": False, "error": f"challenge_required: {err}"})
        elif "login_required" in err.lower():
            safe_print({"success": False, "error": "login_required"})
        else:
            safe_print({"success": False, "error": err})


def main():
    parser = argparse.ArgumentParser(description="Instagram instagrapi bridge")
    parser.add_argument("--action", required=True, choices=["login", "validate_session", "upload_reel"])
    parser.add_argument("--account-id", required=True)
    parser.add_argument("--session-dir", required=True)
    parser.add_argument("--username", default="")
    parser.add_argument("--password", default="")
    parser.add_argument("--filepath", default="")
    parser.add_argument("--caption", default="")

    args = parser.parse_args()

    if args.action == "login":
        if not args.username or not args.password:
            safe_print({"success": False, "error": "username and password required for login"})
            return
        action_login(args)
    elif args.action == "validate_session":
        action_validate_session(args)
    elif args.action == "upload_reel":
        if not args.filepath:
            safe_print({"success": False, "error": "filepath required for upload_reel"})
            return
        action_upload_reel(args)


if __name__ == "__main__":
    main()
