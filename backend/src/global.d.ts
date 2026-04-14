/// <reference types="express" />
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      tenantId?: string;
    }
  }
}

export {};