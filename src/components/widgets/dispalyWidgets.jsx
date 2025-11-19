import React from "react";
import Carousel from "@/components/ui/Carousel";
import { SwiperSlide } from "swiper/react";
import Card from "../../components/ui/Card";
import c1 from "@/assets/images/all-img/c1.png";
import c2 from "@/assets/images/all-img/c2.png";
import c3 from "@/assets/images/all-img/c3.png";

const DisplayWidgets = ({ layout = "single-row", onEdit, redactor }) => {
  const slidesData = [
    {
      id: 1,
      title: "Card Title 1",
      text: "Lorem ipsum dolor sit amet.",
      image: c1,
      link: "/projects",
    },
    {
      id: 2,
      title: "Card Title 2",
      text: "Sed ut perspiciatis unde.",
      image: c2,
      link: "/projects",
    },
    {
      id: 3,
      title: "Card Title 3",
      text: "At vero eos et accusamus et.",
      image: c3,
      link: "/projects",
    },
    {
      id: 4,
      title: "Card Title 4",
      text: "Et harum quidem rerum facilis.",
      image: c2,
      link: "/projects",
    },
    {
      id: 5,
      title: "Card Title 5",
      text: "Nam libero tempore, cum.",
      image: c3,
      link: "/projects",
    },
    {
      id: 6,
      title: "Card Title 6",
      text: "Temporibus autem quibusdam.",
      image: c2,
      link: "/projects",
    },
    {
      id: 7,
      title: "Card Title 7",
      text: "Extra example card.",
      image: c1,
      link: "/projects",
    },
    {
      id: 8,
      title: "Card Title 8",
      text: "Extra example card.",
      image: c2,
      link: "/projects",
    },
    {
      id: 9,
      title: "Card Title 1",
      text: "Lorem ipsum dolor sit amet.",
      image: c1,
      link: "/projects",
    },
    {
      id: 10,
      title: "Card Title 2",
      text: "Sed ut perspiciatis unde.",
      image: c2,
      link: "/projects",
    },
    {
      id: 11,
      title: "Card Title 3",
      text: "At vero eos et accusamus et.",
      image: c3,
      link: "/projects",
    },
    {
      id: 12,
      title: "Card Title 4",
      text: "Et harum quidem rerum facilis.",
      image: c2,
      link: "/projects",
    },
    {
      id: 13,
      title: "Card Title 5",
      text: "Nam libero tempore, cum.",
      image: c3,
      link: "/projects",
    },
    {
      id: 14,
      title: "Card Title 6",
      text: "Temporibus autem quibusdam.",
      image: c2,
      link: "/projects",
    },
    {
      id: 15,
      title: "Card Title 7",
      text: "Extra example card.",
      image: c1,
      link: "/projects",
    },
    {
      id: 16,
      title: "Card Title 8",
      text: "Extra example card.",
      image: c2,
      link: "/projects",
    },
  ];

  const handleContainerClick = (e) => {
    // Пропускаем клики по элементам управления карусели
    if (
      e.target.closest(".swiper-button-next") ||
      e.target.closest(".swiper-button-prev") ||
      e.target.closest(".swiper-pagination")
    ) {
      return;
    }

    // Открываем редактор при клике на контейнер
    if (redactor) {
      e.preventDefault();
      e.stopPropagation();
      onEdit?.();
    }
  };

  if (layout === "single-row") {
    return (
      <div
        className={`grid grid-cols-1 ${redactor ? "cursor-pointer" : ""}`}
        onClick={handleContainerClick}
      >
        <Card bodyClass="p-0" className="!bg-transparent">
          <Carousel
            pagination={true}
            navigation={false}
            slidesPerView="auto"
            spaceBetween={20}
            centeredSlides={false}
            watchOverflow={true}
            style={{ overflow: "visible" }}
          >
            {slidesData.map((slide) => (
              <SwiperSlide
                key={slide.id}
                style={{
                  width: "clamp(240px, 30vw, 400px)", // адаптивная ширина карточки
                }}
              >
                <div className="flex flex-col gap-5 w-full">
                  <Card bodyClass="p-0 h-full">
                    <div className="h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] w-full">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover rounded-t-md"
                      />
                    </div>
                  </Card>
                </div>
              </SwiperSlide>
            ))}
          </Carousel>
        </Card>
      </div>
    );
  }

  if (layout === "two-rows") {
    const columns = [];
    for (let i = 0; i < slidesData.length; i += 2) {
      columns.push(slidesData.slice(i, i + 2));
    }

    return (
      <div
        className={`grid grid-cols-1 ${redactor ? "cursor-pointer" : ""}`}
        onClick={handleContainerClick}
      >
        <Carousel
          pagination={true}
          navigation={false}
          slidesPerView="auto"
          spaceBetween={20}
          centeredSlides={false}
          watchOverflow={true}
          style={{ overflow: "visible" }}
        >
          {columns.map((col, index) => (
            <SwiperSlide
              key={index}
              style={{
                width: "clamp(240px, 30vw, 380px)", // адаптивная ширина колонки
              }}
            >
              <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 w-full">
                {col.map((slide) => (
                  <Card key={slide.id} bodyClass="p-0">
                    <div className="h-[220px] sm:h-[300px] md:h-[340px] lg:h-[360px] w-full">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover rounded-t-md"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Carousel>
      </div>
    );
  }

  if (layout === "mixed-rows") {
    const columns = [];
    for (let i = 0; i < slidesData.length; i += 2) {
      columns.push(slidesData.slice(i, i + 2));
    }

    return (
      <div
        className={`grid grid-cols-1 ${redactor ? "cursor-pointer" : ""}`}
        onClick={handleContainerClick}
      >
        <Carousel
          pagination={true}
          navigation={false}
          slidesPerView="auto"
          spaceBetween={20}
          centeredSlides={false}
          watchOverflow={true}
          style={{ overflow: "visible" }}
        >
          {columns.map((col, colIndex) => (
            <SwiperSlide
              key={colIndex}
              style={{
                width: "clamp(240px, 30vw, 380px)", // адаптивная ширина колонки
              }}
            >
              <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 w-full">
                {col.map((slide, localIndex) => {
                  const globalIndex = colIndex * 2 + localIndex;
                  const isOdd = globalIndex % 2 === 0;

                  return (
                    <Card key={slide.id} bodyClass="p-0">
                      <div
                        className={`w-full ${
                          isOdd
                            ? "h-[280px] sm:h-[380px] md:h-[420px] lg:h-[450px]"
                            : "h-[180px] sm:h-[260px] md:h-[300px] lg:h-[320px]"
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover rounded-t-md"
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </SwiperSlide>
          ))}
        </Carousel>
      </div>
    );
  }

  if (layout === "custom-grid") {
    const groupedSlides = slidesData.slice(0, 4);

    return (
      <div
        className={`grid grid-cols-1 w-full max-w-full lg:max-w-[70%] mx-auto px-3 sm:px-4 md:px-6 ${
          redactor ? "cursor-pointer" : ""
        }`}
        onClick={handleContainerClick}
      >
        <Card bodyClass="p-0" className="!bg-transparent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {/* Левая колонка */}
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
              <Card bodyClass="p-0">
                <div className="w-full h-[220px] sm:h-[320px] md:h-[420px] lg:h-[500px]">
                  <img
                    src={groupedSlides[0].image}
                    alt={groupedSlides[0].title}
                    className="w-full h-full object-cover rounded-t-md"
                  />
                </div>
              </Card>

              <Card bodyClass="p-0">
                <div className="w-full h-[160px] sm:h-[220px] md:h-[260px] lg:h-[300px]">
                  <img
                    src={groupedSlides[1].image}
                    alt={groupedSlides[1].title}
                    className="w-full h-full object-cover rounded-t-md"
                  />
                </div>
              </Card>
            </div>

            {/* Правая колонка */}
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
              <Card bodyClass="p-0">
                <div className="w-full h-[160px] sm:h-[220px] md:h-[260px] lg:h-[300px]">
                  <img
                    src={groupedSlides[2].image}
                    alt={groupedSlides[2].title}
                    className="w-full h-full object-cover rounded-t-md"
                  />
                </div>
              </Card>

              <Card bodyClass="p-0">
                <div className="w-full h-[220px] sm:h-[320px] md:h-[420px] lg:h-[500px]">
                  <img
                    src={groupedSlides[3].image}
                    alt={groupedSlides[3].title}
                    className="w-full h-full object-cover rounded-t-md"
                  />
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default DisplayWidgets;
