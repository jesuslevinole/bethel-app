# Notas de código

Decisiones que alguien podría deshacer por error, y pendientes. Agrega al final; busca con `grep`.

## 10/22/2026 — Versión inicial

- **Acceso solo con `admin_users/{uid}`.** Firebase Auth permite crear cuentas desde cualquier cliente con la API key pública, así que "estar logueado" no basta. Las reglas exigen el documento en `admin_users`, que solo se crea desde la consola.
- (Reemplazado 10/23/2026: ya no hay "Total curso"; ver abajo.)
- **Los totales no se guardan** en `course_costs`: se calculan siempre desde los montos para que nunca queden desfasados.
- **Maestros sin repetir.** En la hoja cada maestro aparecía una vez por materia; en la app el maestro está una vez en el catálogo y las materias se le asignan en "Materias por maestro" (un registro con varias materias).
- **Datos de la hoja normalizados** en `initialCatalogData.ts`: mayúsculas/minúsculas y acentos, "Oswaldo Ramiez" → "Oswaldo Ramírez", "Escatoligia II" → "Escatología II", y "Profetas del Antiguo Testamento I" aparecía dos veces (se dejó una). Si la segunda era "II", agrégala en Catálogos.
- **Una materia de una clase, un maestro por período.** `validateAssignment` bloquea asignar la misma materia de la misma clase a dos maestros si los períodos se cruzan. Si algún día se permite co-docencia, ese es el lugar.
- **Inscripción duplicada** = mismo alumno + misma clase + mismo inicio de período.
- **Orden de CSS:** `main.tsx` importa los globales antes que `App` (ver CLAUDE.md, trampas de CSS).

## Pendientes

- (Resuelto 10/22/2026: portal de Maestros con asistencia y notas; ver abajo.)
- Pagos e ingresos: los catálogos (tipos de pago, tipos de ingreso, bancos, gastos) ya existen; falta el módulo que los usa.
- (Resuelto 10/22/2026: roles y permisos; ver abajo.)

## 10/22/2026 — Pantalla "sin acceso"

- `NoAccessNotice` distingue dos casos (`AdminSession.accessIssue`): falta el documento en `admin_users` (`missingProfile`) o Firestore niega la lectura (`rulesBlocked`, casi siempre reglas sin publicar). Muestra el UID completo con botón de copiar y los pasos para cada caso.

## 10/22/2026 — Períodos académicos, asistencia y notas, ficha del alumno

- **Todo va por `periodId`.** Costos, materias por maestro e inscripciones dejaron de guardar fechas de período propias (`periodStart`/`periodEnd`) y ahora apuntan a `academic_periods`. Los registros creados antes de este cambio no tienen `periodId` y no aparecen en ningún período: hay que volver a crearlos (la app era nueva, había poco o nada).
- **Listeners por período** (`PERIOD_SOURCES` en `liveCollections.ts`): costos, materias por maestro e inscripciones se escuchan solo del período elegido. No los cambies a la colección completa: crecen cada año.
- **Reglas de unicidad por período:** un alumno, una sola inscripción; una clase, un solo registro de costos; una materia de una clase, un solo maestro.
- **Sin nota final.** La hoja tenía una columna "Final" cortada en la captura y no conocemos la fórmula (la nota diaria parece ir en otra escala: 4–5 frente a exámenes de 0–100). Se muestran las tres notas tal cual. Si el instituto da la fórmula, va en `features/attendance/gradeScores.ts`.
- **Asistencia: Presente / Tarde / Falta.** La hoja solo usaba A/F; se agregó "Tarde" como en el diseño de referencia. El porcentaje de asistencia cuenta Presente y Tarde como asistió.
- **Cuentas desde el navegador** con una app secundaria de Firebase en memoria (hoy en `features/users/services/userAccounts.ts`): si se usara la instancia principal, quien crea la cuenta quedaría con la sesión del usuario nuevo. Borrar un usuario borra su perfil; la cuenta de Auth queda (borrarla requiere Admin SDK).
- **Fotos en Firestore, no en Storage:** el plan Spark ya no incluye Cloud Storage. JPEG 360×480 (~30 KB) en `student_photos/{studentId}`.
- **Carnet medido en `cqw`:** con `rem` el texto no cabía al imprimir a 85.6 mm. El borde redondeado usa px/mm porque `cqw` en el propio contenedor se mide contra la ventana.

