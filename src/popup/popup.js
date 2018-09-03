const reapplyFilters = () => {
  chrome.tabs.query({}, (tabs) => {
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

/* eslint-disable no-undef */
Papa.parse('../../res/countries.csv', {
/* eslint-enable no-undef */
  download: true,
  header: true,
  step: (row) => {
    const country = row.data[0];
    const code = country['alpha-2'];

    const flag = document.createElement('img');
    flag.classList.add('flag');
    flag.src = `http://s.4cdn.org/image/country/${code.toLowerCase()}.gif`;
    flag.title = country.name;
    flag.dataset.countryCode = code;
    flag.onclick = (event) => { blacklist(event.target); };

    const flagsContainer = document.querySelector('#flags');
    flagsContainer.appendChild(flag);
  },
  complete: () => { console.log('done!!!'); },
});
