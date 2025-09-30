# 🏭 RISOLU - Generador de Sinónimos v2.0

## 🚀 Sistema Inteligente de Sinónimos para Productos Industriales

### 📋 Descripción
Sistema avanzado para generar sinónimos de productos industriales especializado en **automatización**, **redes industriales** y **equipo eléctrico**. Incluye sistema de **memoria inteligente** con detección de similitud para mantener consistencia en formatos y optimizar el proceso de generación.

### ⭐ Características Principales

#### 🧠 Sistema de Memoria Inteligente (NUEVO v2.0)
- **Almacenamiento automático** de productos procesados
- **Detección de similitud** usando algoritmo de Jaccard
- **Sugerencias inteligentes** para productos similares
- **Umbral configurable** de similitud (0.1 - 1.0)
- **Persistencia local** usando localStorage

#### 📊 Procesamiento de Excel
- Carga y visualización de archivos Excel (.xlsx, .xls, .csv)
- Vista previa interactiva con selección de columnas
- Procesamiento masivo de productos
- Exportación en múltiples formatos

#### 🔍 API de Búsqueda Web
- Integración con web scraping para búsqueda en RISOLU
- Generación de sinónimos potenciados por IA
- Control completo de API desde la interfaz
- Sistema de auto-inicio con bootstrap

#### 💾 Gestión de Base de Datos
- **Exportación** completa en JSON, CSV, Excel
- **Importación** de bases de datos existentes
- **Estadísticas detalladas** de uso
- **Productos más utilizados**
- **Limpieza de memoria** con confirmación

### 🛠️ Especialización RISOLU

#### Categorías de Productos:
- **Automatización**: PLCs Allen Bradley, HMIs, Variadores, Servos
- **Redes Industriales**: Switches Cisco/Stratix, Cables Belden, Gateways
- **Equipo Eléctrico**: Gabinetes Hoffman, Breakers Eaton, UPS
- **Instrumentación**: Multímetros Fluke, Transmisores, Barreras
- **Seguridad Industrial**: Brady (LOTO), EPP, Etiquetas
- **Conectividad**: Phoenix Contact, Regletas, Conectores

#### Marcas Integradas:
- Allen Bradley / Rockwell Automation
- Cisco Industrial Networks
- Eaton Electrical
- Fluke Corporation
- Hoffman Enclosures
- Brady Safety
- Belden Cables
- Phoenix Contact

### 🚀 Inicio Rápido

#### 1. Clonar Repositorio
```bash
git clone https://github.com/RMJGLUCKY27/GENERADOR-DE-SINONIMOS.git
cd GENERADOR-DE-SINONIMOS
```

#### 2. Instalar Dependencias
```bash
npm install
```

#### 3. Configurar API (Opcional)
```bash
cd api
npm install
cp .env.example .env
# Editar configuraciones en .env
```

#### 4. Iniciar Sistema
```bash
# Opción 1: Sistema completo con auto-inicio
npm start

# Opción 2: Solo frontend
npx http-server . -p 3000

# Opción 3: Solo API
cd api && npm start
```

#### 5. Acceder a la Aplicación
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Bootstrap**: http://localhost:3002

### 📁 Estructura del Proyecto

```
GENERADOR-DE-SINONIMOS/
├── 📄 index.html              # Interfaz principal
├── 🎨 styles.css             # Estilos responsivos
├── ⚡ script.js              # Lógica principal + memoria
├── 🔧 bootstrap.js           # Auto-inicio de servicios
├── 🎛️ api-control.js         # Control de API desde frontend
├── 🚀 startup.html           # Página de inicio visual
├── 📦 package.json           # Dependencias del proyecto
├── api/
│   ├── 🌐 index.js           # Servidor API con scraping
│   ├── 📦 package.json       # Dependencias API
│   └── ⚙️ .env.example       # Configuración de ejemplo
├── 📊 ejemplo_productos_*.csv # Datos de ejemplo
├── 📚 catalogo_completo_RISOLU.csv
└── 📖 README.md              # Esta documentación
```

### 🧪 Uso del Sistema

#### 1. Cargar Archivo Excel
1. Arrastra un archivo Excel o CSV a la zona de carga
2. Visualiza la vista previa de datos
3. Selecciona columnas de **Alias** y **Descripción**
4. Haz clic en **"Generar Sinónimos"**

#### 2. Sistema de Memoria Inteligente
- **Primera vez**: Genera sinónimos y los guarda automáticamente
- **Coincidencia exacta**: Recupera sinónimos instantáneamente  
- **Producto similar**: Sugiere sinónimos de productos con >70% similitud
- **Configuración**: Ajusta umbral de similitud según necesidades

#### 3. Gestión de Base de Datos
- **Ver estadísticas**: Productos en memoria, sinónimos totales, tamaño
- **Exportar**: Descargar base completa en JSON/CSV/Excel
- **Importar**: Cargar base de datos existente
- **Limpiar**: Resetear memoria completamente

#### 4. API de Búsqueda (Opcional)
- Inicia API para búsquedas web en RISOLU
- Genera sinónimos potenciados por IA
- Control completo desde la interfaz

