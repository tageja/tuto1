export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UserClaims {
  role: 'school_admin' | 'tuto_admin' | 'teacher'
  schoolIds: string[]
  email: string
  uid: string
}

export interface AuthContext {
  user: UserClaims | null
  loading: boolean
  error: string | null
}


