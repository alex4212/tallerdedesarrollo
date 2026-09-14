#  Sistema Web Integrado - Aldea Infantil SOS Angol

> Sistema web desarrollado para la digitalización y optimización de la gestión operativa, de seguridad y sostenibilidad de la Aldea Infantil SOS Angol.

##  Descripción del Proyecto

El proyecto busca centralizar la información de los turnos rotativos, automatizar alertas de mantenimiento y dotar a la seguridad externa de una herramienta de monitoreo eficiente. De esta forma, se transforman los procesos analógicos y manuales en un **ecosistema digital robusto y eficiente**.

El sistema cuenta con accesos estructurados mediante autenticación por correo electrónico estándar (sin restricción de dominios institucionales) para facilitar el ingreso tanto de usuarios internos como externos.

---

##  Características Principales

El sistema está dividido en tres módulos operativos principales:

### 1.  Módulo de Acogida (Gestión de Casas)
* **Gestión de ingresos:** Control y asignación de menores a viviendas.
* **Control de turnos:** Visualización en tiempo real de las educadoras responsables y control de turnos rotativos (4x4).
* **Trazabilidad:** Seguimiento y registro de la información crítica durante los traspasos de turno.

### 2.  Módulo de Sostenibilidad (Mantenimiento y Finanzas)
* **Alertas automatizadas:** Sistema de notificaciones para tareas periódicas (ej. aseo quincenal de cañones de calefacción).
* **Rendición de presupuestos:** Panel de carga digital de boletas para la rendición descentralizada por cada casa.
* **Trazabilidad financiera:** Historial detallado de gastos e insumos.

### 3.  Módulo de Protección Activa (Seguridad)
* **Interfaz especializada:** Interfaz de solo lectura diseñada específicamente para los guardias externos.
* **Monitoreo en tiempo real:** Panel que visibiliza la ocupación de las zonas sensibles del recinto.
* **Vigilancia eficiente:** Optimización de rondas y control perimetral.

---

##  Tecnologías Utilizadas

* **Frontend:** React.js
* **Backend:** Node.js / Express
* **Base de Datos:** PostgreSQL
* **Otros:** Python *(Scripts de procesamiento y análisis de datos auxiliares)*

---

##  Roles de Usuario

El sistema cuenta con un Control de Acceso Basado en Roles (RBAC) estructurado de la siguiente manera:

| Rol | Nivel de Acceso y Funciones |
| :--- | :--- |
| **Encargada / Administración** | Acceso total a la gestión operativa y reportes del sistema. |
| **Cuidadoras (Trato Directo)** | Acceso a rendición de boletas y gestión de turnos de su casa asignada. |
| **Personal de Mantención** | Acceso a alertas y gestión de tareas programadas. |
| **Guardias de Seguridad** | Acceso exclusivo de lectura al mapa y panel perimetral. |
| **Administrador TI** | Gestión de perfiles, base de datos y métricas de rendimiento. |

---

##  Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/alex4212/tallerdedesarrollo.git
   cd tallerdedesarrollo
   ```

2. **Configuración Inicial:**
   Asegúrate de crear y configurar los archivos `.env` (variables de entorno) necesarios para el backend (conexión a PostgreSQL) y frontend.

3. **Instalación y ejecución:**
   *(Instala las dependencias tanto en el cliente como en el servidor)*
   ```bash
   # Ejemplo para el backend
   cd backend
   npm install
   npm run dev
   ```

---

##  Autor
**Alexander Pascual Contreras Riquelme**
*Desarrollador - IECI*