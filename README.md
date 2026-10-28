# Bethel Bible Institute

Administración del instituto: catálogos, costos del curso, materias por maestro, alumnos e inscripciones.
React + TypeScript + Vite, Firebase (Auth + Firestore) y Cloudflare Pages.

## Correr en local

```bash
npm install
npm run dev
```

## Preparar Firebase (una sola vez, en la consola del proyecto `bethel-institute`)

1. **Authentication → Sign-in method:** habilita **Correo electrónico/contraseña**.
2. **Firestore Database:** créala en modo producción.
3. **Reglas:** copia `security/firestore.rules` en Firestore → Reglas y toca **Publicar**
   (o con la CLI: `npx firebase-tools deploy --only firestore:rules`).
   **Cada vez que cambie ese archivo hay que volver a publicarlo**, o la app mostrará errores de permisos.
4. **Propietario del sistema (tú):**
   - Authentication → Users → **Add user** (correo y contraseña). Copia su **User UID**.
   - Firestore → colección `admin_users` → documento con ID = ese UID, con los campos
     `name` y `email` (texto).
   - El propietario puede todo siempre, aunque se cambien los roles. Sin ese documento la cuenta
     ve la pantalla de "sin acceso" con su UID para copiarlo.
5. En la app, en este orden:
   1. **Roles → Crear roles** (Administración, Director, Maestro, Estudiante). Ajusta los permisos si hace falta.
   2. **Catálogos → Cargar datos iniciales** (clases, materias y libros con su clase, maestros…).
      Si ya habías cargado materias antes: **Catálogos → Asignar clases según la hoja**.
   3. **Períodos académicos → Nuevo período** (por ejemplo, 07/01/2026 a 04/30/2027) con sus dos semestres.
      Los períodos creados antes: edítalos para agregar los semestres.
   4. Costos del curso, Materias por maestro, Alumnos e Inscripciones.
   5. **Usuarios → Nuevo usuario** para cada persona: nombre completo, correo y rol. Con rol Maestro o Estudiante
      se registra solo como maestro o alumno (si ya existe con ese nombre, se usa ese registro).
      Cada quien entra desde el portal y ve solo lo que su rol permite.
   6. Si inscribiste alumnos antes de esta versión: **Materias por maestro → Actualizar listas de alumnos**.
   7. Si los roles ya existían antes de los módulos nuevos (Solicitudes, Inventario de libros, Gastos, Estado de cuenta,
      Personalizar): **Roles → Agregar permisos**.
   8. **Inventario de libros → Cargar libros** (los 32 libros del formulario de pedido con código y precio).
6. **Estudiantes nuevos:** entran por **Soy estudiante nuevo** (portal) o **Crea tu cuenta** (login), llenan
   **Mi solicitud** y la oficina la aprueba en **Solicitudes**. Necesita que exista el rol con id `estudiante`.

## Publicar en Cloudflare Pages

```bash
npx wrangler login      # una sola vez
npm run deploy          # construye y sube dist/ al proyecto "bethel-institute"
```

Si conectas el repo desde el panel de Cloudflare en vez de usar la CLI:
comando de build `npm run build`, carpeta de salida `dist`.

Después del primer deploy, agrega el dominio de Pages (p. ej. `bethel-institute.pages.dev`)
en Firebase → Authentication → Settings → **Authorized domains**, o el login fallará.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `tsc -b` + build de producción en `dist/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | Revisión de tipos |
| `npm run deploy` | Build + `wrangler pages deploy` |

Convenciones del código: ver `CLAUDE.md`. Decisiones y pendientes: `code-notes.md`.
