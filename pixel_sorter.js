let img;
let p5Instance = null;

let initialLowThreshold, initialHighThreshold, finalLowThreshold, finalHighThreshold;

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
let randomMaskOffset = document.getElementById('randomMaskOffset').checked;
let randomMaskOffsetValue = document.getElementById('randomMaskOffsetValue').value;

moduleManager.addModule("Dithering", false);
moduleManager.addModule("Color quantization", false);
moduleManager.addModule("Posterize", true, 
    { name: "Levels", type: "number", value: 4, step: 1, min: 1, max: 8 } );
moduleManager.addModule("Pixelate", true, 
    { name: "Pixel size", type: "number", value: 2, step: 1, min: 1, max: 25} );
moduleManager.addModule("Sharpen", false);
moduleManager.addModule("Emboss", false);
moduleManager.addModule("Sepia", false);

moduleManager.addModule("Invert", false);
moduleManager.addModule("Edge detection", false);
moduleManager.addModule("Grayscale", false);
moduleManager.addModule("Sobel", false);
moduleManager.addModule("Chromatic aberration", true,
    { name: "Use random offset", type: "checkbox"},
    { name: "Red offset", type: "number", value: 2, step: 1, min: -10, max: 10},
    { name: "Green offset", type: "number", value: 3, step: 1, min: -10, max: 10},
    { name: "Blue offset", type: "number", value: 0, step: 1, min: -10, max: 10});
moduleManager.addModule("Film grain", false);
moduleManager.addModule("Vignette", true, 
    { name: "Size", type: "number", value: 1.0, step: 0.01, min: 0, max: 3}, 
    { name: "Intensity", type: "number", value: 1.0, step: 0.01, min: 0.5, max: 3},
    { name: "Roundness", type: "number", value: 1.0, step: 0.01, min: 0.2, max: 1.2},
    { name: "Smoothness", type: "number", value: 1.0, step: 0.01, min: 0, max: 3} );

moduleManager.addModule("Example", true, 
    { name: "Number setting",   type: "number",   value: 0, step: 1, min: -100, max: 100 },
    { name: "Checkbox setting", type: "checkbox", value: false },
    { name: "Color setting",    type: "color",    value: "#000000" },
    { name: "Range setting",    type: "range",    value: 0, step: 1, min: -100, max: 100 },
    { name: "Text setting",     type: "text",     value: "Text" } );

let useEffects = document.getElementById('useEffects');

let use_color_correction = document.getElementById("use_color_correction");

let color_correction_contrast = document.getElementById("color_correction_contrast");
let color_correction_brightness = document.getElementById("color_correction_brightness");
let color_correction_saturation = document.getElementById("color_correction_saturation");
let color_correction_gamma = document.getElementById("color_correction_gamma");

logById("color_correction_contrast_value", Number(color_correction_contrast.value))
logById("color_correction_brightness_value", Number(color_correction_brightness.value))
logById("color_correction_saturation_value", Number(color_correction_saturation.value))
logById("color_correction_gamma_value", Number(color_correction_gamma.value)) // Completely Useless and Unrelated Note (CUaUN) 1: I really like hats but I don't have any hats. I want a hat. I want a hat so bad. I want a hat so bad that I'm going to buy a hat. I'm going to buy a hat and I'm going to wear it. I'm going to wear it and I'm going to like it. I'm going to like it so much that I'm going to wear it every day. I'm going to wear it every day and I'm going to like it every day

