const Timer = {
  laps: {},
  _seq: 0,
  _format: 'mm:ss:SSS',

  start: function() {
    if (!this.laps.genesis) {
      this.laps.genesis = new Date().toISOString();
    }
    return this.laps.genesis;
  },

  last: function() {
    return this._seq;
  },

  next: function() {
    this._seq = this.last() + 1;
    return this.last();
  },

  lap: function() {
    let timestamp = new Date().toISOString();
    let sinceGenesis = this.sinceGenesis(timestamp);
    let sinceLast = this._seq === 0 ? sinceGenesis : this.sinceLastLap(timestamp);

    let result = {
      timestamp: timestamp,
      display: this._seq === 0 ? sinceLast : `${sinceGenesis} (+${sinceLast})`
    };

    this.laps[this.next()] = timestamp;

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
    return this.between(this.laps.genesis, now);
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
