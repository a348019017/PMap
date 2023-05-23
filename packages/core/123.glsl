"#version 300 es
#define WEBGL_2
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
    #define highp mediump
#endif

#define LOG_DEPTH
#define USE_SHADOW_DEPTH_TEXTURE
layout(location = 0) out vec4 czm_fragColor;
#define OUTPUT_DECLARATION

#define OES_texture_float_linear

#define OES_texture_float











 float czm_unpackDepth(vec4 packedDepth)
 {
    
    
    return dot(packedDepth, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0));
 }


float czm_sampleShadowMap(highp samplerCube shadowMap, vec3 d)
{
    return czm_unpackDepth(texture(shadowMap, d));
}

float czm_sampleShadowMap(highp sampler2D shadowMap, vec2 uv)
{
#ifdef USE_SHADOW_DEPTH_TEXTURE
    return texture(shadowMap, uv).r;
#else
    return czm_unpackDepth(texture(shadowMap, uv));
#endif
}

float czm_shadowDepthCompare(samplerCube shadowMap, vec3 uv, float depth)
{
    return step(depth, czm_sampleShadowMap(shadowMap, uv));
}

float czm_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth)
{
    return step(depth, czm_sampleShadowMap(shadowMap, uv));
}

struct czm_shadowParameters
{
#ifdef USE_CUBE_MAP_SHADOW
    vec3 texCoords;
#else
    vec2 texCoords;
#endif

    float depthBias;
    float depth;
    float nDotL;
    vec2 texelStepSize;
    float normalShadingSmooth;
    float darkness;
};

uniform float czm_log2FarDepthFromNearPlusOne;
uniform vec4 czm_viewport;
uniform vec2 czm_currentFrustum;
uniform vec4 czm_frustumPlanes;
uniform mat4 czm_inverseProjection;
uniform mat4 czm_viewportTransformation;




float czm_private_shadowVisibility(float visibility, float nDotL, float normalShadingSmooth, float darkness)
{
#ifdef USE_NORMAL_SHADING
#ifdef USE_NORMAL_SHADING_SMOOTH
    float strength = clamp(nDotL / normalShadingSmooth, 0.0, 1.0);
#else
    float strength = step(0.0, nDotL);
#endif
    visibility *= strength;
#endif

    visibility = max(visibility, darkness);
    return visibility;
}

#ifdef USE_CUBE_MAP_SHADOW
float czm_shadowVisibility(samplerCube shadowMap, czm_shadowParameters shadowParameters)
{
    float depthBias = shadowParameters.depthBias;
    float depth = shadowParameters.depth;
    float nDotL = shadowParameters.nDotL;
    float normalShadingSmooth = shadowParameters.normalShadingSmooth;
    float darkness = shadowParameters.darkness;
    vec3 uvw = shadowParameters.texCoords;

    depth -= depthBias;
    float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
    return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
}
#else
float czm_shadowVisibility(sampler2D shadowMap, czm_shadowParameters shadowParameters)
{
    float depthBias = shadowParameters.depthBias;
    float depth = shadowParameters.depth;
    float nDotL = shadowParameters.nDotL;
    float normalShadingSmooth = shadowParameters.normalShadingSmooth;
    float darkness = shadowParameters.darkness;
    vec2 uv = shadowParameters.texCoords;

    depth -= depthBias;
#ifdef USE_SOFT_SHADOWS
    vec2 texelStepSize = shadowParameters.texelStepSize;
    float radius = 1.0;
    float dx0 = -texelStepSize.x * radius;
    float dy0 = -texelStepSize.y * radius;
    float dx1 = texelStepSize.x * radius;
    float dy1 = texelStepSize.y * radius;
    float visibility = (
        czm_shadowDepthCompare(shadowMap, uv, depth) +
        czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth) +
        czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth) +
        czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth) +
        czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth) +
        czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth) +
        czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth) +
        czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth) +
        czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth)
    ) * (1.0 / 9.0);
#else
    float visibility = czm_shadowDepthCompare(shadowMap, uv, depth);
#endif

    return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
}
#endif


uniform mat4 shadowMap_cascadeMatrices[4];

mat4 czm_cascadeMatrix(vec4 weights)
{
    return shadowMap_cascadeMatrices[0] * weights.x +
           shadowMap_cascadeMatrices[1] * weights.y +
           shadowMap_cascadeMatrices[2] * weights.z +
           shadowMap_cascadeMatrices[3] * weights.w;
}


uniform vec4 shadowMap_cascadeSplits[2];

vec4 czm_cascadeWeights(float depthEye)
{
    
    vec4 near = step(shadowMap_cascadeSplits[0], vec4(depthEye));
    vec4 far = step(depthEye, shadowMap_cascadeSplits[1]);
    return near * far;
}