async function sortPixels() {
    if (img) {
        revertChanges();
        sortDirection = document.getElementById('sortDirection').value;
        sortColor = document.getElementById('sortColor').value;
        reverseSort = document.getElementById('reverseSort').checked;
        maskSort = document.getElementById('maskSort').checked;
        visualizeMask = document.getElementById('displayMask').checked;

        randomMaskOffset = document.getElementById('randomMaskOffset').checked;
        randomMaskOffsetValue = document.getElementById('randomMaskOffsetValue').value;
        
        useEffects = document.getElementById('useEffects');
        
        use_color_correction = document.getElementById("use_color_correction");

        color_correction_contrast = document.getElementById("color_correction_contrast");
        color_correction_brightness = document.getElementById("color_correction_brightness");
        color_correction_saturation = document.getElementById("color_correction_saturation");
        color_correction_gamma = document.getElementById("color_correction_gamma");

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

        // CUaUN 2: If reincarnation exists, then i hope that i will get reincarnated as a frog. a small frog. with a hat. and also a guitar, because i like playing guitar. but the guitar would have to be really small so my little frog arms would be able to play it 

        if (useEffects.checked) {               

            if (moduleManager.isModuleEnabled("Posterize")) effect_posterize_function(Number(moduleManager.getModuleSetting("Posterize", "Levels")));
            if (moduleManager.isModuleEnabled("Sharpen")) effect_sharpen_function();
            if (moduleManager.isModuleEnabled("Emboss")) effect_emboss_function();
            if (moduleManager.isModuleEnabled("Sepia")) effect_sepia_function();
            if (moduleManager.isModuleEnabled("Invert")) effect_invert_function();
            if (moduleManager.isModuleEnabled("Edge detection")) effect_edge_detection_function();
            if (moduleManager.isModuleEnabled("Grayscale")) effect_grayscale_function();
            if (moduleManager.isModuleEnabled("Sobel")) effect_sobel_function();
            if (moduleManager.isModuleEnabled("Chromatic aberration")) effect_chromatic_aberration_function(
                Number(moduleManager.getModuleSetting("Chromatic aberration", "Use random offset")),
                Number(moduleManager.getModuleSetting("Chromatic aberration", "Red offset")),
                Number(moduleManager.getModuleSetting("Chromatic aberration", "Green offset")),
                Number(moduleManager.getModuleSetting("Chromatic aberration", "Blue offset")));
            if (moduleManager.isModuleEnabled("Color quantization")) effect_color_quant_function(); // CUaUN 3: When i was a kid i jokingly said that i wanned to become a doorknob salesman, but people took me seriously
            if (moduleManager.isModuleEnabled("Dithering")) effect_dithering_function();
            if (moduleManager.isModuleEnabled("Film grain")) effect_film_grain_function();
            if (moduleManager.isModuleEnabled("Vignette")) effect_vignette_function(
                Number(moduleManager.getModuleSetting("Vignette", "Size")),
                Number(moduleManager.getModuleSetting("Vignette", "Intensity")),
                Number(moduleManager.getModuleSetting("Vignette", "Roundness")),
                Number(moduleManager.getModuleSetting("Vignette", "Smoothness")));
        }

        if (use_color_correction.checked) {
            effect_color_correction(
                Number(color_correction_contrast.value),
                Number(color_correction_brightness.value),
                Number(color_correction_saturation.value),
                Number(color_correction_gamma.value)
            );
            logById("color_correction_contrast_value", Number(color_correction_contrast.value))
            logById("color_correction_brightness_value", Number(color_correction_brightness.value))
            // CUaUN 4: I like to eat cheese... with a spoon... sometimes.
            logById("color_correction_saturation_value", Number(color_correction_saturation.value))
            logById("color_correction_gamma_value", Number(color_correction_gamma.value))
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
                    let hslB = RGBToHSL(b.r, b.g, b.b);  // CUaUN 5: Everytime i see a cat i have to pet it, even if it's a stray cat. I just can't help myself. I love cats.
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
                        if (randomMaskOffset) {
                            let offset = Math.floor(Math.random() * randomMaskOffsetValue);
                            span = span.slice(offset).concat(span.slice(0, offset));
                        }
                        return span;
                    }); // CUaUN 6: The position of one's stapler in relation to the tape dispenser forms the crux of personal philosophy and life outlook. After rearranging my desk in 93 different configurations, I discovered that a 63-degree angle between these two items corresponds with a 12% increase in daily productivity and a 7% increase in existential satisfaction. I'm currently penning a self-help book based on these findings.
        
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
                    if (randomMaskOffset) {
                        let offset = Math.floor(Math.random() * randomMaskOffsetValue);
                        row = row.slice(offset).concat(row.slice(0, offset)); // CUaUN 7: I have a very specific way of eating my food. I eat the crust of my pizza first, then the toppings, then the cheese, and finally the bread. I do this with every food I eat. I have no idea why I do this, but I've been doing it since I was a kid. (this is not true, but it's funny to think about)
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
                        } // CUaUN 8: I may have ocd...
                        if (randomMaskOffset) {
                            let offset = Math.floor(Math.random() * randomMaskOffsetValue);
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
                    if (randomMaskOffset) {
                        let offset = Math.floor(Math.random() * randomMaskOffsetValue);
                        column = column.slice(offset).concat(column.slice(0, offset)); // CUaUN 9: I, for some unknown reason, remeber if every staircases I've ever walked on has an odd or even number of steps. I don't know why I do this, but I do. The only use for this is when I skip steps on a staircase, I know if I have to start by skipping a step or not. (this is real, I actually do this... I don't know why)  
                    }
                    setColumn(x, column);
                }
            }
        } else {
            log("Invalid sorting direction: " + sortDirection);
            return;
        }

        if (useEffects.checked) if (moduleManager.isModuleEnabled("Pixelate")) 
            effect_pixelate_function(Number(moduleManager.getModuleSetting("Pixelate", "Pixel Size")))
        
        p5Instance.updatePixels();
        p5Instance.redraw();
