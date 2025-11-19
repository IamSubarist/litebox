import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Icon from "@/components/ui/Icon";
import { cancelWidgetEdit, openWidgetEditor } from "@/pages/app/projects/store";

// Прямой импорт всех иконок
import appleMusicIcon from "@/assets/EmbedWidgetIcons/apple-music-svgrepo-com.svg";
import applePodcastsIcon from "@/assets/EmbedWidgetIcons/apple-podcasts-svgrepo-com.svg";
import soundcloudIcon from "@/assets/EmbedWidgetIcons/soundcloud-sound-cloud-svgrepo-com.svg";
import deezerIcon from "@/assets/EmbedWidgetIcons/deezer-svgrepo-com.svg";
import audiomackIcon from "@/assets/EmbedWidgetIcons/audiomack-svgrepo-com.svg";
import spotifyIcon from "@/assets/EmbedWidgetIcons/spotify-color-svgrepo-com.svg";
import tidalIcon from "@/assets/EmbedWidgetIcons/tidal-svgrepo-com.svg";
import youtubeIcon from "@/assets/EmbedWidgetIcons/youtube-color-svgrepo-com.svg";
import twitchIcon from "@/assets/EmbedWidgetIcons/twitch-network-communication-interaction-connection-svgrepo-com.svg";
import vimeoIcon from "@/assets/EmbedWidgetIcons/vimeo-color-svgrepo-com.svg";
import loomIcon from "@/assets/EmbedWidgetIcons/loom-svgrepo-com.svg";
import huluIcon from "@/assets/EmbedWidgetIcons/hulu-logo-svgrepo-com.svg";
import instagramIcon from "@/assets/EmbedWidgetIcons/instagram-1-svgrepo-com.svg";
import tiktokIcon from "@/assets/EmbedWidgetIcons/tiktok-svgrepo-com.svg";
import pinterestIcon from "@/assets/EmbedWidgetIcons/pinterest-svgrepo-com.svg";
import redditIcon from "@/assets/EmbedWidgetIcons/reddit-icon-svgrepo-com.svg";
import tumblrIcon from "@/assets/EmbedWidgetIcons/tumblr-181-svgrepo-com.svg";
import mediumIcon from "@/assets/EmbedWidgetIcons/medium-svgrepo-com.svg";
import patreonIcon from "@/assets/EmbedWidgetIcons/patreon-141-svgrepo-com.svg";
import gofundmeIcon from "@/assets/EmbedWidgetIcons/gofundme-svgrepo-com.svg";
import gumroadIcon from "@/assets/EmbedWidgetIcons/gumroad-svgrepo-com.svg";
import kickstarterIcon from "@/assets/EmbedWidgetIcons/kickstarter-kick-starter-crowdfunding-svgrepo-com.svg";
import etsyIcon from "@/assets/EmbedWidgetIcons/etsy-svgrepo-com.svg";
import amazonIcon from "@/assets/EmbedWidgetIcons/amazon-color-svgrepo-com.svg";
import airbnbIcon from "@/assets/EmbedWidgetIcons/airbnb-svgrepo-com.svg";
import bandsintownIcon from "@/assets/EmbedWidgetIcons/bandsintown-svgrepo-com.svg";
import eventbriteIcon from "@/assets/EmbedWidgetIcons/eventbrite-icon-svgrepo-com.svg";
import googleDriveIcon from "@/assets/EmbedWidgetIcons/google-drive-svgrepo-com.svg";
import dropboxIcon from "@/assets/EmbedWidgetIcons/dropbox-color-svgrepo-com.svg";
import airtableIcon from "@/assets/EmbedWidgetIcons/airtable-svgrepo-com.svg";
import behanceIcon from "@/assets/EmbedWidgetIcons/behance-163-svgrepo-com.svg";
import flickrIcon from "@/assets/EmbedWidgetIcons/flickr-svgrepo-com.svg";
import wikipediaIcon from "@/assets/EmbedWidgetIcons/wikipedia-svgrepo-com.svg";

