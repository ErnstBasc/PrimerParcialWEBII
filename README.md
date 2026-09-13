# API REST - PRIMER PARCIAL DE TECNOLOGÍAS WEB II - 2026

API desarrollada con Express.js y PostgreSQL.
Sirve para generar órdenes de venta.
Se utiliza la base Northwind.

## Tecnologías

- Express.js
- PostgreSQL
- Librerías: pg, dotenv, cors, helmet, morgan, nodemon (dev)

## Requisitos previos

- Base de datos Northwind cargada en PostgreSQL

## Métodos HTTP utilizados

### GET — Lectura

Los endpoints GET /customers, GET /products y GET /orders/:id son 
seguros e idempotentes. Se usan exclusivamente para 
consultar información ya existente en la base de datos: la lista de 
clientes, la lista de productos disponibles, o el detalle completo de 
una orden específica.

### POST — creación de un nuevo recurso

El endpoint POST /orders no es seguro ni idempotente: cada 
solicitud crea una orden nueva en la base de datos, con un order_id 
propio, incluso si el cuerpo de la petición es idéntico a una anterior. 
Antes de insertar cualquier dato, valida que el cliente, el empleado y 
cada producto enviado existan, y que las cantidades sean válidas (mayor que cero). El 
precio unitario de cada producto se obtiene directamente desde la base 
de datos y toda la operación (cabecera + detalle) se ejecuta dentro de una transacción, 
garantizando que nunca quede una orden incompleta si algo falla a mitad 
de camino. El cliente no puede colocar el precio.

### Códigos utilizados

| Código | Cuándo se usa |
|--------|----------------|
| 200  | Lectura exitosa (`GET`) |
| 201  | Creación exitosa de una orden (`POST /orders`) |
| 400  | Datos inválidos o inexistentes (cliente, empleado o producto que no existe; cantidad inválida) |
| 404  | Orden solicitada por `id` que no existe |
| 500  | Error inesperado del servidor |