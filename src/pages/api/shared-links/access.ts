import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Missing or invalid token" });
  }

  try {
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { token },
      include: { file: true },
    });

    if (!sharedLink) {
      return res.status(404).json({ message: "Shared link not found" });
    }

    if (sharedLink.expiresAt < new Date()) {
      return res.status(410).json({ message: "Shared link expired" });
    }

    // Return file info or download URL (assuming S3 public URL or presigned URL generation)
    return res.status(200).json({
      fileName: sharedLink.file.fileName,
      s3Key: sharedLink.file.s3Key,
    });
  } catch (error) {
    console.error("Error accessing shared link:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
