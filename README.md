# Pixel sorting made easy 
Insipired by [Acerola](https://github.com/GarrettGunnell/Pixel-Sorting)
<br>
You can try this right now on [my website](https://nitaki-dev.github.io/pixel-sorter/)!

![image 1](imgs/sorted-1.gif)

# What is pixel sorting?
Pixel Sorting is a digital art effect where we apply a sorting algorithm to the pixels of an image and sort them based on certain criteria to create stunning results

![image 2](imgs/sorted-2.png)

# How to

![image 3](imgs/how-to.png)

### Effects:
|                                                                         |                                                                             |
| ---                                                                     | ---                                                                         |
| [Dithering](https://en.wikipedia.org/wiki/Dither )                      | [Invert](https://en.wikipedia.org/wiki/Negative_(photography) )             |
| [Color Quantization](https://en.wikipedia.org/wiki/Color_quantization ) | [Edge Detection](https://en.wikipedia.org/wiki/Edge_detection )             |
| [Posterize](https://en.wikipedia.org/wiki/Posterization )               | [Grayscale](https://en.wikipedia.org/wiki/Grayscale )                       |
| [Pixelate](https://en.wikipedia.org/wiki/Pixelation )                   | [Sobel](https://en.wikipedia.org/wiki/Sobel_operator )                      |
| [Sharpen](https://en.wikipedia.org/wiki/Unsharp_masking )               | [Chromatic Aberration](https://en.wikipedia.org/wiki/Chromatic_aberration ) |
| [Emboss](https://en.wikipedia.org/wiki/Image_embossing )                | [Film grain](https://en.wikipedia.org/wiki/Film_grain )                     |
| [Sepia](https://en.wikipedia.org/wiki/Sepia_(color) )                   | [Vignette](https://en.wikipedia.org/wiki/Vignetting )                       |

### GIF animation methods:
`Animate with random offset` and `Animate with threshold` are the two methods that can be used to animate the glitch effect

- `Animate with random offset` : The offset will be randomly generated for each frame
- `Animate with threshold` : The threshold will slowly be incremented until it reaches the value set by the user

---

#### How does the mask work and the threshold work ?<br>

The mask is a black and white image that will be used to determine which pixels will be sorted and which won't. The threshold is a value between 0 and 255 that will be used to determine which pixels will be sorted and which won't. The pixels that have a value that falles inside both thresholds will be sorted and the ones that don't won't be sorted.
<br>

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FNitaki-dev%2Fpixel-sorter&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=views&edge_flat=false)](https://hits.seeyoufarm.com)

> If you have any other questions or requests, feel free to contact me on discord `@nitaki.`