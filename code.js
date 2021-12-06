/*
Hola :) usé distintas fuentes para mi codigo y herramienta:
- Para el gráfico de áreas apiladas hice una adaptación de: https://www.d3-graph-gallery.com/graph/barplot_stacked_hover.html, https://www.d3-graph-gallery.com/graph/barplot_stacked_highlight.html

- Para la visualización de circulos hice una adaptación de los ejemplos de (use un poco de varios ejemplos): https://www.d3-graph-gallery.com/circularpacking.html

- Para el UPDATE, EXIT del gráfico de áreas apiladas me basé en esta pregunta de stackoverflow: https://stackoverflow.com/questions/61087443/d3-update-stacked-bar-graph-using-selection-join

- Para filtrar los nodos de la visualización y el orden general del codigo usé como guía este examen del semestre pasado: https://puc-infovis.github.io/version-2020/salon_de_la_fama/Perez_Jorge/visualizacion/index.html

- Tambien me basé en distintos códigos de las capsulas y ayudantías.

- Para la idea de visualización me inspiré en: https://www.economist.com/graphic-detail/2021/10/02/treating-beef-like-coal-would-make-a-big-dent-in-greenhouse-gas-emissions
y https://ourworldindata.org/environmental-impacts-of-food
*/
//VARIABLES GLOBALES

const PATH = 'data/Food_Production_preprocessed_vf.csv'

const STEPS_FOOD = {
  land_use: 'Land use',
  animal_feed: 'Animal feed',
  farm: 'Farm',
  processing: 'Processing',
  transport: 'Transport',
  packging: 'Packaging',
  retail: 'Retail',
}

const width_circle_container = 950;
const height_circle_container = 800;
const margin_circle_container = {top: -40, right: 0, bottom: 0, left: 5};

const width_grafico_container = 700;
const height_grafico_container = 800;
const margin_grafico_container = {top: 10, right: 100, bottom: 50, left: 50};


const global_nodes = null;
let selected_nodes = [];
let subgroups = null;

//svg para los nodos (circulos)
const svg_circles = d3
    .select('div#circles-container')
    .append('svg')
    .attr('width', width_circle_container)
    .attr('height', height_circle_container)
    .attr('transform', 'translate(' + margin_circle_container.left + ',' + margin_circle_container.top + ')');

const circles_legend = svg_circles
.append('g')
.attr('transform', 'translate(' + width_circle_container + ',0)')
.attr('backgorund-color', 'pink')


//svg para el grafico apilado
const svg_grafico_apiladas = d3
    .select('div#grafico-apiladas-container')
    .append('svg')
    .attr('width', width_grafico_container)
    .attr('height', height_grafico_container)
    .append('g')
    .attr('transform', 'translate(' + margin_grafico_container.left+ ',' + margin_grafico_container.top + ')');


  // UPDATE
  svg_grafico_apiladas.append("g").attr("class", "stacks");

         
    
const contenedorEjeY = svg_grafico_apiladas
    .append("g")
    .attr("transform", `translate(${margin_grafico_container.left}, 0)`);
   
  
const contenedorEjeX = svg_grafico_apiladas
    .append("g")
    .attr("transform", `translate(0, ${height_grafico_container - margin_grafico_container.bottom})`);
    

const col0 = document.getElementById('col0'); //columna de los checkbox
const button_select_food = document.getElementById('button1-select'); //boton para seleccionar todo los checkbox
const button_deselect_food = document.getElementById('button2-deselect'); //boton para deseleccionar todo los checkbox
const button_plant = document.getElementById('button3-plant');
const button_animal = document.getElementById('button4-animal');

//FUNCIONES

  const hideNode = (node) => {
    //const nodes = d3.selectAll('#nodes').selectAll('g');
    const currrent_node = d3.select(`#circle_${node.id}`);
    currrent_node.attr('visibility', 'hidden');

    const currente_node_text = d3.select(`#circle_text_${node.id}`);
    currente_node_text.attr('visibility', 'hidden');

  }

  const showNode = (node) => {
    //const nodes = d3.selectAll('#nodes').selectAll('g');
    const currrent_node = d3.select(`#circle_${node.id}`);
    currrent_node.attr('visibility', 'visible');

    const currente_node_text = d3.select(`#circle_text_${node.id}`);
    currente_node_text.attr('visibility', 'visible');
    //d.food_product+'_circle'
  }

  
