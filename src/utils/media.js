import { BACKEND_URL as BACKEND } from "./config";

export const mediaUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${BACKEND}${path}`;
};

// Works with watch?v=, youtu.be/, /embed/, /shorts/ and /live/ links
export function getYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^(www|m)\./, "");

    if (host === "youtu.be") return u.pathname.slice(1, 12) || null;

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
      return m ? m[1] : null;
    }
  } catch {
    // not a valid URL
  }
  return null;
}