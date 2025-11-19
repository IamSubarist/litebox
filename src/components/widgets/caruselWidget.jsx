import React from "react";
import Carousel from "@/components/ui/Carousel";
import { SwiperSlide } from "swiper/react";
import Card from "../../components/ui/Card";
import { Link } from "react-router-dom";
import { getContentUrl } from "@/pages/app/projects/api";

// import images
import c1 from "@/assets/images/all-img/c1.png";
import c2 from "@/assets/images/all-img/c2.png";
import c3 from "@/assets/images/all-img/c3.png";

const CaruselWidget = ({ card, data, onEdit, redactor }) => {
  // Функция для получения URL изображения (обрабатывает File объекты и строки)
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image instanceof File) {
      // Если это File объект, создаем object URL
      return URL.createObjectURL(image);
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof image === "string") {
      return getContentUrl(image);
    }
    return null;
  };

  // Используем данные из пропсов, если они переданы, иначе дефолтные
  const slidesData =
    data && data.slides && data.slides.length > 0
      ? data.slides.map((slide, index) => {
          const imageUrl = slide.image ? getImageUrl(slide.image) : null;
          return {
            id: slide.id || index + 1,
            title: slide.title || `Card Title ${index + 1}`,
            text: slide.subtitle || "Lorem ipsum dolor sit amet.",
            image: imageUrl || c1,
            link: slide.linkUrl || "/projects",
            linkText: slide.linkText || "Learn more",
          };
        })
      : [
          {
            id: 1,
            title: "Card Title 1",
            text: "Lorem ipsum dolor sit amet.",
            image: c1,
            link: "/projects",
            linkText: "Learn more",
          },
          {
            id: 2,
            title: "Card Title 2",
            text: "Sed ut perspiciatis unde.",
            image: c2,
            link: "/projects",
            linkText: "Learn more",
          },
          {
            id: 3,
            title: "Card Title 3",
            text: "At vero eos et accusamus et.",
            image: c3,
            link: "/projects",
            linkText: "Learn more",
          },
          {
            id: 4,
            title: "Card Title 4",
            text: "Et harum quidem rerum facilis.",
            image: c2,
            link: "/projects",
            linkText: "Learn more",
          },
          {
            id: 5,
            title: "Card Title 5",
            text: "Nam libero tempore, cum.",
            image: c3,
            link: "/projects",
            linkText: "Learn more",
          },
          {
            id: 6,
            title: "Card Title 6",
            text: "Temporibus autem quibusdam.",
            image: c2,
            link: "/projects",
            linkText: "Learn more",
          },
        ];

  // Настройки для карточного режима (Showcase)
  // Карточки должны занимать примерно 1/3 ширины, чтобы в ряд помещалось 3 карточки
  const cardCarouselSettings = {
    pagination: false,
    navigation: true,
    slidesPerView: 1, // Базовое значение для мобильных
    slidesPerGroup: 1,
    spaceBetween: 10,
    watchOverflow: true,
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 15,
      },
      768: {
        slidesPerView: 3, // На планшетах и десктопах показываем 3 карточки (~1/3 ширины каждая)
        spaceBetween: 20,
      },
    },
  };

const handleContainerClick = (e) => {
  if (
    e.target.closest(".swiper-button-next") ||
    e.target.closest(".swiper-button-prev") ||
    e.target.closest(".swiper-pagination")
  ) {
    return;
  }

  if (!redactor) return;

  if (e.target.closest("a")) {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.();
    return;
  }

  e.stopPropagation();
  onEdit?.();
};

  return (
    <div
      className="grid grid-cols-1 relative group cursor-pointer"
      onClick={handleContainerClick}
    >
      {card ? (
        <div className="w-full overflow-hidden">
          <Carousel 
            pagination={false}
            navigation={true}
            slidesPerView="auto"
            spaceBetween={20}
            centeredSlides={false}
            watchOverflow={true}
            style={{ overflow: "visible" }}>
            {slidesData.map((slide) => (
              <SwiperSlide
                key={slide.id}
                style={{
                  width: "clamp(240px, 30vw, 400px)", // адаптивная ширина карточки
                }}
              >
                <a href={slide.link}>
                <Card bodyClass="p-0 h-full">
                  <div className="h-[140px] w-full">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="block w-full h-full object-cover rounded-t-md"
                    />
                  </div>
                  <div className="p-6">
                    <header className="mb-2">
                      <div className="card-title text-white">{slide.title}</div>
                    </header>
                    <div className="text-[12px]">{slide.text}</div>
                    <div className="mt-6 space-x-4 rtl:space-x-reverse">
                      <Link to={slide.link} className="text-[12px]">
                        {slide.linkText || "Learn more"}
                      </Link>
                    </div>
                  </div>
                </Card>
                </a>
              </SwiperSlide>
            ))}
          </Carousel>
        </div>
      ) : (
        <Card bodyClass="p-0">
          <Carousel pagination={true} navigation={false}>
            {slidesData.map((slide) => (
              <SwiperSlide key={slide.id}>
                <a href={slide.link}>
                <div
                  className="single-slide bg-no-repeat bg-cover bg-center rounded-md min-h-[300px]"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="container text-start px-10 py-10 slider-content h-full w-full min-h-[300px] rounded-md flex flex-col items-start justify-end text-white">
                    <div className="max-w-sm">
                      <h2 className="text-xl font-medium text-white mb-1">
                        {slide.title}
                      </h2>
                      <p className="text-sm mb-5">{slide.text}</p>
                      <Link
                        to={slide.link}
                        className="text-[12px] border p-2 rounded-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {slide.linkText || "Learn more"}
                      </Link>
                    </div>
                  </div>
                </div>
                </a>
              </SwiperSlide>
            ))}
          </Carousel>
        </Card>
      )}
    </div>
  );
};

export default CaruselWidget;
