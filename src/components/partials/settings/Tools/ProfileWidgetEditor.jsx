import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import {
  updateWidgetData,
  saveWidget,
  saveWidgetAndProject,
  cancelWidgetEdit,
  setShouldSaveProject,
} from "@/pages/app/projects/store";
import { toast } from "react-toastify";
import { getContentUrl } from "@/pages/app/projects/api";

// Глобальные переменные для хранения callbacks для leftColProfile
let leftColProfileSaveCallback = null;
export const setLeftColProfileSaveCallback = (callback) => {
  leftColProfileSaveCallback = callback;
};

const ProfileWidgetEditor = () => {
  const dispatch = useDispatch();
  const { widgetData, widgetType } = useSelector(
    (state) => state.project.widgetEditor
  );

  // Инициализируем данные виджета
  const [photoUrl, setPhotoUrl] = useState(widgetData?.photoUrl || "");
  const [name, setName] = useState(widgetData?.name || "Name");
  const [text, setText] = useState(widgetData?.text || "Text under name");
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null); // Object URL для File объекта

  // Функция для получения URL изображения (обрабатывает File объекты и строки)
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image instanceof File) {
      // Если это File объект, используем object URL
      if (!imageUrl) {
        const url = URL.createObjectURL(image);
        setImageUrl(url);
        return url;
      }
      return imageUrl;
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof image === "string") {
      return getContentUrl(image);
    }
    return null;
  };

  // Функция-хелпер для получения URL изображения в preview
  const getPreviewImageUrl = (image) => {
    if (!image) return null;
    if (image instanceof File) {
      // Используем imageUrl из state, если он уже создан
      if (imageUrl) {
        return imageUrl;
      }
      // Иначе создаем новый и сохраняем в state
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return url;
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof image === "string") {
      return getContentUrl(image);
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
  }, [imageUrl]);

  // Создание/очистка object URL при изменении photoUrl
  useEffect(() => {
    if (photoUrl instanceof File) {
      // Если это File объект, создаем object URL
      if (!imageUrl) {
        const url = URL.createObjectURL(photoUrl);
        setImageUrl(url);
      }
    } else if (imageUrl) {
      // Если больше не File объект, очищаем object URL
      if (
        imageUrl &&
        typeof imageUrl === "string" &&
        imageUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUrl]);

  useEffect(() => {
    setPhotoUrl(widgetData?.photoUrl || "");
    setName(widgetData?.name || "Name");
    setText(widgetData?.text || "Text under name");
  }, [widgetData]);

  const handleSave = () => {
    // Валидация
    if (!name || name.trim() === "") {
      toast.error("Please fill in the name");
      return;
    }

    const savedData = { photoUrl, name, text };
    dispatch(
      updateWidgetData({
        data: savedData,
      })
    );

    // Если это leftColProfile, вызываем специальный callback
    if (widgetType === "leftColProfile" && leftColProfileSaveCallback) {
      leftColProfileSaveCallback(savedData);
      dispatch(saveWidget());
      dispatch(cancelWidgetEdit());
      // Устанавливаем флаг для сохранения проекта на сервер
      dispatch(setShouldSaveProject());
    } else {
      // Сохраняем виджет и проект на сервер (как в других виджетах)
      dispatch(saveWidgetAndProject());
    }
    // toast.success("Profile saved");
  };

  const handleCancel = () => {
    dispatch(cancelWidgetEdit());
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const maxSize = 4 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("File is too big! Max size - 4 MB");
      return;
    }

    // Сбрасываем ошибку загрузки при выборе нового файла
    setImageError(false);

    // Сохраняем File объект для последующей загрузки на сервер
    setPhotoUrl(file);

    // Очищаем input, чтобы можно было выбрать тот же файл снова
    e.target.value = "";
  };

  const handleImageUrlChange = (url) => {
    // Сбрасываем ошибку загрузки при изменении URL
    setImageError(false);

    // Валидация URL
    if (url.trim() === "") {
      setPhotoUrl("");
      return;
    }

    // Проверяем, что это валидный URL
    try {
      new URL(url);
      // Если URL валидный, сохраняем его
      setPhotoUrl(url.trim());
    } catch (error) {
      // Если URL невалидный, все равно сохраняем (может быть относительный путь)
      setPhotoUrl(url.trim());
    }
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
            Profile
          </span>
        </div>
        <Button
          text="Save"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6"
          onClick={handleSave}
        />
      </div>

      {/* Preview Area */}
      <div className="mb-6 bg-slate-900 rounded-[6px] p-4 min-h-[200px] flex items-center justify-center border-2 border-primary-500">
        <div
          className="relative p-4 h-[200px] w-full content-end rounded-[6px] overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(19, 21, 23, 1), transparent), url(${
              photoUrl ? getPreviewImageUrl(photoUrl) : "/placeholder.png"
            })`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
          onError={() => {
            setImageError(true);
          }}
        >
          <div className="text-center">
            <div className="text-[24px] font-medium text-white mb-2">
              {name || "Name"}
            </div>
            <p className="text-sm text-white/70">{text || "Text under name"}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 flex-1 overflow-y-auto p-1">
        {/* Photo Upload */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Photo
          </label>
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
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
          {/* Блок загрузки по URL - закомментирован */}
          {/* <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">
              Photo URL
            </label>
            <div className="relative">
              <Icon
                icon="heroicons-outline:link"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg z-10"
              />
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={
                  photoUrl && !(photoUrl instanceof File) && typeof photoUrl === "string"
                    ? photoUrl
                    : ""
                }
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enter the URL of the image for the profile background
            </p>
          </div> */}
        </div>

        {/* Name Input */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Name *
          </label>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Text Input */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Text under name
          </label>
          <input
            type="text"
            placeholder="Enter text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileWidgetEditor;