### � Configuración Avanzada

#### Umbral de Similitud
- **0.9-1.0**: Solo productos muy similares (más restrictivo)
- **0.7-0.8**: Balance recomendado (default: 0.7)
- **0.1-0.6**: Mayor flexibilidad, más sugerencias

#### Variables de Entorno API
```bash
PORT=3001                    # Puerto de la API
SCRAPING_DELAY=2000         # Delay entre requests (ms)
MAX_RESULTS=50              # Máximo resultados por búsqueda
USER_AGENT="Mozilla/5.0..." # User agent para scraping
```

### 📊 Ejemplos de Uso

#### Producto Industrial Típico:
```
Alias: "MTR-001"
Descripción: "Martillo profesional 16oz mango fibra"

Sinónimos generados:
- martillo, hammer, tool, herramienta
- profesional, commercial, heavy duty
- 16oz, 450g, weight, peso
- mango, handle, grip, agarre
- fibra, fiber, composite, material
```

#### Código RISOLU:
```
Alias: "RSL-PLC-001"
Descripción: "Controlador Allen Bradley CompactLogix"

Sinónimos generados:
- plc, controlador, programmable logic controller
- allen bradley, rockwell, automation
- compactlogix, 1769, l24er, processor
- industrial, control, sistema, automation
```

### 🔍 API Endpoints

```javascript
// Búsqueda en RISOLU
GET /api/buscar?q=martillo&categoria=herramientas

// Generar sinónimos IA
POST /api/sinonimos
{
  "alias": "MTR-001", 
  "descripcion": "Martillo profesional"
}

// Estado del servidor
GET /api/status
```

### 📈 Estadísticas y Métricas

El sistema rastrea automáticamente:
- **Productos procesados**: Total de elementos únicos
- **Sinónimos generados**: Cantidad total de variaciones
- **Uso de memoria**: Frecuencia de uso por producto
- **Eficiencia**: Ratio de coincidencias vs. generaciones nuevas
- **Tamaño de base**: Ocupación en localStorage

### 🛡️ Características de Seguridad

- **Validación de entrada**: Sanitización de datos Excel/CSV
- **Rate limiting**: Control de velocidad en API
- **CORS configurado**: Acceso controlado desde frontend
- **Backup automático**: Persistencia en localStorage
- **Confirmación de borrado**: Protección contra pérdida de datos

### 🌐 Compatibilidad

- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Archivos**: Excel (.xlsx/.xls), CSV, JSON
- **Sistemas**: Windows, macOS, Linux
- **Node.js**: 14+ (para API)

### 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### 📝 Changelog

#### v2.0.0 (Actual)
- ✅ **Sistema de memoria inteligente** con localStorage
- ✅ **Detección de similitud** usando algoritmo de Jaccard
- ✅ **Interfaz de gestión** completa para base de datos
- ✅ **Exportación/Importación** en múltiples formatos
- ✅ **Umbral configurable** de similitud
- ✅ **Estadísticas detalladas** de uso y rendimiento

#### v1.0.0
- ✅ Generación básica de sinónimos
- ✅ Integración con API de scraping
- ✅ Interfaz responsiva
- ✅ Sistema de auto-inicio

### 📞 Soporte

