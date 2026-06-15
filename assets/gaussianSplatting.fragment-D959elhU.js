import{t as e}from"./shaderStore-D-XQlhUT.js";import{R as t,f as n,g as r,h as i,m as a,y as o,z as s}from"./game-AowfuWZe.js";var c=`gaussianSplattingPixelShader`,l=`#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
varying vec4 vColor;varying vec2 vPosition;
#define CUSTOM_FRAGMENT_DEFINITIONS
#include<gaussianSplattingFragmentDeclaration>
void main () {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec4 finalColor=gaussianColor(vColor);
#define CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR
gl_FragColor=finalColor;
#define CUSTOM_FRAGMENT_MAIN_END
}
`;e.ShadersStore[c]||(e.ShadersStore[c]=l);var u=[s,o,r,i,a,n,t];for(let t of u)e.IncludesShadersStore[t.name]||(e.IncludesShadersStore[t.name]=t.shader);var d={name:c,shader:l};export{d as gaussianSplattingPixelShader};