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
    Optics.stopScan();
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