- **GitHub Issues**: [Reportar problemas](https://github.com/RMJGLUCKY27/GENERADOR-DE-SINONIMOS/issues)
- **Documentación**: Ver archivos README en `/api/` y `/docs/`
- **Email**: [Contacto directo]

### 📄 Licencia

MIT License - Ver archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para RISOLU - Especialistas en Automatización Industrial**

🔧 *Versión 2.0 - Sistema Inteligente con Memoria y Detección de Similitud*
3. **Abreviaciones**: Formas cortas de palabras técnicas
4. **Extracción de Medidas**: Números con unidades (mm, cm, kg, etc.)
5. **Códigos de Producto**: Identificación de patrones alfanuméricos

### Diccionario Especializado RISOLU

La aplicación incluye un diccionario expandido con **más de 200 términos técnicos** específicos para productos industriales:

1. **Materiales Avanzados**: Aceros especiales, aleaciones, plásticos técnicos
2. **Herramientas Específicas**: Phillips, Torx, Allen, métricas e imperiales  
3. **Normativas Industriales**: ANSI, DIN, ISO, ASTM, SAE
4. **Medidas Técnicas**: AWG, NPT, BSP, presiones (PSI, BAR)
5. **Procesos Industriales**: Galvanizado, templado, anodizado, cromado
6. **Códigos de Producto**: Identificación automática de patrones RISOLU

### Categorías Cubiertas

- **Materiales**: Acero, aluminio, cobre, plástico, etc.
- **Herramientas**: Destornilladores, llaves, martillos, etc.
- **Medidas**: Conversiones métricas e imperiales
- **Componentes**: Tornillos, tuercas, rodamientos, etc.
- **Eléctrico**: Cables, conectores, resistencias, etc.
- **Seguridad**: Cascos, guantes, gafas, etc.
- **Hidráulico**: Válvulas, bombas, filtros, etc.

## 📁 Estructura del Proyecto RISOLU

```
risolu-sinonimos/
├── index.html                          # Interfaz principal RISOLU
├── styles.css                          # Estilos corporativos
├── script.js                           # Motor de sinónimos especializado
├── ejemplo_productos_RISOLU.csv        # Catálogo de muestra RISOLU
├── ejemplo_productos_industriales.csv  # Archivo genérico de ejemplo
└── README.md                           # Documentación
```

## 💻 Tecnologías Utilizadas

- **HTML5**: Estructura de la aplicación
- **CSS3**: Diseño responsivo con gradientes y animaciones
- **JavaScript ES6+**: Lógica de procesamiento
- **SheetJS**: Librería para leer archivos Excel
- **Drag & Drop API**: Interfaz intuitiva para carga de archivos

## 🎯 Casos de Uso

### Para Catálogos de Productos
- Mejora la búsqueda de productos industriales
- Reduce búsquedas sin resultados
- Aumenta la precisión de coincidencias

### Para E-commerce Industrial
- Optimiza motores de búsqueda internos
- Facilita navegación por categorías
- Mejora experiencia del usuario

### Para Inventarios
- Estandariza nomenclatura de productos
- Facilita búsquedas cruzadas
- Reduce duplicados por diferentes nombres

## 📊 Ejemplo de Uso RISOLU

**Entrada del Catálogo RISOLU:**
- Código: "RSL-TLD-004"
- Alias: "Taladro Percutor"
- Descripción: "Taladro percutor 1/2 800W con maletín"

**Sinónimos Generados:**
- drill, perforadora, 1/2, pulgada, 800w, watts, percutor, hammer, maletín, case, makita

**Búsquedas Mejoradas para RISOLU:**
- Cliente busca "drill" → Encuentra "Taladro Percutor"
- Cliente busca "perforadora" → Encuentra "Taladro Percutor"  
- Cliente busca "800w" → Encuentra herramientas de 800 watts
- Cliente busca "1/2" → Encuentra herramientas de 1/2 pulgada

## 🔍 Algoritmo de Búsqueda RISOLU

1. **Normalización**: Elimina acentos y convierte a minúsculas
2. **Coincidencia Parcial**: Busca términos contenidos en texto
3. **Filtros Selectivos**: Alias, descripción y/o sinónimos
4. **Resaltado**: Marca términos encontrados en resultados

## 📈 Estadísticas Mostradas

- **Productos Procesados**: Cantidad total de productos analizados
- **Sinónimos Generados**: Total de sinónimos únicos creados
- **Palabras Clave**: Términos técnicos extraídos

## 🛠️ Instalación y Ejecución

1. Descarga todos los archivos del proyecto
2. Abre `index.html` en cualquier navegador moderno
3. No requiere servidor web - funciona localmente
4. Compatible con Chrome, Firefox, Safari, Edge

## 📝 Formato de Archivo de Entrada

### Excel/CSV Requerido:
- **Primera fila**: Encabezados de columna
- **Columnas mínimas**: Una para alias, otra para descripción
- **Codificación**: UTF-8 (para caracteres especiales)

### Ejemplo de Estructura:
```csv
Código,Alias,Descripción,Categoría
MTR-001,Martillo Industrial,Martillo acero 500g,Herramientas
DST-002,Destornillador,Destornillador Phillips #2,Herramientas
```

## 🎨 Personalización

### Agregar Nuevos Sinónimos
Edita el objeto `industrialSynonyms` en `script.js`:

```javascript
const industrialSynonyms = {
    'nuevo_termino': ['sinonimo1', 'sinonimo2', 'sinonimo3'],
    // ... más términos
};
```

### Modificar Estilos
Personaliza colores y diseño en `styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* ... más variables */
}
```

## 🔧 Solución de Problemas

### Archivo no se carga
- Verifica que sea .xlsx, .xls o .csv
- Asegúrate de que tenga al menos 2 filas (encabezados + datos)
- Revisa la codificación del archivo

### No aparecen sinónimos
- Verifica que las columnas seleccionadas contengan texto
- Los sinónimos se basan en un diccionario técnico predefinido
- Palabras muy específicas pueden no tener sinónimos

### Búsqueda no funciona
- Verifica que al menos un filtro esté activado
- La búsqueda es sensible a tildes (se normalizan automáticamente)
- Usa términos de al menos 2 caracteres

## 📞 Soporte

Para problemas técnicos o sugerencias:
- Revisa la consola del navegador (F12) para errores
- Verifica compatibilidad del navegador
- Asegúrate de tener JavaScript habilitado

## 🔄 Futuras Mejoras

- [ ] API para sinónimos en tiempo real
- [ ] Soporte para más idiomas
- [ ] Integración con bases de datos externas
- [ ] Machine learning para mejores sinónimos
- [ ] Exportación a otros formatos (JSON, XML)
- [ ] Integración con APIs de productos industriales

---

*Desarrollado para optimizar búsquedas en catálogos de productos industriales*