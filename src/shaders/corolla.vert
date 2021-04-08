// xy: position in pixels
// z: depth in [0, 1]
attribute vec4 aData;

uniform vec2 uScreenSize; // in pixels

void main(void)
{
    vec2 coords = 2.0 * aData.xy / uScreenSize - 1.0; // [in -.5,.5]^2
    vec2 adjustedCoords = vec2(coords.x, -coords.y);

    gl_Position = vec4(adjustedCoords, aData.z, 1);
}
