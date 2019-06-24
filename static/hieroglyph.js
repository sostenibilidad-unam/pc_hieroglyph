
logistic = function(x){
    return 1 / (1.0 + Math.exp(-10 * (x - 0.5)))
}

function hexToRGB(hex) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

index2rgb =  function(palette, index){
    index_log = logistic(index);
    color_0_1 = palette(index_log);
    string_rgb = hexToRGB(color_0_1,1);
    //string_rgb = "rgb("+str(int(color_0_1[0]*255.0))+","+str(int(color_0_1[1]*255.0))+","+str(int(color_0_1[2]*255.0))+")";
    //string_rgb = "rgb(0,0,255)";
    return string_rgb;
}
    



angle2xy = function(centerX, centerY, radius, angleInDegrees){
    // """ Calculates [x,y] from angle and radius """
    angleInRadians = (angleInDegrees-90) * Math.PI / 180.0
    x = centerX + (radius * Math.cos(angleInRadians));
    y = centerY + (radius * Math.sin(angleInRadians));
    return [x, y]
}
    


addArc = function(target, p0, p1, radius, width, color, field_name, invert_palette){
    //""" Adds an arc that cirles to the right as it moves from p0 to p1 """
    x0 = p0[0];
    y0 = p0[1];
    xradius = radius;
    yradius = radius;
    ellipseRotation = 0;   //# has no effect for circles
    x1 = (p1[0] - p0[0]);
    y1 = (p1[1] - p0[1]);
    //color = 'green'  // aqui hay que usar una rampa de color que dependa del value
    var path = target.path(`M ${x0},${y0} a ${xradius},${yradius} ${ellipseRotation} 0,0 ${x1},${y1}`)
    path.fill('none')
    path.stroke({ color: color, width: width})
    path.click(function() {
        change_color(field_name,invert_palette);
    });
    
}
    
linspace = function linspace(a,b,n) {
    if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
    if(n<2) { return n===1?[a]:[]; }
    var i,ret = Array(n);
    n--;
    for(i=n;i>=0;i--) { ret[i] = (i*b+(n-i)*a)/n; }
    return ret;
}

addArcs = function(target, radius, center, data){
    //""" Adds as many as categories arcs given radius and center """
    var values = [];
    categories = data["categories"].length;
    function myFunction(value, index, array) {
        values.push(value["value"]);
    }
    data["categories"].forEach(myFunction);
    cortesAngulares = linspace(0, 360, categories + 1)
    delta = (7/120)*cortesAngulares[1]
    for (var i = 1; i < categories + 1; i++) {
        field_name = data["categories"][i-1]["field_name"];
        invert = data["categories"][i-1]["invert_palette"];
        if (invert){
            palette = colorscale_i;
        }else{
            palette = colorscale;
        }
        r_gray = radius*0.94;
        r_value = r_gray-((r_gray*0.20)*(1.0-values[i-1]));
        width = radius * 0.355 * values[(i-1)];
        //console.log(r_gray, width, values[(i-1)]);
        p0=angle2xy(center[0], center[1], r_gray, cortesAngulares[i] - delta);
        p1=angle2xy(center[0], center[1], r_gray, cortesAngulares[i - 1] + delta);
        width_gray = radius * 0.355
        addArc(target, p0, p1, r_gray, width_gray, 'gainsboro',field_name,invert);
        
        p0=angle2xy(center[0], center[1], r_value, cortesAngulares[i] - delta),
        p1=angle2xy(center[0], center[1], r_value, cortesAngulares[i - 1] + delta),
        addArc(target, p0, p1, r_value, width, index2rgb(palette,values[i-1]),field_name,invert);
        radius_in = radius*0.76;
        radius_out = radius*1.12;
        p0_out = angle2xy(center[0], center[1],radius_out, cortesAngulares[i] - delta);
        p1_out = angle2xy(center[0], center[1], radius_out, cortesAngulares[i - 1] + delta);
        p0_in = angle2xy(center[0], center[1], radius_in, cortesAngulares[i] - delta);
        p1_in = angle2xy(center[0], center[1], radius_in, cortesAngulares[i - 1] + delta);
        addArc(target, p0_out, p1_out, radius_out, 1, 'gray',data["categories"][i-1]["field_name"],field_name,invert);
        addArc(target, p0_in, p1_in, radius_in, 1, 'gray',data["categories"][i-1]["field_name"],field_name,invert);
        var line = target.line(p0_in[0], p0_in[1], p0_out[0], p0_out[1])
        line.stroke({ color: 'gray', width: 1});

        var line2 = target.line(p1_in[0], p1_in[1], p1_out[0], p1_out[1])
        line2.stroke({ color: 'gray', width: 1});
    }
}

