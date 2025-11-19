import { data } from "autoprefixer";
import WidgetCard from "./WidgetCard";
const cardData = [
  {
    icon: "/widgetIcons/link.svg",
    title: "Link",
    type: "link",
    description: "Out link to an external website",
  },
  {
    icon: "/widgetIcons/carousel.svg",
    title: "Carousel",
    type: "carousel",
    description: "Create a carousel of images or videos",
  },
  {
    icon: "/widgetIcons/products.svg",
    title: "Products",
    type: "products",
    description: "Link your products or affiliate products",
  },
  // {
  //   icon: "/widgetIcons/promoVideo.svg",
  //   title: "Promo Video",
  //   type: "promoVideo",
  //   description: "Add a video to the top of your page",
  // },
  {
    icon: "/widgetIcons/sectionText.svg",
    title: "Section Text",
    type: "sectionText",
    description: "Include a title and button (if needed)",
  },
  {
    icon: "/widgetIcons/carousel.svg",
    title: "Price Table",
    type: "tablePrice",
    description: "Add to table price card and button",
  },
  {
    icon: "/widgetIcons/link.svg",
    title: "Social Links",
    type: "leftColSocialLink",
    description: "Add social media links to left column",
  },
  {
    icon: "/widgetIcons/link.svg",
    title: "Buttons",
    type: "leftColButtonWidget",
    description: "Add buttons to left column",
  },
];

const WidgetList = ({ onAddBlock }) => {
  return (
    <div className="flex flex-col gap-3">
      {cardData.map((item, index) => {
        return (
          <WidgetCard
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onClick={() => onAddBlock && onAddBlock(item.type, item)}
          />
        );
      })}
    </div>
  );
};

export default WidgetList;
