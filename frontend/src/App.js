import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [wallet, setWallet] = useState(null);

  const BASE_URL = "http://localhost:5000";

  /* WALLET */
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWallet(accounts[0]);
  };

  /* FETCH VIDEOS */
  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/videos-list`);
      setVideos(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  /* TAGS */
  const generateTags = (name) => {
    return name
      .toLowerCase()
      .split(/[\s_.-]+/)
      .filter((w) => w.length > 2);
  };

  /* THUMBNAIL */
  const generateThumbnail = (file) => {
    return new Promise((resolve) => {
      const videoEl = document.createElement("video");
      videoEl.src = URL.createObjectURL(file);
      videoEl.currentTime = 1;

      videoEl.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  /* UPLOAD */
  const handleUpload = async () => {
    if (!video) return alert("Select file");

    try {
      const tags = generateTags(video.name);
      const thumbnail = await generateThumbnail(video);

      const formData = new FormData();
      formData.append("video", video);
      formData.append("tags", JSON.stringify(tags));
      formData.append("thumbnail", thumbnail);
      formData.append("owner", wallet);

      await axios.post(`${BASE_URL}/upload`, formData);

      setVideo(null);
      fetchVideos();
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  /* ✅ PLAY VIDEO (SIMPLE & FIXED) */
  const handlePlay = (vid) => {
    console.log("Playing:", vid.videoUrl);
    setCurrentVideo(vid.videoUrl);
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h2> Shelby Storage Platform</h2>

        <button style={styles.walletBtn} onClick={connectWallet}>
          {wallet
            ? `🟢 ${wallet.slice(0, 6)}...`
            : "🔌 Connect Wallet"}
        </button>
      </div>

      {/* UPLOAD */}
      <div style={styles.uploadBox}>
        <label style={styles.fileLabel}>
          {video ? video.name : "📂 Select Video"}
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            hidden
          />
        </label>

        <button onClick={handleUpload} style={styles.uploadBtn}>
          Upload
        </button>
      </div>

      {/* GRID */}
      <div style={styles.grid}>
        {videos.map((vid, i) => (
          <div
            key={i}
            style={styles.card}
            onClick={() => handlePlay(vid)}   // ✅ CLICK
          >
            <img src={vid.thumbnail} style={styles.thumb} alt="" />
            <h4>{vid.name || `Video ${i + 1}`}</h4>
          </div>
        ))}
      </div>

      {/* ✅ PLAYER */}
      {currentVideo && (
        <div style={styles.player}>
          <video
            key={currentVideo}   // 🔥 reload fix
            controls
            autoPlay
            width="500"
          >
            <source src={currentVideo} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}

/* STYLES */
const styles = {
  container: {
    background: "#020617",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Segoe UI",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  walletBtn: {
    background: "#22c55e",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },

  uploadBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  fileLabel: {
    background: "#1e293b",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  uploadBtn: {
    background: "#3b82f6",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,220px)",
    gap: "20px",
  },

  card: {
    background: "#1e293b",
    padding: "10px",
    borderRadius: "12px",
    cursor: "pointer",
  },

  thumb: {
    width: "100%",
    borderRadius: "8px",
  },

  player: {
    position: "fixed",
    bottom: 20,
    right: 20,
    background: "#020617",
    padding: "10px",
    borderRadius: "10px",
  },
};

export default App;