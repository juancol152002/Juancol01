import requests
import socket

def check_port(ip, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((ip, port))
    sock.close()
    return result == 0

def check_url(url):
    try:
        response = requests.get(url, timeout=2)
        return f"Success: {response.status_code}"
    except requests.exceptions.RequestException as e:
        return f"Failed: {e}"

print("Checking 192.168.1.116:8000...")
if check_port("192.168.1.116", 8000):
    print("Port 8000 is open on 192.168.1.116")
    print(check_url("http://192.168.1.116:8000/admin/"))
else:
    print("Port 8000 is CLOSED on 192.168.1.116")

print("\nChecking localhost:8000...")
if check_port("127.0.0.1", 8000):
    print("Port 8000 is open on 127.0.0.1")
    print(check_url("http://127.0.0.1:8000/admin/"))
else:
    print("Port 8000 is CLOSED on 127.0.0.1")
