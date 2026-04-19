import secrets
from datetime import datetime, timezone


def generate_share_token() -> str:
    """Generates a secure random token that can be used for sharing architecture snapshots. 
    The token is URL-safe and has a length of 12 characters, providing a good balance 
    between uniqueness and usability."""
    return secrets.token_urlsafe(12)

def current_utc_timestamp() -> str:
    """Returns the current UTC timestamp in ISO 8601 format. This timestamp can be used to track 
    when an architecture snapshot was created or last updated, and it ensures that all timestamps 
    are consistent regardless of the user's local timezone.""" 
    return datetime.now(timezone.utc).isoformat()
