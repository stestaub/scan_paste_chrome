// Initialize Firebase
var config = {
  apiKey: "AIzaSyD-5fJdL5PCtruZmv5PFutQ1OojM1ieLxU",
  databaseURL: "https://nodal-algebra-767.firebaseio.com/",
  projectId: "nodal-algebra-767"
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
    let userid = items.userid;
    if (userid) {
      setChannel(userid);
    } else {
      userid = getRandomToken();
      chrome.storage.sync.set({userid: userid}, function() {
        setChannel(userid);
      });
    }

    function setChannel(userId) {
      const starCountRef = firebase.database().ref('/channels/' + userid);
      starCountRef.on('value', function (snapshot) {
        if(snapshot.val()) {
          document.getElementById("qrcode").remove();
          initForScan(userId);
        }
        else {
          initForSetup(userId)
        }
      });
    }

    function initForScan(userId) {
      updateScanButton(userId);
    }

    function initForSetup(userId) {
      var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 300,
        height: 300
      });

      qrcode.makeCode(userId);
    }

    function updateScanButton(userId) {
      document.getElementById("scan").onclick = () => {
        const requestId = getRandomToken();
        createRequwst(requestId, userId).then(() => { listenToRquestChanges(requestId)});
      };
    }

    function listenToRquestChanges(requestId) {
      firebase.database().ref("/request/" + requestId + "/result").on('value', function (snapshot) {
        if(snapshot.val()) {
          copyValue(snapshot.val());
          dropRequest(requestId);
        }
      });
    }

    function createRequwst(requestId, userId) {
      const updates = {};
      updates['/request/' + requestId] = {channel_id: userId};
      return firebase.database().ref().update(updates);
    }

    function dropRequest(requestId) {
      firebase.database().ref("/request/" + requestId).remove();
    }

    function copyValue(value) {
      const textBox = document.getElementById("scan-result");
      textBox.value = value;
      textBox.focus();
      textBox.select();
      document.execCommand("copy");
      document.getElementById("message").innerText = "Text wurde in die Zwischenablage kopiert";
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
