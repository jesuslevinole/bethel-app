## Role

Eres un programador web senior especializado en React y TypeScript, con criterio de clean code y buenas prácticas. Este proyecto nació limpio: tu trabajo es cumplir la tarea que te piden sin bajar ese nivel, y dejar el código que tocas igual o mejor de como lo encontraste, sin salirte del alcance de la tarea.

## Forma de trabajar

1. Antes de escribir código, revisa los archivos relacionados con la tarea y cómo resuelve el proyecto casos parecidos. El código nuevo sigue las convenciones de este archivo; donde este archivo no dice nada, sigue lo que ya hace el proyecto.
2. Si para hacer bien la tarea conviene crear archivos, mover código o reestructurar, **primero explícalo y pregunta**: qué cambiarías, por qué y qué archivos se tocan. No reestructures hasta que el desarrollador responda.
3. Reestructura poco a poco y solo lo relacionado con la tarea.
4. Los problemas que veas fuera del alcance no los corrijas: menciónalos al final en una lista corta (archivo y problema).
5. Un refactor no cambia lo que el usuario ve ni lo que hace la app. Separa la reestructuración del cambio funcional.
6. Registra en `code-notes.md` solo las decisiones que alguien podría deshacer por error si no conoce el motivo, y lo que quede pendiente. Para agregar una nota lee solo las últimas ~30 líneas y escribe al final; para buscar una decisión usa `grep`.

## Estructura de carpetas

Organización por dominio: el código de un dominio va en `src/features/<dominio>/` y lo que usan varios dominios en `src/shared/`.

```
src/
  App.tsx              rutas, proveedor de sesión y guardias por rol (admin / maestro)
  routes/paths.ts      todas las rutas (PATHS)
  views/               una vista por pantalla del menú (+ PortalView y LoginView)
  components/          layout (AppLayout, Sidebar, UserCard, navigation) y BrandShell (portal/login)
  features/<dominio>/  components/, hooks/, services/ y sus utils:
                       auth, portal, dashboard, academic-periods, catalogs, course-costs,
                       teacher-assignments, students, student-profile, enrollments,
                       attendance (asistencia y notas), roles, users, payments, home (Inicio),
                       admissions (solicitudes), book-inventory, expenses, account-statement,
                       customization (menú y columnas), notifications, view-as
  shared/              components/, data/ (listeners y escrituras compartidas), hooks/
  services/            un service por colección de Firestore (<colección>Service.ts)
  utils/               funciones puras (fechas, dinero, costos, períodos, búsqueda…)
  types/               tipos de datos: index.ts + un archivo por colección, reexportados desde index.ts
  config/firebase.ts   inicialización de Firebase (app, auth, db con caché persistente)
  config/institute.ts  nombre y dirección del instituto (carnet)
  lib/firebase/        COLLECTIONS (nombres de colecciones) y typedConverter
  styles/tokens.css    variables de diseño
```

- **Tipos y services por colección.** Cada colección tiene su archivo de tipos en `src/types/<colección>.ts` y su service en `src/services/<colección>Service.ts`, creado con una línea por `createCollectionService<T>(COLLECTIONS.x)` (`create`, `update`, `delete`, `getAll`, `getOne`, lecturas tipadas con `typedConverter`).
- Nombres de archivo: `.ts` en camelCase con minúscula (`studentsService.ts`); `.tsx` con mayúscula (`StudentsView.tsx`). En Firebase las colecciones van en snake_case.
- Los tipos se importan **siempre** desde `src/types/index.ts` con `import type`.
- **Nombres de colecciones → `COLLECTIONS`** (`src/lib/firebase/collections.ts`). Nunca escribas `collection(db, 'nombre')` a mano; una colección nueva se agrega ahí y en `security/firestore.rules`.
- Las vistas y los componentes no importan `firebase/firestore`: leen con `useLiveCollection` / `useLiveData` y escriben con el service de su colección o de su feature. Solo `services/`, `shared/data/` y `features/*/services/` hablan con Firestore.

## Convenciones de código

- Componentes React como funciones flecha con `export default` al final:
  ```tsx
  const MyComponent = ({ title }: MyComponentProps) => { ... };

  export default MyComponent;
  ```
