function applyKernel(kernel) {
    let kSize = kernel.length;
    let kOffset = Math.floor(kSize / 2);
    let result = [];
    for (let y = 0; y < p5Instance.height; y++) {
        for (let x = 0; x < p5Instance.width; x++) {
            let pixel = { r: 0, g: 0, b: 0 };
            for (let ky = 0; ky < kSize; ky++) {
                for (let kx = 0; kx < kSize; kx++) {
                    let px = x + kx - kOffset;
                    let py = y + ky - kOffset;
                    if (px < 0 || px >= p5Instance.width || py < 0 || py >= p5Instance.height) {
                        continue;
                    }
                    let i = 4 * (py * p5Instance.width + px);
                    let k = kernel[ky][kx];
                    pixel.r += p5Instance.pixels[i] * k;
                    pixel.g += p5Instance.pixels[i + 1] * k;
                    pixel.b += p5Instance.pixels[i + 2] * k;
                }
            }
            result.push(pixel);
        }
    }
    return result;
}

function effect_pixelate_function(pixel_size) {
    let pixelSize = pixel_size;
    for (let y = 0; y < p5Instance.height; y += pixelSize) {
        for (let x = 0; x < p5Instance.width; x += pixelSize) {
            let i = 4 * (y * p5Instance.width + x);
            let pixel = { r: p5Instance.pixels[i], g: p5Instance.pixels[i + 1], b: p5Instance.pixels[i + 2] };
            for (let py = 0; py < pixelSize; py++) {
                for (let px = 0; px < pixelSize; px++) {
                    let pi = 4 * ((y + py) * p5Instance.width + (x + px));
                    p5Instance.pixels[pi] = pixel.r;
                    p5Instance.pixels[pi + 1] = pixel.g;
                    p5Instance.pixels[pi + 2] = pixel.b;
                }
            }
        }
    }
}

function effect_color_quant_function() {
    if (visualizeMask) return;
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
}

function effect_posterize_function(level) {
    if (visualizeMask) return;
    let levels = level;
    let step = 255 / levels;
    for (let y = 0; y < p5Instance.height; y++) {
        for (let x = 0; x < p5Instance.width; x++) {
            let i = 4 * (y * p5Instance.width + x);
            let pixel = { r: p5Instance.pixels[i], g: p5Instance.pixels[i + 1], b: p5Instance.pixels[i + 2] };
            
            pixel.r = Math.floor(pixel.r / step) * step;
            pixel.g = Math.floor(pixel.g / step) * step;
            pixel.b = Math.floor(pixel.b / step) * step;

            p5Instance.pixels[i] = pixel.r;
            p5Instance.pixels[i + 1] = pixel.g;
            p5Instance.pixels[i + 2] = pixel.b;
        }
    }
}

function effect_sharpen_function() {
    if (visualizeMask) return;
    let kernel = [
        [ 0, -1,  0],
        [-1,  5, -1],
        [ 0, -1,  0]
    ];

    let result = applyKernel(kernel);
    for (let i = 0; i < result.length; i++) {
        let index = i * 4;
        p5Instance.pixels[index] = result[i].r;
        p5Instance.pixels[index + 1] = result[i].g;
        p5Instance.pixels[index + 2] = result[i].b;
    }
}

function effect_emboss_function() {
    if (visualizeMask) return;
    let kernel = [
        [-2, -1,  0],
        [-1,  1,  1],
        [ 0,  1,  2]
    ];

    let result = applyKernel(kernel);

    for (let i = 0; i < result.length; i++) {
        let index = i * 4;
        p5Instance.pixels[index] = result[i].r;
        p5Instance.pixels[index + 1] = result[i].g;
        p5Instance.pixels[index + 2] = result[i].b;
    }
}

function effect_dithering_function() {
    if (visualizeMask) return;
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
    console.log("Dithering done");
}

