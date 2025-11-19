import React from "react";

const WidgetCard = ({ icon, title, description, onClick }) => {
  return (
    <div
      className="flex items-center justify-between border border-slate-200 dark:border-slate-700 
    p-2 rounded-[6px] gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-3 items-center">
        <div className="w-[50px] h-[50px] min-w-[50px] flex justify-center items-center border border-slate-200 p-2 rounded-[6px]">
          <img src={icon} alt="" className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm">{description}</p>
        </div>
      </div>
      <div>
        <img src="/widgetIcons/arrowRight.svg" alt="" />
      </div>
    </div>
  );
};

export default WidgetCard;
