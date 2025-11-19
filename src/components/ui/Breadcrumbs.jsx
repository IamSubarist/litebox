import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { menuItems } from "@/constant/data";
import Icon from "@/components/ui/Icon";

const Breadcrumbs = () => {
  const location = useLocation();
  const locationName = location.pathname.replace("/", "");

  const [isHide, setIsHide] = useState(null);
  const [groupTitle, setGroupTitle] = useState("");

  useEffect(() => {
    // Скрываем breadcrumbs на dashboard
    if (locationName === "dashboard") {
      setIsHide(true);
      setGroupTitle("");
      return;
    }

    const currentMenuItem = menuItems.find(
      (item) => item.link === locationName
    );

    const currentChild = menuItems.find((item) =>
      item.child?.find((child) => child.childlink === locationName)
    );

    if (currentMenuItem) {
      setIsHide(currentMenuItem.isHide);
    } else if (currentChild) {
      // Для дочерних элементов всегда показываем breadcrumbs
      // независимо от isHide родительского элемента
      setIsHide(false);
      // Не показываем группу для страницы profile
      if (
        locationName !== "profile" &&
        locationName !== "faq" &&
        locationName !== "products" &&
        locationName !== "project"
      ) {
        setGroupTitle(currentChild?.title);
      } else {
        setGroupTitle("");
      }
    } else {
      // Если страница не найдена в меню, показываем breadcrumbs по умолчанию
      setIsHide(false);
      setGroupTitle("");
    }
  }, [location, locationName]);

  return (
    <>
      {!isHide ? (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <ul className="breadcrumbs">
            <li className="text-primary-500">
              <NavLink to="/dashboard" className="text-lg">
                <Icon icon="heroicons-outline:home" />
              </NavLink>
              <span className="breadcrumbs-icon rtl:transform rtl:rotate-180">
                <Icon icon="heroicons:chevron-right" />
              </span>
            </li>
            {groupTitle && (
              <li className="text-primary-500">
                <button type="button" className="capitalize">
                  {groupTitle}
                </button>
                <span className="breadcrumbs-icon rtl:transform rtl:rotate-180">
                  <Icon icon="heroicons:chevron-right" />
                </span>
              </li>
            )}
            <li className="capitalize text-slate-500 dark:text-slate-400">
              {locationName}
            </li>
          </ul>
        </div>
      ) : null}
    </>
  );
};

export default Breadcrumbs;
