# Huerto

Base de proyecto Angular 21 pensada para reutilizarse como plantilla de una web general con autenticación real, estilos con Tailwind, lint con ESLint, pruebas con Jest y Playwright, despliegue en GitHub Pages e internacionalización básica en español e inglés.

La internacionalización se guarda en ficheros `json` por idioma dentro de `src/assets/i18n/`, y el selector global de idioma usa PrimeNG con el estilo visual integrado en la propia app.

Las pantallas de ruta de esta base, incluidas `login`, `dashboard` y las vistas de error, deben componerse por defecto con utilidades Tailwind en los templates. Los `*.component.scss` se mantienen como soporte excepcional, no como vía principal de maquetación.

La base ya está preparada para usar Firebase Authentication en frontend y puede conectarse directamente a Firestore como primera base de datos sin necesidad de levantar un servidor propio.

Para Firestore, esta base asume una colección por usuario en `users/{uid}/tasks` y trae archivos iniciales de reglas e índices en `firestore.rules` y `firestore.indexes.json`.

Este repositorio ya incluye:

- Angular 21 con NgModules
- Tailwind CSS
- Firebase Authentication
- ESLint con `angular-eslint`
- acceso con Google
- acceso anónimo
- ruta protegida con `AuthGuard`
- entorno local fuera de git
- despliegue a GitHub Pages con `GitHub Actions`

## Stack

- Angular `21.2.x`
- TypeScript `~5.9.3`
- Tailwind CSS `3.4.x`
- Firebase Web SDK `10.x`
- ESLint `10.x` + `angular-eslint` `21.x`
- Jest
- Playwright + `playwright-bdd`

## Estructura importante

- `src/app/auth/auth.service.ts`: integración con Firebase Auth
- `src/app/auth/auth.guard.ts`: protección de rutas
- `src/app/login/`: pantalla de login
- `src/app/dashboard/`: pantalla protegida
- `src/app/login/login.module.ts`: módulo lazy para el área de acceso
- `src/app/dashboard/dashboard.module.ts`: módulo lazy para el área autenticada
- `src/app/firebase/firebase-app.ts`: utilidad compartida de inicialización de Firebase
- `src/app/dashboard/data/dashboard-firestore.service.ts`: lectura de datos reales desde Firestore para el dashboard
- `src/environments/environment.ts`: placeholders seguros
- `src/environments/environment.prod.ts`: placeholders seguros para producción
- `src/environments/environment.local.ts`: configuración real local, ignorada por git
- `src/environments/environment.local.example.ts`: plantilla del entorno local
- `firestore.rules`: reglas base de acceso por usuario para Firestore
- `firestore.indexes.json`: índice inicial de Firestore
- `.github/workflows/deploy-pages.yml`: despliegue automático a GitHub Pages

## Scripts

- `npm start`: arranca el proyecto en desarrollo
- `npm run build`: build de producción
- `npm run build:pages`: build de producción para Pages
- `npm run watch`: build de desarrollo en watch
- `npm run lint`: lint de TypeScript y templates Angular
- `npm run lint:fix`: aplica autofixes seguros de ESLint cuando existen
- `npm test`: tests unitarios
- `npm run test:e2e`: tests E2E con Playwright BDD
- `npm run test:e2e:ui`: Playwright UI

## Calidad y validación

El flujo básico de validación local recomendado antes de subir cambios es:

```bash
npm run lint
npm run test:unit -- --watch=false
```

Si el cambio toca rutas, copy visible, autenticación o integración con Firestore, conviene añadir también:

```bash
npm run test:e2e
```

El workflow de GitHub Pages ejecuta `lint`, tests unitarios y E2E antes de permitir la build y el despliegue.

## Puntos de auditoria

Estos puntos deben revisarse al modificar este proyecto y tambien al usar esta base para crear otros proyectos.

### 1. Estructura escalable

- Organizar la app por features y no por tipo tecnico global.
- Mantener separacion clara entre componentes, servicios, modelos, guards y utilidades.
- Evitar componentes pagina con demasiadas responsabilidades.
- Favorecer lazy loading en areas funcionales grandes o rutas protegidas.

### 2. Signals vs RxJS

- Usar `Signals` para estado local y derivado de UI.
- Usar `RxJS` para streams asincronos, auth, router, HTTP, Firestore y fuentes externas.
- Evitar mezclar ambos enfoques sin una frontera clara.
- Si una feature combina ambos, centralizar la adaptacion en una facade, servicio o view-model.

### 3. Rendimiento

- Priorizar `ChangeDetectionStrategy.OnPush` en componentes de feature.
- Evitar calculos costosos y llamadas repetidas a metodos dentro del template.
- Usar `track` o identificadores estables en listas renderizadas.
- Mantener lazy loading, division por modulos o carga diferida cuando el area lo justifique.

### 4. Memory leaks

- Evitar suscripciones manuales cuando pueda usarse `async` pipe, `Signals` o `takeUntilDestroyed`.
- No anidar `subscribe` si puede resolverse con operadores de RxJS.
- Limpiar cualquier listener externo o integracion imperativa al destruir el componente o servicio.

