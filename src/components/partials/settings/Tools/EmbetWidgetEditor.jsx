import React, { useState, Fragment } from "react";
import { Tab } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import {
  updateWidgetData,
  saveWidget,
  saveWidgetAndProject,
  cancelWidgetEdit,
} from "@/pages/app/projects/store";
import Card from "@/components/ui/Card";
import cardImage2 from "@/assets/images/all-img/card-2.png";

const EmbetWidgetEditor = () => {
  const dispatch = useDispatch();
  const { widgetData } = useSelector((state) => state.project.widgetEditor);
  const [activeTab, setActiveTab] = useState(0);

  const currentStyle = widgetData.style || "large";
  const embedUrl = widgetData.embedUrl || "";

  const handleChange = (field, value) => {
    dispatch(updateWidgetData({ data: { [field]: value } }));
  };

  const handleSave = () => {
    dispatch(saveWidgetAndProject());
  };

  const handleCancel = () => {
    dispatch(cancelWidgetEdit());
  };

  const styles = [
    {
      id: "small",
      name: "Small",
      description: "Small card style with compact layout.",
      preview: (
        <Card bodyClass="p-3">
          <div className="flex items-center">
            <div className="flex-0 mr-6">
              <div className="author-img w-[120px] h-[120px] rounded-[10px] overflow-hidden">
                <img
                  src={cardImage2}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
            </div>
            <div className="flex-1">
              <header className="mb-2">
                <div className="card-title">Title of the video</div>
              </header>
              <div className="mb-4 text-base">#hashtag #hashtag</div>
              <div className="text-sm text-slate-500">youtube.com</div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: "large",
      name: "Large",
      description: "Larger card style with more details.",
      preview: (
        <Card bodyClass="p-0">
          <div className="h-[200px] w-full p-5">
            <img
              src={cardImage2}
              alt="Preview"
              className="block w-full h-full object-cover rounded-[20px]"
            />
          </div>
          <div className="p-5">
            <header className="mb-2">
              <div className="card-title">Title of the video</div>
            </header>
            <div className="text-[12px]">#hashtag #hashtag</div>
            <div className="text-sm text-slate-500 mt-2">youtube.com</div>
          </div>
        </Card>
      ),
    },
  ];

  // Превью виджета на основе выбранного стиля
  const previewWidget =
    currentStyle === "small" ? (
      <Card bodyClass="p-3">
        <div className="flex items-center">
          <div className="flex-0 mr-6">
            <div className="author-img w-[120px] h-[120px] rounded-[10px] overflow-hidden">
              <img
                src={cardImage2}
                alt="Preview"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
          </div>
          <div className="flex-1">
            <header className="mb-2">
              <div className="card-title">Embed Preview</div>
            </header>
            <div className="mb-4 text-base truncate max-w-[150px]">
              {embedUrl || "Enter embed URL to see preview"}
            </div>
          </div>
        </div>
      </Card>
    ) : (
      <Card bodyClass="p-0">
        <div className="h-[250px] w-full p-5">
          <img
            src={cardImage2}
            alt="Preview"
            className="block w-full h-full object-cover rounded-[20px]"
          />
        </div>
        <div className="p-5">
          <header className="mb-2">
            <div className="card-title">Embed Preview</div>
          </header>
          <div className="text-[12px] truncate max-w-[150px]">
            {embedUrl || "Enter embed URL to see preview"}
          </div>
        </div>
      </Card>
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
            Embed
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
        <div className="w-full max-w-md">{previewWidget}</div>
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
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Embed URL *
              </label>
              <div className="relative">
                <Icon
                  icon="heroicons-outline:link"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl"
                />
                <input
                  type="url"
                  placeholder="https://example.com/embed"
                  value={embedUrl}
                  onChange={(e) => handleChange("embedUrl", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
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

export default EmbetWidgetEditor;
