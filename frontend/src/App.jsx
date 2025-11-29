import { useState } from "react";
import axios from "axios";
import { Github } from "lucide-react";

import "./App.css";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrlData, setShortUrlData] = useState("");

  const handleSubmit = () => {
    const endpoint = `${import.meta.env.VITE_BACKEND_BASE_URL}/api/short`;
    axios
      .post(endpoint, { originalUrl })
      .then((res) => {
        setShortUrlData(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error(err));
  };

  const handleDownloadImage = (e) => {
    e.preventDefault();
    const link = document.createElement("a");
    link.href = shortUrlData?.qrCodeImg;
    link.download = "qr-code.png";
    link.click();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-6">
      <a
        href="https://github.com/skylark101/URL-Shortener"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 text-gray-700 hover:text-black transition"
      >
        <Github size={26} />
      </a>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/40">
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
          URL Shortener
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            onChange={(e) => setOriginalUrl(e.target.value)}
            type="text"
            placeholder="Paste your long URL here..."
            value={originalUrl}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-4 focus:ring-indigo-300 focus:outline-none transition"
          />

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition shadow-lg active:scale-95"
          >
            Shorten URL
          </button>

          {shortUrlData && (
            <div className="mt-6 bg-white rounded-xl p-4 shadow-inner text-center">
              <p className="text-sm text-gray-500">Your Short URL</p>

              <a
                href={shortUrlData.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-indigo-600 font-medium underline break-all"
              >
                {shortUrlData.shortUrl}
              </a>

              <div className="mt-5 flex flex-col items-center gap-3">
                <img
                  src={shortUrlData.qrCodeImg}
                  alt="QR Code"
                  className="w-40 h-40 rounded-lg border bg-white shadow-md"
                />

                <button
                  onClick={handleDownloadImage}
                  className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition shadow-lg active:scale-95"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default App;
