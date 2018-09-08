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

  asHTML: () => {
    let buffer = [];
    let headers = Object.keys(store.listScans()[0]);

    buffer.push(`<table class="datatable">`);
    buffer.push(`<thead><tr>`);
    headers.forEach(header => buffer.push(`<th>${header}</th>`));
    buffer.push(`</tr></thead>`);

    buffer.push(`<tbody>`);
    store.listScans().forEach(row => {
      buffer.push(`<tr>`);
      Object.values(row).forEach(field => buffer.push(`<td nowrap>${field}</td>`));
      buffer.push(`</tr>`);
    })
    buffer.push(`</tbody>`);

    return buffer.join('\n');
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

const instruction = msg => {
  let instruction = document.querySelector('.js-instruction');
  instruction.innerText = msg;
};

const dd = {
  props: {
    logselector: '#log',
    tableselector: '.js-datatable'
  },

  clearLog: () => {
    [dd.props.logselector,dd.props.tableselector]
      .forEach(select => document.querySelector(select).innerHTML = '');
  },

  tabulateData: () => {
    dd.clearLog();
    document.querySelector(dd.props.tableselector).innerHTML = store.asHTML();
  }

}
