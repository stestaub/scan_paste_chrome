// Initialize Firebase
var config = {
  apiKey: "AIzaSyD-5fJdL5PCtruZmv5PFutQ1OojM1ieLxU",
  databaseURL: "https://nodal-algebra-767.firebaseio.com/",
  projectId: "nodal-algebra-767"
};

var browserMap = {
  options: [],
  header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],
  dataos: [
    { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
    { name: 'Windows', value: 'Win', version: 'NT' },
    { name: 'iPhone', value: 'iPhone', version: 'OS' },
    { name: 'iPad', value: 'iPad', version: 'OS' },
    { name: 'Kindle', value: 'Silk', version: 'Silk' },
    { name: 'Android', value: 'Android', version: 'Android' },
    { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
    { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
    { name: 'Macintosh', value: 'Mac', version: 'OS X' },
    { name: 'Linux', value: 'Linux', version: 'rv' },
    { name: 'Palm', value: 'Palm', version: 'PalmOS' }
  ],
  databrowser: [
    { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
    { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
    { name: 'Safari', value: 'Safari', version: 'Version' },
    { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
    { name: 'Opera', value: 'Opera', version: 'Opera' },
    { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
    { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
  ],
  init: function () {
    var agent = this.header.join(' '),
        os = this.matchItem(agent, this.dataos),
        browser = this.matchItem(agent, this.databrowser);

    return { os: os, browser: browser };
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
        if (matches) { if (matches[1]) { matches = matches[1]; } }
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
    return { name: 'unknown', version: 0 };
  }
};


firebase.initializeApp(config);
var token;
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
  chrome.storage.sync.get('userid', function(items) {
    let channelId = items.userid;
    if (channelId) {
      setChannel(channelId);
    } else {
      channelId = getRandomToken();
      chrome.storage.sync.set({userid: channelId}, function() {
        setChannel(channelId);
      });
    }

    function setChannel(channelId) {
      const starCountRef = firebase.database().ref('/channels/' + channelId);
      starCountRef.on('value', function (snapshot) {
        if(snapshot.val()) {
          document.getElementById("qrcode").remove();
          showInfo(snapshot.val());
        }
        else {
          initForSetup(channelId);
          removeStatus();
        }
      });
    }

    function removeStatus() {
      document.getElementById("status").innerText = "";
    }

    function showInfo(data) {
      let name = "Unknown";
      if(data.device_name) {
        name = data.device_name
      }
      document.getElementById("status").innerText = "Connected with: " + name;
    }

    function initForSetup(channelId) {
      var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 300,
        height: 300
      });
      const qrData = deviceInfo();
      qrData["channel"] = channelId;
      qrcode.makeCode(JSON.stringify(qrData));
    }

    function deviceInfo() {
      return browserMap.init();
    }

  });
}


function getRandomToken() {
  // E.g. 8 * 32 = 256 bits token
  var randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  var hex = '';
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
}




window.onload = function() {
  initApp();
};
