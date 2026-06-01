import { api } from './client'

export const loginUser      = (email, password)                   => api.post('/auth/login',  { email, password })
export const signupUser     = (email, password, organizationName) => api.post('/auth/signup', { email, password, organizationName })
export const getCurrentUser = ()                                  => api.get('/auth/me')
export const logoutUser     = ()                                  => api.post('/auth/logout')
