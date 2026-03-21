# SolidApp – Plataforma de Donaciones y Campañas Solidarias con Sistema de Recompensas

## Descripción 
SolidApp es una aplicación web que conecta organizaciones solidarias, usuarios y empresas mediante un sistema centralizado de campañas, participación y recompensas. La plataforma incentiva la solidaridad mediante un sistema de puntos que pueden canjearse por beneficios ofrecidos por empresas colaboradoras.

---

## Descripción general
SolidApp permite a organizaciones crear y gestionar campañas solidarias, a los usuarios participar y acumular puntos, y a las empresas ofrecer beneficios canjeables mediante un sistema de cupones.

La plataforma centraliza la gestión de campañas, beneficios y participación, promoviendo transparencia, visibilidad e integración entre el sector solidario y el sector empresarial.

---

## Objetivo del sistema
Proporcionar una plataforma digital que permita gestionar campañas solidarias de manera organizada, facilitando la interacción entre organizaciones y donantes, e incentivando la participación mediante un sistema de recompensas.

---

## Roles del sistema

El sistema posee cuatro roles principales:

- Usuario: puede donar, acumular puntos y canjear beneficios.
- Organización: puede crear y administrar campañas.
- Empresa: puede crear y administrar cupones o beneficios.
- Administrador: posee control total del sistema.

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

---

### Panel de Empresa
La empresa puede:

- Crear cupones
- Editar beneficios
- Activar o desactivar beneficios
- Gestionar promociones

---

### Panel de Administrador
El administrador posee control total del sistema:

- Gestión de usuarios
- Gestión de organizaciones
- Gestión de empresas
- Gestión de campañas
- Gestión de beneficios
- Control de estados (habilitar / deshabilitar)

Las acciones del administrador afectan la visibilidad del contenido dentro del sistema.

---

## Ranking
El sistema incluye un ranking de usuarios con mayor participación, basado en puntos acumulados.

---

## Arquitectura del sistema

El sistema utiliza una arquitectura cliente-servidor de tres capas:

- Presentación (Frontend – Next.js)
- Lógica de negocio (Backend – NestJS)
- Persistencia (Base de datos – SQL Server)

La comunicación se realiza mediante API REST.

---

## Tecnologías utilizadas

### Frontend
- Next.js
- React
- TypeScript
- CSS Modules
- SweetAlert2
- shadcn/ui

### Backend
- NestJS
- TypeORM
- Express
- JWT
- bcrypt
- Passport
- Multer
- Winston

### Base de datos
- Microsoft SQL Server

---

## Instalación del proyecto

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd solidapp
2. Configurar el Backend
cd backend
npm install

Configurar variables de entorno en archivo .env:

DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=solid_user
DB_PASSWORD=tu_password
DB_DATABASE=Solid

JWT_SECRET=tu_secret
PORT=3001

Ejecutar backend:

npm run start:dev

El backend se ejecutará en:
http://localhost:3001

3. Crear usuario administrador (IMPORTANTE)
cd backend
npm run seed:admin

Esto creará un usuario administrador para acceder al panel de administración.

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
Escalabilidad futura

El sistema permite futuras integraciones como:

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