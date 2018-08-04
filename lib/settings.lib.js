/* Disable eslint errors for functions used in other files. */
/* eslint-disable no-unused-vars */

const settings = {
  getProperty: key => new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (!chrome.runtime.lastError) {
        resolve(result[key]);
      } else if (settings.default[key]) {
        resolve(settings.default[key]);
      } else {
        reject(chrome.runtime.lastError);
      }
    });
  }),

  default: {
    enabled: false,
    memeflags: false,
    flags: [],
  },
};
