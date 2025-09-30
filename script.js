// Variables globales
let excelData = [];
let processedData = [];
let allSynonyms = new Set();
let allKeywords = new Set();
let selectedAliasColumn = null;
let selectedDescriptionColumn = null;
let currentFileName = '';

// Sistema de memoria de sinónimos
let synonymMemory = new Map(); // Cache en memoria
let productDatabase = new Map(); // Base de datos de productos
let similarityThreshold = 0.7; // Umbral de similitud (70%)

// Variables para búsqueda web directa
const SEARCH_URLS = {
    risolu: 'https://www.risolu.com.mx/search?q=',
    grainger: 'https://www.grainger.com.mx/search?query=',
    amazon: 'https://www.amazon.com.mx/s?k=',
    mercadolibre: 'https://listado.mercadolibre.com.mx/'
};
let webSearchEnabled = true;

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadSynonymMemory(); // Cargar memoria de sinónimos
    // Inicializar todos los servicios automáticamente
    initializeServices();
});

// Función para inicializar servicios de búsqueda web
async function initializeServices() {
    showStatusMessage('Iniciando sistema de búsqueda web...', 'loading');
    
    // Cargar configuración de URLs
    loadUrlConfiguration();
    
    // Inicializar estado de búsqueda web
    updateWebSearchStatus();
    
    showStatusMessage('Sistema de búsqueda web listo', 'success');
}

function initializeEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadBox = document.getElementById('uploadBox');
    const searchInput = document.getElementById('searchInput');

    // Eventos del input de archivo
    fileInput.addEventListener('change', handleFileSelect);
    
    // Eventos de drag and drop
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleFileDrop);
    
    // Evento de búsqueda en tiempo real
    searchInput.addEventListener('input', debounce(searchProducts, 300));
    
    // Evento Enter en búsqueda
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
}

// Funciones de manejo de archivos
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
        alert('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)');
        return;
    }

    currentFileName = file.name;
    showLoading();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let workbook;
            
            if (fileExtension === 'csv') {
                // Procesar CSV
                const csvData = e.target.result;
                workbook = XLSX.read(csvData, { type: 'string' });
            } else {
                // Procesar Excel
                const data = new Uint8Array(e.target.result);
                workbook = XLSX.read(data, { type: 'array' });
            }
            
            // Obtener la primera hoja
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convertir a JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) {
                throw new Error('El archivo debe contener al menos una fila de encabezados y una fila de datos');
            }
            
            excelData = jsonData;
            displayPreview();
            showControlsSection();
            hideLoading();
            
        } catch (error) {
            hideLoading();
            alert('Error al procesar el archivo: ' + error.message);
            console.error('Error:', error);
        }
    };
    
    if (fileExtension === 'csv') {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function displayPreview() {
    // Actualizar información del archivo
    document.getElementById('fileName').textContent = currentFileName;
    document.getElementById('totalRows').textContent = (excelData.length - 1).toLocaleString();
    
    // Obtener encabezados y datos
    const headers = excelData[0];
    const dataRows = excelData.slice(1, 11); // Mostrar máximo 10 filas de datos
    
    // Crear encabezados de la tabla
    const headerRow = document.getElementById('previewHeader');
    headerRow.innerHTML = '';
    
    const headerRowElement = document.createElement('tr');
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header || `Columna ${index + 1}`;
        th.dataset.columnIndex = index;
        th.title = 'Haz clic para seleccionar como Alias o Descripción';
        
        // Agregar evento de click para selección
        th.addEventListener('click', () => selectColumn(index, header || `Columna ${index + 1}`, th));
        
        headerRowElement.appendChild(th);
    });
    headerRow.appendChild(headerRowElement);
    
    // Crear filas de datos
    const tbody = document.getElementById('previewBody');
    tbody.innerHTML = '';
    
    dataRows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        headers.forEach((header, colIndex) => {
            const td = document.createElement('td');
            const cellValue = row[colIndex] || '';
            td.textContent = cellValue;
            td.title = cellValue; // Tooltip para texto completo
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    // Mostrar mensaje si hay más filas
    if (excelData.length > 11) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = headers.length;
        td.textContent = `... y ${(excelData.length - 11).toLocaleString()} filas más`;
        td.style.textAlign = 'center';
        td.style.fontStyle = 'italic';
        td.style.color = '#666';
        td.style.padding = '15px';
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
}

function selectColumn(columnIndex, columnName, headerElement) {
    // Determinar qué tipo de columna seleccionar basado en clics previos
    const currentAliasHeader = document.querySelector('.preview-table th.selected-alias');
    const currentDescHeader = document.querySelector('.preview-table th.selected-description');
    
    // Si ya está seleccionada, deseleccionarla
    if (headerElement.classList.contains('selected-alias')) {
        headerElement.classList.remove('selected-alias');
        selectedAliasColumn = null;
        updateSelectedColumnDisplay('alias', null);
    } else if (headerElement.classList.contains('selected-description')) {
        headerElement.classList.remove('selected-description');
        selectedDescriptionColumn = null;
        updateSelectedColumnDisplay('description', null);
    } else {
        // Lógica de selección inteligente
        if (!currentAliasHeader) {
            // Si no hay alias seleccionado, seleccionar como alias
            if (currentDescHeader) currentDescHeader.classList.remove('selected-description');
            headerElement.classList.add('selected-alias');
            selectedAliasColumn = columnIndex;
            selectedDescriptionColumn = null;
            updateSelectedColumnDisplay('alias', columnName);
            updateSelectedColumnDisplay('description', null);
        } else if (!currentDescHeader) {
            // Si ya hay alias, seleccionar como descripción
            headerElement.classList.add('selected-description');
            selectedDescriptionColumn = columnIndex;
            updateSelectedColumnDisplay('description', columnName);
        } else {
            // Si ambos están seleccionados, reemplazar alias
            currentAliasHeader.classList.remove('selected-alias');
            headerElement.classList.add('selected-alias');
            selectedAliasColumn = columnIndex;
            updateSelectedColumnDisplay('alias', columnName);
        }
    }
    
    // Actualizar estado del botón
    updateProcessButton();
}

function updateSelectedColumnDisplay(type, columnName) {
    const elementId = type === 'alias' ? 'selectedAlias' : 'selectedDescription';
    const element = document.getElementById(elementId);
    
    if (columnName) {
        element.textContent = columnName;
        element.classList.add('has-value');
    } else {
        element.textContent = 'Ninguna seleccionada';
        element.classList.remove('has-value');
    }
}

function updateProcessButton() {
    const processBtn = document.getElementById('processBtn');
    const canProcess = selectedAliasColumn !== null && selectedDescriptionColumn !== null;
    
    processBtn.disabled = !canProcess;
    
    if (canProcess) {
        processBtn.textContent = 'Generar Sinónimos';
    } else {
        processBtn.textContent = 'Selecciona ambas columnas';
    }
}

function populateColumnSelectors() {
    // Esta función ya no se usa, mantenida por compatibilidad
    console.log('Vista previa activada - selectores de columna deshabilitados');
}

function showControlsSection() {
    document.getElementById('controlsSection').style.display = 'block';
}

function generateSynonyms() {
    if (selectedAliasColumn === null || selectedDescriptionColumn === null) {
        alert('Por favor selecciona ambas columnas (alias y descripción)');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        try {
            processedData = [];
            allSynonyms.clear();
            allKeywords.clear();
            
            // Procesar cada fila (excepto encabezados)
            for (let i = 1; i < excelData.length; i++) {
                const row = excelData[i];
                const alias = row[selectedAliasColumn] ? row[selectedAliasColumn].toString().trim() : '';
                const description = row[selectedDescriptionColumn] ? row[selectedDescriptionColumn].toString().trim() : '';
                
                if (alias || description) {
                    const synonyms = generateSynonymsForProduct(alias, description);
                    const keywords = extractKeywords(alias + ' ' + description);
                    
                    processedData.push({
                        alias: alias,
                        description: description,
                        synonyms: synonyms,
                        keywords: keywords,
                        originalRow: row
                    });
                    
                    synonyms.forEach(syn => allSynonyms.add(syn));
                    keywords.forEach(kw => allKeywords.add(kw));
                }
            }
            
            displayResults(processedData);
            updateStats();
            showSearchSection();
            hideLoading();
            
        } catch (error) {
            hideLoading();
            alert('Error al generar sinónimos: ' + error.message);
            console.error('Error:', error);
        }
    }, 100);
}

