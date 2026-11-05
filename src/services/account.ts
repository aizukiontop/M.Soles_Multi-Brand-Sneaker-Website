import { api } from './api'

export type Profile = { id: string; email: string; fullName: string; phone: string; avatarUrl: string | null; isAdmin: boolean }
export type Address = {
  id: number; recipientName: string; phone: string; addressLine: string
  city: string; province: string; postalCode: string; isDefault: boolean
}
export type AddressInput = Omit<Address, 'id'>

export const getProfile = () => api<Profile>('/me')
export const updateProfile = (data: { fullName: string; phone: string }) => api<Profile>('/me', { method: 'PUT', json: data })

export const uploadAvatar = (file: File) =>
  api<{ avatarUrl: string }>('/me/avatar', { method: 'POST', body: file, headers: { 'content-type': file.type } })
export const removeAvatar = () => api<{ avatarUrl: null }>('/me/avatar', { method: 'DELETE' })

export const listAddresses = () => api<{ items: Address[] }>('/addresses').then((r) => r.items)
export const createAddress = (data: AddressInput) => api<{ item: Address }>('/addresses', { method: 'POST', json: data })
export const updateAddress = (id: number, data: AddressInput) => api<{ item: Address }>(`/addresses/${id}`, { method: 'PUT', json: data })
export const deleteAddress = (id: number) => api(`/addresses/${id}`, { method: 'DELETE' })
