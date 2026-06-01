import { api } from './client'

export const fetchSettings = ()                        => api.get('/settings')
export const saveSettings  = (defaultLowStockThreshold) => api.put('/settings', { defaultLowStockThreshold })
