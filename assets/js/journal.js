const Journal = {
  /**
  * Store the entry to the default localStorage.journal array.
  */
  persist: entry => {
    const defaultSerializer = (entry) => {
      console.info('journal: ', entry);
      let journal = Storage.unserialize('journal', '[]');
      journal.push(entry);
      Storage.serialize('journal', journal);
    };

    (Journal.providedSerializer || Journal.sessionSerializer || defaultSerializer)(entry);
  },

  /**
  * A Serializer may be provided to append to the journal differently.
  * The default key in `localStorage` is 'journal', which would contain an array.
  *
  * An examp
  */
  providedSerializer: undefined,

  sessionSerializer: entry => {
    console.info('Journal.sessionSerializer: ', entry);
    let sessions = store.sessions();
    let session = (sessions[store.currentSession()] || {})
    let journal = (session.journal || []);
    journal.push(entry);

    session.journal = journal;
    sessions[store.currentSession()] = session;
    Storage.serialize('sessions', sessions);
  },

  /**
  * Wrap the key and data alongside a timestamp.
  */
  capture: (key, data) => {
    let entry = {
      timestamp: new Date().toISOString(),
      key: key,
      data: data
    };

    Journal.persist(entry);
  }
};
