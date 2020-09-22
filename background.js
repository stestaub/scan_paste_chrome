// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
var config = {
  apiKey: "AIzaSyD-5fJdL5PCtruZmv5PFutQ1OojM1ieLxU",
  databaseURL: "https://nodal-algebra-767.firebaseio.com/",
  projectId: "nodal-algebra-767"
};
firebase.initializeApp(config);
firebase.auth().signInAnonymously();

let g_channelId;
let g_currentRequest;

let g_requestRef;

function unsubscribePreviousRequest() {
    if (g_requestRef) {
        g_requestRef.off();
    }
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

function listenToRequestChanges(requestId, callback) {
    unsubscribePreviousRequest();

    g_requestRef = firebase.database().ref("/request/" + requestId + "/result");
    g_requestRef.on('value', function (snapshot) {
        if(snapshot.val()) {
            callback({result: snapshot.val()});
            g_requestRef.off();
            dropRequest(requestId);
        }
    }, (err) => {
        console.error(err.message);
    });
}

function createRequwst(requestId, userId) {
    const updates = {};
    updates['/request/' + requestId] = {channel_id: userId, created_at: new Date().toISOString()};
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
      firebase.auth().onAuthStateChanged(function(user) {
          g_channelId = user.uid;

          if(g_channelId) {
              g_currentRequest = getRandomToken();
              //sendResponse({result: "hello"});
              createRequwst(g_currentRequest, g_channelId).then(() => {
                  listenToRequestChanges(g_currentRequest, sendResultToActiveTab);
              });
          }
          else {
              sendResultToActiveTab({error: "no user id found"});
          }
      });
  }
});
