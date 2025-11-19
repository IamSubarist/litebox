import { useEffect, useState } from "react";

const API_KEY = "AIzaSyBCU1vaDrk1942xYZyH_nFAV0ChzVdh15c";
const HANDLE = "@I_am_Kramer"; // только имя, без @

export default function TestYoutube() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Поиск канала по хендлу
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${HANDLE}&key=${API_KEY}&maxResults=1`
        );
        const searchJson = await searchRes.json();
        const channel = searchJson.items?.[0];
        if (!channel) throw new Error("Channel not found");

        const channelId = channel.snippet.channelId;

        // 2. Получаем данные о канале
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings&id=${channelId}&key=${API_KEY}`
        );
        const channelJson = await channelRes.json();
        const item = channelJson.items?.[0];
        if (!item) throw new Error("Channel information not found");

        const title = item.snippet.title;
        const avatar = item.snippet.thumbnails.high.url;
        const banner =
          item.brandingSettings.image?.bannerExternalUrl ||
          item.brandingSettings.image?.bannerImageUrl;
        const description = item.snippet.description;
        setInfo({ title, avatar, banner, channelId, description });
      } catch (err) {
        setError(err.message);
      }
    }

    fetchData();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!info) return <p>Loading...</p>;

  return (
    <div style={{ textAlign: "center", maxWidth: "1100px" }}>
      <h2>{info.title}</h2>
      <p style={{ textAlign: "left", maxWidth: "800px" }}>{info.description}</p>
      {info.banner && (
        <img
          src={info.banner}
          alt="Channel banner"
          style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}
        />
      )}
      <img
        src={info.avatar}
        alt="Channel avatar"
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          marginTop: -60,
          border: "4px solid white",
        }}
      />
      <p>
        <a
          href={`https://www.youtube.com/channel/${info.channelId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to channel
        </a>
      </p>
    </div>
  );
}
