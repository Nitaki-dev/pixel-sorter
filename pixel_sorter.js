let img;
let p5Instance = null;

let visualizeMask = false;

function log(message) {
    var log = document.getElementById('logs');
    log.innerHTML = message;
}

function loadImage(event) {
    let file = event.target.files[0];
    if (file.type.startsWith('image/')) {
        if (p5Instance) {
            p5Instance.remove();
        }

        p5Instance = new p5(function (p) {
            p.preload = function() {
                img = p.loadImage(URL.createObjectURL(file));
            };

            p.setup = function() {
                const imageHolder = document.getElementById('image-holder');
                const holderWidth = imageHolder.clientWidth;
                const holderHeight = imageHolder.clientHeight;

                const aspectRatio = img.width / img.height;
                
                let newWidth, newHeight;
                if (holderWidth / holderHeight > aspectRatio) {
                    newHeight = holderHeight;
                    newWidth = newHeight * aspectRatio;
                } else {
                    newWidth = holderWidth;
                    newHeight = newWidth / aspectRatio;
                }

                newWidth = Math.round(newWidth);
                newHeight = Math.round(newHeight);

                img.resize(newWidth, newHeight);
                const canvas = p.createCanvas(newWidth, newHeight);
                canvas.id('image-canvas');
                canvas.parent('image-holder');
                p.image(img, 0, 0, newWidth, newHeight);
                p.noLoop();
            };
        });
    } else {
        console.log('Not an image file!');
    }
}

function countUniqueColors(pixels) {
    let uniqueColors = new Set();
    
    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i+1];
        let b = pixels[i+2];
        
        // convert the r, g, b values into a single string
        let colorStr = r + ',' + g + ',' + b;
        
        // add the color to the Set
        uniqueColors.add(colorStr);
    }
    
    // return the number of unique colors
    return uniqueColors.size;
}

