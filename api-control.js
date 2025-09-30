const express = require('express');
const { spawn, exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let apiProcess = null;
const API_DIR = path.join(__dirname, 'api');
const API_SCRIPT = path.join(API_DIR, 'index.js');

// Estado de la API
let apiStatus = {
    running: false,
    pid: null,
    port: 3001,
    lastStart: null,
    lastStop: null,
    errors: []
};

// Endpoint para obtener el estado de la API
app.get('/api/status', (req, res) => {
    res.json(apiStatus);
});

// Endpoint para iniciar la API
app.post('/api/start', async (req, res) => {
    try {
        if (apiProcess && !apiProcess.killed) {
            return res.status(400).json({ 
                error: 'La API ya está en ejecución',
                status: apiStatus 
            });
        }

        // Verificar si el puerto está en uso
        const isPortInUse = await checkPort(apiStatus.port);
        if (isPortInUse) {
            return res.status(400).json({ 
                error: `Puerto ${apiStatus.port} ya está en uso`,
                status: apiStatus 
            });
        }

        // Iniciar la API
        apiProcess = spawn('node', ['index.js'], {
            cwd: API_DIR,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false
        });

        apiStatus.running = true;
        apiStatus.pid = apiProcess.pid;
        apiStatus.lastStart = new Date().toISOString();
        apiStatus.errors = [];

        // Manejar salida y errores
        apiProcess.stdout.on('data', (data) => {
            console.log(`API stdout: ${data}`);
        });

        apiProcess.stderr.on('data', (data) => {
            console.error(`API stderr: ${data}`);
            apiStatus.errors.push(data.toString());
        });

        apiProcess.on('close', (code) => {
            console.log(`Proceso API terminado con código: ${code}`);
            apiStatus.running = false;
            apiStatus.pid = null;
            apiStatus.lastStop = new Date().toISOString();
            if (code !== 0) {
                apiStatus.errors.push(`Proceso terminado con código de error: ${code}`);
            }
        });

        apiProcess.on('error', (error) => {
            console.error('Error iniciando API:', error);
            apiStatus.running = false;
            apiStatus.pid = null;
            apiStatus.errors.push(error.message);
        });

        // Esperar un momento para verificar que inició correctamente
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (apiProcess.killed || apiProcess.exitCode !== null) {
            throw new Error('La API no pudo iniciarse correctamente');
        }

        res.json({ 
            message: 'API iniciada correctamente',
            status: apiStatus 
        });

    } catch (error) {
        apiStatus.running = false;
        apiStatus.pid = null;
        apiStatus.errors.push(error.message);
        
        res.status(500).json({ 
            error: error.message,
            status: apiStatus 
        });
    }
});

// Endpoint para detener la API
app.post('/api/stop', (req, res) => {
    try {
        if (!apiProcess || apiProcess.killed) {
            return res.status(400).json({ 
                error: 'La API no está en ejecución',
                status: apiStatus 
            });
        }

        // Intentar terminar el proceso gracefully
        apiProcess.kill('SIGTERM');
        
        setTimeout(() => {
            if (apiProcess && !apiProcess.killed) {
                console.log('Forzando terminación de la API...');
                apiProcess.kill('SIGKILL');
            }
        }, 5000);

        apiStatus.running = false;
        apiStatus.lastStop = new Date().toISOString();

        res.json({ 
            message: 'API detenida correctamente',
            status: apiStatus 
        });

    } catch (error) {
        apiStatus.errors.push(error.message);
        res.status(500).json({ 
            error: error.message,
            status: apiStatus 
        });
    }
});

// Endpoint para reiniciar la API
app.post('/api/restart', async (req, res) => {
    try {
        // Detener si está corriendo
        if (apiProcess && !apiProcess.killed) {
            apiProcess.kill('SIGTERM');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Iniciar de nuevo
        const startResponse = await fetch('http://localhost:3002/api/start', {
            method: 'POST'
        });
        
        const result = await startResponse.json();
        
        res.json({ 
            message: 'API reiniciada correctamente',
            status: result.status 
        });

    } catch (error) {
        apiStatus.errors.push(error.message);
        res.status(500).json({ 
            error: error.message,
            status: apiStatus 
        });
    }
});

// Función auxiliar para verificar si un puerto está en uso
function checkPort(port) {
    return new Promise((resolve) => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
            resolve(!!stdout.trim());
        });
    });
}

// Verificar estado inicial
checkPort(apiStatus.port).then(inUse => {
    if (inUse) {
        apiStatus.running = true;
        console.log(`API ya está corriendo en puerto ${apiStatus.port}`);
    }
});

const PORT = process.env.CONTROL_PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servidor de control de API corriendo en puerto ${PORT}`);
});

// Manejar cierre graceful
process.on('SIGINT', () => {
    if (apiProcess && !apiProcess.killed) {
        console.log('Deteniendo API...');
        apiProcess.kill('SIGTERM');
    }
    process.exit(0);
});