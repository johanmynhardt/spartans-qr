const Journal = {
  /**
   * Store the entry to the default localStorage.journal array.
   */
  persist: entry => {
    (Journal.providedSerializer || Journal.sessionSerializer)(entry);
  },

  /**
   * A Serializer may be provided to append to the journal differently.
   * The default key in `localStorage` is 'journal', which would contain an array.
   *
   * An examp
   */
  providedSerializer: undefined,

  sessionSerializer: Session.sessionArraySerializerFor('journal'),

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
