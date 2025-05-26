import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, query } = req.query;

  if (!userId || !query) {
    return res.status(400).json({ message: "Missing userId or query" });
  }

  try {
    const files = await prisma.file.findMany({
      where: {
        userId: Number(userId),
        fileName: {
          contains: String(query),
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ files });
  } catch (error) {
    console.error("Error searching files:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
