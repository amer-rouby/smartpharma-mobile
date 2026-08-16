export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  // Present only when the account has 2FA enabled and password auth just succeeded -
  // every field below is absent in that case, and completeTwoFactorLogin() must be
  // called next with twoFactorTempToken + a code to actually get a session.
  twoFactorRequired?: boolean;
  twoFactorTempToken?: string;

  userId: number;
  username: string;
  fullName: string;
  role: string;
  pharmacyId: number;
  pharmacyName: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
  sessionTimeout: number;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}
