document.addEventListener('DOMContentLoaded', function() {
  let btnCreateTimer = document.getElementById('btnCreateTimer');
  let btnRemoveTimer = document.getElementById('btnRemoveTimer');

  btnCreateTimer.addEventListener('click', function() {
    chrome.runtime.sendMessage({ msg: 'createTimer' });
  });
  btnRemoveTimer.addEventListener('click', function() {
    chrome.runtime.sendMessage({ msg: 'removeTimer' });
  });
});