addCircle = function(target, radius, center, data){
    if (data["total"]["invert_palette"]){
        palette = colorscale_i;
    }else{
        palette = colorscale;
    }
    
    total = data["total"]["value"]
    r1 = radius * 1.2;
    var circle1 = target.circle(r1).fill('gainsboro').center(center[0], center[1])
    circle1.stroke({ color: 'gray', width: 1});
    circle1.click(function() {
        change_color(data["total"]["field_name"],data["total"]["invert_palette"]);
    });

    r2 = radius * 1.2 * total;
    var circle2 = target.circle(r2).fill(index2rgb(palette,total)).center(center[0], center[1])
    circle2.stroke({ color: 'none', width: 0});
    circle2.click(function() {
        change_color(data["total"]["field_name"],data["total"]["invert_palette"]);
    });
}

addBar = function(target,x0,y0,x1,y1,width,color,field_name,invert){
    var path = target.path(`M ${x0} ${y0} ${x1} ${y1}`)
    path.fill('none')
    path.stroke({ color: color, width: width})
    path.click(function() {
        change_color(field_name,invert);
    });
}


addBars = function(target, radius, center, data){
    n_categories = data["categories"].length;
    cortesAngulares = linspace(0, 360, n_categories+1)
    delta = (7/120)*(360/n_categories)

    for (i = 0; i < n_categories; i++){
        category = data["categories"][i]
        invert = data["categories"][i]["invert_palette"];
        if (invert){
            palette = colorscale_i;
        }else{
            palette = colorscale;
        }
        n_subcategories = category["subcategories"].length;
        cat_start = cortesAngulares[i] + delta;
        cat_end = cortesAngulares[i+1] - delta;


        dots_angles = linspace(cortesAngulares[i],
                                  cortesAngulares[i+1],
                                  n_subcategories+2);
        dots_angles.shift();  
        dots_angles.pop();  
        dots_xys0 = [];
        for (dot = 0; dot < dots_angles.length + 1; dot++){
            dots_angle = dots_angles[dot];
            dots_xys0.push(angle2xy(center[0], center[1], radius*1.25, dots_angle));
        }
        

        for (cual_subcategory = 0; cual_subcategory < category["subcategories"].length; cual_subcategory++){
            subcategory = category["subcategories"][cual_subcategory];
            subcat_field = subcategory["field_name"]
            r_orilla = radius*(1.52);
            p_orilla = angle2xy(center[0], center[1], r_orilla, dots_angles[cual_subcategory]);
            x0 = dots_xys0[cual_subcategory][0];
            y0 = dots_xys0[cual_subcategory][1];
            x1 = p_orilla[0];
            y1 = p_orilla[1];
            width = radius*0.02 + (radius*0.1*(subcategory["weight"]*5));
            addBar(target,x0,y0,x1,y1,width,'gray',subcat_field,invert);
    
            r_tot = radius*(1.51);
            p_tot = angle2xy(center[0], center[1], r_tot, dots_angles[cual_subcategory]);
            x0 = dots_xys0[cual_subcategory][0];
            y0 = dots_xys0[cual_subcategory][1];
            x1 = p_tot[0];
            y1 = p_tot[1];
            width = radius*0.1*(subcategory["weight"]*5);
            addBar(target,x0,y0,x1,y1,width,'gainsboro',subcat_field,invert);
            
            r1 = radius*(1.26 + 0.25*subcategory["value"]);
            p1 = angle2xy(center[0], center[1], r1, dots_angles[cual_subcategory]);
            x0 = dots_xys0[cual_subcategory][0];
            y0 = dots_xys0[cual_subcategory][1];
            x1 = p1[0];
            y1 = p1[1];
            width = radius*0.1*(subcategory["weight"]*5);
            addBar(target,x0,y0,x1,y1,width,index2rgb(palette,subcategory["value"]),subcat_field,invert);
            
        }
    }
}

