import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { companyId, email } = req.body;

  if (!companyId || !email) {
    return res.status(400).json({ message: "Missing companyId or email" });
  }

  try {
    // Check if email domain matches company domain
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const emailDomain = email.split("@")[1];
    if (emailDomain !== company.domain) {
      return res.status(400).json({ message: "Email domain does not match company domain" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user with default role USER
    const newUser = await prisma.user.create({
      data: {
        email,
        companyId,
        role: "USER",
      },
    });

    // TODO: Send invitation email to user

    return res.status(201).json({ message: "User invited successfully", user: newUser });
  } catch (error) {
    console.error("Error inviting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