//Handlers de d3

const manejadorZoomCircles = (evento) => {
  const transformation = evento.transform;
  const nodes = svg_circles.selectAll("circle");
  const nodes_texts = svg_circles.selectAll("text");


  nodes.attr("transform", transformation);
  nodes_texts.attr("transform", transformation); 
};

const zoom_circles = d3
  .zoom()
  .extent([
    [0, 0],
    [width_circle_container, height_circle_container],
  ])
  .translateExtent([
    [0, 0],
    [width_circle_container, height_circle_container],

  ])
  .scaleExtent([0.7, 3])
  .on("zoom", manejadorZoomCircles);

svg_circles.call(zoom_circles);

const startSimulation = (nodes_simulation) => {
  svg_circles.selectAll('*').remove();

    //escala de color segun el atributo plant_based
    const escalaColor = d3
    .scaleOrdinal()
    .domain([0,1])
    .range(['#FF4B24', '#8BD970']);


    const escalaRaizParaRadio = d3
        .scaleSqrt()
        .domain([0, 59.6])
        .range([0, 100]);
    

    // create a tooltip
    const tooltip_node = d3.select("div#circles-container")
    .append("div")
    //.attr("transform", `translate(-30 5)`)
    .style("opacity", 0)
    .attr("class", "tooltip")
    .attr("id", "tooltip_node")
    .style("border", "solid")
    .style("border-width", "2.5px")
    .style("border-radius", "5px")
    .style("padding", "5px")
  
    
    const mouseover_node = (e,d) => {
    
        tooltip_node
          .style("opacity", 1)
    
        d3.select(d.target)
        .style('fill-opacity', 1)
        .attr("hover", true)      
      };
    
    const mousemove_node = (e,d) => {

        tooltip_node
          .html(e.food_product  + "<br>" + e.total_emissions.toFixed(2) + " kg CO2")
          //.style("left", d.pageX - document.getElementById('circles-container').getBoundingClientRect().x - 10 + "px")
          //.style("top", d.pageY - document.getElementById('circles-container').getBoundingClientRect().y - 10 + "px")
          .style("left", d3.pointer(d,node.node())[0] + 30 + "px")
          .style("top", d3.pointer(d,node.node())[1] - 0 + "px")
          //.style("left", d.target.attributes.cx.value + 5*r + "px")
          //.style("top", d.target.attributes.cy.value - r  + "px")
          .style("position", "absolute")
          .style("background-color", escalaColor(e.plant_based))
          //.style("border-color", escalaColor(e.plant_based))   
      }
    
    const mouseleave_node = (e,d) => {
        tooltip_node
          .style("opacity", 0)
    
          d3.select(d.target)
          .style('fill-opacity', 0.3)
          .attr("hover", false)
      };

  const simulation = d3.forceSimulation()
  //.force("x", d3.forceX().strength(0.09).x( width_circle_container/2 ))
  //.force("y", d3.forceY().strength(0.6).y((d)=> d.total_emissions)) //posiciona en el eje y segun total de emisiones
  //.force("y", d3.forceY().strength(0.1).y(height_circle_container/2))
  .force("center", d3.forceCenter().x(width_circle_container / 2).y((height_circle_container)/2)) // Attraction to the center of the svg area
  .force("charge", d3.forceManyBody().strength(0.1)) // Nodes are attracted one each other of value is > 0
  .force("collide", d3.forceCollide().strength(0.03).radius((d)=>d.total_emissions+40).iterations(1)) // Force that avoids circle overlapping

  const dragstarted = (d) => {
    if(!d.active) simulation.alphaTarget(.01).restart();
    d.subject.fx = d.subject.x;
    d.subject.fy = d.subject.y;
  };

  const dragged = (d) => {
    d.subject.fx = d.x;
    d.subject.fy = d.y;
  };

  const dragended = (d) => {
    if (!d.active) simulation.alphaTarget(.01);
    d.subject.fx = null;
    d.subject.fy = null;

  };
        
    const node = svg_circles
    .append("g")
    .attr("transform", `translate(-30 5)`)
    .selectAll("circle")
    .data(nodes_simulation, (d)=>d.food_product)
    .enter()
    .append("circle")
    .attr("cx", width_circle_container/2)
    .attr("cy", (height_circle_container + 0)/2)
    .attr("r", (d) => escalaRaizParaRadio(d.total_emissions))
    .attr("fill", (d) => escalaColor(d.plant_based))
    .style("fill-opacity", 0.3)
    .attr("stroke", (d) => escalaColor(d.plant_based))
    .attr("stroke-width", 3)
    .attr("id", (d) => 'circle_'+d.id)
    .on("mouseover", (d,e)=> {
    mouseover_node(e,d)
    
    })
    .on("mousemove", (d,e) => mousemove_node(e,d))
    .on("mouseleave", (d,e) => mouseleave_node(e,d))
    .call(d3.drag() // call specific function when circle is dragged
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));


    const node_text = svg_circles
    .append("g")    
    .attr("transform", `translate(-30 5)`)
    .selectAll("text")
    .data(nodes_simulation, (d)=>d.food_product)
    .enter()
    .append("text")
    .text((d) => d.food_product)
    .attr("x", width_circle_container/2)
    .attr("y", height_circle_container/2)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .attr("fill", "black")
    .attr("id", (d) => 'circle_text_'+d.id)

    
    
  simulation
  .nodes(nodes_simulation, (d) => d.food_product)
  .on("tick", (d) => {
      node
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

      node_text
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y);
  });

}
//para update los subrectangulos se llama en el join del grafico
const updateRects = (childRects, selected, escalaColorApiladas) => {

  const escalaX = d3
  .scaleLinear()
  .domain([0, d3.max(selected, (d) => d.total_emissions)])
  .rangeRound([margin_grafico_container.left, width_grafico_container-margin_grafico_container.right]);

  const ejeX = d3.axisBottom(escalaX);

  contenedorEjeX
  .transition()
  .duration(1000)
  .call(ejeX);


  const escalaY = d3
  .scaleBand()
  .domain(selected.map((d) => d.food_product))
  .rangeRound([margin_grafico_container.top, height_grafico_container-margin_grafico_container.bottom])
  .padding(0.1);

  const ejeY = d3.axisLeft(escalaY);

  contenedorEjeY
    .transition()
    .duration(1000)
    .call(ejeY)

    const tooltip_apiladas = d3.select("div#grafico-apiladas-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip-apiladas")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

      // What happens when user hover a bar
      const mouseover_apiladas = function(e,d) {

        // what subgroup are we hovering?
        var subgroupName = d3.select(e.target.parentNode).datum().key; // This was the tricky part
       
        var subgroupValue = d.data[subgroupName];
  
        // Reduce opacity of all rect to 0.2
        d3.selectAll(".bars").style("opacity", 0.2)
        
        // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
        d3.selectAll("#myRect_"+subgroupName)
          .style("opacity", 1)


        tooltip_apiladas
        .html(STEPS_FOOD[subgroupName] + "<br>" + subgroupValue + " kg CO2")
        .style("opacity", 1)
        .style("background-color", escalaColorApiladas(subgroupName))
      
  
        }

        const mousemove_apiladas = function(e,d) {
          tooltip_apiladas
          .style("left", d3.pointer(e)[0] + 1000 + "px")
          .style("top", d3.pointer(e)[1] + 70 + "px")
          .style("position", "absolute")

        }
        
    
      // When user do not hover anymore
      const mouseleave_apiladas = function(d) {
        // Back to normal opacity: 0.8
        d3.selectAll(".bars")
          .style("opacity",0.8)
 
        tooltip_apiladas
        .style("opacity", 0)
        }
    
  childRects
  .selectAll("rect")
  .data((d) => d, (d) => d.id)
    .join(
      (enter) => 
        enter
      .append("rect")
      .attr("id", (d) => "rect_"+d.id)
      .attr("class", "bar")
      .on("mouseover", (e,d)=>mouseover_apiladas(e,d))
      .on("mousemove", (e,d) => mousemove_apiladas(e,d))
      .on("mouseleave", mouseleave_apiladas)
      .attr("y", function(d) { return escalaY(d.data.food_product); })
      .attr("x", function(d) { return escalaX(d[0]); })

      .transition()
      .duration(1000)
      .attr("width", function(d) { 
          if(escalaX(d[1]) - escalaX(d[0]) >=0){
          return escalaX(d[1]) - escalaX(d[0]); 
      }
          else{
              return escalaX(d[0]) - escalaX(d[1]);
          }
          })
      .attr("height",escalaY.bandwidth())
      .selection(),
      
      
      (update) => 
        update
      .transition()
      .duration(1000)
      .attr("width", function(d) { 
        if(escalaX(d[1]) - escalaX(d[0]) >=0){
        return escalaX(d[1]) - escalaX(d[0]); 
    }
        else{
            return escalaX(d[0]) - escalaX(d[1]);
        }
        })

    .attr("x", function(d) { return escalaX(d[0]); })
    .attr("y", function(d) { return escalaY(d.data.food_product); })
    .attr("height",escalaY.bandwidth())
    .selection(),

      (exit) => 
      exit
      .transition()
      .duration(1000)
      .attr("width",0)
      .attr("x", 0)

      
    );
}
const joinApiladas = (selected) => {

  //apilamos los datos seleccionados
  const apilador = d3
    .stack()
    .keys(subgroups.slice(0,7));

  const stackedData = apilador(selected);

  stackedData.forEach((stackedBar) => {
    stackedBar.forEach((stack) => {
      stack.id = `${stackedBar.key}-${stack.data.id}`;
    });
  });


  const escalaColorApiladas = d3.scaleOrdinal()
      .domain(subgroups)
      .range(d3.schemeSet2);


  // Show the bars

  svg_grafico_apiladas
    .selectAll("g.stacks")
    .selectAll(".stack")
    .data(stackedData, (d) => d.key)
    .join(
      (enter) => {
        
        const barsEnter = enter.append("g").attr("class", "stack");
        
      barsEnter
      .append("g")
      .attr("fill", function(d) { return escalaColorApiladas(d.key); })
      .attr("id", function(d){ return "myRect_" + d.key }) // Add a id to each subgroup: their name
      .attr("class", "bars")

      updateRects(barsEnter.select('.bars'),selected, escalaColorApiladas)
      
      },
      (update) => {
      const barsUpdate = update.select('.bars');
      updateRects(barsUpdate, selected, escalaColorApiladas)
      },
      (exit) =>
      exit.remove()
      
    
    );
      
};

