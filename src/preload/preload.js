const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),

  // ── Future backend hooks (wire these up when ready) ──────────────────────
  // Members
  getMembers:    () => ipcRenderer.invoke('db:getMembers'),
  addMember:     (data) => ipcRenderer.invoke('db:addMember', data),
  updateMember:  (id, data) => ipcRenderer.invoke('db:updateMember', id, data),
  deleteMember:  (id) => ipcRenderer.invoke('db:deleteMember', id),

  // Billing
  getInvoices:   () => ipcRenderer.invoke('db:getInvoices'),
  addInvoice:    (data) => ipcRenderer.invoke('db:addInvoice', data),
  markPaid:      (id) => ipcRenderer.invoke('db:markPaid', id),

  // Reports
  getRevenueData: (range) => ipcRenderer.invoke('db:getRevenueData', range),
  getStats:       () => ipcRenderer.invoke('db:getStats'),
});
