Sistema de Gestión de Criptoactivos

¡Bienvenido al repositorio! Este es un sistema Full Stack para simular la compra/venta de criptomonedas con aprobación administrativa.

**Tecnologías:**
* **Backend:** Python (Django REST Framework)
* **Frontend:** React + Vite (Node.js)
* **Base de Datos:** SQLite (Local)

---

## Requisitos Previos
Para correr este proyecto necesitas tener instalado:
1.  **Python** (3.10 o superior) - [Descargar](https://www.python.org/downloads/)
    * *IMPORTANTE:* Al instalar en Windows, marca la casilla **"Add Python to PATH"**.
2.  **Node.js** (LTS) - [Descargar](https://nodejs.org/)
3.  **Git** - Para clonar este repositorio.

---

## Guía de Instalación Rápida

Sigue estos pasos en orden. Necesitarás **dos terminales** abiertas al mismo tiempo.

### Paso 1: Clonar el proyecto
Abre una terminal en la carpeta donde quieras guardar el proyecto:
```bash
git clone "Pega aqui el enlace de este repositorio"

cd nombre-del-repositorio
```

### Paso 2: Configuracion del Backend (Servidor)
1. En tu primera terminal, entra a la carpeta del backend (asegúrate de que el nombre coincida con tu carpeta):

```bash
cd backend-proyectolenguaje3
```
2. Ahora, crea y activa el entorno virtual:
```bash
# Windows:
python -m venv .venv
.venv\Scripts\activate

# Mac/Linux:
python3 -m venv .venv
source venv/bin/activate
```
(Deberías ver (venv) en verde al inicio de tu línea de comandos).

3. Instala las librerías necesarias:
```bash
pip install -r requirements.txt
```

4. Prepara la base de datos y crea tu usuario Admin:
```bash
python manage.py migrate
python manage.py createsuperuser
```
(Escribe un usuario y contraseña cortos, ej: admin / 123456789, los necesitarás luego).

5. Enciende el servidor:
```bash
python manage.py runserver
```
Déjalo corriendo. No cierres esta ventana.

### Paso 3: Configurar el Frontend (Cliente)
1. Abre una SEGUNDA terminal nueva y ve a la raíz del proyecto.

Entra a la carpeta del frontend
```bash 
cd frontend-proyectolenguaje3\gestor-crypto\
```

2. Instala las dependencias de Node:
```bash 
npm install
```

3. Enciende la página web:
```bash 
npm run dev
```
Verás un link (usualmente http://localhost:5173). ¡Haz Click para abrirlo!

4. Para la lectura de la base de datos es recomendable emplear el programa DB Browser for SQLite (https://sqlitebrowser.org/)

Listo, ya tienes el sistema andando!!!
