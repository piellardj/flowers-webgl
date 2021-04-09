// x: position x in pixels
// y: position y in pixels
// z: size of the widest part in pixels
// w: proportions in [0, 1]
attribute vec4 aData1;

// x: r
// y: g
// z: b
// w: rotation
attribute vec4 aData2;

uniform vec2 uScreenSize; // in pixels
uniform float uPetalAlpha; // in [0,1]

varying vec4 vColor;

// x: proportions
// y: cos(-rotation)
// z: sin(-rotation)
// w: useless, padding for alignment
varying vec4 vState;

void main(void) {
    vec2 coords = 2.0 * aData1.xy / uScreenSize - 1.0; // [in -.5,.5]^2
    vec2 adjustedCoords = vec2(coords.x, -coords.y);
    gl_Position = vec4(adjustedCoords, 0, 1);
    gl_PointSize = aData1.z;

    vColor = vec4(aData2.xyz, uPetalAlpha);
    vState = vec4(aData1.w, cos(-aData2.w), sin(-aData2.w), 0);
}
