export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  role: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
}
