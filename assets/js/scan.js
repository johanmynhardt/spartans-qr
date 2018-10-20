
const log = (msg) => {
  console.log('got msg: ', msg);
  instruction(msg);
  let loge = document.querySelector('#log');
  loge.innerHTML = msg + "\n" + loge.innerHTML;
};

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
    document.querySelector(dd.props.tableselector).innerHTML = Store.asHTML();
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
    Store.addScan(scan);

    scanState.lastScan = `(${scan.seq}) ${scan.name}`;

    log(`Scan captured: (${scan.seq}) ${scan.name}`);

    scanState.reset();
  },

  onScan: (content) => {
    Optics.stopScan();
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
      };

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
      UI.showDisplays(['.js-preview', '.js-scan-started']);
      scanState.render();
    }
  },

  handlers: [{
    name: 'Set Session',
    test: function (x = '') {
      return x.match(/\[cmd:session:(\d{4}-\d{2}-\d{2})\]/);
    },
    fn: function (content) {
      let result = this.test(content);
      if (result[1]) {
        Store.saveSessionId(result[1]);
        instruction(`session set from scan: ${result[1]}`);
        return true;
      }
      return false;
    }
  },

    {
      name: 'Capture user token',
      test: function (x = '') {
        return x.match(/^([\w\ ]+){1}:(.+){1}$/);
      },
      fn: function (content) {
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
      test: function (x = '') {
        return x.match(/^(\d+)$/);
      },
      fn: function (content) {
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
      test: function (x = '') {
        return x.match(/\[cmd:toast:(.+)\]/);
      },
      fn: function (content) {
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
      test: function (x = '') {
        return x.match(/\[cmd:lap:ping\]/);
      },
      fn: function (content) {
        if (this.test(content)) {
          // capture lap timestamp
          return true;
        }
        return false;
      }
    }
  ]
};


window.addEventListener('load', () => {

  Optics.scanner = new Instascan.Scanner({
    video: document.getElementById('preview'),
    mirror: false
  });
  Optics.scanner.addListener('scan', scanState.onScan);

  let camSelect = document.querySelector('select.js-camera-options');
  camSelect.addEventListener('change', e => {
    console.info('camera changed', e);
    let targetCamera = e.target.value;

    Optics.selectCamera(targetCamera);
  });

  Instascan.Camera.getCameras()
    .then(cameras => {
      cameras.forEach(camera => {
        let camOption = document.createElement('option');
        camOption.value = camera.id;
        camOption.text = camera.name || 'no name';
        camSelect.appendChild(camOption);
      });

      console.info('cameraid: ', Store.getCameraId());

      if (Store.getCameraId()) {
        camSelect.value = Store.getCameraId();
        Optics.selectCamera(Store.getCameraId());
      }
      instruction('Scan user or sequence token.')
    });

  Toast.hookup('.js-toast');

  let sessionDisplay = document.querySelector('[data-session-display]');
  sessionDisplay.innerText = Store.currentSession();

  let sessionSelect = document.querySelector('[data-date]');
  sessionSelect.value = Store.currentSession();
  console.info('attaching event listener to sessionSelect: ', sessionSelect);
  sessionSelect.addEventListener('input', e => {
    let session = (e.target.value || Store.maidenSession);
    instruction(`Session changed: ${session}`);
    sessionDisplay.innerText = session;
    Store.saveSessionId(session);
    UI.toggleNav(e);
  });

  Timer.resume();
});
