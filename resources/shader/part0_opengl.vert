// name: ³¯Â@³Ç
// student ID: 100598061

varying vec3 textureCoords;

void main()
{
	//gl_FrontColor = gl_Color;
	//gl_BackColor = gl_Color;
	
	textureCoords = gl_Vertex.xyz;
    
	gl_Position = ftransform(); // following the same steps as the fixed functionality does
} 