- Nombres de variables y funciones claros, en inglés y en camelCase. Nada de abreviaturas ambiguas ni nombres de una letra (salvo índices de bucles cortos). Los textos de la interfaz van en español.
- JavaScript moderno (`target: ES2022`): `async`/`await` con `try/catch` (nunca `.then().catch()`), `Object.entries`/`Object.values`, `includes`, spread, `?.` y `??` (usa `||` solo cuando de verdad quieres reemplazar `''`, como en `student.city || '—'`).
- Antes de escribir lógica nueva, busca si ya existe (ver "Utilidades que ya existen"). Si aplica a más de un lugar, extráela a un archivo propio.
- Piensa en componentes: props, estado local y hooks, no bloques grandes de HTML.
- En `src/views`, el JSX se lee como composición de componentes: la vista conecta datos y handlers; tablas, tarjetas, formularios y modales viven en componentes con nombre dentro de su feature.
- Tipos de props y tipos de datos van en lugares distintos:
  - **Props:** interfaz `<Componente>Props` en el mismo archivo, justo arriba del componente.
  - **Datos y demás tipos:** en `src/types` (un archivo por colección o por concepto). Antes de crear uno, búscalo (`grep -rnE "(interface|type) Nombre\b" src`). Nunca una segunda versión del mismo tipo.
- **CSS:** propiedades en orden alfabético dentro de cada regla (los prefijos `-webkit-` se ordenan sin el prefijo) y media queries al final del archivo, una por breakpoint, de mayor a menor (`max-width`). Cada componente con estilos propios tiene su `.css` hermano.
- **Estilos en línea:** nunca para valores fijos (van en clases). Solo para valores de runtime y siempre como variable CSS: `style={{ '--load': '40%' } as CSSProperties}`. Estados finitos con clases modificadoras (`is-active`, `is-invalid`); hover solo con `:hover`. Nada de `<style>` en JSX ni objetos de estilo constantes. Verifica con `grep -rn "style={{" src`.
- **`className`:** clases fijas en orden alfabético; las condicionales (`is-active`, `is-invalid`…) al final.
- Cada `useEffect` sincroniza UNA cosa externa con su propio cleanup. Lo calculable se calcula en el render; lo que responde a una acción del usuario va en el handler.
- El JSX solo describe la UI: handlers `handle<Acción>` antes del `return`, props `on<Acción>`, valores calculados en constantes con nombre, sin ternarios anidados.

## Específico de este proyecto

### Fechas (regla del negocio, no negociable)
- Toda fecha visible va en MM/DD/AAAA. Usa `utils/dateFormat.ts` (`formatDate`, `formatDateRange`); nunca `toLocaleDateString` ni una fecha AAAA-MM-DD cruda en pantalla.
- Para capturar fechas usa `shared/components/DateInput` (texto con máscara + calendario), nunca `<input type="date">`.
- Se guardan como AAAA-MM-DD. "Hoy" es `todayIso()` (hora local), nunca `toISOString()`.

### Período académico (regla del negocio)
- Todo se organiza por **período académico** (`academic_periods`: nombre, inicio, fin; p. ej. "Julio 2026 – Abril 2027"). Costos, materias por maestro, inscripciones, asistencia y notas guardan `periodId`; no guardan fechas de período propias.
- El período con el que se trabaja se elige en la barra superior (`PeriodSelector` dentro de `components/layout/Topbar.tsx`) y se lee con `useAcademicPeriod()` (`features/academic-periods/academicPeriodContext.ts`). Por defecto es el vigente (`getDefaultPeriod`); la elección se recuerda en el navegador.
- Una vista nueva que dependa del período: si no hay ninguno muestra `<NoPeriodState />`, y un registro nuevo toma `selectedPeriod.id`; al editar se conserva el `periodId` del registro.
- Reglas: un alumno, una clase por período; una clase, un registro de costos por período; una materia de una clase, un maestro por período.

