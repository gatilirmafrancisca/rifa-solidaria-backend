import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const { verify } = jwt;

export interface AuthenticatedRequest extends Request {
  paymentId?: string;
}

export function requirePaymentToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Token ausente." });

  try {
    const payload = verify(token, process.env.JWT_SECRET!) as {
      paymentId: string;
    };
    req.paymentId = payload.paymentId;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
}