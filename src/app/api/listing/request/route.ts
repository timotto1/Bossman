import { NextRequest, NextResponse } from "next/server";

import { sendEvent } from "@/utils/klaviyo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, email, properties } = body;
    await sendEvent(email, event, properties);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