addLabels = function(target, radius, center, data){
    // Label central
    size = Math.round(14*radius/100);
    rt = radius*0.62;

    name = data["total"]["name"]
    title_angle = name.length * 6.5

    pt0 = angle2xy(center[0], center[1], rt, 360-(title_angle/2));
    pt1 = angle2xy(center[0], center[1], rt, title_angle/2);
    x0 = pt0[0];
    y0 = pt0[1];
    xradius = rt;
    yradius = rt;
    ellipseRotation = 0;
    x1 = (pt1[0]-pt0[0]);
    y1 = (pt1[1]-pt0[1]);

    
    var text = target.text(function(add) {
        add.tspan(name)
    })
    text.font({ size: size, family: 'Arial', weight: "bold" })
    text.path(`M ${x0},${y0} a ${xradius},${yradius} ${ellipseRotation} 0,1 ${x1},${y1}`)
    //text.textPath().attr('startOffset', '15%')
    
    // labels de las categorias
    categories = data["categories"].length;
    cortesAngulares = linspace(0, 360, categories+1);
    delta = (7/120)*cortesAngulares[1];
    size = Math.round(12*radius/100);
    
    var values = [];
    function myFunction(value, index, array) {
        values.push(value["value"]);
    }
    data["categories"].forEach(myFunction);
    var alverez = "0";
    for (i = 1; i < categories+1; i++){
        r = radius
        middle_angle = (cortesAngulares[i]+cortesAngulares[i-1])/2
        if (middle_angle < 90 || middle_angle > 270){
            rt = r*1.15;
            alverez = "1";
            pt1 = angle2xy(center[0], center[1],
                           rt, cortesAngulares[i]-delta);
            pt0 = angle2xy(center[0], center[1],
                           rt, cortesAngulares[i-1]+delta);
        }else{
            rt = r*1.23;
            alverez = "0";
            pt0 = angle2xy(center[0], center[1],
                           rt, cortesAngulares[i]-delta);
            pt1 = angle2xy(center[0], center[1],
                           rt, cortesAngulares[i-1]+delta);
        }
        x0 = pt0[0];
        y0 = pt0[1];
        xradius = rt;
        yradius = rt;
        ellipseRotation = 0;
        x1 = (pt1[0]-pt0[0]);
        y1 = (pt1[1]-pt0[1]);
        color = 'green';
        name = data["categories"][i-1]["name"]

        var text = target.text(function(add) {
            add.tspan(name)
        })
        text.font({ size: size, family: 'Arial', weight: "bold" })
        text.path(`M ${x0},${y0} a ${xradius},${yradius} ${ellipseRotation} 0,${alverez} ${x1},${y1}`)
        text.textPath().attr('startOffset', '33%')
    }
      
    // labels de las subcategorias
    size = Math.round(10*radius/100);
    for (i = 0; i < categories; i++){
        category = data["categories"][i];
        
        n_subcategories = category["subcategories"].length;
        dots_angles = linspace(cortesAngulares[i],
                                  cortesAngulares[i+1],
                                  n_subcategories+2);
        dots_angles.shift();  
        dots_angles.pop();
        
        dots_xys0 = [];
        for (dot = 0; dot < dots_angles.length + 1; dot++){
            dots_angle = dots_angles[dot];
            dots_xys0.push(angle2xy(center[0], center[1], radius*1.25, dots_angle));
        }
        for (cual_subcategory = 0; cual_subcategory < category["subcategories"].length; cual_subcategory++){
            subcategory = category["subcategories"][cual_subcategory];
            name = subcategory["name"];
            // if (name.length>17){
            //     name = name[:17]
            // }
            var x1 = 0;
            var y1 = 0;
            var x0 = 0;
            var y0 = 0;
            var offset = 0;
            if (dots_angles[cual_subcategory] > 180){

                l_name = name.length;
                offset = 86-(l_name*4.63)
                if (offset < 0){
                    offset = 0;
                }
                text0_xys = [];
                for (dot = 0; dot < dots_angles.length + 1; dot++){
                    dots_angle = dots_angles[dot];
                    text0_xys.push(angle2xy(center[0], center[1], radius*1.4, dots_angle-1));
                }
                text1_xys = [];
                for (dot = 0; dot < dots_angles.length + 1; dot++){
                    dots_angle = dots_angles[dot];
                    text1_xys.push(angle2xy(center[0], center[1], radius*2.5, dots_angle-1));
                }
                x1 = text0_xys[cual_subcategory][0];
                y1 = text0_xys[cual_subcategory][1];
                x0 = text1_xys[cual_subcategory][0];
                y0 = text1_xys[cual_subcategory][1];
            }else{
                offset = 13;
                text0_xys = [];
                for (dot = 0; dot < dots_angles.length + 1; dot++){
                    dots_angle = dots_angles[dot];
                    text0_xys.push(angle2xy(center[0], center[1], radius*1.4, dots_angle+1));
                }
                text1_xys = [];
                for (dot = 0; dot < dots_angles.length + 1; dot++){
                    dots_angle = dots_angles[dot];
                    text1_xys.push(angle2xy(center[0], center[1], radius*2.5, dots_angle+1));
                }
                x0 = text0_xys[cual_subcategory][0];
                y0 = text0_xys[cual_subcategory][1];
                x1 = text1_xys[cual_subcategory][0];
                y1 = text1_xys[cual_subcategory][1];
            }

            var text = target.text(function(add) {
                add.tspan(name)
            })
            text.font({ size: size, family: 'Arial', weight: "bold" })
            text.path(`M ${x0} ${y0} ${x1} ${y1}`)
            text.textPath().attr('startOffset', offset+'%')
        }
    }
}

