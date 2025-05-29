import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.access_token ||
      req.cookies.seller_access_token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized, token missing.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: "user" | "seller";
    };

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized! Invalid token." });
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.user.findUnique({ where: { id: decoded.id } });
      req.user = account;
    } else {
      account = await prisma.seller.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      req.seller = account;
      req.user = account;
    }

    req.role = decoded.role;

    if (!account) {
      return res
        .status(401)
        .json({ message: "Unauthorized! Account not found!." });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default isAuthenticated;
