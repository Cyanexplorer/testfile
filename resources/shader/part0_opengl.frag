// name: ³¯Â@³Ç
// student ID: 100598061

varying vec3      textureCoords;

uniform sampler3D data;
uniform sampler3D sizeData;
uniform sampler1D transerfunction;
uniform vec3      viewVec;
uniform vec3      scaleDim;
uniform int       sizeEnable;

#define EPSILON (0.01)

vec4 getColor(vec3 texPosition){
	vec4 scalar    = texture3D(data           , texPosition.xyz);
	vec4 size      = texture3D(sizeData       , texPosition.xyz);
	vec4 tempColor = texture1D(transerfunction, size.s);
	vec4 tempAlpha = texture1D(transerfunction, scalar.s);
	if(sizeEnable == 1)
	{
		tempColor.rgb  = tempColor.rgb * tempAlpha.a;
		tempColor.a = tempAlpha.a;
		return tempColor;
	}
	else
	{
		tempAlpha.rgb = vec3(1.0, scalar.s/255.0, scalar.s/255.0);
		tempAlpha.rgb  = tempAlpha.rgb * tempAlpha.a;
		return tempAlpha;
	}
}

vec2 getLight(vec3 normal, vec3 lightDir, vec3 rayDir)
{
	float light_ambient   =  0.1;
	float light_diffuse   =  0.9;
	float light_specular  =  0.9;
	float light_shininess = 10.0;
	
	float ambient   =  0.0;
	float diffuse   =  0.0;
	float specular  =  0.0;
	
	ambient = light_ambient;
	
	float DotLN = dot(lightDir, normal);
	if(DotLN > 0.0){
		diffuse = light_diffuse * DotLN;
	}
	
	vec3 H = normalize(-rayDir + lightDir);
	float DotHV = max(dot(H, normal), dot(H, -normal));
	
	if(DotHV > 0.0){
		specular = light_specular * pow(DotHV, light_shininess);
	}
		
	return vec2(ambient + diffuse, specular);
}

vec3 getNormal(vec3 texPosition)
{
	vec3 gradient;
	gradient.x = texture3D(data, texPosition.xyz + vec3( EPSILON,       0, 0)).r
				-texture3D(data, texPosition.xyz + vec3(-EPSILON,       0, 0)).r;
	gradient.y = texture3D(data, texPosition.xyz + vec3(       0, EPSILON, 0)).r
				-texture3D(data, texPosition.xyz + vec3(       0,-EPSILON, 0)).r;
	gradient.z = texture3D(data, texPosition.xyz + vec3(       0,       0, EPSILON)).r
				-texture3D(data, texPosition.xyz + vec3(       0,       0,-EPSILON)).r;
	
	if(length(gradient) > 0.0)
		gradient = normalize(gradient);
	return gradient;
}

void main()
{	
	float sampleSpacing    = 0.005;
	vec4  accumulatedColor = vec4(0.0);
	vec3  samplePos        = vec3(0.0);
	vec3  rayStart         = textureCoords;
	vec3  tex              = textureCoords;
	vec3  view             = viewVec;
	
	tex  *= scaleDim;
	view  = tex - view;
	view /= scaleDim;
	view  = normalize(view);
	
	float sampleLen   = sampleSpacing;
	vec4  sampleColor = vec4(0.0);
	
	while(true){
		samplePos   = rayStart + sampleLen*view;
		sampleLen  += sampleSpacing;
		sampleColor = getColor(samplePos);
		
		if(sampleColor.a > 0.001){
			vec3 Normal = getNormal(samplePos);
			vec3 lightDir = normalize(vec3(-viewVec));
			vec2 oneLight = getLight(Normal, lightDir, viewVec);
			
			float ambient_diffuse = oneLight.r;
			float specular = oneLight.g;
			
			sampleColor.rgb = sampleColor.rgb*ambient_diffuse + sampleColor.a*specular;

			accumulatedColor.rgb = (1.0 - accumulatedColor.a)*sampleColor.rgb + accumulatedColor.rgb;
			accumulatedColor.a   = (1.0 - accumulatedColor.a)*sampleColor.a   + accumulatedColor.a;
		}
		
		if(samplePos.x > 1.0 || samplePos.y > 1.0 || samplePos.z > 1.0 || 
		   samplePos.x < 0.0 || samplePos.y < 0.0 || samplePos.z < 0.0 || accumulatedColor.a > 1.0){
			break;
		}
	}
	
	gl_FragColor = accumulatedColor;
} 
