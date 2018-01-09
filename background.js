const state = {
  accessToken: null
};


chrome.extension.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (request, sender) {
    state.accessToken = request.accessToken;
    removeListener();
    setListener(request.urls);
  });
});

function modifyRequestHeaderHandler(details) {
  if (state.accessToken) {
    details.requestHeaders.push({
      name: 'Authorization',
      value: 'Bearer ' + state.accessToken
    });
  }
  return {requestHeaders: details.requestHeaders};
}

function setListener(filters) {
  const urls = filters || ["*://localhost/*", "*://127.0.0.1/*"];
  chrome.webRequest.onBeforeSendHeaders.addListener(
    modifyRequestHeaderHandler,
    {
      urls: urls
    },
    ['requestHeaders', 'blocking']
  );

  console.log(urls);

}

function removeListener() {
  chrome.webRequest.onBeforeSendHeaders.removeListener(modifyRequestHeaderHandler);
}


// setListener();

// function modifyResponseHeaderHandler_(details) {
//   details.responseHeaders.push({
//     name: 'X-Auth',
//     value: 'abc123f'
//   });
//   return {responseHeaders: details.responseHeaders};
//
// };

// chrome.webRequest.onHeadersReceived.addListener(
//   modifyResponseHeaderHandler_,
//   {urls: []},
//   ['responseHeaders', 'blocking']
// );
