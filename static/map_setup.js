var layer_url = document.currentScript.getAttribute('layer_url');
var data_url = document.currentScript.getAttribute('data_url');




function get_features(url) {
    var data_layer = {};

    $.ajax({
	url: url,
	async: false,
	dataType: 'json',
	success: function(data) {
	    data_layer = data;
	}
    });
    var format_data_layer = new ol.format.GeoJSON();
    var features = format_data_layer.readFeatures(data_layer,
						  {dataProjection: 'EPSG:4326',
						   featureProjection: 'EPSG:3857'});

    return features;
}
//linear color scale
var colorscale = d3.scale.linear()
.domain([0,0.5,1])
.range(["rgb(255, 0, 0)", "rgb(204, 204, 0)", "rgb(0, 127, 0)"])
.interpolate(d3.interpolateLab);
var colorscale_i = d3.scale.linear()
.domain([0,0.5,1])
.range(["rgb(0, 127, 0)" , "rgb(204, 204, 0)", "rgb(255, 0, 0)"])
.interpolate(d3.interpolateLab);
colorscales = function(value,invert){
	if (invert){
		return(colorscale_i(value));
	}else{
		return(colorscale(value));
	}
	
}

var structure = { "total": {"field_name":"vulnera","name" : "Vulnerabilidad","invert_palette":true},
"categories":[
        {"field_name":"exposi", "name":"Exposición","invert_palette":true,
           "subcategories":[{"field_name":"exposi_a", "name":"Expocisión A","weight":0.2},
                            {"field_name":"exposi_b", "name":"Expocisión B","weight":0.4},
                            {"field_name":"exposi_c", "name":"Expocisión C","weight":0.2},
                            {"field_name":"exposi_d", "name":"Expocisión D","weight":0.2}
                            ]},
        {"field_name":"resili", "name":"Resiliencia","invert_palette":false,
          "subcategories":[{"field_name":"resili_a", "name":"Resiliencia A","weight":0.1},
                         {"field_name":"resili_b", "name":"Resiliencia B","weight":0.4},
                         {"field_name":"resili_c", "name":"Resiliencia C","weight":0.2},
                         {"field_name":"resili_d", "name":"Resiliencia D","weight":0.1},
                         {"field_name":"resili_e", "name":"Resiliencia E","weight":0.2}
                         ]},
        {"field_name":"suscep", "name":"Susceptibilidad","invert_palette":true,
           "subcategories":[{"field_name":"suscep_a", "name":"Susceptibilidad A","weight":0.2},
                            {"field_name":"suscep_b", "name":"Susceptibilidad B","weight":0.2},
                            {"field_name":"suscep_c", "name":"Susceptibilidad C","weight":0.2},
                            {"field_name":"suscep_d", "name":"Susceptibilidad D","weight":0.2},
                            {"field_name":"suscep_e", "name":"Susceptibilidad E","weight":0.2}
        ]}
    ]
};
var field_names = { "vulnera":"Vulnerabilidad",
					"exposi" :"Exposición",
					"exposi_a":"Expocisión A",
					"exposi_b":"Expocisión B",
					"exposi_c":"Expocisión C",
					"exposi_d":"Expocisión D",
					"resili":"Resiliencia",
					"resili_a":"Resiliencia A",
					"resili_b":"Resiliencia B",
					"resili_c":"Resiliencia C",
					"resili_d":"Resiliencia D",
					"resili_e":"Resiliencia E",
					"suscep":"Susceptibilidad",
					"suscep_a":"Susceptibilidad A",
					"suscep_b":"Susceptibilidad B",
					"suscep_c":"Susceptibilidad C",
					"suscep_d":"Susceptibilidad D",
					"suscep_e":"Susceptibilidad E"};
        
var fields_palettes = { "vulnera": true,
        				"exposi":true,
           				"exposi_a":true,
                        "exposi_b":true,
                        "exposi_c":true,
						"exposi_d":true,
						"resili":false,
          				"resili_a":false,
                        "resili_b":false,
                        "resili_c":false,
                        "resili_d":false,
                        "resili_e":false,
                        "suscep":true,
           				"suscep_a":true,
                        "suscep_b":true,
                        "suscep_c":true,
                        "suscep_d":true,
                        "suscep_e":true};

