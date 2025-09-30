# RISOLU - Generador de Sinónimos para Productos Industriales

Una aplicación web especializada para RISOLU que permite cargar catálogos de productos industriales y generar automáticamente sinónimos técnicos basados en alias y descripciones, optimizando las búsquedas en sistemas de inventario y e-commerce industrial.

## 🏭 Especialización RISOLU

Esta aplicación está específicamente optimizada para el catálogo de productos industriales de RISOLU, incluyendo:

- **Herramientas Manuales y Eléctricas**
- **Componentes de Fijación** (tornillos, tuercas, arandelas)
- **Sistemas de Transmisión** (rodamientos, engranes, correas)
- **Equipos Hidráulicos** (válvulas, bombas, filtros)
- **Componentes Eléctricos** (contactores, cables, transformadores)
- **Seguridad Industrial** (cascos, guantes, equipos de protección)
- **Instrumentación** (manómetros, calibradores, termómetros)
- **Equipos de Soldadura y Corte**
- **Lubricantes y Selladores**

## 🚀 Características Principales

- **Carga de Archivos**: Soporte para Excel (.xlsx, .xls) y CSV
- **Generación Automática de Sinónimos**: Basado en un diccionario industrial en español
- **Búsqueda Inteligente**: Búsqueda en tiempo real con filtros
- **Exportación**: Descarga resultados en Excel o CSV
- **Estadísticas**: Visualización de métricas de procesamiento
- **Diseño Responsivo**: Funciona en desktop y móvil

## 📋 Cómo Usar

### 1. Cargar Archivo
- Arrastra y suelta un archivo Excel o CSV en la zona de carga
- O haz clic en "Selecciona un archivo" para elegir desde tu dispositivo
- El archivo debe contener al menos columnas con alias y descripciones de productos

### 2. Configurar Columnas
- Selecciona la columna que contiene los **alias** de los productos
- Selecciona la columna que contiene las **descripciones** de los productos
- Haz clic en "Generar Sinónimos"

### 3. Revisar Resultados
- Visualiza los sinónimos generados para cada producto
- Usa la barra de búsqueda para filtrar resultados
- Activa/desactiva filtros de búsqueda según necesites

### 4. Exportar Datos
- Descarga los resultados en formato Excel o CSV
- Los sinónimos se incluyen en columnas separadas para fácil integración

## 🔧 Funcionalidades Técnicas

### Generación de Sinónimos

La aplicación utiliza varias técnicas para generar sinónimos:

1. **Diccionario Industrial**: Base de datos con términos técnicos y sus equivalentes
2. **Variaciones Morfológicas**: Plural/singular, con/sin acentos
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