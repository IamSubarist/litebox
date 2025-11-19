import React from "react";
import Icon from "@/components/ui/Icon";

// Моки для отображения в leftcol когда данных нет
const mockButtons = [
  { id: "mock-1", text: "Follow me", link: "#" },
  { id: "mock-2", text: "Contact", link: "#" },
];

const ButtonWidget = ({
  redactor,
  grid,
  border,
  buttons,
  onEdit,
  showMock = false,
}) => {
  // Если showMock = true и данных нет, показываем моки
  const hasData = buttons && buttons.length > 0;
  const buttonsData = hasData ? buttons : showMock ? mockButtons : [];
  const gridLayout = grid !== undefined ? grid : false;
  const borderStyle = border !== undefined ? border : true;

  const handleClick = (e, link) => {
    if (redactor && onEdit) {
      e.preventDefault();
      e.stopPropagation();
      onEdit();
      return;
    }
    if (!link || link === "#") {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`bg-no-repeat bg-cover bg-center p-4 relative h-fill ${
        redactor
          ? "rounded-[6px] mb-5 border border-primary-500 cursor-pointer"
          : ""
      }`}
      onClick={(e) => {
        if (redactor && onEdit) {
          e.stopPropagation();
          onEdit();
        }
      }}
    >
      {redactor ? (
        <div className="absolute z-10 bg-blue-600 p-1 rounded-[6px] flex items-center gap-2 text-[12px] top-2 left-2">
          <Icon icon="el:wrench" />
        </div>
      ) : (
        ""
      )}

      <div
        className={`text-center justify-center gap-2 flex flex-col items-center`}
      >
        {buttonsData.map((button) => (
          <a
            key={button.id}
            href={button.link || "#"}
            onClick={(e) => handleClick(e, button.link)}
            type="button"
            className={`btn btn inline-flex justify-center btn${
              borderStyle ? "-outline" : ""
            }-light ${
              borderStyle ? "text-white" : "text-balck"
            } rounded-[999px] flex-1 min-w-[343px] max-w-[343px] ${
              !hasData || !button.link || button.link === "#"
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            <span className="flex items-center gap-2">
              {button.icon && <Icon icon={button.icon} />}
              <span>{button.text}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ButtonWidget;