### Datos y Firebase (cada documento leído se cobra)
- **Colecciones en vivo → `src/shared/data/liveCollections.ts`**: un `onSnapshot` por fuente para toda la app, que sigue abierto 15 min después de que la última vista lo suelta.
  - `useLiveCollection(key)` / `useLiveData(key)`: colecciones completas de `SOURCES` (catálogos, alumnos, períodos, accesos de maestros).
  - `useLivePeriodCollection(key, periodId, ownerFilter?)`: colecciones que crecen cada año (`PERIOD_SOURCES`: costos, materias por maestro, inscripciones), escuchadas solo `where('periodId', '==', …)` (y del dueño, con `ownerFilter`). Nunca las escuches completas.
  - **Las vistas usan `shared/data/useScopedData.ts`**: `useScopedPeriodCollection` / `useScopedPeriodData` (aplican el alcance del rol: todos, propios con filtro de dueño, o nada) y `useStudentDirectory` (todos los alumnos, solo el suyo, o ninguno). Si una vista pide algo que su rol no puede leer, las reglas rechazan la consulta entera.
  - No abras `getDocs` ni `onSnapshot` propios de esas colecciones; una nueva se agrega a `SOURCES` o `PERIOD_SOURCES`. Después de escribir no parches copias locales: el listener refleja la escritura al instante.
- **Un documento puntual en vivo → `useLiveDocument(collection, id)`** (`shared/data/useLiveDocument.ts`): planilla de asistencia del día, planilla de notas, foto de un alumno.
- **Asistencia y notas** tienen ids fijos (`features/attendance/sheetIds.ts`): asistencia `{assignmentId}_{subjectId}_{fecha}`, notas `{assignmentId}_{subjectId}`. Se guardan con `service.set(id, …)` y cada planilla lleva `teacherId` (las reglas lo exigen).
- **Fotos de alumnos** en `student_photos/{studentId}` como JPEG comprimido (`utils/imageCompression.ts`, ~30 KB), no en Storage (el plan Spark no lo incluye). Van aparte de `students` para que la lista no las descargue.
- Firestore usa caché persistente (`config/firebase.ts`): al recargar, los listeners solo cobran lo que cambió.
- **Escrituras de muchos documentos → `shared/data/batchWrites.ts`** (`createInChunks`, tandas de 500).
- **Borrar algo que otros registros usan → `assertNotReferenced`** (`shared/data/references.ts`). Los catálogos declaran sus `references` en `features/catalogs/catalogDefinitions.ts`; un alumno con inscripciones no se borra (`features/students/services/studentRecords.ts`).
- Las relaciones guardan solo ids (`classId`, `teacherId`, `studentId`, `subjectIds`); los nombres se resuelven en vivo con `buildNameMap` + `getRelationName` (`utils/relations.ts`), que muestra "Eliminado" en vez de un id crudo.
- Los totales (libros, mensualidad, total del programa) no se guardan: se calculan con `utils/courseCost.ts`.
- Security Rules en `security/firestore.rules`: aplican del lado del servidor los mismos permisos de Roles (ver "Roles y permisos"). Pregunta antes de cambiar reglas o índices; después de cambiarlas hay que publicarlas en la consola.

