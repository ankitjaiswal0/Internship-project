from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.serialization import (
    Encoding,
    NoEncryption,
    PrivateFormat,
    PublicFormat,
    load_pem_private_key,
    load_pem_public_key,
)


def generate_rsa_keys() -> tuple[bytes, bytes]:
    """Generate PEM-encoded RSA private/public keys."""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = private_key.private_bytes(
        encoding=Encoding.PEM,
        format=PrivateFormat.PKCS8,
        encryption_algorithm=NoEncryption(),
    )
    public_pem = private_key.public_key().public_bytes(
        encoding=Encoding.PEM,
        format=PublicFormat.SubjectPublicKeyInfo,
    )
    return private_pem, public_pem


def encrypt_message(message: str, public_key_pem: bytes) -> bytes:
    """Encrypt a short message using RSA public key."""
    if not isinstance(message, str):
        raise TypeError("message must be a string")
    if not isinstance(public_key_pem, (bytes, bytearray)):
        raise TypeError("public_key_pem must be bytes")

    public_key = load_pem_public_key(public_key_pem)
    return public_key.encrypt(
        message.encode("utf-8"),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )


def decrypt_message(ciphertext: bytes, private_key_pem: bytes) -> str:
    """Decrypt RSA ciphertext using the corresponding private key."""
    if not isinstance(ciphertext, (bytes, bytearray)):
        raise TypeError("ciphertext must be bytes")
    if not isinstance(private_key_pem, (bytes, bytearray)):
        raise TypeError("private_key_pem must be bytes")

    private_key = load_pem_private_key(private_key_pem, password=None)
    plaintext = private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return plaintext.decode("utf-8")
