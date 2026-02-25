# SolidApp – Plataforma de Donaciones y Campañas Solidarias con Sistema de Recompensas

## Descripción breve
SolidApp es una aplicación web que conecta organizaciones solidarias, usuarios y empresas mediante un sistema centralizado de campañas, participación y recompensas. La plataforma incentiva la solidaridad mediante un sistema de puntos que pueden canjearse por beneficios ofrecidos por empresas colaboradoras.

---

## Descripción general
SolidApp permite a organizaciones crear y gestionar campañas solidarias, a los usuarios participar y acumular puntos, y a las empresas ofrecer beneficios canjeables mediante un sistema de cupones.

La plataforma centraliza la gestión de campañas, beneficios y participación, promoviendo transparencia, visibilidad e integración entre el sector solidario y el sector empresarial.

---

## Funcionamiento del sistema

### Registro e inicio de sesión
El sistema permite autenticación segura basada en JWT y control de acceso por roles:

- Usuario
- Organización
- Empresa
- Administrador

---

### Panel de Usuario
El usuario puede:

- Visualizar campañas activas
- Participar en campañas
- Acumular puntos
- Canjear puntos en la tienda
- Visualizar ranking
- Consultar su historial

---

### Panel de Organización
La organización puede:

- Crear campañas
- Editar campañas
- Activar o desactivar campañas
- Gestionar su información

---

### Panel de Empresa
La empresa puede:

- Crear cupones
- Editar beneficios
- Activar o desactivar beneficios
- Gestionar sus promociones

---

### Panel de Administrador
El administrador posee control total del sistema:

- Gestión de usuarios
- Gestión de organizaciones
- Gestión de empresas
- Gestión de campañas
- Gestión de beneficios
- Control de estados (alta / baja)

---

## Sistema de puntos y recompensas
Los usuarios reciben puntos por su participación en campañas.  
Los puntos pueden canjearse en la tienda por beneficios ofrecidos por empresas registradas.

Este mecanismo incentiva la participación activa y promueve el compromiso social.

---

## Ranking
El sistema incluye un ranking de usuarios con mayor participación, fomentando la competencia positiva y el compromiso solidario.

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
- Passport-JWT
- Multer
- Winston

### Base de datos
- Microsoft SQL Server
- SQL Server Management Studio

---

## Características principales
- Autenticación con control de roles
- Paneles diferenciados por tipo de usuario
- Gestión completa de campañas
- Sistema de puntos y recompensas
- Tienda de beneficios
- Ranking de usuarios
- Arquitectura modular y escalable

---

## Escalabilidad futura
El sistema permite futuras integraciones como:

- Pasarelas de pago
- Donaciones monetarias
- Aplicación móvil
- Despliegue en servicios cloud

---
## Tecnologías utilizadas

### Frontend
- Next.js
- TypeScript
- shadcn/ui
- SweetAlert2
- CSS Modules

### Backend
- NestJS
- TypeORM
- JWT (JSON Web Tokens)
- bcrypt
- Passport

### Base de datos
- Microsoft SQL Server

### Comunicación
- API REST

---

## Arquitectura

El sistema utiliza una arquitectura cliente-servidor de tres capas:

- Capa de presentación (Frontend)
- Capa de lógica de negocio (Backend)
- Capa de persistencia (Base de datos)

---

## Instalación del proyecto

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
2. Configurar el Backend
cd backend
npm install

Configurar variables de entorno en archivo .env

Ejemplo:

DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=solid_user
DB_PASSWORD=ejemplo12345
DB_DATABASE=Solid
JWT_SECRET=afh3g8ajsfaudfj3hfgnagf8uhaosudha9q02w8ryhaoufha9fyha28rfaswd2
NEXT_PUBLIC_API_URL=http://localhost:3001

Ejecutar backend:

npm run start:dev

El backend se ejecutará en: http://localhost:3001
3. Configurar el Frontend
cd frontend
npm install
npm run dev

El frontend se ejecutará en: http://localhost:3000
Roles del sistema

El sistema posee cuatro roles principales:

Usuario: puede donar y canjear beneficios

Organización: puede crear y administrar campañas

Empresa: puede crear y administrar cupones

Administrador: posee control total del sistema


## Equipo de desarrollo

Proyecto desarrollado por:

- Nicolás Ezequiel Pérez – Líder del proyecto / Desarrollo Full Stack
- Gastón Paez / Nicolás Ezequiel Pérez – Desarrollo Frontend
- Lucas Frey / Gastón Paez – Desarrollo Backend
- Gastón Paez / Lucas Frey / Bautista Mateo - Implementacion y diseño de Base de Datos
- Nicolás Ezequiel Pérez / Gastón Paez / Lucas Frey – Análisis y documentación

Proyecto académico – 2026