async function loadData(firstTime=false) {
    const global_nodes = await d3.csv(PATH);
    //const filtered_data = new Array();
    subgroups = global_nodes.columns.slice(1)
    
    global_nodes.map((d,i) => {
      d.total_emissions = parseFloat(d.total_emissions);
      d.land_use = parseFloat(d.land_use);
      d.animal_feed = parseFloat(d.animal_feed);
      d.farm = parseFloat(d.farm);
      d.processing = parseFloat(d.processing);
      d.transport = parseFloat(d.transport);
      d.packging = parseFloat(d.packging);
      d.retail = parseFloat(d.retail);
      d.plant_based = parseFloat(d.plant_based);
      d.id = i;
  });
  
  
   // Agregamos las comidas al select
   for (let i = 0; i < global_nodes.length; i++) {
            
    const option = document.createElement("input");
    option.type ="checkbox";
    option.id = i+' checkbox';
    option.value = global_nodes[i].food_product ;
    option.checked = true;
    option.onchange = () => {
        if(option.checked){
            showNode(global_nodes[i]);
            selected_nodes.push(global_nodes[i]);
            joinApiladas(selected_nodes);

            
        } else {
            hideNode(global_nodes[i]);
            selected_nodes.splice(selected_nodes.indexOf(global_nodes[i]), 1);
            joinApiladas(selected_nodes);
        }
    }

    const option_label = document.createElement("label");
    option_label.htmlFor = i;
    option_label.innerHTML = '<br/>'+ global_nodes[i].food_product ;
    option_label.style.fontSize = '10px';
    option_label.style.fontFamily = 'Courier New', 'Courier', 'monospace';
    if (global_nodes[i].plant_based == 1){
      option_label.style.color = 'green';
    }
    else{
      option_label.style.color = 'red';
    }
  

    option_label.appendChild(option);
    

    col0.appendChild(option_label);

};

//botones para seleccionar y deseleccionar

button_select_food.onclick = () => {
    for (let i = 0; i < global_nodes.length; i++) {
        const checkbox = document.getElementById(i+' checkbox');
        if(!checkbox.checked){
          checkbox.checked = true;
          checkbox.onchange();
        }

    }
};

button_select_food.onmouseenter = () => {
    button_select_food.style.backgroundColor = '#f5f5f5';
    button_select_food.style.color = '#000';
    //mouseEnterButton(button_select_food);
}
button_select_food.onmouseleave = () => {
    button_select_food.style.backgroundColor = '#79B4B7';
    button_select_food.style.color = '#000';
}


button_deselect_food.onclick = () => {
    for (let i = 0; i < global_nodes.length; i++) {
        const checkbox = document.getElementById(i+' checkbox');
        if(checkbox.checked){
            checkbox.checked = false;
            checkbox.onchange();
        }

    }
};

button_deselect_food.onmouseenter = () => {
  button_deselect_food.style.backgroundColor = '#f5f5f5';
  button_deselect_food.style.color = '#000';
  //mouseEnterButton(button_select_food);
}
button_deselect_food.onmouseleave = () => {
  button_deselect_food.style.backgroundColor = '#79B4B7';
  button_deselect_food.style.color = '#000';
}

button_plant.onclick = () => {
    for (let i = 0; i < global_nodes.length; i++) {
        const checkbox = document.getElementById(i+' checkbox');

            if(global_nodes[i].plant_based == 1){
              if(!checkbox.checked){
                checkbox.checked = true;
                checkbox.onchange();
              }
            } else{
              if(global_nodes[i].plant_based == 0){
              if(checkbox.checked){
                checkbox.checked = false;
                checkbox.onchange();
              }
            }
            }          
    }
};

button_plant.onmouseenter = () => {
  button_plant.style.backgroundColor = '#f5f5f5';
  button_plant.style.color = '#000';
  //mouseEnterButton(button_select_food);
}
button_plant.onmouseleave = () => {
  button_plant.style.backgroundColor = '#79B4B7';
  button_plant.style.color = '#000';
}

button_animal.onclick = () => {
  
  for (let i = 0; i < global_nodes.length; i++) {
    const checkbox = document.getElementById(i+' checkbox');

        if(global_nodes[i].plant_based == 1){
          if(checkbox.checked){
            checkbox.checked = false;
            checkbox.onchange();
          }
        } else{
          if(global_nodes[i].plant_based == 0){
          if(!checkbox.checked){
            checkbox.checked = true;
            checkbox.onchange();
          }
        }
        }          
}

};
button_animal.onmouseenter = () => {
  button_animal.style.backgroundColor = '#f5f5f5';
  button_animal.style.color = '#000';
  
}
button_animal.onmouseleave = () => {
  button_animal.style.backgroundColor = '#79B4B7';
  button_animal.style.color = '#000';
}



  if (firstTime){
    for (let i = 0; i < global_nodes.length; i++) {
        selected_nodes.push(global_nodes[i]);
    }
    startSimulation(global_nodes);
    joinApiladas(global_nodes);
  }

};

loadData(true);