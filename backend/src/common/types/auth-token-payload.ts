import type { Request } from 'express';

export type AuthTokenPayload = {
  sub?: string;
  role?: string;
};

export type AdminRequest = Request & {
  admin?: AuthTokenPayload;
};
