import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const perpage = searchParams.get("perpage") || "5";

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const url = `https://www.aparat.com/etc/api/videoBySearch/text/${encodeURIComponent(query)}/perpage/${perpage}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Virgool-App/1.0" },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
