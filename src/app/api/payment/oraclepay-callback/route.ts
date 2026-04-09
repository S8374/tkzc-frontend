import { NextRequest, NextResponse } from "next/server";

interface OraclePayWebhookBody {
  status?: string;
  amount?: number;
  transaction_id?: string;
  invoice_number?: string;
  session_code?: string;
  bank?: string;
  footprint?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OraclePayWebhookBody;

    if (!body.invoice_number || !body.status) {
      return NextResponse.json(
        { success: false, message: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    if (body.status === "COMPLETED") {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const response = await fetch(`${backendUrl}/auto-deposits/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        
        if (!response.ok) {
          console.error("Failed to forward webhook to backend", await response.text());
        }
      } catch (err) {
        console.error("Error forwarding webhook to backend", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Webhook received and processed",
      invoice_number: body.invoice_number,
    });
  } catch (error) {
    console.error("OraclePay webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}