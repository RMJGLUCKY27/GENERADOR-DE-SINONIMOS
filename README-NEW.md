# 🏭 RISOLU - Generador de Sinónimos con Control de API

Sistema completo para generar sinónimos de productos industriales con control de API desde el frontend.

## 🚀 Inicio Rápido

### Opción 1: Inicio Completamente Automático (Recomendado)
```bash
# Terminal 1: Iniciar Bootstrap Server
npm run start

# Terminal 2: Iniciar Servidor Web
npm run web

# Abrir en navegador: http://localhost:8000/startup.html
```

### Opción 2: Inicio Tradicional
```bash
# Terminal 1: Servidor de control de API
node api-control.js

# Terminal 2: Servidor web
python -m http.server 8000

# La aplicación estará disponible en: http://localhost:8000
```

### ⚡ Inicio Ultra-Rápido (Todo en uno)
```bash
npm run all
# Abre automáticamente: http://localhost:8000/startup.html
```

## 📋 Componentes del Sistema

### 1. Bootstrap Server (Puerto 3003) - NUEVO
- **Archivo**: `bootstrap.js`
- **Funciones**: 
  - Auto-inicio de todos los servicios
  - Monitoreo y gestión automática
  - Inicio del servidor de control cuando es necesario

### 2. Aplicación Web (Frontend)
- **Puerto**: 8000
- **Archivos**: `index.html`, `script.js`, `styles.css`, `startup.html`
- **Funciones**: Procesamiento de Excel, generación de sinónimos locales, interfaz de usuario

### 3. API de Sinónimos (Puerto 3001)
- **Archivo**: `api/index.js`
- **Funciones**: 
  - Búsqueda de productos en tienda RISOLU
  - Generación avanzada de sinónimos y abreviaturas
  - Web scraping de productos industriales

### 4. Servidor de Control (Puerto 3002)
- **Archivo**: `api-control.js`
- **Funciones**:
  - Iniciar/Detener/Reiniciar la API desde el frontend
  - Monitoreo del estado de la API
  - Control de procesos

## 🎯 Cómo Usar

### 1. Controles de API
En el header de la aplicación encontrarás:
- **▶️ Iniciar API**: Inicia el servidor de sinónimos
- **⏹️ Detener API**: Detiene el servidor
- **🔄 Reiniciar API**: Reinicia el servidor
- **Indicador de Estado**: Muestra si la API está activa o inactiva

### 2. Procesamiento de Excel
1. Sube tu archivo Excel con productos industriales
2. Selecciona las columnas de Alias y Descripción
3. Genera sinónimos locales
4. Usa los botones de API para funciones avanzadas:
   - **🔍 Buscar en RISOLU**: Encuentra productos similares en la tienda
   - **⚡ Sinónimos IA**: Genera sinónimos avanzados usando la API

### 3. Resultados
- **Sinónimos locales**: Generados automáticamente por la lógica local
- **Productos RISOLU**: Mostrados en cards con precios y enlaces
- **Sinónimos avanzados**: Generados por la API con mejor precisión

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript ES6+, SheetJS
- **Backend**: Node.js, Express.js
- **Web Scraping**: Cheerio, Axios
- **Control de Procesos**: Child Process (spawn, exec)
- **Servidor Web**: Python HTTP Server

## 📦 Dependencias

```json
{
  "express": "^4.18.2",
  "axios": "^1.4.0",
  "cheerio": "^1.0.0-rc.12",
  "cors": "^2.8.5"
}
```

## 🔧 Configuración

### Puertos
- **3001**: API de sinónimos y búsqueda
- **3002**: Servidor de control de API
- **3003**: Bootstrap Server (Auto-inicio)
- **8000**: Aplicación web frontend

### Variables de Entorno
- `PORT`: Puerto para la API (default: 3001)
- `CONTROL_PORT`: Puerto para el control (default: 3002)

## 🎨 Características

### ✨ Interfaz Moderna
- Diseño responsivo y profesional
- Tema industrial con colores RISOLU
- Indicadores visuales de estado
- Animaciones suaves

### 🔍 Búsqueda Avanzada
- Web scraping de tienda RISOLU
- Generación inteligente de abreviaturas
- Sinónimos contextual para productos industriales
- Búsqueda en tiempo real

### 🎛️ Control Total
- Iniciar/detener API desde la web
- Monitoreo en tiempo real
- Manejo de errores robusto
- Estados visuales claros

## 📈 Estados de la API

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| 🟢 Conectada | API funcionando correctamente | Detener, Reiniciar |
| 🔴 Desconectada | API no disponible | Iniciar |
| 🟡 Iniciando | API en proceso de inicio | Esperar |
| ⚠️ Error | Error en la API | Reiniciar |

## 🚨 Solución de Problemas

### API no inicia
1. Verificar que el puerto 3001 esté libre
2. Revisar las dependencias en `api/`
3. Comprobar permisos de ejecución

### Servidor de control no responde
1. Verificar que el puerto 3002 esté libre
2. Reinstalar dependencias: `npm install`
3. Reiniciar el servidor de control

### Frontend no carga
1. Verificar que Python esté instalado
2. Comprobar puerto 8000
3. Usar navegador moderno (Chrome, Firefox, Edge)

## 📄 Licencia

MIT License - Proyecto RISOLU

## 🤝 Soporte

Para soporte técnico o consultas sobre productos industriales, contacta a RISOLU.