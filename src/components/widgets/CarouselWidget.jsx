import React, { useState, useEffect } from "react";
import Carousel from "@/components/ui/Carousel";
import { SwiperSlide } from "swiper/react";
import wbg5 from "@/assets/images/all-img/widget-bg-4.png";
import { getContentUrl } from "@/pages/app/projects/api";

const CarouselWidget = ({ data, onEdit }) => {
  const [imageUrls, setImageUrls] = useState({});

  // Функция для получения URL изображения (обрабатывает File объекты и строки)
  const getImageUrl = (image, slideId) => {
    if (!image) return null;
    if (image instanceof File) {
      // Если это File объект, используем object URL
      if (!imageUrls[slideId]) {
        const url = URL.createObjectURL(image);
        setImageUrls((prev) => ({ ...prev, [slideId]: url }));
        return url;
      }
      return imageUrls[slideId];
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof image === "string") {
      return getContentUrl(image);
    }
    return null;
  };

  // Очистка object URLs при размонтировании
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Очищаем старые object URLs при изменении изображений
  useEffect(() => {
    if (!data?.slides) return;

    const currentSlideIds = new Set(
      data.slides.map((slide, index) => slide.id || index)
    );
    
    // Удаляем object URLs для изображений, которые больше не используются
    setImageUrls((prev) => {
      const newUrls = { ...prev };
      let changed = false;
      
      Object.keys(newUrls).forEach((slideId) => {
        if (!currentSlideIds.has(slideId)) {
          const url = newUrls[slideId];
          if (url && typeof url === "string" && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
          delete newUrls[slideId];
          changed = true;
        }
      });
      
      return changed ? newUrls : prev;
    });
  }, [data?.slides]);
  if (!data || !data.slides || data.slides.length === 0) {
    return (
      <div
        className="relative rounded-[6px] overflow-hidden cursor-pointer group"
        onClick={onEdit}
      >
        <div className="single-slide bg-slate-800 rounded-md min-h-[300px] flex items-center justify-center text-white">
          <p className="text-slate-400">Empty carousel</p>
        </div>
      </div>
    );
  }

  const handleWidgetClick = (e) => {
    // Если клик по ссылке, не открываем редактор
    if (e.target.closest("a")) {
      return;
    }
    // Иначе открываем редактор
    e.preventDefault();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <div
      className="relative rounded-[6px] overflow-hidden cursor-pointer group"
      onClick={handleWidgetClick}
    >
      <Carousel pagination={true} navigation={true} className="main-caro">
        {data.slides.map((slide, index) => {
          const imageUrl = slide.image
            ? getImageUrl(slide.image, slide.id || index)
            : null;
          return (
            <SwiperSlide key={slide.id || index}>
              <div
                className="single-slide bg-no-repeat bg-cover bg-center rounded-md min-h-[300px] relative flex items-center"
                style={{
                  backgroundImage: imageUrl
                    ? `url(${imageUrl})`
                    : `url(${wbg5})`,
                }}
              >
                {slide.linkText && (
                  <a
                    href={slide.linkUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!slide.linkUrl) {
                        e.preventDefault();
                      }
                    }}
                    className="absolute top-4 left-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white text-sm hover:bg-white/30 transition-colors no-underline z-10"
                  >
                    {slide.linkText}
                  </a>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                  {slide.subtitle && (
                    <p className="text-sm text-white/80 mb-1">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.title && (
                    <h3 className="text-xl font-bold text-white">
                      {slide.title}
                    </h3>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Carousel>
    </div>
  );
};

export default CarouselWidget;
