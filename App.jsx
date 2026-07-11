import { useMemo, useState } from "react";

const API_BASE = "https://YOUR_API_DOMAIN_OR_SERVERLESS_ENDPOINT";

const initialLogs = [
  { id: 1, type: "info", text: "YThub is ready." }
];

export default function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [quality, setQuality] = useState("720p");
  const [fileName, setFileName] = useState("");
  const [format, setFormat] = useState("mp3");
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(
    () => [
      { label: "App", value: "YThub" },
      { label: "Host", value: "GitHub Pages" },
      { label: "Mode", value: "API-ready" }
    ],
    []
  );

  const addLog = (type, text) => {
    setLogs((prev) => [{ id: Date.now(), type, text }, ...prev].slice(0, 6));
  };

  const handleDownload = async () => {
    if (!youtubeUrl.trim()) return addLog("error", "Paste a YouTube URL first.");
    setLoading(true);
    try {
      addLog("info", `Sending download request for ${quality}.`);
      const res = await fetch(`${API_BASE}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl, quality })
      });
      if (!res.ok) throw new Error("Download API failed");
      addLog("success", "Download request submitted.");
    } catch {
      addLog("error", "API not connected yet. Add your backend endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!fileName.trim()) return addLog("error", "Choose an MP4 file name first.");
    setLoading(true);
    try {
      addLog("info", `Sending convert request as ${format.toUpperCase()}.`);
      const res = await fetch(`${API_BASE}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, format })
      });
      if (!res.ok) throw new Error("Convert API failed");
      addLog("success", "Convert request submitted.");
    } catch {
      addLog("error", "API not connected yet. Add your backend endpoint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="bg-blur bg-one" />
      <div className="bg-blur bg-two" />

      <header className="topbar">
        <div>
          <p className="brand">YThub</p>
          <h1>Download and convert media with a clean UI</h1>
        </div>
        <button className="ghost-btn" onClick={() => addLog("info", "System check complete.")}>
          Check
        </button>
      </header>

      <main className="grid">
        <section className="card hero">
          <p className="eyebrow">Upload-ready frontend</p>
          <h2>GitHub Pages friendly, API connected later</h2>
          <p className="lead">
            This app is built as a static frontend for GitHub Pages. Replace the API base URL with your own backend or serverless service.
          </p>

          <div className="stats">
            {stats.map((item) => (
              <div className="stat" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3>YouTube Downloader</h3>
          <label className="field">
            <span>YouTube URL</span>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>

          <label className="field">
            <span>Quality</span>
            <select value={quality} onChange={(e) => setQuality(e.target.value)}>
              <option>360p</option>
              <option>720p</option>
              <option>1080p</option>
            </select>
          </label>

          <button className="primary-btn" onClick={handleDownload} disabled={loading}>
            {loading ? "Working..." : "Start Download"}
          </button>
        </section>

        <section className="card">
          <h3>MP4 to MP3 Converter</h3>
          <label className="field">
            <span>MP4 File Name</span>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="example-video.mp4"
            />
          </label>

          <label className="field">
            <span>Output Format</span>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="mp3">MP3</option>
              <option value="m4a">M4A</option>
              <option value="wav">WAV</option>
            </select>
          </label>

          <button className="primary-btn" onClick={handleConvert} disabled={loading}>
            {loading ? "Working..." : "Start Convert"}
          </button>
        </section>

        <section className="card wide">
          <h3>Activity</h3>
          <div className="log-list">
            {logs.map((log) => (
              <div className={`log ${log.type}`} key={log.id}>
                <span>{log.type.toUpperCase()}</span>
                <p>{log.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
