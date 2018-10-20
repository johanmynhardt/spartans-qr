const Session = {

  sessionArrayGetter: key => {
    let sessions = Store.sessions();
    let session = (sessions[Store.currentSession()] || {});
    return (session[key] || []);
  },

  sessionArraySerializerFor: key => entry => {
    console.info(`Session.sessionArraySerializerFor(${key}): `, entry);
    let sessions = Store.sessions();
    let session = (sessions[Store.currentSession()] || {});
    let field = (session[key] || []);
    field.push(entry);

    session[key] = field;
    sessions[Store.currentSession()] = session;
    Storage.serialize('sessions', sessions);
  },

  sessionObjectGetter: key => {
    let sessions = Store.sessions();
    let session = (sessions[Store.currentSession()] || {});
    return (session[key] || {});
  },

  sessionObjectSerializerFor: key => object => {
    console.info(`Session.sessionObjectSerializerFor(${key}): `, object);
    let sessions = Store.sessions();
    let session = (sessions[Store.currentSession()] || {});
    session[key] = Object.assign({}, (session[key] || {}), object);
    sessions[Store.currentSession()] = session;
    Storage.serialize('sessions', sessions);
  }
};
