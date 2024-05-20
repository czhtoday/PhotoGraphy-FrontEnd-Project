// Global image variables
var originalImage = null;
var grayImage = null;
var redImage = null;
var rainbowImage = null;
var blurImage = null;
var fgImage = null;
var bgImage = null;

// Utility functions
function imageIsLoaded(img) {
    if (img === null || !img.complete()) {
        alert("Image not loaded");
        return false;
    }
    return true;
}

// ToDo List Functions
function addTask() {
    var input = document.getElementById("input");
    var newTask = input.value;
    if (newTask !== "") {
        var item = document.createElement("li");
        item.innerHTML = '<input type="button" class="done" onclick="markDone(this.parentNode)" value="&#x2713;" />' +
            '<input type="button" class="remove" onclick="remove(this.parentNode)" value="&#x2715;" />' +
            '<input type="button" class="important" onclick="markImportant(this.parentNode)" value="!" />' + newTask;
        document.getElementById("tasks").appendChild(item);
        input.value = "";
        input.placeholder = "enter next task...";
    }
}

function markDone(item) {
    item.className = 'finished';
}

function remove(item) {
    if (item.className === 'finished') {
        item.remove();
    }
}

function markImportant(item) {
    item.classList.toggle("important");
}

function doAbout() {
    var txt = document.getElementById("divabout");
    txt.innerHTML = "Author is Zhihang Cheng";
    txt.className = "yellowbackground";
}

function clearAbout() {
    var txt = document.getElementById("divabout");
    txt.innerHTML = "";
}

// Image Filters Functions
function uploadimg() {
    var fileInput = document.getElementById("newfile");
    var canvas = document.getElementById("can1");
    originalImage = new SimpleImage(fileInput);
    grayImage = new SimpleImage(fileInput);
    redImage = new SimpleImage(fileInput);
    rainbowImage = new SimpleImage(fileInput);
    blurImage = new SimpleImage(fileInput);
    originalImage.drawTo(canvas);
}

function doGray() {
    if (imageIsLoaded(grayImage)) {
        filterGray();
        grayImage.drawTo(document.getElementById("can1"));
    }
}

function filterGray() {
    for (var pixel of grayImage.values()) {
        var avg = (pixel.getRed() + pixel.getGreen() + pixel.getBlue()) / 3;
        pixel.setRed(avg);
        pixel.setGreen(avg);
        pixel.setBlue(avg);
    }
}

function doRS() {
    if (imageIsLoaded(redImage)) {
        filterRed();
        redImage.drawTo(document.getElementById("can1"));
    }
}

function filterRed() {
    for (var pixel of redImage.values()) {
        var avg = (pixel.getRed() + pixel.getGreen() + pixel.getBlue()) / 3;
        if (avg < 128) {
            pixel.setRed(2 * avg);
            pixel.setGreen(0);
            pixel.setBlue(0);
        } else {
            pixel.setRed(255);
            pixel.setGreen(2 * avg - 255);
            pixel.setBlue(2 * avg - 255);
        }
    }
}

function doRB() {
    if (imageIsLoaded(rainbowImage)) {
        filterRainbow();
        rainbowImage.drawTo(document.getElementById("can1"));
    }
}

function filterRainbow() {
    var height = rainbowImage.getHeight();
    for (var pixel of rainbowImage.values()) {
        var y = pixel.getY();
        var region = Math.floor(y / (height / 6));
        switch (region) {
            case 0: pixel.setRed(255); break;
            case 1: pixel.setRed(255); pixel.setGreen(127); break;
            case 2: pixel.setGreen(255); break;
            case 3: pixel.setGreen(255); pixel.setBlue(127); break;
            case 4: pixel.setBlue(255); break;
            case 5: pixel.setRed(127); pixel.setBlue(255); break;
        }
    }
}

function doBL() {
    if (imageIsLoaded(blurImage)) {
        filterBlur();
        blurImage.drawTo(document.getElementById("can1"));
    }
}

function filterBlur() {
    // Simple averaging blur filter
    var tempImage = new SimpleImage(blurImage.getWidth(), blurImage.getHeight());
    for (var pixel of blurImage.values()) {
        var x = pixel.getX();
        var y = pixel.getY();
        var count = 0;
        var totalRed = 0, totalGreen = 0, totalBlue = 0;

        // Loop through each pixel's neighbors
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                var nx = x + dx;
                var ny = y + dy;
                if (nx >= 0 && nx < blurImage.getWidth() && ny >= 0 && ny < blurImage.getHeight()) {
                    var neighbor = blurImage.getPixel(nx, ny);
                    totalRed += neighbor.getRed();
                    totalGreen += neighbor.getGreen();
                    totalBlue += neighbor.getBlue();
                    count++;
                }
            }
        }
        var newPixel = tempImage.getPixel(x, y);
        newPixel.setRed(totalRed / count);
        newPixel.setGreen(totalGreen / count);
        newPixel.setBlue(totalBlue / count);
    }
    // Copy tempImage back to blurImage
    for (var pixel of tempImage.values()) {
        var x = pixel.getX();
        var y = pixel.getY();
        var tempPixel = tempImage.getPixel(x, y);
        blurImage.setPixel(x, y, tempPixel);
    }
}

function resetF() {
    if (imageIsLoaded(originalImage)) {
        originalImage.drawTo(document.getElementById("can1"));
    }
}

// Green Screen Functions
function loadfgimage() {
    var fileInput = document.getElementById("Fgimg");
    fgImage = new SimpleImage(fileInput);
    fgImage.drawTo(document.getElementById("fgcan"));
    alert("Foreground image loaded");
}

function loadbgimage() {
    var fileInput = document.getElementById("Bgimg");
    bgImage = new SimpleImage(fileInput);
    bgImage.drawTo(document.getElementById("bgcan"));
    alert("Background image loaded");
}

function doGreenScreen() {
    if (!imageIsLoaded(fgImage) || !imageIsLoaded(bgImage)) {
        alert("One or both images are not loaded.");
        return;
    }
    var output = new SimpleImage(fgImage.getWidth(), fgImage.getHeight());
    for (var pixel of fgImage.values()) {
        var x = pixel.getX();
        var y = pixel.getY();
        if (pixel.getGreen() > 240) {
            var bgPixel = bgImage.getPixel(x, y);
            output.setPixel(x, y, bgPixel);
        } else {
            output.setPixel(x, y, pixel);
        }
    }
    output.drawTo(document.getElementById("fgcan"));
}

function clearCanvas() {
    var fgCanvas = document.getElementById("fgcan");
    var bgCanvas = document.getElementById("bgcan");
    var ctx1 = fgCanvas.getContext("2d");
    ctx1.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
    var ctx2 = bgCanvas.getContext("2d");
    ctx2.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
}