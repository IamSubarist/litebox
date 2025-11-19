import React from "react";
import Tooltip from "@/components/ui/Tooltip";
import Icon from "@/components/ui/Icon";
import useSkin from "@/hooks/useSkin";

// Моки для отображения в leftcol когда данных нет
const mockLinks = [
  {
    id: "mock-1",
    icon: "entypo-social:youtube-with-circle",
    url: "#",
  },
  {
    id: "mock-2",
    icon: "entypo-social:twitter",
    url: "#",
  },
  {
    id: "mock-3",
    icon: "entypo-social:pinterest",
    url: "#",
  },
  {
    id: "mock-4",
    icon: "entypo-social:twitter",
    url: "#",
  },
];

const socialLink = ({
  redactor,
  circle,
  socialLinks,
  onEdit,
  showMock = false,
}) => {
  // Если showMock = true и данных нет, показываем моки
  const hasData = socialLinks && socialLinks.length > 0;
  const links = hasData ? socialLinks : showMock ? mockLinks : [];

  const handleClick = (e, url) => {
    if (redactor && onEdit) {
      e.preventDefault();
      e.stopPropagation();
      onEdit();
      return;
    }
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
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
        <div
          className={`absolute z-10 bg-blue-600 p-1 flex items-center gap-2 text-[12px] top-2 left-2 ${
            circle ? "rounded-[6px] p-2 left-3.5 top-3" : "rounded-[6px]"
          }`}
        >
          <Icon icon="el:wrench" />
        </div>
      ) : (
        ""
      )}
      <div
        className={`items-center justify-center gap-5 ${
          circle ? "flex-col mt-[30px]" : "flex"
        }`}
      >
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url || "#"}
            onClick={(e) => handleClick(e, link.url)}
            className={`text-white text-2xl py-1 transition-transform duration-300 hover:scale-110 cursor-pointer ${
              !hasData || !link.url || link.url === "#"
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            <Icon icon={link.icon} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default socialLink;
