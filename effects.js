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

function effect_pixelate_function() {
    let pixelSize = 2;
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

function effect_posterize_function() {
    let levels = 4;
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
}

function effect_sepia_function() {
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

function effect_chromatic_aberration_function() {
    let pixelsCopy = p5Instance.pixels.slice();
    let width = p5Instance.width;
    let height = p5Instance.height;

    let maxOffset = 10;

    let redOffset = Math.floor(Math.random() * maxOffset);
    let greenOffset = Math.floor(Math.random() * maxOffset);
    let blueOffset = Math.floor(Math.random() * maxOffset);

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

function effect_vignette_function() {
    // adaptation of https://github.com/GarrettGunnell/AcerolaFX/blob/main/Shaders/AcerolaFX_Vignette.fx
    let VignetteColor = [0, 0, 0];
    let VignetteSize = 1.0; 
    let VignetteOffset = 0.0; 
    let Intensity = 1.0;
    let Roundness = 1.0;
    let Smoothness = 1.0;

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