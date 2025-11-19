import { useState, useEffect } from "react";
import { getCountryCallingCode, AsYouType } from "libphonenumber-js";
import "./PhoneInput.css";

const PhoneInput = ({
  value = "",
  onChange,
  placeholder = "Phone Number",
  defaultCountry = "MY",
}) => {
  const [phoneNumber, setPhoneNumber] = useState(value);
  const [countryCode, setCountryCode] = useState(defaultCountry);
  const [countryCallingCode, setCountryCallingCode] = useState(() => {
    try {
      return getCountryCallingCode(defaultCountry);
    } catch {
      return "60";
    }
  });
  const [formattedNumber, setFormattedNumber] = useState("");
  const [maxLength, setMaxLength] = useState(15); // Максимальная длина по стандарту E.164

  // Инициализируем форматированный номер при изменении value извне
  useEffect(() => {
    if (value !== phoneNumber) {
      setPhoneNumber(value);
    }
  }, [value]);

  // Определяем максимальную длину номера для текущей страны
  useEffect(() => {
    if (!countryCode) return;

    try {
      // Пробуем определить максимальную длину для страны
      // Стандарт E.164: максимум 15 цифр (включая код страны)
      // Для большинства стран это 15 цифр, но некоторые могут иметь меньше
      const callingCode = getCountryCallingCode(countryCode);

      // Максимальная длина зависит от страны
      // Используем стандарт E.164: максимум 15 цифр включая код страны
      // Но учитываем, что код страны может быть 1-3 цифры
      // Поэтому максимальная длина самого номера = 15 - длина кода страны
      const codeLength = callingCode.toString().length;
      const maxNationalLength = 15 - codeLength;

      // Устанавливаем максимальную длину (включая + и код страны)
      setMaxLength(15);
    } catch (e) {
      // Если ошибка, используем стандартную длину
      setMaxLength(15);
    }
  }, [countryCode]);

  // Получаем первые 2 буквы кода страны
  const getCountryInitials = (code) => {
    return code
      ? code.substring(0, 2).toUpperCase()
      : defaultCountry.substring(0, 2).toUpperCase();
  };

  // Определяем страну и форматируем номер по мере ввода
  useEffect(() => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      // Если поле пустое, возвращаемся к стране по умолчанию
      setCountryCode(defaultCountry);
      setFormattedNumber("");
      try {
        setCountryCallingCode(getCountryCallingCode(defaultCountry));
      } catch {
        setCountryCallingCode("60");
      }
      return;
    }

    // Если только +, показываем его
    if (phoneNumber === "+") {
      setFormattedNumber("+");
      return;
    }

    try {
      // Проверяем максимальную длину перед форматированием
      const digitsOnly = phoneNumber.replace(/\D/g, "");
      if (digitsOnly.length > maxLength) {
        // Обрезаем до максимальной длины
        const trimmed = "+" + digitsOnly.substring(0, maxLength - 1);
        setPhoneNumber(trimmed);
        if (onChange) {
          onChange(trimmed);
        }
        return;
      }

      // Используем AsYouType с текущей страной как начальной точкой для более быстрого определения
      const formatter = new AsYouType(countryCode || defaultCountry);
      const formatted = formatter.input(phoneNumber);

      // Убеждаемся, что отформатированный номер начинается с +
      const formattedWithPlus = formatted.startsWith("+")
        ? formatted
        : "+" + formatted;

      // Обновляем отформатированный номер
      setFormattedNumber(formattedWithPlus);

      // Если определилась страна, сразу обновляем её (даже если она отличается от текущей)
      if (formatter.country && formatter.country !== countryCode) {
        setCountryCode(formatter.country);
        try {
          const callingCode = getCountryCallingCode(formatter.country);
          setCountryCallingCode(callingCode);
        } catch {
          // Оставляем текущий код
        }
      }
    } catch (e) {
      // Если ошибка форматирования, показываем номер как есть, но с +
      const displayValue = phoneNumber.startsWith("+")
        ? phoneNumber
        : "+" + phoneNumber;
      setFormattedNumber(displayValue);
    }
  }, [phoneNumber, countryCode, defaultCountry, maxLength]);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Если пользователь удалил +, добавляем его обратно
    if (!inputValue.startsWith("+") && inputValue.length > 0) {
      const newValue = "+" + inputValue.replace(/[^\d]/g, "");
      // Проверяем максимальную длину
      const digitsOnly = newValue.replace(/\D/g, "");
      if (digitsOnly.length > maxLength) {
        // Обрезаем до максимальной длины
        const trimmed = "+" + digitsOnly.substring(0, maxLength - 1);
        setPhoneNumber(trimmed);
        if (onChange) {
          onChange(trimmed);
        }
        setTimeout(() => {
          const input = e.target;
          const cursorPos = Math.min(input.selectionStart || 1, trimmed.length);
          input.setSelectionRange(cursorPos, cursorPos);
        }, 0);
        return;
      }
      setPhoneNumber(newValue);
      if (onChange) {
        onChange(newValue);
      }
      // Устанавливаем курсор после +
      setTimeout(() => {
        const input = e.target;
        const cursorPos = Math.min(input.selectionStart || 1, newValue.length);
        input.setSelectionRange(cursorPos, cursorPos);
      }, 0);
      return;
    }

    // Удаляем все нецифровые символы кроме +
    let cleanedValue = inputValue.replace(/[^\d+]/g, "");

    // Убеждаемся, что номер начинается с +
    if (cleanedValue && !cleanedValue.startsWith("+")) {
      cleanedValue = "+" + cleanedValue.replace(/\+/g, "");
    }

    // Проверяем максимальную длину (считаем только цифры, без +)
    const digitsOnly = cleanedValue.replace(/\D/g, "");
    if (digitsOnly.length > maxLength) {
      // Обрезаем до максимальной длины
      cleanedValue = "+" + digitsOnly.substring(0, maxLength - 1);
    }

    // Если поле пустое, оставляем пустым (будет обработано в handleFocus)
    if (!cleanedValue || cleanedValue === "") {
      cleanedValue = "";
    }

    setPhoneNumber(cleanedValue);

    if (onChange) {
      onChange(cleanedValue);
    }
  };

  const handleFocus = (e) => {
    // Если поле пустое, добавляем +
    const currentValue = e.target.value;
    if (!currentValue || currentValue.trim() === "") {
      const newValue = "+";
      setPhoneNumber(newValue);
      setFormattedNumber(newValue);
      if (onChange) {
        onChange(newValue);
      }
      // Устанавливаем курсор после +
      setTimeout(() => {
        e.target.setSelectionRange(1, 1);
      }, 0);
    } else if (!currentValue.startsWith("+")) {
      // Если номер есть, но без +, добавляем +
      const newValue = "+" + currentValue.replace(/[^\d]/g, "");
      setPhoneNumber(newValue);
      if (onChange) {
        onChange(newValue);
      }
      // Устанавливаем курсор после +
      setTimeout(() => {
        const cursorPos = Math.min(
          e.target.selectionStart || 1,
          newValue.length
        );
        e.target.setSelectionRange(cursorPos + 1, cursorPos + 1);
      }, 0);
    }
  };

  return (
    <div className="phone-input-container">
      {/* <label className="phone-input-label">{placeholder}</label> */}
      <div className="phone-input-wrapper">
        <div className="phone-input-country-code">
          <span className="country-initials">
            {getCountryInitials(countryCode)}
          </span>
          <span className="country-calling-code">(+{countryCallingCode})</span>
        </div>
        <input
          type="tel"
          className="phone-input-field"
          value={formattedNumber}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default PhoneInput;
