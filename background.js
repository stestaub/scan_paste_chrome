// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
var config = {
  apiKey: "AIzaSyD-5fJdL5PCtruZmv5PFutQ1OojM1ieLxU",
  databaseURL: "https://nodal-algebra-767.firebaseio.com/",
  projectId: "nodal-algebra-767"
};
firebase.initializeApp(config);
var g_userId;
var g_currentRequest;
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

function listenToRquestChanges(requestId, callback) {
    firebase.database().ref("/request/" + requestId + "/result").on('value', function (snapshot) {
        if(snapshot.val()) {
            callback({result: snapshot.val()});
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

function sendResultToActiveTab(result) {
    chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
        if(tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, result);
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "start_scan") {
      sendResponse({result: "hello"});
      chrome.storage.sync.get('userid', function(items) {
          g_userId = items.userid;
          //console.log("now start scanning");
          if(g_userId) {
              g_currentRequest = getRandomToken();
              //sendResponse({result: "hello"});
              listenToRquestChanges(g_currentRequest, sendResultToActiveTab);
              createRequwst(g_currentRequest, g_userId);
          }
          else {
              sendResultToActiveTab({error: "no user id found"});
          }
      });
  }
});
