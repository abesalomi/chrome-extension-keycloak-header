const port = chrome.extension.connect({
  name: "Sample Communication"
});

$(document).ready(function () {


  $("#tocken").hide();

  const url = localStorage.getItem("url");
  if (url) $("#authUrl").val(url);


  const clientId = localStorage.getItem("clientId");
  if (clientId) $("#client").val(clientId);


  const username = localStorage.getItem("username");
  if (username) $("#username").val(username);


  const password = localStorage.getItem("password");
  if (password) $("#password").val(password);

  const filterUrls = localStorage.getItem("filterUrls");
  if (filterUrls || localStorage.getItem("emptyUrls") === "true") $("#filterUrls").val(filterUrls);


  $('form').submit(function (e) {
    e.preventDefault();
  });


  $('#login').click(() => login());
  $('#copy').click(() => login(true));
  $('#copyWithBearer').click(() => login(true, "Bearer "));
  $('#disable').click(function () {
    port.postMessage({
      xtype: 'DISABLE'
    });
  });


});

function parseUrls(urlsStr) {
  return urlsStr
    .split(",")
    .map(c => c.trim())
    .filter(c => c)
    .map(c => "*://" + c + "/*");
}

function copy() {
  var copyText = document.getElementById("tocken");
  copyText.select();
  document.execCommand("Copy");
}

function login(wantCopy, copyPrefix) {

  const url = $("#authUrl").val();
  const clientId = $("#client").val();
  const username = $("#username").val();
  const password = $("#password").val();
  const filterUrls = $("#filterUrls").val();
  const urls = parseUrls(filterUrls);

  localStorage.setItem("url", url);
  localStorage.setItem("clientId", clientId);
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
  localStorage.setItem("filterUrls", filterUrls);

  if (urls && urls.length) {
    localStorage.removeItem("emptyUrls");
  } else {
    localStorage.setItem("emptyUrls", "true")
  }

  $.ajax({
    url: url,
    type: "POST",
    contentType: "application/x-www-form-urlencoded",
    data: {
      "grant_type": "password",
      "client_id": clientId,
      "username": username,
      "password": password
    },
//authUrl
    complete: function () {
      //called when complete
    },

    success: function (response) {

      if (wantCopy) {
        $("#tocken").val((copyPrefix ? copyPrefix : "") + response.access_token);
        $("#tocken").show();
        copy();
        $("#tocken").hide();
      }

      port.postMessage({
        type: "ENABLE",
        accessToken: response.access_token,
        urls: urls
      });

      $.notify({
        message: 'Success'
      }, {
        type: 'success'
      });
      setTimeout(function () {
        window.close();
      }, 500);
    },

    error: function () {
      $.notify({
        message: 'Fail'
      }, {
        type: 'danger'
      });
    },
  });
};