function RGBToHSL(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function maskFunction(pixel) {
    let lowThreshold = parseFloat(document.getElementById('lowThreshold').value);
    let highThreshold = parseFloat(document.getElementById('highThreshold').value);

    let pixelValue = 0.2989*pixel.r + 0.5870*pixel.g + 0.1140*pixel.b;
    let normalizedValue = pixelValue / 255; // Normalize to range 0.0 - 1.0

    if (normalizedValue > lowThreshold && normalizedValue < highThreshold) {
        return true; // Pixel is within thresholds
    } else {
        return false; // Pixel is outside thresholds
    }
}

function maskPixels() {
    let maskedPixels = [];
    let mask = [];

    for (let i = 0; i < p5Instance.pixels.length; i += 4) {
        let r = p5Instance.pixels[i];
        let g = p5Instance.pixels[i + 1];
        let b = p5Instance.pixels[i + 2];
        let a = p5Instance.pixels[i + 3];

        let pixel = {r: r, g: g, b: b, a: a};

        let masked = maskFunction(pixel);
        mask.push(masked);

        if (visualizeMask) {
            maskedPixels.push(masked ? {r: 255, g: 255, b: 255, a: a} : {r: 0, g: 0, b: 0, a: a});
        } else {
            maskedPixels.push(pixel);
        }
    }

    return {maskedPixels, mask};
}

function quantizeColor(c, quanta) {
    return Math.round(c / quanta) * quanta;
}

function applyQuantization(pixel) {
    pixel.r = quantizeColor(pixel.r, 32);
    pixel.g = quantizeColor(pixel.g, 32);
    pixel.b = quantizeColor(pixel.b, 32);
}

function findClosestPaletteColor(oldPixel) {
    return {
        r: quantizeColor(oldPixel.r, 32),
        g: quantizeColor(oldPixel.g, 32),
        b: quantizeColor(oldPixel.b, 32)
    };
}

function applyDithering(pixels, x, y, quantError) {
    let index;

    if (x + 1 < p5Instance.width) {
        index = 4 * ((y) * p5Instance.width + (x + 1));
        pixels[index]     += quantError.r * 7/16;
        pixels[index + 1] += quantError.g * 7/16;
        pixels[index + 2] += quantError.b * 7/16;
    }

    if (x - 1 >= 0 && y + 1 < p5Instance.height) {
        index = 4 * ((y + 1) * p5Instance.width + (x - 1));
        pixels[index]     += quantError.r * 3/16;
        pixels[index + 1] += quantError.g * 3/16;
        pixels[index + 2] += quantError.b * 3/16;
    }

    if (y + 1 < p5Instance.height) {
        index = 4 * ((y + 1) * p5Instance.width + x);
        pixels[index]     += quantError.r * 5/16;
        pixels[index + 1] += quantError.g * 5/16;
        pixels[index + 2] += quantError.b * 5/16;
    }

    if (x + 1 < p5Instance.width && y + 1 < p5Instance.height) {
        index = 4 * ((y + 1) * p5Instance.width + (x + 1));
        pixels[index]     += quantError.r * 1/16;
        pixels[index + 1] += quantError.g * 1/16;
        pixels[index + 2] += quantError.b * 1/16;
    }
}

async function sortPixels() {
    if (img) {
        revertChanges();
        let sortDirection = document.getElementById('sortDirection').value;
        let sortColor = document.getElementById('sortColor').value;
        let reverseSort = document.getElementById('reverseSort').checked;
        let maskSort = document.getElementById('maskSort').checked;
        let selectedEffects = document.getElementById('selectedEffects').value;
        visualizeMask = document.getElementById('displayMask').checked;

        log(sortColor + ", " + sortDirection + ", R:" + reverseSort + ", M:" + maskSort + ", E:" + selectedEffects);

        p5Instance.loadPixels();

        log("Amount of unique colors: " + countUniqueColors(p5Instance.pixels));

        if (selectedEffects === 'dithering') {
            for (let y = 0; y < p5Instance.height; y++) {
                for (let x = 0; x < p5Instance.width; x++) {
                    let i = 4 * (y * p5Instance.width + x);
                    let oldPixel = { r: p5Instance.pixels[i], g: p5Instance.pixels[i + 1], b: p5Instance.pixels[i + 2] };
                    let newPixel = findClosestPaletteColor(oldPixel);
    
                    p5Instance.pixels[i]     = newPixel.r;
                    p5Instance.pixels[i + 1] = newPixel.g;
                    p5Instance.pixels[i + 2] = newPixel.b;
    
                    let quantError = {
                        r: oldPixel.r - newPixel.r,
                        g: oldPixel.g - newPixel.g,
                        b: oldPixel.b - newPixel.b
                    };
                    applyDithering(p5Instance.pixels, x, y, quantError);
                }
            }
            log("Amount of unique colors after dithering: " + countUniqueColors(p5Instance.pixels));
        } else if (selectedEffects === 'quantization') {
            for (let y = 0; y < p5Instance.height; y++) {
                for (let x = 0; x < p5Instance.width; x++) {
                    let i = 4 * (y * p5Instance.width + x);
                    let pixel = { r: p5Instance.pixels[i], g: p5Instance.pixels[i + 1], b: p5Instance.pixels[i + 2] };
                    
                    applyQuantization(pixel);
    
                    p5Instance.pixels[i] = pixel.r;
                    p5Instance.pixels[i + 1] = pixel.g;
                    p5Instance.pixels[i + 2] = pixel.b;
                }
            }
            log("Amount of unique colors after quantization: " + countUniqueColors(p5Instance.pixels));
        } else {
            console.log("No effects selected");
        }

        let mask = [];

        if (maskSort) {
            let result = maskPixels();
            mask = result.mask;

            if (visualizeMask) {
                let maskedPixels = result.maskedPixels;

                for (let i = 0; i < maskedPixels.length; i++) {
                    let index = i * 4;
                    let pix = maskedPixels[i];
                    p5Instance.pixels[index] = pix.r;
                    p5Instance.pixels[index + 1] = pix.g;
                    p5Instance.pixels[index + 2] = pix.b;
                    p5Instance.pixels[index + 3] = pix.a;
                }
            }
        }

        let sortFunction;
        switch (sortColor) {
            case 'RGB':
                sortFunction = function(a, b) {
                    let aValue = 0.2989*a.r + 0.5870*a.g + 0.1140*a.b;
                    let bValue = 0.2989*b.r + 0.5870*b.g + 0.1140*b.b;
                    return aValue - bValue;
                };
                break;
            case 'red':
                sortFunction = function(a, b) { return a.r - b.r; };
                break;
            case 'green':
                sortFunction = function(a, b) { return a.g - b.g; };
                break;
            case 'blue':
                sortFunction = function(a, b) { return a.b - b.b; };
                break;
            case 'saturation':
                sortFunction = function(a, b) {
                    let hslA = RGBToHSL(a.r, a.g, a.b);
                    let hslB = RGBToHSL(b.r, b.g, b.b);
                    return hslA[1] - hslB[1];
                };
                break;
            case 'luminence':
                sortFunction = function(a, b) {
                    let hslA = RGBToHSL(a.r, a.g, a.b);
                    let hslB = RGBToHSL(b.r, b.g, b.b);
                    return hslA[2] - hslB[2];
                };
                break;
            case 'hue':
                sortFunction = function(a, b) {
                    let hslA = RGBToHSL(a.r, a.g, a.b);
                    let hslB = RGBToHSL(b.r, b.g, b.b);
                    return hslA[0] - hslB[0];
                };
                break;
            default:
                log("Invalid sort color: " + sortColor);
                return;
        }

        if (sortDirection === 'horizontal') {
            if (maskSort) {
                for (let y = 0; y < p5Instance.height; y++) {
                    let row = getRow(y);
                    let maskRow = mask.slice(y * p5Instance.width, (y + 1) * p5Instance.width);
                    let [spans, unmaskedPixels] = getSpans(row, maskRow);
        
                    let sortedSpans = spans.map(span => {
                        span.sort(sortFunction);
                        if (reverseSort) {
                            span.reverse();
                        }
                        return span;
                    });
        
                    let sortedRow = flattenSpans(sortedSpans, unmaskedPixels, maskRow);
                    setRow(y, sortedRow);
                }
            } else {
                for (let y = 0; y < p5Instance.height; y++) {
                    let row = getRow(y);
                    row.sort(sortFunction);
                    if (reverseSort) {
                        row.reverse();
                    }
                    setRow(y, row);
                }
            }
        } else if (sortDirection === 'vertical') {
            if (maskSort) {
                for (let x = 0; x < p5Instance.width; x++) {
                    let column = getColumn(x);
                    let maskColumn = getMaskColumn(x, mask);
                    let [spans, unmaskedPixels] = getSpans(column, maskColumn);
            
                    let sortedSpans = spans.map(span => {
                        span.sort(sortFunction);
                        if (reverseSort) {
                            span.reverse();
                        }
                        return span;
                    });
            
                    let sortedColumn = flattenSpans(sortedSpans, unmaskedPixels, maskColumn);
                    setColumn(x, sortedColumn);
                }
            } else {
                for (let x = 0; x < p5Instance.width; x++) {
                    let column = getColumn(x);
                    column.sort(sortFunction);
                    if (reverseSort) {
                        column.reverse();
                    }
                    setColumn(x, column);
                }
            }
        } else {
            log("Invalid sort direction: " + sortDirection);
            return;
        }

        p5Instance.updatePixels();
        p5Instance.redraw();

    } else {
        log("No image loaded");
    }
}

function getSpans(row, maskRow) {
    let spans = [];
    let unmaskedPixels = [];
    let currentSpan = [];

    for (let i = 0; i < row.length; i++) {
        if (maskRow[i]) {
            currentSpan.push(row[i]);
        } else {
            unmaskedPixels.push(row[i]);
            if (currentSpan.length > 0) {
                spans.push(currentSpan);
                currentSpan = [];
            }
        }
    }

    if (currentSpan.length > 0) {
        spans.push(currentSpan);
        currentSpan = [];
    }

    return [spans, unmaskedPixels];
}

function flattenSpans(sortedSpans, unmaskedPixels, maskRow) {
    let sortedRow = [];
    let unmaskedIndex = 0;
    let spanIndex = 0;

    for (let i = 0; i < maskRow.length; i++) {
        if (maskRow[i]) {
            if (sortedSpans[spanIndex] && sortedSpans[spanIndex].length > 0) {
                sortedRow.push(sortedSpans[spanIndex].shift());
            }
            if (sortedSpans[spanIndex] && sortedSpans[spanIndex].length === 0) {
                spanIndex++;
            }
        } else {
            sortedRow.push(unmaskedPixels[unmaskedIndex++]);
        }
    }

    // if(sortedRow.length !== maskRow.length) {
    //     console.log(`Mismatch between sortedRow length (${sortedRow.length}) and maskRow length (${maskRow.length})`);
    // }

    return sortedRow;
}

function revertChanges() {
    if (img) {
        p5Instance.loadPixels();
        img.loadPixels();
        for (let i = 0; i < p5Instance.pixels.length; i++) {
            p5Instance.pixels[i] = img.pixels[i];
        }
        p5Instance.updatePixels();
        p5Instance.redraw();
        console.log("Image reverted");
    } else {
        console.log("No image loaded");
    }
}

function getRow(y) {
    let row = [];
    for (let x = 0; x < p5Instance.width; x++) {
        let index = (x + y * p5Instance.width) * 4;
        let r = p5Instance.pixels[index];
        let g = p5Instance.pixels[index + 1];
        let b = p5Instance.pixels[index + 2];
        let a = p5Instance.pixels[index + 3];
        row.push({r, g, b, a});
    }
    return row;
}

function setRow(y, row) {
    if(row.length !== p5Instance.width) {
        console.log(`Mismatch between row length (${row.length}) and image width (${p5Instance.width})`);
        return;
    }
    for (let x = 0; x < p5Instance.width; x++) {
        let index = (x + y * p5Instance.width) * 4;
        let col = row[x];
        p5Instance.pixels[index] = col.r;
        p5Instance.pixels[index + 1] = col.g;
        p5Instance.pixels[index + 2] = col.b;
        p5Instance.pixels[index + 3] = col.a;
    }
}

function getMaskColumn(x, mask) {
    let maskColumn = [];
    for (let y = 0; y < p5Instance.height; y++) {
        maskColumn.push(mask[y * p5Instance.width + x]);
    }
    return maskColumn;
}

function getColumn(x) {
    let column = [];
    for (let y = 0; y < p5Instance.height; y++) {
        let index = 4 * (y * p5Instance.width + x);
        column.push({ r: p5Instance.pixels[index], g: p5Instance.pixels[index + 1], b: p5Instance.pixels[index + 2] });
    }
    return column;
}

function setColumn(x, column) {
    if(column.length !== p5Instance.height) {
        console.log(`AAA-Mismatch between column length (${column.length}) and image height (${p5Instance.height})`);
        return;
    }
    for (let y = 0; y < p5Instance.height; y++) {
        let index = (x + y * p5Instance.width) * 4;
        p5Instance.pixels[index] = column[y].r;
        p5Instance.pixels[index + 1] = column[y].g;
        p5Instance.pixels[index + 2] = column[y].b;
    }
}

document.getElementById('saveButton').addEventListener('click', function() {
    if (!img) {
        log("No image loaded");
    } else {
    p5Instance.saveCanvas('sorted-image', 'png');
    }
});