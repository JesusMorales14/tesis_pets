<div align="center">

# 🐾 CityVet — Aplicación móvil de predicción de síntomas para diagnósticos de enfermedades en perros y gatos.

[![Angular](https://img.shields.io/badge/Angular-20.0.0-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![Ionic](https://img.shields.io/badge/Ionic-8.0.0-3880FF?style=flat-square&logo=ionic&logoColor=white)](https://ionicframework.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135.3-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8.0-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Aplicación web fullstack para la detección temprana de enfermedades en mascotas mediante Machine Learning**

Desarrollado como proyecto de tesis para la veterinaria **CityVet** — Chincha Alta, Perú · 2026

</div>

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías Usadas](#tecnologías-usadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Uso de la Aplicación](#uso-de-la-aplicación)
- [Documentación de la API](#documentación-de-la-api)
- [Modelo de Machine Learning](#modelo-de-machine-learning)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Calidad de Código y CI/CD](#calidad-de-código-y-cicd)
- [Autores](#autores)

---

## Descripción General

**CityVet** es una plataforma web mobile-first que permite a los dueños de mascotas realizar un pre-diagnóstico inteligente de enfermedades en **perros y gatos** a partir de los síntomas observados. La aplicación utiliza un modelo de **regresión logística** entrenado y validado por cross-validation sobre un dataset veterinario para predecir la enfermedad más probable, estimar su gravedad y facilitar el agendamiento de una cita con el veterinario.

El sistema está diseñado para la clínica **CityVet** y permite a los veterinarios administrar su agenda desde un panel dedicado, visualizando diagnósticos asociados a cada cita antes de la consulta.

---

## Características Principales

### Para el usuario

- **Diagnóstico por síntomas** — Selección intuitiva de hasta 44 síntomas organizados en 10 categorías, con nivel de severidad (0–3) para cada uno.
- **Predicción con IA** — Modelo de regresión logística independiente para perros y gatos, validado por cross-validation, con probabilidad real (sin distorsión artificial) y diagnóstico diferencial cuando el caso es ambiguo.
- **Resultado detallado** — Enfermedad predicha, porcentaje de confianza, fase estimada (1–10) y nivel de gravedad (leve / moderada / grave).
- **Agendamiento de cita** — Selección de fecha y horario con disponibilidad en tiempo real; el diagnóstico se asocia automáticamente a la reserva.
- **Base de conocimiento** — Información sobre más de 50 enfermedades veterinarias: síntomas, prevención, cuidados y nivel de urgencia.
- **Autenticación segura** — Registro, inicio de sesión y perfil de usuario protegido por JWT.

### Para el administrador (veterinario)

- **Panel de administración** — Visualización de citas con diagnóstico, especie y gravedad por fecha.
- **Gestión de horarios** — Bloqueo y desbloqueo de slots de 30 minutos (9:00–21:30).
- **Control de estados** — Actualización de citas entre `pendiente`, `confirmada` y `cancelada`.

### Interfaz

- Diseño **responsive** adaptado a móvil, tablet y escritorio.
- **Modo oscuro / claro** configurable y persistente.
- Navegación por pestañas (tabs) con acceso rápido a diagnóstico e información de salud.

---

## Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador / Móvil)                    │
└──────────────────────────────────────────────────────────────────┘
                               │
                    HTTP/REST (CORS habilitado)
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                  FRONTEND — Angular 21 + Ionic 8                  │
│                                                                    │
│  Páginas          Servicios           Guards                       │
│  ─────────────    ────────────────    ─────────────────────────   │
│  Home             AuthService         authGuard                    │
│  Pet Selection    PredictionService   adminGuard                   │
│  Symptoms         AppointmentService                               │
│  Diagnostic       ThemeService                                     │
│  Schedule         HealthInfoService                               │
│  Admin Panel                                                       │
│  Perfil / Auth                                                     │
│                                                                    │
│  http://localhost:4200                                            │
└──────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                   BACKEND — FastAPI (Python)                       │
│                                                                    │
│  POST /predict          → Motor de predicción ML                  │
│  POST /auth/register    → Registro de usuarios                    │
│  POST /auth/login       → Autenticación JWT                       │
│  GET  /auth/me          → Usuario actual                          │
│  GET  /slots            → Disponibilidad de horarios              │
│  POST /appointments     → Crear cita                              │
│  GET  /appointments/mine→ Citas del usuario                       │
│  GET  /admin/*          → Gestión administrativa                  │
│                                                                    │
│  http://localhost:8000                                            │
└──────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┴──────────────────┐
          │                                        │
┌─────────▼─────────┐                  ┌──────────▼──────────────┐
│  SQLite Database   │                  │  Modelos ML (Joblib)    │
│                    │                  │                          │
│  users             │                  │  model_perro.pkl (~8 KB)│
│  appointments      │                  │  model_gato.pkl  (~9 KB)│
│  unavailable_slots │                  │  le_especie.pkl          │
│                    │                  │  le_enfermedad.pkl       │
│  veterinary.db     │                  │  data/dataset.csv        │
└────────────────────┘                  └──────────────────────────┘
```

### Flujo de un diagnóstico

```
Usuario selecciona especie
         │
         ▼
Selecciona síntomas por categoría
(hasta 44 síntomas, severidad 0–3)
         │
         ▼
POST /predict  ──►  Backend carga modelo por especie
                         │
                         ▼
                    Regresión logística predice enfermedad
                    (probabilidad real, sin calibración artificial)
                         │
                         ▼
                    Si el 2.º diagnóstico está cerca del principal,
                    se informa como diferencial a confirmar
                         │
                         ▼
                    Estimación de fase/gravedad vs. dataset histórico
                         │
         ◄───────────────┘
         ▼
Pantalla de resultado: diagnóstico · confianza · fase · gravedad · diferencial
         │
         ▼
Opción: agendar cita con diagnóstico pre-cargado
```

---

## Tecnologías Usadas

### Backend

| Tecnología       | Versión       | Uso                         |
| ---------------- | ------------- | --------------------------- |
| Python           | 3.10+         | Lenguaje del servidor       |
| FastAPI          | 0.135.3       | Framework API REST          |
| Uvicorn          | 0.42.0        | Servidor ASGI               |
| SQLAlchemy       | 2.0.41        | ORM para base de datos      |
| SQLite           | 3             | Base de datos relacional    |
| scikit-learn     | 1.8.0         | Modelo de clasificación     |
| pandas           | 3.0.2         | Procesamiento de datos      |
| numpy            | 2.4.4         | Operaciones numéricas       |
| joblib           | 1.5.3         | Serialización de modelos ML |
| python-jose      | 3.5.0         | Generación y validación JWT |
| passlib + bcrypt | 1.7.4 / 4.3.0 | Hash seguro de contraseñas  |
| Pydantic         | 2.12.5        | Validación de esquemas      |

### Frontend

| Tecnología  | Versión | Uso                                                                                                                |
| ----------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| Angular     | 21.2    | Framework SPA — standalone, signals, `inject()`, control flow (`@if`/`@for`), nuevo build system basado en esbuild |
| Ionic       | 8.8     | UI components mobile-first                                                                                         |
| TypeScript  | 5.9.3   | Lenguaje del cliente                                                                                               |
| RxJS        | 7.8.0   | Tipado reactivo en servicios (`Observable`, `BehaviorSubject`, `tap`)                                              |
| FontAwesome | 7.2.0   | Iconografía complementaria                                                                                         |

### Arquitectura del frontend

Angular 21 + Ionic 8 con componentes **standalone**, `inject()`, **signals** y
alias de import (`@core/*`, `@shared/*`, `@layout/*`, `@pages/*`). La
organización sigue el patrón **Core / Shared / Features** y, dentro de cada
página, **Container / Presentational**:

- **`core/`** — todo lo que existe una sola vez en la app:
  - `models/` solo interfaces y tipos (contratos de la API);
  - `data/` catálogos estáticos (enfermedades, síntomas, emergencias);
  - `services/` acceso a la API y servicios transversales (`DialogService`, `ToastService`, `ThemeService`…);
  - `utils/` funciones puras y testeadas (fechas, estado de citas, errores HTTP, validación de archivos…);
  - `constants/` datos de la clínica, claves de storage, breakpoints;
  - `seo/` `AppTitleStrategy` + `SeoService` (título y metaetiquetas por ruta);
  - `guards/`, `interceptors/`.
- **`shared/`** — piezas reutilizables sin lógica de negocio: `components/`
  (page-toolbar, date-strip, collapsible-section, empty-state, badges, modales…),
  `pipes/` (`diagnosisLabel`, `appDate`) y `validators/`.
- **`layout/`** — shell de la app (sidebar en escritorio, pestañas en móvil).
- **`pages/<pantalla>/`** — un **contenedor** (`<pantalla>.ts`) que orquesta datos
  y navegación, y sus subcomponentes de presentación en `components/`, que
  reciben `input()` y emiten `output()`. Las páginas con mucho estado usan un
  **store por página** (patrón Facade), p. ej. `profile/profile.store.ts`.

Reglas que hace cumplir ESLint: sin `any`, sin `console.log`, componentes con
`OnPush`, archivos de menos de 250 líneas y reglas de **accesibilidad** en los
templates (`label` asociado, `alt` en imágenes, foco en elementos interactivos).

### Arquitectura del backend

FastAPI organizado **por capas**; cada capa solo depende de las internas:

| Capa | Carpeta | Responsabilidad |
| --- | --- | --- |
| Presentación | `routes/` | Endpoints HTTP, validación de entrada (`schemas/`), dependencias de autenticación (`routes/dependencies.py`) |
| Aplicación | `services/` | Casos de uso y reglas de negocio; lanzan excepciones de dominio, no `HTTPException` |
| Acceso a datos | `repositories/` | Consultas SQLAlchemy (patrón Repository) |
| Dominio | `domain/`, `models/` | Enums de estados (`AppointmentStatus`, `PaymentStatus`, `Role`…), calendario de vacunas, entidades |
| Infraestructura | `infrastructure/` | Web Push (VAPID) y migraciones de SQLite |
| Transversal | `core/` | Configuración centralizada (`config.py`), base de datos, seguridad (JWT/bcrypt), errores, logging |

Patrones aplicados: **Repository**, **Service Layer**, **Dependency Injection**
(`Depends`), **Application Factory** (`create_app()` en `main.py`) y un
**manejador único de errores** que traduce las excepciones de dominio
(`core/exceptions.py`) a respuestas `{"detail": "..."}`.

---

## Requisitos Previos

Asegúrate de tener instalado en tu sistema:

- **Node.js** ≥ 18.x y **npm** ≥ 9.x  
  Verificar: `node -v && npm -v`
- **Angular CLI** ≥ 21 e **Ionic CLI** ≥ 7
  ```bash
  npm install -g @angular/cli @ionic/cli
  ```
- **Python** ≥ 3.10  
  Verificar: `python --version`
- **pip** actualizado
  ```bash
  python -m pip install --upgrade pip
  ```

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tesis_pets.git
cd tesis_pets
```

### 2. Configurar el Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor de desarrollo
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: `http://localhost:8000`  
Documentación interactiva: `http://localhost:8000/docs`

### 3. Configurar el Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

La aplicación estará disponible en: `http://localhost:4200`

### 4. (Opcional) Build para producción

```bash
# Frontend
cd frontend
npm run build
# Genera los archivos estáticos en frontend/www/

# Backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Uso de la Aplicación

### Registro e inicio de sesión

1. Navega a `/register` y crea una cuenta con nombre, email y contraseña.
2. Para registrarse como administrador, ingresa el código admin al momento del registro.
3. Inicia sesión en `/login`. El token JWT se almacena localmente y expira en 7 días.

### Realizar un diagnóstico

1. Desde la pestaña **Diagnóstico**, selecciona la especie: **Perro** o **Gato**.
2. Selecciona los síntomas observados agrupados en categorías:
   - Neurológicos · Respiratorios · Digestivos · Circulatorios · Piel y pelaje
   - Oculares · Urinarios · Conducta · Locomotor
3. Para cada síntoma activo, ajusta la **severidad** (0 = sin síntoma, 1 = leve, 2 = moderado, 3 = grave).
4. Presiona **Diagnosticar**. El sistema mostrará:
   - Enfermedad predicha
   - Nivel de confianza (%)
   - Fase estimada (1–10)
   - Gravedad (leve / moderada / grave)
   - Información detallada de la enfermedad

### Agendar una cita

1. Desde la pantalla de resultado, pulsa **Agendar cita** (requiere estar autenticado).
2. Selecciona una fecha en el calendario (disponible hasta 14 días adelante).
3. Elige un horario libre (9:00–21:30, cada 30 minutos).
4. Confirma el método de pago: **Yape** o **Tarjeta de crédito**.
5. La cita queda en estado `pendiente` hasta que el veterinario la confirme.

### Panel de administración

Accesible en `/admin` para cuentas con rol `admin`:

- **Vista de agenda**: citas del día con diagnóstico, especie y gravedad.
- **Bloqueo de horarios**: marca slots no disponibles para evitar reservas.
- **Gestión de estados**: cambia citas entre `pendiente`, `confirmada` y `cancelada`.

---

## Documentación de la API

La API REST sigue convenciones estándar. Con el servidor activo, la documentación interactiva está disponible en:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Endpoints principales

#### Predicción

| Método | Ruta       | Descripción                             | Auth |
| ------ | ---------- | --------------------------------------- | ---- |
| `POST` | `/predict` | Predice enfermedad a partir de síntomas | No   |

**Body de ejemplo:**

```json
{
  "especie": "perro",
  "fiebre": 2,
  "tos": 1,
  "vomitos": 3,
  "letargo": 2,
  ...
}
```

**Respuesta:**

```json
{
  "especie": "perro",
  "diagnostico": "Parvovirus",
  "probabilidad": 0.94,
  "fase": 7,
  "gravedad": "grave"
}
```

#### Autenticación

| Método | Ruta             | Descripción              | Auth   |
| ------ | ---------------- | ------------------------ | ------ |
| `POST` | `/auth/register` | Registro de usuario      | No     |
| `POST` | `/auth/login`    | Inicio de sesión         | No     |
| `GET`  | `/auth/me`       | Datos del usuario actual | Bearer |

#### Citas

| Método | Ruta                      | Descripción          | Auth   |
| ------ | ------------------------- | -------------------- | ------ |
| `GET`  | `/slots?fecha=YYYY-MM-DD` | Horarios disponibles | No     |
| `POST` | `/appointments`           | Crear cita           | Bearer |
| `GET`  | `/appointments/mine`      | Mis citas            | Bearer |

#### Administración

| Método   | Ruta                              | Descripción                    | Auth  |
| -------- | --------------------------------- | ------------------------------ | ----- |
| `GET`    | `/admin/slots?fecha=YYYY-MM-DD`   | Todos los horarios con detalle | Admin |
| `POST`   | `/admin/block`                    | Bloquear horario               | Admin |
| `DELETE` | `/admin/block/{fecha}/{hora}`     | Desbloquear horario            | Admin |
| `GET`    | `/admin/appointments`             | Todas las citas                | Admin |
| `PUT`    | `/admin/appointments/{id}/estado` | Actualizar estado de cita      | Admin |

---

## Modelo de Machine Learning

### Dataset

- **Archivo**: `backend/data/dataset.csv`
- **Muestras**: 310 registros
- **Features**: 45 columnas — 1 especie + 44 síntomas + 1 enfermedad (target)
- **Escala de síntomas**: 0 (ausente) · 1 (leve) · 2 (moderado) · 3 (grave)

### Modelos entrenados

| Archivo                    | Descripción                                           |
| -------------------------- | ----------------------------------------------------- |
| `ml/model_perro.pkl`       | Pipeline (StandardScaler + LogisticRegression) perros |
| `ml/model_gato.pkl`        | Pipeline (StandardScaler + LogisticRegression) gatos  |
| `ml/le_especie.pkl`        | LabelEncoder de especies                              |
| `ml/le_enfermedad.pkl`     | LabelEncoder de enfermedades                          |
| `ml/models_by_species.pkl` | Índice de rutas por especie                           |

### Selección y validación del modelo

Con 10-20 muestras por enfermedad, un único split 80/20 (usado en versiones
anteriores) es demasiado ruidoso para reportar una métrica confiable — puede
variar más de 10 puntos según la semilla. `ml/train.py` evalúa cada modelo con
**validación cruzada estratificada repetida (5 folds × 10 repeticiones)** y
compara varios algoritmos (regresión logística, Random Forest, ExtraTrees,
Gradient Boosting, SVM, KNN) antes de elegir el de mejor accuracy validada:
la regresión logística regularizada resultó consistentemente superior en este
dataset pequeño.

**Accuracy validada por cross-validation** (no accuracy de entrenamiento):

| Especie | Accuracy CV | Nota                                                                 |
| ------- | ----------- | -------------------------------------------------------------------- |
| Perro   | ~98%        | Sin combinaciones de síntomas ambiguas tras la limpieza del dataset. |
| Gato    | ~97%        | Sin combinaciones de síntomas ambiguas tras la limpieza del dataset. |

**Bugs de datos encontrados y corregidos** (no eran limitaciones del modelo,
sino errores de generación del dataset que hacían matemáticamente imposible
superar ~81% en gatos): a 4 enfermedades felinas (cistitis, leucemia,
inmunodeficiencia felina, enfermedad renal crónica) y 2 caninas (displasia de
cadera, otitis) se les habían asignado por error las columnas de síntomas de
OTRA enfermedad (p. ej. cistitis tenía síntomas de piel en vez de urinarios),
haciendo que filas de enfermedades distintas tuvieran el mismo vector de
síntomas. Se reasignaron a las señales clínicas que realmente las distinguen,
reutilizando las columnas ya existentes. También se corrigió la columna
`confusion`, que tenía valores 1-9 en 34 filas en vez de la escala 0-3
documentada.

`/predict` ya no fuerza una confianza alta artificial: informa la
probabilidad real y, si el segundo diagnóstico más probable está a menos de
15 puntos porcentuales del primero, lo agrega como **diagnóstico diferencial
a confirmar por el veterinario** en vez de ocultar la incertidumbre — esto
puede seguir ocurriendo ante síntomas realmente atípicos o incompletos, como
en la práctica clínica real.

### Pipeline de predicción

```
Síntomas del usuario (vector 44 dimensiones)
         │
         ▼
Carga modelo según especie (caché en memoria)
         │
         ▼
Pipeline.predict_proba()  →  probabilidad real, sin distorsión artificial
         │
         ▼
¿2.º diagnóstico a <15 pts del principal?
   Sí → se agrega como diagnóstico diferencial
         │
         ▼
Estimación de fase
   Comparación con muestras del dataset → muestra más similar
   fase = max_severidad_muestra × (10 / 3)  →  escala 1–10
         │
         ▼
Clasificación de gravedad
   fase 1–3 → leve
   fase 4–6 → moderada
   fase 7–10 → grave
```

### Enfermedades detectables (muestra)

**Perros**: Parvovirus, Moquillo, Leptospirosis, Leishmaniasis, Rabia, Dermatitis, Gastroenteritis, Pancreatitis, Insuficiencia renal, Diabetes, Hipotiroidismo, Epilepsia, Neumonía, Hepatitis, Artritis, Otitis, Conjuntivitis, Anemia, entre otras.

**Gatos**: Leucemia Felina (FeLV), Peritonitis Infecciosa Felina (FIP), Panleucopenia, Rinotraqueitis, Calicivirus, Rabia, Dermatitis, Insuficiencia renal, Hipertiroidismo, Diabetes, Conjuntivitis, Otitis, entre otras.

---

## Estructura del Proyecto

```
tesis_pets/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Lint, tests, cobertura, build y SonarQube
│   │   ├── cd.yml                 # Imágenes Docker a ghcr.io y despliegue
│   │   └── codeql.yml             # Análisis de seguridad (SAST)
│   ├── dependabot.yml             # Actualización semanal de dependencias
│   └── pull_request_template.md
├── sonar-project.properties       # Configuración de SonarQube
├── docker-compose.yml             # Stack completo en local
│
├── backend/                       # API FastAPI
│   ├── main.py                    # create_app(): routers, middlewares, scheduler
│   ├── core/                      # config, database, security, exceptions, logging, time_utils
│   ├── domain/                    # enums de estados, calendario de vacunas
│   ├── infrastructure/
│   │   ├── push/                  # web_push.py (VAPID) y messages.py (textos)
│   │   └── db/                    # sqlite_migrations.py
│   ├── routes/                    # endpoints + dependencies.py (auth)
│   ├── schemas/                   # modelos Pydantic de entrada/salida
│   ├── services/                  # casos de uso
│   ├── repositories/              # acceso a datos
│   ├── models/                    # entidades SQLAlchemy
│   ├── ml/                        # predict.py, train.py y modelos .pkl
│   ├── data/                      # dataset.csv y generador
│   ├── scripts/                   # generate_vapid_keys.py
│   ├── tests/                     # pytest (100 tests)
│   ├── pyproject.toml             # ruff, pytest y coverage
│   └── Dockerfile
│
└── frontend/                      # Angular 21 + Ionic 8
    ├── src/
    │   ├── app/
    │   │   ├── core/              # models, data, services, utils, constants, seo, guards, interceptors
    │   │   ├── shared/            # components, pipes, validators
    │   │   ├── layout/            # app-shell y pestañas
    │   │   └── pages/
    │   │       ├── profile/       # profile.ts + profile.store.ts + components/ (11)
    │   │       ├── admin/         # admin.ts + agenda.utils.ts + components/ (8)
    │   │       ├── diagnostic-result/, payment/, schedule/, symptoms-selection/ …
    │   │       └── …              # cada página con su carpeta components/
    │   ├── theme/                 # variables, mixins y _forms.scss
    │   ├── index.html             # SEO: description, Open Graph, JSON-LD
    │   ├── manifest.webmanifest, robots.txt, sitemap.xml
    │   └── sw.js                  # service worker de notificaciones push
    ├── nginx.conf                 # servidor de producción (+ proxy /api)
    └── Dockerfile
```

---

## Variables de Entorno

Toda la configuración del backend se lee en un único lugar: `backend/core/config.py`.
Copia `backend/.env.example` a `backend/.env` y ajusta los valores:

| Variable | Uso | Por defecto (solo desarrollo) |
| --- | --- | --- |
| `ENVIRONMENT` | `production` oculta `/docs` y `/redoc` | `development` |
| `SECRET_KEY`, `ADMIN_CODE` | Firma de JWT y código de veterinario | aleatorios por proceso |
| `DATABASE_URL` | Cualquier URL de SQLAlchemy (SQLite, PostgreSQL…) | SQLite en `backend/veterinary.db` |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma | `*` |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY_PEM` | Notificaciones push (`python scripts/generate_vapid_keys.py`) | par nuevo por arranque |
| `LOG_LEVEL` | Nivel de logging | `INFO` |

> **Importante**: nunca subas `.env` al repositorio (ya está en `.gitignore`).
> En GitHub Actions los secretos van en *Settings → Secrets and variables → Actions*.

En el frontend, la URL de la API está en `src/environments/`. En producción es
`/api`: Nginx la reenvía al backend (variable `API_UPSTREAM` del contenedor).

---

## Scripts Disponibles

### Backend (`cd backend`)

```bash
uvicorn main:app --reload --port 8000        # desarrollo
pip install -r requirements-dev.txt          # herramientas de desarrollo
pytest --cov                                 # tests + cobertura
ruff check . && ruff format --check .        # lint y formato
ruff check . --fix && ruff format .          # corregir automáticamente
```

### Frontend (`cd frontend`)

```bash
npm start              # servidor de desarrollo (http://localhost:4201)
npm run build:prod     # build de producción (frontend/www/)
npm test               # tests en modo watch
npm run test:ci        # tests headless + cobertura (coverage/app/lcov.info)
npm run lint           # ESLint (TypeScript + accesibilidad)
```

### Todo el stack con Docker

```bash
docker compose up --build   # web en http://localhost:8080, API en http://localhost:8000/docs
```

---

## Calidad de Código y CI/CD

### Integración continua (`.github/workflows/ci.yml`)

En cada push y pull request a `main`/`develop`:

1. **Backend**: `ruff check`, `ruff format --check`, `pytest` con cobertura y `pip-audit`.
2. **Frontend**: `ng lint` (incluye reglas de accesibilidad), tests en Chrome headless con cobertura, build de producción y `npm audit`.
3. **SonarQube**: analiza ambos proyectos con su cobertura y **falla si no se aprueba el Quality Gate**.

`codeql.yml` ejecuta además el análisis de seguridad de GitHub (JavaScript/TypeScript y Python) y
`dependabot.yml` abre PRs semanales con dependencias actualizadas.

### Despliegue continuo (`.github/workflows/cd.yml`)

Cuando CI pasa en `main` (o al publicar un tag `vX.Y.Z`):

1. Construye las imágenes `cityvet-backend` y `cityvet-frontend` y las publica en **GitHub Container Registry** (`ghcr.io`).
2. Si existen los secretos `BACKEND_DEPLOY_HOOK` / `FRONTEND_DEPLOY_HOOK` (webhook de Render, Railway, Coolify…), dispara el despliegue. El job usa el *environment* `production`, así que puedes exigir aprobación manual.
3. En los tags, crea un **Release** con notas generadas automáticamente.

### Configurar SonarQube

1. Crea el proyecto en tu servidor SonarQube o en [SonarQube Cloud](https://sonarcloud.io) con la clave `JesusMorales14_tesis_pets` (o cámbiala en `sonar-project.properties`).
2. En GitHub → *Settings → Secrets and variables → Actions*, agrega:
   - `SONAR_TOKEN`: token de análisis del proyecto.
   - `SONAR_HOST_URL`: URL del servidor (`https://sonarcloud.io` si usas la versión en la nube; en ese caso descomenta `sonar.organization`).
3. Recomendado: en *Settings → Branches* protege `main` exigiendo los checks **CI** y **SonarQube** antes de hacer merge.

Sin esos secretos el job de SonarQube se omite con un aviso, y el resto del pipeline sigue funcionando.

---

## Autores

**Jesús Alberto Silva Morales**  
**Maryori Thais Nolberto Bautista**

---

<div align="center">

Desarrollado con dedicación para mejorar la atención veterinaria en **CityVet** · Chincha Alta, Perú · 2026

</div>
