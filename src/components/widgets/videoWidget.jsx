import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import useWidth from "@/hooks/useWidth";
import { getContentUrl } from "@/pages/app/projects/api";

const VideoWidget = ({ redactor, onEdit, videoUrl, thumbnail }) => {
  const [videoObjectUrl, setVideoObjectUrl] = useState(null);
  const [thumbnailObjectUrl, setThumbnailObjectUrl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { width, breakpoints } = useWidth();
  const isSmallScreen = width < breakpoints.xl;

  // Функция для получения URL видео (обрабатывает File объекты и строки)
  const getVideoUrlForPlayback = (video) => {
    if (!video) return null;
    if (video instanceof File) {
      // Если это File объект, используем object URL
      if (!videoObjectUrl) {
        const url = URL.createObjectURL(video);
        setVideoObjectUrl(url);
        return url;
      }
      return videoObjectUrl;
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof video === "string") {
      return getContentUrl(video);
    }
    return null;
  };

  // Функция для получения URL thumbnail (обрабатывает File объекты и строки)
  const getThumbnailUrlForDisplay = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail instanceof File) {
      // Если это File объект, используем object URL
      if (!thumbnailObjectUrl) {
        const url = URL.createObjectURL(thumbnail);
        setThumbnailObjectUrl(url);
        return url;
      }
      return thumbnailObjectUrl;
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof thumbnail === "string") {
      return getContentUrl(thumbnail);
    }
    return null;
  };

  // Очистка object URLs при размонтировании
  useEffect(() => {
    return () => {
      if (
        videoObjectUrl &&
        typeof videoObjectUrl === "string" &&
        videoObjectUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(videoObjectUrl);
      }
      if (
        thumbnailObjectUrl &&
        typeof thumbnailObjectUrl === "string" &&
        thumbnailObjectUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(thumbnailObjectUrl);
      }
    };
  }, []);

  // Создаем и очищаем object URLs при изменении данных
  useEffect(() => {
    // Очищаем старые URLs перед созданием новых
    if (
      videoObjectUrl &&
      typeof videoObjectUrl === "string" &&
      videoObjectUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(videoObjectUrl);
      setVideoObjectUrl(null);
    }
    if (
      thumbnailObjectUrl &&
      typeof thumbnailObjectUrl === "string" &&
      thumbnailObjectUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(thumbnailObjectUrl);
      setThumbnailObjectUrl(null);
    }
  }, [videoUrl, thumbnail]);

  const thumbnailUrl = getThumbnailUrlForDisplay(thumbnail);
  const videoUrlForPlayback = getVideoUrlForPlayback(videoUrl);

  // Если не режим редактирования и нет видео - не показывать виджет
  if (!redactor && !videoUrl) {
    return null;
  }

  return (
    <>
      {redactor ? (
        <>
          <Button
            onClick={() => redactor && onEdit?.()}
            className="rounded-full p-1 bg-transparent flex items-center justify-center"
          >
            {videoUrl && thumbnailUrl ? (
              // Показываем превью видео, если оно загружено
              <div className="rounded-full border-2 border-[#131517] flex items-center justify-center h-[80px] w-[80px] overflow-hidden">
                <img
                  src={thumbnailUrl}
                  alt="Video preview"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            ) : (
              // Показываем значок камеры, если видео не загружено
              <div className="rounded-full border-2 border-[#131517] flex items-center justify-center h-[80px] w-[80px]">
                <div className="bg-gray-600 rounded-full h-full w-full flex items-center justify-center text-[50px]">
                  <Icon icon="humbleicons:camera-video" />
                </div>
              </div>
            )}
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full p-1 bg-transparent flex items-center justify-center"
          >
            {thumbnailUrl ? (
              // Показываем превью видео с градиентной рамкой
              <div className="rounded-full p-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
                <div className="rounded-full border-2 border-[#131517] flex items-center justify-center h-[80px] w-[80px] overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt="Video preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            ) : (
              // Fallback на старый дизайн, если нет thumbnail
              <div className="rounded-full p-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
                <div className="rounded-full border-2 border-[#131517] flex items-center justify-center h-[80px] w-[80px]">
                  <div className="bg-gray-600 rounded-full h-full w-full flex items-center justify-center">
                    <span className="text-white text-[16px]">Watch</span>
                  </div>
                </div>
              </div>
            )}
          </Button>

          {isOpen &&
            typeof document !== "undefined" &&
            createPortal(
              isSmallScreen ? (
                <div
                  className="fixed inset-0 z-[99999] flex items-center justify-center w-full h-full"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className="relative w-[360px] h-[640px] rounded-[20px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <video
                      src={videoUrlForPlayback || ""}
                      controls
                      autoPlay
                      className="w-full h-full object-cover rounded-[20px]"
                    />
                    <button
                      className="absolute z-[99999] top-0 right-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-black text-2xl font-bold transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="fixed inset-0 z-[99999] flex items-center justify-center w-full h-full"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className="relative w-[320px] h-[640px] bg-black rounded-[20px] overflow-hidden shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <video
                      src={videoUrlForPlayback || ""}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-black font-bold"
                      onClick={() => setIsOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ),
              document.body
            )}
        </>
      )}
    </>
  );
};

export default VideoWidget;