## Pendientes

- Portal de Estudiantes (ver sus notas): sigue como "Próximamente". La ficha del alumno ya reúne lo que mostraría.
- Pagos e ingresos: los catálogos ya existen; falta el módulo que los usa.
- (Resuelto 10/23/2026: fórmula del instituto; ver "Fórmula de notas".)

## 10/22/2026 — Roles y permisos

- **Reemplaza a `teacher_users`** por `app_users` (cualquier rol) + `roles`. `admin_users` queda como "propietario del sistema": acceso total siempre, para que nadie quede fuera si se rompe un rol.
- **Permisos por módulo**: ver (Ninguno / Propios / Todos) + agregar, editar, eliminar. Los mismos permisos se aplican en la UI (`usePermissions`) y en `security/firestore.rules`. Si cambias uno, cambia el otro.
- **"Propios" necesita filtro en la consulta**: Firestore no filtra por reglas; rechaza la consulta entera si podría devolver algo ajeno. Por eso las vistas usan `useScopedData.ts`, que agrega `where(studentId|teacherId ==)`.
- **Notas y asistencia del estudiante**: el rol Estudiante NO ve sus notas todavía. Las planillas son por grupo (un documento con las notas de toda la clase); dárselas a un alumno expondría las de sus compañeros. Para el portal del estudiante hará falta guardar además un resumen por alumno.
- **Datos de referencia abiertos a miembros**: clases, materias, maestros, períodos y roles los lee cualquier usuario activo (solo nombres). El "ver" de Catálogos / Períodos controla la pantalla.
- **Reglas sin probar en emulador**: el emulador de Firestore no se pudo descargar en el entorno de desarrollo. Antes de dar acceso a usuarios reales, probar en la consola (Reglas → "Área de prueba de reglas") al menos: maestro lee su planilla, maestro no lee planillas de otro maestro, estudiante lee solo su inscripción.

## Pendientes

- Portal del estudiante con sus notas (requiere resumen por alumno; ver arriba).
- Pagos e ingresos: los catálogos ya existen; falta el módulo que los usa.
- (Resuelto 10/23/2026: fórmula del instituto; ver "Fórmula de notas".)

## 10/23/2026 — Reglas compactas

- `security/firestore.rules` se reescribió con cada `allow` en una sola línea y la lógica en funciones (`canRead`, `canCreate`, `canEdit`, `canDelete`, `canReadSheet`, `canEditStudent`). La versión larga se cortaba al copiarla a la consola (error "Unexpected EOF" en la línea 189). Los catálogos van en un solo `match /{catalog}/{docId}` con listas de colecciones. Mismos permisos que antes.

## 10/23/2026 — Formularios grandes, roles en tabla, registro por rol, hoja de asistencia

- **Formularios al ~70% de la pantalla** (`Modal` size md por defecto). Confirmaciones siguen pequeñas (sm).
- **Sin "ligado a" en Usuarios:** el tipo del rol (`kind`) decide. Se liga por **nombre exacto** (sin acentos ni mayúsculas): si se escribe distinto que en el catálogo, se crea un maestro/alumno nuevo. El formulario avisa cuál de los dos va a pasar antes de guardar.
- **Rol Maestro predeterminado ya no ve Alumnos ni Inscripciones.** Los roles creados antes conservan los permisos viejos: en Roles → Editar → "Restaurar permisos sugeridos".
- **`roster` en teacher_assignments** es una copia (nombre y código). Si se edita un alumno por fuera de la app (consola), la lista queda vieja hasta "Actualizar listas de alumnos".
- **Nota diaria = promedio de ND de la hoja.** Se calcula en pantalla y se guarda en `grades` al guardar exámenes; la ficha del alumno usa el guardado o, si no hay, el promedio en vivo.
- **Planillas anteriores** (asistencia por día sin `dailyScores`) siguen funcionando: se ven en la hoja con ND vacía.

## 10/23/2026 — Clase en materias, catálogo de libros

