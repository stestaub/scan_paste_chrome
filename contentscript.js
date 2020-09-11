var lastFocused;

function detectFocus() {
    const element = document.activeElement;
    if(element === lastFocused) { return; }

    if(element.nodeName === 'INPUT') {
        const oldButton = document.getElementById("scan-button");
        if(oldButton) {
            oldButton.remove();
        }
        const overlayButton = createButton();
        element.parentNode.insertBefore(overlayButton, element.nextSibling);
    }
}

function createButton() {
    const overlayButton = document.createElement("button");
    overlayButton.innerText = "C";
    overlayButton.id = "scan-button";
    overlayButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        scan();
    }

    return overlayButton;
}

function scan() {
    chrome.runtime.sendMessage({action: "start_scan"}, function(response) {
        if(chrome.runtime.lastError) {
            setTimeout(scan, 500);
            console.log("error trying to send message to background. Try again in 500ms");
        } else {
            console.log("received callback");
            lastFocused = response.result;
        }
    });
}

function insertDataU(data) {
    if(lastFocused && lastFocused.nodeName === "INPUT") {
        lastFocused.value = data;
    }
}

window.addEventListener('focus', detectFocus, true);