width2r = function(width,labels, toEnsableLabelsLater, data){
    categories = data["categories"].length;
    r = 0;
    if (labels || toEnsableLabelsLater){
        bigest_subcat_len = 0;
        for (i = 0; i < categories; i++){
            category = data["categories"][i];
            for (cual_subcategory = 0; cual_subcategory < category["subcategories"].length; cual_subcategory++){
                subcategory = category["subcategories"][cual_subcategory];
                bigest_subcat_len = Math.max(bigest_subcat_len,subcategory["name"].length);
            }
        }
        bigest_subcat_len = Math.min(17,bigest_subcat_len);
        k = 0.00541;
        r = width*(0.3-(k*bigest_subcat_len));
    }else{
        r = width*0.3;
    }
    return r
}

makeBarGlyph = function(target_div, svg_width,
                 data,
                 labels,
                 toEnsableLabelsLater,
                 palette){
    document.getElementById(target_div).innerHTML = "";                
    var center = [svg_width/2.0,svg_width/2.0];
    var draw = SVG(target_div).size(svg_width,svg_width);
    
    r = width2r(svg_width,labels,toEnsableLabelsLater, data);
    addCircle(draw,r,center,data);
    addArcs(draw,r,center,data);
    addBars(draw,r,center,data);
    if (labels){
        addLabels(draw,r,center,data)
    }    
    
}

// makeLabels = function(path,svg_width,data){
//     center = [svg_width/2.0,svg_width/2.0]
//     dwg = svgwrite.Drawing(filename=path, debug=True, size=(svg_width,svg_width))
//     current_group = dwg.add(dwg.g(id='uno', fill='none', fill_opacity=0 ))
//     r = width2r(svg_width,True,False,data)
//     addLabels(dwg, current_group,r,center,data)
//     dwg.save()
// }