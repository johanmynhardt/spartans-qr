
const getValue = (sel) => {
 const value = (document.querySelector(`#${sel}`) || {value: ''}).value;
 return (value === undefined || value === 'undefined') ? '' : value;
}

const pMapFromHash = () => {
 let m = window.location.hash.slice(1).split('&')
   .filter(x => x.length > 0)
   .reduce((acc, next) => {
       let kv = next.split('=');
       acc[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
       return acc;
   }, {});
   
   return m;
}



const toggleClasses = (configs = [{id: 'inputArea', action: 'remove', class: 'hidden'}]) => {
  configs.forEach(config => {
    document.querySelector(`#${config.id}`).classList[config.action](config.class);
  });
}