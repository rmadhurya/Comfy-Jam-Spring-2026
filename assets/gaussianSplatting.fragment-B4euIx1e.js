import{t as e}from"./shaderStore-D-XQlhUT.js";import{E as t,M as n,N as r,ct as i,lt as a,st as o,x as s}from"./game-AowfuWZe.js";var c=`gaussianSplattingPixelShader`,l=`#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
varying vColor: vec4f;varying vPosition: vec2f;
#define CUSTOM_FRAGMENT_DEFINITIONS
#include<gaussianSplattingFragmentDeclaration>
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
var finalColor: vec4f=gaussianColor(input.vColor,input.vPosition);
#define CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR
fragmentOutputs.color=finalColor;
#define CUSTOM_FRAGMENT_MAIN_END
}
`;e.ShadersStoreWGSL[c]||(e.ShadersStoreWGSL[c]=l);var u=[r,t,s,a,i,o,n];for(let t of u)e.IncludesShadersStoreWGSL[t.name]||(e.IncludesShadersStoreWGSL[t.name]=t.shader);var d={name:c,shader:l};export{d as gaussianSplattingPixelShaderWGSL};