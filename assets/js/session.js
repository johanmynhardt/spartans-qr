const Session = {

  sessionArrayGetter: key => {
    let sessions = store.sessions();
    let session = (sessions[store.currentSession()] || {});
    return (session[key] || []);
  },

  sessionArraySerializerFor: key => entry => {
    console.info(`Session.sessionArraySerializerFor(${key}): `, entry);
    let sessions = store.sessions();
    let session = (sessions[store.currentSession()] || {});
    let field = (session[key] || []);
    field.push(entry);

    session[key] = field;
    sessions[store.currentSession()] = session;
    Storage.serialize('sessions', sessions);
  },

  sessionObjectGetter: key => {
    let sessions = store.sessions();
    let session = (sessions[store.currentSession()] || {});
    return (session[key] || {});
  },

  sessionObjectSerializerFor: key => object => {
    console.info(`Session.sessionObjectSerializerFor(${key}): `, object);
    let sessions = store.sessions();
    let session = (sessions[store.currentSession()] || {});
    session[key] = Object.assign({}, (session[key] || {}), object);
    sessions[store.currentSession()] = session;
    Storage.serialize('sessions', sessions);
  }
};