- **Materias y libros pertenecen a una clase** (`classId`), como en la hoja (MATERIA + CLASE, LIBROS + CLASE). La clase es obligatoria al guardar desde Catálogos.
- **Materias guardadas antes** no tienen `classId`: siguen apareciendo en "Materias por maestro" para cualquier clase hasta que se les asigne. El aviso "Asignar clases según la hoja" lo hace de una vez con la lista de la hoja (`SUBJECTS_BY_CLASS`); las que no estén ahí se editan a mano.
- **La lista de Cuarto en la hoja se veía cortada** (solo 3 materias: Teología sistemática I, Práctica ministerial A.V.A., Las epístolas a los Corintios). Las que falten se agregan en Catálogos → Materias.
- **Libros de la hoja eran "Libro 1"…"Libro 16"** repartidos entre las 4 clases en orden. Son de relleno: cámbiales el nombre real o bórralos.
- **El precio del libro no va en el catálogo**, va en Costos del curso de cada período (puede cambiar de un año a otro). Costos del curso trae los libros de la clase sin precio: solo si la lista está vacía al elegir la clase, o con el botón "Traer N libros del catálogo". Se guardan por título (copia), no por id: borrar o renombrar un libro del catálogo no cambia costos ya guardados.
- **Una clase con materias o libros no se puede borrar** (se agregaron a sus `references`).
- Reglas: `books` se lee como clases/materias (cualquier miembro) y se escribe con permiso de Catálogos. **Hay que volver a publicar las reglas.**

## 10/23/2026 — Barra superior, notificaciones, ver como, catálogos en tarjetas

- **El período pasó a la barra superior** (con notificaciones y ver como). El menú lateral quedó sin período ni subtítulos. El botón de menú del teléfono también se movió a la barra superior (ya no está en `ViewHeader`).
- **Notificaciones calculadas, no guardadas.** No hay colección ni Cloud Functions (plan Spark): cada aviso sale de los datos que el rol ya puede leer y se va solo cuando se resuelve. Lo "visto" vive en el navegador; en otro equipo vuelven a contar como nuevas. Si algún día se quieren avisos con historial o por correo, hace falta una colección `notifications` y quién la escriba.
- Avisos de hoy: sin roles, sin período / ninguno vigente, período por terminar (30 días), catálogos vacíos, materias sin clase, clases sin costos en el período, clases con alumnos y sin materias asignadas, y para el maestro: grupo sin alumnos.
- **Ver como es solo del propietario** y no es una simulación de seguridad: muestra la interfaz con los permisos de otro, pero Firestore responde como propietario. Para probar las reglas de verdad hay que entrar con la cuenta de esa persona.
- **"Ver como" un rol sin usuario** no tiene maestro ni alumno ligado: un rol con "propios" se ve vacío. Para ver lo que ve un maestro concreto, elige su usuario.

## 10/23/2026 — Sin "Total curso"; quién puede ser maestro

- **Mensualidad = total del programa / meses**, con total del programa = inscripción + libros + graduación (pedido del instituto). Se quitó "Total curso" del formulario, la tabla y las tarjetas. Los registros viejos conservan el campo `courseTotal` en Firestore pero ya no se suma: **revisa los costos que ya guardaste**, sus totales cambiaron.
- Ojo para el módulo de pagos: la inscripción y la graduación ya van repartidas dentro de la mensualidad. Si además se cobran aparte, se cobrarían dos veces.
- **Maestro = cualquier usuario que no sea estudiante** (Maestro, Director, Administración) o un maestro del catálogo. Al elegir un director o alguien de administración se crea su registro en el catálogo de maestros (hace falta permiso para agregar en Catálogos). Su usuario no se liga a ese registro (`teacherId` queda vacío): con "ver todos" no lo necesita; si algún día un rol de personal tiene asistencia con "propios", habría que ligarlo.

## 10/23/2026 — Clase del día

- **El maestro entra directo a "Clase del día"**: elige el grupo (clase · materia), ve a todos sus alumnos y marca asistencia y nota del día. Solo cambia la fecha (hoy por defecto). Se guarda en el mismo documento `attendance/{assignmentId}_{subjectId}_{fecha}` que la hoja completa: las dos vistas muestran lo mismo.
- La hoja completa sigue para ver todas las fechas, borrar una fecha e imprimir. Su botón pasó de "Agregar clase" a "Agregar fecha" ("clase" ya significa Primer, Segundo…).
- Cambios sin guardar se pierden si se cambia de pestaña o de grupo (cambiar de día no los pierde).

## 10/23/2026 — Fórmula de notas, expediente y boletas (hoja "Instituto_sampo.xls")