function generateSynonymsForProduct(alias, description) {
    // Verificar si hay una coincidencia en la memoria
    const memoryResult = getSynonymsFromMemory(alias, description);
    
    if (memoryResult.found) {
        let statusMsg = '';
        if (memoryResult.type === 'exact') {
            statusMsg = '✅ Producto encontrado en memoria (coincidencia exacta)';
        } else {
            statusMsg = `🔍 Producto similar encontrado (${(memoryResult.similarity * 100).toFixed(1)}% similitud)`;
        }
        
        showStatusMessage(statusMsg, 'info');
        return memoryResult.synonyms;
    }

    // Si no hay coincidencia, generar nuevos sinónimos
    const synonyms = new Set();
    const text = (alias + ' ' + description).toLowerCase();
    
    // Diccionario de sinónimos industriales específico para RISOLU
    const industrialSynonyms = {
        // Automatización y Control (RISOLU especialidades)
        'plc': ['controlador', 'programmable logic controller', 'allen bradley', 'rockwell'],
        'hmi': ['interface', 'pantalla', 'operador', 'human machine interface'],
        'scada': ['supervisory control', 'sistema', 'control', 'supervisión'],
        'vfd': ['variador', 'drive', 'frecuencia', 'variable frequency drive'],
        'servo': ['servomotor', 'actuador', 'posicionamiento', 'precisión'],
        'encoder': ['codificador', 'posición', 'pulsos', 'rotatorio'],
        'sensor': ['detector', 'proximidad', 'fotoeléctrico', 'ultrasónico', 'allen bradley'],
        'actuador': ['actuator', 'cilindro', 'motor', 'movimiento'],
        'controlador': ['controller', 'plc', 'control', 'automatización'],
        
        // Redes Industriales y Comunicaciones (RISOLU)
        'ethernet': ['industrial', 'tcp/ip', 'comunicación', 'red', 'cisco'],
        'profinet': ['industrial ethernet', 'siemens', 'tiempo real'],
        'devicenet': ['can', 'red', 'dispositivos', 'allen bradley'],
        'modbus': ['protocolo', 'comunicación', 'rs485', 'tcp'],
        'canopen': ['can', 'protocolo', 'automatización'],
        'switch': ['conmutador', 'red', 'ethernet', 'industrial', 'cisco'],
        'router': ['enrutador', 'gateway', 'red', 'comunicación'],
        'gateway': ['pasarela', 'protocolo', 'conversión', 'comunicación'],
        'modem': ['módem', 'comunicación', 'remota', 'celular'],
        'wifi': ['inalámbrico', 'wireless', 'radio', 'comunicación'],
        
        // Equipo Eléctrico (RISOLU especialidades)
        'tablero': ['panel', 'gabinete', 'eléctrico', 'control', 'hoffman'],
        'gabinete': ['enclosure', 'nema', 'ip', 'protección', 'hoffman'],
        'breaker': ['interruptor', 'termomagnético', 'protección', 'square d', 'eaton'],
        'contactor': ['contacto', 'bobina', 'control', 'square d', 'eaton'],
        'relay': ['relé', 'relevador', 'contacto', 'auxiliar'],
        'fusible': ['fuse', 'protección', 'corriente', 'térmico'],
        'arrancador': ['starter', 'motor', 'control', 'square d'],
        'ups': ['no break', 'respaldo', 'energía', 'eaton'],
        'transformador': ['transformer', 'voltaje', 'corriente', 'eaton'],
        'medidor': ['meter', 'energía', 'multímetro', 'fluke'],
        
        // Cables y Conectores (RISOLU)
        'multiconductor': ['multi-conductor', 'varios hilos', 'control'],
        'coaxial': ['coax', 'rf', 'alta frecuencia', 'belden'],
        'fibra': ['fiber', 'óptica', 'comunicación', 'belden'],
        'patch': ['cable', 'conexión', 'red', 'ethernet'],
        'rj45': ['conector', 'ethernet', 'categoría', 'utp'],
        'sc': ['conector', 'fibra', 'óptica', 'simplex'],
        'lc': ['conector', 'fibra', 'óptica', 'duplex'],
        'bnc': ['conector', 'coaxial', 'bayonet'],
        'db9': ['conector', 'serie', 'rs232', 'comunicación'],
        'circular': ['conector', 'industrial', 'militar', 'm12'],
        
        // Marcas principales RISOLU
        'rockwell': ['allen bradley', 'automation', 'plc', 'drives'],
        'allen': ['bradley', 'rockwell', 'sensores', 'plc'],
        'bradley': ['allen', 'rockwell', 'automation'],
        'eaton': ['cutler hammer', 'electrical', 'ups', 'breakers'],
        'cisco': ['networking', 'switches', 'routers', 'industrial'],
        'belden': ['cables', 'conectores', 'comunicación', 'industrial'],
        'fluke': ['medición', 'multímetro', 'termografía', 'calibración'],
        'hoffman': ['gabinetes', 'enclosures', 'nema', 'protección'],
        'brady': ['etiquetas', 'identificación', 'loto', 'seguridad'],
        'phoenix': ['contact', 'terminales', 'conectores', 'bornes'],
        'square': ['schneider', 'contactores', 'arrancadores', 'eléctrico'],
        'schneider': ['square d', 'eléctrico', 'automatización'],
        
        // Climatización y Ventilación (RISOLU)
        'ventilador': ['fan', 'extractor', 'aire', 'refrigeración'],
        'filtro': ['filter', 'aire', 'partículas', 'ventilación'],
        'termostato': ['thermostat', 'temperatura', 'control', 'clima'],
        'damper': ['compuerta', 'aire', 'control', 'flujo'],
        'difusor': ['diffuser', 'aire', 'ventilación', 'distribución'],
        
        // Instrumentación (RISOLU)
        'transmisor': ['transmitter', 'señal', '4-20ma', 'campo'],
        'indicador': ['display', 'mostrar', 'medición', 'panel'],
        'convertidor': ['converter', 'señal', 'protocolo', 'aislamiento'],
        'aislador': ['isolator', 'señal', 'galvánico', 'protección'],
        'barrera': ['barrier', 'seguridad', 'intrínseca', 'explosión'],
        
        // Seguridad Industrial específica
        'loto': ['lockout tagout', 'bloqueo', 'etiquetado', 'brady'],
        'candado': ['padlock', 'seguridad', 'bloqueo', 'loto'],
        'etiqueta': ['tag', 'identificación', 'brady', 'loto'],
        'bloqueador': ['lockout', 'dispositivo', 'válvula', 'interruptor'],
        
        // Conectividad y Accesorios
        'regleta': ['terminal block', 'borne', 'conexión', 'phoenix contact'],
        'borne': ['terminal', 'conexión', 'tornillo', 'resorte'],
        'riel': ['din rail', 'montaje', 'soporte', '35mm'],
        'canaleta': ['duct', 'cable tray', 'conducto', 'cableado'],
        'charola': ['cable tray', 'soporte', 'cables', 'bandeja'],
        'grapa': ['clamp', 'sujeción', 'soporte', 'cable'],
        
        // Herramientas manuales
        'destornillador': ['screwdriver', 'desarmador', 'atornillador', 'phillips', 'plano', 'torx'],
        'llave': ['wrench', 'key', 'inglesa', 'española', 'allen', 'hexagonal', 'combinada'],
        'martillo': ['hammer', 'maza', 'mazo', 'bola', 'uña', 'goma'],
        'taladro': ['drill', 'perforadora', 'broca', 'mandril', 'percutor'],
        'sierra': ['saw', 'serrucho', 'cutter', 'disco', 'cinta', 'circular'],
        'alicate': ['pliers', 'pinza', 'tenaza', 'corte', 'punta', 'universal'],
        'lima': ['file', 'escofina', 'afilado', 'desbaste'],
        'cincel': ['chisel', 'buril', 'cortafrío'],
        'pico': ['pick', 'piqueta', 'demolición'],
        
        // Herramientas eléctricas
        'amoladora': ['grinder', 'esmeril', 'angular', 'disco', 'desbaste'],
        'caladora': ['jigsaw', 'sierra', 'vaivén', 'curva'],
        'rotomartillo': ['hammer drill', 'percutor', 'sds', 'concreto'],
        'lijadora': ['sander', 'orbital', 'banda', 'delta'],
        'fresadora': ['router', 'tupi', 'rebajadora'],
        
        // Medidas y dimensiones
        'mm': ['milímetro', 'milimetro', 'milímetros', 'milimetros'],
        'cm': ['centímetro', 'centimetro', 'centímetros', 'centimetros'],
        'metro': ['m', 'mt', 'metros', 'mts'],
        'pulgada': ['inch', 'in', 'pulgadas', '"'],
        'pie': ['foot', 'ft', 'pies', "'"],
        'yarda': ['yard', 'yd', 'yardas'],
        'kg': ['kilogramo', 'kilo', 'peso'],
        'gr': ['gramo', 'gramos', 'peso'],
        'lb': ['libra', 'libras', 'pound'],
        'ton': ['tonelada', 'toneladas', 'peso'],
        
        // Formas y tipos
        'redondo': ['round', 'circular', 'cilíndrico', 'tubo', 'barra'],
        'cuadrado': ['square', 'cuadro', 'perfil'],
        'rectangular': ['rectangle', 'rectángulo', 'perfil'],
        'hexagonal': ['hex', 'hexágono', 'allen'],
        'octagonal': ['octagon', 'octágono'],
        'ovalado': ['oval', 'elíptico'],
        'plano': ['flat', 'chato', 'liso'],
        'angular': ['angle', 'ángulo', 'esquinero', 'l'],
        
        // Procesos industriales
        'soldadura': ['welding', 'soldar', 'soldado', 'tig', 'mig', 'electrodo'],
        'corte': ['cutting', 'cortar', 'cortado', 'plasma', 'oxicorte', 'laser'],
        'pulido': ['polishing', 'pulir', 'pulimento', 'brillado', 'espejo'],
        'pintura': ['painting', 'pintar', 'pintado', 'esmalte', 'anticorrosivo'],
        'galvanizado': ['galvanized', 'zinc', 'recubrimiento', 'protección'],
        'anodizado': ['anodized', 'aluminio', 'oxidación', 'color'],
        'cromado': ['chromed', 'cromo', 'brillante', 'espejo'],
        'niquelado': ['nickel plated', 'níquel', 'recubrimiento'],
        'templado': ['tempered', 'temple', 'dureza', 'resistencia'],
        'forjado': ['forged', 'forja', 'conformado', 'caliente'],
        'laminado': ['rolled', 'lámina', 'plancha', 'caliente', 'frío'],
        'extruido': ['extruded', 'extrusión', 'perfil', 'aluminio'],
        
        // Componentes mecánicos - Fijación
        'tornillo': ['screw', 'bolt', 'perno', 'autorroscante', 'cabeza', 'rosca'],
        'tuerca': ['nut', 'rosca', 'hexagonal', 'mariposa', 'ciega'],
        'arandela': ['washer', 'rondana', 'plana', 'presión', 'dentada'],
        'perno': ['bolt', 'tornillo', 'roscado', 'cabeza'],
        'espárrago': ['stud', 'varilla', 'roscada', 'doble'],
        'remache': ['rivet', 'pop', 'ciego', 'estructural'],
        'grapa': ['staple', 'clip', 'sujeción'],
        'abrazadera': ['clamp', 'collar', 'sujeción', 'tubo'],
        
        // Componentes mecánicos - Transmisión
        'rodamiento': ['bearing', 'balero', 'cojinete', 'bolas', 'rodillos'],
        'engrane': ['gear', 'engranaje', 'piñón', 'corona', 'cremallera'],
        'cadena': ['chain', 'eslabón', 'transmisión', 'rodillo'],
        'correa': ['belt', 'banda', 'trapecial', 'dentada', 'plana'],
        'polea': ['pulley', 'roldana', 'transmisión'],
        'eje': ['shaft', 'árbol', 'flecha', 'roscado'],
        'chaveta': ['key', 'cuña', 'chavetero', 'ranura'],
        'cople': ['coupling', 'acoplamiento', 'unión', 'flexible'],
        
        // Conectores y uniones
        'conector': ['connector', 'conexión', 'terminal', 'plug', 'jack'],
        'cable': ['wire', 'alambre', 'conductor', 'flexible', 'awg'],
        'tubo': ['tube', 'pipe', 'tubería', 'conducto', 'pvc', 'galvanizado'],
        'manguera': ['hose', 'conducto', 'flexible', 'presión', 'hidráulica'],
        'codo': ['elbow', 'curva', '90°', '45°', 'conexión'],
        'tee': ['t', 'te', 'derivación', 'ramal'],
        'reducción': ['reducer', 'bushing', 'adaptador', 'transición'],
        'brida': ['flange', 'pestaña', 'conexión', 'atornillada'],
        'unión': ['union', 'conexión', 'junta', 'desmontable'],
        'niple': ['nipple', 'rosca', 'doble', 'conexión'],
        
        // Instrumentos de medición
        'calibrador': ['caliper', 'vernier', 'pie de rey', 'digital', 'dial'],
        'micrómetro': ['micrometer', 'palmer', 'exterior', 'interior'],
        'regla': ['ruler', 'rule', 'escuadra', 'graduada'],
        'flexómetro': ['tape measure', 'metro', 'cinta', 'métrica'],
        'nivel': ['level', 'burbuja', 'plomada', 'láser'],
        'goniómetro': ['protractor', 'transportador', 'ángulos'],
        'comparador': ['dial indicator', 'reloj', 'medición', 'precisión'],
        'galga': ['gauge', 'calibre', 'espesores', 'plantilla'],
        
        // Eléctrico/Electrónico
        'resistencia': ['resistor', 'resistance', 'ohm', 'carbón', 'película'],
        'capacitor': ['capacitance', 'condensador', 'electrolítico', 'cerámico'],
        'transistor': ['trans', 'semiconductor', 'npn', 'pnp', 'fet'],
        'diodo': ['diode', 'led', 'rectificador', 'zener'],
        'fusible': ['fuse', 'protección', 'térmico', 'cortocircuito'],
        'interruptor': ['switch', 'conmutador', 'pulsador', 'toggle'],
        'relay': ['relé', 'relevador', 'contacto', 'bobina'],
        'transformador': ['transformer', 'trafo', 'voltaje', 'primario', 'secundario'],
        'contactor': ['contactor', 'contacto', 'bobina', 'principal'],
        'breaker': ['interruptor', 'termomagnético', 'protección'],
        
        // Seguridad industrial
        'casco': ['helmet', 'protección', 'cabeza', 'seguridad', 'barbiquejo'],
        'guantes': ['gloves', 'protección', 'manos', 'látex', 'nitrilo', 'cuero'],
        'gafas': ['glasses', 'lentes', 'protección', 'ojos', 'seguridad', 'policarbonato'],
        'tapones': ['earplugs', 'protección', 'auditiva', 'oídos', 'espuma'],
        'respirador': ['respirator', 'mascarilla', 'protección', 'polvo', 'vapores'],
        'arnés': ['harness', 'seguridad', 'altura', 'anticaídas'],
        'chaleco': ['vest', 'reflectivo', 'alta', 'visibilidad'],
        'botas': ['boots', 'seguridad', 'puntera', 'dieléctricas'],
        
        // Válvulas y controles hidráulicos/neumáticos
        'válvula': ['valve', 'llave', 'control', 'paso', 'bola', 'compuerta', 'globo'],
        'bomba': ['pump', 'impulsor', 'centrífuga', 'sumergible', 'pistón'],
        'motor': ['engine', 'motor', 'actuador', 'hidráulico', 'neumático', 'eléctrico'],
        'cilindro': ['cylinder', 'pistón', 'hidráulico', 'neumático', 'vástago'],
        'compresor': ['compressor', 'aire', 'pistón', 'tornillo', 'centrífugo'],
        'manómetro': ['pressure gauge', 'presión', 'bar', 'psi', 'vacío'],
        'regulador': ['regulator', 'presión', 'caudal', 'temperatura'],
        'acumulador': ['accumulator', 'tanque', 'presión', 'hidráulico'],
        
        // Filtros y separadores
        'filtro': ['filter', 'colador', 'separador', 'aire', 'aceite', 'agua'],
        'malla': ['mesh', 'red', 'tamiz', 'criba', 'colador'],
        'separador': ['separator', 'trampa', 'vapor', 'aceite'],
        'coalescente': ['coalescing', 'filtro', 'aceite', 'agua'],
        
        // Sellado y empaque
        'sello': ['seal', 'empaque', 'junta', 'mecánico', 'rotatorio'],
        'empaque': ['gasket', 'sello', 'junta', 'tórico', 'plano'],
        'oring': ['o-ring', 'anillo', 'sello', 'tórico', 'viton', 'nitrilo'],
        'retenedor': ['oil seal', 'retén', 'aceite', 'labio'],
        'junta': ['joint', 'gasket', 'sellado', 'estanqueidad'],
        
        // Lubricación y mantenimiento
        'grasa': ['grease', 'lubricante', 'litio', 'rodamiento'],
        'aceite': ['oil', 'lubricante', 'hidráulico', 'motor', 'iso'],
        'sellador': ['sealant', 'silicona', 'anaeróbico', 'roscas'],
        'limpiador': ['cleaner', 'desengrasante', 'solvente'],
        'anticorrosivo': ['anti-corrosive', 'inhibidor', 'oxidación'],
        
        // Materiales de construcción
        'cemento': ['cement', 'concreto', 'hormigón', 'mortero'],
        'arena': ['sand', 'agregado', 'fino', 'sílice'],
        'grava': ['gravel', 'agregado', 'grueso', 'piedra'],
        'varilla': ['rebar', 'corrugada', 'lisa', 'acero'],
        'ladrillo': ['brick', 'tabique', 'refresco', 'rojo'],
        'block': ['concrete block', 'bloque', 'hueco', 'macizo'],
        'loseta': ['tile', 'cerámica', 'porcelanato', 'mármol'],
        'impermeabilizante': ['waterproofing', 'acrílico', 'asfáltico'],
        
        // Abreviaturas y códigos comunes
        'diam': ['diámetro', 'diameter', 'dia', 'ø'],
        'long': ['longitud', 'length', 'largo', 'l'],
        'ancho': ['width', 'wide', 'w', 'anchura'],
        'alto': ['height', 'h', 'altura', 'elevación'],
        'espesor': ['thickness', 'thick', 'grosor', 'calibre'],
        'rpm': ['revoluciones', 'minuto', 'velocidad', 'rotación'],
        'hp': ['horse power', 'caballos', 'fuerza', 'potencia'],
        'kw': ['kilowatt', 'potencia', 'eléctrica'],
        'bar': ['presión', 'atmosfera', 'manométrica'],
        'psi': ['presión', 'libras', 'pulgada', 'cuadrada'],
        'awg': ['american wire gauge', 'calibre', 'cable', 'alambre'],
        'npt': ['national pipe thread', 'rosca', 'tubería'],
        'bsp': ['british standard pipe', 'rosca', 'británica'],
        'iso': ['international organization', 'norma', 'estándar'],
        'din': ['deutsches institut', 'norma', 'alemana'],
        'ansi': ['american national standards', 'norma', 'americana'],
        'astm': ['american society testing', 'norma', 'materiales'],
        'sae': ['society automotive engineers', 'norma', 'automotriz'],
        
        // Marcas y tipos específicos (genéricos)
        'inoxidable': ['stainless', '304', '316', 'aisi', 'resistente'],
        'galvanizado': ['galvanized', 'zinc', 'sumergido', 'caliente'],
        'templado': ['tempered', 'temple', 'dureza', 'hrc'],
        'forjado': ['forged', 'forja', 'drop', 'caliente'],
        'fundido': ['cast', 'fundición', 'gris', 'nodular'],
        'laminado': ['hot rolled', 'cold rolled', 'hr', 'cr']
    };
    
    // Buscar sinónimos en el diccionario
    Object.keys(industrialSynonyms).forEach(key => {
        if (text.includes(key)) {
            industrialSynonyms[key].forEach(syn => {
                if (syn !== key) {
                    synonyms.add(syn);
                }
            });
        }
    });
    
    // Generar variaciones específicas para RISOLU
    if (alias) {
        const aliasWords = alias.toLowerCase().split(/[\s\-_]+/);
        aliasWords.forEach(word => {
            if (word.length > 2) {
                // Agregar sin acentos
                const withoutAccents = removeAccents(word);
                if (withoutAccents !== word) {
                    synonyms.add(withoutAccents);
                }
                
                // Agregar variaciones de plural/singular
                if (word.endsWith('s') && word.length > 3) {
                    synonyms.add(word.slice(0, -1));
                } else if (!word.endsWith('s')) {
                    synonyms.add(word + 's');
                }
                
                // Agregar abreviaciones
                if (word.length > 4) {
                    synonyms.add(word.substring(0, 3));
                    synonyms.add(word.substring(0, 4));
                }
                
                // Específico para RISOLU: extraer códigos de categoría
                if (word.match(/^[A-Z]{3}$/)) {
                    synonyms.add(word.toLowerCase());
                }
            }
        });
        
        // Generar sinónimos específicos para códigos RISOLU
        if (alias.match(/RSL-[A-Z]{3}-\d{3}/i)) {
            const parts = alias.split('-');
            if (parts.length === 3) {
                const category = parts[1].toLowerCase();
                const number = parts[2];
                
                // Agregar categorías conocidas de RISOLU (actualizadas con información real)
                const categoryMap = {
                    // Herramientas y mecánico
                    'mtr': ['martillo', 'hammer', 'tool', 'herramienta'],
                    'llv': ['llave', 'wrench', 'key', 'inglesa'],
                    'dst': ['destornillador', 'screwdriver', 'phillips'],
                    'tld': ['taladro', 'drill', 'perforadora'],
                    'amo': ['amoladora', 'grinder', 'angular'],
                    'cal': ['caladora', 'jigsaw', 'sierra'],
                    
                    // Fijación
                    'trn': ['tornillo', 'screw', 'bolt', 'perno'],
                    'trc': ['tuerca', 'nut', 'rosca'],
                    'ard': ['arandela', 'washer', 'rondana'],
                    
                    // Transmisión
                    'rdm': ['rodamiento', 'bearing', 'balero'],
                    'eng': ['engrane', 'gear', 'piñón'],
                    'crr': ['correa', 'belt', 'banda'],
                    
                    // Hidráulico
                    'vlv': ['válvula', 'valve', 'llave'],
                    'bcb': ['bomba', 'pump', 'impulsor'],
                    'flt': ['filtro', 'filter', 'colador'],
                    'mng': ['manguera', 'hose', 'conducto'],
                    
                    // Automatización RISOLU
                    'plc': ['controlador', 'programmable', 'allen bradley', 'rockwell'],
                    'hmi': ['pantalla', 'interface', 'panelview', 'operador'],
                    'vfd': ['variador', 'drive', 'powerflex', 'frecuencia'],
                    'sen': ['sensor', 'detector', 'proximidad', 'allen bradley'],
                    'enc': ['encoder', 'codificador', 'posición'],
                    'srv': ['servo', 'servomotor', 'kinetix'],
                    'act': ['actuador', 'actuator', 'cilindro'],
                    
                    // Redes Industriales RISOLU
                    'sw1': ['switch', 'ethernet', 'cisco', 'industrial'],
                    'sw2': ['switch', 'stratix', 'allen bradley'],
                    'gw1': ['gateway', 'modbus', 'protocolo'],
                    'cbl': ['cable', 'ethernet', 'belden', 'cat6'],
                    
                    // Equipo Eléctrico RISOLU
                    'gab': ['gabinete', 'nema', 'hoffman', 'enclosure'],
                    'brk': ['breaker', 'interruptor', 'eaton', 'termomagnético'],
                    'cnt': ['contactor', 'square d', 'contacto'],
                    'ups': ['no break', 'eaton', 'respaldo'],
                    'trf': ['transformador', 'square d', 'voltaje'],
                    
                    // Instrumentación RISOLU
                    'med': ['multímetro', 'fluke', 'medición'],
                    'ter': ['termográfica', 'fluke', 'temperatura'],
                    'cal': ['calibrador', 'fluke', 'proceso'],
                    'pre': ['transmisor', 'presión', 'honeywell'],
                    'tem': ['transmisor', 'temperatura', 'omega'],
                    'con': ['convertidor', 'phoenix contact', 'señal'],
                    'ais': ['aislador', 'phoenix contact', 'galvánico'],
                    'bar': ['barrera', 'seguridad', 'intrínseca'],
                    'det': ['detector', 'gas', 'honeywell'],
                    
                    // Cables y Canalizaciones RISOLU
                    'fib': ['fibra', 'óptica', 'belden', 'comunicación'],
                    'chr': ['charola', 'cable tray', 'hoffman'],
                    'grp': ['grapa', 'suspensión', 'soporte'],
                    
                    // Conectores RISOLU
                    'reg': ['regleta', 'terminal', 'phoenix contact'],
                    'rie': ['riel', 'din', 'montaje'],
                    
                    // Seguridad Industrial RISOLU
                    'csc': ['casco', 'helmet', 'protección'],
                    'gnt': ['guantes', 'gloves', 'protección'],
                    'gfs': ['gafas', 'glasses', 'protección'],
                    'rsp': ['respirador', 'respirator', 'protección'],
                    'arn': ['arnés', 'harness', 'anticaídas'],
                    'etq': ['etiquetas', 'brady', 'identificación'],
                    'can': ['candado', 'brady', 'seguridad'],
                    'blq': ['bloqueador', 'brady', 'loto'],
                    
                    // Climatización RISOLU
                    'ven': ['ventilador', 'hoffman', 'aire'],
                    'fil': ['filtro', 'aire', 'hoffman'],
                    
                    // Otros específicos RISOLU
                    'val': ['válvula', 'solenoide', 'asco']
                };
                
                if (categoryMap[category]) {
                    categoryMap[category].forEach(syn => synonyms.add(syn));
                }
                
                synonyms.add(category);
                synonyms.add(number);
            }
        }
    }
    
    // Extraer palabras clave de la descripción
    if (description) {
        const words = description.toLowerCase()
            .replace(/[^\w\s\u00C0-\u017F]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        words.forEach(word => {
            synonyms.add(word);
            synonyms.add(removeAccents(word));
        });
    }
    
    const finalSynonyms = Array.from(synonyms).filter(syn => syn.length > 1);
    const keywords = extractKeywords(alias + ' ' + description);
    
    // Guardar el producto en la memoria para uso futuro
    saveProductToDatabase(alias, description, finalSynonyms, keywords);
    
    showStatusMessage('✨ Nuevos sinónimos generados y guardados en memoria', 'success');
    
    return finalSynonyms;
}

function extractKeywords(text) {
    const keywords = new Set();
    
    // Palabras técnicas comunes en productos industriales
    const technicalTerms = [
        'industrial', 'mecánico', 'eléctrico', 'hidráulico', 'neumático',
        'manual', 'automático', 'digital', 'analógico', 'electrónico',
        'inoxidable', 'galvanizado', 'cromado', 'anodizado', 'templado',
        'resistente', 'duradero', 'preciso', 'ajustable', 'regulable',
        'pesado', 'liviano', 'compacto', 'portátil', 'fijo', 'móvil',
        'profesional', 'comercial', 'doméstico', 'militar', 'especial'
    ];
    
    const normalizedText = text.toLowerCase();
    
    technicalTerms.forEach(term => {
        if (normalizedText.includes(term)) {
            keywords.add(term);
        }
    });
    
    // Extraer números y medidas
    const measurements = text.match(/\d+(?:\.\d+)?\s*(?:mm|cm|m|in|ft|kg|g|lb|hp|rpm|v|a|w)/gi);
    if (measurements) {
        measurements.forEach(measure => keywords.add(measure.toLowerCase()));
    }
    
    // Extraer códigos de producto RISOLU (formato RSL-XXX-###)
    const risolCodes = text.match(/RSL-[A-Z]{3}-\d{3}/gi);
    if (risolCodes) {
        risolCodes.forEach(code => {
            keywords.add(code.toUpperCase());
            // Extraer las partes del código
            const parts = code.split('-');
            if (parts.length === 3) {
                keywords.add(parts[1]); // Parte del tipo (MTR, TLD, etc.)
                keywords.add(parts[2]); // Número
            }
        });
    }
    
    // Extraer modelos/códigos (alfanuméricos)
    const codes = text.match(/[A-Z0-9]{2,}[-_]?[A-Z0-9]{2,}/gi);
    if (codes) {
        codes.forEach(code => keywords.add(code.toUpperCase()));
    }
    
    return Array.from(keywords);
}

function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function displayResults(data) {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>${escapeHtml(item.alias)}</strong></td>
            <td>${escapeHtml(item.description)}</td>
            <td>
                ${item.synonyms.map(syn => `<span class="synonym-tag">${escapeHtml(syn)}</span>`).join('')}
            </td>
            <td>
                ${item.keywords.map(kw => `<span class="keyword-tag">${escapeHtml(kw)}</span>`).join('')}
            </td>
            <td>
                <div class="web-actions">
                    <button class="btn-web" onclick="searchProductInRisolu('${escapeHtml(item.alias)}')"
                            ${!webSearchEnabled ? 'disabled' : ''}>
                        🔍 Buscar Web
                    </button>
                    <button class="btn-enhance" onclick="generateEnhancedSynonyms(${index})">
                        ⚡ Mejorar Sinónimos
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsCount').textContent = `(${data.length} productos)`;
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayResults(processedData);
        return;
    }
    
    const searchAlias = document.getElementById('searchAlias').checked;
    const searchDescription = document.getElementById('searchDescription').checked;
    const searchSynonyms = document.getElementById('searchSynonyms').checked;
    
    const filteredData = processedData.filter(item => {
        const searchTermNormalized = removeAccents(searchTerm);
        
        let matches = false;
        
        if (searchAlias && item.alias) {
            const aliasNormalized = removeAccents(item.alias.toLowerCase());
            matches = matches || aliasNormalized.includes(searchTermNormalized);
        }
        
        if (searchDescription && item.description) {
            const descNormalized = removeAccents(item.description.toLowerCase());
            matches = matches || descNormalized.includes(searchTermNormalized);
        }
        
        if (searchSynonyms) {
            matches = matches || item.synonyms.some(syn => 
                removeAccents(syn.toLowerCase()).includes(searchTermNormalized)
            );
        }
        
        return matches;
    });
    
    displayResults(filteredData);
}