### 5. Flujo de datos

- Dejar claro donde vive cada dato, quien lo modifica y quien solo lo consume.
- Centralizar acceso a datos externos en servicios o facades.
- Evitar que un componente mezcle carga de datos, reglas de negocio, mutaciones y presentacion si empieza a crecer.
- Mantener consistencia entre nombres de dominio, tipos, template y servicio.

### 6. Testing

- Cubrir logica de negocio con unit tests.
- Cubrir contratos entre servicio y template cuando haya transformaciones o render derivado.
- Añadir E2E en flujos criticos como login, rutas protegidas, formularios y operaciones persistentes.
- No dar por buena una feature solo porque compila; validar comportamiento observable.

### 7. Depuracion y operabilidad

- Gestionar errores esperables con mensajes claros y rutas de escape razonables.
- Validar supuestos de producto contra el codigo real y la documentacion.
- Evitar depender de `console.log` como estrategia principal de diagnostico.
- Mantener README, configuracion y comportamiento alineados para reducir errores de integracion.

### 8. Documentacion viva

- Actualizar `README.md` cuando cambie una regla arquitectonica, de permisos o de despliegue.
- Actualizar `memory.md` cuando aparezca una convencion reusable del proyecto.
- Si una funcionalidad es privada, temporal o experimental, dejarlo reflejado en codigo, tests y documentacion.

### 9. Checklist rapido antes de cerrar un cambio

- La feature respeta la estructura por features.
- El flujo de datos esta claro y no depende de acoplamientos ocultos.
- No se introducen suscripciones o listeners sin limpieza.
- El template no contiene logica de negocio innecesaria.
- La documentacion sigue describiendo el comportamiento real.
- `npm run lint` pasa.
- `npm run test:unit -- --watch=false` pasa.
- Si el cambio toca flujos criticos, tambien pasa `npm run test:e2e`.

## Cómo arrancar un proyecto nuevo con esta base

1. Clona o copia este repositorio.
2. Instala dependencias:

```bash
npm install
```

3. Crea tu entorno local real a partir de la plantilla:

```bash
cp src/environments/environment.local.example.ts src/environments/environment.local.ts
```

4. Rellena `src/environments/environment.local.ts` con tu configuración de Firebase.
5. Arranca la app:

```bash
npm start
```

## Configuración de Firebase

Esta base usa Firebase Authentication en el frontend y puede usar Firestore como base de datos inicial.

### 1. Crear proyecto

Entra en `https://console.firebase.google.com/` y crea un proyecto nuevo o usa uno existente.

### 2. Registrar la app web

Dentro del proyecto:

1. Abre `Project settings`
2. En `Your apps`, pulsa el icono web `</>`
3. Registra la app
4. Copia el bloque `firebaseConfig`

El formato esperado en este proyecto es:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    appId: '...',
    messagingSenderId: '...',
    storageBucket: '...'
  }
};
```

No hace falta usar aquí:

- `measurementId`
- `initializeApp(...)`
- `getAnalytics(...)`

La inicialización de Firebase ya la hace la aplicación desde `auth.service.ts`.

### 3. Activar proveedores de autenticación

En Firebase Console:

1. `Build`
2. `Authentication`
3. `Get started` si aún no está activado
4. pestaña `Sign-in method`
5. habilita `Google`
6. habilita `Anonymous` si quieres acceso invitado

### 3.b Crear Firestore Database

En Firebase Console:

1. `Build`
2. `Firestore Database`
3. `Create database`
4. elige modo `production` o `test` solo para arranque rápido local
5. selecciona la región

La estructura esperada por el dashboard es:

- `users/{uid}/tasks/{taskId}`

Campos recomendados por documento:

- `title`: `string`
- `area`: `string`
- `dueLabel`: `string`
- `status`: `pending` | `in-progress` | `done`
- `createdAt`: `timestamp`

Reglas iniciales:

- copia el contenido de `firestore.rules` en las reglas de Firestore, o despliega ese archivo desde Firebase CLI cuando la config de proyecto ya exista.

### 4. Dominios autorizados

En Firebase:

1. `Authentication`
2. `Settings`
3. `Authorized domains`

Añade al menos:

- `localhost`
- tu dominio de producción

Para GitHub Pages, si publicas en `https://javitid.github.io/huerto/`, el dominio que debes añadir es:

- `javitid.github.io`

No se añade la ruta `/huerto`, solo el dominio.

## Cómo funciona la autenticación en esta base

El login hace dos cosas:

- `Entrar con Google`: usa `signInWithPopup(...)`
- `Continuar como invitado`: usa `signInAnonymously(...)`

Además:

- la sesión se guarda con `browserLocalPersistence`
- el estado de usuario se escucha con `onAuthStateChanged(...)`
- `/dashboard` está protegido con `AuthGuard`
- desde el dashboard se puede cerrar sesión

## Entornos y credenciales

La estrategia de entornos es esta:

