# Performance Testing – Login API

Prueba de carga realizada sobre el endpoint de login de FakeStore API utilizando k6/JMeter.

## Objetivo
Validar el comportamiento del servicio bajo carga concurrente, asegurando:
- Tiempo de respuesta ≤ 1.5 segundos
- Tasa de error < 3%
- Throughput mínimo de 20 TPS

## Escenario
- Endpoint: POST /auth/login
- Usuarios parametrizados desde archivo CSV
- Incremento progresivo de carga

## Validaciones
- Tiempo de respuesta
- Tasa de errores
- Estabilidad bajo carga

## Ejecución
```bash
k6 run script.js
