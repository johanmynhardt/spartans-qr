
         
         const app = {
           db: {
             'name':'',
             'id':''
           },
           
           data: () => Object.keys(app.db).reduce((acc, next) => {
             acc[next] = getValue(next);
             return acc;
           }, {}),
           
           fields: () => Object.keys(app.db),
           
           serialize: (data = {}) => {
             app.db = Object.assign({}, app.db, data);
             return app.fields()
               .map(k => `${app.db[k] || ''}`)
               .map(t => t.trim())
               .join(":");
           },
           
           qr: null
         };
         
         function makeCode(text, conf = {qrid: 'qrcode', dispid: 'text-display'}) {
           if (app.qr === null) {
             app.qr = new QRCode(conf.qrid);
           }
           app.qr.makeCode(text);
           document.querySelector(`#${conf.dispid}`).innerText = text;
         }
         
         function syncFromHash() {
             app.db = Object.assign({}, app.db, pMapFromHash());
             makeCode(app.serialize());
         }
         
         function updateHash() {
           const data = app.data();
           window.location.hash = app.fields()
             .map(f => `${f}=${data[f]}`)
             .join("&");
         }
         
         function showInput(show = true) {
            toggleClasses([
              {id: 'inputArea', action: show ? 'remove' : 'add', class: 'hidden'},
              {id: 'exposeInput', action: show ? 'add' : 'remove', class: 'hidden'}
            ]);
          }

         window.addEventListener('load', (e) => {
             [...document.querySelectorAll('[data-trigger=makeCode]')]
                 .forEach(i => i.addEventListener('input', updateHash));

             console.info('hash: ', window.location.hash);
             showInput(!(window.location.hash.length > 0));
             
             syncFromHash();
         });

         window.addEventListener('hashchange', syncFromHash);