function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}
var polygon_style2 = new ol.style.Style({
	  fill: new ol.style.Fill({color: hexToRGB(colorscale(0.9),0.65)}),
	  stroke: new ol.style.Stroke({color: hexToRGB(colorscale(0.9),1),width: 1}),
	  text: new ol.style.Text({
		  	font: '12px Calibri,sans-serif',
		  	fill: new ol.style.Fill({color: 'rgba(250,163,1,1)'}),
	        stroke: new ol.style.Stroke({
	        		color: 'rgba(100,100,100,1)',
	        		width: 3
	        })
	  })
});

var point_style2 =  new ol.style.Style({
  image: new ol.style.Circle({radius: 6.0 + size,
      stroke: new ol.style.Stroke({color: hexToRGB(colorscale(0.9),1), lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0}), fill: new ol.style.Fill({color: hexToRGB(colorscale(0.9),0.65)})})
});


var map
var vectorSource = new ol.source.Vector({projection: 'EPSG:4326'});
var miVector = new ol.layer.Vector({
    	source: vectorSource
});
var layer = new ol.layer.Vector();
jsonSource_data_layer = new ol.source.Vector();
jsonSource_data_layer.addFeatures(get_features(layer_url));
vectorSource.addFeatures(get_features(layer_url));
var todos = jsonSource_data_layer.getFeatures();
var geometry_type = todos[0].getGeometry().getType();
layer = new ol.layer.Vector({
    source: jsonSource_data_layer,
	opacity: 0.65
});
if ((geometry_type == "Polygon") || (geometry_type == "MultiPolygon")){
	layer.setStyle(polygon_style);
	miVector.setStyle(polygon_style2);
}

if (geometry_type == "Point" || geometry_type == "MultiPoint"){
	layer.setStyle(point_style);
	miVector.setStyle(point_style2);
}





var stamenLayer = new ol.layer.Tile({
	source: new ol.source.Stamen({layer: 'terrain'})
});
var ageb_ids = [];
todos.forEach(function(feature){ageb_ids.push(feature.get("id"))});

var estosFeatures = todos;

map = new ol.Map({
    projection:"EPSG:4326",
    layers: [stamenLayer, layer, miVector],
    target: 'map'
});

var extent = layer.getSource().getExtent();
map.getView().fit(extent, map.getSize());
//map.getView().setZoom(map.getView().getZoom() + 1);


var stats_div = document.getElementById('statistics');


var highlightStyleCache = {};
var highlight;

