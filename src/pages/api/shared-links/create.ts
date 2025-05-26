import type { NextApiRequest, NextApiResponse } from "next";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fileId, expiresInHours } = req.body;

  if (!fileId || !expiresInHours) {
    return res.status(400).json({ message: "Missing fileId or expiresInHours" });
  }

  try {
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const token = nanoid(32);

    const sharedLink = await prisma.sharedLink.create({
      data: {
        fileId,
        token,
        expiresAt,
      },
    });

    return res.status(201).json({ sharedLink });
  } catch (error) {
    console.error("Error creating shared link:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
