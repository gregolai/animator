class Margin {
	top;
	right;
	bottom;
	left;
}

class Transform {
	matrix;

	getTranslate() {
		// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web#Translation_matrix
		return { x: this.matrix[12], y: this.matrix[13], z: this.matrix[14] };
	}

	getScale() {
		// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web#Scale_matrix
		return { x: this.matrix[0], y: this.matrix[5], z: this.matrix[10] };
	}

	getRotation() {
		// TODO
		/*
    x = atan2(-M[1][2], M[2][2])
    y = atan2(M[0][2], cosY)
    
    sinZ = cosX * M[1][0] + sinX * M[2][0]
    cosZ = coxX * M[1][1] + sinX * M[2][1]
    z = atan2(sinZ, cosZ)
    
    
    void columnMatrixToAngles( Angles& angles, float colMatrix[4][4] )
    {
        double sinPitch, cosPitch, sinRoll, cosRoll, sinYaw, cosYaw;
    
      sinPitch = -colMatrix[2][0];
      cosPitch = sqrt(1 - sinPitch*sinPitch);
    
      if ( abs(cosPitch) > EPSILON ) 
      {
          sinRoll = colMatrix[2][1] / cosPitch;
          cosRoll = colMatrix[2][2] / cosPitch;
          sinYaw = colMatrix[1][0] / cosPitch;
          cosYaw = colMatrix[0][0] / cosPitch;
        } 
        else 
        {
          sinRoll = -colMatrix[1][2];
          cosRoll = colMatrix[1][1];
          sinYaw = 0;
          cosYaw = 1;
        }
    
      angles.yaw   = atan2(sinYaw, cosYaw) * 180 / PI;
      angles.pitch = atan2(sinPitch, cosPitch) * 180 / PI;
      angles.roll  = atan2(sinRoll, cosRoll) * 180 / PI;
    } 
    */
		return { z: 0 };
	}
}

const a = [
	{
		name: 'margin',
		longhands: [
			{
				name: 'margin-top'
			}
		]
	},
	{
		name: 'filter',
		composed: []
	},
	{
		name: 'transform',
		composed: [
			{
				name: 'translate | translateX | translateY | translateZ | translate3d'
			},
			{
				name: 'scale | scaleX | scaleY | scaleZ | scale3d'
			},
			{
				name: 'rotate | rotateX | rotateY | rotateZ | rotate3d'
			},
			{
				name: 'skew | skewX | skewY'
			},
			{
				name: 'matrix | matrix3d'
			},
			{
				name: 'perspective'
			}
		]
	}
];

/*
https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties
ALL ANIMATABLE PROPS:

-moz-outline-radius
-moz-outline-radius-bottomleft
-moz-outline-radius-bottomright
-moz-outline-radius-topleft
-moz-outline-radius-topright
-webkit-text-fill-color
-webkit-text-stroke
-webkit-text-stroke-color
all
backdrop-filter
background
background-color
background-position
background-size
border
border-bottom
border-bottom-color
border-bottom-left-radius
border-bottom-right-radius
border-bottom-width
border-color
border-end-end-radius
border-end-start-radius
border-left
border-left-color
border-left-width
border-radius
border-right
border-right-color
border-right-width
border-start-end-radius
border-start-start-radius
border-top
border-top-color
border-top-left-radius
border-top-right-radius
border-top-width
border-width
bottom
box-shadow
caret-color
clip
clip-path
color
column-count
column-gap
column-rule
column-rule-color
column-rule-width
column-width
columns
filter
flex
flex-basis
flex-grow
flex-shrink
font
font-size
font-size-adjust
font-stretch
font-variation-settings
font-weight
gap
grid-column-gap
grid-gap
grid-row-gap
grid-template-columns
grid-template-rows
height
inset
inset-block
inset-block-end
inset-block-start
inset-inline
inset-inline-end
inset-inline-start
left
letter-spacing
line-clamp
line-height
margin
margin-bottom
margin-left
margin-right
margin-top
mask
mask-border
mask-position
mask-size
max-height
max-lines
max-width
min-height
min-width
object-position
offset
offset-anchor
offset-distance
offset-path
offset-position
offset-rotate
opacity
order
outline
outline-color
outline-offset
outline-width
padding
padding-bottom
padding-left
padding-right
padding-top
perspective
perspective-origin
right
rotate
row-gap
scale
scroll-margin
scroll-margin-block
scroll-margin-block-end
scroll-margin-block-start
scroll-margin-bottom
scroll-margin-inline
scroll-margin-inline-end
scroll-margin-inline-start
scroll-margin-left
scroll-margin-right
scroll-margin-top
scroll-padding
scroll-padding-block
scroll-padding-block-end
scroll-padding-block-start
scroll-padding-bottom
scroll-padding-inline
scroll-padding-inline-end
scroll-padding-inline-start
scroll-padding-left
scroll-padding-right
scroll-padding-top
scroll-snap-coordinate
scroll-snap-destination
scrollbar-color
shape-image-threshold
shape-margin
shape-outside
tab-size
text-decoration
text-decoration-color
text-emphasis
text-emphasis-color
text-indent
text-shadow
top
transform
transform-origin
translate
vertical-align
visibility
width
word-spacing
z-index
zoom
*/
