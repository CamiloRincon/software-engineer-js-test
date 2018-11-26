const debugContainer = document.getElementById("debugContainer");

const convertToPixels = function (x) {
     var uPixel = 96;
     var result = parseFloat(x * uPixel).toFixed(10);
     return (Number(result));
}

const convertToInches = function (x) {
    var uInch = 0.0104166667;
    var result = parseFloat(x * uInch).toFixed(10);
    return Number(result);
}

const log = function (msg) {
    // show debug/state message on screen
    debugContainer.innerHTML += "<p>" + msg + "</p>";
}


module.exports = {
    convertToPixels,
    convertToInches,
    log
};