import React, { useEffect, useState, useMemo } from "react";
import useWidth from "@/hooks/useWidth";
import LeftCol from "@/components/widgets/leftColWidget";
import SortableBlock from "@/components/widgets/SortableBlock";
import profil from "@/assets/images/logo/profil.webp";
import { getContentUrl } from "./api";

const PreviewPage = () => {
  const [data, setData] = useState(null);
  const { width, breakpoints } = useWidth();
  const isSmallScreen = width < breakpoints.xl;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backgroundObjectUrl, setBackgroundObjectUrl] = useState(null);

  useEffect(() => {
    // Показываем модалку только если adult контент включен (adult === true)
    if (data?.adult === true) {
      // Проверяем, было ли уже подтверждение в этой сессии
      const isConfirmed = localStorage.getItem("isAdultConfirmed");
      if (!isConfirmed) {
        // Показываем модалку только если подтверждения еще не было
        setIsModalOpen(true);
      } else {
        // Если подтверждение уже есть, не показываем модалку
        setIsModalOpen(false);
      }
    } else {
      // Если adult выключен, закрываем модалку и очищаем подтверждение
      setIsModalOpen(false);
      localStorage.removeItem("isAdultConfirmed");
    }
  }, [data]);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem("projectPreviewData");
      if (stored) {
        setData(JSON.parse(stored));
      }
    };

    loadData();
    window.addEventListener("storage", loadData);

    return () => window.removeEventListener("storage", loadData);
  }, []);

  // Ищем блок с background (берем последний, так как он самый актуальный)
  // Вычисляем это ДО условного return, чтобы использовать в хуках
  const backgroundBlocks =
    data?.projectBlocks?.filter((block) => block.type === "background") || [];
  const backgroundBlock =
    backgroundBlocks.length > 0
      ? backgroundBlocks[backgroundBlocks.length - 1]
      : null;
  const backgroundData = backgroundBlock?.data?.background || {
    color: "#131517",
    image: "",
    blur: 0,
  };

  // Преобразуем image URL если это content_path или строка
  // Если это File объект, создаем object URL (но в preview обычно не должно быть File объектов)
  useEffect(() => {
    // Создаем object URL для File объекта
    if (backgroundData.image instanceof File) {
      if (!backgroundObjectUrl) {
        const objectUrl = URL.createObjectURL(backgroundData.image);
        setBackgroundObjectUrl(objectUrl);
      }
    } else {
      // Очищаем object URL если изображение больше не File объект
      if (backgroundObjectUrl) {
        URL.revokeObjectURL(backgroundObjectUrl);
        setBackgroundObjectUrl(null);
      }
    }
  }, [backgroundData.image, backgroundObjectUrl]);

  // Очищаем object URL при размонтировании
  useEffect(() => {
    return () => {
      if (backgroundObjectUrl) {
        URL.revokeObjectURL(backgroundObjectUrl);
      }
    };
  }, [backgroundObjectUrl]);

  const backgroundImageUrl = useMemo(() => {
    if (!backgroundData.image) return "";

    if (backgroundData.image instanceof File) {
      // Если это File объект, используем object URL
      return backgroundObjectUrl || "";
    } else if (typeof backgroundData.image === "string") {
      // Если это строка, используем getContentUrl для преобразования content_path в полный URL
      return getContentUrl(backgroundData.image) || backgroundData.image;
    }

    return "";
  }, [backgroundData.image, backgroundObjectUrl]);

  const background = {
    ...backgroundData,
    image: backgroundImageUrl,
  };

  const handleChoice = (isAdult) => {
    localStorage.setItem("isAdultConfirmed", isAdult ? "true" : "false");
    setIsModalOpen(false);
    if (!isAdult) {
      // Если нет редирект
      window.location.href = "https://google.com";
    } else {
      // Если подтвердили, очищаем флаг при следующем открытии превью
      // (чтобы модалка снова показывалась при следующем открытии, если adult включен)
      // Но не очищаем сразу, чтобы модалка не показывалась повторно в этой сессии
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 bg-[#131517]">
        <p>No data for preview</p>
      </div>
    );
  }

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-lg">
          <div className="relative w-[320px] sm:w-[400px] bg-[#1e1f22] text-white rounded-2xl p-6 shadow-2xl text-center border border-white/10">
            <h2 className="text-xl font-semibold mb-3 text-white">
              Are you already 18 years old?
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              To continue, please confirm that you are 18 years old.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleChoice(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-[6px] font-medium transition"
              >
                No
              </button>
              <button
                onClick={() => handleChoice(true)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-[6px] font-medium transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat scale-105"
          style={{
            backgroundColor:
              background.color &&
              background.color !== "transparent" &&
              background.color !== "#131517"
                ? background.color
                : background.color === "transparent" && !background.image
                ? "#131517"
                : undefined,
            backgroundImage: background.image
              ? `url(${background.image})`
              : "none",
            filter: `blur(${background.blur || 0}px)`,
          }}
        ></div>

        {/* Основной контент поверх */}
        <div
          className={`relative z-10 min-h-screen ${
            isSmallScreen ? "flex flex-col" : "flex"
          }`}
        >
          <div
            className={`xl:w-[70%] w-[100%] mx-auto bg-[#131517] ${
              isSmallScreen ? "flex flex-col" : "flex pt-14"
            }`}
          >
            <div
              className={`${
                isSmallScreen ? "w-full order-1" : "w-[500px] order-1"
              }`}
            >
              <LeftCol
                redactor={false}
                circle={data.circle}
                profil={profil}
                profileData={
                  data.profileData || {
                    photoUrl: profil,
                    name: "Name",
                    text: "Text under name",
                  }
                }
                hasVideoWidget={data.hasVideoWidget || false}
                videoData={
                  data.videoData || { videoUrl: null, thumbnail: null }
                }
                hasSocialLinkWidget={data.hasSocialLinkWidget || false}
                socialLinkData={data.socialLinkData || { socialLinks: [] }}
                hasButtonWidget={data.hasButtonWidget || false}
                buttonData={data.buttonData || { buttons: [] }}
              />
            </div>

            <div
              className={`${
                isSmallScreen ? "w-full order-2" : "flex-1 order-2"
              }`}
            >
              <div
                className={`min-h-[100vh] ${
                  isSmallScreen
                    ? "px-4"
                    : data.circle == true
                    ? "ps-[50px] pe-[100px]"
                    : "px-[20px]"
                }`}
              >
                {data.projectBlocks && data.projectBlocks.length > 0 ? (
                  data.projectBlocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      redactor={false}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-slate-400">
                    <p>Empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreviewPage;
