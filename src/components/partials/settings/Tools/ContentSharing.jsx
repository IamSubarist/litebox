import React from "react";
import { useDispatch } from "react-redux";
import WidgetList from "./WidgetList";
import { openWidgetEditor } from "@/pages/app/projects/store";

const ContentSharing = ({ onAddBlock }) => {
  const dispatch = useDispatch();

  const cardData = [
    {
      icon: "/icons/emberLink.svg",
      title: "Embet",
      type: "embet",
      description: "Out link to an external website",
    },
  ];

  const handleEmbedLinkClick = () => {
    // Открываем селектор сервисов в боковом меню
    dispatch(
      openWidgetEditor({
        widgetType: "embedServiceSelector",
        widgetData: {},
      })
    );
  };

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-700 p-4 rounded-[6px] gap-3">
      <div>
        <p className="font-semibold">Share your content on Chirp:</p>
      </div>
      <div
        key={0}
        className="flex flex-col border border-slate-200 dark:border-slate-700 p-2 rounded-[6px] gap-3
       hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 duration-300 cursor-pointer"
        onClick={handleEmbedLinkClick}
      >
        <div>
          <img className="max-[500px]:w-full" src={cardData[0].icon} />
        </div>
        <div className="text-center">
          <p className="font-bold">Embed Link</p>
        </div>
      </div>
      <WidgetList onAddBlock={onAddBlock} />
    </div>
  );
};

export default ContentSharing;
