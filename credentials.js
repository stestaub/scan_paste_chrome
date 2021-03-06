// Initialize Firebase
const config = {
  apiKey: "AIzaSyD-5fJdL5PCtruZmv5PFutQ1OojM1ieLxU",
  databaseURL: "https://nodal-algebra-767.firebaseio.com/",
  projectId: "nodal-algebra-767"
};

let qr;

const browserMap = {
  options: [],
  header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],
  dataos: [
    {name: 'Windows Phone', value: 'Windows Phone', version: 'OS'},
    {name: 'Windows', value: 'Win', version: 'NT'},
    {name: 'iPhone', value: 'iPhone', version: 'OS'},
    {name: 'iPad', value: 'iPad', version: 'OS'},
    {name: 'Kindle', value: 'Silk', version: 'Silk'},
    {name: 'Android', value: 'Android', version: 'Android'},
    {name: 'PlayBook', value: 'PlayBook', version: 'OS'},
    {name: 'BlackBerry', value: 'BlackBerry', version: '/'},
    {name: 'Macintosh', value: 'Mac', version: 'OS X'},
    {name: 'Linux', value: 'Linux', version: 'rv'},
    {name: 'Palm', value: 'Palm', version: 'PalmOS'}
  ],
  databrowser: [
    {name: 'Chrome', value: 'Chrome', version: 'Chrome'},
    {name: 'Firefox', value: 'Firefox', version: 'Firefox'},
    {name: 'Safari', value: 'Safari', version: 'Version'},
    {name: 'Internet Explorer', value: 'MSIE', version: 'MSIE'},
    {name: 'Opera', value: 'Opera', version: 'Opera'},
    {name: 'BlackBerry', value: 'CLDC', version: 'CLDC'},
    {name: 'Mozilla', value: 'Mozilla', version: 'Mozilla'}
  ],
  init: function () {
    var agent = this.header.join(' '),
        os = this.matchItem(agent, this.dataos),
        browser = this.matchItem(agent, this.databrowser);

    return {os: os, browser: browser};
  },
  matchItem: function (string, data) {
    var i = 0,
        j = 0,
        html = '',
        regex,
        regexv,
        match,
        matches,
        version;

    for (i = 0; i < data.length; i += 1) {
      regex = new RegExp(data[i].value, 'i');
      match = regex.test(string);
      if (match) {
        regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
        matches = string.match(regexv);
        version = '';
        if (matches) {
          if (matches[1]) {
            matches = matches[1];
          }
        }
        if (matches) {
          matches = matches.split(/[._]+/);
          for (j = 0; j < matches.length; j += 1) {
            if (j === 0) {
              version += matches[j] + '.';
            } else {
              version += matches[j];
            }
          }
        } else {
          version = '0';
        }
        return {
          name: data[i].name,
          version: parseFloat(version)
        };
      }
    }
    return {name: 'unknown', version: 0};
  }
};


firebase.initializeApp(config);
firebase.auth().signInAnonymously().catch(function(error) {
    document.getElementById("status").innerText = error.message;
});

function setChannel(channelId) {
    const starCountRef = firebase.database().ref('/channels/' + channelId);
    starCountRef.on('value', function (snapshot) {
        if(snapshot.val()) {
            document.getElementById("qrcode").style.display = "none";
            showInfo(snapshot.val(), channelId);
        }
        else {
            initForSetup(channelId);
            removeStatus();
        }
    });
}

function removeStatus() {
    document.getElementById("status").innerHTML = "";
}

function disconnect(channelId) {
    deleteChannel(channelId);
    initForSetup(channelId);
}

function showInfo(data, channelId) {
    let name = "Unknown";
    if(data.device_name) {
        name = data.device_name
    }
    let container = document.getElementById("status");
    let infoString = document.createElement("span");
    let removeButton = document.createElement("button");
    removeButton.innerText = "Disconnect";
    removeButton.onclick = () => disconnect(channelId);
    infoString.innerText = "Connected with: " + name;
    container.appendChild(infoString);
    container.appendChild(removeButton);


}

function initForSetup(channelId) {
    document.getElementById("qrcode").style.display = "block";
    const qrData = deviceInfo();
    qrData["channel"] = channelId;
    qr.makeCode(JSON.stringify(qrData));
    document.getElementById("qrcode").title = "";
}

function deleteChannel(channelId) {
    firebase.database().ref('/channels/' + channelId).remove();
}

function deviceInfo() {
    return browserMap.init();
}


/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with firebase.auth().onAuthStateChanged.
 * This listener is called when the user is signed in or out, and that
 * is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */
function initApp() {
    qr = new QRCode(document.getElementById("qrcode"), {
        width: 300,
        height: 300
    });
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            setChannel(user.uid);
        }
        else {
            document.getElementById("status").innerText ="Error connecting to backend. Check your internet connection, or try again later";
        }
    });
}

window.onload = function() {
  initApp();
};
