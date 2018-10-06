const Storage = {
  serialize: (key, data) => {
    localStorage[key] = JSON.stringify(data);
  },

  unserialize: (key, defaultVal = '{}') => {
    return JSON.parse(localStorage[key] || defaultVal);
  },

  appendToArray: (key, data) => {
    let arr = Storage.unserialize(key, '[]');
    arr.push(data);;
    Storage.serialize(key, arr);
  }
};
