function WebGL(){
	this.TEXTURE_FILTER_NEAREST = 				9728;
	this.TEXTURE_FILTER_LINEAR = 				9729;
	this.TEXTURE_FILTER_LINEAR_MIPMAP_NEAREST = 9985;	
	this.canvas = 								null;
	this.webgl = 								null;
	this.shaderProgram = 						null;
	this.objectBuffer = 						[];
	this.textureFilter = 						null;
	this.imageBuffer = 							[];
	this.camera = {
		position: 								{x:0, y:0, z:0},
		rotation: 								{x:0, y:0, z:0},
		lock_x_roration: 						false
	}
	this.lights = {
		active:									false,
		ambiant: {
			active: 							false,
			red: 								1.0,
			green: 								1.0,
			blue: 								1.0
		},
		points: 								[],
	}
	this.alphabending = 						false;
	this.fps = 									null;

	// Constructeur
	this.Construct = 							function(id_canvas, fps){
		if(this.InitCanvas(id_canvas)){				// Canvas
			if(this.InitWebGL()){					// WebGL
				if(this.InitShaders()){				// Shaders
					this.textureFilter = this.webgl.LINEAR_MIPMAP_NEAREST;
					this.InitFPS(fps);				// FPS
				} else {
					this.ThrowError(3, 'Construct', 'Could not initialise WebGL Shaders');
				}
			} else {
				this.ThrowError(2, 'Construct', 'Could not initialise WebGL');
			}
		} else {
			this.ThrowError(1, 'Construct', 'Could not initialise Canvas');
		}
	}
	
	// Composants
	this.InitCanvas = 							function(id_canvas){
		var ret = false;
		if(document.getElementById(id_canvas)){
			this.canvas = document.getElementById(id_canvas);
			ret = true;
		}
		return ret;
	}
	this.InitWebGL = 							function(){
		var ret = false;
		if(this.canvas!=null){
			try {
				try{
					this.webgl = this.canvas.getContext("experimental-webgl");							// Charge le contexte
				} catch(e){
					this.ThrowError(21, 'InitWebGL', 'WebGL not supported: '+e.toString());
					this.webgl = null;
				}
				if(this.webgl!=null){
					if(typeof this.webgl.NEAREST!='undefined'){
						this.webgl.clearColor(0.0, 0.0, 0.0, 0.0);  									// Fond gris
						this.webgl.clearDepth(1.0);                 									// Tout effacer
						this.webgl.depthFunc(this.webgl.LEQUAL);										// Comportement du Z-buffer (Memoire tampon de profondeur)
						this.webgl.enable(this.webgl.DEPTH_TEST);       								// Activer le test de profondeur de champs
						this.webgl.clear(this.webgl.COLOR_BUFFER_BIT|this.webgl.DEPTH_BUFFER_BIT); 		// Supprimer la couleur ainsi que le tampon de profondeur.
						ret = true;
					} else {
						this.ThrowError(21, 'InitWebGL', 'WebGL not supported');
						this.webgl = null;
					}
				}
			} catch(e){ 
				this.ThrowError(20, 'InitWebGL', e.toString());
				this.webgl = null;
			}
		}
		return ret;
	}
	this.InitShaders = 							function() {
		var ret = false;
		try{

			// Teste la génération des Shaders
			var fragmentShader = this.getShader("shader-fs");
			var vertexShader = this.getShader("shader-vs");
		
			if(fragmentShader!=false && vertexShader!=false){
				// Crée une routine shader
				this.shaderProgram = this.webgl.createProgram();
				this.webgl.attachShader(this.shaderProgram, vertexShader);		// Shader de vecteur
				this.webgl.attachShader(this.shaderProgram, fragmentShader);	// Shader de point
				this.webgl.linkProgram(this.shaderProgram);						// Binde la routine dans WebGL

				// Verifie la bonne injection de la routine
				if (this.webgl.getProgramParameter(this.shaderProgram, this.webgl.LINK_STATUS)){
					// Active la routine valide
					this.webgl.useProgram(this.shaderProgram);
					
					// Routine de position
					this.shaderProgram.vertexPositionAttribute = 	this.webgl.getAttribLocation(this.shaderProgram, "aVertexPosition");	
					this.webgl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
					
					// Routine de normales (lumière)
					this.shaderProgram.vertexNormalAttribute = 		this.webgl.getAttribLocation(this.shaderProgram, "aVertexNormal");
					this.webgl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);					
					
					// Routine de texture
					this.shaderProgram.textureCoordAttribute = this.webgl.getAttribLocation(this.shaderProgram, "aTextureCoord");
					this.webgl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);	
					
					// Binde les parametres WebGL dans le shader program pour les rendre accessibles
					this.shaderProgram.pMatrixUniform =  				this.webgl.getUniformLocation(this.shaderProgram, "uPMatrix");
					this.shaderProgram.mvMatrixUniform = 				this.webgl.getUniformLocation(this.shaderProgram, "uMVMatrix");
					this.shaderProgram.nMatrixUniform =  				this.webgl.getUniformLocation(this.shaderProgram, "uNMatrix");
					this.shaderProgram.samplerUniform = 				this.webgl.getUniformLocation(this.shaderProgram, "uSampler");
					this.shaderProgram.useLightingUniform = 			this.webgl.getUniformLocation(this.shaderProgram, "uUseLighting");
					this.shaderProgram.ambientColorUniform =			this.webgl.getUniformLocation(this.shaderProgram, "uAmbientColor");
					this.shaderProgram.pointLightingLocationUniform1 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation1");
					this.shaderProgram.pointLightingLocationUniform2 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation2");
					this.shaderProgram.pointLightingLocationUniform3 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation3");
					this.shaderProgram.pointLightingLocationUniform4 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation4");
					this.shaderProgram.pointLightingLocationUniform5 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation5");
					this.shaderProgram.pointLightingLocationUniform6 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation6");
					this.shaderProgram.pointLightingLocationUniform7 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation7");
					this.shaderProgram.pointLightingLocationUniform8 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation8");
					this.shaderProgram.pointLightingLocationUniform9 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation9");
					this.shaderProgram.pointLightingLocationUniform10 = this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation10");
					this.shaderProgram.pointLightingLocationUniform11 = this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation11");
					this.shaderProgram.pointLightingLocationUniform12 = this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation12");
					this.shaderProgram.pointLightingLocationUniform13 = this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation13");
					this.shaderProgram.pointLightingLocationUniform14 = this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation14");
					this.shaderProgram.pointLightingLocationUniform15 = this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation15");
					this.shaderProgram.pointLightingLocationUniform16 = this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingLocation16");
					this.shaderProgram.pointLightingColorUniform1 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor1");					
					this.shaderProgram.pointLightingColorUniform2 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor2");					
					this.shaderProgram.pointLightingColorUniform3 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor3");					
					this.shaderProgram.pointLightingColorUniform4 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor4");					
					this.shaderProgram.pointLightingColorUniform5 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor5");					
					this.shaderProgram.pointLightingColorUniform6 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor6");					
					this.shaderProgram.pointLightingColorUniform7 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor7");					
					this.shaderProgram.pointLightingColorUniform8 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor8");					
					this.shaderProgram.pointLightingColorUniform9 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor9");					
					this.shaderProgram.pointLightingColorUniform10 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor10");					
					this.shaderProgram.pointLightingColorUniform11 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor11");					
					this.shaderProgram.pointLightingColorUniform12 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor12");					
					this.shaderProgram.pointLightingColorUniform13 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor13");					
					this.shaderProgram.pointLightingColorUniform14 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor14");					
					this.shaderProgram.pointLightingColorUniform15 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor15");					
					this.shaderProgram.pointLightingColorUniform16 = 	this.webgl.getUniformLocation(this.shaderProgram, "uPointLightingColor16");					
					this.shaderProgram.alphaUniform = 					this.webgl.getUniformLocation(this.shaderProgram, "uAlpha");
					ret = true;
				}
			} else {
				this.ThrowError(31, 'InitShaders', 'Cannot load fragmentShader/vertexShader');
			}
		} catch(e){ 
			this.ThrowError(30, 'InitShaders', e.toString());
		}
		return ret;
	}	
	this.getShader = 							function(type){
		var source = '';
		var shader = null;
		var ret = false;
		// Si webGL est bien chargé
		if(this.webgl!=null){
			try{
				// Prepare le code et le typage du shader
				switch(type){
					case 'shader-fs': // Fragment Shader
						source+= '#ifdef GL_ES\r\n';
						source+= 'precision highp float;\r\n';
						source+= '#endif\r\n';
						source+= 'varying vec2 vTextureCoord;\r\n';
						source+= 'varying vec3 vLightWeighting;\r\n';
						source+= 'uniform float uAlpha;\r\n';
						source+= 'uniform sampler2D uSampler;\r\n';
						source+= 'void main(void) {\r\n';
						source+= '	vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\r\n';
						source+= '	gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a * uAlpha);\r\n';
						source+= '}\r\n';	
						shader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER);
					break;
					case 'shader-vs': // Vector Shader
						source+= 'attribute vec3 aVertexPosition;\r\n';
						source+= 'attribute vec3 aVertexNormal;\r\n';
						source+= 'attribute vec2 aTextureCoord;\r\n';
						source+= 'uniform 	mat4 uMVMatrix;\r\n';
						source+= 'uniform 	mat4 uPMatrix;\r\n';
						source+= 'uniform 	mat3 uNMatrix;\r\n';
						source+= 'uniform 	vec3 uAmbientColor;\r\n';
						
						// Prepare 16 emplacement d'applicatino de lumière par vertex
						source+= 'uniform 	vec3 uPointLightingLocation1;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation2;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation3;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation4;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation5;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation6;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation7;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation8;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation9;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation10;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation11;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation12;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation13;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation14;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation15;\r\n';
						source+= 'uniform 	vec3 uPointLightingLocation16;\r\n';
						source+= 'uniform 	vec3 uPointLightingColor1;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor2;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor3;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor4;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor5;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor6;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor7;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor8;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor9;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor10;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor11;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor12;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor13;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor14;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor15;\r\n';						
						source+= 'uniform 	vec3 uPointLightingColor16;\r\n';						
						
						source+= 'uniform 	bool uUseLighting;\r\n';
						source+= 'varying 	vec2 vTextureCoord;\r\n';
						source+= 'varying 	vec3 vLightWeighting;\r\n';
						source+= 'void main(void) {\r\n';
						source+= '	vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);\r\n';
						source+= '	gl_Position = uPMatrix * mvPosition;\r\n';
						source+= '	vTextureCoord = aTextureCoord;\r\n';
						source+= '	if(!uUseLighting){\r\n';
						source+= '		vLightWeighting = vec3(1.0, 1.0, 1.0);\r\n';
						source+= '	} else {\r\n';
						source+= '		vec3 transformedNormal = uNMatrix * aVertexNormal;\r\n';
						source+= '		vLightWeighting = uAmbientColor;\r\n';
						
						// Applicatino de 16 lumières pontuelles sur la texture de la vertex
						source+= '		float directionalLightWeighting1 = max(dot(transformedNormal, normalize(uPointLightingLocation1 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting2 = max(dot(transformedNormal, normalize(uPointLightingLocation2 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting3 = max(dot(transformedNormal, normalize(uPointLightingLocation3 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting4 = max(dot(transformedNormal, normalize(uPointLightingLocation4 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting5 = max(dot(transformedNormal, normalize(uPointLightingLocation5 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting6 = max(dot(transformedNormal, normalize(uPointLightingLocation6 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting7 = max(dot(transformedNormal, normalize(uPointLightingLocation7 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting8 = max(dot(transformedNormal, normalize(uPointLightingLocation8 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting9 = max(dot(transformedNormal, normalize(uPointLightingLocation9 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting10 = max(dot(transformedNormal, normalize(uPointLightingLocation10 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting11 = max(dot(transformedNormal, normalize(uPointLightingLocation11 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting12 = max(dot(transformedNormal, normalize(uPointLightingLocation12 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting13 = max(dot(transformedNormal, normalize(uPointLightingLocation13 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting14 = max(dot(transformedNormal, normalize(uPointLightingLocation14 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting15 = max(dot(transformedNormal, normalize(uPointLightingLocation15 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		float directionalLightWeighting16 = max(dot(transformedNormal, normalize(uPointLightingLocation16 - mvPosition.xyz)), 0.0);\r\n';
						source+= '		vLightWeighting += uPointLightingColor1 * directionalLightWeighting1; \r\n';
						source+= '		vLightWeighting += uPointLightingColor2 * directionalLightWeighting2; \r\n';
						source+= '		vLightWeighting += uPointLightingColor3 * directionalLightWeighting3; \r\n';
						source+= '		vLightWeighting += uPointLightingColor4 * directionalLightWeighting4; \r\n';
						source+= '		vLightWeighting += uPointLightingColor5 * directionalLightWeighting5; \r\n';
						source+= '		vLightWeighting += uPointLightingColor6 * directionalLightWeighting6; \r\n';
						source+= '		vLightWeighting += uPointLightingColor7 * directionalLightWeighting7; \r\n';
						source+= '		vLightWeighting += uPointLightingColor8 * directionalLightWeighting8; \r\n';
						source+= '		vLightWeighting += uPointLightingColor9 * directionalLightWeighting9; \r\n';
						source+= '		vLightWeighting += uPointLightingColor10 * directionalLightWeighting10; \r\n';
						source+= '		vLightWeighting += uPointLightingColor11 * directionalLightWeighting11; \r\n';
						source+= '		vLightWeighting += uPointLightingColor12 * directionalLightWeighting12; \r\n';
						source+= '		vLightWeighting += uPointLightingColor13 * directionalLightWeighting13; \r\n';
						source+= '		vLightWeighting += uPointLightingColor14 * directionalLightWeighting14; \r\n';
						source+= '		vLightWeighting += uPointLightingColor15 * directionalLightWeighting15; \r\n';
						source+= '		vLightWeighting += uPointLightingColor16 * directionalLightWeighting16; \r\n';
						source+= '	}\r\n';
						source+= '}\r\n';				
						shader = this.webgl.createShader(this.webgl.VERTEX_SHADER);
					break;
				}
				// Génération et compilation du shader avant injection
				if(shader!=null){
					// Injecte le code source
					this.webgl.shaderSource(shader, source);
					// Compile la source
					this.webgl.compileShader(shader);
					// Verifie la compilation
					if(this.webgl.getShaderParameter(shader, this.webgl.COMPILE_STATUS)){
						ret = shader;
					} else {
						this.ThrowError(311, 'getShader', 'Source shaders compilation failed (' + this.webgl.getShaderInfoLog(shader) + ')');
					}
				}
			} catch(e){
				this.ThrowError(310, 'getShader', e.toString());
			}
		} else {
			this.ThrowError(310, 'getShader', 'WebGL not initialised');
		}
		return ret;
	}	
	
	// Textures
	this.InitTextureFilter = 					function(gl_filter){
		if(this.webgl!=null){
			if(	gl_filter==this.webgl.NEAREST ||
				gl_filter==this.webgl.LINEAR ||
				gl_filter==this.webgl.LINEAR_MIPMAP_NEAREST){
				this.textureFilter = gl_filter;
			}
		}
	}
	
	// Images
	this.getImage = 							function(path){
		if(!this.ExistImage(path)){ this.LoadImage(path); }
		return this.imageBuffer[path];
	}
    this.LoadImage = 							function(path){
		this.imageBuffer[path] = new Image();
		this.imageBuffer[path].loaded = false;
		this.imageBuffer[path].onload = function(){ this.loaded = true; }
		this.imageBuffer[path].src = path;
    }
	this.ExistImage = 							function(path){
		return !(typeof this.imageBuffer[path]=='undefined');
	}
	this.AllLoadedImages = 						function(){
		var buffer = null;
		var all_loaded = true;
		for(buffer in this.imageBuffer){
			if(!this.imageBuffer[buffer].loaded){
				all_loaded = false;
				break;
			}
		}
		return all_loaded;
	}

	// Controleur de FPS
	this.InitFPS = 								function(fps){
		this.fps = new FPS(fps);
	}
	this.FPS_change = 							function(fps){
		if(this.fps!=null){
			this.fps.setFPS(fps);
		}
	}
	this.FPS_Loop = 							function(str_function){
		if(this.fps!=null){
			this.fps.FPS_Loop(str_function);
		}
	}
	this.ForcedFPS = 							function(){
		var ret = false;
		if(this.fps!=null){
			ret = this.fps.ForcedFPS();
		}
		return ret;
	}
	this.FPS = 									function(){
		var ret = false;
		if(this.fps!=null){
			ret = this.fps.FPS();
		}
		return ret;
	}
	
	// Lumière
	this.setAmbiantLighting = 					function(red, green, blue){
		this.lights.active = true;
		this.lights.ambiant = {active: true, red: red, green: green, blue: blue};
	}
	this.setPointLighting = 					function(name, position_x, position_y, position_z, red, blue, green){
		this.lights.active = true;
		this.lights.points[name] = {
			position: {
				x:position_x,
				y:position_y,
				z:position_z
			},
			color:{
				red:red,
				green:green,
				blue:blue
			}
		}
	}
	
	// Alphabending
	this.setAlphaBending = 						function(state){
		this.alphabending = state;
	}

	// Fond de scene
	this.setBackgroundScene = 					function(path){
		this.canvas.style.backgroundImage = 'url('+path+')';
		this.canvas.style.backgroundPosition = '0px 0px';
		this.canvas.style.backgorundRepeat = 'auto';
	}
	this.RedrawBackgroundScene = 				function(){
		this.canvas.style.backgroundPosition = 	(-this.camera.rotation.y*this.canvas.width)+'px '+(-this.camera.rotation.x*this.canvas.height)+'px';
		
		// Prochainement implementé sous CSS3
		// this.canvas.style.backgroundRotate = 	(-this.camera.rotation.y/Math.PI*180) + 'deg';
		
	}
	
	// Objets 3D
	this.AddVerticeObject = 					function(name, position, vertice_position, image_path, vertice_texture, vertices_normal, vertices_index, alpha){
		var ret = false;
		if(this.webgl!=null){
			vertices_index = 	(typeof vertices_index!='undefined'?vertices_index:false);
			alpha = 			(typeof alpha!='undefined'?alpha:false);
			
			try {
				var currentIndexBuffer = 		this.objectBuffer.length;
				var texture_vertices_buffer = 	this.ConvertWebGlBufferArray(vertice_texture);
				var vertices_buffer = 			this.ConvertWebGlBufferArray(vertice_position);
				var vertices_normal_buffer = 	this.ConvertWebGlBufferArray(vertices_normal);
				var texture = 					this.webgl.createTexture();
				var alphabending = 				(typeof alpha!=false?alpha:false); 
				var image = 					this.getImage(image_path);

				// Savoir si on trace toutes les facettes comme adjacentes, ou selon les index fournis en parametres
				var vertices_index = 			((vertices_index!=false)?this.ConvertWebGlBufferElement(vertices_index):false); 
				
				// Génération de la texture
				this.webgl.pixelStorei(this.webgl.UNPACK_FLIP_Y_WEBGL, true);
				this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
				this.webgl.texImage2D(this.webgl.TEXTURE_2D, 0, this.webgl.RGBA, this.webgl.RGBA, this.webgl.UNSIGNED_BYTE, image);
				
				// Filtre de texrtue
				switch(this.textureFilter){
					case this.webgl.NEAREST:
						this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.NEAREST);
						this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.NEAREST);
					break;
					case this.webgl.LINEAR:
						this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.LINEAR);
						this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR);			
					break;
					case this.webgl.LINEAR_MIPMAP_NEAREST:
						this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.LINEAR);
						this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR_MIPMAP_NEAREST);
						this.webgl.generateMipmap(this.webgl.TEXTURE_2D);
					break;
					default:
						this.ThrowError(42, 'AddVerticeObject', 'Unknown texture filter');
					break;
				}	
				
				// Verifie que le chargement s'est bien passé
				if(vertices_buffer!=null && texture_vertices_buffer!=null){
					this.objectBuffer[currentIndexBuffer] = {
						name:					name,
						position:				position,
						rotation:				{x:0, y:0, z:0},
						bak_vertice_position:	vertice_position,
						vertices_position: 		vertices_buffer,
						vertices_index: 		vertices_index,
						texture:				texture,
						vertice_texture: 		texture_vertices_buffer,
						bak_vertices_normal:	vertices_normal,
						vertice_normal:			vertices_normal_buffer,
						alphabending:			alphabending
					}
					ret = true;
				} else {
					this.ThrowError(43, 'AddVerticeObject', 'Creating 3D object fail');
				}
			} catch(e){
				this.ThrowError(40, 'AddVerticeObject', 'Error while 3D object loading : '+e.toString());
			}
		}
		return ret;
	}
	this.ConvertWebGlBufferArray = 				function(data_array){
		var buffer = false;
		if(this.webgl!=null){
			// Converti l'objet (tableau de vecteur) dans le format webgl
			var itemsize = data_array[0].length;
			var numitems = data_array.length;
			var data = [];
			
			var i = 0;
			var j = 0;
			var index = 0;
			try{
				for(i=0; i<numitems; i++){
					for(j=0; j<itemsize; j++){
						data[index] = data_array[i][j];
						index++;
					}
				}	
				buffer = this.webgl.createBuffer();
				this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, buffer);
				this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array(data), this.webgl.STATIC_DRAW);
				buffer.itemSize = itemsize;
				buffer.numItems = numitems;	
			} catch(e){
				this.ThrowError(40, 'ConvertWebGlBufferArray', e.toString());
				buffer = false;
			}
		}
		return buffer;
	}
	this.ConvertWebGlBufferElement = 			function(data_array){
		var buffer = false;
		// Converti l'objet (tableau de vecteur) dans le format webgl
		if(this.webgl!=null){
			try{
				var itemsize = data_array[0].length;
				var numitems = data_array.length;
				var data = [];
				var i = 0;
				var j = 0;
				var index = 0;		
				for(i=0; i<numitems; i++){
					for(j=0; j<itemsize; j++){
						data[index] = data_array[i][j];
						index++;
					}
				}	
				buffer = this.webgl.createBuffer();
				this.webgl.bindBuffer(this.webgl.ELEMENT_ARRAY_BUFFER, buffer);
				this.webgl.bufferData(this.webgl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.webgl.STATIC_DRAW);
				buffer.itemSize = itemsize;
				buffer.numItems = numitems;	
			} catch(e){
				this.ThrowError(40, 'ConvertWebGlBufferElement', e.toString());
				buffer = false;
			}
			
		}
		return buffer;
	}
	this.GetObjectIndex = 						function(name){
		var i = 0;
		var len = this.objectBuffer.length;
		var found = false;
		var ret = false;
		while(!found && i<len){
			if(this.objectBuffer[i].name==name){
				found = true;
			} else {
				i++;
			}
		}
		if(found){ ret = i; }
		return ret;
	}
	this.GetObject = 							function(name){
		var index = this.GetObjectIndex(name);
		var ret = null;
		if(index!=false){
			ret = this.objectBuffer[index];
		}
		return ret;
	}
	
	// Object 3D rapides
	this.AddSphereTextured = 					function(name, x, y, z, size, texture, alphabending, precision){
		size = size/2;
		precision = (typeof precision=='undefined'?10:precision);
		
		var step_x = precision;
		var step_y = precision;
		var freq_x = 1/(step_x*2);
		var freq_y = 1/step_y;
		
		// Assemblage
		var vertices_position = [];
		var vertice_texture = [];
		var vertices_normal = [];
		var vertices_index = [];	
		var angle = 0;
		var index = 0;
		var py = 0;
		var py2 = 0;
		var counter_x = 0;
		var counter_y = 0;
		var i = 0;
		var radius = 0;
		var radius2 = 0;
		var tex_x = 0;
		var tex_x2 = 0;
		var tex_y = 0;
		var tex_y2 = 0;
		
		// Corps
		for(i=0; i<step_y; i++){
			counter_x = 0;
			py = y-Math.cos((i/step_y)*Math.PI)*size;
			py2 = y-Math.cos(((i+1)/step_y)*Math.PI)*size;
			radius = Math.sin(((i)/step_y)*Math.PI)*size;
			radius2 = Math.sin(((i+1)/step_y)*Math.PI)*size;
			tex_y = i/step_y;
			tex_y2 = tex_y+freq_y;
			for(angle=Math.PI*2; angle>0; angle-=Math.PI/step_x){
			
				tex_x = 1-(angle/Math.PI/2);
				tex_x2 = tex_x+freq_x;
				
				vertices_position[vertices_position.length] = [	x+radius*Math.cos(angle),					py,		z+radius*Math.sin(angle) 					];
				vertices_position[vertices_position.length] = [	x+radius*Math.cos(angle+Math.PI/step_x),	py,		z+radius*Math.sin(angle+Math.PI/step_x)		];
				vertices_position[vertices_position.length] = [	x+radius2*Math.cos(angle),					py2,	z+radius2*Math.sin(angle)					];
				vertices_position[vertices_position.length] = [	x+radius2*Math.cos(angle+Math.PI/step_x),	py2,	z+radius2*Math.sin(angle+Math.PI/step_x)	];
				
				vertice_texture[vertice_texture.length] = [tex_x2, tex_y];
				vertice_texture[vertice_texture.length] = [tex_x, tex_y];
				vertice_texture[vertice_texture.length] = [tex_x2, tex_y2];
				vertice_texture[vertice_texture.length] = [tex_x, tex_y2];
				
				vertices_normal[vertices_normal.length] = [ Math.cos(angle),  				0.0, Math.sin(angle)				];
				vertices_normal[vertices_normal.length] = [ Math.cos(angle+Math.PI/step_x), 0.0, Math.sin(angle+Math.PI/step_x)	];
				vertices_normal[vertices_normal.length] = [ Math.cos(angle),  				0.0, Math.sin(angle)				];
				vertices_normal[vertices_normal.length] = [ Math.cos(angle+Math.PI/step_x), 0.0, Math.sin(angle+Math.PI/step_x)	];
				
				vertices_index[vertices_index.length] = [index];
				vertices_index[vertices_index.length] = [index+1];
				vertices_index[vertices_index.length] = [index+2];
				vertices_index[vertices_index.length] = [index+1];
				vertices_index[vertices_index.length] = [index+2];
				vertices_index[vertices_index.length] = [index+3];
				index+=4;
				
				counter_x++;
			}
			counter_y++;			
		}
	
		this.AddVerticeObject(
			name,					// Nom de l'objet
			{x:x, y:y, z:z},	 	// Point de reference de l'objet
			vertices_position, 		// Facettes de l'objet (facettes triangulaires)
			texture,				// Chemin d'accès de la texture
			vertice_texture,		// Position de texture : (0, 0) en bas à gauche, (1, 1) en haut à droite		
			vertices_normal,		// Vecteur normaux aux facettes (pour les calculs de lumières)
			vertices_index,			// Index de facette (pour un tracé des facette non adjacentes => on indique l'index des point par groupe de 3 pour determiner les facettes)
			alphabending
		);	
	
	}
	this.AddCylinderTextured = 					function(name, x, y, z, size, texture, alphabending){
		size = size/2;
		
		// Assemblage
		var vertices_position = [];
		var vertice_texture = [];
		var vertices_normal = [];
		var vertices_index = [];
		var angle = 0;
		var index = 0;
		var py = 0;
		var counter_x = 0;
		var counter_y = 0;
		
		// Couronne basse
		for(angle=0; angle<Math.PI*2; angle+=Math.PI/10){
			vertices_position[vertices_position.length] = [	x,									y-size,		z									];
			vertices_position[vertices_position.length] = [	x+size*Math.cos(angle+Math.PI/10),	y-size,		z+size*Math.sin(angle+Math.PI/10)	];
			vertices_position[vertices_position.length] = [	x+size*Math.cos(angle),				y-size,		z+size*Math.sin(angle)				];
		
			vertice_texture[vertice_texture.length] = [0.155, 									0.537											];
			vertice_texture[vertice_texture.length] = [0.155+Math.sin(angle+Math.PI/10)*0.155, 	0.537+Math.cos(angle+Math.PI/10)*0.155			];		
			vertice_texture[vertice_texture.length] = [0.155+Math.sin(angle)*0.155, 			0.537+Math.cos(angle)*0.155						];
		
			vertices_normal[vertices_normal.length] = [ 0.0,  -1.0, 0.0];
			vertices_normal[vertices_normal.length] = [ 0.0,  -1.0, 0.0];
			vertices_normal[vertices_normal.length] = [ 0.0,  -1.0, 0.0];
		
			vertices_index[vertices_index.length] = [index];
			vertices_index[vertices_index.length] = [index+1];
			vertices_index[vertices_index.length] = [index+2];
			index+=3;
		}
		
		// Corps
		for(py=y-size; py<y+size; py+=size/5){
			counter_x = 0;
			for(angle=Math.PI*2; angle>0; angle-=Math.PI/10){
				
				vertices_position[vertices_position.length] = [	x+size*Math.cos(angle),				py,			z+size*Math.sin(angle) 				];
				vertices_position[vertices_position.length] = [	x+size*Math.cos(angle+Math.PI/10),	py,			z+size*Math.sin(angle+Math.PI/10)	];
				vertices_position[vertices_position.length] = [	x+size*Math.cos(angle),				py+size/5,	z+size*Math.sin(angle)				];
				vertices_position[vertices_position.length] = [	x+size*Math.cos(angle+Math.PI/10),	py+size/5,	z+size*Math.sin(angle+Math.PI/10)	];
				
				vertice_texture[vertice_texture.length] = [0.35+counter_x*0.034, 0+counter_y*0.068+0.313];
				vertice_texture[vertice_texture.length] = [0.32+counter_x*0.034, 0+counter_y*0.068+0.313];
				vertice_texture[vertice_texture.length] = [0.35+counter_x*0.034, 0.069+counter_y*0.068+0.313];
				vertice_texture[vertice_texture.length] = [0.32+counter_x*0.034, 0.069+counter_y*0.068+0.313];
				
				vertices_normal[vertices_normal.length] = [ Math.cos(angle),  				0.0, Math.sin(angle)			];
				vertices_normal[vertices_normal.length] = [ Math.cos(angle+Math.PI/10), 	0.0, Math.sin(angle+Math.PI/10)	];
				vertices_normal[vertices_normal.length] = [ Math.cos(angle),  				0.0, Math.sin(angle)			];
				vertices_normal[vertices_normal.length] = [ Math.cos(angle+Math.PI/10), 	0.0, Math.sin(angle+Math.PI/10)	];
				
				vertices_index[vertices_index.length] = [index];
				vertices_index[vertices_index.length] = [index+1];
				vertices_index[vertices_index.length] = [index+2];
				vertices_index[vertices_index.length] = [index+1];
				vertices_index[vertices_index.length] = [index+2];
				vertices_index[vertices_index.length] = [index+3];
				index+=4;
				
				counter_x++;
			}
			counter_y++;
		}
		
		// Couronne haute
		for(angle=0; angle<Math.PI*2; angle+=Math.PI/10){
			vertices_position[vertices_position.length] = [	x,									y+size,		z									];
			vertices_position[vertices_position.length] = [	x+size*Math.cos(angle+Math.PI/10),	y+size,		z+size*Math.sin(angle+Math.PI/10)	];
			vertices_position[vertices_position.length] = [	x+size*Math.cos(angle),				y+size,		z+size*Math.sin(angle)				];
		
			vertice_texture[vertice_texture.length] = [0.155, 									0.846											];
			vertice_texture[vertice_texture.length] = [0.155+Math.sin(angle+Math.PI/10)*0.155, 	0.846+Math.cos(angle+Math.PI/10)*0.155			];		
			vertice_texture[vertice_texture.length] = [0.155+Math.sin(angle)*0.155, 			0.846+Math.cos(angle)*0.155						];
		
			vertices_normal[vertices_normal.length] = [ 0.0,  1.0, 0.0];
			vertices_normal[vertices_normal.length] = [ 0.0,  1.0, 0.0];
			vertices_normal[vertices_normal.length] = [ 0.0,  1.0, 0.0];
		
			vertices_index[vertices_index.length] = [index];
			vertices_index[vertices_index.length] = [index+1];
			vertices_index[vertices_index.length] = [index+2];
			index+=3;
		}		
		
		this.AddVerticeObject(
			name,					// Nom de l'objet
			{x:x, y:y, z:z},	 	// Point de reference de l'objet
			vertices_position, 		// Facettes de l'objet (facettes triangulaires)
			texture,				// Chemin d'accès de la texture
			vertice_texture,		// Position de texture : (0, 0) en bas à gauche, (1, 1) en haut à droite		
			vertices_normal,		// Vecteur normaux aux facettes (pour les calculs de lumières)
			vertices_index,			// Index de facette (pour un tracé des facette non adjacentes => on indique l'index des point par groupe de 3 pour determiner les facettes)
			alphabending
		);	
		

	}
	this.AddCubeTextured = 						function(name, x, y, z, size, texture, alphabending){
		size = size/2;
		this.AddVerticeObject(
			// Nom de l'objet
			name,
			// Point de reference de l'objet
			{x:x, y:y, z:z},
			// Facettes de l'objet (facettes triangulaires)
			[
				[x-size, y+size, z-size], [x+size, y+size, z-size], [x-size, y-size, z-size], [x+size, y-size, z-size],
				[x-size, y+size, z+size], [x+size, y+size, z+size], [x-size, y-size, z+size], [x+size, y-size, z+size],
				[x-size, y+size, z-size], [x-size, y+size, z+size], [x-size, y-size, z-size], [x-size, y-size, z+size],
				[x+size, y+size, z-size], [x+size, y+size, z+size], [x+size, y-size, z-size], [x+size, y-size, z+size],
				[x-size, y+size, z+size], [x+size, y+size, z+size], [x-size, y+size, z-size], [x+size, y+size, z-size],
				[x-size, y-size, z+size], [x+size, y-size, z+size], [x-size, y-size, z-size], [x+size, y-size, z-size]
			], 
			// Chemin d'accès de la texture
			texture,
			// Position de texture : (0, 0) en bas à gauche, (1, 1) en haut à droite
			[
				[0.66, 0.99], [0.34, 0.99], [0.66, 0.67], [0.34, 0.67],		// Back
				[0.34, 0.66], [0.66, 0.66], [0.34, 0.34], [0.66, 0.34],		// Front
				[0.67, 0.99], [0.99, 0.99], [0.67, 0.67], [0.99, 0.67],		// Left
				[0.99, 0.99], [0.67, 0.99], [0.99, 0.67], [0.67, 0.67],		// Right
				[0.01,  0.67],[0.33, 0.67], [0.01, 0.99], [0.33, 0.99],		// Up
				[0.01,  0.66],[0.33, 0.66], [0.01,  0.34],[0.33, 0.34]		// Down
			],			
			// Vecteur normaux aux facettes (pour les calculs de lumières)
			[
				[ 0.0,  0.0, -1.0], [ 0.0,  0.0, -1.0], [ 0.0,  0.0, -1.0], [ 0.0,  0.0, -1.0],
				[ 0.0,  0.0,  1.0], [ 0.0,  0.0,  1.0], [ 0.0,  0.0,  1.0], [ 0.0,  0.0,  1.0],
				[-1.0,  0.0,  0.0], [-1.0,  0.0,  0.0], [-1.0,  0.0,  0.0], [-1.0,  0.0,  0.0],
				[ 1.0,  0.0,  0.0], [ 1.0,  0.0,  0.0], [ 1.0,  0.0,  0.0], [ 1.0,  0.0,  0.0],
				[ 0.0,  1.0,  0.0], [ 0.0,  1.0,  0.0], [ 0.0,  1.0,  0.0], [ 0.0,  1.0,  0.0],
				[ 0.0, -1.0,  0.0], [ 0.0, -1.0,  0.0], [ 0.0, -1.0,  0.0], [ 0.0, -1.0,  0.0]
				
			],
			// Index de facette (pour un tracé des facette non adjacentes => on indique l'index des point par groupe de 3 pour determiner les facettes)
			[
				[0],  [1],  [2],  [1],  [2],  [3],
				[4],  [5],  [6],  [5],  [6],  [7],
				[8],  [9],  [10], [9],  [10], [11],
				[12], [13], [14], [13], [14], [15],
				[16], [17], [18], [17], [18], [19],
				[20], [21], [22], [21], [22], [23]
			],
			alphabending
		);	
	}
	this.AddPlaneTextured = 					function(name, x, y, z, size, texture, alphabending){
		size = size/2;
		this.AddVerticeObject(
			name,
			{x:0, y:0, z:0},
			[
				[x-size, y, z+size],
				[x+size, y, z+size],
				[x-size, y, z-size],
				[x+size, y, z-size]
			],
			texture,
			[
				[0.0, 0.0],
				[0.0, 1.0],
				[1.0, 0.0],
				[1.0, 1.0]
			],
			[
				[0.0,  1.0,  0.0],
				[0.0,  1.0,  0.0],
				[0.0,  1.0,  0.0],
				[0.0,  1.0,  0.0]
			],
			false,
			alphabending
		);			
	}
	this.AddGroundMatrixTextured = 				function(name, x, y, z, step_x, step_z, y_matrix, texture){
		var vertices_position = [];
		var vertices_texture = [];
		var vertices_normals = [];	
		var x_width = y_matrix[0].length-1;
		var z_width = y_matrix.length-1;
		var px = 0;
		var py = 0;
		var	pz = 0;
		var sense = true;
		var index = 0;
		for(pz=0; pz<z_width; pz++){
			sense = pz%2==0;
			for(px=0; px<x_width; px++){
				if(sense){
					vertices_position[index]   = [x+ px   *step_x, y+y_matrix[pz][px],    z+ pz   *step_z];
					vertices_position[index+1] = [x+ px   *step_x, y+y_matrix[pz+1][px],  z+(pz+1)*step_z];
					vertices_position[index+2] = [x+(px+1)*step_x, y+y_matrix[pz][px+1],  z+ pz   *step_z];
					vertices_position[index+3] = [x+(px+1)*step_x, y+y_matrix[pz+1][px+1],z+(pz+1)*step_z];
					vertices_texture[index]    = [0.0, 0.0];
					vertices_texture[index+1]  = [0.0, 1.0];
					vertices_texture[index+2]  = [1.0, 0.0];
					vertices_texture[index+3]  = [1.0, 1.0];	
				} else {
					vertices_position[index]   = [x+(x_width-px)  *step_x, y+y_matrix[pz][x_width-px],     z+ pz   *step_z];
					vertices_position[index+1] = [x+(x_width-px)  *step_x, y+y_matrix[pz+1][x_width-px],   z+(pz+1)*step_z];
					vertices_position[index+2] = [x+(x_width-px-1)*step_x, y+y_matrix[pz][x_width-px-1],   z+ pz   *step_z];
					vertices_position[index+3] = [x+(x_width-px-1)*step_x, y+y_matrix[pz+1][x_width-px-1], z+(pz+1)*step_z];
					vertices_texture[index]    = [1.0, 0.0];
					vertices_texture[index+1]  = [1.0, 1.0];
					vertices_texture[index+2]  = [0.0, 0.0];
					vertices_texture[index+3]  = [0.0, 1.0];							
				}
				vertices_normals[index]   = [0.0,  1.0,  0.0];
				vertices_normals[index+1] = [0.0,  1.0,  0.0];
				vertices_normals[index+2] = [0.0,  1.0,  0.0];
				vertices_normals[index+3] = [0.0,  1.0,  0.0];
				index+=4;
			}
		}
	
		engine.AddVerticeObject(
			name,
			{x:0, y:0, z:0},
			vertices_position, 		// Vecteur de l'objet
			texture,				// Texture
			vertices_texture, 		// Parcelle de texture : (0, 0) en bas à gauche, (1, 1) en haut à droite
			vertices_normals,		// Vecteur normaux aux facettes
			false,					// Indice des vertexs
			false
		);	
	
	}
	
	// Transformations d'objet
	this.TranslateObject = 						function(name, translate_x, translate_y, translate_z){
		var obj_index = this.GetObjectIndex(name);
		if(obj_index!=false){
			var obj = this.objectBuffer[obj_index];
			var positions_vertices = obj.bak_vertice_position;
			var i = 0;
			var len = 0;
			var vextex = [];
		
			// Charge les vextex et les parcoures
			len = positions_vertices.length;
			for(i=0; i<len; i++){
				// Charge le vertex
				vertex = positions_vertices[i];
				// Scale le vertex
				vertex[0] += translate_x;
				vertex[1] += translate_y;
				vertex[2] += translate_z;
				// Reinjecte le vertex
				positions_vertices[i] = vertex;
			}
			
			// Modifie le vertices_position de l'objet
			this.objectBuffer[obj_index].bak_vertice_position = positions_vertices;
			
			// Regenère le vertices_position WebGL
			this.objectBuffer[obj_index].vertices_position = this.ConvertWebGlBufferArray(positions_vertices);
			
			// Enregistre l'operation
			this.objectBuffer[obj_index].position.x+=translate_x;
			this.objectBuffer[obj_index].position.y+=translate_y;
			this.objectBuffer[obj_index].position.z+=translate_z;
			
		}
	}
	this.ScaleObject = 							function(name, scale_x, scale_y, scale_z){
		var obj_index = this.GetObjectIndex(name);
		if(obj_index!=false){
			var obj = this.objectBuffer[obj_index];
			var positions_vertices = obj.bak_vertice_position;
			var i = 0;
			var len = 0;
			var vextex = [];
		
			// Charge les vextex et les parcoures
			len = positions_vertices.length;
			for(i=0; i<len; i++){
				// Charge le vertex
				vertex = positions_vertices[i];
				// Scale le vertex
				vertex[0] = obj.position.x+(vertex[0]-obj.position.x)*scale_x;
				vertex[1] = obj.position.y+(vertex[1]-obj.position.y)*scale_y;
				vertex[2] = obj.position.z+(vertex[2]-obj.position.z)*scale_z;
				// Reinjecte le vertex
				positions_vertices[i] = vertex;
			}
			// Modifie le vertices_position de l'objet
			this.objectBuffer[obj_index].bak_vertice_position = positions_vertices;
			// Regenère le vertices_position WebGL
			this.objectBuffer[obj_index].vertices_position = this.ConvertWebGlBufferArray(positions_vertices);
		}
	}
	this.RotateObject = 						function(name, rotate_x, rotate_y, rotate_z){
		var obj_index = this.GetObjectIndex(name);
		if(obj_index!=false){
			var obj = this.objectBuffer[obj_index];
			var positions_vertices = obj.bak_vertice_position;
			var i = 0;
			var len = 0;
			var vextex = [];
			
			// Charge les vextex et les parcoures
			len = positions_vertices.length;
			
			for(i=0; i<len; i++){
			
				// Charge le vertex
				vertex = positions_vertices[i];
				
				// Rotation du vecteur dans l'espace autour du centre de l'objet
				var matrix = 
					[1, 0, 0, vertex[0]-obj.position.x,
					 0, 1, 0, vertex[1]-obj.position.y,
					 0, 0, 1, vertex[2]-obj.position.z,
					 0, 0, 0, 1];
				mat4.rotate(matrix, rotate_x, [1, 0, 0]);
				mat4.rotate(matrix, rotate_y, [0, 1, 0]);
				mat4.rotate(matrix, rotate_z, [0, 0, 1]);				
				vertex = [matrix[3], matrix[7], matrix[11]];
				
				// Reforme le vertex
				vertex[0]+=obj.position.x; 
				vertex[1]+=obj.position.y;
				vertex[2]+=obj.position.z;
				
				// Reinjecte le vertex
				positions_vertices[i] = vertex;
			}
			
			// Modifie le vertices_position de l'objet
			this.objectBuffer[obj_index].bak_vertice_position = positions_vertices;
			
			// Regenère le vertices_position WebGL
			this.objectBuffer[obj_index].vertices_position = this.ConvertWebGlBufferArray(positions_vertices);
			
			// Charge les vextex normaux et les parcoures
			positions_vertices = obj.bak_vertices_normal;
			len = positions_vertices.length;
			for(i=0; i<len; i++){
			
				// Charge le vertex
				vertex = positions_vertices[i];
				
				// Rotation du vecteur dans l'espace autour du centre de l'objet
				var matrix = 
					[1, 0, 0, vertex[0]-obj.position.x,
					 0, 1, 0, vertex[1]-obj.position.y,
					 0, 0, 1, vertex[2]-obj.position.z,
					 0, 0, 0, 1];
				mat4.rotate(matrix, rotate_x, [1, 0, 0]);
				mat4.rotate(matrix, rotate_y, [0, 1, 0]);
				mat4.rotate(matrix, rotate_z, [0, 0, 1]);				
				vertex = [matrix[3], matrix[7], matrix[11]];
				
				// Reforme le vertex
				vertex[0]+=obj.position.x; 
				vertex[1]+=obj.position.y;
				vertex[2]+=obj.position.z;
				
				// Reinjecte le vertex
				positions_vertices[i] = vertex;
			}
			
			// Modifie le vertices_position de l'objet
			this.objectBuffer[obj_index].bak_vertices_normal = positions_vertices;
			
			// Regenère le vertices_position WebGL
			this.objectBuffer[obj_index].vertice_normal = this.ConvertWebGlBufferArray(positions_vertices);			
			
			// Enregistre l'operation
			this.objectBuffer[obj_index].rotation.x+=rotate_x;
			this.objectBuffer[obj_index].rotation.x+=rotate_y;
			this.objectBuffer[obj_index].rotation.z+=rotate_z;
			
		}	
	
	}
	
	// Camera
	this.CameraPosition = 						function(){
		return this.camera.position;
	}
	this.CameraAngle = 							function(){
		return this.camera.rotation;
	}	
	this.CameraSetPosition = 					function(x, y, z){
		this.camera.position = {x:x, y:y, z:z};
	}
	this.CameraMove = 							function(speed){
		this.camera.position.z+=speed*Math.cos(this.camera.rotation.y);
		this.camera.position.x+=speed*Math.sin(this.camera.rotation.y);
		this.camera.position.y+=speed*(Math.sin(-this.camera.rotation.x)*Math.abs(Math.cos(this.camera.rotation.y))+Math.sin(-this.camera.rotation.x)*Math.abs(Math.sin(this.camera.rotation.y)));
	}
	this.CameraStrafe = 						function(speed){	
		this.camera.position.z+=speed*Math.cos(this.camera.rotation.y+Math.PI/2);
		this.camera.position.x+=speed*Math.sin(this.camera.rotation.y+Math.PI/2);
	}
	this.CameraUp = 							function(speed){	
		this.camera.position.y+=speed;
	}
	this.CameraRotate = 						function(x, y, z){
		this.camera.rotation = {x:this.WrapValue(x), y:this.WrapValue(y), z:this.WrapValue(z)};
	}
	this.CameraRotateX = 						function(x){
		this.camera.rotation.x = this.WrapValue(this.camera.rotation.x+x);
		if(this.camera.lock_x_roration){
			if(this.camera.rotation.x>1){
				this.camera.rotation.x = 1;
			} else {
				if(this.camera.rotation.x<-1){
					this.camera.rotation.x = -1;
				}	
			}
		}
	}
	this.CameraRotateY = 						function(y){
		this.camera.rotation.y = this.WrapValue(this.camera.rotation.y+y);
	}
	this.CameraRotateZ = 						function(z){
		this.camera.rotation.z = this.WrapValue(this.camera.rotation.z+z);
	}
	this.CameraLockXRotation = 					function(state){
		this.camera.lock_x_roration	= state;
	}
	
	// Affichage (rendu)
	this.Redraw = 								function(){
		if(this.webgl!=null){
			try{
		
				var mvMatrix =			mat4.create(); // Model view Matrix (Point de vue)
				var pMatrix = 			mat4.create(); // Projection matrix (Matrice de projection)			
				var i = 				0;
				var len = 				0;
				var numitem = 			0;
				var buffer = 			null;
				var temp = 				null;
			
				// Efface l'ancien affichage
				this.webgl.clear(this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT);
				
				// Repositionne le fond de scene
				this.RedrawBackgroundScene();
				
				// Point de vue et affichage
				try{
					// Prepare les dimmension de la sortie d'affichage
					this.webgl.viewport(0, 0, this.canvas.width, this.canvas.height);
					
					// Prepare le point de vue
					mat4.perspective(45, this.canvas.width/this.canvas.height, 0.1, 100.0, pMatrix);
					
					// Position de la camera
					mat4.identity(mvMatrix);
					mat4.rotate(mvMatrix, this.camera.rotation.x, [1, 0, 0]);
					mat4.rotate(mvMatrix, this.camera.rotation.y, [0, 1, 0]);
					mat4.rotate(mvMatrix, this.camera.rotation.z, [0, 0, 1]);
					mat4.translate(mvMatrix, [-this.camera.position.x, -this.camera.position.y, this.camera.position.z]);					
					
				} catch(e){
					this.ThrowError(51, 'Redraw', 'Cannot set viewport/modelview matrix');
					throw e;
				}
				
				// Lumières
				this.webgl.uniform1i(this.shaderProgram.useLightingUniform, this.lights.active);
				if (this.lights.active){
					try{
						// Lumière globale diffuse
						if(this.lights.ambiant.active){
							this.webgl.uniform3f(this.shaderProgram.ambientColorUniform, this.lights.ambiant.red, this.lights.ambiant.green, this.lights.ambiant.blue);
						}
					} catch(e){
						this.ThrowError(52, 'Redraw', 'Cannot apply ambiant lights configuration: '+e.toString());
						throw e;
					}
				}
				
				// Si l'aphabending est activé
				if(this.alphabending){	
				
					// 1 - Affiche toutes les facettes de tous les objets sans alphabending
					this.webgl.disable(this.webgl.BLEND);
					this.webgl.uniform1f(this.shaderProgram.alphaUniform, 1);
					
					// Affiche toutes les facettes de tous les objets
					len = this.objectBuffer.length;
					for(i=0; i<len; i++){
						buffer = this.objectBuffer[i];
						if(buffer.alphabending==false){
							this.RedrawVecticeObject(buffer, mvMatrix, pMatrix);
						}
					}				
				
					// 2 - Affiche toutes les facettes de tous les objets avec alphabending
					this.webgl.enable(this.webgl.BLEND);
					this.webgl.blendFunc(this.webgl.SRC_ALPHA, this.webgl.ONE);		// Selectionne la fonction l'alphabending
					this.webgl.uniform1f(this.shaderProgram.alphaUniform, 1);

					// Affiche toutes les facettes de tous les objets
					len = this.objectBuffer.length;
					for(i=0; i<len; i++){
						buffer = this.objectBuffer[i];
						if(buffer.alphabending!=false){
							this.RedrawVecticeObject(buffer, mvMatrix, pMatrix);
						}
					}				

				} else {
				
					// Tracé sans alphabending
					this.webgl.disable(this.webgl.BLEND);
					this.webgl.uniform1f(this.shaderProgram.alphaUniform, 1);
					
					// Affiche toutes les facettes de tous les objets
					len = this.objectBuffer.length;
					for(i=0; i<len; i++){
						buffer = this.objectBuffer[i];
						this.RedrawVecticeObject(buffer, mvMatrix, pMatrix);
					}				
				}
			
			} catch(e){
				this.ThrowError(5, 'Redraw', e.toString());
			}
		}
	}
	this.RedrawVecticeObject = 					function(buffer, mvMatrix, pMatrix){
		try{
			var no_mvMatrix = 	null;
			var name = 			null;
			var light = 		null;
			var index = 		0;
			var far_light = 	[];
			var temp = 			[];
			var tri = 			false;
			var temp_light = 	null;
			var i = 			0;
			var len = 			0;
			var texture = 		null;
		
			// Charge les lumières avec leur distance a la camera
			index = 0;
			for(name in this.lights.points){
				temp[index] = {
					name: name,
					distance: Math.sqrt(Math.pow(this.lights.points[name].position.x-this.camera.position.x, 2)+
										Math.pow(this.lights.points[name].position.y-this.camera.position.y, 2)+
										Math.pow(this.lights.points[name].position.z-this.camera.position.z, 2))
				}
				index++;
			}
			tri = false;
			len = index;
			if(len>16){
				// S'il y a plus de 16 elements, on les tri et ne conserve que les 16 plus proches
				while(!tri){
					tri = true;
					for(i=1; i<len; i++){
						if(temp[i-1].distance>temp[i].distance){
							
							// Echange les elements dans le tableau de distances
							temp_light = {name: temp[i-1].name, distance: temp[i-1].distance};
							temp[i-1] = {name: temp[i].name, distance: temp[i].distance};
							temp[i] = {name: temp_light.name, distance: temp_light.distance};
							
							// Relance le tri
							tri = false;
						}
					}
				}			
				len = 16;
			}
			
			// Injection des lumières dans le shaderProgram (Les plus proche si il y en a plus de 16)
			index = 0;
			for(i=0; i<len; i++){
				light = this.lights.points[temp[i].name];

				// Matrice retirant le deplacement camera
				no_mvMatrix = mat4.create();
				mat4.identity(no_mvMatrix);
				mat4.rotate(no_mvMatrix, this.camera.rotation.x, [1, 0, 0]);
				mat4.rotate(no_mvMatrix, this.camera.rotation.y, [0, 1, 0]);
				mat4.rotate(no_mvMatrix, this.camera.rotation.z, [0, 0, 1]);
				mat4.translate(no_mvMatrix, [this.camera.position.x-light.position.x, this.camera.position.y-light.position.y, -this.camera.position.z-light.position.z]);
				
				// Charge les lumières
				switch(i+1){
					case 1:		this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform1, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform1, light.color.red, light.color.green, light.color.blue);		break;
					case 2:		this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform2, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform2, light.color.red, light.color.green, light.color.blue);		break;
					case 3:		this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform3, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform3, light.color.red, light.color.green, light.color.blue);		break;
					case 4:		this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform4, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform4, light.color.red, light.color.green, light.color.blue);		break;
					case 5:		this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform5, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform5, light.color.red, light.color.green, light.color.blue);		break;
					case 6:		this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform6, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform6, light.color.red, light.color.green, light.color.blue);		break;
					case 7:		this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform7, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform7, light.color.red, light.color.green, light.color.blue);		break;
					case 8:		this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform8, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform8, light.color.red, light.color.green, light.color.blue);		break;
					case 9:		this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform9, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform9, light.color.red, light.color.green, light.color.blue);		break;
					case 10:	this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform10, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform10, light.color.red, light.color.green, light.color.blue);		break;
					case 11:	this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform11, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform11, light.color.red, light.color.green, light.color.blue);		break;
					case 12:	this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform12, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform12, light.color.red, light.color.green, light.color.blue);		break;
					case 13:	this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform13, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform13, light.color.red, light.color.green, light.color.blue);		break;
					case 14:	this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform14 -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform14, light.color.red, light.color.green, light.color.blue);		break;
					case 15:	this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform15, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform15, light.color.red, light.color.green, light.color.blue);		break;
					case 16:	this.webgl.uniform3f(this.shaderProgram.pointLightingLocationUniform16, -no_mvMatrix[12], -no_mvMatrix[13], -no_mvMatrix[14]);
								this.webgl.uniform3f(this.shaderProgram.pointLightingColorUniform16, light.color.red, light.color.green, light.color.blue);		break;
				}
			}
		
			// Facette
			this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, buffer.vertices_position);
			this.webgl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, buffer.vertices_position.itemSize, this.webgl.FLOAT, false, 0, 0);		
			
			// Vecteurs normaux (reflexion de la lumière)
			this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, buffer.vertice_normal);
			this.webgl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, buffer.vertice_normal.itemSize, this.webgl.FLOAT, false, 0, 0);		
			
			// Mapping texture
			this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, buffer.vertice_texture);
			this.webgl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, buffer.vertice_texture.itemSize, this.webgl.FLOAT, false, 0, 0);
			
			// Texture
			this.webgl.activeTexture(this.webgl.TEXTURE0);
			this.webgl.bindTexture(this.webgl.TEXTURE_2D, buffer.texture);
			this.webgl.uniform1i(this.shaderProgram.samplerUniform, 0);
				
			// Alphabending de l'objet
			if(this.alphabending){	
				if(buffer.alphabending!=false){
					// Objet avec alphabending
					this.webgl.uniform1f(this.shaderProgram.alphaUniform, buffer.alphabending);
				}
			}				
			
			// Tracé
			if(buffer.vertices_index==false){
				// Tracé facettes adjacentes
				this.setMatrixUniform(pMatrix, mvMatrix);
				this.webgl.drawArrays(this.webgl.TRIANGLE_STRIP, 0, buffer.vertices_position.numItems);
			} else {
				// Tracé facettes indexées
				this.webgl.bindBuffer(this.webgl.ELEMENT_ARRAY_BUFFER, buffer.vertices_index);
				this.setMatrixUniform(pMatrix, mvMatrix);
				this.webgl.drawElements(this.webgl.TRIANGLES, buffer.vertices_index.numItems, this.webgl.UNSIGNED_SHORT, 0);					
			}
			
		} catch(e){
			this.ThrowError(52, 'RedrawVecticeObject', 'Cannot redraw vertices object : '+e.toString());
		}
	}
	this.setMatrixUniform = 					function(pMatrix, mvMatrix){
		var normalMatrix = mat3.create();
		
		// Applique le point de vue
		this.webgl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
		this.webgl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, mvMatrix);
		
		// Ajuste lles vecteurs normaux
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        this.webgl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);		
		
	}
	
	// Module
	this.WrapValue = 							function(angle){
		if(angle>Math.PI){
			angle-=Math.PI*2;
		} else {
			if(angle<-Math.PI){
				angle+=Math.PI*2;
			}
		}
		return angle;
	}
	
	// Erreurs (fonction 'onerror' à binder)
	this.ThrowError = 							function(code, function_name, error){
		var error = {
			code: code,
			function_name: function_name,
			error: error
		}
		this.onerror(error);
	}
	this.onerror = 								function(e){ return e; }
	
}

