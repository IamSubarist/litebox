import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import {
  updateWidgetData,
  saveWidget,
  saveWidgetAndProject,
  cancelWidgetEdit,
} from "@/pages/app/projects/store";
import DisplayWidgets from "@/components/widgets/dispalyWidgets";

const DisplayWidgetsEditor = () => {
  const dispatch = useDispatch();
  const { widgetData } = useSelector((state) => state.project.widgetEditor);

  const currentLayout = widgetData.layout || "single-row";
  const platform = widgetData.platform || "Instagram"; // Instagram, TikTok, YouTube

  // Маппинг layout для отображения
  const layoutMap = {
    "mixed-rows": "Grid",
    "two-rows": "Vertical Grid",
    "single-row": "Horizontal Grid",
    "custom-grid": "Grid & Follow Count",
  };

  const handleChange = (field, value) => {
    dispatch(updateWidgetData({ data: { [field]: value } }));
  };

  const handleSave = () => {
    dispatch(saveWidgetAndProject());
  };

  const handleCancel = () => {
    dispatch(cancelWidgetEdit());
  };

  const layouts = [
    {
      id: "mixed-rows",
      name: "Grid",
      description: "Masonry carousel grid layout",
      icon: (
        <div className="grid grid-cols-2 gap-1 relative">
          <div className="space-y-1">
            <div
              className={`w-8 h-10 rounded ${
                currentLayout === "mixed-rows"
                  ? "bg-primary-500"
                  : "bg-slate-400"
              }`}
            />
            <div
              className={`w-8 h-6 rounded ${
                currentLayout === "mixed-rows"
                  ? "bg-primary-500"
                  : "bg-slate-400"
              }`}
            />
          </div>
          <div className="space-y-1">
            <div
              className={`w-8 h-10 rounded ${
                currentLayout === "mixed-rows"
                  ? "bg-primary-500"
                  : "bg-slate-400"
              }`}
            />
            <div
              className={`w-8 h-6 rounded ${
                currentLayout === "mixed-rows"
                  ? "bg-primary-500"
                  : "bg-slate-400"
              }`}
            />
          </div>
        </div>
      ),
    },
    {
      id: "two-rows",
      name: "Vertical Grid",
      description: "Vertical carousel grid layout",
      icon: (
        <div className="grid grid-cols-2 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded ${
                currentLayout === "two-rows" ? "bg-primary-500" : "bg-slate-400"
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      id: "single-row",
      name: "Horizontal Grid",
      description: "Horizontal carousel grid layout",
      icon: (
        <div className="flex flex-row gap-1">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`w-8 h-[68px] rounded ${
                currentLayout === "single-row"
                  ? "bg-primary-500"
                  : "bg-slate-400"
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      id: "custom-grid",
      name: "Grid & Follow Count",
      description: "Masonry layout and follower count",
      icon: (
        <div className="grid grid-cols-2 gap-1 relative">
          <div className="space-y-1">
            <div
              className={`w-8 h-10 rounded ${
                currentLayout === "custom-grid"
                  ? "bg-primary-500"
                  : "bg-slate-400"
              }`}
            />
            <div
              className={`w-8 h-6 rounded ${
                currentLayout === "custom-grid"
                  ? "bg-primary-500"
                  : "bg-slate-400"
              }`}
            />
          </div>
          <div className="space-y-1">
            <div
              className={`w-8 h-6 rounded ${
                currentLayout === "custom-grid"
                  ? "bg-primary-500"
                  : "bg-slate-400"
              }`}
            />
            <div
              className={`w-8 h-10 rounded ${
                currentLayout === "custom-grid"
                  ? "bg-primary-500"
                  : "bg-slate-400"
              }`}
            />
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
            Display {platform}
          </span>
        </div>
        <Button
          text="Save"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6"
          onClick={handleSave}
        />
      </div>

      {/* Info Cards */}
      <div className="space-y-4 mb-6">
        {/* How to Connect */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-[6px] p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">i</span>
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-[#eee] text-lg font-semibold mb-1">
              How to Connect
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Log in with a Creator or Business account.
            </p>
          </div>
        </div>

        {/* Ways to Earn */}
        <div className="bg-green-900/30 border border-green-700 rounded-[6px] p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">$</span>
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-[#eee] text-lg font-semibold mb-1">
              Ways to Earn
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Native ads appear in your feed. Promote your page to increase
              clicks and earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Icon
            icon="heroicons-outline:cube"
            className="text-xl text-slate-400"
          />
          <h3 className="text-slate-900 dark:text-[#eee] text-lg font-semibold">
            Account
          </h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          Choose layout:
        </p>

        <div className="space-y-3">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              onClick={() => handleChange("layout", layout.id)}
              className={`cursor-pointer p-4 rounded-[6px] border-2 transition-all ${
                currentLayout === layout.id
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">{layout.icon}</div>
                <div className="flex-1">
                  <h4 className="text-slate-900 dark:text-[#eee] text-lg font-semibold mb-1">
                    {layout.name}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {layout.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connect Button */}
      <div className="mt-auto">
        <button className="w-full bg-white text-slate-900 font-medium py-3 rounded-[6px] hover:bg-slate-100 transition-colors">
          Connect {platform} Account
        </button>
      </div>
    </div>
  );
};

export default DisplayWidgetsEditor;
