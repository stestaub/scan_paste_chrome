let lastFocused;
let currentTimeout;
let currentButton;

function getOffsetRect(el) {
    let rect   = el.getBoundingClientRect();

    // add window scroll position to get the offset position
    let left   = rect.left   + window.scrollX;
    let top    = rect.top    + window.scrollY;
    let right  = rect.right  + window.scrollX;
    let bottom = rect.bottom + window.scrollY;

    // polyfill missing 'x' and 'y' rect properties not returned
    // from getBoundingClientRect() by older browsers
    let x;
    if ( rect.x === undefined ) x = left;
    else x = rect.x + window.scrollX;

    let y;
    if ( rect.y === undefined ) y = top;
    else y = rect.y + window.scrollY;

    // width and height are the same
    let width  = rect.width;
    let height = rect.height;

    return { left, top, right, bottom, x, y, width, height };
}

function detectFocus() {
    const element = document.activeElement;

    if(isScanSupported(element)) {
        if (currentTimeout) {
            clearTimeout(currentTimeout);
            currentTimeout = 0;
        }
        lastFocused = element;
        removeButton();
        const overlayButton = createButton();
        document.body.append(overlayButton);
        currentButton = overlayButton;
    }
}

function removeButton() {
    const oldButton = document.getElementById("scan-button");
    if(oldButton) {
        oldButton.remove();
    }
}

function isTextInput(element) {
    return (element.nodeName === 'INPUT'
        && element.type === "text");
}

function isTextArea(element) {
    return element.nodeName === "TEXTAREA";
}

function isScanSupported(element) {
    return isTextInput(element) || isTextArea(element)
}

function createButton() {
    const img = document.createElement("img");
    img.src = chrome.runtime.getURL("scan-icon.png");
    img.setAttribute("width", "20px");
    img.style.width = "20px";
    img.style.height = "20px";

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
    if(!elem) { return; }
    const anchor = document.activeElement;
    const buttonWidth = 22;
    let anchorCoords = getOffsetRect(anchor);
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
window.addEventListener('blur', () => currentTimeout = setTimeout(removeButton, 200), true);
window.addEventListener('resize', () => position(currentButton));
