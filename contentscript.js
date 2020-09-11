var lastFocused;

function detectFocus() {
    const element = document.activeElement;
    if(element === lastFocused) { return; }

    if(isScanSupported(element)) {
        lastFocused = element;
        removeButton();
        const overlayButton = createButton();
        document.body.append(overlayButton);
    }
}

function removeButton() {
    const oldButton = document.getElementById("scan-button");
    if(oldButton) {
        oldButton.remove();
    }
}

function isScanSupported(element) {
    return (element.nodeName === 'INPUT' && element.type === "text") || element.nodeName === "TEXTAREA"
}

function createButton() {
    const img = document.createElement("img");
    img.src = chrome.runtime.getURL("scan-icon.png");
    img.setAttribute("width", "20px");

    const overlayButton = document.createElement("button");
    overlayButton.id = "scan-button";
    overlayButton.className = "scan_n_paste";
    overlayButton.appendChild(img);
    overlayButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        scan();
    };

    position(overlayButton);

    return overlayButton;
}

function position(elem) {
    const anchor = document.activeElement;
    const buttonWidth = 22;
    let anchorCoords = anchor.getBoundingClientRect();
    elem.style.left = anchorCoords.left + anchor.offsetWidth - buttonWidth + "px";
    elem.style.top = anchorCoords.top + "px";

}

function scan() {
    chrome.extension.sendMessage({action: "start_scan"}, function(response) {
        if(chrome.runtime.lastError) {
            //setTimeout(scan, 500);
            console.log("error trying to send message to background. Try again in 500ms");
        } else {
            console.log("received callback");
        }
    });
}

chrome.runtime.onMessage.addListener(function(data) {
    lastFocused.value = data.result;
});

window.addEventListener('focus', detectFocus, true);
window.addEventListener('blur', removeButton, true);