- **Fórmula (features/attendance/gradeFormula.ts, único lugar):**
  - Asistencia sobre 10 = 10 − faltas, mínimo 3 (hoja: columna J de "Reporte Total de Asignatura").
  - Nota diaria de la boleta = promedio de ND − 1 punto por falta (hoja: `F − I`).
  - Promedio ("Average Credit") = (1er examen + nota diaria + 2do examen) / 3; si la materia tiene proyecto, + proyecto y / 4. Nota vacía = 0, como en la hoja. La asistencia NO entra en el promedio (en la hoja tampoco).
  - GPA: 93+ 4.0, 90 3.7, 85 3.3, 80 2.7, 77 2.3, 73 2.0, 70 1.7, menos F. Es la escala de la hoja tal cual (no tiene 3.0 ni 1.0).
- **Errores de la hoja que NO se copiaron:**
  - La nota diaria restaba también la columna "Proyecto" (`F − I − J`): con proyecto 100 la diaria quedaba en 0. Eso hacía que "Los Libros Históricos" saliera 66.67 / F con todo en 100.
  - Pentateuco sumaba 5 notas (diaria dos veces) y dividía entre 4; las demás filas dividían entre 3 sin proyecto.
  - Filas 21–25 de asistencia comparaban `>=37` en vez de `>=3`.
  - Hay que confirmar con el instituto: si "J" antes era tardanzas (la diaria bajaría también por tarde). Hoy solo bajan las faltas.
- Las tardanzas cuentan como asistencia y no restan.
- **Expediente académico** (ficha → Expediente): todas las clases del programa con las materias del catálogo; lee el historial completo del alumno al abrirse (inscripciones de todos los períodos + planillas de cada clase: varias lecturas, no se guarda resumen). Si crece mucho, guardar un resumen por alumno al guardar notas.
- **Boletas** (ficha → Boletas): una por materia del período elegido, dos por fila al imprimir. Textos en español (la hoja estaba en inglés).
- Director y decano de educación y la frase de la boleta están en `config/institute.ts`.
- La hoja de PAGOS cobra inscripción, graduación y libros aparte y la mensualidad es otro concepto ($55 por mes). Choca con "mensualidad = total del programa / meses" que se pidió para Costos del curso: revisar antes del módulo de pagos.

## 10/23/2026 — Roles ampliados, exportar a Excel, miércoles y semestres

- **Columnas nuevas en Roles:** Exportar Excel, Imprimir, Historial (expediente), Ver como. Solo se pusieron columnas que hacen algo en la app; las del ejemplo de otra app (plantillas, importar CSV, notas internas, campos de dinero, borrado en bloque, configurar formulario, campos bloqueados, verificar) no aplican hoy. Si se agrega una función así, se agrega su acción en `PermissionAction` y `ACTION_COLUMNS`.
- **Exportar** genera .xlsx con `write-excel-file` (se carga solo al exportar). Exporta lo que se ve: respeta búsqueda y filtros.
- **Ver como para otros roles:** Firestore sigue respondiendo con la cuenta real; por eso se cruzan permisos. Un director con "Ver como" puede ver como maestro (sus módulos "todos" quedan como "propios" del maestro), pero no como alguien con más permisos que él.
- **Miércoles:** el calendario de Clase del día y de "Agregar fecha" solo deja elegir miércoles dentro de los semestres. Fechas guardadas antes en otro día siguen visibles (flechas y hoja completa) para no esconder datos.
- **Semestres:** el período guarda dos rangos. Las semanas entre semestres (vacaciones) no tienen clases. Los períodos creados antes muestran "Sin definir" hasta editarlos.
- Pendiente de confirmar: si el primer examen es del primer semestre y el segundo del segundo. Hoy los exámenes no dependen del semestre.

## 10/23/2026 — Mensualidad por mes, semestre en materias

- **Vuelve "Total curso", ahora como en la hoja de PAGOS:** cada mes del período tiene su mensualidad (p. ej. $55 y $25 el último mes). Total curso = suma de los meses; total del programa = inscripción + libros + graduación + total curso. Esto reemplaza "mensualidad = total del programa / meses" (10/23): inscripción, libros y graduación se cobran aparte, como en la hoja.
- Los meses salen del período (del mes de inicio al de fin). Costos guardados antes no tienen mensualidades: al editarlos salen los meses en $0 para llenarlos.
- **Materias con semestre:** el plan de la hoja "Instituto" (Trabajo) trae 4 materias por semestre y año; se usó para la carga inicial y para "Completar según la hoja". Las materias de la hoja de configuración que no aparecen en el plan (p. ej. "Sectas falsas", "Introducción al evangelismo") se editan a mano.
- El expediente agrupa las materias de cada clase por semestre.
- Asistencia: el grupo (clase · materia) se elige en una lista junto a "Maestro".
- Fechas de las tablas alineadas a la izquierda (`cell-date`), como su encabezado.

