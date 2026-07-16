# Optional YouTube fallback deployment

The core report does not depend on YouTube. The official YouTube Data API is always primary and search happens only after a user clicks Explore.

The fallback container returns public metadata only and never downloads media. Deploy `services/youtube-fallback` to Cloud Run with minimum instances 0, maximum instances 1–2, 1 vCPU, 512 MiB memory, a short request timeout, and budget alerts. Set a long random `YTDLP_SHARED_SECRET` in Cloud Run and the Worker. Set `YTDLP_SERVICE_URL` to the HTTPS service root. Confirm `/health` returns `downloads_enabled: false`.