function FPS(fps_forced){
	this.time = null;
	this.delay = 0;
	this.fps = 0;
	this.force_fps = fps_forced;
	this.duration = 0;
	this.FPS_Loop = function(str_function){
		var date = new Date();
		if(this.time==null){
			this.time = date.getTime();
			this.duration = 1000/this.force_fps-this.delay;
		} else {
			this.delay = (date.getTime())-this.time;
			this.time = date.getTime();
			this.fps = Math.round(1000/this.delay);
			this.duration = Math.round(2000/this.force_fps)-this.delay;
		}
		if(this.duration<10){ this.duration=10; }
		
		setTimeout(str_function, this.duration);
	}
	this.setFPS = function(fps_forced){
		this.force_fps = fps_forced;
	}
	this.ForcedFPS = function(){
		return this.force_fps;
	}
	this.FPS = function(){
		return this.fps;
	}
}

// glMatrix v0.9.5 (Gestion de vecteur et matrices)
glMatrixArrayType=typeof Float32Array!="undefined"?Float32Array:typeof WebGLFloatArray!="undefined"?WebGLFloatArray:Array;

var vec3={};
vec3.create=		function(a){var b=new glMatrixArrayType(3);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2]}return b};
vec3.set=			function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};
vec3.add=			function(a,b,c){if(!c||a==c){a[0]+=b[0];a[1]+=b[1];a[2]+=b[2];return a}c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=		function(a,b,c){if(!c||a==c){a[0]-=b[0];a[1]-=b[1];a[2]-=b[2];return a}c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};
vec3.negate=		function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};
vec3.scale=			function(a,b,c){if(!c||a==c){a[0]*=b;a[1]*=b;a[2]*=b;return a}c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=		function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g==1){b[0]=c;b[1]=d;b[2]=e;return b}}else{b[0]=0;b[1]=0;b[2]=0;return b}g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};
vec3.cross=			function(a,b,c){c||(c=a);var d=a[0],e=a[1];a=a[2];var g=b[0],f=b[1];b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};
vec3.length=		function(a){var b=a[0],c=a[1];a=a[2];return Math.sqrt(b*b+c*c+a*a)};
vec3.dot=			function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=		function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1];a=a[2]-b[2];b=Math.sqrt(d*d+e*e+a*a);if(!b){c[0]=0;c[1]=0;c[2]=0;return c}b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};
vec3.lerp=			function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};
vec3.str=			function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};

