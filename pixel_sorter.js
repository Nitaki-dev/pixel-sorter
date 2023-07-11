let img;
let p5Instance = null;

let randomMaskOffset = 15;

let initialLowThreshold;
let initialHighThreshold;
let finalLowThreshold;
let finalHighThreshold;

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
        log('Please upload an image file.');
    }
}

let sortDirection = document.getElementById('sortDirection').value;
let sortColor = document.getElementById('sortColor').value;
let reverseSort = document.getElementById('reverseSort').checked;
let maskSort = document.getElementById('maskSort').checked;
let visualizeMask = document.getElementById('displayMask').checked;
let ramdomMaskOffset = document.getElementById('ramdomMaskOffset').checked;

let useEffects = document.getElementById('useEffects');

// effects
let effect_dithering = document.getElementById("effect_dithering");
let effect_color_quant = document.getElementById("effect_color_quant");
let effect_posterize = document.getElementById("effect_posterize");
let effect_pixelate = document.getElementById("effect_pixelate");
let effect_sharpen = document.getElementById("effect_sharpen");
let effect_emboss = document.getElementById("effect_emboss");
let effect_sepia = document.getElementById("effect_sepia");

let effect_invert = document.getElementById("effect_invert");
let effect_edge_detection = document.getElementById("effect_edge_detection");
let effect_grayscale = document.getElementById("effect_grayscale");
let effect_sobel = document.getElementById("effect_sobel");
let effect_chromatic_aberration = document.getElementById("effect_chromatic_aberration");
let effect_film_grain = document.getElementById("effect_film_grain");
let effect_vignette = document.getElementById("effect_vignette");

async function sortPixels() {
    if (img) {
        revertChanges();
        sortDirection = document.getElementById('sortDirection').value;
        sortColor = document.getElementById('sortColor').value;
        reverseSort = document.getElementById('reverseSort').checked;
        maskSort = document.getElementById('maskSort').checked;
        visualizeMask = document.getElementById('displayMask').checked;
        ramdomMaskOffset = document.getElementById('ramdomMaskOffset').checked;

        useEffects = document.getElementById('useEffects');

        effect_dithering = document.getElementById("effect_dithering");
        effect_color_quant = document.getElementById("effect_color_quant");
        effect_posterize = document.getElementById("effect_posterize");
        effect_pixelate = document.getElementById("effect_pixelate");
        effect_sharpen = document.getElementById("effect_sharpen");
        effect_emboss = document.getElementById("effect_emboss");
        effect_sepia = document.getElementById("effect_sepia");
        effect_invert = document.getElementById("effect_invert");
        effect_edge_detection = document.getElementById("effect_edge_detection");
        effect_grayscale = document.getElementById("effect_grayscale");
        effect_sobel = document.getElementById("effect_sobel");
        effect_chromatic_aberration = document.getElementById("effect_chromatic_aberration");
        effect_film_grain = document.getElementById("effect_film_grain");
        effect_vignette = document.getElementById("effect_vignette");

        p5Instance.loadPixels();

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

        if (useEffects.checked) {               
            if (effect_posterize.checked) effect_posterize_function()
            if (effect_sharpen.checked) effect_sharpen_function()
            if (effect_emboss.checked) effect_emboss_function()
            if (effect_sepia.checked) effect_sepia_function()
            if (effect_invert.checked) effect_invert_function()
            if (effect_edge_detection.checked) effect_edge_detection_function()
            if (effect_grayscale.checked) effect_grayscale_function()
            if (effect_sobel.checked) effect_sobel_function()
            if (effect_color_quant.checked) effect_color_quant_function()
            if (effect_dithering.checked) effect_dithering_function()
            if (effect_chromatic_aberration.checked) effect_chromatic_aberration_function()
            if (effect_film_grain.checked) effect_film_grain_function()
            if (effect_vignette.checked) effect_vignette_function()
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
                log("Invalid sorting mode: " + sortColor);
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
                        if (ramdomMaskOffset) {
                            let offset = Math.floor(Math.random() * randomMaskOffset);
                            span = span.slice(offset).concat(span.slice(0, offset));
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
                    if (ramdomMaskOffset) {
                        let offset = Math.floor(Math.random() * randomMaskOffset);
                        row = row.slice(offset).concat(row.slice(0, offset));
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
                        if (ramdomMaskOffset) {
                            let offset = Math.floor(Math.random() * randomMaskOffset);
                            span = span.slice(offset).concat(span.slice(0, offset));
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
                    if (ramdomMaskOffset) {
                        let offset = Math.floor(Math.random() * randomMaskOffset);
                        column = column.slice(offset).concat(column.slice(0, offset));
                    }
                    setColumn(x, column);
                }
            }
        } else {
            log("Invalid sorting direction: " + sortDirection);
            return;
        }
        if (useEffects.checked) if (effect_pixelate.checked) effect_pixelate_function()

        p5Instance.updatePixels();
        p5Instance.redraw();

    } else {
        log("No image loaded");
    }
}

function maskFunction(pixel, lowThreshold, highThreshold) {
    let pixelValue = 0.2989*pixel.r + 0.5870*pixel.g + 0.1140*pixel.b;
    let normalizedValue = pixelValue / 255;
    let invertMask = document.getElementById('invertMask').checked;

    if (invertMask) {
        if (normalizedValue > lowThreshold && normalizedValue < highThreshold) {
            return false;
        } else {
            return true;
        }
    } else {
        if (normalizedValue > lowThreshold && normalizedValue < highThreshold) {
            return true;
        } else {
            return false;
        }
    }
}

function maskPixels() {
    let lowThreshold = parseFloat(document.getElementById('lowThreshold').value);
    let highThreshold = parseFloat(document.getElementById('highThreshold').value);

    let maskedPixels = [];
    let mask = [];
    let r, g, b, a, pixel, masked;

    for (let i = 0; i < p5Instance.pixels.length; i += 4) {
        r = p5Instance.pixels[i];
        g = p5Instance.pixels[i + 1];
        b = p5Instance.pixels[i + 2];
        a = p5Instance.pixels[i + 3];

        pixel = {r: r, g: g, b: b, a: a};

        masked = maskFunction(pixel, lowThreshold, highThreshold);
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
        r: quantizeColor(oldPixel.r, 32), g: quantizeColor(oldPixel.g, 32), b: quantizeColor(oldPixel.b, 32)
    };
}

function applyDithering(pixels, x, y, quantError) {
    let index;
    if (x + 1 < p5Instance.width) {index = 4 * ((y) * p5Instance.width + (x + 1)); pixels[index] += quantError.r * 7/16; pixels[index + 1] += quantError.g * 7/16; pixels[index + 2] += quantError.b * 7/16;}
    if (x - 1 >= 0 && y + 1 < p5Instance.height) {index = 4 * ((y + 1) * p5Instance.width + (x - 1)); pixels[index] += quantError.r * 3/16; pixels[index + 1] += quantError.g * 3/16; pixels[index + 2] += quantError.b * 3/16;}
    if (y + 1 < p5Instance.height) {index = 4 * ((y + 1) * p5Instance.width + x); pixels[index] += quantError.r * 5/16; pixels[index + 1] += quantError.g * 5/16; pixels[index + 2] += quantError.b * 5/16;}
    if (x + 1 < p5Instance.width && y + 1 < p5Instance.height) {index = 4 * ((y + 1) * p5Instance.width + (x + 1)); pixels[index] += quantError.r * 1/16; pixels[index + 1] += quantError.g * 1/16; pixels[index + 2] += quantError.b * 1/16;}
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
    } else {
        log("No image loaded");
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
        console.log(`Mismatch between row length ${row.length} and image width ${p5Instance.width}`);
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
        console.log(`Mismatch between column length ${column.length} and image height ${p5Instance.height}`);
        return;
    }
    for (let y = 0; y < p5Instance.height; y++) {
        let index = (x + y * p5Instance.width) * 4;
        p5Instance.pixels[index] = column[y].r;
        p5Instance.pixels[index + 1] = column[y].g;
        p5Instance.pixels[index + 2] = column[y].b;
    }
}