// Маппинг filename -> импортированная иконка
const iconMap = {
  "apple-music-svgrepo-com.svg": appleMusicIcon,
  "apple-podcasts-svgrepo-com.svg": applePodcastsIcon,
  "soundcloud-sound-cloud-svgrepo-com.svg": soundcloudIcon,
  "deezer-svgrepo-com.svg": deezerIcon,
  "audiomack-svgrepo-com.svg": audiomackIcon,
  "spotify-color-svgrepo-com.svg": spotifyIcon,
  "tidal-svgrepo-com.svg": tidalIcon,
  "youtube-color-svgrepo-com.svg": youtubeIcon,
  "twitch-network-communication-interaction-connection-svgrepo-com.svg":
    twitchIcon,
  "vimeo-color-svgrepo-com.svg": vimeoIcon,
  "loom-svgrepo-com.svg": loomIcon,
  "hulu-logo-svgrepo-com.svg": huluIcon,
  "instagram-1-svgrepo-com.svg": instagramIcon,
  "tiktok-svgrepo-com.svg": tiktokIcon,
  "pinterest-svgrepo-com.svg": pinterestIcon,
  "reddit-icon-svgrepo-com.svg": redditIcon,
  "tumblr-181-svgrepo-com.svg": tumblrIcon,
  "medium-svgrepo-com.svg": mediumIcon,
  "patreon-141-svgrepo-com.svg": patreonIcon,
  "gofundme-svgrepo-com.svg": gofundmeIcon,
  "gumroad-svgrepo-com.svg": gumroadIcon,
  "kickstarter-kick-starter-crowdfunding-svgrepo-com.svg": kickstarterIcon,
  "etsy-svgrepo-com.svg": etsyIcon,
  "amazon-color-svgrepo-com.svg": amazonIcon,
  "airbnb-svgrepo-com.svg": airbnbIcon,
  "bandsintown-svgrepo-com.svg": bandsintownIcon,
  "eventbrite-icon-svgrepo-com.svg": eventbriteIcon,
  "google-drive-svgrepo-com.svg": googleDriveIcon,
  "dropbox-color-svgrepo-com.svg": dropboxIcon,
  "airtable-svgrepo-com.svg": airtableIcon,
  "behance-163-svgrepo-com.svg": behanceIcon,
  "flickr-svgrepo-com.svg": flickrIcon,
  "wikipedia-svgrepo-com.svg": wikipediaIcon,
};

// Функция для получения пути к иконке
const getIconPath = (filename) => {
  return iconMap[filename] || "";
};

// Категории фильтров
export const FILTER_CATEGORIES = {
  ALL: "all",
  MEDIA: "media",
  SOCIAL: "social",
  COMMERCE: "commerce",
  TOOLS: "tools",
  CREATIVE: "creative",
};

