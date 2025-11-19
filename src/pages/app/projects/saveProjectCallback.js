// Глобальный callback для сохранения проекта на сервер
// Устанавливается из компонента index.jsx и вызывается из редакторов виджетов
let saveProjectCallback = null;

export const setSaveProjectCallback = (callback) => {
  saveProjectCallback = callback;
};

export const getSaveProjectCallback = () => {
  return saveProjectCallback;
};

