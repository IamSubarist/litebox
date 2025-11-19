import React from "react";
import Card from "@/components/ui/Card";
import { Link } from "react-router-dom";
import cardImage2 from "@/assets/images/all-img/card-2.png";

const embetWidget = ({ small, data, onEdit, redactor }) => {
  // Добавьте onEdit и redactor
  // Используем данные из пропсов, если они переданы, иначе дефолтные
  const cardData = {
    title: data?.title || "Card Title",
    text:
      data?.text ||
      data?.embedUrl ||
      "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sintsin. Velit officia consequat duis enim of velit mollit.",
    image: cardImage2,
    link: data?.embedUrl || "#",
  };

  const handleContainerClick = (e) => {
    if (redactor) {
      e.preventDefault();
      e.stopPropagation();
      onEdit?.();
      return;
    }
    // Если не в режиме редактора, позволяем обычное поведение ссылки
  };

  return (
    <div className="space-y-5 overflow-hidden" onClick={handleContainerClick}>
      {small ? (
        // Маленький вид
        <a href={cardData.link} className="block overflow-hidden">
          <Card
            bodyClass="p-3 text-white"
            className="w-full max-w-full overflow-hidden"
          >
            <div className="flex items-center overflow-hidden">
              <div className="flex-0 mr-6 flex-shrink-0">
                <div className="author-img w-[120px] h-[120px] rounded-[6px] overflow-hidden">
                  <img
                    src={cardData.image}
                    alt={cardData.title}
                    className="w-full h-full object-cover rounded-[6px]"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <header className="mb-2">
                  <div className="card-title text-white truncate">
                    {cardData.title}
                  </div>
                </header>
                <div className="mb-4 text-base truncate">{cardData.text}</div>
              </div>
            </div>
          </Card>
        </a>
      ) : (
        // Большой вид
        <a href={cardData.link} className="block overflow-hidden">
          <Card
            bodyClass="p-0 text-white"
            className="w-full max-w-full overflow-hidden"
          >
            <div className="h-[250px] w-full p-5 overflow-hidden">
              <img
                src={cardData.image}
                alt={cardData.title}
                className="block w-full h-full object-cover rounded-[6px]"
              />
            </div>
            <div className="p-5 overflow-hidden">
              <header className="mb-2">
                <div className="card-title text-white truncate">
                  {cardData.title}
                </div>
              </header>
              <div className="text-[12px] truncate">{cardData.text}</div>
            </div>
          </Card>
        </a>
      )}
    </div>
  );
};

export default embetWidget;
