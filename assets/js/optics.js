const Optics = {
  scanner: undefined,
  camera: undefined,

  scan: () => {
    if (!document.querySelector('.js-manual-form').hidden) {
      ['.js-manual-form', '.js-preview'].forEach(UI.toggleBySelector);
    }
    if (Optics.scanner && Optics.camera) {
      Optics.scanner.start(Optics.camera);
      ['.js-button-scan', '.js-button-stop-scan']
        .map(select => document.querySelector(select))
        .forEach(UI.toggleHidden);
    } else {
      alert('please select a camera!');
    }
  },

  stopScan: () => {
    if (Optics.scanner) {
      Optics.scanner.stop();
      UI.setHidden('.js-button-scan', false);
      UI.setHidden('.js-button-stop-scan', true);
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
