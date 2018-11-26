/**
 * Author: Camilo Rincon
 */
// NOTE: you can use CommonJS here, for instance:
// var foo = require("npm-dependency");
// var bar = require("./path/to/local/file_without_extension");
// module.exports = someVariable;

// grab DOM elements inside index.html

const fileSelector = document.getElementById( "fileSelector" );
const generateButton = document.getElementById( "generateButton" );
const importExisitng = document.getElementById( "import" );
const scaleDown = document.getElementById( "scale_down" );
const scaleUp = document.getElementById( "scale_up" );
const translate_left = document.getElementById( "translate_left" );
const translate_right = document.getElementById( "translate_right" );
const translate_up = document.getElementById( "translate_up" );
const translate_down = document.getElementById( "translate_down" );
const reset = document.getElementById( "reset" );
const canvas = document.getElementById('canvasAlbelli');
const FileSaver = require('file-saver');
const {
    convertToPixels,
    convertToInches,
    log
} = require('./utils');

let toPrint = {};
let existing = {};

/**
* Import image from device and resize tu full canvas size
*/

fileSelector.onchange = function( e ) {
    // get all selected Files
    let files = e.target.files;
    let file;
    let scaleFactor = 1.00;
    let tx = 0, ty = 0;
    let wrh;
    let newWidth;
    let newHeight;

    for ( let i = 0; i < files.length; ++i ) {
        file = files[ i ];
        // check if file is valid Image (just a MIME check)
        switch ( file.type ) {
            case "image/jpeg":
            case "image/png":
            case "image/gif":
            // read Image contents from file

            let reader = new FileReader();
            reader.onload = function( e ) {
                // create HTMLImageElement holding image data

                if (canvas.getContext) {

                    let ctx = canvas.getContext('2d');
                    let img = new Image();

                    img.src = reader.result;

                    let createImg = img.onload = function () {

                        /**Generate object to Print */
                        toPrint = {
                            canvas: {
                                "width": convertToInches(canvas.width),
                                "height": convertToInches(canvas.height),
                                "photo": {
                                    "id": file.name,
                                    "image": img.src,
                                    "width": convertToInches(img.width),
                                    "height": convertToInches(img.height),
                                    "x": convertToInches(tx),
                                    "y": convertToInches(ty),
                                    "s": convertToInches(scaleFactor)
                                }
                            }
                        }

                        /**Calculate the aspect ratio for images */
                        wrh = img.width / img.height;
                        newWidth = canvas.width;
                        newHeight = newWidth / wrh;

                        if (newHeight > canvas.height) {
                            newHeight = canvas.height;
                            newWidth = newHeight * wrh;
                        }

                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.save()
                        ctx.scale(scaleFactor, scaleFactor);
                        ctx.translate(tx, ty);

                        /**Create image mantaining aspect ratio */
                        //ctx.drawImage(img, 0, 0, newWidth, newHeight);

                        /**Create Image full canvas size */
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        ctx.restore();
                    };

                    /**Transform properties */
                    scaleUp.onclick = function (e) {
                        scaleFactor *= 1.1;
                        createImg();
                    };

                    scaleDown.onclick = function (e) {
                        scaleFactor /= 1.1;
                        createImg();
                    }

                    translate_left.onclick = function (e) {
                        tx -= 10;
                        createImg();
                    }
                    translate_right.onclick = function (e) {
                        tx += 10;
                        createImg();
                    }
                    translate_up.onclick = function (e) {
                        ty -= 10;
                        createImg();
                    }
                    translate_down.onclick = function (e) {
                        ty += 10;
                        createImg();
                    }

                    reset.onclick = function (e) {
                        ty = 0;
                        tx = 0;
                        scaleFactor = 1.00;
                        createImg();
                    }
                }
            };

            reader.readAsDataURL( file );
            // process just one file.
            return;
            default:
            log( "not a valid Image file :" + file.name );
        }
    }
};


/**
* Generate the configuration to print and download a json file with it.
*/
generateButton.onclick = function( e ) {

    const jsonText = JSON.stringify(toPrint);
    let a = JSON.parse(JSON.stringify(toPrint.canvas));
    let ctx = canvas.getContext('2d');
    delete a.photo.image;

    log(JSON.stringify(a));
    localStorage.setItem('toPrint_a', JSON.stringify(toPrint));

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const jsonBlob = new Blob([jsonText], {
        type: "text/plain;charset=utf-8"
    });

    FileSaver.saveAs(jsonBlob, "description.json");

};


/**
* Import existing configuration and draw into canvas
*/
importExisitng.onclick = function (e) {
    /**TODO : Create a list when multimple images configurations are created */
    let retrievedObject = localStorage.getItem('toPrint_a');

    existing = JSON.parse(retrievedObject);

    if (canvas.getContext) {

        let ctx = canvas.getContext('2d');

        let img = new Image();
        img.src = existing.canvas.photo.image;

        img.onload = function () {
            let wrh = convertToPixels(existing.canvas.photo.width) / convertToPixels(existing.canvas.photo.height);
            let newWidth = convertToPixels(existing.canvas.width);
            let newHeight = newWidth / wrh;

            if (newHeight > convertToPixels(existing.canvas.height)) {
                newHeight = convertToPixels(existing.canvas.height);
                newWidth = newHeight * wrh;
            }

            ctx.clearRect(0, 0, convertToPixels(existing.canvas.width), convertToPixels(existing.canvas.height));
            ctx.save()
            ctx.scale(convertToPixels(existing.canvas.photo.s), convertToPixels(existing.canvas.photo.s));
            ctx.translate(convertToPixels(existing.canvas.photo.x), convertToPixels(existing.canvas.photo.y));

            ctx.drawImage(img, 0, 0, convertToPixels(existing.canvas.width), convertToPixels(existing.canvas.height));
            ctx.restore();
        };
    }
}

log( "Test application ready" );
