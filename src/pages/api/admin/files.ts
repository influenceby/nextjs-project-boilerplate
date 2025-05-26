import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { adminUserId } = req.query;

  if (!adminUserId) {
    return res.status(400).json({ message: "Missing adminUserId" });
  }

  try {
    // Verify user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: Number(adminUserId) },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all files for users in the admin's company
    const files = await prisma.file.findMany({
      where: {
        user: {
          companyId: adminUser.companyId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching admin files:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
