import requests
import json
import sys

BASE_URL = "http://localhost:5229/api/v1"

def print_step(msg):
    print(f"\n--- {msg} ---")

def main():
    print_step("1. Iniciando sesión (Login)")
    login_payload = {
        "nombreUsuario": "admin",
        "contrasena": "admin"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        if response.status_code != 200:
            print("❌ Error de autenticación o el servidor no está corriendo.")
            print(response.text)
            return
            
        token = response.json().get("data", {}).get("accessToken")
        if not token:
            print("❌ No se recibió un token.")
            print(response.json())
            return
            
        print("✅ Autenticación exitosa.")
        headers = {"Authorization": f"Bearer {token}"}
        
        print_step("2. Obteniendo catálogo de productos para prueba")
        resp = requests.get(f"{BASE_URL}/productos?incluirOpciones=true", headers=headers)
        productos = resp.json().get("data", {}).get("items", [])
        if not productos:
            print("❌ No hay productos en la base de datos para probar.")
            return
            
        producto_id = None
        producto_nombre = ""
        for p in productos:
            grupos = p.get("opcionesGrupos", [])
            requiere_opciones = False
            for g in grupos:
                if g.get("minSeleccion", 0) > 0:
                    requiere_opciones = True
                    break
            
            if not requiere_opciones:
                producto_id = p["id"]
                producto_nombre = p["nombre"]
                break
                
        if not producto_id:
            print("❌ No se encontró ningún producto que no requiera opciones obligatorias.")
            return
            
        print(f"✅ Usando producto de prueba sin opciones obligatorias: {producto_nombre} (ID: {producto_id})")
        
        print_step("3. Creando un pedido nuevo (Delivery)")
        pedido_payload = {
            "clienteId": None,
            "notas": "Prueba desde Python",
            "montoEnvio": 0,
            "estadoCocina": "Pendiente",
            "items": [
                {
                    "servicioId": producto_id,
                    "cantidad": 1,
                    "estado": "Pendiente"
                }
            ]
        }
        resp = requests.post(f"{BASE_URL}/delivery/pedidos", json=pedido_payload, headers=headers)
        if resp.status_code not in [200, 201]:
            print(f"❌ Error al crear pedido: {resp.text}")
            return
            
        pedido = resp.json().get("data", {})
        pedido_id = pedido.get("id")
        print(f"✅ Pedido creado con ID {pedido_id}")
        
        print_step("4. Enviando el pedido a la cocina")
        resp = requests.patch(f"{BASE_URL}/delivery/pedidos/{pedido_id}/enviar-cocina", headers=headers)
        if resp.status_code == 200:
            print("✅ Pedido enviado a cocina. El estado del producto ahora debería ser 'En Preparación' (bloqueado).")
        else:
            print(f"❌ Error al enviar a cocina: {resp.text}")
            return
            
        print_step("5. Simulando que el usuario añade otro producto idéntico (Anti-fraude de separación)")
        # En el front-end ahora mandamos las dos líneas separadas porque lo hicimos inteligente.
        # Línea 1: la vieja (En Preparación)
        # Línea 2: la nueva (Pendiente)
        actualizar_payload = {
            "estado": "Pendiente",
            "items": [
                {
                    "servicioId": producto_id,
                    "cantidad": 1,
                    "estado": "En Preparación"
                },
                {
                    "servicioId": producto_id,
                    "cantidad": 1,
                    "estado": "Pendiente"
                }
            ]
        }
        
        resp = requests.put(f"{BASE_URL}/delivery/pedidos/{pedido_id}", json=actualizar_payload, headers=headers)
        if resp.status_code == 200:
            print("✅ Actualización exitosa. El backend aceptó la separación en dos líneas sin alertar error Anti-fraude.")
        else:
            print(f"❌ Error al actualizar el pedido (posible problema anti-fraude): {resp.text}")
            return
            
        print_step("6. Enviando el segundo producto a cocina")
        resp = requests.patch(f"{BASE_URL}/delivery/pedidos/{pedido_id}/enviar-cocina", headers=headers)
        if resp.status_code == 200:
            print("✅ El producto adicional fue enviado a cocina correctamente.")
        else:
            print(f"❌ Error: {resp.text}")
            return
            
        print_step("7. Obteniendo el pedido final para verificar")
        resp = requests.get(f"{BASE_URL}/pedidos/{pedido_id}", headers=headers)
        final_pedido = resp.json().get("data", {})
        items = final_pedido.get("items", [])
        
        print(f"Resumen de productos en el pedido {pedido_id}:")
        for idx, it in enumerate(items):
            print(f" - Línea {idx + 1}: {it.get('servicioNombre', 'Producto')} (Qty: {it.get('cantidad')}) - Estado: {it.get('estado')}")
            
        print("\n🎉 PRUEBA COMPLETADA CON ÉXITO. EL FLUJO FUNCIONA PERFECTAMENTE.")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: El backend no está corriendo. Levanta la API en el puerto 5229 primero.")
        
if __name__ == "__main__":
    main()
