let Timer = {
  laps: {},
  _seq: 0,
  _format: 'mm:ss:SSS',

  start: function() {
    if (!this.laps.genesis) {
      Timer.laps.genesis = new Date().toISOString();
      setInterval(() => {
        window.requestAnimationFrame(() => {
          document.querySelector('[data-timer-display]').innerText = this.sinceGenesis(new Date().toISOString());
        })
      }, 200);
    }
    return Timer.laps.genesis;
  },

  last: function() {
    return this._seq;
  },

  next: function() {
    this._seq = this.last() + 1;
    return this.last();
  },

  lap: function() {
    const timestamp = new Date().toISOString();
    const sinceGenesis = this.sinceGenesis(timestamp);
    const sinceLast = this._seq === 0 ? sinceGenesis : this.sinceLastLap(timestamp);

    const nextIdx = this.next();
    const result = {
      seq: nextIdx,
      timestamp: timestamp,
      sinceGenesis: sinceGenesis,
      sinceLast: sinceLast,
      display: [nextIdx, nextIdx === 1 ? sinceLast : `${sinceGenesis} (+${sinceLast})`].join(' ')
    };

    this.laps[nextIdx] = timestamp;

    Journal.capture('timer.lap', result);

    return result;
  },

  reset: function() {
    this._seq = 0;
    this.laps = {};
  },

  between: function(first, second) {
    return moment(moment(second).diff(moment(first))).format(this._format);
  },

  sinceGenesis: function(now) {
    return this.between(Timer.laps.genesis, now);
  },

  sinceLastLap: function(now) {
    return this.between(this.laps[this.last()], now);
  },

  renderTimestamps: function(laps = {}) {
    return Object.keys(laps).reduce((acc, key) => {
      let timestamp = laps[key];
      let lapsKey = laps[key === '1' ? 'genesis' : Number(key) - 1];

      let sinceGenesis = this.between(laps['genesis'], timestamp);
      let sinceLast = key === 'genesis' ? undefined : this.between(lapsKey, timestamp);
      acc[key] = key === 'genesis' ? timestamp : {
        timestamp: timestamp,
        display: Number(key) > 1 ? `${sinceGenesis} (+${sinceLast})` : sinceLast
      };
      return acc;
    }, {});
  }
};