### Roles y permisos (regla del negocio)
- **Propietario del sistema:** `admin_users/{uid}` (se crea a mano en la consola). Puede todo siempre; así nadie queda fuera aunque se rompan los roles. No aparece en Usuarios.
- **Usuarios:** `app_users/{uid}` con `roleId`, `active` y el vínculo `teacherId` / `studentId`, que **no se elige a mano**: lo pone el tipo del rol (`Role.kind`: `staff` | `teacher` | `student`). Con rol tipo Maestro se liga al maestro del catálogo con el mismo nombre (o lo crea); con tipo Estudiante, al alumno (o lo registra con código nuevo). Ver `features/users/personLink.ts` y `services/personRecords.ts`; primero se crea la cuenta de Auth y después el registro, para no dejar maestros/alumnos sueltos si el correo ya existe. Las cuentas se crean con una instancia secundaria de Firebase en memoria (`userAccounts.ts`) para no cerrar la sesión de quien las crea. Nadie se edita ni se borra a sí mismo. **Usuario de prueba** (`isTest`): se crea sin correo; `buildTestLogin` le genera uno interno `nombre.xxxx@bethel.test` (dominio reservado, no recibe correos) para que pueda entrar, y el maestro/alumno que se cree con él también queda `isTest` (el alumno lo limpia "Borrar datos de prueba"). Sale con la marca "Prueba" (`.test-data-badge`, global en App.css).
- **Roles:** `roles/{id}` con `kind` y `permissions[módulo] = { view: 'none' | 'own' | 'all', create, edit, delete, export, print, history, viewAs }`. create/edit/delete también los aplican las reglas; export (botón Exportar Excel, `ExportButton` + `exportToExcel`), print (carnet, boletas, expediente, hoja de asistencia), history (expediente académico) y viewAs (Ver como, en Usuarios) solo deciden botones. Cada módulo declara en `permissionModules.ts` qué columnas le aplican; las demás salen "—". Roles guardados antes de export/print/history los reciben si veían el módulo (`completePermissions`). La matriz (`PermissionMatrix`) tiene filtro de módulos, contador de permisos activos y encabezado y columna fijos. Predeterminados con ids fijos: `administracion`, `director`, `maestro`, `estudiante` (`features/roles/defaultRoles.ts`); un rol guardado sin `kind` lo deduce de su id (`inferRoleKind`). La pantalla es una tabla (acciones, rol, descripción, tipo, módulos visibles, usuarios) y el rol se edita en un modal grande con "Restaurar permisos sugeridos" para los predeterminados.
- **El maestro no lee Alumnos ni Inscripciones.** Cada registro de materias guarda `roster` (alumnos de su clase y período: id, nombre, código). Lo mantiene `features/teacher-assignments/services/rosterSync.ts`, que se llama al guardar/borrar inscripciones (`enrollmentRecords.ts`), al guardar un registro de materias (`assignmentRecords.ts`) y al cambiar nombre/código de un alumno (`studentRecords.updateStudent`). Botón "Actualizar listas de alumnos" en Materias por maestro. Las reglas dejan actualizar solo `roster` a quien maneja inscripciones o alumnos (`onlyRosterChanged`).
- **"Propios"** = registros ligados al usuario: alumnos e inscripciones por `studentId`; materias por maestro, asistencia y notas por `teacherId`. Agregar / editar / eliminar solo valen sobre lo que el rol ve.
- En la UI: `usePermissions()` (`can(módulo, acción)`, `scope(módulo)`, `canView`, `teacherId`, `studentId`) y `useRowPermissions(módulo)` para tablas y tarjetas (`RowActions` con `canEdit` / `canDelete`). Toda acción nueva (botón, ruta, consulta) se condiciona con estos hooks.
- **Todo módulo nuevo debe estar en Roles.** `MODULES` en `permissionModules.ts` es un `Record<PermissionModule, …>`: si agregas el módulo a `PermissionModule` y no lo declaras ahí, no compila. Se agrega en 5 lugares: `PermissionModule` (`types/roles.ts`), `MODULES` (`features/roles/permissionModules.ts`, con sus columnas en `actions`), `DEFAULT_ROLES`, su ruta en `PROTECTED_ROUTES` (`App.tsx`) con su ítem en `NAVIGATION`, y `security/firestore.rules`. Los roles ya guardados sin ese módulo lo tratan como "Ninguno" (`completePermissions`).
- Clases, materias, maestros, períodos y roles los lee cualquier miembro (los nombres se ven en asistencia, fichas y carnets); el permiso "ver" de esos módulos controla la pantalla, no los nombres.
- Reglas: el vínculo del usuario (`profile()[campo]`) se lee solo dentro de la rama de "propios" (`isMine`): el propietario no tiene `app_users` y leerlo antes haría fallar sus permisos.

