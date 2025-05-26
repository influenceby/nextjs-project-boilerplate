"use client";

import React from "react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to netdisk.in</h1>
      <p className="text-lg max-w-xl text-center">
        SaaS Application for Digital Storage with AWS S3 Integration.
      </p>
      <p className="mt-4 text-center max-w-xl">
        Features include company storage purchase, user invitations, file search,
        admin access, chat with PDF support, and secure link sharing.
      </p>
    </main>
  );
}
