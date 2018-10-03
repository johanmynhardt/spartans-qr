const Timer = {
  genesis: undefined,
  laps: {},
  _seq: 0,
  _format: 'mm:ss:SSS',

  start: function() {
    if (!this.genesis) {
      this.genesis = new Date().toISOString();
    }
    return this.genesis;
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
    let sinceGenesis = this.sinceGenesis();
    let sinceLast = this._seq === 0 ? sinceGenesis : this.sinceLastLap();

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

  sinceGenesis: function() {
    return this.between(this.genesis, moment.now());
  },

  sinceLastLap: function() {
    return this.between(this.laps[this.last()], moment.now());
  }
};
