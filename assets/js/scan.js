const toggleHidden = el => {
  if (el.hidden) {
    el.removeAttribute('hidden');
  } else {
    el.setAttribute('hidden', true);
  }
}

const toggleConfig = event => {
  event.preventDefault();
  let config = document.querySelector('div.js-config');
  let content = document.querySelector('div.js-content');

  [config, content].forEach(toggleHidden);
};

const toggleNav = event => {
  event.preventDefault();
  let nav = document.querySelector('nav');
  nav.hidden = !(nav.hidden);
};

const store = {
  listScans: () => JSON.parse(localStorage.scans || '[]'),
  getCameraId: () => localStorage.cameraId,
  saveCameraId: id => localStorage.cameraId = id,
  addScan: (scan) => {
    let scans = store.listScans();
    scans.push(scan);
    localStorage.scans = JSON.stringify(scans);
    return {
      scan: scan,
      scanCount: scans.length
    };
  },
  asCSV: () => {
    return [Object.keys(store.listScans()[0]).join(',')]
      .concat(store.listScans().map(row => Object.values(row).join(',')))
      .join('\n');
  },
  purge: () => {
    if (window.confirm('Really WIPE out all records?')) {
      localStorage.scans = JSON.stringify([]);
    }
  }
};

const exportCSV = () => {
  let blob = new Blob([store.asCSV()], {
    type: 'text/csv'
  });
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.click();
};

const log = (msg) => {
  console.log('got msg: ', msg);
  let loge = document.querySelector('#log');
  loge.innerHTML = msg + "\n" + loge.innerHTML;
}
