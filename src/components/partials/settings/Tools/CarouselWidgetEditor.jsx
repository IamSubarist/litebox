import React, { useState, Fragment, useEffect, useMemo } from "react";
import { Tab } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import {
  updateWidgetData,
  saveWidget,
  saveWidgetAndProject,
  cancelWidgetEdit,
  addCarouselSlide,
  removeCarouselSlide,
  updateCarouselSlide,
} from "@/pages/app/projects/store";
import Carousel from "@/components/ui/Carousel";
import { SwiperSlide } from "swiper/react";
import Card from "@/components/ui/Card";
import wbg5 from "@/assets/images/all-img/widget-bg-4.png";
import { toast } from "react-toastify";
import { getContentUrl } from "@/pages/app/projects/api";

const CarouselWidgetEditor = () => {
  const dispatch = useDispatch();
  const { widgetData } = useSelector((state) => state.project.widgetEditor);
  const [activeTab, setActiveTab] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [imageUrls, setImageUrls] = useState({}); // Храним object URLs для File объектов

  // Убеждаемся, что slides существует
  const slides = widgetData.slides || [];

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

  // Очистка object URLs при размонтировании или изменении изображений
  useEffect(() => {
    return () => {
      // Очищаем все object URLs при размонтировании
      Object.values(imageUrls).forEach((url) => {
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Очищаем старые object URLs при изменении изображений
  useEffect(() => {
    // Создаем object URLs для новых File объектов
    slides.forEach((slide) => {
      if (slide.image instanceof File && slide.id) {
        if (!imageUrls[slide.id]) {
          const url = URL.createObjectURL(slide.image);
          setImageUrls((prev) => ({ ...prev, [slide.id]: url }));
        }
      }
    });

    // Удаляем object URLs для изображений, которые больше не используются
    setImageUrls((prev) => {
      const newUrls = { ...prev };
      let changed = false;

      Object.keys(newUrls).forEach((slideId) => {
        const slide = slides.find((s) => s.id === slideId);
        if (!slide || !(slide.image instanceof File)) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides]);

  // Сбрасываем индекс активного слайда при изменении данных
  useEffect(() => {
    if (slides && slides.length > 0) {
      if (activeSlideIndex >= slides.length) {
        setActiveSlideIndex(0);
      }
    } else {
      setActiveSlideIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  // Создаем уникальный ключ для карусели на основе данных слайдов
  const carouselKey = useMemo(() => {
    if (!slides || slides.length === 0) {
      return `carousel-${widgetData.style || "featured"}-empty`;
    }
    const slidesHash = slides
      .map(
        (s, idx) =>
          `${s.id || idx}-${s.title || ""}-${s.image ? "img" : "noimg"}`
      )
      .join("-");
    return `carousel-${widgetData.style || "featured"}-${
      slides.length
    }-${slidesHash}`;
  }, [slides, widgetData.style]);

  const activeSlide =
    slides && slides[activeSlideIndex] ? slides[activeSlideIndex] : null;

  const handleChange = (field, value) => {
    dispatch(updateWidgetData({ data: { [field]: value } }));
  };

  const handleSlideChange = (slideId, field, value) => {
    dispatch(updateCarouselSlide({ slideId, data: { [field]: value } }));
  };

  const handleAddSlide = () => {
    const currentLength = widgetData.slides ? widgetData.slides.length : 0;
    dispatch(addCarouselSlide());
    // Переключаемся на новый слайд после обновления
    setTimeout(() => {
      setActiveSlideIndex(currentLength);
    }, 0);
  };

  const handleDeleteSlide = (slideId, index) => {
    // Проверяем, можно ли удалить слайд (для showcase минимум 3 слайда)
    if (
      widgetData.style === "showcase" &&
      widgetData.slides &&
      widgetData.slides.length <= 3
    ) {
      toast.error(
        "The showcase style requires at least 3 slides. Deletion is not possible."
      );
      return;
    }

    dispatch(removeCarouselSlide(slideId));
    // Если удаляем текущий слайд, переключаемся на предыдущий
    if (index === activeSlideIndex && index > 0) {
      setActiveSlideIndex(index - 1);
    } else if (index < activeSlideIndex) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const handleSave = () => {
    // Проверяем, что есть хотя бы один слайд
    if (!slides || slides.length === 0) {
      toast.error("You need to add at least one slide");
      return;
    }

    // Проверяем, что у всех слайдов заполнена ссылка (linkUrl)
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!slide.linkUrl || slide.linkUrl.trim() === "") {
        toast.error(`Please fill in the link for slide ${i + 1}`);
        return;
      }
    }

    dispatch(saveWidgetAndProject());
    // toast.success("Carousel saved");
  };

  const handleCancel = () => {
    dispatch(cancelWidgetEdit());
  };

  // Функция-хелпер для получения URL изображения в preview (без state)
  const getPreviewImageUrl = (image) => {
    if (!image) return null;
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof image === "string") {
      return getContentUrl(image);
    }
    return null;
  };

  const handleImageSelect = (e, slideId) => {
    const file = e.target.files[0];

    if (!file) return;

    const maxSize = 4 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("File is too big! Max size - 4 MB");
      return;
    }

    // Сбрасываем ошибку загрузки при выборе нового файла
    setImageErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[slideId];
      return newErrors;
    });

    // Сохраняем File объект для последующей загрузки на сервер
    handleSlideChange(slideId, "image", file);

    // Очищаем input, чтобы можно было выбрать тот же файл снова
    e.target.value = "";
  };

  const handleImageUrlChange = (slideId, url) => {
    // Сбрасываем ошибку загрузки при изменении URL
    setImageErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[slideId];
      return newErrors;
    });

    // Валидация URL
    if (url.trim() === "") {
      handleSlideChange(slideId, "image", "");
      return;
    }

    // Проверяем, что это валидный URL
    try {
      new URL(url);
      // Если URL валидный, сохраняем его
      handleSlideChange(slideId, "image", url.trim());
    } catch (error) {
      // Если URL невалидный, все равно сохраняем (может быть относительный путь)
      handleSlideChange(slideId, "image", url.trim());
    }
  };

  const currentStyle = widgetData.style || "featured";

  const styles = [
    {
      id: "featured",
      name: "Featured",
      description: "Share links, promote multiple posts or products.",
      preview: (
        <div className="relative rounded-[6px] overflow-hidden border-2 border-slate-700 bg-slate-800 min-h-[200px]">
          {slides[0]?.image ? (
            <img
              src={getPreviewImageUrl(slides[0].image)}
              alt="Preview"
              className="w-full h-full object-cover min-h-[200px]"
            />
          ) : (
            <div className="w-full h-full min-h-[200px] flex items-center justify-center">
              <Icon
                icon="heroicons-outline:photo"
                className="text-6xl text-slate-500"
              />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            {slides[0]?.subtitle && (
              <p className="text-sm text-white/80 mb-1">{slides[0].subtitle}</p>
            )}
            {slides[0]?.title && (
              <h3 className="text-xl font-bold text-white">
                {slides[0].title}
              </h3>
            )}
          </div>
          {slides[0]?.linkText && (
            <button className="absolute top-4 left-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white text-sm">
              {slides[0].linkText}
            </button>
          )}
        </div>
      ),
    },
    {
      id: "showcase",
      name: "Showcase",
      description: "Feature brand deals, products, or standout content.",
      preview: (
        <div className="relative rounded-[6px] overflow-hidden border-2 border-slate-700 bg-slate-800">
          {slides[0]?.image ? (
            <img
              src={getPreviewImageUrl(slides[0].image)}
              alt="Preview"
              className="w-full h-[200px] object-cover"
            />
          ) : (
            <div className="w-full h-[200px] flex items-center justify-center bg-slate-700">
              <Icon
                icon="heroicons-outline:photo"
                className="text-4xl text-slate-500"
              />
            </div>
          )}
          <div className="p-4 bg-slate-800">
            {slides[0]?.subtitle && (
              <p className="text-sm text-slate-400 mb-1">
                {slides[0].subtitle}
              </p>
            )}
            {slides[0]?.title && (
              <h3 className="text-lg font-bold text-white">
                {slides[0].title}
              </h3>
            )}
            {slides[0]?.linkText && (
              <p className="text-sm text-slate-300 mt-2">
                {slides[0].linkText}
              </p>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 -mx-6 px-6 py-[15px] mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="text-slate-800 dark:text-slate-200 hover:text-slate-600 dark:hover:text-slate-400"
          >
            <Icon icon="heroicons-outline:arrow-left" className="text-xl" />
          </button>
          <span className="font-bold text-xl text-slate-900 dark:text-[#eee]">
            Carousel
          </span>
        </div>
        <Button
          text="Save"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6"
          onClick={handleSave}
        />
      </div>

      {/* Preview Area */}
      <div className="mb-6 bg-slate-900 rounded-[6px] p-4 min-h-[300px] flex items-center justify-center border-2 border-primary-500">
        <div className="w-full max-w-md">
          {slides && slides.length > 0 ? (
            currentStyle === "showcase" ? (
              <Carousel
                key={carouselKey}
                pagination={true}
                navigation={true}
                slidesPerView={1}
                slidesPerGroup={1}
                spaceBetween={10}
                watchOverflow={true}
              >
                {slides.map((slide, index) => {
                  const imageUrl = slide.image
                    ? getImageUrl(slide.image, slide.id || index)
                    : null;
                  return (
                    <SwiperSlide key={slide.id || `slide-${index}`}>
                      <Card bodyClass="p-0 h-full">
                        <div className="h-[140px] w-full">
                          <img
                            src={imageUrl || wbg5}
                            alt={slide.title || "Preview"}
                            className="block w-full h-full object-cover rounded-t-md"
                          />
                        </div>
                        <div className="p-6">
                          <header className="mb-2">
                            <div className="card-title text-white">
                              {slide.title || "Card Title"}
                            </div>
                          </header>
                          <div className="text-[12px]">
                            {slide.subtitle || "Lorem ipsum dolor sit amet."}
                          </div>
                          <div className="mt-6 space-x-4 rtl:space-x-reverse">
                            <span className="text-[12px]">
                              {slide.linkText || "Learn more"}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </SwiperSlide>
                  );
                })}
              </Carousel>
            ) : (
              <Carousel
                key={carouselKey}
                pagination={true}
                navigation={true}
                className="main-caro"
                watchOverflow={true}
              >
                {slides.map((slide, index) => {
                  const imageUrl = slide.image
                    ? getImageUrl(slide.image, slide.id || index)
                    : null;
                  return (
                    <SwiperSlide key={slide.id || `slide-${index}`}>
                      <div
                        className="single-slide bg-no-repeat bg-cover bg-center rounded-md min-h-[250px] relative flex items-center"
                        style={{
                          backgroundImage: imageUrl
                            ? `url(${imageUrl})`
                            : `url(${wbg5})`,
                        }}
                      >
                        {slide.linkText && (
                          <button className="absolute top-4 left-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white text-sm">
                            {slide.linkText}
                          </button>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
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
            )
          ) : (
            <div className="w-full h-[250px] flex items-center justify-center bg-slate-800 rounded-md">
              <Icon
                icon="heroicons-outline:photo"
                className="text-6xl text-slate-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 border-b border-slate-200 dark:border-slate-700 mb-6">
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  selected
                    ? "text-primary-500 border-b-2 border-primary-500"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                Edit
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  selected
                    ? "text-primary-500 border-b-2 border-primary-500"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                Style
              </button>
            )}
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* Edit Tab */}
          <Tab.Panel className="space-y-4">
            {/* Slide Selector */}
            {slides && slides.length > 0 && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select slide to edit
                </label>
                <div className="flex gap-2 flex-wrap">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id || index}
                      onClick={() => setActiveSlideIndex(index)}
                      className={`px-3 py-1 rounded-[6px] text-sm transition-colors ${
                        activeSlideIndex === index
                          ? "bg-primary-500 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      Slide {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Slide Editor */}
            {activeSlide && (
              <>
                {/* Image Selection */}
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-[6px] bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                    {activeSlide.image && !imageErrors[activeSlide.id] ? (
                      <img
                        src={getImageUrl(activeSlide.image, activeSlide.id)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImageErrors((prev) => ({
                            ...prev,
                            [activeSlide.id]: true,
                          }));
                        }}
                      />
                    ) : (
                      <Icon
                        icon="heroicons-outline:photo"
                        className="text-3xl text-slate-500"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    {/* Блок загрузки через диалоговое окно */}
                    <label className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-[6px] cursor-pointer transition-colors mb-3">
                      <Icon
                        icon="heroicons-outline:arrow-up-tray"
                        className="text-xl text-slate-300"
                      />
                      <span className="text-slate-300">Upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageSelect(e, activeSlide.id)}
                        className="hidden"
                      />
                    </label>
                    {/* Блок загрузки по URL - закомментирован */}
                    {/* <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Load image by URL
                      </label>
                      <div className="relative">
                        <Icon
                          icon="heroicons-outline:link"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg z-10"
                        />
                        <input
                          type="url"
                          placeholder="Enter image URL"
                          value={
                            activeSlide.image &&
                            !(activeSlide.image instanceof File) &&
                            typeof activeSlide.image === "string"
                              ? activeSlide.image
                              : ""
                          }
                          onChange={(e) => {
                            const url = e.target.value;
                            handleImageUrlChange(activeSlide.id, url);
                          }}
                          className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div> */}
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="Add Subtitle"
                    value={activeSlide.subtitle || ""}
                    onChange={(e) =>
                      handleSlideChange(
                        activeSlide.id,
                        "subtitle",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Add Title"
                    value={activeSlide.title || ""}
                    onChange={(e) =>
                      handleSlideChange(activeSlide.id, "title", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Link Text *
                  </label>
                  <input
                    type="text"
                    placeholder="Add Link Text"
                    value={activeSlide.linkText || ""}
                    onChange={(e) =>
                      handleSlideChange(
                        activeSlide.id,
                        "linkText",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Link URL *
                  </label>
                  <input
                    type="url"
                    placeholder="Add Link URL"
                    value={activeSlide.linkUrl || ""}
                    onChange={(e) =>
                      handleSlideChange(
                        activeSlide.id,
                        "linkUrl",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Schedule Content Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-[6px]">
                  <span className="text-sm font-medium text-slate-300">
                    Schedule Content
                  </span>
                  <Switch
                    value={widgetData.scheduleContent || false}
                    onChange={(e) =>
                      handleChange("scheduleContent", e.target.checked)
                    }
                    id="schedule-content"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddSlide}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-[6px] font-medium transition-colors"
                  >
                    <Icon icon="heroicons-outline:plus" className="text-lg" />
                    Add Slide
                  </button>
                  {slides &&
                    slides.length > 1 &&
                    !(
                      widgetData.style === "showcase" && slides.length <= 3
                    ) && (
                      <button
                        onClick={() =>
                          handleDeleteSlide(activeSlide.id, activeSlideIndex)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-[6px] font-medium transition-colors"
                      >
                        <Icon
                          icon="heroicons-outline:trash"
                          className="text-lg"
                        />
                        Delete
                      </button>
                    )}
                </div>
              </>
            )}
          </Tab.Panel>

          {/* Style Tab */}
          <Tab.Panel className="space-y-6 mb-2">
            {styles.map((style) => (
              <div key={style.id}>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-[#eee] mb-1">
                  {style.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {style.description}
                </p>
                <div
                  onClick={() => handleChange("style", style.id)}
                  className={`cursor-pointer transition-all ${
                    currentStyle === style.id
                      ? "ring-2 ring-primary-500"
                      : "hover:ring-2 hover:ring-slate-400"
                  } rounded-[6px] overflow-hidden`}
                >
                  {style.preview}
                </div>
              </div>
            ))}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default CarouselWidgetEditor;
