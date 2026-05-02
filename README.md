<div align="center">

# 🐾 CityVet — Aplicación móvil de predicción de síntomas para diagnósticos de enfermedades en perros y gatos.

[![Angular](https://img.shields.io/badge/Angular-20.0.0-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![Ionic](https://img.shields.io/badge/Ionic-8.0.0-3880FF?style=flat-square&logo=ionic&logoColor=white)](https://ionicframework.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135.3-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8.0-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/Licencia-MIT-green?style=flat-square)](LICENSE)

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
- [Autores](#autores)

---

## Descripción General

**VetAI** es una plataforma web mobile-first que permite a los dueños de mascotas realizar un pre-diagnóstico inteligente de enfermedades en **perros y gatos** a partir de los síntomas observados. La aplicación utiliza un modelo de **Random Forest** entrenado sobre un dataset veterinario para predecir la enfermedad más probable, estimar su gravedad y facilitar el agendamiento de una cita con el veterinario.

El sistema está diseñado para la clínica **CityVet** y permite a los veterinarios administrar su agenda desde un panel dedicado, visualizando diagnósticos asociados a cada cita antes de la consulta.

---

## Características Principales

### Para el usuario

- **Diagnóstico por síntomas** — Selección intuitiva de hasta 44 síntomas organizados en 10 categorías, con nivel de severidad (0–3) para cada uno.
- **Predicción con IA** — Modelo Random Forest independiente para perros y gatos, con calibración de probabilidades mediante _Temperature Scaling_.
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
│                  FRONTEND — Angular 20 + Ionic 8                  │
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
│  users             │                  │  model_perro.pkl (5.2MB)│
│  appointments      │                  │  model_gato.pkl  (9.2MB)│
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
                    Random Forest predice enfermedad
                         │
                         ▼
                    Temperature Scaling (T=0.4) calibra probabilidad
                         │
                         ▼
                    Estimación de fase/gravedad vs. dataset histórico
                         │
         ◄───────────────┘
         ▼
Pantalla de resultado: diagnóstico · confianza · fase · gravedad
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
| scikit-learn     | 1.8.0         | Modelo Random Forest        |
| pandas           | 3.0.2         | Procesamiento de datos      |
| numpy            | 2.4.4         | Operaciones numéricas       |
| joblib           | 1.5.3         | Serialización de modelos ML |
| python-jose      | 3.5.0         | Generación y validación JWT |
| passlib + bcrypt | 1.7.4 / 4.3.0 | Hash seguro de contraseñas  |
| Pydantic         | 2.12.5        | Validación de esquemas      |

### Frontend

| Tecnología          | Versión   | Uso                               |
| ------------------- | --------- | --------------------------------- |
| Angular             | 20.0.0    | Framework SPA                     |
| Ionic               | 8.0.0     | UI components mobile-first        |
| TypeScript          | 5.9.0     | Lenguaje del cliente              |
| RxJS                | 7.8.0     | Programación reactiva             |
| Capacitor           | —         | Acceso a hardware nativo (cámara) |
| @ionic/pwa-elements | —         | PWA / cámara web                  |
| FontAwesome         | —         | Iconografía complementaria        |
| Karma + Jasmine     | 6.4 / 5.1 | Testing unitario                  |

---

## Requisitos Previos

Asegúrate de tener instalado en tu sistema:

- **Node.js** ≥ 18.x y **npm** ≥ 9.x  
  Verificar: `node -v && npm -v`
- **Angular CLI** ≥ 20 e **Ionic CLI** ≥ 7
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

| Archivo                    | Tamaño | Descripción                        |
| -------------------------- | ------ | ---------------------------------- |
| `ml/model_perro.pkl`       | 5.2 MB | RandomForestClassifier para perros |
| `ml/model_gato.pkl`        | 9.2 MB | RandomForestClassifier para gatos  |
| `ml/le_especie.pkl`        | —      | LabelEncoder de especies           |
| `ml/le_enfermedad.pkl`     | —      | LabelEncoder de enfermedades       |
| `ml/models_by_species.pkl` | —      | Índice de rutas por especie        |

### Pipeline de predicción

```
Síntomas del usuario (vector 44 dimensiones)
         │
         ▼
Carga modelo según especie (caché en memoria)
         │
         ▼
RandomForestClassifier.predict_proba()
         │
         ▼
Temperature Scaling (T = 0.4)
   softmax(logits / T) → distribución concentrada
   Resultado: ≥ 88 % de confianza cuando el modelo es determinante
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
│
├── backend/                        # Servidor FastAPI
│   ├── main.py                     # Aplicación principal y endpoints
│   ├── db_models.py                # Modelos SQLAlchemy (Users, Appointments, Slots)
│   ├── database.py                 # Configuración de la base de datos SQLite
│   ├── auth_utils.py               # JWT: creación, verificación y hash bcrypt
│   ├── requirements.txt            # Dependencias Python
│   ├── veterinary.db               # Base de datos SQLite (generada automáticamente)
│   ├── ml/
│   │   ├── predict.py              # Motor de predicción (carga modelos, pipeline ML)
│   │   ├── model_perro.pkl         # Modelo Random Forest — perros
│   │   ├── model_gato.pkl          # Modelo Random Forest — gatos
│   │   ├── le_especie.pkl          # LabelEncoder especie
│   │   ├── le_enfermedad.pkl       # LabelEncoder enfermedad
│   │   └── models_by_species.pkl   # Índice de modelos por especie
│   └── data/
│       └── dataset.csv             # Dataset de entrenamiento (310 × 45)
│
└── frontend/                       # Aplicación Angular + Ionic
    ├── src/
    │   ├── app/
    │   │   ├── pages/
    │   │   │   ├── home/                   # Tab 1: Pantalla de bienvenida
    │   │   │   ├── pet-selection/          # Tab 2: Selección de especie
    │   │   │   ├── health-info/            # Tab 3: Base de conocimiento
    │   │   │   ├── symptoms-selection/     # Selector de síntomas con categorías
    │   │   │   ├── diagnostic-result/      # Pantalla de resultado del diagnóstico
    │   │   │   ├── schedule/               # Calendario de citas
    │   │   │   ├── payment/                # Métodos de pago
    │   │   │   ├── admin/                  # Panel administrativo
    │   │   │   ├── login/                  # Inicio de sesión
    │   │   │   ├── register/               # Registro de usuario
    │   │   │   └── profile/                # Perfil del usuario
    │   │   ├── tabs/                       # Navegación por pestañas
    │   │   ├── components/
    │   │   │   ├── header/                 # Barra superior con toggle de tema
    │   │   │   ├── footer/                 # Pie de página
    │   │   │   └── precision/              # Indicador de confianza
    │   │   ├── services/
    │   │   │   ├── auth.service.ts         # Login, registro, JWT
    │   │   │   ├── prediction.service.ts   # Llamadas a /predict
    │   │   │   ├── appointment.service.ts  # CRUD de citas y admin
    │   │   │   └── theme.service.ts        # Toggle de tema oscuro/claro
    │   │   ├── guards/
    │   │   │   ├── auth.guard.ts           # Redirige a /login si no autenticado
    │   │   │   └── admin.guard.ts          # Redirige a /home si no es admin
    │   │   └── models/
    │   │       ├── symptom.model.ts        # Definición de síntomas y categorías
    │   │       └── disease-info.model.ts   # Base de conocimiento de enfermedades
    │   ├── assets/                         # Imágenes y recursos estáticos
    │   ├── theme/                          # Variables de tema Ionic
    │   └── global.scss                     # Estilos globales
    ├── angular.json
    ├── ionic.config.json
    ├── tsconfig.json
    └── package.json
```

---

## Variables de Entorno

El proyecto actualmente usa valores hardcodeados para desarrollo local. Para producción, se recomienda crear un archivo `.env` en `backend/` con las siguientes variables:

```env
# backend/.env

# Seguridad
SECRET_KEY=cambia-esta-clave-en-produccion
ADMIN_CODE=codigo-secreto-para-admins
ALGORITHM=HS256
TOKEN_EXPIRE_DAYS=7

# Base de datos
DATABASE_URL=sqlite:///./veterinary.db

# CORS — lista de orígenes permitidos separados por coma
CORS_ORIGINS=http://localhost:4200,https://tu-dominio.com
```

> **Importante**: Nunca subas el archivo `.env` al repositorio. Ya está incluido en el `.gitignore`.

Para el frontend, la URL base de la API se configura en los archivos de servicio. En producción, se recomienda usar los archivos de entorno de Angular (`src/environments/`).

---

## Scripts Disponibles

### Backend

```bash
# Desarrollo con recarga automática
uvicorn main:app --reload --port 8000

# Producción
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

### Frontend

```bash
# Servidor de desarrollo (http://localhost:4200)
npm start

# Build de producción (genera frontend/www/)
npm run build

# Build en modo watch
npm run watch

# Ejecutar tests unitarios
npm test

# Linting
npm run lint
```

---

## Autores

**Jesús Silva Morales**  
Desarrollador fullstack y autor del proyecto de tesis  
[jesusalbertosilvamorales@gmail.com](mailto:jesusalbertosilvamorales@gmail.com)

---

<div align="center">

Desarrollado con dedicación para mejorar la atención veterinaria en **CityVet** · Chincha Alta, Perú · 2026

</div>
