# OpenSound API

Backend base para la aplicación OpenSound construida con [NestJS](https://nestjs.com/). Este proyecto provee los cimientos de autenticación con JWT, protección por roles y endpoints listos para integrarse con un frontend que gestione módulos públicos y administrativos.

## Características principales

- 🔐 **Autenticación con JWT** usando credenciales de ejemplo (admin y usuario) listas para ser reemplazadas por persistencia real.
- 🛡️ **Protección por roles** mediante guardas reutilizables para aislar módulos administrativos.
- 👥 **Contexto de sesión** expuesto a través del endpoint `/profile`, ideal para poblar contextos globales en el frontend.
- 🧪 **Suite de pruebas** unitarias y end-to-end que validan el flujo de autenticación y la protección de rutas.
- ⚙️ **Configuración por variables de entorno** con un `.env.example` listo para conectar a servicios externos.

## Configuración inicial

1. Clona el repositorio y entra al directorio del proyecto.
2. Instala las dependencias:

```bash
npm install
```
3. Crea un archivo `.env` copiando el contenido de `.env.example` y ajusta los valores a tu entorno.

## Scripts disponibles

```bash
# Ejecuta la aplicación en modo desarrollo
npm run start:dev

# Ejecuta la aplicación en modo producción (compilada)
npm run start:prod

# Linter y formateo
npm run lint
npm run format

# Pruebas
npm test        # unitarias
npm run test:e2e # end-to-end
```

## Endpoints relevantes

| Método | Ruta              | Descripción                                                        | Protección |
| ------ | ----------------- | ------------------------------------------------------------------ | ---------- |
| GET    | `/health`         | Estado básico de la API.                                           | Pública    |
| POST   | `/auth/login`     | Devuelve token JWT y datos sanitizados del usuario autenticado.    | Pública    |
| GET    | `/profile`        | Retorna la sesión del usuario autenticado.                         | JWT        |
| GET    | `/admin/overview` | Panel administrativo disponible únicamente para usuarios con rol `admin`. | JWT + Rol |

## Credenciales de ejemplo

Las pruebas y el entorno de desarrollo incluyen dos usuarios precargados en memoria:

| Email              | Contraseña | Roles        |
| ------------------ | ---------- | ------------ |
| `admin@example.com`| `admin123` | `['admin']`  |
| `user@example.com` | `user123`  | `['user']`   |

> Sustituye estos datos por almacenamiento persistente antes de desplegar a producción.

## Próximos pasos

- Sustituir la capa de datos en memoria por una base de datos utilizando `DATABASE_URL`.
- Integrar un módulo de registro y refresco de tokens si el flujo del frontend lo requiere.
- Añadir pruebas adicionales que cubran los casos borde una vez que se conecte el backend definitivo.

## Licencia

MIT
