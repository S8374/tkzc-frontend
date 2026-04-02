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
      console.log("OraclePay payment completed:", {
        invoice_number: body.invoice_number,
        amount: body.amount,
        transaction_id: body.transaction_id,
        session_code: body.session_code,
        bank: body.bank,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Webhook received",
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