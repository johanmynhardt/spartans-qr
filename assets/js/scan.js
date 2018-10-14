const UI = {
  scene: {
    scanner: ['.js-scanner-actions', '.js-data', '.js-preview'],
    timer: ['.js-stopwatch', '.js-stopwatch-actions', '.js-stopwatch-laps'],
    qrgenerate: ['.js-qr-generate']
  },

  setHidden: (selector, trueOrFalse) => {
    let el = document.querySelector(selector);
    if (trueOrFalse) {
      el.setAttribute('hidden', true);
    } else {
      el.removeAttribute('hidden');
    }
  },

  setElHidden: (el, trueOrFalse) => {
    if (trueOrFalse) {
      el.setAttribute('hidden', true);
    } else {
      el.removeAttribute('hidden');
    }
  },

  toggleHidden: el => {
    if (el.hidden) {
      el.removeAttribute('hidden');
    } else {
      el.setAttribute('hidden', true);
    }
  },

  toggleBySelector: selector => {
    UI.toggleHidden(document.querySelector(selector));
  },

  toggleNav: event => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    UI.toggleBySelector('nav');
  },

  showManualForm: () => {
    optics.stopScan();
    UI.showDisplays(['.js-manual-form']);
    return null;
  },

  showDisplays: (toDisplay = []) => {
    // document.querySelector('.js-content')
      document.querySelectorAll('[data-display]')
      .forEach(x => UI.setElHidden(x, true));

    toDisplay.forEach(sel => {
      UI.setElHidden(document.querySelector(sel), false);
    })
  }
};

const store = {
  maidenSession: '2018-09-06',

  getCameraId: () => localStorage.cameraId,
  saveCameraId: id => localStorage.cameraId = id,

  getSessionId: () => localStorage.sessionId,
  saveSessionId: id => localStorage.sessionId = id,

  sessions: () => Storage.unserialize('sessions'),

  currentSession: () => (store.getSessionId() || store.maidenSession),

  listScans: () => {
    let session = store.currentSession();
    return {
      session: session,
      scans: Session.sessionArrayGetter('scans')
    };
  },

  addScan: (scan) => {
    let sessions = store.sessions();
    let session = sessions[store.currentSession()];
    let scans = (sessions[store.currentSession()].scans || []);
    scans.push(scan);

    session.scans = scans;
    sessions[store.currentSession()] = session;
    Storage.serialize('sessions', sessions);

    return {
      scan: scan,
      scanCount: scans.length
    };
  },

  translateToCsv: (collection) => {
    if (!collection) {
      return undefined;
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
    return store.translateToCsv(scans);
  },

  asHTML: () => {
    let buffer = [];
    let scans = store.listScans().scans;
    if (!scans) {
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
    })
    buffer.push(`</tbody>`);

    return buffer.join('\n');
  },

  initiateDownload: (type, data) => {
    let blob = new Blob([data], {
      type: type
    });
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = new URL(new URL(link.href).pathname).pathname.substr(1) +
      ((t) => (({
        ['application/json']: '.json',
        ['text/csv']: '.csv'
      })[t] || ''))(type);
    link.click();
  },

  exportCSV: () => {
    let csvData = store.asCSV();
    if (!csvData) {
      instruction('No data available for export.');
      UI.toggleNav({});
      return;
    }

    store.initiateDownload('text/csv', csvData);
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

    let lapCsv = store.translateToCsv(lapArr);
    store.initiateDownload('text/csv', lapCsv);
  },

  exportStore: () => {
    let storeJson = {
      journal: Session.sessionObjectGetter('journal'),
      scans: Session.sessionObjectGetter('scans'),
      timer: Session.sessionObjectGetter('timer')
    };

    store.initiateDownload('application/json', JSON.stringify(storeJson));
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
    UI.showDisplays(['.js-preview', '.js-data']);
    manualForm.querySelector('[name=name]').value = null;
    manualForm.querySelector('[name=id]').value = null;
    return null;
  },

  commitManualEntry: () => {
    let manualForm = document.querySelector('.js-manual-form');
    let name = manualForm.querySelector('[name=name]');
    let id = manualForm.querySelector('[name=id]');

    let content = [name.value, id.value].join(':');
    scanState.onScan(content);

    ['.js-manual-form', '.js-preview'].forEach(UI.toggleBySelector);

    name.value = null;
    id.value = null;
    return null;
  }
};

const log = (msg) => {
  console.log('got msg: ', msg);
  instruction(msg);
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
    [dd.props.logselector, dd.props.tableselector]
    .forEach(select => document.querySelector(select).innerHTML = '');
  },

  tabulateData: () => {
    dd.clearLog();
    document.querySelector(dd.props.tableselector).innerHTML = store.asHTML();
  }

};

const optics = {
  scanner: undefined,
  camera: undefined,

  scan: () => {
    if (!document.querySelector('.js-manual-form').hidden) {
      ['.js-manual-form', '.js-preview'].forEach(UI.toggleBySelector);
    }
    if (optics.scanner && optics.camera) {
      optics.scanner.start(optics.camera);
      ['.js-button-scan', '.js-button-stop-scan']
      .map(select => document.querySelector(select))
        .forEach(UI.toggleHidden);
    } else {
      alert('please select a camera!');
    }
  },

  stopScan: () => {
    if (optics.scanner) {
      optics.scanner.stop();
      UI.setHidden('.js-button-scan', false);
      UI.setHidden('.js-button-stop-scan', true);
    }
  },

  selectCamera: (targetCamera) => {
    Instascan.Camera.getCameras()
      .then(function(cameras) {
        let camToUse = cameras.filter(cam => cam.id === targetCamera)[0];
        optics.camera = camToUse;
        if (camToUse) {
          optics.camera = camToUse;
          store.saveCameraId(camToUse.id);
        } else {
          alert('No usable camera found.');
        }
      }).catch(function(e) {
        log(`error: ${e}`);
      });
  }
};

