const Storage = {
  serialize: (key, data) => {
    localStorage[key] = JSON.stringify(data);
  },

  unserialize: (key, defaultVal = '{}') => {
    return JSON.parse(localStorage[key] || defaultVal);
  },
};
