import os
import secrets
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from yt_dlp import YoutubeDL

app = FastAPI(title="CreatorCompass YouTube metadata fallback", docs_url=None, redoc_url=None)
pool = ThreadPoolExecutor(max_workers=2)
shared_secret = os.environ.get("YTDLP_SHARED_SECRET", "")

class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=180)
    limit: int = Field(default=5, ge=1, le=5)

class ChannelRequest(BaseModel):
    channel_ref: str = Field(min_length=3, max_length=300)

def authorize(authorization: Annotated[str | None, Header()] = None):
    expected = f"Bearer {shared_secret}"
    if not shared_secret or not authorization or not secrets.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")

def extract(target: str, playlist_end: int = 5):
    options = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "extract_flat": True,
        "playlistend": playlist_end,
        "socket_timeout": 8,
        "retries": 0,
        "js_runtimes": {"deno": {}},
    }
    with YoutubeDL(options) as ydl:
        return ydl.extract_info(target, download=False)

def run_bounded(target: str, playlist_end: int = 5):
    future = pool.submit(extract, target, playlist_end)
    try:
        return future.result(timeout=12)
    except TimeoutError as exc:
        future.cancel()
        raise HTTPException(status_code=504, detail="Metadata lookup timed out") from exc

@app.get("/health")
def health():
    return {"ok": True, "downloads_enabled": False}

@app.post("/v1/search", dependencies=[Depends(authorize)])
def search(request: SearchRequest):
    result = run_bounded(f"ytsearch{request.limit}:{request.query}", request.limit)
    seen = set()
    channels = []
    for item in result.get("entries") or []:
        channel_id = item.get("channel_id") or item.get("uploader_id")
        channel_url = item.get("channel_url") or item.get("uploader_url")
        if not channel_id or not channel_url or channel_id in seen:
            continue
        seen.add(channel_id)
        channels.append({"id": channel_id, "title": item.get("channel") or item.get("uploader"), "description": item.get("description") or "", "url": channel_url, "thumbnail_url": item.get("thumbnail")})
    return {"channels": channels[: request.limit]}

@app.post("/v1/channel", dependencies=[Depends(authorize)])
def channel(request: ChannelRequest):
    if not request.channel_ref.startswith(("https://www.youtube.com/", "https://youtube.com/")):
        raise HTTPException(status_code=400, detail="Only public YouTube channel URLs are supported")
    result = run_bounded(request.channel_ref, 3)
    return {"id": result.get("channel_id") or result.get("id"), "title": result.get("channel") or result.get("title"), "description": result.get("description") or "", "url": result.get("channel_url") or result.get("webpage_url")}