function updateStats() {
    document.getElementById('totalProducts').textContent = processedData.length;
    document.getElementById('totalSynonyms').textContent = allSynonyms.size;
    document.getElementById('uniqueKeywords').textContent = allKeywords.size;
    document.getElementById('statsSection').style.display = 'block';
}

function showSearchSection() {
    document.getElementById('searchSection').style.display = 'block';
}

function exportResults(format) {
    if (processedData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    const exportData = processedData.map(item => ({
        'Alias': item.alias,
        'Descripción': item.description,
        'Sinónimos': item.synonyms.join(', '),
        'Palabras Clave': item.keywords.join(', ')
    }));
    
    if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sinónimos');
        XLSX.writeFile(workbook, 'sinonimos_productos_industriales.xlsx');
    } else if (format === 'csv') {
        const csv = convertToCSV(exportData);
        downloadCSV(csv, 'sinonimos_productos_industriales.csv');
    }
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
        )
    ].join('\\n');
    
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Utilidades
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading() {
    // Crear elemento de loading si no existe
    let loading = document.querySelector('.loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = `
            <div class="spinner"></div>
            <p>Procesando archivo...</p>
        `;
        document.querySelector('.container').appendChild(loading);
    }
    loading.style.display = 'block';
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// ====== SISTEMA DE MEMORIA DE SINÓNIMOS ======

// Cargar memoria de sinónimos desde localStorage
function loadSynonymMemory() {
    try {
        const savedMemory = localStorage.getItem('risolusSynonymMemory');
        if (savedMemory) {
            const parsed = JSON.parse(savedMemory);
            synonymMemory = new Map(parsed.synonyms || []);
            productDatabase = new Map(parsed.products || []);
            console.log(`Cargados ${synonymMemory.size} sinónimos y ${productDatabase.size} productos de la memoria`);
        }
    } catch (error) {
        console.warn('Error cargando memoria de sinónimos:', error);
        synonymMemory = new Map();
        productDatabase = new Map();
    }
}

// Guardar memoria de sinónimos en localStorage
function saveSynonymMemory() {
    try {
        const memoryData = {
            synonyms: Array.from(synonymMemory.entries()),
            products: Array.from(productDatabase.entries()),
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem('risolusSynonymMemory', JSON.stringify(memoryData));
        console.log('Memoria de sinónimos guardada exitosamente');
        return true;
    } catch (error) {
        console.error('Error guardando memoria de sinónimos:', error);
        return false;
    }
}

// Crear clave única para un producto
function createProductKey(alias, description) {
    const cleanAlias = (alias || '').trim().toLowerCase().replace(/[^\w\s]/g, '');
    const cleanDesc = (description || '').trim().toLowerCase().replace(/[^\w\s]/g, '');
    return `${cleanAlias}|${cleanDesc}`;
}

// Calcular similitud entre dos textos (algoritmo de Jaccard)
function calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    
    const words1 = new Set(normalize(text1));
    const words2 = new Set(normalize(text2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
}

// Buscar producto similar en la base de datos
function findSimilarProduct(alias, description) {
    let bestMatch = null;
    let bestSimilarity = 0;
    
    for (const [key, product] of productDatabase.entries()) {
        const aliasSimilarity = calculateSimilarity(alias, product.alias);
        const descSimilarity = calculateSimilarity(description, product.description);
        const averageSimilarity = (aliasSimilarity + descSimilarity) / 2;
        
        if (averageSimilarity > bestSimilarity && averageSimilarity >= similarityThreshold) {
            bestSimilarity = averageSimilarity;
            bestMatch = { ...product, similarity: averageSimilarity, key };
        }
    }
    
    return bestMatch;
}

// Guardar producto en la base de datos
function saveProductToDatabase(alias, description, synonyms, keywords) {
    const key = createProductKey(alias, description);
    const productData = {
        alias: alias || '',
        description: description || '',
        synonyms: synonyms || [],
        keywords: keywords || [],
        createdAt: new Date().toISOString(),
        usageCount: (productDatabase.get(key)?.usageCount || 0) + 1
    };
    
    productDatabase.set(key, productData);
    saveSynonymMemory();
    return key;
}

// Obtener sinónimos mejorados usando memoria
function getSynonymsFromMemory(alias, description) {
    // Primero buscar coincidencia exacta
    const exactKey = createProductKey(alias, description);
    if (productDatabase.has(exactKey)) {
        const product = productDatabase.get(exactKey);
        product.usageCount++;
        productDatabase.set(exactKey, product);
        saveSynonymMemory();
        return {
            found: true,
            type: 'exact',
            synonyms: product.synonyms,
            keywords: product.keywords,
            similarity: 1.0
        };
    }
    
    // Buscar producto similar
    const similarProduct = findSimilarProduct(alias, description);
    if (similarProduct) {
        return {
            found: true,
            type: 'similar',
            synonyms: similarProduct.synonyms,
            keywords: similarProduct.keywords,
            similarity: similarProduct.similarity,
            originalAlias: similarProduct.alias,
            originalDescription: similarProduct.description
        };
    }
    
    return { found: false };
}

// Exportar memoria de sinónimos
function exportSynonymMemory(format = 'json') {
    const data = {
        metadata: {
            exportDate: new Date().toISOString(),
            totalProducts: productDatabase.size,
            version: '1.0',
            format: format
        },
        products: Array.from(productDatabase.entries()).map(([key, product]) => ({
            key,
            ...product
        }))
    };
    
    switch (format.toLowerCase()) {
        case 'json':
            downloadJSON(data, 'risolu_synonym_database.json');
            break;
        case 'csv':
            exportMemoryToCSV(data);
            break;
        case 'excel':
            exportMemoryToExcel(data);
            break;
        default:
            console.error('Formato no soportado:', format);
    }
}

// Exportar a CSV
function exportMemoryToCSV(data) {
    const csvData = data.products.map(product => ({
        'Clave': product.key,
        'Alias': product.alias,
        'Descripción': product.description,
        'Sinónimos': product.synonyms.join('; '),
        'Palabras Clave': product.keywords.join('; '),
        'Fecha Creación': product.createdAt,
        'Veces Usado': product.usageCount
    }));
    
    const csv = convertToCSV(csvData);
    downloadCSV(csv, 'risolu_synonym_database.csv');
}

// Exportar a Excel
function exportMemoryToExcel(data) {
    const excelData = data.products.map(product => ({
        'Clave': product.key,
        'Alias': product.alias,
        'Descripción': product.description,
        'Sinónimos': product.synonyms.join('; '),
        'Palabras Clave': product.keywords.join('; '),
        'Fecha Creación': product.createdAt,
        'Veces Usado': product.usageCount
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Base de Datos Sinónimos');
    XLSX.writeFile(workbook, 'risolu_synonym_database.xlsx');
}

// Descargar JSON
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Importar memoria desde archivo
function importSynonymMemory(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.products && Array.isArray(data.products)) {
                    let importedCount = 0;
                    
                    data.products.forEach(product => {
                        if (product.key && product.alias !== undefined && product.description !== undefined) {
                            productDatabase.set(product.key, {
                                alias: product.alias || '',
                                description: product.description || '',
                                synonyms: product.synonyms || [],
                                keywords: product.keywords || [],
                                createdAt: product.createdAt || new Date().toISOString(),
                                usageCount: product.usageCount || 1
                            });
                            importedCount++;
                        }
                    });
                    
                    saveSynonymMemory();
                    resolve(importedCount);
                } else {
                    reject(new Error('Formato de archivo inválido'));
                }
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsText(file);
    });
}

// Limpiar memoria de sinónimos
function clearSynonymMemory() {
    if (confirm('¿Estás seguro de que quieres borrar toda la memoria de sinónimos? Esta acción no se puede deshacer.')) {
        synonymMemory.clear();
        productDatabase.clear();
        localStorage.removeItem('risolusSynonymMemory');
        showStatusMessage('Memoria de sinónimos limpiada', 'success');
        return true;
    }
    return false;
}

// Obtener estadísticas de la memoria
function getMemoryStats() {
    const stats = {
        totalProducts: productDatabase.size,
        totalUniqueAliases: new Set(Array.from(productDatabase.values()).map(p => p.alias)).size,
        totalSynonyms: Array.from(productDatabase.values()).reduce((sum, p) => sum + p.synonyms.length, 0),
        mostUsedProducts: Array.from(productDatabase.entries())
            .sort((a, b) => b[1].usageCount - a[1].usageCount)
            .slice(0, 5)
            .map(([key, product]) => ({
                alias: product.alias,
                description: product.description,
                usageCount: product.usageCount
            })),
        memorySize: JSON.stringify({
            synonyms: Array.from(synonymMemory.entries()),
            products: Array.from(productDatabase.entries())
        }).length
    };
    
    return stats;
}

// ====== FUNCIONES DE BÚSQUEDA WEB DIRECTA ======

// Función para búsqueda web directa
function openWebSearch(productName, searchEngine = 'risolu') {
    const cleanQuery = encodeURIComponent(productName.trim());
    const searchUrl = SEARCH_URLS[searchEngine] + cleanQuery;
    
    // Abrir en nueva pestaña
    window.open(searchUrl, '_blank');
    
    showStatusMessage(`🔍 Búsqueda iniciada en ${searchEngine.toUpperCase()}`, 'info');
}

// Función para búsqueda múltiple
function searchInMultipleSites(productName) {
    const searchEngines = ['risolu', 'grainger', 'amazon', 'mercadolibre'];
    
    searchEngines.forEach((engine, index) => {
        setTimeout(() => {
            openWebSearch(productName, engine);
        }, index * 1000); // Retraso de 1 segundo entre cada búsqueda
    });
    
    showStatusMessage(`🚀 Búsqueda iniciada en ${searchEngines.length} sitios`, 'success');
}

// Actualizar estado de búsqueda web
function updateWebSearchStatus() {
    const webStatus = document.getElementById('webSearchStatus');
    
    if (webStatus) {
        if (webSearchEnabled) {
            webStatus.textContent = 'Búsqueda Web Activa 🌐';
            webStatus.className = 'web-status connected';
        } else {
            webStatus.textContent = 'Búsqueda Web Desactivada ❌';
            webStatus.className = 'web-status disconnected';
        }
    }
}

// Buscar producto específico usando búsqueda web directa
function searchProductInRisolu(alias) {
    const searchOptions = [
        { name: 'RISOLU', engine: 'risolu' },
        { name: 'Grainger', engine: 'grainger' },
        { name: 'Amazon', engine: 'amazon' },
        { name: 'MercadoLibre', engine: 'mercadolibre' }
    ];
    
    // Crear modal de opciones de búsqueda
    const modal = createSearchModal(alias, searchOptions);
    document.body.appendChild(modal);
    
    showStatusMessage(`🔍 Opciones de búsqueda para: ${alias}`, 'info');
}

// Crear modal para seleccionar sitio de búsqueda
function createSearchModal(productName, searchOptions) {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content">
            <div class="search-modal-header">
                <h3>🔍 Buscar: ${escapeHtml(productName)}</h3>
                <button class="close-modal" onclick="this.closest('.search-modal').remove()">&times;</button>
            </div>
            <div class="search-modal-body">
                <p>Selecciona dónde buscar este producto:</p>
                <div class="search-options">
                    ${searchOptions.map(option => `
                        <button class="search-option-btn" onclick="openWebSearch('${escapeHtml(productName)}', '${option.engine}'); this.closest('.search-modal').remove();">
                            🌐 Buscar en ${option.name}
                        </button>
                    `).join('')}
                </div>
                <div class="search-all">
                    <button class="search-all-btn" onclick="searchInMultipleSites('${escapeHtml(productName)}'); this.closest('.search-modal').remove();">
                        🚀 Buscar en Todos los Sitios
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Función para generar sinónimos potenciados (sin API)
function generateEnhancedSynonyms(index) {
    if (!processedData[index]) return;
    
    const item = processedData[index];
    const enhancedSynonyms = new Set(item.synonyms);
    
    // Agregar variaciones adicionales basadas en el contexto RISOLU
    const contextualTerms = generateContextualSynonyms(item.alias, item.description);
    contextualTerms.forEach(term => enhancedSynonyms.add(term));
    
    // Actualizar los sinónimos del producto
    item.synonyms = Array.from(enhancedSynonyms);
    
    // Actualizar la visualización
    displayResults(processedData);
    
    showStatusMessage(`✨ Sinónimos mejorados para: ${item.alias}`, 'success');
}

// Generar sinónimos contextuales adicionales
function generateContextualSynonyms(alias, description) {
    const contextTerms = new Set();
    const text = (alias + ' ' + description).toLowerCase();
    
    // Términos específicos según contexto industrial
    const contextPatterns = {
        automation: ['plc', 'hmi', 'drive', 'servo', 'encoder'],
        electrical: ['breaker', 'contactor', 'transformer', 'ups'],
        networking: ['switch', 'cable', 'connector', 'gateway'],
        safety: ['helmet', 'gloves', 'glasses', 'harness'],
        tools: ['hammer', 'wrench', 'drill', 'saw'],
        hydraulic: ['valve', 'pump', 'filter', 'cylinder']
    };
    
    // Buscar patrones y agregar términos relacionados
    Object.entries(contextPatterns).forEach(([category, patterns]) => {
        if (patterns.some(pattern => text.includes(pattern))) {
            patterns.forEach(term => contextTerms.add(term));
            contextTerms.add(category);
        }
    });
    
    return Array.from(contextTerms);
}

// ====== FUNCIONES DE BÚSQUEDA WEB SIMPLIFICADA ======

// Generar sinónimos mejorados usando lógica local (ya implementada antes)
// Esta función ya existe más arriba con el mismo nombre, eliminando duplicado

// Función displayRisolusProducts eliminada - ahora usamos búsqueda web directa

// Mostrar mensajes de estado
function showStatusMessage(message, type = 'info') {
    // Eliminar mensajes anteriores
    const existingMessages = document.querySelectorAll('.status-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message status-${type}`;
    
    if (type === 'loading') {
        messageDiv.innerHTML = `
            <span class="loading-inline">
                <span class="spinner-small"></span>
                ${message}
            </span>
        `;
    } else {
        messageDiv.textContent = message;
    }
    
    // Insertar después del header
    const header = document.querySelector('header');
    header.parentNode.insertBefore(messageDiv, header.nextSibling);
    
    // Auto-eliminar después de 5 segundos (excepto loading)
    if (type !== 'loading') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Función searchLocalProducts eliminada - funcionalidad integrada en searchProducts

// ====== FUNCIONES DE CONTROL DE BÚSQUEDA WEB ======

// Activar/desactivar búsqueda web
function toggleWebSearch() {
    webSearchEnabled = !webSearchEnabled;
    updateWebSearchStatus();
    
    const message = webSearchEnabled ? 
        'Búsqueda web activada' : 
        'Búsqueda web desactivada';
    
    showStatusMessage(message, webSearchEnabled ? 'success' : 'info');
}

// Configurar URLs de búsqueda personalizadas
function configureSearchUrls() {
    const modal = createSearchConfigModal();
    document.body.appendChild(modal);
}

// Crear modal de configuración de URLs
function createSearchConfigModal() {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content">
            <div class="search-modal-header">
                <h3>⚙️ Configurar URLs de Búsqueda</h3>
                <button class="close-modal" onclick="this.closest('.search-modal').remove()">&times;</button>
            </div>
            <div class="search-modal-body">
                <div class="url-config">
                    ${Object.entries(SEARCH_URLS).map(([key, url]) => `
                        <div class="url-input-group">
                            <label>${key.toUpperCase()}:</label>
                            <input type="url" id="url-${key}" value="${url}" placeholder="https://...">
                        </div>
                    `).join('')}
                </div>
                <div class="config-actions">
                    <button class="btn-save-config" onclick="saveUrlConfiguration(); this.closest('.search-modal').remove();">
                        💾 Guardar Configuración
                    </button>
                    <button class="btn-reset-config" onclick="resetUrlConfiguration(); this.closest('.search-modal').remove();">
                        🔄 Restablecer Defaults
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Guardar configuración de URLs
function saveUrlConfiguration() {
    Object.keys(SEARCH_URLS).forEach(key => {
        const input = document.getElementById(`url-${key}`);
        if (input && input.value.trim()) {
            SEARCH_URLS[key] = input.value.trim();
        }
    });
    
    // Guardar en localStorage
    localStorage.setItem('risolusSearchUrls', JSON.stringify(SEARCH_URLS));
    showStatusMessage('Configuración de URLs guardada', 'success');
}

// Restablecer URLs por defecto
function resetUrlConfiguration() {
    const defaultUrls = {
        risolu: 'https://www.risolu.com.mx/search?q=',
        grainger: 'https://www.grainger.com.mx/search?query=',
        amazon: 'https://www.amazon.com.mx/s?k=',
        mercadolibre: 'https://listado.mercadolibre.com.mx/'
    };
    
    Object.assign(SEARCH_URLS, defaultUrls);
    localStorage.removeItem('risolusSearchUrls');
    showStatusMessage('URLs restablecidas a valores por defecto', 'success');
}

// Cargar configuración de URLs desde localStorage
function loadUrlConfiguration() {
    try {
        const savedUrls = localStorage.getItem('risolusSearchUrls');
        if (savedUrls) {
            const urls = JSON.parse(savedUrls);
            Object.assign(SEARCH_URLS, urls);
        }
    } catch (error) {
        console.warn('Error cargando configuración de URLs:', error);
    }
}

// Funciones de API eliminadas - ahora usamos búsqueda web directa

// Funciones de control de API eliminadas - sistema ahora usa búsqueda web directa
// ====== INICIALIZACIÓN DEL SISTEMA ======

// Inicializar al cargar la página
window.addEventListener('DOMContentLoaded', function() {
    // Cargar memoria de sinónimos al iniciar
    loadSynonymMemory();
    
    // Cargar configuración de URLs de búsqueda
    loadUrlConfiguration();
    
    // Inicializar estado de búsqueda web
    updateWebSearchStatus();
    
    // Mostrar estadísticas de memoria si hay datos
    const stats = getMemoryStats();
    if (stats.totalProducts > 0) {
        showStatusMessage(`📚 Memoria cargada: ${stats.totalProducts} productos, ${stats.totalSynonyms} sinónimos`, 'info');
    }
    
    console.log('Sistema RISOLU Sinónimos v2.0 iniciado correctamente');
    console.log('Memoria disponible:', stats);
    console.log('Búsqueda web habilitada:', webSearchEnabled);
    
    // Cargar configuración de similitud
    const savedThreshold = localStorage.getItem('risolusimilarityThreshold');
    if (savedThreshold) {
        similarityThreshold = parseFloat(savedThreshold);
        if (document.getElementById('similaritySlider')) {
            document.getElementById('similaritySlider').value = similarityThreshold;
            document.getElementById('similarityValue').textContent = similarityThreshold;
        }
    }
    
    // Actualizar estadísticas de memoria en la interfaz
    setTimeout(refreshMemoryStats, 1000);
});

// ====== FUNCIONES DE INTERFAZ DE MEMORIA ======

function refreshMemoryStats() {
    const stats = getMemoryStats();
    
    document.getElementById('memoryTotalProducts').textContent = stats.totalProducts;
    document.getElementById('memoryTotalSynonyms').textContent = stats.totalSynonyms;
    document.getElementById('memorySize').textContent = `${(stats.memorySize / 1024).toFixed(1)} KB`;
    
    showStatusMessage('Estadísticas de memoria actualizadas', 'success');
}

function showMostUsedProducts() {
    const mostUsedDiv = document.getElementById('mostUsedProducts');
    const isVisible = mostUsedDiv.style.display !== 'none';
    
    if (isVisible) {
        mostUsedDiv.style.display = 'none';
    } else {
        const stats = getMemoryStats();
        const listContainer = document.getElementById('mostUsedList');
        
        if (stats.mostUsedProducts.length === 0) {
            listContainer.innerHTML = '<p>No hay productos en memoria aún.</p>';
        } else {
            listContainer.innerHTML = stats.mostUsedProducts.map(product => `
                <div class="product-item">
                    <strong>${escapeHtml(product.alias)}</strong>
                    <span class="product-description">${escapeHtml(product.description)}</span>
                    <span class="usage-count">Usado ${product.usageCount} veces</span>
                </div>
            `).join('');
        }
        
        mostUsedDiv.style.display = 'block';
    }
}

function adjustSimilarityThreshold() {
    const settingsDiv = document.getElementById('similaritySettings');
    const isVisible = settingsDiv.style.display !== 'none';
    
    if (isVisible) {
        settingsDiv.style.display = 'none';
    } else {
        document.getElementById('similaritySlider').value = similarityThreshold;
        document.getElementById('similarityValue').textContent = similarityThreshold;
        settingsDiv.style.display = 'block';
    }
}

function updateSimilarityThreshold(value) {
    similarityThreshold = parseFloat(value);
    document.getElementById('similarityValue').textContent = value;
    
    // Guardar configuración en localStorage
    localStorage.setItem('risolusimilarityThreshold', value);
    
    showStatusMessage(`Umbral de similitud ajustado a ${value}`, 'success');
}

function handleMemoryImport(input) {
    const file = input.files[0];
    if (!file) return;
    
    showStatusMessage('Importando base de datos...', 'loading');
    
    importSynonymMemory(file)
        .then(importedCount => {
            showStatusMessage(`✅ ${importedCount} productos importados exitosamente`, 'success');
            refreshMemoryStats();
        })
        .catch(error => {
            showStatusMessage(`❌ Error importando: ${error.message}`, 'error');
        })
        .finally(() => {
            input.value = ''; // Limpiar input
        });
}