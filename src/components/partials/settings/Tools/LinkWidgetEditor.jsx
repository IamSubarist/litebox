import React, { useState, Fragment, useEffect, useMemo } from "react";
import { Tab } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Radio from "@/components/ui/Radio";
import {
  updateWidgetData,
  saveWidget,
  saveWidgetAndProject,
  cancelWidgetEdit,
  updateLink,
} from "@/pages/app/projects/store";
import { toast } from "react-toastify";
import wbg5 from "@/assets/images/all-img/widget-bg-4.png";
import wbg4 from "@/assets/images/all-img/widget-bg-3.png";
import { getContentUrl } from "@/pages/app/projects/api";

const LinkWidgetEditor = () => {
  const dispatch = useDispatch();
  const { widgetData } = useSelector((state) => state.project.widgetEditor);
  const [activeTab, setActiveTab] = useState(0);
  const [activeLinkIndex, setActiveLinkIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [imageUrls, setImageUrls] = useState({}); // Храним object URLs для File объектов

  // Убеждаемся, что links существует
  const links = widgetData.links || [];
  const activeLink = links[activeLinkIndex] || null;
  const currentStyle = widgetData.style || "featured";

  // Функция для получения URL изображения (обрабатывает File объекты и строки)
  const getImageUrl = (image, linkId) => {
    if (!image) return null;
    if (image instanceof File) {
      // Если это File объект, используем object URL
      if (!imageUrls[linkId]) {
        const url = URL.createObjectURL(image);
        setImageUrls((prev) => ({ ...prev, [linkId]: url }));
        return url;
      }
      return imageUrls[linkId];
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
    const currentImageUrls = {};
    links.forEach((link) => {
      if (link.image instanceof File) {
        const url = getImageUrl(link.image, link.id);
        if (url) currentImageUrls[link.id] = url;
      }
    });

    // Удаляем object URLs для изображений, которые больше не используются
    Object.keys(imageUrls).forEach((linkId) => {
      const link = links.find((l) => l.id === linkId);
      if (!link || !(link.image instanceof File)) {
        const url = imageUrls[linkId];
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
        delete imageUrls[linkId];
      }
    });
  }, [links]);

  const handleChange = (field, value) => {
    dispatch(updateWidgetData({ data: { [field]: value } }));
  };

  const handleLinkChange = (linkId, field, value) => {
    dispatch(updateLink({ linkId, data: { [field]: value } }));
  };

  const handleImageSelect = (e, linkId) => {
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
      delete newErrors[linkId];
      return newErrors;
    });

    // Сохраняем File объект для последующей загрузки на сервер
    handleLinkChange(linkId, "image", file);

    // Очищаем input, чтобы можно было выбрать тот же файл снова
    e.target.value = "";
  };

  const handleImageUrlChange = (linkId, url) => {
    // Сбрасываем ошибку загрузки при изменении URL
    setImageErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[linkId];
      return newErrors;
    });

    // Валидация URL
    if (url.trim() === "") {
      handleLinkChange(linkId, "image", "");
      return;
    }

    // Проверяем, что это валидный URL
    try {
      new URL(url);
      // Если URL валидный, сохраняем его
      handleLinkChange(linkId, "image", url.trim());
    } catch (error) {
      // Если URL невалидный, все равно сохраняем (может быть относительный путь)
      handleLinkChange(linkId, "image", url.trim());
    }

    // Если для cardSolid загружается изображение, автоматически устанавливаем appearance в "image"
    if (currentStyle === "cardSolid" && url.trim() !== "") {
      const link = links.find((l) => l.id === linkId);
      if (link && getLinkAppearance(link) !== "image") {
        handleLinkChange(linkId, "appearance", "image");
      }
    }
  };

  // Определяем текущий appearance для ссылки (solid или image)
  const getLinkAppearance = (link) => {
    // Если явно указано appearance, используем его, иначе определяем по наличию изображения
    if (link?.appearance) {
      return link.appearance;
    }
    // Для обратной совместимости: если есть изображение, значит выбрано Image
    return link?.image ? "image" : "solid";
  };

  // Обработчик изменения appearance
  const handleAppearanceChange = (linkId, appearance) => {
    // Обновляем appearance и при необходимости изображение в одном вызове
    const updateData = { appearance };
    if (appearance === "solid") {
      // При выборе Solid удаляем изображение
      updateData.image = "";
    }
    // Используем dispatch напрямую для атомарного обновления
    dispatch(updateLink({ linkId, data: updateData }));
  };

  const handleSave = () => {
    // Валидация в зависимости от стиля
    const linksCount = {
      featured: 1,
      cardImage: 2,
      cardSolid: 2, // максимум 2 карточки
    };
    const requiredCount = linksCount[currentStyle] || 1;

    if (links.length < requiredCount) {
      toast.error(`Please fill in ${requiredCount} link(s)`);
      return;
    }

    // Проверяем обязательные поля для всех ссылок
    for (let i = 0; i < requiredCount; i++) {
      const link = links[i];
      if (!link) {
        toast.error(`Please fill in link ${i + 1}`);
        return;
      }

      // Проверяем только URL - это единственное обязательное поле
      // Изображение необязательно для всех стилей
      if (!link.linkUrl || link.linkUrl.trim() === "") {
        toast.error(`Please fill in the URL for link ${i + 1}`);
        return;
      }
    }

    dispatch(saveWidgetAndProject());
    // toast.success("Links saved");
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

  // Используем useMemo для styles
  const styles = useMemo(
    () => [
      {
        id: "featured",
        name: "Featured",
        description: "Share links, promote posts or products.",
        preview: (
          <div className="relative rounded-[6px] overflow-hidden border-2 border-slate-700 bg-slate-800 min-h-[200px]">
            {links[0]?.image ? (
              <img
                src={getPreviewImageUrl(links[0].image)}
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
              {links[0]?.subtitle && (
                <p className="text-sm text-white/80 mb-1">
                  {links[0].subtitle}
                </p>
              )}
              {links[0]?.title && (
                <h3 className="text-xl font-bold text-white">
                  {links[0].title}
                </h3>
              )}
            </div>
            {links[0]?.linkText && (
              <button className="absolute top-4 left-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white text-sm">
                {links[0].linkText}
              </button>
            )}
          </div>
        ),
      },
      {
        id: "cardImage",
        name: "Card Image",
        description: "Highlight any content with engaging visuals.",
        preview: (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="relative rounded-[6px] overflow-hidden border-2 border-slate-700 bg-slate-800"
              >
                {links[index]?.image ? (
                  <img
                    src={getPreviewImageUrl(links[index].image)}
                    alt="Preview"
                    className="w-full h-[120px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[120px] flex items-center justify-center bg-slate-700">
                    <Icon
                      icon="heroicons-outline:photo"
                      className="text-2xl text-slate-500"
                    />
                  </div>
                )}
                <div className="p-3 bg-slate-800">
                  {links[index]?.subtitle && (
                    <p className="text-xs text-slate-400 mb-1">
                      {links[index].subtitle}
                    </p>
                  )}
                  {links[index]?.title && (
                    <h3 className="text-sm font-bold text-white">
                      {links[index].title}
                    </h3>
                  )}
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "cardSolid",
        name: "Card Solid",
        description: "Showcase content in clean and text-focused way.",
        preview: (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="relative rounded-[6px] overflow-hidden border-2 border-slate-700 bg-slate-700 p-3 min-h-[100px]"
                style={
                  links[index]?.image
                    ? {
                        backgroundImage: `url(${getPreviewImageUrl(
                          links[index].image
                        )})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}
                }
              >
                {links[index]?.image && (
                  <div className="absolute inset-0 bg-black/40" />
                )}
                <div className="relative z-10">
                  {links[index]?.subtitle && (
                    <p className="text-xs text-slate-400 mb-1">
                      {links[index].subtitle}
                    </p>
                  )}
                  {links[index]?.title && (
                    <h3 className="text-sm font-bold text-white">
                      {links[index].title}
                    </h3>
                  )}
                  {links[index]?.linkText && (
                    <button className="mt-2 px-2 py-1 bg-white text-slate-900 rounded text-xs">
                      {links[index].linkText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ),
      },
    ],
    [links]
  );

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
            Link
          </span>
        </div>
        <Button
          text="Save"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6"
          onClick={handleSave}
        />
      </div>

      {/* Preview Area */}
      <div className="mb-6 bg-slate-900 rounded-[6px] p-4 min-h-[200px] flex items-center justify-center">
        <div className="w-full max-w-md">
          {currentStyle === "featured" && links[0] && (
            <div className="relative rounded-[6px] overflow-hidden bg-slate-800 min-h-[200px]">
              {links[0].image ? (
                <img
                  src={getImageUrl(links[0].image, links[0].id)}
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
                {links[0].subtitle && (
                  <p className="text-sm text-white/80 mb-1">
                    {links[0].subtitle}
                  </p>
                )}
                {links[0].title && (
                  <h3 className="text-xl font-bold text-white">
                    {links[0].title}
                  </h3>
                )}
              </div>
              {links[0].linkText && (
                <button className="absolute top-4 left-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white text-sm">
                  {links[0].linkText}
                </button>
              )}
            </div>
          )}
          {currentStyle === "cardImage" && (
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="relative rounded-[6px] overflow-hidden border-2 border-slate-700 bg-slate-800"
                >
                  {links[index]?.image ? (
                    <img
                      src={getImageUrl(links[index].image, links[index].id)}
                      alt="Preview"
                      className="w-full h-[120px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[120px] flex items-center justify-center bg-slate-700">
                      <Icon
                        icon="heroicons-outline:photo"
                        className="text-2xl text-slate-500"
                      />
                    </div>
                  )}
                  <div className="p-3 bg-slate-800">
                    {links[index]?.subtitle && (
                      <p className="text-xs text-slate-400 mb-1">
                        {links[index].subtitle}
                      </p>
                    )}
                    {links[index]?.title && (
                      <h3 className="text-sm font-bold text-white">
                        {links[index].title}
                      </h3>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {currentStyle === "cardSolid" && (
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="relative rounded-[6px] overflow-hidden border-2 border-slate-700 bg-slate-700 p-3 min-h-[100px]"
                  style={
                    links[index]?.image
                      ? {
                          backgroundImage: `url(${getImageUrl(
                            links[index].image,
                            links[index].id
                          )})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}
                  }
                >
                  {links[index]?.image && (
                    <div className="absolute inset-0 bg-black/40" />
                  )}
                  <div className="relative z-10">
                    {links[index]?.subtitle && (
                      <p className="text-xs text-slate-400 mb-1">
                        {links[index].subtitle}
                      </p>
                    )}
                    {links[index]?.title && (
                      <h3 className="text-sm font-bold text-white">
                        {links[index].title}
                      </h3>
                    )}
                    {links[index]?.linkText && (
                      <button className="mt-2 px-2 py-1 bg-white text-slate-900 rounded text-xs">
                        {links[index].linkText}
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
            {/* Link Selector - показываем только если стиль требует несколько ссылок */}
            {links.length > 1 && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select link to edit
                </label>
                <div className="flex gap-2 flex-wrap">
                  {links.map((link, index) => (
                    <button
                      key={link.id || index}
                      onClick={() => setActiveLinkIndex(index)}
                      className={`px-3 py-1 rounded-[6px] text-sm transition-colors ${
                        activeLinkIndex === index
                          ? "bg-primary-500 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      Link {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Link Editor */}
            {activeLink && (
              <>
                {/* Appearance Selection - только для cardSolid */}
                {currentStyle === "cardSolid" && (
                  <div className="mb-6">
                    <label className="block mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Appearance
                    </label>
                    <div className="flex gap-6">
                      <Radio
                        id={`appearance-solid-${activeLink.id}`}
                        label="Solid"
                        name={`appearance-${activeLink.id}`}
                        value="solid"
                        checked={getLinkAppearance(activeLink) === "solid"}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleAppearanceChange(activeLink.id, value);
                        }}
                        activeClass="ring-primary-500"
                        className="h-[18px] w-[18px]"
                      />
                      <Radio
                        id={`appearance-image-${activeLink.id}`}
                        label="Image"
                        name={`appearance-${activeLink.id}`}
                        value="image"
                        checked={getLinkAppearance(activeLink) === "image"}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleAppearanceChange(activeLink.id, value);
                        }}
                        activeClass="ring-primary-500"
                        className="h-[18px] w-[18px]"
                      />
                    </div>
                  </div>
                )}

                {/* Image Selection - для featured, cardImage и cardSolid с Image */}
                {(currentStyle === "featured" ||
                  currentStyle === "cardImage" ||
                  (currentStyle === "cardSolid" &&
                    getLinkAppearance(activeLink) === "image")) && (
                  <>
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-24 rounded-[6px] bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {activeLink.image && !imageErrors[activeLink.id] ? (
                          <img
                            src={getImageUrl(activeLink.image, activeLink.id)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => {
                              setImageErrors((prev) => ({
                                ...prev,
                                [activeLink.id]: true,
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
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                          Upload image
                        </label>
                        <label className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-[6px] cursor-pointer transition-colors mb-3">
                          <Icon
                            icon="heroicons-outline:arrow-up-tray"
                            className="text-xl text-slate-300"
                          />
                          <span className="text-slate-300">Upload image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageSelect(e, activeLink.id)
                            }
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
                                activeLink.image &&
                                !activeLink.image.startsWith("data:")
                                  ? activeLink.image
                                  : ""
                              }
                              onChange={(e) => {
                                const url = e.target.value;
                                handleImageUrlChange(activeLink.id, url);
                              }}
                              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </>
                )}

                {/* Form Fields */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="Add Subtitle"
                    value={activeLink.subtitle || ""}
                    onChange={(e) =>
                      handleLinkChange(
                        activeLink.id,
                        "subtitle",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Add Title"
                    value={activeLink.title || ""}
                    onChange={(e) =>
                      handleLinkChange(activeLink.id, "title", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Link Text
                  </label>
                  <input
                    type="text"
                    placeholder="Add Button Text"
                    value={activeLink.linkText || ""}
                    onChange={(e) =>
                      handleLinkChange(
                        activeLink.id,
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
                    value={activeLink.linkUrl || ""}
                    onChange={(e) =>
                      handleLinkChange(activeLink.id, "linkUrl", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
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

export default LinkWidgetEditor;
