const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let controlServerProcess = null;

// Estado del sistema
let systemStatus = {
    bootstrapRunning: true,
    controlServerRunning: false,
    apiServerRunning: false,
    lastCheck: new Date().toISOString()
};

// Endpoint para iniciar el servidor de control
app.post('/start-control', async (req, res) => {
    try {
        if (controlServerProcess && !controlServerProcess.killed) {
            return res.json({ 
                success: true, 
                message: 'Servidor de control ya está corriendo',
                status: systemStatus 
            });
        }

        // Verificar si el puerto 3002 está libre
        const isPortFree = await checkPortAvailable(3002);
        if (!isPortFree) {
            systemStatus.controlServerRunning = true;
            return res.json({ 
                success: true, 
                message: 'Servidor de control ya está activo en puerto 3002',
                status: systemStatus 
            });
        }

        // Iniciar el servidor de control
        controlServerProcess = spawn('node', ['api-control.js'], {
            cwd: __dirname,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false
        });

        systemStatus.controlServerRunning = true;
        systemStatus.lastCheck = new Date().toISOString();

        controlServerProcess.stdout.on('data', (data) => {
            console.log(`Control Server: ${data}`);
        });

        controlServerProcess.stderr.on('data', (data) => {
            console.error(`Control Server Error: ${data}`);
        });

        controlServerProcess.on('close', (code) => {
            console.log(`Servidor de control terminado con código: ${code}`);
            systemStatus.controlServerRunning = false;
            controlServerProcess = null;
        });

        controlServerProcess.on('error', (error) => {
            console.error('Error en servidor de control:', error);
            systemStatus.controlServerRunning = false;
            controlServerProcess = null;
        });

        // Esperar un momento para asegurar que inició
        await new Promise(resolve => setTimeout(resolve, 2000));

        res.json({ 
            success: true, 
            message: 'Servidor de control iniciado correctamente',
            pid: controlServerProcess ? controlServerProcess.pid : null,
            status: systemStatus 
        });

    } catch (error) {
        systemStatus.controlServerRunning = false;
        res.status(500).json({ 
            success: false, 
            error: error.message,
            status: systemStatus 
        });
    }
});

// Endpoint para verificar el estado del sistema
app.get('/status', async (req, res) => {
    // Verificar estado actual de los servicios
    systemStatus.controlServerRunning = await checkPortAvailable(3002) === false;
    systemStatus.apiServerRunning = await checkPortAvailable(3001) === false;
    systemStatus.lastCheck = new Date().toISOString();
    
    res.json(systemStatus);
});

// Endpoint para iniciar el servidor web automáticamente
app.post('/start-web', (req, res) => {
    try {
        // Como el servidor web ya está corriendo (para recibir esta petición),
        // solo confirmamos que está activo
        res.json({ 
            success: true, 
            message: 'Servidor web ya está activo',
            url: 'http://localhost:8000'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Función auxiliar para verificar si un puerto está disponible
function checkPortAvailable(port) {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
            resolve(!stdout.trim()); // true si el puerto está libre
        });
    });
}

// Endpoint para detener servicios
app.post('/stop-control', (req, res) => {
    try {
        if (controlServerProcess && !controlServerProcess.killed) {
            controlServerProcess.kill('SIGTERM');
            systemStatus.controlServerRunning = false;
            res.json({ 
                success: true, 
                message: 'Servidor de control detenido',
                status: systemStatus 
            });
        } else {
            res.json({ 
                success: true, 
                message: 'Servidor de control no estaba corriendo',
                status: systemStatus 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Inicialización automática al arrancar
async function autoStart() {
    console.log('🚀 Bootstrap Server iniciado - Puerto 3003');
    console.log('📋 Verificando servicios existentes...');
    
    // Verificar servicios existentes
    const controlRunning = await checkPortAvailable(3002) === false;
    const apiRunning = await checkPortAvailable(3001) === false;
    
    systemStatus.controlServerRunning = controlRunning;
    systemStatus.apiServerRunning = apiRunning;
    
    console.log(`📊 Estado inicial:`);
    console.log(`   - Servidor de Control (3002): ${controlRunning ? '✅ Activo' : '❌ Inactivo'}`);
    console.log(`   - API RISOLU (3001): ${apiRunning ? '✅ Activo' : '❌ Inactivo'}`);
    console.log('');
    console.log('🌐 Los usuarios pueden acceder a: http://localhost:8000');
    console.log('🎛️  Los servicios se iniciarán automáticamente cuando sea necesario');
}

const PORT = 3003;
app.listen(PORT, () => {
    autoStart();
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando Bootstrap Server...');
    
    if (controlServerProcess && !controlServerProcess.killed) {
        console.log('⏹️  Deteniendo servidor de control...');
        controlServerProcess.kill('SIGTERM');
    }
    
    console.log('✅ Bootstrap Server cerrado');
    process.exit(0);
});

process.on('SIGTERM', () => {
    if (controlServerProcess && !controlServerProcess.killed) {
        controlServerProcess.kill('SIGTERM');
    }
    process.exit(0);
});