const UI = {
  setHidden: (selector, trueOrFalse) => {
    let el = document.querySelector(selector);
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
    event.preventDefault();
    UI.toggleBySelector('nav');
  },

  showManualForm: () => {
    optics.stopScan();
    ['.js-manual-form', '.js-preview'].forEach(UI.toggleBySelector);
    return null;
  }
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

  exportCSV: () => {
    let blob = new Blob([store.asCSV()], {
      type: 'text/csv'
    });
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.click();
  },

  purge: () => {
    if (window.confirm('Really WIPE out all records?')) {
      localStorage.scans = JSON.stringify([]);
    }
  },

  discardManualEntry: () => {
    let manualForm = document.querySelector('.js-manual-form');
    ['.js-manual-form', '.js-preview'].forEach(UI.toggleBySelector);
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
  seq: null,
  id: null,
  name: null,
  lastScan: null,

  complete: () => !!(scanState.seq && scanState.id && scanState.name),

  reset: () => {
    scanState.seq = null;
    scanState.id = null;
    scanState.name = null;
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

    log(`scan captured: (${scan.seq}) ${scan.name}`);

    scanState.reset();
  },

  onScan: (content) => {
    optics.stopScan();
    if (content && content.indexOf(':') > -1) {
      // id
      let parts = content.split(':').map(x => (x || '').trim());
      scanState.id = (parts[1] || '');
      scanState.name = (parts[0] || '');
    } else if (content) {
      // seq
      scanState.seq = Number(content.trim());
    }
    if (scanState.complete()) {
      // capture scan
      scanState.capture();
      let msg = `Just captured: ${scanState.lastScan}\nNext: Scan user or sequence token.`;
      instruction(msg);
      Toast.show(msg);
    } else {
      let msg = `Now scan: ${(scanState.id ? 'sequence token' : 'user token')} for ${(scanState.id ? scanState.name : scanState.seq)}`;
      instruction(msg);
      Toast.show(msg);
    }
  }
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
});