### Módulos
- **Portal (`/`)**: tres puertas (Administración activa; Maestros y Estudiantes "Próximamente").
- **Auth (`features/auth`)**: `AppSessionProvider` (Firebase Auth → ¿propietario? → `app_users` en vivo → su rol en vivo; armado en `buildAppSession`), `RequireSignedIn` (área `/app`), `RequirePermission` (cada ruta), `NoAccessNotice` (sin usuario, inactivo, sin rol o reglas sin publicar), `LoginForm`. `/app` lleva a la pantalla de inicio del rol (`HomeRedirect`). Al cerrar sesión, `signOutUser` corta los listeners antes del `signOut`.
- **Roles (`features/roles`)** y **Usuarios (`features/users`)**: ver "Roles y permisos".
- **Períodos académicos (`features/academic-periods`)**: vista CRUD, `AcademicPeriodProvider` (en `AppLayout`) y `PeriodSelector`. Un período con registros no se borra.
- **Materias con clase y semestre** (`classId`, `semester` 1 o 2). El plan de estudios de la hoja está en `features/catalogs/curriculum.ts` (carga inicial y "Completar según la hoja", que solo llena lo que falta).
- **Días de clase y semestres**: las clases son solo los miércoles (`INSTITUTE.classWeekday` en `config/institute.ts`). Cada período tiene dos semestres (`semesters`, se sugieren partiendo el período a la mitad). `utils/classDays.ts` da los miércoles de los semestres (`listClassDates`); `DateInput` acepta `isDateEnabled` para apagar los demás días en el calendario. Períodos viejos sin semestres usan el período completo.
- **Asistencia y notas (`features/attendance`)**: tres pestañas (`sessionModes.ts`, con el módulo de permisos de cada una): **Clase del día** (`DailySessionEditor`, la primera: todos los alumnos del grupo con Presente/Tarde/Falta (`MarkPicker`) y nota del día; solo cambia la fecha con flechas o calendario; los cambios se guardan por fecha y un solo Guardar guarda todos los días tocados), **Hoja completa** y **Notas de exámenes**. **Hoja completa** = planilla (`AttendanceSheetEditor` + `SheetTable`): alumnos (del `roster`) en filas, una columna por clase (fecha) con **A** (P/T/F, se cambia tocando la celda) y **ND** (nota diaria 0–100); encabezado con maestro, materia, clase y período; se imprime en horizontal. Cada clase es un documento `attendance` (`marks` + `dailyScores`); la hoja se lee en vivo con `useGroupSessions` (con "propios", la consulta lleva `teacherId`). **Notas de exámenes** (`GradesEditor`): primer y segundo examen; la nota diaria es el promedio de las ND (`getDailyAverage`) y se guarda junto. Antes: `AttendanceView` + `AttendanceWorkspace`: con "ver todos" se elige el maestro; con "propios" solo salen los grupos del maestro ligado. Las pestañas Asistencia / Notas salen según el rol; sin permiso de agregar/editar, la planilla queda en solo lectura. Un grupo = una materia de un registro de maestro. Asistencia: Presente / Tarde / Falta por fecha. Notas: nota diaria, primer y segundo examen (0–100, vacío = sin nota). Los editores se montan con `key` por planilla y parten de lo guardado.
- **Importar alumnos y datos de prueba (`features/students/import`, `services/testData.ts`)**: ver code-notes 10/23/2026. Todo lo creado como prueba lleva `isTest: true`.
- **Pagos (`features/payments`, `payments/{id}`)**: un pago = un invoice (alumno, clase, período, forma de pago, banco si aplica, y conceptos `items`). Los nombres de tipo de pago, forma de pago y banco se copian al guardar (el invoice no cambia si se renombra el catálogo y el estudiante no lee catálogos). `invoiceNumber` correlativo con transacción sobre `counters/payments` (`createPayment`). Estado de cuenta en `studentAccount.ts` (único lugar): cargos de Costos del curso (inscripción, libros, mensualidad de cada mes, graduación), pagado por concepto (el concepto sale del nombre del tipo de pago: `chargeKinds.ts`), vencido a la fecha y saldo. Vistas: `PaymentsView` (Pagos registrados / Estado de cuenta, Exportar, Reporte de deudores) y `MyPaymentsView` (estudiante, solo lectura). Invoice imprimible en `InvoiceDocument` (formato carta con logo `src/assets/bethel-logo.png`; `.print-document`; reglas de impresión compartidas en `shared/components/PrintDocument.css`). El estado de cuenta del invoice es el de ESE pago (saldo antes y después), calculado en `invoiceBalance.ts`; no el saldo de hoy.
- **Asistencia solo en días de clase**: `keepClassSessions` descarta lo guardado fuera de los miércoles del período (no se ve ni cuenta en promedios, ficha ni expediente).
- **Notas: fórmula del instituto en `features/attendance/gradeFormula.ts`** (`computeGrade`: asistencia /10, nota diaria menos faltas, promedio con proyecto opcional, GPA). Notas de exámenes, ficha, expediente y boletas la usan; nunca recalcules en otro lado. `StudentScores` incluye `project`; planillas viejas se leen con `toStudentScores`.
- **Expediente y boletas** (`TranscriptDialog`, `ReportCardsDialog`, membrete `DocumentHeader`, estilos e impresión en `PrintDocuments.css` con `.print-document`).
- **Ficha del alumno (`features/student-profile`, ruta `/app/alumnos/:studentId`, y `/app/mi-ficha` para el estudiante; ambas usan `StudentProfileScreen`)**: foto, datos, clase y período del período elegido, materias con notas y asistencia, y carnet imprimible (`IdCard`, medido en `cqw` para imprimirse a 85.6 × 54 mm, con código de barras CODE128 por `Barcode`).
- **Barra superior (`components/layout/Topbar.tsx`)**: botón de menú (solo teléfono), período, **notificaciones** y **ver como**. El menú lateral no lleva período ni títulos de grupo (los grupos se separan con una línea).
- **Notificaciones (`features/notifications`)**: se calculan de los datos en `notificationRules.ts` (no hay colección): cada regla mira solo módulos que el rol puede ver, para no pedir lo que las reglas rechazan. Un aviso desaparece cuando se resuelve. El contador cuenta los no vistos en este navegador (`useSeenNotifications`, localStorage por usuario; la firma incluye el detalle, así que si cambia vuelve a contar). Un aviso nuevo = una función más en `buildNotifications`.
- **Ver como (`features/view-as`)**: el propietario, o un rol con "Ver como" en Usuarios (y ver todos los usuarios); para ese rol los permisos se cruzan con los suyos (`intersectPermissions`): un módulo que él ve como "propios" queda sin acceso. `ViewAsProvider` (en `AppLayout`, por fuera de todo) reemplaza el `AppSessionContext` con el rol elegido (sin vínculo) o el usuario elegido (con su `teacherId`/`studentId`), así menú, guardias, permisos y filtros "propios" se comportan como para esa persona. Firestore sigue viendo la cuenta real (propietario), por eso no se abre a otros roles: verían módulos que sus reglas no dejan leer. Lo que se guarda en ese modo se guarda de verdad (lo avisa `ViewAsBanner`). Se recuerda en sessionStorage.
- **Catálogos (`features/catalogs`)**: inicio en tarjetas (`CatalogGrid`, estilo Settings); el catálogo abierto va en la URL `?catalogo=<key>` (`buildCatalogPath`). Una pantalla genérica para 8 catálogos definidos en `catalogDefinitions.ts` (clases, materias, libros, maestros, tipos de pago, tipos de ingreso, bancos, categorías de gasto). Edición en línea. **Materias y libros llevan `classId`** (campo `kind: 'class'`): se agrupan por clase con filtro de pastillas. `SeedCatalogsBanner` llena solo los catálogos vacíos con los datos de la hoja (`initialCatalogData.ts`, donde materias y libros usan `className` y `seedCatalogs.ts` lo cambia por el id real, generando ids de clases con `newDocumentId` si se crean en la misma carga). `ClassifySubjectsBanner` asigna la clase a materias viejas sin `classId` según `SUBJECTS_BY_CLASS`.
- **Costos del curso (`features/course-costs`)**: inscripción, graduación, libros dinámicos (`BookListEditor`, que trae los libros de la clase desde el catálogo con `addCatalogBooks`), **mensualidad de cada mes del período** (`monthlyFees`, `MonthlyFeeEditor` con "Aplicar a todos"); **total curso = suma de mensualidades** y **total del programa = inscripción + libros + graduación + total curso** (`utils/courseCost.ts`, único lugar). Formulario en modal `size="full"` de 3 columnas, sin scroll.
- **Materias por maestro (`features/teacher-assignments`)**: el maestro sale de `buildTeacherOptions` (`teacherOptions.ts`): maestros del catálogo + usuarios activos con rol que no sea de estudiante (Maestro, Director, Administración…). Un usuario que aún no está en el catálogo se registra como maestro al guardar (`resolveTeacherId`). Un alumno nunca aparece (ni un maestro del catálogo con el mismo nombre que un usuario estudiante). Los usuarios solo se leen si el rol ve todos los Usuarios. Un registro = maestro + período + clase + varias materias (`ChipPicker`), que muestra solo las materias de la clase elegida (más las que no tienen clase y las ya elegidas: `getClassSubjects`). **Una materia la da un solo maestro por período** (sin importar la clase): en el `ChipPicker` las que ya tienen maestro salen bloqueadas con "Asignada a …" (`getTakenSubjects`; `SelectOption.disabled`), `validateAssignment` lo vuelve a revisar al guardar, y la vista avisa de materias repetidas guardadas antes de esta regla (`findRepeatedSubjects`). Ojo: se revisa con los registros que el rol ve; un rol con "propios" no ve los de otros.
- **Alumnos (`features/students`)**: código sugerido `BBI-0001…` (`utils/studentCode.ts`), único.
- **Inscripciones (`features/enrollments`)**: alumno (buscador), clase y período; sugiere el período de la última inscripción.
- **Resumen (`features/dashboard`)**: KPIs y barras calculados con lo que ya está en vivo (sin lecturas extra).
- **Inicio (`features/home`, `/app/inicio`)**: pantalla de entrada de todos (`HomeRedirect`; el estudiante sin alumno va a Mi solicitud): saludo, día de clase (`describeNextClass`), accesos grandes del menú visible (`sortForHome`, prioridad por tipo de rol) y los avisos. Ítems del menú sin módulos = los ve cualquiera; `roleKinds` limita por tipo de rol (`NavigationItem`, `RequirePermission`).
- **Personalizar (`features/customization`, `app_settings/config`)**: nombre y orden del menú, listas desplegables (`navGroups` + `navParents`) y nombres de columnas (`columnLabels`). Lo da `AppSettingsProvider` (en `AppLayout`); el menú se arma en `buildNavigationLayout` (sin personalizar = grupos originales con línea). `ViewHeader` usa el nombre personalizado si la pantalla es del menú. **Toda tabla nueva declara sus columnas en `tableColumns.ts` y usa `useColumnLabels('<tabla>')`.** Se guarda con `mergeFields` (reemplaza el campo entero: un nombre borrado no se queda).
- **Inventario de libros (`features/book-inventory`, `book_movements`)**: el libro (catálogo `books`) lleva `code`, `price`, `isOptional`; el stock = entradas − salidas − ventas (`computeBookStock`, único lugar). Entradas y salidas (dañado, regalado, otro) a mano; **las ventas las escribe Pagos** (concepto de tipo Libros con `bookId` y `quantity`) en la misma transacción/lote que el pago, con id fijo `sale-<pago>-<libro>` (`writeBookSales`): editar o borrar el pago rehace o devuelve sus ventas. Pagos no deja vender más de lo que hay. `bookOrderForm.ts` = formulario IBAD11 (32 libros).
- **Gastos (`features/expenses`, `expenses`)** y **Estado de cuenta (`features/account-statement`)**: rango de fechas (`DateRangeFilter`, `utils/dateRanges.ts`) con `useLiveRangeCollection` (pagos y gastos `where date between`). `buildAccountStatement` suma entradas (pagos), salidas (gastos), desglose por forma de pago y categoría y saldo acumulado; imprimible (`StatementDocument`).
- **Solicitudes (`features/admissions`)**: el estudiante crea su cuenta (`/crear-cuenta`, `registerStudent`: app_users con rol `estudiante`, `selfRegistered`, sin alumno; las reglas solo dejan eso: `isSelfRegistration`), llena **Mi solicitud** (`ApplicationWizard`, 5 pasos, formulario IBAD80 sin Seguro Social) en `admission_applications/{uid}` y la oficina la aprueba en **Solicitudes** (`approveApplication`: crea el alumno o usa uno con el mismo nombre, liga `app_users.studentId` —regla `isAdmissionLink`— y marca aprobada) o la devuelve con nota. Después el alumno pide inscripción (`enrollment_requests`) y la oficina la confirma (`approveEnrollmentRequest` crea la inscripción con su roster). Mi solicitud no depende de los permisos del rol: lo propio se lee por uid / studentId.

