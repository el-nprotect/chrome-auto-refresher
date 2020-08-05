'use strict';

let tabTimers = [];

chrome.tabs.getAllInWindow(null, function(tabs) {
  for (const tab of tabs) {
    //do something
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    resetTimer(tabId);
  }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  removeTimer(tabId);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if (request.msg === 'createTimer'){
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
        createTimer(tabs[0].id);
      });
    } else if (request.msg === 'removeTimer') {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
        removeTimer(tabs[0].id);
      });
    }
  }
);

function createTimer(tabId) {
  if (resetTimer(tabId)) {
    return;
  }
  const initialTimeout = getRandomInt(3, 10) * 60;
  let tabTimer = {
    tabId: tabId,
    intervalId: 0,
    initialTimeout: initialTimeout,
    currentTimeout: initialTimeout,
  };

  tabTimer.intervalId = setInterval(function () {
    onTimerEvent(tabTimer);
  }, 1000);

  tabTimers.push(tabTimer);
  updateBadge(tabTimer.tabId, tabTimer.currentTimeout);
}

function removeTimer(tabId) {
  for (let i = 0; i < tabTimers.length; i++) {
    if (tabTimers[i].tabId === tabId) {
      clearInterval(tabTimers[i].intervalId);
      updateBadge(tabTimers[i].tabId);
      tabTimers.splice(i, 1);
      break;
    }
  }
}

function resetTimer(tabId) {
  for (let i = 0; i < tabTimers.length; i++) {
    if (tabTimers[i].tabId === tabId) {
      tabTimers[i].currentTimeout = tabTimers[i].initialTimeout;
      updateBadge(tabTimers[i].tabId, tabTimers[i].currentTimeout);
      return true;
    }
  }
  return false;
}

function onTimerEvent(tabTimer) {
  if (tabTimer.currentTimeout === 0) {
    chrome.tabs.executeScript(tabTimer.tabId, {code: 'window.location.reload();'});
  } else {
    tabTimer.currentTimeout--;
    updateBadge(tabTimer.tabId, tabTimer.currentTimeout);
  }
}

function updateBadge(tabId, currentTimeout) {
  const formattedTimeout = currentTimeout ? formatTimeout(currentTimeout) : '';
  chrome.browserAction.setBadgeText({
    text: formattedTimeout,
    tabId: tabId,
  });
}

function formatTimeout(timeout) {
  var sec_num = parseInt(timeout, 10);
  var minutes = Math.floor(sec_num / 60);
  var seconds = sec_num - (minutes * 60);

  if (minutes > 0) {
    return minutes+'m';
  } else {
    return seconds.toString();
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
