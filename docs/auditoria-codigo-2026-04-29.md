# Auditoria de codigo

Fecha: 2026-04-29

Proyecto auditado: `huerto`

## Alcance

La auditoria se ha realizado siguiendo estos principios:

1. Estructura escalable y orientada a features
2. Uso adecuado de Signals vs RxJS
3. Rendimiento en aplicaciones Angular grandes
4. Prevencion de memory leaks
5. Flujo de datos claro
6. Estrategia de testing
7. Depuracion y operabilidad

Se ha revisado la estructura del repositorio, componentes principales, servicios, routing, tests y pipeline de CI.

## Resumen ejecutivo

La base del proyecto es buena para crecer: hay modularizacion por features con lazy loading, `AuthGuard`, servicios separados para autenticacion y Firestore, i18n simple y una disciplina de calidad ya automatizada con lint, unit tests y E2E en CI.

El principal problema no es la ausencia de buenas practicas, sino la falta de consistencia al aplicarlas. El area de `dashboard` concentra demasiada logica de presentacion, estado y negocio en un solo componente. Ademas, existe al menos un fallo funcional real en el render del analisis de CV y una inconsistencia importante entre la documentacion y el control de acceso real de esa funcionalidad.

## Validaciones ejecutadas

- `npm run lint`: OK
- `npm run test:unit -- --watch=false`: OK, `24` suites y `79` tests en verde

## Hallazgos priorizados

### 1. Alta: el analisis de CV no renderiza varias secciones porque template y servicio no usan las mismas claves

Evidencia:

- El servicio genera campos en secciones `Resumen`, `Perfil`, `Experiencia`, `Formacion` y `Habilidades` en [src/app/dashboard/data/dashboard-file-analysis.service.ts](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/data/dashboard-file-analysis.service.ts:72).
- El template intenta leer `Factura`, `Contrato`, `Consumo` y `Costes` en [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:433), [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:445), [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:457) y [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:470).

Impacto:

- El usuario recibe un analisis incompleto aunque la extraccion haya funcionado.
- El bug puede pasar desapercibido porque el servicio y los tests unitarios pueden seguir pasando.

Recomendacion:

- Unificar las claves de seccion en un tipo compartido o en constantes de dominio.
- Añadir un test de integracion del componente que verifique el render de `Perfil`, `Experiencia`, `Formacion` y `Habilidades`.

### 2. Alta: el control de acceso del analisis de ficheros no coincide con lo que promete la documentacion

Evidencia:

- El README indica que el analisis es visible solo para un usuario concreto en [README.md](/Users/javiergarcia/git/IA/huerto/README.md:244).
- El servicio autoriza a cualquier usuario autenticado con `return user !== null` en [src/app/dashboard/data/dashboard-file-analysis.service.ts](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/data/dashboard-file-analysis.service.ts:9).
- El template muestra la zona privada siempre que `canUploadFiles(user)` sea true en [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:335).

Impacto:

- Riesgo de desalineacion funcional y de producto.
- Si la restriccion era un requisito real, hoy no se esta cumpliendo.
- La UI comunica una limitacion que el codigo no aplica.

Recomendacion:

- Decidir una unica fuente de verdad.
- Si la feature debe ser privada, mover la allowlist a `environment` o a configuracion remota y cubrirla con tests.
- Si la feature ya es general, actualizar README, copies y naming del componente.

### 3. Media: `DashboardComponent` concentra demasiadas responsabilidades

Evidencia:

- Gestiona estado local, carga de datos, creacion, edicion, borrado, filtros, subida de archivos, render de resultados y decisiones de estilo en el mismo archivo [src/app/dashboard/page/dashboard.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.ts:16).
- El template tambien es extenso y mezcla varias subareas funcionales en [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:1).

Impacto:

- Cuesta extender la funcionalidad sin aumentar el acoplamiento.
- El testing del componente se vuelve mas friccionado.
- El flujo de datos pierde claridad porque demasiadas decisiones viven en el mismo punto.

Recomendacion:

- Separar en componentes contenedor/presentacionales.
- Extraer al menos `task-list`, `task-form` y `cv-analysis`.
- Mover view-model derivado y reglas de mutacion a un facade o store local.

