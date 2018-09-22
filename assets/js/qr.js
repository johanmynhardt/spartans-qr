const QR = {
  qr: null,
  disp: null,

  makeCode: function(text, conf = {qrid: 'qrcode', selector: 'text-display'}) {
    if (this.qr === null) {
      this.qr = new QRCode(conf.qrid);
    }
    this.qr.makeCode(text);

    if (this.disp === null) {
      this.disp = document.querySelector(`${conf.selector}`);
    }

    if (this.disp) {
      this.disp.innerText = text;
    }

    instruction(`makeCode: ${text}`);
  },

  show: function(hideselectors = []) {
    hideselectors.forEach(sel => UI.setHidden(sel, true));

    let qrDisplay = document.querySelector('.js-qr-generate');
    UI.setHidden('.js-qr-generate', false);
  },

  hide: function(showselectors = ['.js-preview','.js-data']) {
    showselectors.forEach(sel => UI.setHidden(sel, false));
    UI.setHidden('.js-qr-generate', true);
  }
}
