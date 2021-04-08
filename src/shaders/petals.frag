precision lowp float;

varying vec4 vColor;

// x: proportions
// y: cos(-rotation)
// z: sin(-rotation)
// w: useless, padding for alignment
varying vec4 vState;

void main(void) {
    vec2 localCoords = gl_PointCoord - vec2(.5); // in [-.5,+.5]^2

    localCoords = vec2(
        localCoords.x * vState.y - localCoords.y * vState.z,
        localCoords.x * vState.z + localCoords.y * vState.y
    );

    localCoords.y /= vState.x;

    if(dot(localCoords, localCoords) > 0.25) {
        discard;
    }

    gl_FragColor = vColor;
}
