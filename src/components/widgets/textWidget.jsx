import React from "react";

const textWidget = ({ data, onEdit, redactor }) => {
  const title = data?.title || "Good evening,";
  const linkText = data?.linkText || "Welcome to Dashcode";
  const linkUrl = data?.linkUrl || "/projects";

  const handleContainerClick = (e) => {
    // Если клик по ссылке, не открываем редактор
    if (redactor) {
      e.preventDefault();
      e.stopPropagation();
      onEdit?.();
      return;
    }
    else{
      return;
    }

    // if (e.target.closest("a")) {
    // }
    // // Иначе открываем редактор
    // if (onEdit) {
    //   e.stopPropagation();
    //   onEdit();
    // }
  };

  return (
    <div
      className="space-y-5 relative group cursor-pointer"
      onClick={handleContainerClick}
    >
      <a href={linkUrl}>
        <div className={`grid grid-cols-1 gap-5`}>
          <div className="bg-no-repeat bg-cover bg-center py-5 rounded-[6px] relative flex items-center">
            <div className="flex justify-between h-full w-full">
              <div className="text-xl font-medium text-white mt-2">
                <span className="block font-normal">{title}</span>
              </div>
              {linkText && (
                <p className="inline-block text-sm text-white font-normal border border-white px-2 py-1 rounded self-start">
                  {linkText}
                </p>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default textWidget;