function effect_sepia_function() {
    if (visualizeMask) return;
    for (let y = 0; y < p5Instance.height; y++) {
        for (let x = 0; x < p5Instance.width; x++) {
            let i = 4 * (y * p5Instance.width + x);
            let pixel = { r: p5Instance.pixels[i], g: p5Instance.pixels[i + 1], b: p5Instance.pixels[i + 2] };

            let newPixel = {
                r: Math.min(255, (pixel.r * 0.393) + (pixel.g * 0.769) + (pixel.b * 0.189)),
                g: Math.min(255, (pixel.r * 0.349) + (pixel.g * 0.686) + (pixel.b * 0.168)),
                b: Math.min(255, (pixel.r * 0.272) + (pixel.g * 0.534) + (pixel.b * 0.131))
            };

            p5Instance.pixels[i] = newPixel.r;
            p5Instance.pixels[i + 1] = newPixel.g;
            p5Instance.pixels[i + 2] = newPixel.b;
        }
    }
}

function effect_invert_function() {
    if (visualizeMask) return;
    for (let y = 0; y < p5Instance.height; y++) {
        for (let x = 0; x < p5Instance.width; x++) {
            let i = 4 * (y * p5Instance.width + x);
            let pixel = { r: p5Instance.pixels[i], g: p5Instance.pixels[i + 1], b: p5Instance.pixels[i + 2] };

            let newPixel = {
                r: 255 - pixel.r,
                g: 255 - pixel.g,
                b: 255 - pixel.b
            };

            p5Instance.pixels[i] = newPixel.r;
            p5Instance.pixels[i + 1] = newPixel.g;
            p5Instance.pixels[i + 2] = newPixel.b;
        }
    }
}

function effect_edge_detection_function() {
    if (visualizeMask) return;
    let kernel = [
        [-1, -1, -1],
        [-1,  8, -1],
        [-1, -1, -1]
    ];

    let result = applyKernel(kernel);

    for (let i = 0; i < result.length; i++) {
        let index = i * 4;
        p5Instance.pixels[index] = result[i].r;
        p5Instance.pixels[index + 1] = result[i].g;
        p5Instance.pixels[index + 2] = result[i].b;
    }
}

function effect_grayscale_function() {
    if (visualizeMask) return;
    for (let y = 0; y < p5Instance.height; y++) {
        for (let x = 0; x < p5Instance.width; x++) {
            let i = 4 * (y * p5Instance.width + x);
            let pixel = { r: p5Instance.pixels[i], g: p5Instance.pixels[i + 1], b: p5Instance.pixels[i + 2] };

            let newPixel = {
                r: Math.min(255, (pixel.r * 0.2126) + (pixel.g * 0.7152) + (pixel.b * 0.0722)),
                g: Math.min(255, (pixel.r * 0.2126) + (pixel.g * 0.7152) + (pixel.b * 0.0722)),
                b: Math.min(255, (pixel.r * 0.2126) + (pixel.g * 0.7152) + (pixel.b * 0.0722))
            };

            p5Instance.pixels[i] = newPixel.r;
            p5Instance.pixels[i + 1] = newPixel.g;
            p5Instance.pixels[i + 2] = newPixel.b;
        }
    }
}

function effect_sobel_function() {
    if (visualizeMask) return;
    let kernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    let kernelY = [
        [-1, -2, -1],
        [ 0,  0,  0],
        [ 1,  2,  1]
    ];

    let resultX = applyKernel(kernelX);
    let resultY = applyKernel(kernelY);

    for (let i = 0; i < resultX.length; i++) {
        let index = i * 4;
        let pixelX = resultX[i];
        let pixelY = resultY[i];

        let newPixel = {
            r: Math.sqrt(Math.pow(pixelX.r, 2) + Math.pow(pixelY.r, 2)),
            g: Math.sqrt(Math.pow(pixelX.g, 2) + Math.pow(pixelY.g, 2)),
            b: Math.sqrt(Math.pow(pixelX.b, 2) + Math.pow(pixelY.b, 2))
        };

        p5Instance.pixels[index] = newPixel.r;
        p5Instance.pixels[index + 1] = newPixel.g;
        p5Instance.pixels[index + 2] = newPixel.b;
    }
}