var mat3={};
mat3.create=		function(a){var b=new glMatrixArrayType(9);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9]}return b};
mat3.set=			function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};
mat3.identity=		function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=		function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};
mat3.toMat4=		function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=0;b[4]=a[3];b[5]=a[4];b[6]=a[5];b[7]=0;b[8]=a[6];b[9]=a[7];b[10]=a[8];b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat3.str=			function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};

var mat4={};
mat4.create=		function(a){var b=new glMatrixArrayType(16);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15]}return b};
mat4.set=			function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};
mat4.identity=		function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=		function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=	function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],o=a[11],m=a[12],n=a[13],p=a[14];a=a[15];return m*k*h*e-j*n*h*e-m*f*l*e+g*n*l*e+j*f*p*e-g*k*p*e-m*k*d*i+j*n*d*i+m*c*l*i-b*n*l*i-j*c*p*i+b*k*p*i+m*f*d*o-g*n*d*o-m*c*h*o+b*n*h*o+g*c*p*o-b*f*p*o-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=		function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],o=a[10],m=a[11],n=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*n,y=k*r-o*n,z=k*s-m*n,C=l*r-o*p,D=l*s-m*p,E=o*s-m*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+o*v-m*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-n*w+r*t-s*B)*q;b[7]=(k*w-o*t+m*B)*q;b[8]=(f*D-h*z+j*x)*q; b[9]=(-c*D+d*z-g*x)*q;b[10]=(n*v-p*t+s*A)*q;b[11]=(-k*v+l*t-m*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-n*u+p*B-r*A)*q;b[15]=(k*u-l*B+o*A)*q;return b};
mat4.toRotationMat=	function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=		function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};
mat4.toInverseMat3=	function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,o=-k*g+h*i,m=j*g-f*i,n=c*l+d*o+e*m;if(!n)return null;n=1/n;b||(b=mat3.create());b[0]=l*n;b[1]=(-k*d+e*j)*n;b[2]=(h*d-e*f)*n;b[3]=o*n;b[4]=(k*c-e*i)*n;b[5]=(-h*c+e*g)*n;b[6]=m*n;b[7]=(-j*c+d*i)*n;b[8]=(f*c-d*g)*n;return b};
mat4.multiply=		function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],o=a[9],m=a[10],n=a[11],p=a[12],r=a[13],s=a[14];a=a[15];var A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14];b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*o+u*r;c[2]=A*g+B*j+t*m+u*s;c[3]=A*f+B*k+t*n+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*o+y*r;c[6]=v*g+w*j+x*m+y*s;c[7]=v*f+w*k+x*n+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*o+E*r;c[10]=z*g+C*j+D*m+E*s;c[11]=z*f+C*k+D*n+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*o+b*r;c[14]=q*g+F*j+G*m+b*s;c[15]=q*f+F*k+G*n+b*a;return c};
mat4.multiplyVec3=	function(a,b,c){c||(c=b);var d=b[0],e=b[1];b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=	function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=		function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[12]=a[0]*d+a[4]*e+a[8]*b+a[12];a[13]=a[1]*d+a[5]*e+a[9]*b+a[13];a[14]=a[2]*d+a[6]*e+a[10]*b+a[14];a[15]=a[3]*d+a[7]*e+a[11]*b+a[15];return a}var g=a[0],f=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],o=a[7],m=a[8],n=a[9],p=a[10],r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=o;c[8]=m;c[9]=n;c[10]=p;c[11]=r;c[12]=g*d+j*e+m*b+a[12];c[13]=f*d+k*e+n*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+o*e+r*b+a[15];return c};
mat4.scale=			function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[0]*=d;a[1]*=d;a[2]*=d;a[3]*=d;a[4]*=e;a[5]*=e;a[6]*=e;a[7]*=e;a[8]*=b;a[9]*=b;a[10]*=b;a[11]*=b;return a}c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=		function(a,b,c,d){var e=c[0],g=c[1];c=c[2];var f=Math.sqrt(e*e+g*g+c*c);if(!f)return null;if(f!=1){f=1/f;e*=f;g*=f;c*=f}var h=Math.sin(b),i=Math.cos(b),j=1-i;b=a[0];f=a[1];var k=a[2],l=a[3],o=a[4],m=a[5],n=a[6],p=a[7],r=a[8],s=a[9],A=a[10],B=a[11],t=e*e*j+i,u=g*e*j+c*h,v=c*e*j-g*h,w=e*g*j-c*h,x=g*g*j+i,y=c*g*j+e*h,z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;if(d){if(a!=d){d[12]=a[12];d[13]=a[13];d[14]=a[14];d[15]=a[15]}}else d=a;d[0]=b*t+o*u+r*v;d[1]=f*t+m*u+s*v;d[2]=k*t+n*u+A*v;d[3]=l*t+p*u+B*v;d[4]=b*w+o*x+r*y;d[5]=f*w+m*x+s*y;d[6]=k*w+n*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+o*e+r*g;d[9]=f*z+m*e+s*g;d[10]=k*z+n*e+A*g;d[11]=l*z+p*e+B*g;return d};
mat4.rotateX=		function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[0]=a[0];c[1]=a[1];c[2]=a[2];c[3]=a[3];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=		function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[4]=a[4];c[5]=a[5];c[6]=a[6];c[7]=a[7];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=		function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];if(c){if(a!=c){c[8]=a[8];c[9]=a[9];c[10]=a[10];c[11]=a[11];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=		function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};
mat4.perspective=	function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b=a*b;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=			function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=		function(a,b,c,d){d||(d=mat4.create());var e=a[0],g=a[1];a=a[2];var f=c[0],h=c[1],i=c[2];c=b[1];var j=b[2];if(e==b[0]&&g==c&&a==j)return mat4.identity(d);var k,l,o,m;c=e-b[0];j=g-b[1];b=a-b[2];m=1/Math.sqrt(c*c+j*j+b*b);c*=m;j*=m;b*=m;k=h*b-i*j;i=i*c-f*b;f=f*j-h*c;if(m=Math.sqrt(k*k+i*i+f*f)){m=1/m;k*=m;i*=m;f*=m}else f=i=k=0;h=j*f-b*i;l=b*k-c*f;o=c*i-j*k;if(m=Math.sqrt(h*h+l*l+o*o)){m=1/m;h*=m;l*=m;o*=m}else o=l=h=0;d[0]=k;d[1]=h;d[2]=c;d[3]=0;d[4]=i;d[5]=l;d[6]=j;d[7]=0;d[8]=f;d[9]=o;d[10]=b;d[11]=0;d[12]=-(k*e+i*g+f*a);d[13]=-(h*e+l*g+o*a);d[14]=-(c*e+j*g+b*a);d[15]=1;return d};
mat4.str=			function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};