### 4. Media: hay señales de coste de render innecesario en templates y falta una estrategia explicita de change detection

Evidencia:

- Los componentes revisados no declaran `changeDetection` en [src/app/dashboard/page/dashboard.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.ts:10), [src/app/login/login.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/login/login.component.ts:7) y [src/app/dashboard/components/task-type-chart/task-type-chart.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/components/task-type-chart/task-type-chart.component.ts:16).
- El template invoca repetidamente metodos como `getVisibleTasks`, `getTaskFilterCardClasses`, `getStatusSelectClasses` y `getAnalysisFields` en [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:40), [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:81), [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:135) y [src/app/dashboard/page/dashboard.component.html](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.html:400).

Impacto:

- En pantallas pequenas no se notara, pero al crecer listas y widgets el componente recalculara mas de lo necesario.
- Complica razonar sobre el rendimiento porque parte del coste vive en el template.

Recomendacion:

- Adoptar `ChangeDetectionStrategy.OnPush` como norma para componentes de feature.
- Convertir calculos repetidos a `computed()` o view-models precomputados.
- Mantener el `track task.id`, que ya es una buena decision.

### 5. Media: mezcla de RxJS y Signals sin una convencion clara

Evidencia:

- `LoginComponent` usa Signals para loading/error, pero sigue haciendo suscripciones anidadas a `ready$` y `user$` en [src/app/login/login.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/login/login.component.ts:24).
- `DashboardComponent` usa Signals para estado local y `Observable` para el usuario y el view-model en [src/app/dashboard/page/dashboard.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/page/dashboard.component.ts:24).

Impacto:

- La frontera entre estado local y flujo asincrono no esta formalizada.
- El proyecto es mantenible hoy, pero mas dificil de escalar si cada feature mezcla patrones de forma distinta.

Recomendacion:

- Definir criterio de equipo:
- `Signals` para estado local y derivado de UI.
- `RxJS` para autenticacion, streams externos y Firestore.
- Usar adaptadores como `toSignal` o una facade para que el template consuma una sola forma de estado por feature.

### 6. Media-baja: existen suscripciones manuales evitables

Evidencia:

- Suscripcion manual en [src/app/app.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/app.component.ts:16).
- Suscripcion manual en [src/app/language-switcher/language-switcher.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/language-switcher/language-switcher.component.ts:26).
- Suscripcion anidada en [src/app/login/login.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/login/login.component.ts:28).

Impacto:

- El riesgo de fuga hoy es bajo porque se hace `unsubscribe` o `take(1)`, pero el patron no escala bien.
- Fomenta duplicacion y mas puntos de mantenimiento.

Recomendacion:

- Migrar a `takeUntilDestroyed`, `async` pipe o Signals derivadas cuando aplique.
- Evitar suscripciones en constructores salvo integraciones muy justificadas.

### 7. Media-baja: el grafico usa una fecha fija de inicio que puede ocultar historico valido

Evidencia:

- El rango del grafico arranca siempre en `new Date(currentDate.getFullYear(), 3, 12)` en [src/app/dashboard/components/task-type-chart/task-type-chart.component.ts](/Users/javiergarcia/git/IA/huerto/src/app/dashboard/components/task-type-chart/task-type-chart.component.ts:144).

Impacto:

- Tareas anteriores al 12 de abril del ano actual no se representaran.
- El comportamiento no parece derivado de los datos ni de una configuracion visible.

Recomendacion:

- Calcular el inicio a partir de la tarea mas antigua o hacerlo configurable.
- Añadir test que cubra tareas historicas fuera de ese rango.

## Evaluacion por principio

### 1. Estructura escalable

Estado: aceptable con margen de mejora.

Puntos fuertes:

- Estructura por features (`login`, `dashboard`, `auth`, `i18n`).
- Lazy loading en [src/app/app-routing.module.ts](/Users/javiergarcia/git/IA/huerto/src/app/app-routing.module.ts:5).

Debilidad principal:

- `dashboard` no mantiene la separacion de responsabilidades dentro de la feature.