function updateThresholds(currentFrame, totalFrames) {
    let lowThreshold = (currentFrame / totalFrames) * finalLowThreshold;
    let highThreshold = (currentFrame / totalFrames) * finalHighThreshold;
    return [lowThreshold, highThreshold];
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('maskSort').checked) {
        document.getElementById('maskOptions').style.display = 'block';
    } else {
        document.getElementById('maskOptions').style.display = 'none';
    }

    if (document.getElementById('useEffects').checked) {
        document.getElementById('effect-list').style.display = 'flex';
    } else {
        document.getElementById('effect-list').style.display = 'none';
    }
});

document.getElementById('maskSort').addEventListener('change', function() {
    if (this.checked) {
        document.getElementById('maskOptions').style.display = 'block';
    } else {
        document.getElementById('maskOptions').style.display = 'none';
    }
});

document.getElementById('useEffects').addEventListener('change', function() {
    if (this.checked) {
        document.getElementById('effect-list').style.display = 'flex';
    } else {
        document.getElementById('effect-list').style.display = 'none';
    }
});

document.getElementById('image-export-button').addEventListener('click', function() {
    if (!img) {
        log("No image loaded");
    } else {
        p5Instance.saveCanvas('sorted-image', 'png');
    }
});

document.getElementById('gif-export-button').addEventListener('click', async function() {
    if (!img) {
        log("No image loaded");
    } else {        
        log("Rendering gif, this may take a while...");
        let gif = new GIF({
            workers: 2,
            quality: 100,
            width: img.width,
            height: img.height
        });

        initialLowThreshold = 0;
        initialHighThreshold = 0;
        finalLowThreshold = parseFloat(document.getElementById('lowThreshold').value);
        finalHighThreshold = parseFloat(document.getElementById('highThreshold').value);
        
        let frames = Number(document.getElementById('gifFrames').value);
        let mode = document.getElementById('selectedGifMode').value;
        
        let originalPixels = [...p5Instance.pixels];

        for(let i=0; i<frames; i++) {
            switch(mode) {
                case 'AnimateWithOffset':
                    document.getElementById('ramdomMaskOffset').checked = true;
                    break;
                case 'AnimateWithThreshold':                    
                    document.getElementById('maskSort').checked = true;
                    let thresholds = updateThresholds(i, frames);
                    document.getElementById('lowThreshold').value = thresholds[0];
                    document.getElementById('highThreshold').value = thresholds[1];
                    break;
                default:
                    log("Invalid mode: " + mode);
                    return;
            }
            
            await sortPixels();
            gif.addFrame(document.getElementById('image-canvas'), {copy: true, delay: 10});
            await new Promise(resolve => setTimeout(resolve, 0));
            log("Rendering gif, this may take a while...");
            stackLogs("Frame " + (i+1) + " of " + frames + " complete");

            p5Instance.pixels = [...originalPixels];
        }

        log("Done! The GIF will download automatically soon.");

        gif.on('finished', function(blob) {
            let url= URL.createObjectURL(blob);
            let link = document.createElement('a');
            link.download = 'sorted-gif.gif';
            link.href = url;
            link.click();
        });
        gif.render();
    }
});