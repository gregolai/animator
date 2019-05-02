export const createPersist = (namespace, defaultsMap) => {
  return Object.keys(defaultsMap).reduce((persist, key) => {
    const persistKey = `${namespace}.${key}`;
    const defaultValue = defaultsMap[key];

    persist[key] = {
      read: () => {
        // We want null to be a valid store value, but localStorage.getItem
        // returns null if the item's not found. To prevent this, we first need
        // to check if the key exists.
        if (!localStorage.hasOwnProperty(persistKey)) {
          return defaultValue;
        }
        return JSON.parse(localStorage.getItem(persistKey));
      },
      write: value => {
        localStorage.setItem(persistKey, JSON.stringify(value));
      }
    };
    return persist;
  }, {});
};
