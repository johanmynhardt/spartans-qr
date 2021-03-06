const Store = {
  maidenSession: '2018-09-06',

  getCameraId: () => localStorage.cameraId,
  saveCameraId: id => localStorage.cameraId = id,

  getSessionId: () => localStorage.sessionId,
  saveSessionId: id => localStorage.sessionId = id,

  sessions: () => Storage.unserialize('sessions'),

  currentSession: () => (Store.getSessionId() || Store.maidenSession),

  listScans: () => {
    return {
      session: Store.currentSession(),
      scans: Session.sessionArrayGetter('scans')
    };
  },

  addScan: Session.sessionArraySerializerFor('scans'),

  translateToCsv: (collection) => {
    if (!collection || collection.length === 0) {
      return null;
    }
    return [Object.keys(collection[0]).join(',')]
      .concat(collection.map(row => Object.values(row).join(',')))
      .join('\n');
  },

  asCSV: () => {
    let scans = Session.sessionArrayGetter('scans');
    if (!scans) {
      return undefined;
    }
    return Store.translateToCsv(scans);
  },

  asHTML: () => {
    let buffer = [];
    let scans = Store.listScans().scans;
    console.debug('scans: ', scans);
    if (!scans || scans.length === 0) {
      return `<pre class="warning">No scans in store for current session.</pre>`;
    }
    let headers = Object.keys(scans[0]);

    buffer.push(`<table class="datatable">`);
    buffer.push(`<thead><tr>`);
    headers.forEach(header => buffer.push(`<th>${header}</th>`));
    buffer.push(`</tr></thead>`);

    buffer.push(`<tbody>`);
    scans.forEach(row => {
      buffer.push(`<tr>`);
      Object.values(row).forEach(field => buffer.push(`<td nowrap>${field}</td>`));
      buffer.push(`</tr>`);
    });
    buffer.push(`</tbody>`);

    return buffer.join('\n');
  },

  initiateDownload: (type, data, prefix = undefined) => {
    let blob = new Blob([data], {
      type: type
    });
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = [
      prefix ? `${prefix}-` : undefined,
      `${new Date().toISOString()}-`,
      new URL(new URL(link.href).pathname).pathname.substr(1),
      ((t) => (({
        ['application/json']: '.json',
        ['text/csv']: '.csv'
      })[t] || ''))(type)
    ].filter(x => x).join('');

    link.click();
  },

  exportCSV: () => {
    let csvData = Store.asCSV();
    if (!csvData) {
      instruction('No data available for export.');
      UI.toggleNav({});
      return;
    }

    Store.initiateDownload('text/csv', csvData, 'scans');
  },

  exportLapCSV: () => {
    let lapData = Timer.renderTimestamps(Timer.laps);
    let lapArr = Object.keys(lapData)
      .map(key => {
        return key === 'genesis' ?
          {
            lap: 0,
            timestamp: lapData[key],
            display: 'genesis'
          } : lapData[key];
      })
      .reduce((acc, next) => {
        acc.push(next);
        return acc;
      }, []);

    let lapCsv = Store.translateToCsv(lapArr);
    if (lapCsv) {
      Store.initiateDownload('text/csv', lapCsv, 'laps');
    } else {
      instruction('No data available for export.');
      UI.toggleNav({});
      return;
    }
  },

  exportStore: () => {
    let storeJson = {
      journal: Session.sessionObjectGetter('journal'),
      scans: Session.sessionObjectGetter('scans'),
      timer: Session.sessionObjectGetter('timer')
    };

    Store.initiateDownload('application/json', JSON.stringify(storeJson), 'journal');
  },

  purge: () => {
    if (window.confirm('Really WIPE out all records?')) {
      if (localStorage.scans) {
        localStorage.removeItem('scans');
      }

      Storage.serialize('sessions', {});
    }
  },

  discardManualEntry: () => {
    let manualForm = document.querySelector('.js-manual-form');
    UI.showDisplays(UI.scene.scanner);
    manualForm.querySelector('[name=name]').value = null;
    manualForm.querySelector('[name=id]').value = null;
    return null;
  },

  commitManualEntry: () => {
    let manualForm = document.querySelector('.js-manual-form');
    let name = manualForm.querySelector('[name=name]');
    let id = manualForm.querySelector('[name=id]');

    scanState.onScan([name.value, id.value].join(':'));

    name.value = null;
    id.value = null;
    return null;
  }
};
