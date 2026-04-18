import secrets
from datetime import datetime, timezone


def generate_share_token() -> str:
    return secrets.token_urlsafe(12)


def current_utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()