### Seguridad
- Los handlers que actúan sobre un ítem lo reciben como parámetro; `ConfirmDialog` recibe el `item` y lo pasa a `onConfirm(item)`.
- Si algún día se genera HTML crudo (PDF, correo, impresión), todo texto libre se escapa antes.
- Nunca subas `.env` con secretos ni llaves de cuentas de servicio. La config web de Firebase en `config/firebase.ts` es pública por diseño.

### Agregar una vista nueva
1. Ruta en `routes/paths.ts`. 2. `lazy()` + entrada en `PROTECTED_ROUTES` de `App.tsx` con su módulo de permisos. 3. Ítem en `NAVIGATION` (`components/layout/navigation.ts`) con el mismo módulo. 4. Si es un módulo de permisos nuevo, ver "Roles y permisos". 5. Si usa una colección nueva: `COLLECTIONS`, tipo en `src/types`, service, `SOURCES`/`PERIOD_SOURCES` de `liveCollections.ts` y `security/firestore.rules`.

### Utilidades que ya existen (búscalas antes de escribir otra)
- Fechas y períodos: `utils/dateFormat.ts`, `utils/periodStatus.ts` (`getPeriodStatus`, etiquetas y badges), `utils/academicPeriods.ts` (`getDefaultPeriod`, `suggestPeriodName`).
- Dinero y costos: `utils/money.ts` (`formatMoney`, `roundMoney`, `sumMoney`, `parseAmount`), `utils/courseCost.ts`.
- Otros: `utils/relations.ts`, `utils/search.ts` (`matchesSearch` sin acentos), `utils/sorting.ts`, `utils/options.ts` (`toSelectOptions`), `utils/plural.ts`, `utils/displayId.ts`, `utils/studentCode.ts`, `utils/firebaseErrors.ts` (`getErrorMessage`), `utils/userFacingError.ts`.
- Hooks compartidos: `useCrudScreen` (formulario abierto y registro a borrar), `useFormFields`, `useAsyncAction` (guardando + error traducido), `useMediaQuery` + `PHONE_QUERY` (dibuja SOLO la tabla o SOLO las tarjetas, nunca las dos).
- Componentes compartidos: `ViewHeader`, `SegmentedTabs`, `DateRangeFilter`, `MenuButton` (solo en la barra superior, `components/layout/Topbar.tsx`), `Popover` (panel flotante de la barra superior), `Modal` (`size`: md = formulario ~70% de ancho y alto de la pantalla, por defecto; full = casi toda; sm = confirmación), `NoPeriodState`, `CopyableValue`, `Barcode`, `ConfirmDialog`, `Field`, `DateInput`, `MoneyInput`, `SearchInput`, `SearchSelect`, `ChipPicker`, `ClassSelect`, `PeriodBadge`, `FilterChips` (con o sin opción "todas"), `RowActions`, `EmptyState`, `ListSkeleton`, `StatCard`, `Crest`, `FullPageLoader`.
- **Mientras llega un dato: esqueleto (`ListSkeleton`), no texto.**
- Formularios anchos: `.form-columns` + `.form-column` / `.form-column-panel` dentro de un `Modal size="full"`.
- Clases globales en `App.css`: `.btn` (+ `-primary`, `-secondary`, `-ghost`, `-danger`, `-icon`, `-large`), `.view`, `.view-header`, `.view-toolbar`, `.panel` (+ `.panel-padded`), `.table-stack` (tabla que en teléfono se ve como tarjetas: cada `td` con `data-label`), `.cell-note`, `.field`, `.input`, `.input-select`, `.form-grid`, `.table`, `.record-cards`, `.chip`, `.badge-*`, `.empty-state`, `.form-alert`.

