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

// Глобальные переменные для хранения callbacks для leftColVideo
let leftColVideoSaveCallback = null;
let leftColVideoDeleteCallback = null;
export const setLeftColVideoSaveCallback = (callback) => {
  leftColVideoSaveCallback = callback;
};
export const setLeftColVideoDeleteCallback = (callback) => {
  leftColVideoDeleteCallback = callback;
};

const VideoWidgetEditor = () => {
  const dispatch = useDispatch();
  const { widgetData, widgetType } = useSelector(
    (state) => state.project.widgetEditor
  );
  const [videoUrl, setVideoUrl] = useState(null); // Object URL для File объекта
  const [videoErrors, setVideoErrors] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null); // Object URL для File объекта
  const [thumbnailErrors, setThumbnailErrors] = useState(false);

  // Функция для получения URL видео (обрабатывает File объекты и строки)
  const getVideoUrl = (video) => {
    if (!video) return null;
    if (video instanceof File) {
      // Если это File объект, используем object URL
      if (!videoUrl) {
        const url = URL.createObjectURL(video);
        setVideoUrl(url);
        return url;
      }
      return videoUrl;
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof video === "string") {
      return getContentUrl(video);
    }
    return null;
  };

  // Функция для получения URL thumbnail (обрабатывает File объекты и строки)
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail instanceof File) {
      // Если это File объект, используем object URL
      if (!thumbnailUrl) {
        const url = URL.createObjectURL(thumbnail);
        setThumbnailUrl(url);
        return url;
      }
      return thumbnailUrl;
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
        videoUrl &&
        typeof videoUrl === "string" &&
        videoUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(videoUrl);
      }
      if (
        thumbnailUrl &&
        typeof thumbnailUrl === "string" &&
        thumbnailUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, []);

  // Очищаем старые object URLs при изменении данных
  useEffect(() => {
    const video = widgetData?.videoUrl;
    const thumbnail = widgetData?.thumbnail;

    // Создаем object URLs для новых File объектов
    if (video instanceof File) {
      // Проверяем, нужно ли создать новый URL
      const currentVideoUrl = videoUrl;
      if (!currentVideoUrl || !currentVideoUrl.startsWith("blob:")) {
        // Очищаем старый URL если есть
        if (
          currentVideoUrl &&
          typeof currentVideoUrl === "string" &&
          currentVideoUrl.startsWith("blob:")
        ) {
          URL.revokeObjectURL(currentVideoUrl);
        }
        // Создаем новый URL
        const url = URL.createObjectURL(video);
        setVideoUrl(url);
      }
    } else {
      // Если это не File объект, очищаем object URL
      if (
        videoUrl &&
        typeof videoUrl === "string" &&
        videoUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
    }

    if (thumbnail instanceof File) {
      // Проверяем, нужно ли создать новый URL
      const currentThumbnailUrl = thumbnailUrl;
      if (!currentThumbnailUrl || !currentThumbnailUrl.startsWith("blob:")) {
        // Очищаем старый URL если есть
        if (
          currentThumbnailUrl &&
          typeof currentThumbnailUrl === "string" &&
          currentThumbnailUrl.startsWith("blob:")
        ) {
          URL.revokeObjectURL(currentThumbnailUrl);
        }
        // Создаем новый URL
        const url = URL.createObjectURL(thumbnail);
        setThumbnailUrl(url);
      }
    } else {
      // Если это не File объект, очищаем object URL
      if (
        thumbnailUrl &&
        typeof thumbnailUrl === "string" &&
        thumbnailUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(thumbnailUrl);
        setThumbnailUrl(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetData?.videoUrl, widgetData?.thumbnail]);

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Валидация размера файла (100 МБ для видео)
    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("File is too big! Max size - 100 MB");
      return;
    }

    // Сбрасываем ошибку загрузки при выборе нового файла
    setVideoErrors(false);

    // Сохраняем File объект для последующей загрузки на сервер
    dispatch(updateWidgetData({ data: { videoUrl: file } }));

    // Автоматически создаем превью из первого кадра видео
    const videoUrlForPreview = URL.createObjectURL(file);
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.src = videoUrlForPreview;
    videoElement.muted = true;

    videoElement.addEventListener("loadedmetadata", () => {
      videoElement.currentTime = 0.1;
    });

    videoElement.addEventListener("seeked", () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoElement, 0, 0);

        // Создаем File объект для thumbnail из canvas
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], "thumbnail.png", {
              type: "image/png",
            });
            dispatch(
              updateWidgetData({
                data: { videoUrl: file, thumbnail: thumbnailFile },
              })
            );
          }
          // Очищаем временный object URL после создания thumbnail
          URL.revokeObjectURL(videoUrlForPreview);
        }, "image/png");
      } catch (error) {
        console.error("Error creating thumbnail:", error);
        setVideoErrors(true);
        // Очищаем временный object URL в случае ошибки
        URL.revokeObjectURL(videoUrlForPreview);
      }
    });

    videoElement.addEventListener("error", () => {
      console.error("Error loading video");
      setVideoErrors(true);
      toast.error("Error loading video file");
      // Очищаем временный object URL в случае ошибки
      URL.revokeObjectURL(videoUrlForPreview);
    });

    videoElement.load();

    // Очищаем input, чтобы можно было выбрать тот же файл снова
    e.target.value = "";
  };

  const handleThumbnailSelect = (e) => {
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
    setThumbnailErrors(false);

    // Сохраняем File объект для последующей загрузки на сервер
    dispatch(
      updateWidgetData({
        data: { ...widgetData, thumbnail: file },
      })
    );

    // Очищаем input, чтобы можно было выбрать тот же файл снова
    e.target.value = "";
  };

  const handleSave = () => {
    if (!widgetData?.videoUrl) {
      toast.error("Please upload a video");
      return;
    }

    // Если это leftColVideo, вызываем специальный callback
    if (widgetType === "leftColVideo" && leftColVideoSaveCallback) {
      leftColVideoSaveCallback({
        videoUrl: widgetData.videoUrl,
        thumbnail: widgetData.thumbnail,
      });
      dispatch(saveWidget());
      dispatch(cancelWidgetEdit());
      // Устанавливаем флаг для сохранения проекта на сервер
      dispatch(setShouldSaveProject());
    } else {
      // Для promoVideo и других типов сохраняем виджет и проект на сервер
      dispatch(saveWidgetAndProject());
    }
    // toast.success("Video saved");
  };

  const handleCancel = () => {
    dispatch(cancelWidgetEdit());
  };

  const handleDelete = () => {
    // Очищаем object URLs перед удалением
    if (
      videoUrl &&
      typeof videoUrl === "string" &&
      videoUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(videoUrl);
    }
    if (
      thumbnailUrl &&
      typeof thumbnailUrl === "string" &&
      thumbnailUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(thumbnailUrl);
    }

    setVideoUrl(null);
    setThumbnailUrl(null);
    setVideoErrors(false);
    setThumbnailErrors(false);

    dispatch(updateWidgetData({ data: { videoUrl: "", thumbnail: null } }));

    // Если это leftColVideo, вызываем специальный callback для удаления
    if (widgetType === "leftColVideo" && leftColVideoDeleteCallback) {
      leftColVideoDeleteCallback();
      dispatch(saveWidget());
      dispatch(cancelWidgetEdit());
      // Устанавливаем флаг для сохранения проекта на сервер
      dispatch(setShouldSaveProject());
    } else {
      // Для promoVideo и других типов сохраняем виджет и проект на сервер
      dispatch(saveWidgetAndProject());
    }
    toast.success("Video deleted");
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
            Promo Video
          </span>
        </div>
        <Button
          text="Save"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6"
          onClick={handleSave}
        />
      </div>

      {/* Content */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Video Upload Area */}
        <div className="flex gap-4 items-start">
          {/* Thumbnail Preview */}
          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-700">
            {widgetData?.thumbnail && !thumbnailErrors ? (
              <img
                src={getThumbnailUrl(widgetData.thumbnail)}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                onError={() => {
                  setThumbnailErrors(true);
                }}
              />
            ) : (
              <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                <Icon
                  icon="humbleicons:camera-video"
                  className="text-3xl text-slate-500"
                />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Upload Video *
            </label>
            <label className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-[6px] cursor-pointer transition-colors">
              <Icon
                icon="heroicons-outline:arrow-up-tray"
                className="text-xl text-slate-300"
              />
              <span className="text-slate-300">Upload Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-500 mt-1">1080x1920px</p>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-900 bg-opacity-30 rounded-[6px] p-4 flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <Icon
                icon="heroicons-outline:information-circle"
                className="text-white text-sm"
              />
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-1">
              Highlight your story
            </p>
            <p className="text-slate-300 text-xs">
              Add a promo video to share your story, promote your brand, or
              showcase something unique.
            </p>
          </div>
        </div>

        {/* Video Preview */}
        {widgetData?.videoUrl && (
          <div className="rounded-[6px] overflow-hidden bg-black">
            <video
              src={getVideoUrl(widgetData.videoUrl)}
              controls
              className="w-full max-h-64"
              preload="metadata"
              onError={() => {
                setVideoErrors(true);
                toast.error("Error loading video");
              }}
            />
          </div>
        )}

        {/* Delete Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-red-600 rounded-[6px] text-white transition-colors"
          >
            <Icon icon="heroicons-outline:trash" className="text-lg" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoWidgetEditor;