var displayFeatureInfo = function (pixel) {

	var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
		    return feature;
	});

	if (feature) {
		pcz.highlight(pcz.data().filter(function(d) {
		    return d.id === feature.get('id');
		    }));
		stats_div.innerHTML = "selected: 1";
		var data = structure;

		central_value = feature.get([data["total"]["field_name"]]);
		data["total"]["value"] = central_value;
		for (i = 0; i < data["categories"].length;i++){
			///set categories values
			value = feature.get([data["categories"][i]["field_name"]]);
			data["categories"][i]["value"] = value;
			for (j = 0; j < data["categories"][i]["subcategories"].length;j++){
				//set criteria values
				subcat = data["categories"][i]["subcategories"][j];
				data["categories"][i]["subcategories"][j]["value"] = feature.get([subcat.field_name]);
			}
		}
		c = document.getElementById("glyph_column");
		ancho = c.clientWidth;
		alto = c.clientHeight;
		texto = "<h1>Colonias Seleccionadas</h1>"+'<div class="item">'+ feature.get("colonia") +'</div>';
		lista = document.getElementById("selected");
		lista.innerHTML = texto;
		makeBarGlyph("glyph",Math.min(ancho,alto), data, true, false,colorscales);
	}else{
		vectorSource.clear();
	    vectorSource.addFeatures(estosFeatures);
	    pcz.unhighlight();
		stats_div.innerHTML = "selected: "+ ageb_ids.length;
		
		data = mean_glyph(estosFeatures);
		c = document.getElementById("glyph_column");
		ancho = c.clientWidth;
		alto = c.clientHeight;


		name_list = [];
		estosFeatures.forEach(function(feature){
			name_list.push(feature.get("colonia"));
		});
		
		texto = "<h1>Colonias Seleccionadas ("+name_list.length+")</h1>";
		name_list.forEach(function(name){
			texto = texto + '<div class="item">'+ name +'</div>'
		});
		lista = document.getElementById("selected");
		lista.innerHTML = texto;

		makeBarGlyph("glyph",Math.min(ancho,alto), data, true, false,colorscales);
		

	}

	if (feature !== highlight) {
		vectorSource.clear();
		//if (highlight) {
			//featureOverlay.getSource().removeFeature(highlight);
		//	vectorSource.removeFeature(highlight);
		//}
	    if (feature) {
			vectorSource.addFeature(feature);
		}
		highlight = feature;
	}

};
mean_glyph = function(features){
	var data = structure;
	var sum_total = 0;
	features.forEach(function(feature){
		sum_total = sum_total + feature.get([data["total"]["field_name"]]);
	});
	central_value = sum_total/features.length;
	data["total"]["value"] = central_value;
	for (i = 0; i < data["categories"].length;i++){
		///set categories values
		var sum_cat = 0;
		features.forEach(function(feature){
			sum_cat = sum_cat + feature.get([data["categories"][i]["field_name"]]);
		});
		cat_value = sum_cat/features.length;
		data["categories"][i]["value"] = cat_value;
		for (j = 0; j < data["categories"][i]["subcategories"].length;j++){
			//set criteria values
			subcat = data["categories"][i]["subcategories"][j];
			var sum_subcat = 0;
			features.forEach(function(feature){
				sum_subcat = sum_subcat + feature.get(subcat.field_name);
			});
			subcat_value = sum_subcat/features.length;
			data["categories"][i]["subcategories"][j]["value"] = subcat_value;
		}
	}
	return(data);
}
map.on('pointermove', function(evt) {
    if (evt.dragging) {
      return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
  });
map.on('click', function(evt) {
  displayFeatureInfo(evt.pixel);
});
map.getViewport().addEventListener('mouseout', function(evt){
	vectorSource.clear();
    vectorSource.addFeatures(estosFeatures);
    pcz.unhighlight();
    stats_div.innerHTML = "selected: "+ ageb_ids.length;
}, false);


var pcz;



//load csv file and create the chart
d3.csv(data_url, function(data) {

	pcz = d3.parcoords()("#graph")
	 .data(data)
	 .hideAxis(["id","colonia"])
	 .composite("darken")
	 .mode("queue")
	 .rate(80)
	 .color(hexToRGB(colorscale(0.9),0.65))
	 //.alphaOnBrushed(0.3)
	 .render()
	 .alpha(1)
	 .brushMode("1D-axes")  // enable brushing
	 .interactive()  // command line mode



	// click label to activate coloring
	pcz.svg.selectAll(".dimension")
	 //.on("click", change_color)
	 .selectAll(".label")
	 .style("font-size", "26px");
	pcz.on("brush", function(d) {
		vectorSource.clear();
		pcz.shadows();
		ageb_ids = [];
		name_list = [];
		d.forEach(function(entry) {
			ageb_ids.push(entry["id"]);
			name_list.push(entry["colonia"]);
		});
		stats_div.innerHTML = "selected: " + ageb_ids.length;
		estosFeatures = todos.filter(function (feature) {return ageb_ids.indexOf(feature.get('id')) >= 0;});
		vectorSource.addFeatures(estosFeatures);
		data = mean_glyph(estosFeatures);
		texto = "<h1>Colonias Seleccionadas ("+name_list.length+")</h1>";
		name_list.forEach(function(name){
			texto = texto + '<div class="item">'+ name +'</div>'
		});
		lista = document.getElementById("selected");
		lista.innerHTML = texto;

		c = document.getElementById("glyph_column");
		ancho = c.clientWidth;
		alto = c.clientHeight;
		makeBarGlyph("glyph",Math.min(alto,ancho), data, true, false,colorscales);
	});
});



//update color
function change_color(dimension, invert_palette) {
    if (pcz.dimensions()[dimension].type == "number"){
			if (fields_palettes[dimension]){
				field_palette = colorscale_i;
				invert_palette = true;
			}else{
				field_palette = colorscale;
				invert_palette = false;
			}


        	pcz.svg.selectAll(".dimension")
        	 .style("font-weight", "normal")
        	 .filter(function(d) { return d == dimension; })
        	 .style("font-weight", "bold")
        	pcz.color(pre_color(pcz.data(),dimension,invert_palette)).render()



        	var polygon_style_p = function(feature, resolution){
        	    var context = {
        			feature: feature,
        			variables: {}
        	    };
        	    var value = feature.get(dimension);
        	    var slice = _(pcz.data()).pluck(dimension).map(parseFloat);
        		var normalize = d3.scale.linear()
        		.domain([_.min(slice),_.max(slice)])
        		.range([0,1]);
        	    var size = 0;
        	    var style = [ new ol.style.Style({
        		    	stroke: new ol.style.Stroke({
        			    		color: colorscales(normalize(value),invert_palette),
        						lineDash: null,
        						lineCap: 'butt',
        						lineJoin: 'miter',
        						width: 0}),
        				fill: new ol.style.Fill({color: hexToRGB(colorscales(normalize(value),invert_palette),0.65)})
        	    //colorscale(normalize(value))
        		})];
        	    if ("" !== null) {
        		var labelText = String("");
        	    } else {
        		var labelText = ""
        	    }
        	    var key = value + "_" + labelText

        	    if (!styleCache[key]){
        		var text = new ol.style.Text({
        		      font: '14.3px \'Ubuntu\', sans-serif',
        		      text: labelText,
        		      textBaseline: "center",
        		      textAlign: "left",
        		      offsetX: 5,
        		      offsetY: 3,
        		      fill: new ol.style.Fill({
        		        color: 'rgba(0, 0, 0, 255)'
        		      }),
        		    });
        		styleCache[key] = new ol.style.Style({"text": text})
        	    }
        	    var allStyles = [styleCache[key]];
        	    allStyles.push.apply(allStyles, style);
        	    return allStyles;
        	};

			miVector.setStyle(polygon_style_p);
			title = document.getElementById("map_title");
			
			title.innerHTML = '<h2 align="center">'+field_names[dimension]+'</h2>';
			// select the svg area


     }

};

function pre_color(col,dimension, invert_palette){
	var slice = _(col).pluck(dimension).map(parseFloat);
	var normalize = d3.scale.linear()
	.domain([_.min(slice),_.max(slice)])
	.range([0,1]);
	return function(d) { return colorscales(normalize(d[dimension]),invert_palette) }
}
function reset(){
	ageb_ids = [];
	todos.forEach(function(feature){ageb_ids.push(feature.get("id"))});

	estosFeatures = todos;
	vectorSource.clear();
	vectorSource.addFeatures(estosFeatures);

	pcz.brushReset();
	pcz.color(hexToRGB(colorscale(0.9),0.65)).render();
	pcz.svg.selectAll(".dimension")
	 .style("font-weight", "normal")
	miVector.setStyle(polygon_style2);

};
$(window).bind("load", function() {
	change_color("vulnera",true);
	name_list = [];
	todos.forEach(function(feature){
		name_list.push(feature.get("colonia"));
	});
	data = mean_glyph(todos);
	texto = "<h1>Colonias Seleccionadas ("+name_list.length+")</h1>";
	name_list.forEach(function(name){
		texto = texto + '<div class="item">'+ name +'</div>'
	});
	lista = document.getElementById("selected");
	lista.innerHTML = texto;

	c = document.getElementById("glyph_column");
	ancho = c.clientWidth;
	alto = c.clientHeight;
	makeBarGlyph("glyph",Math.min(alto,ancho), data, true, false,colorscales);
 });