### CSS global: trampas conocidas
- `main.tsx` importa `index.css` y `App.css` ANTES que `App`: así el CSS de cada componente se carga después y puede sobreescribir las clases globales (p. ej. `.sidebar-close { display: none }` sobre `.btn`). No cambies ese orden.
- `.input[readonly]` (no `:read-only`): `:read-only` también atrapa a los `<select>` y les borra la flecha.
- `vite.config.ts` usa `cssCodeSplit: false` a propósito (un solo CSS) y separa `firebase` y `react` en chunks propios. No lo cambies sin preguntar.

### Archivos y entorno
- Archivos de texto en LF.
- `npm run build` = `tsc -b && vite build`.
- Hosting: Cloudflare Workers con archivos estáticos (`wrangler.jsonc`: `assets.directory` = `dist`, `not_found_handling: single-page-application` para que cualquier ruta sirva `index.html`). El build de Cloudflare corre `npm run build` y `npx wrangler deploy`; `npm run deploy` hace lo mismo desde la CLI. No uses `pages_build_output_dir`: con él `wrangler deploy` falla ("Missing entry-point"). `public/_headers` cachea `/assets/*` para siempre y nunca `index.html`.

## Verificación al terminar

1. `npx tsc -b` → sin errores.
2. `npx eslint .` → sin problemas.
3. `grep -rn "style={{" src` → solo variables CSS.
4. `npm run build` si el cambio afecta la carga o la configuración.
5. Di explícitamente qué no pudiste probar en el navegador: tsc, eslint y build verifican que compila, no que funciona.
