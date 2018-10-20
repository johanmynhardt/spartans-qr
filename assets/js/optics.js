const Optics = {
  scanner: undefined,
  camera: undefined,

  visibility: {
    start: {
      '.js-button-scan': true,
      '.js-button-stop-scan': false,
      'video': false
    },
    stop: {
      '.js-button-scan': false,
      '.js-button-stop-scan': true,
      'video': true
    }
  },

  scan: () => {
    if (!document.querySelector('.js-manual-form').hidden) {
      ['.js-manual-form', '.js-preview'].forEach(UI.toggleBySelector);
    }
    if (Optics.scanner && Optics.camera) {
      Optics.scanner.start(Optics.camera);
      Object.entries(Optics.visibility.start).forEach(entry => {
        UI.setHidden(entry[0], entry[1]);
      });
    } else {
      alert('please select a camera!');
    }
  },

  stopScan: () => {
    if (Optics.scanner) {
      Optics.scanner.stop();
      Object.entries(Optics.visibility.stop).forEach(entry => {
        UI.setHidden(entry[0], entry[1]);
      });
    }
  },

  selectCamera: (targetCamera) => {
    Instascan.Camera.getCameras()
      .then(function (cameras) {
        let camToUse = cameras.filter(cam => cam.id === targetCamera)[0];
        Optics.camera = camToUse;
        if (camToUse) {
          Optics.camera = camToUse;
          Store.saveCameraId(camToUse.id);
        } else {
          alert('No usable camera found.');
        }
      }).catch(function (e) {
      log(`error: ${e}`);
    });
  }
};
