export type ChannelCandidate = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  provider: "youtube" | "yt-dlp";
  disclaimer: string;
};

const disclaimer =
  "Public example for territory exploration—not an endorsement, availability check, safety review, or final recommendation.";

export function isYouTubeQuotaFailure(status: number, body: unknown) {
  const text = JSON.stringify(body).toLowerCase();
  return status === 403 && /quotaexceeded|dailylimitexceeded|quota/.test(text);
}

export function normalizeYouTubeSearch(body: unknown): ChannelCandidate[] {
  const data = body as {
    items?: Array<{
      id?: { channelId?: string };
      snippet?: {
        channelId?: string;
        channelTitle?: string;
        title?: string;
        description?: string;
        thumbnails?: { medium?: { url?: string } };
      };
    }>;
  };
  return (data.items ?? []).flatMap((item) => {
    const id = item.id?.channelId ?? item.snippet?.channelId;
    if (!id) return [];
    return [
      {
        id,
        title: item.snippet?.channelTitle ?? item.snippet?.title ?? "YouTube channel",
        description: item.snippet?.description ?? "",
        url: `https://www.youtube.com/channel/${id}`,
        ...(item.snippet?.thumbnails?.medium?.url
          ? { thumbnailUrl: item.snippet.thumbnails.medium.url }
          : {}),
        provider: "youtube" as const,
        disclaimer,
      },
    ];
  });
}

export function normalizeYtDlpSearch(body: unknown): ChannelCandidate[] {
  const data = body as {
    channels?: Array<{
      id?: string;
      title?: string;
      description?: string;
      url?: string;
      thumbnail_url?: string;
    }>;
  };
  return (data.channels ?? []).flatMap((item) =>
    item.id && item.url
      ? [
          {
            id: item.id,
            title: item.title ?? "YouTube channel",
            description: item.description ?? "",
            url: item.url,
            ...(item.thumbnail_url ? { thumbnailUrl: item.thumbnail_url } : {}),
            provider: "yt-dlp" as const,
            disclaimer,
          },
        ]
      : [],
  );
}

export async function exploreChannels(
  query: string,
  env: { YOUTUBE_API_KEY?: string; YTDLP_SERVICE_URL?: string; YTDLP_SHARED_SECRET?: string },
): Promise<{ channels: ChannelCandidate[]; unavailable?: boolean }> {
  if (env.YOUTUBE_API_KEY) {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.search = new URLSearchParams({
      part: "snippet",
      type: "channel",
      maxResults: "5",
      q: query,
      key: env.YOUTUBE_API_KEY,
    }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    const body = await response.json().catch(() => ({}));
    if (response.ok) return { channels: normalizeYouTubeSearch(body) };
    if (!isYouTubeQuotaFailure(response.status, body))
      console.warn(JSON.stringify({ event: "youtube_search_failed", status: response.status }));
  }
  if (env.YTDLP_SERVICE_URL && env.YTDLP_SHARED_SECRET) {
    const response = await fetch(`${env.YTDLP_SERVICE_URL.replace(/\/$/, "")}/v1/search`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.YTDLP_SHARED_SECRET}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ query, limit: 5 }),
      signal: AbortSignal.timeout(15_000),
    });
    if (response.ok) return { channels: normalizeYtDlpSearch(await response.json()) };
  }
  return { channels: [], unavailable: true };
}
