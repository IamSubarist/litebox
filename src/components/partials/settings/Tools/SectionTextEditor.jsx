import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import {
  updateWidgetData,
  saveWidget,
  saveWidgetAndProject,
  cancelWidgetEdit,
  removeProjectBlock,
} from "@/pages/app/projects/store";

const SectionTextEditor = () => {
  const dispatch = useDispatch();
  const { widgetData, editingBlockId } = useSelector(
    (state) => state.project.widgetEditor
  );

  const handleChange = (field, value) => {
    dispatch(updateWidgetData({ data: { [field]: value } }));
  };

  const handleSave = () => {
    dispatch(saveWidgetAndProject());
  };

  const handleCancel = () => {
    dispatch(cancelWidgetEdit());
  };

  const handleDelete = () => {
    if (editingBlockId) {
      dispatch(removeProjectBlock(editingBlockId));
      dispatch(cancelWidgetEdit());
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
            Section Title
          </span>
        </div>
        <Button
          text="Save"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6"
          onClick={handleSave}
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-4 flex-1">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Section Title *
          </label>
          <input
            type="text"
            placeholder="Add Section Title"
            value={widgetData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Link Text
          </label>
          <input
            type="text"
            placeholder="Add Link Text"
            value={widgetData.linkText || ""}
            onChange={(e) => handleChange("linkText", e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Link URL
          </label>
          <input
            type="url"
            placeholder="Add Link URL"
            value={widgetData.linkUrl || ""}
            onChange={(e) => handleChange("linkUrl", e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-[6px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Delete Button */}
      {editingBlockId && (
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-[6px] font-medium transition-colors"
          >
            <Icon icon="heroicons-outline:trash" className="text-lg" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default SectionTextEditor;
