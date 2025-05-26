import type { NextApiRequest, NextApiResponse } from "next";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/aws";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

console.log("Prisma client keys:", Object.keys(prisma));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fileId, userId } = req.query;

  if (!fileId || !userId) {
    return res.status(400).json({ message: "Missing fileId or userId" });
  }

  try {
    const file = await prisma.file.findUnique({
      where: { id: Number(fileId) },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.userId !== Number(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json({ message: "S3 bucket name not configured" });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: file.s3Key,
    });

    const data = await s3Client.send(command);

    if (!data.Body) {
      return res.status(404).json({ message: "File data not found" });
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of data.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"`);
    res.setHeader("Content-Type", data.ContentType || "application/octet-stream");
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading file:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
