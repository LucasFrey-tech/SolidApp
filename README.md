![image alt](https://github.com/LucasFrey-tech/SolidApp/blob/06f92dbbdad3d866796ebf59f6115edd0c6803d3/frontend/public/logos/SolidApp_sqr_logo.svg)

# SolidApp – Plataforma de Donaciones y Campañas Solidarias con Sistema de Recompensas

## Descripción 
SolidApp es una aplicación web que conecta organizaciones solidarias, usuarios y empresas mediante un sistema centralizado de campañas, participación y recompensas. La plataforma incentiva la solidaridad mediante un sistema de puntos que pueden canjearse por beneficios ofrecidos por empresas colaboradoras.

---

## Descripción general
SolidApp permite a organizaciones crear y gestionar campañas solidarias, a los usuarios participar y acumular puntos, y a las empresas ofrecer beneficios canjeables mediante un sistema de cupones.

La plataforma centraliza la gestión de campañas, beneficios y participación, promoviendo transparencia, visibilidad e integración entre el sector solidario y el sector empresarial.

---

## Roles del sistema

El sistema posee 3 roles principales:

- Usuario: puede donar, acumular puntos y canjear beneficios.
- Colaborador: 
    - En la Empresa, crea/actualiza cupones y puede invitar a más Colaboradores
    - En la Organización, crea/actualiza Campañas Solidarias, acepta/ rechaza las Donaciones de los usuarios y puede invitar a más Colaboradores
- Administrador: posee control total del sistema.

Y 3 Secundarios:

- Gestor: Tiene acceso a todas las funcionalidades de la Empresa u Organización.
- Miembro: Rol base de empleado (permisos limitados definidos por el sistema).
- Entidad: Es utilizado para las invitaciones.
---

## Funcionamiento del sistema

### Registro e inicio de sesión
El sistema permite autenticación segura basada en JWT y control de acceso por roles.

---

### Donaciones
- Los usuarios pueden realizar donaciones en campañas activas.
- Las donaciones deben ser aceptadas por la organización.
- Solo las donaciones aceptadas generan puntos.

Nota: La plataforma registra la intención de donación. La logística de entrega se realiza fuera del sistema.

---

### Sistema de puntos y recompensas
Los usuarios reciben puntos por donaciones aceptadas.  
Los puntos pueden ser canjeados en la tienda por beneficios.

- No se asignan puntos al crear la donación.
- Los puntos no son transferibles entre usuarios.

---

### Panel de Usuario
El usuario puede:

- Visualizar campañas activas
- Participar en campañas
- Acumular puntos
- Canjear puntos en la tienda
- Visualizar ranking
- Consultar historial

---

### Panel de Organización
La organización puede:

- Crear campañas
- Editar campañas
- Activar o desactivar campañas
- Gestionar donaciones recibidas
- Invitar a más personas
---

### Panel de Empresa
La empresa puede:

- Crear cupones
- Editar beneficios
- Activar o desactivar beneficios
- Gestionar promociones
- Invitar a más personas
---

### Panel de Administrador
El administrador posee control total del sistema:

- Gestión de usuarios
- Gestión de organizaciones
- Gestión de empresas
- Gestión de campañas
- Gestión de beneficios
- Control de estados (habilitar / deshabilitar)
- Invitar a entidades (Empresa u Organización)

Las acciones del administrador afectan la visibilidad del contenido dentro del sistema.

---

## Ranking
El sistema incluye un ranking de usuarios con mayor participación (Top10), basado en puntos acumulados.

## Instalación del proyecto

### 1. Clonar el repositorio

```bash
git clone <https://github.com/LucasFrey-tech/SolidApp>
cd solidapp
2. Configurar el Backend
cd backend
npm install

Configurar variables de entorno en archivo .env:

DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=nombre_usuario
DB_PASSWORD=tu_pass
DB_DATABASE=nombre_db
JWT_SECRET=tu_secret
NEST_PUBLIC_API_UR=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_pass
ADMIN_EMAIL=admin_email
ADMIN_PASSWORD=admin_pass

Crear y Configurar un archivo app.config.json en la carpeta private:

{
    "front_url":"http://localhost:3000",
    "host":{
        "port": 3001,
        "url": "http://localhost:3001"
    },
    "database_connection": {
        "host": "localhost",
        "port": 1433,
        "username": "tu_usuario",
        "password": "tu_pass",
        "database": "nombre_db"
    },
    "logger":{
        "console_details_level": "debug",
        "file_details_level": "info",
        "log_file": "logs/backend.log",
        "colorize_logs": true
    },
    "static_resources": {
        "images":{
            "prefix": "/resources",
            "path": "C:/StaticResources/Solid/"
        }
    },
    "campaigns_images": {
        "prefix": "/resources/campaigns",
        "path": "C:/StaticResources/Solid/campaigns/"
    },
    "empresas_images": {
        "prefix": "/resources/empresas",
        "path": "C:/StaticResources/Solid/empresas/"
    }
}

Ejecutar backend:

- npm run start:dev (desarrollo)
o
- npm run build + npm run start (o start:prod)


El backend se ejecutará en:
http://localhost:3001

3. Crear usuario administrador (IMPORTANTE)
cd backend
npm run seed:admin

Esto creará un usuario administrador para acceder al panel de administración. Sus datos se pueden cambiar
directamente desde el sitio web.

4. Configurar el Frontend
cd frontend
npm install
npm run dev

El frontend se ejecutará en:
http://localhost:3000

Características principales
Autenticación con control de roles
Paneles diferenciados por tipo de usuario
Gestión completa de campañas
Sistema de puntos y recompensas
Tienda de beneficios
Ranking de usuarios
Arquitectura modular y escalable
Limitaciones
No incluye pagos electrónicos
No gestiona logística de envíos
No valida físicamente las donaciones

El sistema permitira a futuro integraciones como:

Pasarelas de pago
Donaciones monetarias
Aplicación móvil
Despliegue en servicios cloud
Equipo de desarrollo

Proyecto desarrollado por:

Nicolás Ezequiel Pérez – Líder del proyecto / Desarrollo Full Stack
Gastón Paez – Desarrollo Frontend / Backend
Lucas Frey – Desarrollo Backend
Bautista Mateo – Base de Datos
