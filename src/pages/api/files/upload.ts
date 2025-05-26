import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/aws";
import prisma from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // For simplicity, assume file is sent as base64 in JSON body (in real app use multipart/form-data)
  const { fileName, fileContentBase64, userId } = req.body;

  if (!fileName || !fileContentBase64 || !userId) {
    return res.status(400).json({ message: "Missing fileName, fileContentBase64 or userId" });
  }

  try {
    const buffer = Buffer.from(fileContentBase64, "base64");

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json({ message: "S3 bucket name not configured" });
    }

    const key = `${userId}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
    });

    await s3Client.send(command);

    // Save file metadata in database
    await prisma.file.create({
      data: {
        userId,
        fileName,
        s3Key: key,
      },
    });

    return res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
