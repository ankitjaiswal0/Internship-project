from cryptography.fernet import Fernet


def generate_key() -> bytes:
    """Generate a new symmetric encryption key."""
    return Fernet.generate_key()


def encrypt_message(message: str, key: bytes) -> bytes:
    """Encrypt a UTF-8 string using Fernet symmetric encryption."""
    if not isinstance(message, str):
        raise TypeError("message must be a string")
    if not isinstance(key, (bytes, bytearray)):
        raise TypeError("key must be bytes")

    f = Fernet(key)
    return f.encrypt(message.encode("utf-8"))


def decrypt_message(token: bytes, key: bytes) -> str:
    """Decrypt a Fernet token and return the original plaintext string."""
    if not isinstance(token, (bytes, bytearray)):
        raise TypeError("token must be bytes")
    if not isinstance(key, (bytes, bytearray)):
        raise TypeError("key must be bytes")

    f = Fernet(key)
    return f.decrypt(token).decode("utf-8")
