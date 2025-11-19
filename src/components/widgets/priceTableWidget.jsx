import React from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

const PriceTableWidget = () => {
  const cards = [
    {
      img: "emojione-v1:up-pointing-airplane",
      title: "Personal",
      features: ["Custom domains", "Sleeps after 30 mins of inactivity"],
      price: "Free",
      button: "Buy",
    },
    {
      img: "streamline-freehand-color:send-email-paper-plane-1",
      title: "Small tea",
      features: ["Never sleeps", "Multiple workers for more powerful apps"],
      price: "$150",
      button: "Buy",
      featured: true,
    },
    {
      img: "fluent-emoji-flat:rocket",
      title: "Enterprise",
      features: ["Dedicated", "Simple horizontal scalability"],
      price: "$400",
      button: "Buy",
    },
  ];

  return (
    <div className="relative z-[10] max-w-[1250px] w-full mx-auto pt-[50px]">
      <div
        className="
          rounded-[10px] py-[15px] md:py-[25px]
          shadow-[0px_10px_13px_-6px_rgba(0,0,0,0.08),0px_20px_31px_3px_rgba(0,0,0,0.09),0px_8px_20px_7px_rgba(0,0,0,0.02)]
          flex flex-wrap justify-start gap-[20px] md:gap-[25px] xl:gap-[6px]
        "
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="
              flex flex-col items-center text-center uppercase justify-between
              rounded-[10px] border border-[#e1f1ff]
              flex-1 min-w-[344px] md:min-w-[344px] max-w-[344px]
              p-[25px] md:p-[25px_30px] transition-transform duration-300 hover:-translate-y-[4px]
            "
          >
            <div>
              <Icon icon={card.img} className="mb-[25px] mx-auto h-[100px] w-[100px]"/>
              {/* <img
                src={card.img}
                alt={card.title}
                className="mb-[25px] max-w-full mx-auto"
              /> */}
              <h2 className="text-[#cbd5e1] font-semibold tracking-[1px] mb-4">
                {card.title}
              </h2>
            </div>

            <ul className="font-semibold tracking-[1px] my-[40px] w-full">
              {card.features.map((f, j) => (
                <li
                  key={j}
                  className={`text-[12px] py-[15px] border-t border-[#e1f1ff] text-[#cbd5e1] ${
                    j === card.features.length - 1 ? "border-b" : ""
                  }`}
                >
                  {f}
                </li>
              ))}
            </ul>

            <div>
              <span className="block text-[32px] font-bold mb-[20px] text-[#cbd5e1]">
              {card.price}
            </span>

            <Button
              icon="tdesign:money"
              text={card.button}
              className={`bg-gray-600 hover:bg-gray-700  text-white h-min text-sm font-normal`}
              iconClass="text-lg"
            />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTableWidget;