### 2. Signals vs RxJS

Estado: correcto, pero sin criterio de arquitectura explicito.

Puntos fuertes:

- Signals para estado de UI local.
- RxJS para auth y Firestore.

Debilidad principal:

- La mezcla no esta encapsulada; cada componente decide por su cuenta.

### 3. Rendimiento

Estado: base correcta, optimizacion incompleta.

Puntos fuertes:

- Lazy loading por modulos.
- `track task.id` en listas.

Debilidad principal:

- Falta estrategia `OnPush` y hay logica invocada desde template.

### 4. Memory leaks

Estado: riesgo bajo hoy, patron mejorable.

Puntos fuertes:

- Las suscripciones encontradas se limpian o usan `take(1)`.

Debilidad principal:

- Se sigue trabajando con suscripcion manual donde Angular moderno ofrece patrones mas seguros.

### 5. Flujo de datos

Estado: claro en features pequenas, difuso en `dashboard`.

Puntos fuertes:

- `AuthService` y `DashboardFirestoreService` centralizan datos externos.

Debilidad principal:

- El flujo de mutacion, filtro y render converge en un unico componente grande.

### 6. Testing

Estado: bueno.

Puntos fuertes:

- Lint, Jest y Playwright integrados.
- CI con jobs separados para lint, unit y E2E en [.github/workflows/deploy-pages.yml](/Users/javiergarcia/git/IA/huerto/.github/workflows/deploy-pages.yml:1).

Debilidad principal:

- Faltan tests que cubran contratos entre servicio y template, justo donde ha aparecido un bug real.

### 7. Depuracion de incidencias

Estado: razonable.

Puntos fuertes:

- Interceptor de errores backend y ruta dedicada.
- La arquitectura no depende de `console.log` para todo.

Debilidad principal:

- Hay mensajes y comportamientos de producto desalineados con la implementacion real, lo que dificulta validar supuestos al depurar.

## Plan de mejora

### Fase 1. Correcciones inmediatas

Objetivo: eliminar fallos funcionales y alinear comportamiento/documentacion.

- Corregir las claves de seccion del analisis de CV en el template.
- Decidir si el analisis de ficheros es privado o general y reflejarlo en codigo, README y copys.
- Añadir tests de integracion que fallen si servicio y template vuelven a desalinearse.

### Fase 2. Ordenar el flujo de datos del dashboard

Objetivo: reducir acoplamiento y facilitar cambios futuros.

- Extraer `TaskFormComponent`.
- Extraer `TaskListComponent`.
- Extraer `CvAnalysisComponent`.
- Crear una facade tipo `DashboardFacade` para exponer un view-model unico y comandos de mutacion.

### Fase 3. Unificar la reactividad

Objetivo: que cada feature use un patron predecible.

- Documentar una convencion Signals/RxJS en el proyecto.
- Sustituir suscripciones manuales por `async` pipe, `takeUntilDestroyed` o `toSignal`.
- Evitar suscripciones anidadas.

### Fase 4. Mejorar rendimiento preventivo

Objetivo: evitar deuda de rendering antes de que crezca el producto.

- Adoptar `OnPush` en componentes de feature.
- Mover calculos frecuentes fuera del template.
- Revisar el grafico para derivar su rango desde datos reales.

### Fase 5. Reforzar cobertura de contrato

Objetivo: atrapar bugs de integracion antes de que lleguen a produccion.

- Añadir tests de componente para el render completo del analisis.
- Añadir tests para la politica de permisos del analisis.
- Añadir tests sobre historico del grafico y filtros del dashboard.

## Conclusiones

La base es solida y esta mejor cuidada que muchos proyectos de arranque: version moderna de Angular, routing modular, testing real y pipeline de calidad. El siguiente salto no pasa por rehacerla, sino por consolidar arquitectura en el `dashboard`, fijar incoherencias de producto y explicitar unas pocas reglas de reactividad y rendering.

Si se ejecuta la Fase 1 y la Fase 2, el proyecto ganara claridad, reducira riesgo funcional y quedara en mejor posicion para crecer sin convertir el `dashboard` en un cuello de botella tecnico.
