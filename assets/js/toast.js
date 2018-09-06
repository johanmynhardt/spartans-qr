const Toast = {
  hookup: (selector) => {
    Toast.props.selector = selector;
  },

  show: (text) => {
    if (Toast.props.selector) {
      let host = document.querySelector(`div${Toast.props.selector}`);
      host.innerText = text;
      host.removeAttribute('hidden');
      setTimeout(() => host.setAttribute('hidden', true), Toast.props.duration);
    }
  },

  props: {
    selector: null,
    duration: 2000
  }
};
