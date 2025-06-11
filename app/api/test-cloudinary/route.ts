import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Test route to check Cloudinary configuration
export async function GET() {
  try {
    // Check if environment variables are set
    const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

    console.log("[CLOUDINARY_TEST] Environment variables:", {
      hasCloudName,
      hasApiKey,
      hasApiSecret,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY?.substring(0, 6) + "...",
    });

    if (!hasCloudName || !hasApiKey || !hasApiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Cloudinary environment variables",
          details: {
            hasCloudName,
            hasApiKey,
            hasApiSecret,
          },
        },
        { status: 500 }
      );
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test connection by getting account info
    const result = await cloudinary.api.resources({ max_results: 1 });

    return NextResponse.json({
      success: true,
      message: "Cloudinary connection successful",
      resourceCount: result.resources.length,
    });
  } catch (error) {
    console.error("[CLOUDINARY_TEST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to Cloudinary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
