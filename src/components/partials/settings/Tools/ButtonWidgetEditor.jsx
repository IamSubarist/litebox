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

// Глобальные переменные для хранения callbacks для leftColButtonWidget
let leftColButtonWidgetSaveCallback = null;
let leftColButtonWidgetDeleteCallback = null;
export const setLeftColButtonWidgetSaveCallback = (callback) => {
  leftColButtonWidgetSaveCallback = callback;
};
export const setLeftColButtonWidgetDeleteCallback = (callback) => {
  leftColButtonWidgetDeleteCallback = callback;
};

const ButtonWidgetEditor = () => {
  const dispatch = useDispatch();
  const { widgetData, widgetType } = useSelector(
    (state) => state.project.widgetEditor
  );

  // Инициализируем данные виджета - начинаем с пустого массива
  const [buttons, setButtons] = useState(
    widgetData?.buttons && widgetData.buttons.length > 0
      ? widgetData.buttons
      : []
  );

  useEffect(() => {
    if (widgetData?.buttons && widgetData.buttons.length > 0) {
      setButtons(widgetData.buttons);
    } else {
      setButtons([]);
    }
  }, [widgetData]);

  // При первом открытии редактора устанавливаем hasWidget = true, чтобы виджет отобразился в leftcol
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (
      isFirstMount.current &&
      widgetType === "leftColButtonWidget" &&
      leftColButtonWidgetSaveCallback
    ) {
      // Проверяем, есть ли уже данные - если нет, значит это первое открытие
      const hasData = widgetData?.buttons && widgetData.buttons.length > 0;
      if (!hasData) {
        // Устанавливаем виджет как добавленный, но с пустыми данными (будет показан с моками)
        leftColButtonWidgetSaveCallback({ buttons: [] });
      }
      isFirstMount.current = false;
    }
  }, [widgetType, widgetData]);

  const handleButtonChange = (buttonId, field, value) => {
    setButtons((prev) =>
      prev.map((button) =>
        button.id === buttonId ? { ...button, [field]: value } : button
      )
    );
  };

  const handleAddButton = () => {
    const newButton = {
      id: Date.now().toString(),
      text: "",
      link: "",
    };
    setButtons((prev) => [...prev, newButton]);
  };

  const handleRemoveButton = (buttonId) => {
    setButtons((prev) => prev.filter((button) => button.id !== buttonId));
  };

  const handleSave = () => {
    // Валидация: проверяем, что есть хотя бы одна кнопка
    if (buttons.length === 0) {
      toast.error("Add at least one button");
      return;
    }

    // Проверяем, что все кнопки заполнены
    const emptyButtons = buttons.filter(
      (button) => !button.text || button.text.trim() === ""
    );
    if (emptyButtons.length > 0) {
      toast.error("Fill in the text for all buttons");
      return;
    }

    const emptyLinks = buttons.filter(
      (button) => !button.link || button.link.trim() === ""
    );
    if (emptyLinks.length > 0) {
      toast.error("Fill in the link for all buttons");
      return;
    }

    const savedData = { buttons };
    dispatch(
      updateWidgetData({
        data: savedData,
      })
    );

    // Если это leftColButtonWidget, вызываем специальный callback
    if (
      widgetType === "leftColButtonWidget" &&
      leftColButtonWidgetSaveCallback
    ) {
      leftColButtonWidgetSaveCallback(savedData);
      dispatch(saveWidget());
      dispatch(cancelWidgetEdit());
      // Устанавливаем флаг для сохранения проекта на сервер
      dispatch(setShouldSaveProject());
    } else {
      // Сохраняем виджет и проект на сервер (как в других виджетах)
      dispatch(saveWidgetAndProject());
    }
    // toast.success("Buttons saved");
  };

  const handleCancel = () => {
    // Если это leftColButtonWidget и данных нет - убираем виджет из leftcol
    if (widgetType === "leftColButtonWidget") {
      const hasData = buttons && buttons.length > 0;
      if (!hasData && leftColButtonWidgetDeleteCallback) {
        leftColButtonWidgetDeleteCallback();
      }
    }
    dispatch(cancelWidgetEdit());
  };

  const handleDelete = () => {
    // Если это leftColButtonWidget, вызываем специальный callback для удаления
    if (
      widgetType === "leftColButtonWidget" &&
      leftColButtonWidgetDeleteCallback
    ) {
      leftColButtonWidgetDeleteCallback();
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
            Buttons
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
        {buttons.length > 0 ? (
          <div className="flex flex-col gap-2 w-full max-w-md">
            {buttons.map((button) => (
              <a
                key={button.id}
                href={button.link || "#"}
                className="btn btn inline-flex justify-center btn-outline-light text-white rounded-[999px] w-full"
              >
                <span>{button.text || "Button"}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-sm">Add buttons</div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {buttons.length === 0 && (
          <div className="bg-slate-700 rounded-[6px] p-4 text-center text-slate-400">
            <p className="mb-3">No buttons added</p>
            <p className="text-sm">Click "Add button" to get started</p>
          </div>
        )}
        {buttons.map((button, index) => (
          <div
            key={button.id}
            className="bg-slate-700 rounded-[6px] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Button {index + 1}
              </span>
              <button
                onClick={() => handleRemoveButton(button.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Icon icon="heroicons-outline:trash" className="text-lg" />
              </button>
            </div>

            {/* Text Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Button text *
              </label>
              <input
                type="text"
                placeholder="Enter button text"
                value={button.text || ""}
                onChange={(e) =>
                  handleButtonChange(button.id, "text", e.target.value)
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Link Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Link *
              </label>
              <input
                type="url"
                placeholder="https://example.com or /page"
                value={button.link || ""}
                onChange={(e) =>
                  handleButtonChange(button.id, "link", e.target.value)
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ))}

        {/* Add Button */}
        <button
          onClick={handleAddButton}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-[6px] text-white transition-colors"
        >
          <Icon icon="heroicons-outline:plus" className="text-lg" />
          <span>Add button</span>
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

export default ButtonWidgetEditor;
