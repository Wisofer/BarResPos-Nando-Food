import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Directorio raíz de producción
const DIST_PATH = path.join(__dirname, '../dist')
const PUBLIC_PATH = app.isPackaged ? DIST_PATH : path.join(__dirname, '../public')

let win = null

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

  // Oculta la barra de menú predeterminada (File, Edit, View, Window) para una vista nativa limpia
  win.setMenuBarVisibility(false)

  // Maximiza la ventana automáticamente para ocupar toda la pantalla
  win.maximize()

  // Configura el factor de zoom predeterminado al 110% (1.1)
  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomFactor(1.1)
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

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