quat4={};
quat4.create=		function(a){var b=new glMatrixArrayType(4);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3]}return b};
quat4.set=			function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=	function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a==b){a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return a}b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};
quat4.inverse=		function(a,b){if(!b||a==b){a[0]*=1;a[1]*=1;a[2]*=1;return a}b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};
quat4.length=		function(a){var b=a[0],c=a[1],d=a[2];a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=	function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f==0){b[0]=0;b[1]=0;b[2]=0;b[3]=0;return b}f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};
quat4.multiply=		function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2];a=a[3];var f=b[0],h=b[1],i=b[2];b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=	function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=a[0];var f=a[1],h=a[2];a=a[3];var i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d;d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};
quat4.toMat3=		function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=k+g;b[4]=1-(j+e);b[5]=d-f;b[6]=c-h;b[7]=d+f;b[8]=1-(j+l);return b};
quat4.toMat4=		function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=0;b[4]=k+g;b[5]=1-(j+e);b[6]=d-f;b[7]=0;b[8]=c-h;b[9]=d+f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
quat4.slerp=		function(a,b,c,d){d||(d=a);var e=c;if(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]<0)e=-1*c;d[0]=1-c*a[0]+e*b[0];d[1]=1-c*a[1]+e*b[1];d[2]=1-c*a[2]+e*b[2];d[3]=1-c*a[3]+e*b[3];return d};
quat4.str=			function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};
