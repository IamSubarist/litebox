import React from "react";
import CheckImage from "@/assets/images/icon/ck-white.svg";
const Checkbox = ({
  id,
  disabled,
  label,
  value,
  name,
  onChange,
  error = false,
  activeClass = "ring-black-500  bg-slate-900 dark:bg-slate-700 dark:ring-slate-700 ",
  errorClass = "ring-red-500 border-red-500 bg-red-500 dark:ring-red-600 dark:border-red-600 dark:bg-red-600",
}) => {
  return (
    <label
      className={`flex items-center min-w-0 ${
        disabled ? " cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      id={id}
    >
      <input
        type="checkbox"
        className="hidden"
        name={name}
        checked={value}
        onChange={onChange}
        htmlFor={id}
        disabled={disabled}
      />
      <span
        className={`h-4 w-4 border flex-none border-slate-100 dark:border-slate-800 rounded 
        inline-flex ltr:mr-3 rtl:ml-3 relative transition-all duration-150
        ${
          error
            ? errorClass + " ring-2 ring-offset-2 dark:ring-offset-slate-800"
            : value
            ? activeClass + " ring-2 ring-offset-2 dark:ring-offset-slate-800 "
            : "bg-slate-100 dark:bg-slate-600 dark:border-slate-600"
        }
        `}
      >
        {value && (
          <img
            src={CheckImage}
            alt=""
            className="h-[10px] w-[10px] block m-auto"
          />
        )}
      </span>
      <span className="text-slate-500 dark:text-slate-400 text-sm leading-6 truncate overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
