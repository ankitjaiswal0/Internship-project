from aes import decrypt_message as aes_decrypt, encrypt_message as aes_encrypt, generate_key
from rsa import decrypt_message as rsa_decrypt, encrypt_message as rsa_encrypt, generate_rsa_keys
from sha256 import generate_sha256_hash


def display_menu() -> None:
    print("\n===== Cryptography Toolkit =====")
    print("1. AES Encrypt")
    print("2. AES Decrypt")
    print("3. RSA Encrypt")
    print("4. RSA Decrypt")
    print("5. SHA256 Hash")
    print("6. Exit")


def main() -> None:
    while True:
        display_menu()
        choice = input("Enter your choice (1-6): ").strip()

        if choice == "1":
            message = input("Enter the plaintext message: ")
            key = generate_key()
            token = aes_encrypt(message, key)
            print("AES Key:", key.decode("utf-8"))
            print("AES Encrypted Text:", token.decode("utf-8"))

        elif choice == "2":
            token = input("Enter the encrypted token: ").encode("utf-8")
            key = input("Enter the AES key: ").encode("utf-8")
            try:
                plaintext = aes_decrypt(token, key)
                print("AES Decrypted Text:", plaintext)
            except Exception as exc:
                print("Decryption failed:", exc)

        elif choice == "3":
            message = input("Enter the plaintext message: ")
            private_key, public_key = generate_rsa_keys()
            ciphertext = rsa_encrypt(message, public_key)
            print("RSA Private Key:\n", private_key.decode("utf-8"))
            print("RSA Public Key:\n", public_key.decode("utf-8"))
            print("RSA Encrypted Text:", ciphertext.hex())

        elif choice == "4":
            ciphertext = bytes.fromhex(input("Enter the RSA ciphertext in hex: "))
            private_key = input("Enter the RSA private key (paste PEM content): ").encode("utf-8")
            try:
                plaintext = rsa_decrypt(ciphertext, private_key)
                print("RSA Decrypted Text:", plaintext)
            except Exception as exc:
                print("Decryption failed:", exc)

        elif choice == "5":
            message = input("Enter the message to hash: ")
            print("SHA-256 Hash:", generate_sha256_hash(message))

        elif choice == "6":
            print("Exiting the Cryptography Toolkit.")
            break

        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
