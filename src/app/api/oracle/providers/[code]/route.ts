import { NextResponse } from "next/server";

const ORACLE_BASE_URL = process.env.ORACLE_API_BASE_URL || "https://api.oraclegames.live/api";
const ORACLE_API_KEY = process.env.ORACLE_API_KEY || "20afffdf-98c4-4de3-a16f-7d3f29cbd90e";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const response = await fetch(`${ORACLE_BASE_URL}/providers/${encodeURIComponent(code)}`, {
      headers: {
        "x-api-key": ORACLE_API_KEY,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to fetch provider details" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Oracle provider details proxy error" },
      { status: 500 }
    );
  }
}