- `environment.ts`: placeholders seguros
- `environment.prod.ts`: placeholders seguros
- `environment.local.ts`: valores reales para desarrollo local
- `environment.local.example.ts`: plantilla para clonar

### Dónde van los valores reales

En local:

- `src/environments/environment.local.ts`

En producción para GitHub Pages:

- en `GitHub Secrets`

### Qué no se debe subir a git

No subas:

- `src/environments/environment.local.ts`
- claves privadas de servidor
- service accounts

## Análisis de ficheros en frontend

El dashboard incluye una zona privada de análisis de ficheros visible solo para usuarios autenticados cuyo email figure en `environment.fileAnalysis.allowedEmails`.

Ese análisis se hace directamente en el navegador:

- no necesita Cloud Functions
- no requiere cambiar el proyecto a Blaze
- no persiste el fichero por defecto
- y es adecuado para CSV, JSON, TXT y revisiones ligeras del contenido

El flujo actual analiza CVs en PDF y devuelve campos detectados junto con recomendaciones de mejora.

No hace falta configurar ningún endpoint adicional para usar esta funcionalidad.
- secretos de backend

`environment.local.ts` ya está en `.gitignore`.

## GitHub Pages

Esta base está preparada para desplegarse con GitHub Pages mediante workflow.

### Configuración del repositorio

En GitHub:

1. ve a `Settings`
2. entra en `Pages`
3. usa como fuente `GitHub Actions`

### Secrets obligatorios

En el repositorio:

1. `Settings`
2. `Secrets and variables`
3. `Actions`
4. crea estos `Repository secrets`:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_STORAGE_BUCKET`

El workflow usa esos valores para generar `src/environments/environment.prod.ts` justo antes del build.

### Qué hace el workflow

El workflow de `.github/workflows/deploy-pages.yml`:

1. hace `npm ci`
2. genera `environment.prod.ts` desde secretos
3. ejecuta `npm run build:pages`
4. copia `index.html` a `404.html` para SPA fallback
5. sube `dist/huerto`
6. despliega a GitHub Pages

### Nota sobre routing en GitHub Pages

Este proyecto usa hash routing de Angular (`useHash: true`), así que las rutas públicas en navegador quedan como:

- `/#/login`
- `/#/dashboard`

Esto es intencional. GitHub Pages sirve contenido estático y, al entrar directamente en rutas limpias como `/login`, puede devolver un HTTP `404` antes de que la SPA redirija o se recupere con el fallback. Con hash routing evitamos ese falso 404 en accesos directos.

## URL y baseHref

Este repositorio está configurado para desplegar bajo:

```text
/huerto/
```

Eso está definido en `angular.json` mediante:

- `baseHref: "/huerto/"`

Si reutilizas esta base para otro repositorio o ruta, recuerda cambiar:

- `baseHref` en `angular.json`
- la carpeta de salida si quieres renombrarla
- la URL final esperada en Pages

## Cómo comprobar un despliegue

En GitHub:

1. abre `Actions`
2. entra en `Deploy To GitHub Pages`
3. revisa el último run

También puedes revisar:

1. `Settings`
2. `Pages`

Ahí verás:

- la URL publicada
- si el sitio está `built`
- la fuente del despliegue

## Problemas típicos

### En producción aparece:

`Configura Firebase en los archivos environment para habilitar el acceso con Google.`

Causa más común:

- faltan los `GitHub Secrets`

Solución:

- crea los secretos del repo
- relanza el workflow

### Error `auth/unauthorized-domain`

Causa:

- el dominio desde el que se sirve la app no está en `Authorized domains`

Solución:

- añade `localhost` para desarrollo
- añade `javitid.github.io` o tu dominio real para producción

### El login funciona en local pero no en GitHub Pages

Causas típicas:

- no existen los `GitHub Secrets`
- el dominio no está autorizado en Firebase
- estás viendo caché antigua del navegador

### No veo el despliegue nuevo

Comprueba:

- `Actions > Deploy To GitHub Pages`
- `Settings > Pages`
- recarga forzada del navegador

## Identidad del proyecto

Actualmente esta base usa:

- nombre del proyecto: `Huerto`
- carpeta de salida: `dist/huerto`
- favicon: `src/favicon.svg`

Si reutilizas la base para otro nombre, revisa:

- `package.json`
- `angular.json`
- `src/index.html`
- `src/app/app.component.ts`
- `src/favicon.svg`
- `.github/workflows/deploy-pages.yml`

## Notas de calidad

- `npm run build` debe pasar antes de desplegar
- el proyecto ya compila con la configuración actual
- si los tests de Jest fallan, revisa la configuración de `setupZoneTestEnv`, porque hubo un fallo previo no relacionado con Firebase

## Resumen rápido para reutilizar esta base

1. clona la base
2. `npm install`
3. crea `environment.local.ts`
4. configura Firebase
5. activa Google Auth y Anonymous Auth
6. autoriza `localhost` y tu dominio
7. prueba con `npm start`
8. crea los `GitHub Secrets`
9. configura Pages con `GitHub Actions`
10. haz push a `master`