// Маппинг иконок к названиям сервисов и их категориям
const serviceMapping = {
  "apple-music-svgrepo-com.svg": {
    name: "Apple Music",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "apple-podcasts-svgrepo-com.svg": {
    name: "Podcast",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "soundcloud-sound-cloud-svgrepo-com.svg": {
    name: "SoundCloud",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "deezer-svgrepo-com.svg": {
    name: "Deezer",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "audiomack-svgrepo-com.svg": {
    name: "Audiomack",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "spotify-color-svgrepo-com.svg": {
    name: "Spotify",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "tidal-svgrepo-com.svg": { name: "Tidal", category: FILTER_CATEGORIES.MEDIA },
  "youtube-color-svgrepo-com.svg": {
    name: "YouTube",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "twitch-network-communication-interaction-connection-svgrepo-com.svg": {
    name: "Twitch",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "vimeo-color-svgrepo-com.svg": {
    name: "Vimeo",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "loom-svgrepo-com.svg": { name: "Loom", category: FILTER_CATEGORIES.MEDIA },
  "hulu-logo-svgrepo-com.svg": {
    name: "Hulu",
    category: FILTER_CATEGORIES.MEDIA,
  },
  "instagram-1-svgrepo-com.svg": {
    name: "Instagram",
    category: FILTER_CATEGORIES.SOCIAL,
  },
  "tiktok-svgrepo-com.svg": {
    name: "TikTok",
    category: FILTER_CATEGORIES.SOCIAL,
  },
  "pinterest-svgrepo-com.svg": {
    name: "Pinterest",
    category: FILTER_CATEGORIES.SOCIAL,
  },
  "reddit-icon-svgrepo-com.svg": {
    name: "Reddit",
    category: FILTER_CATEGORIES.SOCIAL,
  },
  "tumblr-181-svgrepo-com.svg": {
    name: "Tumblr",
    category: FILTER_CATEGORIES.SOCIAL,
  },
  "medium-svgrepo-com.svg": {
    name: "Medium",
    category: FILTER_CATEGORIES.SOCIAL,
  },
  "patreon-141-svgrepo-com.svg": {
    name: "Patreon",
    category: FILTER_CATEGORIES.COMMERCE,
  },
  "gofundme-svgrepo-com.svg": {
    name: "GoFundMe",
    category: FILTER_CATEGORIES.COMMERCE,
  },
  "gumroad-svgrepo-com.svg": {
    name: "Gumroad",
    category: FILTER_CATEGORIES.COMMERCE,
  },
  "kickstarter-kick-starter-crowdfunding-svgrepo-com.svg": {
    name: "Kickstarter",
    category: FILTER_CATEGORIES.COMMERCE,
  },
  "etsy-svgrepo-com.svg": {
    name: "Etsy",
    category: FILTER_CATEGORIES.COMMERCE,
  },
  "amazon-color-svgrepo-com.svg": {
    name: "Amazon",
    category: FILTER_CATEGORIES.COMMERCE,
  },
  "airbnb-svgrepo-com.svg": {
    name: "Airbnb",
    category: FILTER_CATEGORIES.COMMERCE,
  },
  "bandsintown-svgrepo-com.svg": {
    name: "Bandsintown",
    category: FILTER_CATEGORIES.COMMERCE,
  },
  "eventbrite-icon-svgrepo-com.svg": {
    name: "Eventbrite",
    category: FILTER_CATEGORIES.COMMERCE,
  },
  "google-drive-svgrepo-com.svg": {
    name: "Google Drive",
    category: FILTER_CATEGORIES.TOOLS,
  },
  "dropbox-color-svgrepo-com.svg": {
    name: "Dropbox",
    category: FILTER_CATEGORIES.TOOLS,
  },
  "airtable-svgrepo-com.svg": {
    name: "Airtable",
    category: FILTER_CATEGORIES.TOOLS,
  },
  "wikipedia-svgrepo-com.svg": {
    name: "Wikipedia",
    category: FILTER_CATEGORIES.TOOLS,
  },
  "behance-163-svgrepo-com.svg": {
    name: "Behance",
    category: FILTER_CATEGORIES.CREATIVE,
  },
  "flickr-svgrepo-com.svg": {
    name: "Flickr",
    category: FILTER_CATEGORIES.CREATIVE,
  },
};

// Получаем все иконки и создаем массив сервисов
const getServiceList = (filterCategory = FILTER_CATEGORIES.ALL) => {
  const services = [];
  for (const [filename, serviceData] of Object.entries(serviceMapping)) {
    if (
      filterCategory === FILTER_CATEGORIES.ALL ||
      serviceData.category === filterCategory
    ) {
      services.push({
        filename,
        name: serviceData.name,
        category: serviceData.category,
      });
    }
  }
  return services.sort((a, b) => a.name.localeCompare(b.name));
};

const EmbedServiceSelector = () => {
  const dispatch = useDispatch();
  const [linkUrl, setLinkUrl] = useState("");
  const [activeFilter, setActiveFilter] = useState(FILTER_CATEGORIES.ALL);
  const services = getServiceList(activeFilter);

  // Автоматическое сохранение через 3 секунды после остановки ввода
  useEffect(() => {
    if (!linkUrl.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      // Если введена ссылка, создаем embet виджет с этой ссылкой
      dispatch(
        openWidgetEditor({
          widgetType: "embet",
          widgetData: {
            style: "large",
            embedUrl: linkUrl.trim(),
            selectedService: null,
          },
        })
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [linkUrl, dispatch]);

  const handleCancel = () => {
    dispatch(cancelWidgetEdit());
  };

  const handleServiceSelect = (service) => {
    // После выбора сервиса открываем редактор embet
    dispatch(
      openWidgetEditor({
        widgetType: "embet",
        widgetData: {
          style: "large",
          embedUrl: linkUrl || "",
          selectedService: service,
        },
      })
    );
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      // Если введена ссылка, создаем embet виджет с этой ссылкой
      dispatch(
        openWidgetEditor({
          widgetType: "embet",
          widgetData: {
            style: "large",
            embedUrl: linkUrl.trim(),
            selectedService: null,
          },
        })
      );
    }
  };

  const filterButtons = [
    {
      id: FILTER_CATEGORIES.ALL,
      label: "All",
      icon: "heroicons-outline:squares-2x2",
    },
    {
      id: FILTER_CATEGORIES.MEDIA,
      label: "Media",
      icon: "heroicons-outline:video-camera",
    },
    {
      id: FILTER_CATEGORIES.SOCIAL,
      label: "Social",
      icon: "heroicons-outline:user",
    },
    {
      id: FILTER_CATEGORIES.COMMERCE,
      label: "Commerce",
      icon: "heroicons-outline:shopping-cart",
    },
    {
      id: FILTER_CATEGORIES.TOOLS,
      label: "Tools",
      icon: "heroicons-outline:wrench-screwdriver",
    },
    {
      id: FILTER_CATEGORIES.CREATIVE,
      label: "Creative",
      icon: "heroicons-outline:paint-brush",
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
            Embed Link
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Поле ввода ссылки */}
        <form onSubmit={handleLinkSubmit} className="mb-4">
          <div className="relative">
            <Icon
              icon="heroicons-outline:link"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg z-10"
            />
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Link"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[6px] text-slate-900 dark:text-[#eee] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-sm"
            />
          </div>
        </form>

        {/* Фильтры */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {filterButtons.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-[#eee] px-4 py-2 rounded-full"
                    : "w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
                }`}
                title={!isActive ? filter.label : ""}
              >
                <Icon icon={filter.icon} className="text-lg" />
                {isActive && (
                  <span className="text-sm font-medium">{filter.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Заголовок */}
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Choose Embed Type:
        </p>

        {/* Сетка сервисов */}
        <div className="grid grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.filename}
              onClick={() => handleServiceSelect(service)}
              className="flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 rounded-[6px] p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-300"
            >
              <div className="mb-3 flex items-center justify-center h-16 w-16">
                <img
                  src={getIconPath(service.filename)}
                  alt={service.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    console.error("Failed to load icon:", service.filename);
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-[#eee] text-center">
                {service.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmbedServiceSelector;
