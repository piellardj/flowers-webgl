// x: position x in pixels
// y: position y in pixels
// z: encoded dimensions
// w: depth in [-1, 1]
attribute vec4 aData1;

// x: r
// y: g
// z: b
// w: rotation
attribute vec4 aData2;

uniform vec2 uScreenSize; // in pixels
uniform float uPetalAlpha; // in [0,1]

varying vec4 vColor;

// x: proportions in [0, 1]
// y: cos(-rotation)
// z: sin(-rotation)
// w: useless, padding for alignment
varying vec4 vState;

void main(void) {
    vec2 coords = 2.0 * aData1.xy / uScreenSize - 1.0; // [in -.5,.5]^2
    vec2 adjustedCoords = vec2(coords.x, -coords.y);
    gl_Position = vec4(adjustedCoords, aData1.w, 1);

    float widestSide = ceil(aData1.z);
    float proportions = fract(aData1.z);

    gl_PointSize = widestSide;

    vColor = vec4(aData2.xyz, uPetalAlpha);
    vState = vec4(proportions, cos(-aData2.w), sin(-aData2.w), 0);
}
