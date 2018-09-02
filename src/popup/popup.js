const reapplyFilters = () => {
  chrome.tabs.query({}, (tabs) => {
    // TODO: Reapply filters on every tab.
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { cmd: 'reapplyFilters' });
    });
  });
};

document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
  /* eslint-disable no-param-reassign */
  chrome.storage.sync.get([checkbox.id], (result) => { checkbox.checked = result[checkbox.id]; });

  checkbox.onchange = (event) => {
    const box = event.target;
    chrome.storage.sync.set(JSON.parse(`{"${box.id}": ${box.checked}}`));

    reapplyFilters();
  };
  /* eslint-enable no-param-reassign */
});

const move = (fragment, targetContainer) => {
  const duplicate = fragment.cloneNode();
  fragment.remove();
  targetContainer.appendChild(duplicate);
  return duplicate;
};

const whitelist = (flag) => {
  const white = document.querySelector('#flags');
  const whitelistedFlag = move(flag, white);
  /* eslint-disable no-use-before-define */
  whitelistedFlag.onclick = (event) => { blacklist(event.target); };
  /* eslint-enable no-use-before-define */

  chrome.storage.sync.get(['flags'], ({ flags }) => {
    chrome.storage.sync.set({
      flags: flags.filter(code => code !== whitelistedFlag.dataset.countryCode),
    });
    reapplyFilters();
  });
};

const blacklist = (flag) => {
  const black = document.querySelector('#blacklist');
  const blacklistedFlag = move(flag, black);
  blacklistedFlag.onclick = (event) => { whitelist(event.target); };

  chrome.storage.sync.get(['flags'], ({ flags }) => {
    const blacklistedFlags = flags || [];
    blacklistedFlags.push(blacklistedFlag.dataset.countryCode);
    chrome.storage.sync.set({ flags: blacklistedFlags });
    reapplyFilters();
  });
};

fetch('../../res/countries.json')
  .then(countries => countries.json())
  .then((countryCodes) => {
    countryCodes.forEach((code) => {
      const flag = document.createElement('img');
      flag.classList.add('flag');
      flag.src = `http://s.4cdn.org/image/country/${code.toLowerCase()}.gif`;
      flag.dataset.countryCode = code;
      flag.onclick = (event) => { blacklist(event.target); };
      const flagsContainer = document.querySelector('#flags');
      flagsContainer.appendChild(flag);
    });

    chrome.storage.sync.get(['flags'], ({ flags }) => {
      if (flags) {
        flags.forEach((countryCode) => {
          const flag = document.querySelector(`[data-country-code="${countryCode}"]`);
          blacklist(flag);
        });
      }
    });
  });
