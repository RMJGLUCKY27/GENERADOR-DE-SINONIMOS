// Debug Helper para RISOLU Sinónimos
// Agregar este script para diagnosticar problemas

window.RisoluDebug = {
    checkElements: function() {
        console.log('🔍 DIAGNÓSTICO DE ELEMENTOS');
        
        const elements = [
            'fileInput', 'uploadBox', 'previewHeader', 'previewBody',
            'selectedAlias', 'selectedDescription', 'processBtn',
            'resultsSection', 'webSearchStatus'
        ];
        
        elements.forEach(id => {
            const el = document.getElementById(id);
            console.log(`${el ? '✅' : '❌'} ${id}:`, el);
        });
    },
    
    checkVariables: function() {
        console.log('🔍 DIAGNÓSTICO DE VARIABLES');
        console.log('📊 excelData:', window.excelData?.length || 'No definido');
        console.log('📝 selectedAliasColumn:', window.selectedAliasColumn);
        console.log('📝 selectedDescriptionColumn:', window.selectedDescriptionColumn);
        console.log('🌐 webSearchEnabled:', window.webSearchEnabled);
    },
    
    testFileUpload: function() {
        console.log('🧪 PRUEBA DE CARGA DE ARCHIVO');
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            console.log('📁 Input de archivo encontrado');
            fileInput.click();
        } else {
            console.error('❌ Input de archivo no encontrado');
        }
    },
    
    forceProcessData: function() {
        console.log('🧪 FORZAR PROCESAMIENTO');
        if (typeof generateSynonyms === 'function') {
            console.log('🚀 Ejecutando generateSynonyms...');
            generateSynonyms();
        } else {
            console.error('❌ Función generateSynonyms no encontrada');
        }
    },
    
    showConsoleCommands: function() {
        console.log(`
🛠️ COMANDOS DE DEBUG DISPONIBLES:

RisoluDebug.checkElements()     - Verificar elementos DOM
RisoluDebug.checkVariables()    - Verificar variables globales
RisoluDebug.testFileUpload()    - Probar selección de archivo
RisoluDebug.forceProcessData()  - Forzar procesamiento
RisoluDebug.resetColumns()      - Resetear selección de columnas

Para usar: Abre la consola (F12) y ejecuta cualquier comando.
        `);
    },
    
    resetColumns: function() {
        console.log('🔄 RESETEANDO COLUMNAS');
        window.selectedAliasColumn = null;
        window.selectedDescriptionColumn = null;
        
        // Remover clases de selección
        document.querySelectorAll('.preview-table th').forEach(th => {
            th.classList.remove('selected-alias', 'selected-description');
        });
        
        // Actualizar display
        if (typeof updateSelectedColumnDisplay === 'function') {
            updateSelectedColumnDisplay('alias', null);
            updateSelectedColumnDisplay('description', null);
        }
        
        // Actualizar botón
        if (typeof updateProcessButton === 'function') {
            updateProcessButton();
        }
        
        console.log('✅ Columnas reseteadas');
    }
};

// Mostrar comandos al cargar
setTimeout(() => {
    console.log('%c🚀 RISOLU Debug Helper Cargado', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    RisoluDebug.showConsoleCommands();
}, 2000);