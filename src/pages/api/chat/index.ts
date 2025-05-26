import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/aws";
import prisma from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

import multiparty from "multiparty";
import { promisify } from "util";

const parseForm = promisify((req, callback) => {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    callback(err, { fields, files });
  });
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { fields, files } = await parseForm(req);

      const userId = fields.userId?.[0];
      const message = fields.message?.[0] || null;

      if (!userId) {
        return res.status(400).json({ message: "Missing userId" });
      }

      let pdfS3Key = null;

      if (files.pdf && files.pdf.length > 0) {
        const file = files.pdf[0];
        const fileContent = await fs.promises.readFile(file.path);
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        if (!bucketName) {
          return res.status(500).json({ message: "S3 bucket name not configured" });
        }
        const key = `chat-pdfs/${userId}/${Date.now()}-${file.originalFilename}`;

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: fileContent,
          ContentType: file.headers["content-type"],
        });

        await s3Client.send(command);
        pdfS3Key = key;
      }

      const chatMessage = await prisma.chatMessage.create({
        data: {
          userId: Number(userId),
          message,
          pdfS3Key,
        },
      });

      return res.status(201).json({ chatMessage });
    } catch (error) {
      console.error("Error posting chat message:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }
    try {
      const chatMessages = await prisma.chatMessage.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: "asc" },
      });
      return res.status(200).json({ chatMessages });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
