import requests

BASE_URL = "http://localhost:5229/api/v1"
headers = {"Content-Type": "application/json"}

# 1. Login
login_payload = {"email": "admin@nandofood.com", "contrasena": "Admin123!"}
resp = requests.post(f"{BASE_URL}/usuarios/login", json=login_payload, headers=headers)
token = resp.json().get("data", {}).get("token")
headers["Authorization"] = f"Bearer {token}"

# 2. Get a table
resp = requests.get(f"{BASE_URL}/mesas", headers=headers)
mesas = resp.json().get("data", [])
mesa_id = mesas[0]["id"]
mesa_num = mesas[0]["numero"]
print(f"Usando mesa: {mesa_num} (ID: {mesa_id})")

# 3. Create a salon order (Mesa)
pedido_payload = {
    "origenPedido": "Terraza", # Simulating location as OrigenPedido 
    "mesaId": mesa_id,
    "notas": "Prueba de ticket",
    "productos": [
        {
            "productoId": 21,
            "cantidad": 1,
            "precioUnitario": 100,
            "notas": "Sin azucar",
            "opcionesSeleccionadas": []
        }
    ]
}

resp = requests.post(f"{BASE_URL}/pedidos", json=pedido_payload, headers=headers)
orden_id = resp.json().get("data", {}).get("id")
print(f"Pedido creado ID: {orden_id}")

# 4. Get kitchen ticket preview
resp = requests.get(f"{BASE_URL}/impresion/cocina/{orden_id}/preview", headers=headers)
if resp.status_code == 200:
    print("\n--- TICKET DE COCINA ---")
    print(resp.json().get("data"))
else:
    print("Error:", resp.text)
