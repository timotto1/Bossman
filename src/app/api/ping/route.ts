// For App Router:
export async function GET() {
  try {
    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "App is healthy",
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