vec4 czm_screenToEyeCoordinates(vec4 screenCoordinate)
{
    
    float x = 2.0 * screenCoordinate.x - 1.0;
    float y = 2.0 * screenCoordinate.y - 1.0;
    float z = (screenCoordinate.z - czm_viewportTransformation[3][2]) / czm_viewportTransformation[2][2];
    vec4 q = vec4(x, y, z, 1.0);

    
    q /= screenCoordinate.w;

    
    if (!(czm_inverseProjection == mat4(0.0))) 
    {
        q = czm_inverseProjection * q;
    }
    else
    {
        float top = czm_frustumPlanes.x;
        float bottom = czm_frustumPlanes.y;
        float left = czm_frustumPlanes.z;
        float right = czm_frustumPlanes.w;

        float near = czm_currentFrustum.x;
        float far = czm_currentFrustum.y;

        q.x = (q.x * (right - left) + left + right) * 0.5;
        q.y = (q.y * (top - bottom) + bottom + top) * 0.5;
        q.z = (q.z * (near - far) - near - far) * 0.5;
        q.w = 1.0;
    }

    return q;
}


























vec4 czm_windowToEyeCoordinates(vec4 fragmentCoordinate)
{
    vec2 screenCoordXY = (fragmentCoordinate.xy - czm_viewport.xy) / czm_viewport.zw;
    return czm_screenToEyeCoordinates(vec4(screenCoordXY, fragmentCoordinate.zw));
}

vec4 czm_screenToEyeCoordinates(vec2 screenCoordinateXY, float depthOrLogDepth)
{
    
#if defined(LOG_DEPTH) || defined(LOG_DEPTH_READ_ONLY)
    float near = czm_currentFrustum.x;
    float far = czm_currentFrustum.y;
    float log2Depth = depthOrLogDepth * czm_log2FarDepthFromNearPlusOne;
    float depthFromNear = pow(2.0, log2Depth) - 1.0;
    float depthFromCamera = depthFromNear + near;
    vec4 screenCoord = vec4(screenCoordinateXY, far * (1.0 - near / depthFromCamera) / (far - near), 1.0);
    vec4 eyeCoordinate = czm_screenToEyeCoordinates(screenCoord);
    eyeCoordinate.w = 1.0 / depthFromCamera; 
    return eyeCoordinate;
#else
    vec4 screenCoord = vec4(screenCoordinateXY, depthOrLogDepth, 1.0);
    vec4 eyeCoordinate = czm_screenToEyeCoordinates(screenCoord);
#endif
    return eyeCoordinate;
}





















vec4 czm_windowToEyeCoordinates(vec2 fragmentCoordinateXY, float depthOrLogDepth)
{
    vec2 screenCoordXY = (fragmentCoordinateXY.xy - czm_viewport.xy) / czm_viewport.zw;
    return czm_screenToEyeCoordinates(screenCoordXY, depthOrLogDepth);
}



#line 0

#line 0

uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;

void czm_shadow_receive_main()
{
  
    vec4 color = texture(colorTexture, v_textureCoordinates);

    czm_fragColor = vec4(color.rgb,1.0);

    
}
#line 0
uniform sampler2D shadowMap_texture; 
uniform mat4 shadowMap_matrix; 
uniform vec3 shadowMap_lightDirectionEC; 
uniform vec4 shadowMap_lightPositionEC; 
uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness; 
uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; 
#ifdef LOG_DEPTH 
in vec3 v_logPositionEC; 
#endif 
vec4 getPositionEC() 
{ 
#ifndef LOG_DEPTH 
    return czm_windowToEyeCoordinates(gl_FragCoord); 
#else 
    return vec4(v_logPositionEC, 1.0); 
#endif 
} 
vec3 getNormalEC() 
{ 
    return vec3(1.0); 
} 
void applyNormalOffset(inout vec4 positionEC, vec3 normalEC, float nDotL) 
{ 
} 
void main() 
{ 
    czm_shadow_receive_main(); 
    vec4 positionEC = getPositionEC(); 
    vec3 normalEC = getNormalEC(); 
    float depth = -positionEC.z; 
    czm_shadowParameters shadowParameters; 
    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy; 
    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z; 
    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w; 
    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; 
    float maxDepth = shadowMap_cascadeSplits[1].w; 
    
    if (depth > maxDepth) 
    { 
        return; 
    } 
    
    vec4 weights = czm_cascadeWeights(depth); 
    
    float nDotL = clamp(dot(normalEC, shadowMap_lightDirectionEC), 0.0, 1.0); 
    applyNormalOffset(positionEC, normalEC, nDotL); 
    
    vec4 shadowPosition = czm_cascadeMatrix(weights) * positionEC; 
    
    shadowParameters.texCoords = shadowPosition.xy; 
    shadowParameters.depth = shadowPosition.z; 
    shadowParameters.nDotL = nDotL; 
    float visibility = czm_shadowVisibility(shadowMap_texture, shadowParameters); 
    
    float shadowMapMaximumDistance = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.z; 
    float fade = max((depth - shadowMapMaximumDistance * 0.8) / (shadowMapMaximumDistance * 0.2), 0.0); 
    visibility = mix(visibility, 1.0, fade); 
    czm_fragColor.rgb *= visibility; 
} 

"
