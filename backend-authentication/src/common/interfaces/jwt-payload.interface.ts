export interface JwtPayload {
  sub: string;
  user_id: string;
  user_name: string;
  email: string;
  roles: string[];
  institutions: string[];
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  jti?: string;
}
