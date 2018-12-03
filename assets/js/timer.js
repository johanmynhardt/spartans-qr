let Timer = {
  laps: {},
  _seq: 0,
  _format: 'HH:mm:ss.SSS',
  _interval: undefined,

  start: function () {
    if (!this.laps.genesis || !Timer.running) {
      if (!Timer.laps.genesis) {
        Timer.laps.genesis = new Date().toISOString();
      }

      Timer.running = true;

      UI.setHidden('.js-timer-start', Timer.running);
      UI.setHidden('.js-timer-stop', !Timer.running);
      let interval = setInterval(() => {
        window.requestAnimationFrame(() => {
          document.querySelector('[data-timer-display]').innerText = this.sinceGenesis(new Date().toISOString());
        })
      }, 200);
      Timer._interval = function () {
        return interval;
      };

      Session.sessionObjectSerializerFor('timer')(Timer);
      Timer.renderTable();
    }
    document.dispatchEvent(new CustomEvent('doSpeak', {detail: 'Off you go! GO GO GO!'}));
    navigator.vibrate(400);
    return Timer.laps.genesis;
  },

  stop: () => {
    clearInterval(Timer._interval());
    Timer.running = false;
    UI.setHidden('.js-timer-start', Timer.running);
    UI.setHidden('.js-timer-stop', !Timer.running);
    Session.sessionObjectSerializerFor('timer')(Timer);
  },

  last: function () {
    return this._seq;
  },

  next: function () {
    this._seq = this.last() + 1;
    return this.last();
  },

  lap: function () {
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

    const result2 = Object.assign({}, result, {
      display: [nextIdx === 1 ? sinceLast : `${sinceGenesis} (+${sinceLast})`].join(' ')
    });

    this.laps[nextIdx] = timestamp;

    Journal.capture('timer.lap', result);

    Session.sessionObjectSerializerFor('timer')(Timer);

    Timer.appendLapHtml(Object.assign({}, result2, {lap: result2.seq}));

    document.dispatchEvent(new CustomEvent('doSpeak', {detail: `Lap ${result2.seq}`}));
    navigator.vibrate(200);
    return result;
  },

  reset: function () {
    this._seq = 0;
    this.laps = {};
  },

  between: function (first, second) {
    return moment(moment(second).diff(moment(first))).utc().format(Timer._format);
  },

  sinceGenesis: function (now) {
    return this.between(Timer.laps.genesis, now);
  },

  sinceLastLap: function (now) {
    return this.between(this.laps[this.last()], now);
  },

  renderTimestamps: function (laps = {}) {
    return Object.keys(laps).reduce((acc, key) => {
      let timestamp = laps[key];
      let lapsKey = laps[key === '1' ? 'genesis' : Number(key) - 1];

      let sinceGenesis = this.between(laps['genesis'], timestamp);
      let sinceLast = key === 'genesis' ? undefined : this.between(lapsKey, timestamp);
      acc[key] = key === 'genesis' ? timestamp : {
        lap: Number(key),
        timestamp: timestamp,
        display: Number(key) > 1 ? `${sinceGenesis} (+${sinceLast})` : sinceLast
      };
      return acc;
    }, {});
  },

  appendLapHtml: (d) => {
    console.info('got d to insert: ', d);
    let tbody = document.querySelector('table.js-laps-table > tbody');
    let tr = document.createElement('tr');
    tr.innerHTML = `<td>${d.lap}</td><td>${d.display}</td>`;
    tbody.insertBefore(tr, tbody.firstElementChild);
  },

  renderTableHtml: (laps = {}) => {
    return [
      '<table class="datatable js-laps-table" style="width:100%;">',
      '<thead><tr><th>Lap</th><th>Time</th></tr></thead>',
      '<tbody>'
    ].concat(Object.values(Timer.renderTimestamps(laps))
      .filter(r => r.lap && r.display)
      .sort((a, b) => {
        if (a.lap > b.lap) {
          return -1;
        }

        if (a.lap < b.lap) {
          return 1;
        }

        return 0;
      })
      .map(d => `<tr><td>${d.lap}</td><td>${d.display}</td></tr>`))
      .concat(['</tbody>', '</table>'])
      .join('\n');
  },

  resume: () => {
    console.info('resuming timer...');
    Timer = Object.assign({}, Timer, Session.sessionObjectGetter('timer'));

    if (Timer.running && !Timer._interval) {
      let interval = setInterval(() => {
        window.requestAnimationFrame(() => {
          [...document.querySelectorAll('[data-timer-display]')].forEach(el => el.innerText = Timer.sinceGenesis(new Date().toISOString()));
        })
      }, 200);
      Timer._interval = function () {
        return interval;
      };

      Session.sessionObjectSerializerFor('timer')(Timer);

      Timer.renderTable();
    }


    UI.setHidden('.js-timer-start', Timer.running);
    UI.setHidden('.js-timer-stop', !Timer.running);
  },

  renderTable: () => {
    window.requestAnimationFrame(() => {
      document.querySelector('.js-stopwatch-laps').innerHTML = Timer.renderTableHtml(Timer.laps);
    })

  }
};
