const { contextBridge, ipcRenderer } = require('electron')

// Exponemos APIs del sistema seguras a la aplicación de React
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => {
    const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  onMessage: (channel, callback) => {
    const validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      const subscription = (event, ...args) => callback(...args)
      ipcRenderer.on(channel, subscription)
      return () => ipcRenderer.removeListener(channel, subscription)
    }
  },
  openExternal: (url) => {
    ipcRenderer.send('open-external', url)
  }
})