function effect_chromatic_aberration_function(use_random_offset, redOffsets, greenOffsets, blueOffsets) {
    let pixelsCopy = p5Instance.pixels.slice();
    let width = p5Instance.width;
    let height = p5Instance.height;

    let use_random = use_random_offset;

    let maxOffset = 10;
    
    let redOffset = Math.floor(Math.random() * maxOffset);
    let greenOffset = Math.floor(Math.random() * maxOffset);
    let blueOffset = Math.floor(Math.random() * maxOffset);

    if (!use_random) {
        redOffset = redOffsets;
        greenOffset = greenOffsets;
        blueOffset = blueOffsets;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let i = 4 * (y * width + x);
            let newI = 4 * (y * width + (x + redOffset));
            let newI2 = 4 * (y * width + (x + greenOffset));
            let newI3 = 4 * (y * width + (x + blueOffset));

            p5Instance.pixels[i] = pixelsCopy[newI];
            p5Instance.pixels[i + 1] = pixelsCopy[newI2 + 1];
            p5Instance.pixels[i + 2] = pixelsCopy[newI3 + 2];
        }
    }
}

function effect_film_grain_function() {
    if (visualizeMask) return;
    let intensity = 25;

    for (let y = 0; y < p5Instance.height; y++) {
        for (let x = 0; x < p5Instance.width; x++) {
            let i = 4 * (y * p5Instance.width + x);

            let grain = Math.random() * intensity * 2 - intensity; 

            let newPixel = {
                r: Math.min(255, Math.max(0, p5Instance.pixels[i] + grain)),
                g: Math.min(255, Math.max(0, p5Instance.pixels[i + 1] + grain)),
                b: Math.min(255, Math.max(0, p5Instance.pixels[i + 2] + grain))
            };

            p5Instance.pixels[i] = newPixel.r;
            p5Instance.pixels[i + 1] = newPixel.g;
            p5Instance.pixels[i + 2] = newPixel.b;
        }
    }
}

function effect_vignette_function(size, intensity, roundness, smoothness) {
    if (visualizeMask) return;
    // adaptation of https://github.com/GarrettGunnell/AcerolaFX/blob/main/Shaders/AcerolaFX_Vignette.fx
    let VignetteColor = [0, 0, 0];
    let VignetteSize = size; 
    let VignetteOffset = 0.0; 
    let Intensity = intensity;
    let Roundness = roundness;
    let Smoothness = smoothness;

    for (let y = 0; y < p5Instance.height; y++) {
        for (let x = 0; x < p5Instance.width; x++) {
            let i = 4 * (y * p5Instance.width + x);
            let pixel = { r: p5Instance.pixels[i], g: p5Instance.pixels[i + 1], b: p5Instance.pixels[i + 2] };

            let pos = {x: x / p5Instance.width, y: y / p5Instance.height};
            pos.x -= 0.5;
            pos.y -= 0.5;
            pos.x *= VignetteSize;
            pos.y *= VignetteSize;
            pos.x += 0.5;
            pos.y += 0.5;

            let d = {x: Math.abs(pos.x - (0.5 + VignetteOffset)), y: Math.abs(pos.y - (0.5 + VignetteOffset))};
            d.x *= Intensity;
            d.y *= Intensity;
            d.x = Math.pow(Math.max(0, d.x), Roundness);
            d.y = Math.pow(Math.max(0, d.y), Roundness);
            let vfactor = Math.pow(Math.max(0, 1.0 - (d.x * d.x + d.y * d.y)), Smoothness);

            let newPixel = {
                r: VignetteColor[0] * (1 - vfactor) + pixel.r * vfactor,
                g: VignetteColor[1] * (1 - vfactor) + pixel.g * vfactor,
                b: VignetteColor[2] * (1 - vfactor) + pixel.b * vfactor
            };

            p5Instance.pixels[i] = newPixel.r;
            p5Instance.pixels[i + 1] = newPixel.g;
            p5Instance.pixels[i + 2] = newPixel.b;
        }
    }
}

