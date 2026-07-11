import hashlib


def generate_sha256_hash(message: str) -> str:
    """Return the SHA-256 hash of the provided string."""
    if not isinstance(message, str):
        raise TypeError("message must be a string")

    return hashlib.sha256(message.encode("utf-8")).hexdigest()
