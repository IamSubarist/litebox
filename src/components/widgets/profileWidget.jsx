import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { getContentUrl } from "@/pages/app/projects/api";

const Profile = ({ redactor, circle, profil, profileData, onEdit }) => {
  const [imageUrl, setImageUrl] = useState(null);

  // Функция для получения URL изображения (обрабатывает File объекты и строки)
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image instanceof File) {
      // Если это File объект, используем object URL
      if (!imageUrl) {
        const url = URL.createObjectURL(image);
        setImageUrl(url);
        return url;
      }
      return imageUrl;
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof image === "string") {
      return getContentUrl(image);
    }
    return null;
  };

  // Используем данные из profileData или дефолтные значения
  const rawPhotoUrl = profileData?.photoUrl || profil;
  const photoUrl = getImageUrl(rawPhotoUrl);
  const name = profileData?.name || "Name";
  const text = profileData?.text || "Text under name";

  // Очистка object URL при размонтировании
  useEffect(() => {
    return () => {
      if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Очистка object URL при изменении изображения
  useEffect(() => {
    if (rawPhotoUrl && !(rawPhotoUrl instanceof File) && imageUrl) {
      if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPhotoUrl]);

  const handleClick = (e) => {
    if (redactor && onEdit) {
      e.preventDefault();
      e.stopPropagation();
      onEdit();
    }
  };

  return (
    <div
      className={`relative p-4 h-[400px] content-end ${
        redactor ? "rounded-[6px] mb-5 border border-primary-500 cursor-pointer" : ""
      }`}
      onClick={handleClick}
      style={{
        backgroundImage: circle
          ? "linear-gradient(to top, rgba(19, 21, 23, 1), transparent)"
          : `linear-gradient(to top, rgba(19, 21, 23, 1), transparent), url(${photoUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        // backgroundPosition: "center",
      }}
    >
      {redactor && (
        <div className="absolute z-10 bg-blue-600 p-1 rounded-[6px] flex items-center gap-2 text-[12px] top-2 left-2">
          <Icon icon="el:wrench" />
        </div>
      )}

      {circle ? (
        <div className="flex flex-col items-start gap-2">
          {/* Круглый аватар */}
          <img
            src={photoUrl}
            alt="Avatar"
            className="w-[200px] h-[200px] rounded-full object-cover border-2 border-white"
          />
          {/* Текст под аватаром */}
          <div>
            <div className="text-[20px] font-medium text-white">{name}</div>
            <p className="text-sm text-white/70">{text}</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-[30px] font-medium text-white mb-2">{name}</div>
          <p className="text-sm text-black-400">{text}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