function effect_color_correction(c, b, s, g) {
    if (visualizeMask) return;
    let pixels = p5Instance.pixels;

    let contrast = 1.2; // range from 0 to 2, 1 means no change
    let brightness = 0; // range from -255 to 255, 0 means no change
    let saturation = 1.5; // range from 0 to 2, 1 means no change
    let gamma = 0.8; // usually in range from 0.8 to 2.2

    contrast = c;
    brightness = b;
    saturation = s;
    gamma = g;

    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];

        //contrast
        r = ((r - 128) * contrast) + 128;
        g = ((g - 128) * contrast) + 128;
        b = ((b - 128) * contrast) + 128;

        //brightness
        r += brightness;
        g += brightness;
        b += brightness;

        //saturation
        let hsl = RGBToHSL(r, g, b);
        hsl[1] *= saturation;

        let rgb = HSLToRGB(hsl[0], hsl[1], hsl[2]);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];

        //gamma
        r = Math.pow(r / 255, 1 / gamma) * 255;
        g = Math.pow(g / 255, 1 / gamma) * 255;
        b = Math.pow(b / 255, 1 / gamma) * 255;

        pixels[i] = clamp(r, 0, 255);
        pixels[i + 1] = clamp(g, 0, 255);
        pixels[i + 2] = clamp(b, 0, 255);
    }
}

//TODO: 
// - Exposure
// - Temperature
// - Tint
// - COntrast
// - Linear Mid Point
// - Brightness
// - Color Filter
// - Color Filter Intensity (HDR)
// - Saturation
// - bloom
//    Explenation of bloom (this is all in a single function)): 
//     Filter pixels so only the bright ones are seleted
//     Blur the selected pixels
//     Add the blurred pixels to the original image
//     Tone map the image to prevent overexposure

function effect_bloom_function() {
    let pixels = p5Instance.pixels;
    let width = p5Instance.width;
    let height = p5Instance.height;

    // Step 1: Filter pixels to select only the bright ones
    let brightPixels = new Uint8Array(pixels.length);
    for (let i = 0; i < pixels.length; i += 4) {
        let brightness = 0.3 * pixels[i] + 0.59 * pixels[i + 1] + 0.11 * pixels[i + 2]; // Approximate brightness calculation
        if (brightness > 200) { // You may need to adjust this threshold
            brightPixels[i] = pixels[i];
            brightPixels[i + 1] = pixels[i + 1];
            brightPixels[i + 2] = pixels[i + 2];
            brightPixels[i + 3] = 255;
        }
    }

    // Step 2: Blur the selected pixels (simple box blur for illustration)
    let blurredPixels = new Uint8Array(pixels.length);
    let blurSize = 5; // You may need to adjust this value
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, count = 0;
            for (let dx = -blurSize; dx <= blurSize; dx++) {
                for (let dy = -blurSize; dy <= blurSize; dy++) {
                    let nx = x + dx;
                    let ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        let i = 4 * (ny * width + nx);
                        r += brightPixels[i];
                        g += brightPixels[i + 1];
                        b += brightPixels[i + 2];
                        count++;
                    }
                }
            }
            let i = 4 * (y * width + x);
            blurredPixels[i] = r / count;
            blurredPixels[i + 1] = g / count;
            blurredPixels[i + 2] = b / count;
            blurredPixels[i + 3] = 255;
        }
    }

    // Step 3: Add the blurred pixels to the original image
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] += blurredPixels[i];
        pixels[i + 1] += blurredPixels[i + 1];
        pixels[i + 2] += blurredPixels[i + 2];
        // Tone mapping (clamp to prevent overexposure)
        pixels[i] = Math.min(pixels[i], 255);
        pixels[i + 1] = Math.min(pixels[i + 1], 255);
        pixels[i + 2] = Math.min(pixels[i + 2], 255);
    }

    // Apply the updated pixels
    p5Instance.updatePixels();
}