// CUaUN 10: I don't eat toast. I tried it once, I loved it, but I never ate it again. I own a toaster...
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
    } else { // CUaUN 11: When I was a kid, I use to think that people's conversation were connected by small invisible wires that hangged between them, so when I accidentally walked between two people talking, I would take big steps afterwards as to not get caught in the wires.
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
// CUaUN 12: I have a very good memory, I can remember many things. Sadly, I cannot choose what I remember, so I remember a lot of useless things. For example, I remember one time when I was learning how to ski, I was just a child, and everyone in the group fell. I was at the back of the line but I did not fall. I used this opotunity to get to the front of the line. I was very proud of myself, but I don't know why I remember this, but I do.
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

document.getElementById('lowThreshold').addEventListener('change', function() {
    if (document.getElementById('maskSort').checked && document.getElementById('displayMask').checked) {
        sortPixels();
    }
});

document.getElementById('highThreshold').addEventListener('change', function() {
    if (document.getElementById('maskSort').checked && document.getElementById('displayMask').checked) {
        sortPixels();
    }
});

document.getElementById('displayMask').addEventListener('change', function() {
    if (document.getElementById('maskSort').checked) {
        if (this.checked) {
            sortPixels();
        } else {
            revertChanges();
        }
    }
    
});

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

    if (document.getElementById('use_color_correction').checked) {
        document.getElementById('color_correction').style.display = 'flex';
    } else {
        document.getElementById('color_correction').style.display = 'none';
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

document.getElementById('use_color_correction').addEventListener('change', function() {
    if (this.checked) {
        document.getElementById('color_correction').style.display = 'flex';
    } else {
        document.getElementById('color_correction').style.display = 'none';
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
                    document.getElementById('randomMaskOffset').checked = true;
                    break;
                case 'AnimateWithThreshold':                    
                    document.getElementById('maskSort').checked = true;
                    let thresholds = updateThresholds(i, frames);
                    document.getElementById('lowThreshold').value = thresholds[0];
                    document.getElementById('highThreshold').value = thresholds[1];
                    break;
                default: // CUaUN 13: I don't think you should be reading the CUaUN because they are absolutely useless and I don't know why I'm writing them. Don't judge me based on these. I'm not a bad person. I'm just a person who writes bad comments. I'm sorry. I'm so sorry. I'm so so sorry. I'm so so so sorry. I'm so so so so sorry. I'm so so so so so sorry. I'm so so so so so so sorry. I'm so so so so so so so sorry. I'm so so so so so so so so sorry. I'm so so so so so so so so so sorry. I'm so so so so so so so so so so sorry.
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

[ 'color_correction_contrast','color_correction_brightness','color_correction_saturation','color_correction_gamma' ].forEach(function (eventName) {
    document.getElementById(eventName).addEventListener('change', function (event) {
        logById("color_correction_contrast_value", Number(color_correction_contrast.value))
        logById("color_correction_brightness_value", Number(color_correction_brightness.value))
        logById("color_correction_saturation_value", Number(color_correction_saturation.value))
        logById("color_correction_gamma_value", Number(color_correction_gamma.value))
    });
});