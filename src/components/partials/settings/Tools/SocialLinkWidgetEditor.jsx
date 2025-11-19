import React, { useState, useEffect, useRef } from "react";
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

// Глобальные переменные для хранения callbacks для leftColSocialLink
let leftColSocialLinkSaveCallback = null;
let leftColSocialLinkDeleteCallback = null;
export const setLeftColSocialLinkSaveCallback = (callback) => {
  leftColSocialLinkSaveCallback = callback;
};
export const setLeftColSocialLinkDeleteCallback = (callback) => {
  leftColSocialLinkDeleteCallback = callback;
};

// Доступные иконки социальных сетей
const availableIcons = [
  { name: "entypo-social:youtube-with-circle", label: "YouTube" },
  { name: "entypo-social:twitter", label: "Twitter" },
  { name: "entypo-social:pinterest", label: "Pinterest" },
  { name: "entypo-social:facebook", label: "Facebook" },
  { name: "entypo-social:instagram", label: "Instagram" },
  { name: "entypo-social:linkedin", label: "LinkedIn" },
  { name: "entypo-social:github", label: "GitHub" },
  { name: "entypo-social:dribbble", label: "Dribbble" },
  { name: "entypo-social:behance", label: "Behance" },
  { name: "entypo-social:vimeo", label: "Vimeo" },
];

const SocialLinkWidgetEditor = () => {
  const dispatch = useDispatch();
  const { widgetData, widgetType } = useSelector(
    (state) => state.project.widgetEditor
  );

  // Инициализируем данные виджета - начинаем с пустого массива
  const [socialLinks, setSocialLinks] = useState(
    widgetData?.socialLinks && widgetData.socialLinks.length > 0
      ? widgetData.socialLinks
      : []
  );

  useEffect(() => {
    if (widgetData?.socialLinks && widgetData.socialLinks.length > 0) {
      setSocialLinks(widgetData.socialLinks);
    } else {
      setSocialLinks([]);
    }
  }, [widgetData]);

  // При первом открытии редактора устанавливаем hasWidget = true, чтобы виджет отобразился в leftcol
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (
      isFirstMount.current &&
      widgetType === "leftColSocialLink" &&
      leftColSocialLinkSaveCallback
    ) {
      // Проверяем, есть ли уже данные - если нет, значит это первое открытие
      const hasData =
        widgetData?.socialLinks && widgetData.socialLinks.length > 0;
      if (!hasData) {
        // Устанавливаем виджет как добавленный, но с пустыми данными (будет показан с моками)
        leftColSocialLinkSaveCallback({ socialLinks: [] });
      }
      isFirstMount.current = false;
    }
  }, [widgetType, widgetData]);

  const handleLinkChange = (linkId, field, value) => {
    setSocialLinks((prev) =>
      prev.map((link) =>
        link.id === linkId ? { ...link, [field]: value } : link
      )
    );
  };

  const handleAddLink = () => {
    const newLink = {
      id: Date.now().toString(),
      icon: "entypo-social:twitter",
      url: "",
    };
    setSocialLinks((prev) => [...prev, newLink]);
  };

  const handleRemoveLink = (linkId) => {
    setSocialLinks((prev) => prev.filter((link) => link.id !== linkId));
  };

  const handleSave = () => {
    // Валидация: проверяем, что есть хотя бы одна ссылка
    if (socialLinks.length === 0) {
      toast.error("Add at least one link");
      return;
    }

    // Проверяем, что все ссылки заполнены
    const emptyLinks = socialLinks.filter(
      (link) => !link.url || link.url.trim() === ""
    );
    if (emptyLinks.length > 0) {
      toast.error("Fill in the URL for all links");
      return;
    }

    const savedData = { socialLinks };
    dispatch(
      updateWidgetData({
        data: savedData,
      })
    );

    // Если это leftColSocialLink, вызываем специальный callback
    if (widgetType === "leftColSocialLink" && leftColSocialLinkSaveCallback) {
      leftColSocialLinkSaveCallback(savedData);
      dispatch(saveWidget());
      dispatch(cancelWidgetEdit());
      // Устанавливаем флаг для сохранения проекта на сервер
      dispatch(setShouldSaveProject());
    } else {
      // Сохраняем виджет и проект на сервер (как в других виджетах)
      dispatch(saveWidgetAndProject());
    }
    // toast.success("Social links saved");
  };

  const handleCancel = () => {
    // Если это leftColSocialLink и данных нет - убираем виджет из leftcol
    if (widgetType === "leftColSocialLink") {
      const hasData = socialLinks && socialLinks.length > 0;
      if (!hasData && leftColSocialLinkDeleteCallback) {
        leftColSocialLinkDeleteCallback();
      }
    }
    dispatch(cancelWidgetEdit());
  };

  const handleDelete = () => {
    // Если это leftColSocialLink, вызываем специальный callback для удаления
    if (widgetType === "leftColSocialLink" && leftColSocialLinkDeleteCallback) {
      leftColSocialLinkDeleteCallback();
      dispatch(saveWidget());
      dispatch(cancelWidgetEdit());
    } else {
      // Сохраняем виджет и проект на сервер (как в других виджетах)
      dispatch(saveWidgetAndProject());
    }
    toast.success("Widget deleted");
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
            Social Links
          </span>
        </div>
        <Button
          text="Save"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6"
          onClick={handleSave}
        />
      </div>

      {/* Preview Area */}
      <div className="mb-6 bg-slate-900 rounded-[6px] p-4 min-h-[150px] flex items-center justify-center border-2 border-primary-500">
        {socialLinks.length > 0 ? (
          <div className="flex items-center justify-center gap-5">
            {socialLinks.map((link) => (
              <div
                key={link.id}
                className="text-white text-2xl py-1 transition-transform duration-300 hover:scale-110 cursor-pointer"
              >
                <Icon icon={link.icon} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-sm">Add social links</div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {socialLinks.length === 0 && (
          <div className="bg-slate-700 rounded-[6px] p-4 text-center text-slate-400">
            <p className="mb-3">No links added</p>
            <p className="text-sm">Click "Add link" to get started</p>
          </div>
        )}
        {socialLinks.map((link, index) => (
          <div
            key={link.id}
            className="bg-slate-700 rounded-[6px] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Link {index + 1}
              </span>
              {socialLinks.length > 1 && (
                <button
                  onClick={() => handleRemoveLink(link.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Icon icon="heroicons-outline:trash" className="text-lg" />
                </button>
              )}
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {availableIcons.map((icon) => (
                  <button
                    key={icon.name}
                    onClick={() => handleLinkChange(link.id, "icon", icon.name)}
                    className={`p-2 rounded-[6px] border-2 transition-colors ${
                      link.icon === icon.name
                        ? "border-primary-500 bg-primary-500/20"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <Icon
                      icon={icon.name}
                      className={`text-xl ${
                        link.icon === icon.name
                          ? "text-primary-400"
                          : "text-slate-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                URL *
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={link.url || ""}
                onChange={(e) =>
                  handleLinkChange(link.id, "url", e.target.value)
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ))}

        {/* Add Link Button */}
        <button
          onClick={handleAddLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-[6px] text-white transition-colors"
        >
          <Icon icon="heroicons-outline:plus" className="text-lg" />
          <span>Add link</span>
        </button>

        {/* Delete Widget Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-red-600 rounded-[6px] text-white transition-colors"
          >
            <Icon icon="heroicons-outline:trash" className="text-lg" />
            <span>Delete widget</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialLinkWidgetEditor;
