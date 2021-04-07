attribute vec2 aVertex; // in pixels

uniform vec2 uScreenSize; // in pixels

void main(void)
{
    vec2 coords = 2.0 * aVertex / uScreenSize - 1.0; // [in -.5,.5]^2
    vec2 adjustedCoords = vec2(coords.x, -coords.y);

    gl_Position = vec4(adjustedCoords, 0, 1);
}