const scanState = {
  module: 'scanState',
  seq: null,
  id: null,
  name: null,
  lastScan: null,

  started: () => !!(scanState.seq || scanState.id || scanState.name),

  complete: () => !!(scanState.seq && scanState.id && scanState.name),

  reset: () => {
    scanState.seq = null;
    scanState.id = null;
    scanState.name = null;
  },

  render: () => {
      document.querySelector('.js-scan-name').value = scanState.name;
      document.querySelector('.js-scan-seq').value = scanState.seq;
  },

  capture: () => {
    let scan = {
      seq: scanState.seq,
      name: scanState.name,
      id: scanState.id,
      timestamp: new Date().toISOString()
    };
    store.addScan(scan);

    scanState.lastScan = `(${scan.seq}) ${scan.name}`;

    log(`Scan captured: (${scan.seq}) ${scan.name}`);

    scanState.reset();
  },

  onScan: (content) => {
    optics.stopScan();
    Journal.capture('onScan.content', content);

    let scanResult = scanState.handlers
      .filter(h => h.test(content))
      .map(h => [h.name, h.fn(content)])
      .filter(x => x);

      if (scanResult.length === 0) {
        Journal.capture('onScan.no-scan-result', content);

        let colAct = {
          ['background-light-red']: 'add',
          ['background-light-green']: 'remove'
        }

        Object.keys(colAct).forEach(key => {
          document.querySelector('.js-scan-started').classList[colAct[key]](key)
        });

        UI.showDisplays(['.js-scan-started', '.js-preview']);

        //document.querySelector('.js-scan-started').classList.add('background-light-red');
        log(`No scan result! Got: ${content}`);
      } else {
        log(scanResult);
      }

    if (scanState.complete()) {
      scanState.render();
      // capture scan
      scanState.capture();
      document.querySelector('.js-scan-ok').removeAttribute('hidden');
      document.querySelector('.js-scan-started').classList.add('background-light-green');
      let msg = `Just captured: ${scanState.lastScan}\nNext: Scan user or sequence token.`;
      instruction(msg);
      Toast.show(msg);

    }

    if (scanState.started()) {
      UI.showDisplays(['.js-preview', '.js-scan-started'])
      scanState.render();
    }
  },

  handlers: [{
      name: 'Set Session',
      test: function(x = '') {
        return x.match(/\[cmd:session:(\d{4}-\d{2}-\d{2})\]/);
      },
      fn: function(content) {
        let result = this.test(content);
        if (result[1]) {
          store.saveSessionId(result[1]);
          instruction(`session set from scan: ${result[1]}`);
          return true;
        }
        return false;
      }
    },

    {
      name: 'Capture user token',
      test: function(x = '') {
        return x.match(/^([\w\ ]+){1}:(.+){1}$/);
      },
      fn: function(content) {
        let result = this.test(content);
        if (result[1] && result[2]) {
          scanState.id = result[2];
          scanState.name = result[1];
          return scanState.name;
        }
        return false;
      }
    },

    {
      name: 'Capture sequence token',
      test: function(x = '') {
        return x.match(/^(\d+)$/);
      },
      fn: function(content) {
        let result = this.test(content);
        if (result[1]) {
          scanState.seq = Number(result[1]);
          return scanState.seq;
        }
        return false;
      }
    },

    {
      name: 'Toast',
      test: function(x = '') {
        return x.match(/\[cmd:toast:(.+)\]/);
      },
      fn: function(content) {
        let result = this.test(content);
        console.info('toast result: ', result);
        if (result[1]) {
          Toast.show(result[1]);
          return result[1];
        }
        return false;
      }
    },

    {
      name: 'Lap: ping',
      test: function(x = '') {
        return x.match(/\[cmd:lap:ping\]/);
      },
      fn: function(content) {
        if (this.test(content)) {
          // capture lap timestamp
          return true;
        }
        return false;
      }
    }
  ]
}



window.addEventListener('load', () => {

  optics.scanner = new Instascan.Scanner({
    video: document.getElementById('preview'),
    mirror: false
  });
  optics.scanner.addListener('scan', scanState.onScan);

  let camSelect = document.querySelector('select.js-camera-options');
  camSelect.addEventListener('change', e => {
    console.info('camera changed', e);
    let targetCamera = e.target.value;

    optics.selectCamera(targetCamera);
  });

  Instascan.Camera.getCameras()
    .then(cameras => {
      cameras.forEach(camera => {
        let camOption = document.createElement('option');
        camOption.value = camera.id;
        camOption.text = camera.name || 'no name';
        camSelect.appendChild(camOption);
      });

      console.info('cameraid: ', store.getCameraId());

      if (store.getCameraId()) {
        camSelect.value = store.getCameraId();
        optics.selectCamera(store.getCameraId());
      }
      instruction('Scan user or sequence token.')
    });

  Toast.hookup('.js-toast');

  let sessionDisplay = document.querySelector('[data-session-display]');
  sessionDisplay.innerText = store.currentSession();

  let sessionSelect = document.querySelector('[data-date]');
  sessionSelect.value = store.currentSession();
  console.info('attaching event listener to sessionSelect: ', sessionSelect);
  sessionSelect.addEventListener('input', e => {
    let session = (e.target.value || store.maidenSession);
    instruction(`Session changed: ${session}`);
    sessionDisplay.innerText = session;
    store.saveSessionId(session);
    UI.toggleNav(e);
  });

  Timer.resume();
});
