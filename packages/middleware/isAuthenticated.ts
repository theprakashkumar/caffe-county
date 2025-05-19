import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];

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

    console.log("dc", decoded);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized! Invalid token." });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    req.user = user;

    if (!user) {
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
