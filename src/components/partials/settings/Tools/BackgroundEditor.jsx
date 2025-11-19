import React, { useState, Fragment, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import {
  updateWidgetData,
  saveWidget,
  saveWidgetAndProject,
  cancelWidgetEdit,
  setProjectBlocks,
} from "@/pages/app/projects/store";
import { toast } from "react-toastify";
import { getContentUrl } from "@/pages/app/projects/api";

const BackgroundEditor = ({ redactor }) => {
  const dispatch = useDispatch();
  const { widgetData } = useSelector((state) => state.project.widgetEditor);
  const { projectBlocks } = useSelector((state) => state.project);

  const [activeTab, setActiveTab] = useState(0);
  const [imageUrl, setImageUrl] = useState(null); // Object URL для File объекта
  const [imageError, setImageError] = useState(false);

  // Инициализация фона из widgetData
  const [background, setBackground] = useState({
    color: "#131517",
    image: "",
    blur: 0,
  });

  // Функция для получения URL изображения (обрабатывает File объекты и строки)
  const getImageUrl = () => {
    if (!background.image) return null;
    if (background.image instanceof File) {
      // Если это File объект, используем object URL
      if (!imageUrl) {
        const url = URL.createObjectURL(background.image);
        setImageUrl(url);
        return url;
      }
      return imageUrl;
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof background.image === "string") {
      return getContentUrl(background.image) || background.image;
    }
    return null;
  };

  // Очистка object URL при размонтировании
  useEffect(() => {
    return () => {
      if (
        imageUrl &&
        typeof imageUrl === "string" &&
        imageUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  // Очищаем object URL при изменении изображения
  useEffect(() => {
    if (background.image instanceof File) {
      // Если изображение - File объект, создаем object URL
      if (!imageUrl || imageUrl.startsWith("blob:") === false) {
        const url = URL.createObjectURL(background.image);
        setImageUrl(url);
      }
    } else {
      // Если изображение - строка, очищаем object URL
      if (
        imageUrl &&
        typeof imageUrl === "string" &&
        imageUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
      }
    }
  }, [background.image]);

  useEffect(() => {
    if (widgetData?.background) {
      setBackground(widgetData.background);
    } else {
      const stored = JSON.parse(
        localStorage.getItem("projectPreviewData") || "{}"
      );

      // Берём ПОСЛЕДНИЙ background-блок
      const backgroundBlocks =
        stored.projectBlocks?.filter((b) => b.type === "background") || [];
      const lastBackgroundBlock = backgroundBlocks[backgroundBlocks.length - 1];

      if (lastBackgroundBlock?.data?.background) {
        setBackground(lastBackgroundBlock.data.background);
      }
    }
  }, [widgetData]);

  const handleBackgroundChange = (e) => {
    const { name, value } = e.target;

    // Если меняем цвет - удаляем изображение
    const updatedBackground =
      name === "color"
        ? { ...background, [name]: value, image: "" }
        : { ...background, [name]: value };

    setBackground(updatedBackground);

    // Сразу обновляем в Redux store
    dispatch(
      updateWidgetData({
        data: {
          background: updatedBackground,
        },
      })
    );
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Валидация размера файла (4 МБ для изображений)
    const maxSize = 4 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("File is too big! Max size - 4 MB");
      return;
    }

    // Проверяем, что это изображение
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Сбрасываем ошибку загрузки при выборе нового файла
    setImageError(false);

    // При загрузке изображения сбрасываем цвет
    const updatedBackground = {
      color: "transparent",
      image: file, // Сохраняем File объект
      blur: background.blur,
    };

    setBackground(updatedBackground);

    dispatch(
      updateWidgetData({
        data: { background: updatedBackground },
      })
    );

    // Очищаем input, чтобы можно было выбрать тот же файл снова
    e.target.value = "";
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value.trim();

    if (!url) {
      // Если URL пустой, сбрасываем изображение
      const updatedBackground = {
        ...background,
        image: "",
        color:
          background.color === "transparent" ? "#131517" : background.color,
      };
      setBackground(updatedBackground);
      dispatch(
        updateWidgetData({
          data: { background: updatedBackground },
        })
      );
      return;
    }

    // Валидация URL
    try {
      new URL(url);
    } catch {
      toast.error("Invalid URL format");
      return;
    }

    // При загрузке изображения сбрасываем цвет
    const updatedBackground = {
      color: "transparent",
      image: url,
      blur: background.blur,
    };

    setBackground(updatedBackground);

    dispatch(
      updateWidgetData({
        data: { background: updatedBackground },
      })
    );
  };

  const handleSave = () => {
    // Убираем старые background-блоки из projectBlocks
    const filteredBlocks = projectBlocks.filter((b) => b.type !== "background");

    // Добавляем новый background блок
    const newBackgroundBlock = {
      id: "background-main",
      type: "background",
      order: filteredBlocks.length + 1,
      data: { background },
    };

    // Обновляем projectBlocks в Redux store
    const updatedBlocks = [...filteredBlocks, newBackgroundBlock];
    dispatch(setProjectBlocks(updatedBlocks));

    // Обновляем projectPreviewData в localStorage
    // Важно: File объекты не сериализуются в JSON, поэтому создаем копию без File объектов
    const stored = JSON.parse(
      localStorage.getItem("projectPreviewData") || "{}"
    );

    // Создаем копию блоков для localStorage, заменяя File объекты на пустую строку
    const blocksForStorage = updatedBlocks.map((block) => {
      if (
        block.type === "background" &&
        block.data?.background?.image instanceof File
      ) {
        return {
          ...block,
          data: {
            ...block.data,
            background: {
              ...block.data.background,
              image: "", // File объекты не сохраняем в localStorage
            },
          },
        };
      }
      return block;
    });

    const updated = {
      ...stored,
      projectBlocks: blocksForStorage,
    };
    localStorage.setItem("projectPreviewData", JSON.stringify(updated));

    console.log("✅ Background перезаписан:", updated);

    window.dispatchEvent(new CustomEvent("previewDataUpdated"));
    window.dispatchEvent(new Event("storage"));

    // Сохраняем виджет и устанавливаем флаг для сохранения проекта на сервер
    // После сохранения на сервер File объект будет заменен на content_path
    dispatch(saveWidgetAndProject());

    // toast.success("Background saved");
  };

  const handleCancel = () => {
    dispatch(cancelWidgetEdit());
  };

  const renderBackgroundPreview = () => {
    const previewImageUrl = getImageUrl();

    return (
      <div
        className="mb-6 rounded-[6px] p-4 min-h-[200px] w-full flex items-center justify-center border-2 border-slate-600 overflow-hidden"
        style={{
          backgroundColor:
            background.color !== "transparent" ? background.color : undefined,
          backgroundImage: previewImageUrl ? `url(${previewImageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!previewImageUrl && background.color === "transparent" && (
          <div className="text-slate-400 text-center">
            <Icon
              icon="heroicons-outline:photo"
              className="text-4xl mx-auto mb-2"
            />
            <p>No background selected</p>
          </div>
        )}
        {!previewImageUrl && background.color !== "transparent" && (
          <div className="text-slate-400 text-center">
            <p>Color: {background.color}</p>
          </div>
        )}
        {previewImageUrl && (
          <div className="text-slate-400 text-center">
            <p>Image background</p>
          </div>
        )}
      </div>
    );
  };

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
            Background Settings
          </span>
        </div>
        <Button
          text="Save"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6"
          onClick={handleSave}
        />
      </div>

      {/* Preview Area */}
      {renderBackgroundPreview()}

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
                Edit Background
              </button>
            )}
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel className="space-y-6">
            {/* Цвет фона */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={
                    background.color === "transparent"
                      ? "#131517"
                      : background.color
                  }
                  onChange={handleBackgroundChange}
                  className="w-12 h-12 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={background.color}
                  onChange={(e) =>
                    handleBackgroundChange({
                      target: { name: "color", value: e.target.value },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-[6px] bg-white dark:bg-slate-800"
                  placeholder="#131517 or transparent"
                />
              </div>
            </div>

            {/* Картинка */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Background Image
              </label>

              {/* Блок загрузки через диалоговое окно */}
              <div className="flex gap-4 items-start mb-3">
                <div className="w-24 h-24 rounded-[6px] bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                  {background.image && !imageError ? (
                    <img
                      src={getImageUrl()}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImageError(true);
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
                  <label className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-[6px] cursor-pointer transition-colors">
                    <Icon
                      icon="heroicons-outline:arrow-up-tray"
                      className="text-xl text-slate-300"
                    />
                    <span className="text-slate-300">Upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Блок загрузки по URL */}
              {/* <div>
                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Or enter image URL
                </label>
                <div className="relative">
                  <Icon
                    icon="heroicons-outline:link"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg z-10"
                  />
                  <input
                    type="url"
                    value={
                      background.image && typeof background.image === "string"
                        ? background.image
                        : ""
                    }
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-[6px] bg-white dark:bg-slate-800"
                  />
                </div>
              </div> */}

              {background.image && (
                <button
                  onClick={() => {
                    const updatedBackground = {
                      ...background,
                      image: "",
                      color: "#131517", // Возвращаем цвет по умолчанию при удалении изображения
                    };
                    setBackground(updatedBackground);
                    setImageError(false);
                    dispatch(
                      updateWidgetData({
                        data: { background: updatedBackground },
                      })
                    );
                  }}
                  className="mt-2 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Размытие */}
            {/* <div>
              <label className="block text-sm font-medium mb-2">
                Blur Effect: {background.blur}px
              </label>
              <input
                type="range"
                name="blur"
                min="0"
                max="20"
                value={background.blur}
                onChange={handleBackgroundChange}
                className="w-full h-2 bg-slate-200 rounded-[6px] appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>No blur</span>
                <span>Max blur</span>
              </div>
            </div> */}

            {/* Сброс настроек */}
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  const defaultBackground = {
                    color: "#131517",
                    image: "",
                    blur: 0,
                  };
                  setBackground(defaultBackground);
                  dispatch(
                    updateWidgetData({
                      data: { background: defaultBackground },
                    })
                  );
                }}
                className="px-4 py-2 text-sm border border-slate-300 rounded-[6px] hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default BackgroundEditor;
