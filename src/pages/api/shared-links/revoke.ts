import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Missing or invalid token" });
  }

  try {
    const deleted = await prisma.sharedLink.deleteMany({
      where: { token },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Shared link not found" });
    }

    return res.status(200).json({ message: "Shared link revoked" });
  } catch (error) {
    console.error("Error revoking shared link:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
