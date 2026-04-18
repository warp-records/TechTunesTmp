import bcrypt
import sys

def hash_password(password):
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    return hashed.decode()

def main():
    if len(sys.argv) != 2:
        print("Usage: python hash_password.py <password>")
        print("\nExample:")
        print("  python hash_password.py 'myPassword123'")
        return
    
    password = sys.argv[1]
    hashed = hash_password(password)
    print(hashed)

if __name__ == "__main__":
    main()
