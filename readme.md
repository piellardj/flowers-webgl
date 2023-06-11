# flowers-webgl

## Description
This is project paints a flower field in a naive style. Over time, each flower loses its petals to the wind and eventually dies, only to be replaced by a new one.

The stems are modelized as weightless ropes and animated with Verlet integration. The mouse can be used to interact with the flowers.

See it live [here](https://piellardj.github.io/flowers-webgl/?page%3Acanvas%3Afullscreen=true).

[![Donate](https://raw.githubusercontent.com/piellardj/piellardj.github.io/master/images/readme/donate-paypal.svg)](https://www.paypal.com/donate/?hosted_button_id=AF7H7GEJTL95E)

![Screenshot](src/readme/screenshot-1.png)

![Screenshot](src/readme/screenshot-2.png)

## Details

This project was inspired by still pictures from user [moPsych](https://github.com/moPsych).

### Rope physics
The flower stems are modelized as ropes. A rope is seen as a chain of nodes linked by very stiff springs. There are two constraints:
- the first node (root of the flower) is fixed
- the distance between consecutive nodes is fixed

In this scene the gravity does not apply to the rope itself, the only source of movement is the flower corolla which is moved by the wind and gravity.

For each update step:
- each node's position is updated with Verlet integration
- then to make sure the constraints are mostly satisfied, I run an adjustment step an arbirary number of times. Since in this scene the movements are quite slow, a dozen of times is enough.

### Line interpolation
Each rope is only made of a few segments because I think it gives more interesting movements. However I still wanted the stems to look smooth, so before drawing them I smoothen the lines by computing a full Chaikin subdivision. This is suboptimal because I only need to subdivide the parts that have steep angles (no need to subdivide segments that are aligned in a straight line).

![Screenshot](src/readme/chaikin.png)

### Performance
In this project, the drawing part is more expensive than the updating part. I first started by using Canvas2D but migrated to WebGL for performance reasons. You can still use the Canvas2D version by adding `plotter=canvas2d` in the URL.

With a scene of 1920 pixels wide and with 400 flowers and 60000 petals in total:
- Canvas2D takes 50 ms per frame
- WebGL takes less than 2 ms per frame

#### Canvas2D plotting
This project uses Canvas2D API for drawing. The scene is made of lines, polygon and ellipsis. As usual, Canvas2D is easy to use for prototyping but is not great performance-wise.

In every drawing framework, the main optimisation is to reduce state changes (stroke styles, fill etc.) by doing the drawing in batches. However in this scene, it is not possible because I want to maintain visual coherence: some flowers are behind others. Since Canvas2D doesn't have depth buffer, the simplest way to simulate this is to preserve the drawing order of flowers. This is suboptimal because drawing a single corolla requires 1 state change (petals and outline), so drawing N corollas one by one implies N state changes. The only thing I can do is draw all stems at once because they are all at the back. With WebGL support, I could take advantage of the depth buffer to further reduce state changes: I could draw all stems at once, then all petals at once, then all corollas at once.

One interesting thing I found is that on my mobile device, asking Canvas2D to draw a line with a width of 2 is absurdly more expensive than a line of 1 pixel. I did not find much information on this issue. My guess is that Chrome uses an OpenGL backend for Canvas2D and that on my device, the max line width supported by OpenGL is 1. This seems plausible because when I test the WebGL attribute `gl.ALIASED_LINE_WIDTH_RANGE`, I get 1 also. So, Chrome can draw a 1-pixel wide line with native OpenGL line primitive which is fast, whereas drawing a wider line requires expensive technique such as triangulating the line.

Also, IE11 doesn't support `CanvasRenderingContext2D.ellipse` drawing with Canvas2D, so I use the `CanvasRenderingContext2D.arc` API to draw circles as a fallback.

#### WebGL plotting
I ended up implementing WebGL plotting because the Canvas2D performance was too bad.

Contrarily to Canvas2D, WebGL has depth testing so I can use it to change the drawing order while still maintaing the same result visually. This allows me to minimize state changes: shader binding, buffers binding etc. I draw all lines at once, all petals at once (as `gl.POINTS`) and all corollas at once (as `gl.TRIANGLE`).

Since the flower corollas have both a fill color (`gl.TRIANGLE`) and an outline stroke (`gl.LINES`) that share the same depth, I use the `gl.LEQUAL` depth function. This is also useful when drawing all petals at once: the petals of a single flowers are supposed to blend together.

Also since the petals are of all flowers are supposed to blend together regardless of the flower depth, when drawing them I only read the depth buffer (so that a flower can be occulted by a flower corolla) but disable the writes with `gl.depthMask(false)`.