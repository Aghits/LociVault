import { NextResponse } from "next/server";
import { REDDIT_INSIDE_MPS_ROOMS, RoomItem } from "@/data/redditRooms";
import { getSafeImageUrl } from "@/lib/imageUtils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const pageStr = searchParams.get("page") || "1";
  const limitStr = searchParams.get("limit") || "50";

  const page = parseInt(pageStr, 10) || 1;
  const limit = parseInt(limitStr, 10) || 50;

  const liveRooms: RoomItem[] = [];

  // 1. Fetch live real-time updates from Reddit inside_mps and photo room subreddits
  try {
    const rssFeeds = [
      "https://www.reddit.com/user/cdozprime/m/inside_mps/.rss",
      "https://www.reddit.com/r/RoomPorn/.rss",
      "https://www.reddit.com/r/CozyPlaces/.rss",
    ];

    const targetRss = rssFeeds[0];
    const rssApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(targetRss)}`;

    const res = await fetch(rssApiUrl, {
      next: { revalidate: 300 }, // Auto-refresh every 5 mins
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === "ok" && Array.isArray(data.items)) {
        data.items.forEach(
          (
            item: {
              title?: string;
              thumbnail?: string;
              categories?: string[];
              guid?: string;
              description?: string;
            },
            idx: number
          ) => {
            let fullUrl = "";
            const thumb = item.thumbnail || "";

            // Only pick posts that actually have a real image attachment (skip text discussions)
            if (thumb && thumb.includes("preview.redd.it/")) {
              const match = thumb.match(
                /preview\.redd\.it\/([a-zA-Z0-9]+)\.(jpg|jpeg|png|webp)/i
              );
              if (match) {
                fullUrl = `https://i.redd.it/${match[1]}.${match[2]}`;
              }
            } else if (thumb && (thumb.includes("i.redd.it") || thumb.includes("i.imgur.com"))) {
              fullUrl = thumb;
            }

            if (fullUrl) {
              const sub = item.categories?.[0]
                ? `r/${item.categories[0]}`
                : "r/inside_mps";

              liveRooms.push({
                id: item.guid || `live-rss-${idx}`,
                title: item.title || "Reddit Interior",
                imageUrl: getSafeImageUrl(fullUrl),
                thumbUrl: getSafeImageUrl(thumb.replace(/&amp;/g, "&") || fullUrl),
                source: `Reddit (${sub})`,
                subreddit: sub,
              });
            }
          }
        );
      }
    }
  } catch (err) {
    console.error("Live RSS fetch error:", err);
  }

  // 2. Combine with verified static library of inside_mps rooms
  const combinedRooms: RoomItem[] = [...liveRooms];
  const seenUrls = new Set(liveRooms.map((r) => r.imageUrl));

  REDDIT_INSIDE_MPS_ROOMS.forEach((r) => {
    const safeImage = getSafeImageUrl(r.imageUrl);
    if (!seenUrls.has(safeImage)) {
      seenUrls.add(safeImage);
      combinedRooms.push({
        ...r,
        imageUrl: safeImage,
        thumbUrl: getSafeImageUrl(r.thumbUrl || r.imageUrl),
      });
    }
  });

  let filteredRooms = combinedRooms;

  // 3. Keyword filtering
  if (query && query.trim().length > 0) {
    const q = query.toLowerCase().trim();
    filteredRooms = combinedRooms.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.subreddit && r.subreddit.toLowerCase().includes(q))
    );
  }

  // 4. Pagination
  const startIndex = (page - 1) * limit;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < filteredRooms.length;

  return NextResponse.json({
    rooms: paginatedRooms,
    total: filteredRooms.length,
    page,
    hasMore,
    isLive: liveRooms.length > 0,
  });
}
