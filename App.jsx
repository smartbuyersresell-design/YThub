import { useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const initialLogs = [{ id: 1, type: "info", text: "YThub is ready." }];
const ffmpeg = new FFmpeg();

export default function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [quality, setQuality] = useState("720p");
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("mp3");
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const audioUrlRef = useRef(null);

  const stats = useMemo(
    () => [
      { label: "App", value: "YThub" },
      { label: "Host", value: "GitHub Pages" },
      { label: "Mode", value: "Client-side" }
    ],
    []
  );

  const addLog = (type, text) => {
    setLogs((prev) => [{ id: Date.now(), type, text }, ...prev].slice(0, 6));
  };

  const loadFFmpeg = async () => {
    if (ffmpegReady) return;
    setLoading(true);
    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm")
      });
      setFfmpegReady(true);
      addLog("success", "FFmpeg loaded successfully.");
    } catch {
      addLog("error", "Failed to load FFmpeg.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!youtubeUrl.trim()) return addLog("error", "Paste a YouTube URL first.");
    addLog("info", `Download UI action prepared for ${quality}.`);
    addLog("error", "No backend API is connected. This button is UI only.");
  };

  const handleConvert = async () => {
    if (!file) return addLog("error", "Choose an MP4 file first.");
    try {
      await loadFFmpeg();
      setLoading(true);
      const inputName = file.name || "input.mp4";
      const outputName = `output.${format}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(["-i", inputName, "-vn", "-codec:a", format === "mp3" ? "libmp3lame" : "aac", outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: format === "mp3" ? "audio/mpeg" : "audio/mp4" });
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = audioUrlRef.current;
      a.download = outputName;
      a.click();
      addLog("success", `Converted and downloaded ${outputName}.`);
    } catch {
      addLog("error", "Conversion failed.");
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
        <button className="ghost-btn" onClick={() => addLog("info", "System check complete.")}>Check</button>
      </header>
      <main className="grid">
        <section className="card hero">
          <p className="eyebrow">Smart Buye</p>
          <h2>Upload-ready frontend</h2>
          <p className="lead">This static UI is ready for GitHub Pages. MP4 to MP3 conversion works in the browser with FFmpeg WASM. YouTube download remains a UI placeholder because it needs a backend.</p>
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
            <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </label>
          <label className="field">
            <span>Quality</span>
            <select value={quality} onChange={(e) => setQuality(e.target.value)}>
              <option>360p</option>
              <option>720p</option>
              <option>1080p</option>
            </select>
          </label>
          <button className="primary-btn" onClick={handleDownload} disabled={loading}>Start Download</button>
        </section>
        <section className="card">
          <h3>MP4 to MP3 Converter</h3>
          <label className="field">
            <span>MP4 File</span>
            <input type="file" accept="video/mp4,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <label className="field">
            <span>Output Format</span>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="mp3">MP3</option>
              <option value="m4a">M4A</option>
            </select>
          </label>
          <button className="primary-btn" onClick={handleConvert} disabled={loading}>
            {loading ? "Working..." : ffmpegReady ? "Convert & Download" : "Load Converter"}
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
