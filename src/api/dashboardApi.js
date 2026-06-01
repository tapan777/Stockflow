import { api } from './client'

export const fetchDashboardStats = () => api.get('/dashboard')