## 10/23/2026 — Pagos, invoice y deudores; solo miércoles

- **Pagos por período**: cada pago pertenece al período e inscripción del alumno; se cobra contra los Costos del curso de su clase. Si la clase no tiene costos, el estado de cuenta sale en $0.
- **Vencido a la fecha** (deudores): inscripción y libros desde el inicio, cada mensualidad desde su mes, graduación desde el último mes; menos todo lo pagado (sin importar el concepto). Saldo = total del programa − pagado.
- **El concepto se deduce del nombre del tipo de pago** ("Inscripción", "Libros", "Graduación", "Mensualidad"). Si se renombra un tipo de pago a otra cosa, sus pagos dejan de contar en ese concepto (siguen bajando el saldo total).
- **Número de invoice**: correlativo para todo el instituto (counters/payments). Borrar un pago no libera su número.
- **Estudiante**: ve "Mis pagos" (estado de cuenta, meses y sus invoices) con "propios"; las reglas no le dejan escribir. Para eso las reglas dejan leer `course_costs` a quien ve pagos.
- **Roles guardados antes** no traen el módulo Pagos: Administración y Estudiante necesitan "Restaurar permisos sugeridos" (o marcarlo a mano).
- **Solo miércoles**: lo guardado en otro día no se muestra en ninguna parte (no se borró de Firestore).
- Pendiente: avisos de deudores en la campana; pagos en la ficha del alumno.

## 10/23/2026 — Importar alumnos y datos de prueba

- **Importar alumnos** (Alumnos → Importar): lee la tabla de un Word (.docx, con `fflate` + DOMParser), un CSV o una lista pegada. Columnas por encabezado: "Estudiante #"/"Código", "Nombre", "Año"/"Clase", "Mensualidad". Año 1 → la clase con orden 1. Un código que ya existe no se duplica (solo se inscribe). Sin código se le da uno BBI-….
- Opcional: inscribir en el período elegido y crear los Costos del curso de la clase con la mensualidad de la lista (todos los meses del período; inscripción, libros y graduación en $0) si la clase aún no tiene.
- **Datos de prueba** (`isTest` en alumnos, inscripciones y costos creados al importar): "Eliminar datos de prueba" borra esos alumnos con sus inscripciones de todos los períodos, sus pagos, su foto y los costos marcados como prueba. La asistencia y notas que se les pusieron quedan en las planillas pero ya no se ven (no están en la lista del maestro).

## 10/23/2026 — Invoice con formato carta
- Rediseño del invoice: membrete con logo, título "Invoice" con número, fecha y sello "Pagado"; bloques "Facturado a" y "Detalles del pago"; tabla numerada de conceptos; total destacado; franja de estado de cuenta; firmas.
- El estado de cuenta del invoice muestra el saldo antes y después de ESE pago (`invoiceBalance.ts`), así un invoice viejo no cambia cuando entran pagos nuevos. Pagos del mismo día se ordenan por número de invoice.
- "Imprimir / PDF" pone como título del documento el número de invoice y el nombre del alumno: es el nombre que el navegador propone al guardar el PDF.

## 10/23/2026 — Usuarios de prueba sin correo
- Casilla "Usuario de prueba (no necesita correo)" al crear un usuario. Si el correo queda vacío se genera uno interno `nombre.xxxx@bethel.test`: la cuenta de Auth existe igual y se puede entrar con ese correo y la contraseña temporal (se muestran al guardar). Se eligió esto frente a un perfil sin cuenta porque así el usuario de prueba puede entrar de verdad (por ejemplo desde un teléfono), no solo con "Ver como".
- `.test` es un dominio reservado: "Olvidé mi contraseña" no le llega a nadie. Para cambiarle la contraseña, se borra y se crea otro.
- El maestro o alumno que se crea con el usuario de prueba queda marcado `isTest`. Borrar el usuario de prueba se hace con la papelera (como cualquier usuario); su cuenta de Auth queda, igual que con los demás.
