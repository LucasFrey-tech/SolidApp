# Guía de Convenciones de Commits (Conventional Commits)

Esta guía está pensada para mantener **mensajes de commit claros y consistentes** en el proyecto PPS.

---

## Prefijos y cuándo usarlos

| Prefijo | Cuándo usarlo | Ejemplo |
|---------|---------------|---------|
| **feat:** | Para **nuevas funcionalidades** o características | `feat: agregar sistema de puntos para donaciones` |
| **fix:** | Para **corrección de errores** | `fix: corregir bug en validación de registro de usuario` |
| **chore:** | Tareas de **mantenimiento o configuración** que no afectan la funcionalidad | `chore: setup Next.js y NestJS` <br> `chore: actualizar dependencias del proyecto` |
| **docs:** | Cambios en **documentación** | `docs: agregar guía de instalación en README` <br> `docs: actualizar diagrama MER` |
| **style:** | Cambios de **formato, espacios, indentación** (sin cambiar lógica) | `style: formatear código según eslint` <br> `style: corregir indentación en backend` |
| **refactor:** | Refactorización de código **sin cambiar funcionalidad** | `refactor: separar servicios de usuarios en módulo independiente` |
| **test:** | Añadir o modificar **tests** | `test: agregar test para validación de login` <br> `test: corregir test de endpoint /books` |
| **perf:** | Mejoras de **rendimiento** | `perf: optimizar consulta de libros con múltiples géneros` |
| **ci:** | Cambios en **configuración de integración continua** (GitHub Actions, pipelines) | `ci: agregar workflow para tests automáticos` |
| **build:** | Cambios relacionados con **sistema de compilación o dependencias** | `build: actualizar configuración de webpack` <br> `build: agregar script para docker` |
| **revert:** | Para **revertir un commit anterior** | `revert: revertir feat: agregar sistema de puntos` |

---

## Ejemplos aplicados a tu PPS

**Frontend (Next.js)**:
```text
feat: agregar página de registro de donantes
fix: corregir error de validación en formulario de contacto
chore: instalar dependencias de Next.js
docs: agregar diagrama de flujo de frontend
style: mejorar estilo de botones en landing page
refactor: separar componente de tarjeta de libro en subcarpeta
test: agregar test para componente BookCard
perf: optimizar renderizado de lista de campañas
```

**Backend (NestJS)**:
```text
feat: crear módulo de usuarios y autenticación JWT
fix: corregir bug en endpoint de compras
chore: setup NestJS y dependencias iniciales
docs: agregar README del backend
style: aplicar prettier en servicios de libros
refactor: separar controladores de compras y reseñas
test: agregar test para endpoint /purchase
perf: optimizar query de libros con filtros
ci: configurar workflow de GitHub Actions para tests
build: actualizar script de build para Docker
revert: revertir feat: agregar endpoint temporal
```

---

### Tips adicionales
1. Explica brevemente **qué cambias** en el mensaje de commit.
2. Mensajes claros facilitan **revisiones, merge requests y debugging**.
3. Se pueden combinar prefijos si tiene sentido:
```text
chore: setup proyecto backend
docs: agregar instrucciones de instalación en README
```

