import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/{cloud}/raw/upload/v{version}/{folder}/{filename}.pdf
    const match = url.match(/\/syntra-reports\/(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const publicId = `syntra-reports/${match[1].replace(".pdf", "")}`;

    // Generate signed URL valid for 60 seconds
    const signedUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 60,
    });

    const response = await fetch(signedUrl);

    if (!response.ok) {
      console.error("Cloudinary fetch failed:", response.status, await response.text());
      return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 });
    }

    const buffer = await response.arrayBuffer();
    console.log("Buffer size:", buffer.byteLength);
    console.log("Content-Type:", response.headers.get("content-type"));

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${publicId.split("/").pop()}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}