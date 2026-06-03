import { app, BrowserWindow, shell, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Directorio raíz de producción
const DIST_PATH = path.join(__dirname, '../dist')
const PUBLIC_PATH = app.isPackaged ? DIST_PATH : path.join(__dirname, '../public')

let win = null
let backendProcess = null

// Configuración de un archivo de log robusto en la carpeta de usuario para depuración
const logPath = path.join(os.homedir(), 'barrespos-launch.log')

function writeLog(message) {
  try {
    const timestamp = new Date().toISOString()
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`)
  } catch (e) {
    console.error('No se pudo escribir en el log:', e)
  }
}

function startBackend() {
  const backendBinName = 'BarRestPOS.exe'
  let backendPath = ''

  if (app.isPackaged) {
    // En producción (dentro de los recursos empaquetados de Electron)
    backendPath = path.join(process.resourcesPath, 'backend', backendBinName)
  } else {
    // En desarrollo, apunta a la carpeta del proyecto backend hermano en Music
    backendPath = path.join(__dirname, '../../BarResPos-Nando-Food-Backend/bin/Debug/net9.0', backendBinName)
  }

  writeLog('=== INICIANDO BACKEND LOCAL ===')
  writeLog(`Ruta del ejecutable: ${backendPath}`)
  writeLog(`¿El archivo ejecutable existe?: ${fs.existsSync(backendPath)}`)

  try {
    const backendDir = path.dirname(backendPath)
    writeLog(`Directorio de trabajo (CWD): ${backendDir}`)

    backendProcess = spawn(backendPath, ['--urls', 'http://localhost:5000'], {
      cwd: backendDir,
      windowsHide: true
    })

    backendProcess.stdout.on('data', (data) => {
      writeLog(`[BACKEND STDOUT]: ${data.toString().trim()}`)
    })

    backendProcess.stderr.on('data', (data) => {
      writeLog(`[BACKEND STDERR]: ${data.toString().trim()}`)
    })

    backendProcess.on('error', (err) => {
      writeLog(`[BACKEND ERROR]: ${err.message}`)
    })

    backendProcess.on('exit', (code, signal) => {
      writeLog(`[BACKEND EXIT]: El proceso del backend terminó con código ${code} y señal ${signal}`)
    })
  } catch (err) {
    writeLog(`[EXCEPCIÓN AL LANZAR]: ${err.message}`)
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'BarResPos',
    icon: path.join(PUBLIC_PATH, 'assets/images/barrespos.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Configura un User-Agent moderno para evitar problemas con WhatsApp Web
  win.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')

  // Oculta la barra de menú predeterminada (File, Edit, View, Window) para una vista nativa limpia
  win.setMenuBarVisibility(false)

  // Maximiza la ventana automáticamente para ocupar toda la pantalla
  win.maximize()

  // Configura el factor de zoom predeterminado al 100% (1.0)
  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomFactor(1.0)
  })

  // Captura y gestiona los atajos de teclado para Zoom de manera manual
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.control) {
      if (input.key === '=' || input.key === '+' || input.key === 'NumpadAdd') {
        const currentZoom = win.webContents.getZoomFactor()
        win.webContents.setZoomFactor(Math.min(1.5, currentZoom + 0.05)) // Máximo 150%
        event.preventDefault()
      } else if (input.key === '-' || input.key === 'NumpadSubtract') {
        const currentZoom = win.webContents.getZoomFactor()
        win.webContents.setZoomFactor(Math.max(0.8, currentZoom - 0.05)) // Mínimo 80%
        event.preventDefault()
      } else if (input.key === '0' || input.key === 'Numpad0') {
        win.webContents.setZoomFactor(1.1) // Restablecer al 110% por defecto
        event.preventDefault()
      }
    }
  })

  // Si está corriendo el servidor de desarrollo de Vite
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    // En producción, carga el index.html generado por Vite
    win.loadFile(path.join(DIST_PATH, 'index.html'))
  }
}

// Handler para abrir enlaces externos (como WhatsApp)
ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url)
})

app.whenReady().then(() => {
  startBackend()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('will-quit', () => {
  if (backendProcess) {
    console.log('Deteniendo backend local...')
    backendProcess.kill()
    backendProcess = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
