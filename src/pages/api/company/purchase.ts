import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { companyId, storageGB } = req.body;

  if (!companyId || !storageGB) {
    return res.status(400).json({ message: "Missing companyId or storageGB" });
  }

  if (storageGB < 100) {
    return res.status(400).json({ message: "Minimum purchase is 100 GB" });
  }

  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { storageGB },
    });

    // TODO: Implement payment processing at INR 1 per GB

    return res.status(200).json({ message: "Storage purchased successfully", company });
  } catch (error) {
    console.error("Error purchasing storage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
