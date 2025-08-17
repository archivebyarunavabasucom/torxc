import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    let magnet = "not found";
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith("magnet:")) {
        magnet = href;
        return false; // break
      }
    });

    return NextResponse.json({ url, magnet });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}
