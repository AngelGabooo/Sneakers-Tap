// src/data/seed.js
import { hashPassword } from '../utils/password'

export function seedUsers() {
  const now = new Date().toISOString()
  return [
    {
      id: 'usr_seed_admin',
      employeeId: 'EMP-00001',
      fullName: 'Henry Sneakers',
      firstName: 'Henry',
      lastName: 'Sneakers',
      username: 'admin',
      email: 'admin@sneakers.com',
      phone: '+52 962 123 4567',
      password: hashPassword('admin123'),
      role: 'Administrador',
      branch: 'Tienda principal',
      department: 'Administración',
      status: 'active',
      lastAccess: null,
      lastAccessRelative: null,
      createdAt: now,
      createdBy: 'Sistema',
      updatedAt: now,
    },
  ]
}