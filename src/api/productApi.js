import { api } from './client'

export const fetchProducts      = (search)        => api.get(search ? `/products?search=${encodeURIComponent(search)}` : '/products')
export const fetchProductById   = (id)            => api.get(`/products/${id}`)
export const createProduct      = (data)          => api.post('/products', data)
export const updateProduct      = (id, data)      => api.put(`/products/${id}`, data)
export const deleteProduct      = (id)            => api.delete(`/products/${id}`)
export const adjustProductStock = (id, adjustment) => api.post(`/products/${id}/adjust`, { adjustment })
