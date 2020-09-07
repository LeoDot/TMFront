//Creating a Multi-Marker Augmented Reality Application: https://connected-environments.org/making/ar-playing-cards/
//learn: https://blog.theodo.com/2018/09/build-first-ar-web-app-less-10mn/
// https://aframe.io/
const dataRefreshInterval = 5000; // ms
const imageWidth = 512;
const imageHeight = 512;
const arWidth = 40;
const arHeight = 40;
const graphLine = 2;
const graphDot = 4;
// Global color setup
const backgroundColor = '#2C2C2C';
const foregroundColor = '#F0F0F0';
const accentColor = '#1ec971';

let imageToggle = 1;

// function setupAxis() {
//   var axesHelper = new THREE.( 500 );

//   // AFRAME.registerComponent('do-something', {
//   //   init: function () {
//   //     var sceneEl = this.el;
//   //   }
//   // });
//   var Scene = document.querySelector('a-scene').object3D;
  

//   const ardoc = document.querySelector('#ar');
//   ardoc.insertAdjacentElement(,);
//   ardoc.insertAdjacentHTML(,axesHelper)
//   ardoc.insertAdjacentElement(axesHelper.createElement());

// }

function setupSphere(id) {
  if (!document.querySelector(`#${id}`)){
    const ardoc = document.querySelector('#ar');
    ardoc.insertAdjacentHTML('beforeend', `
      <a-sphere id="${id}" position="0 0 -6" radius="0.5"  color="${accentColor}"></a-sphere>
    `);
  }
}

function updateSphere(id, radius) {
  const element = document.getElementById(`${id}`);

  if (element){
    element.setAttribute('radius', `${radius}`);
  }

}


// function updateSphere(id, radius) {
//   const element = document.getElementById(`${id}`);

//   if (!element){
//     const ardoc = document.querySelector('#ar');
//     ardoc.insertAdjacentHTML('beforeend', `
//       <a-sphere id="${id}" position="0 0 -5" radius="${radius}" color="${accentColor}"></a-sphere>
//     `);

//   }

//   element.setAttribute('radius', `${radius}`);
// }


function setupBox(id) {
  if (!document.querySelector(`#${id}`)){
    const ardoc = document.querySelector('#ar');
    ardoc.insertAdjacentHTML('beforeend', `
      <a-box id="${id}" position="0 0 -7" rotation="0 45 0" color="${accentColor}"></a-box>
    `);
  }
}

function updateBox(id, sizeX, sizeY, sizeZ ) {
  const element = document.getElementById(`${id}`);
  //<a-box color="tomato" depth="2" height="4" width="0.5"></a-box>

  if (element){
    element.setAttribute('depth', `${sizeZ}`);
    element.setAttribute('height', `${sizeY}`);
    element.setAttribute('width', `${sizeX}`);
  }
}


// function setupText(id) {
//   //<a-text value="Hello, World!"></a-text>

//   if (!document.querySelector(`#${id}`)) {
//     const ardoc = document.querySelector('#ar');
//     ardoc.insertAdjacentHTML('beforeend', `<a-entity id='${id}' rotation="-90 0 0" width="1" depth="5" material="transparent: true; opacity: 0;"
//       text="color: ${accentColor}; value: ${id}=No Data; baseline: bottom; align: center; width: 6;"></a-entity>`);
//   }
// }

// async function updateText(id, text) {
//   const textElement = document.getElementById(`${id}`);
//   if (textElement) {
//     textElement.setAttribute('text', `color: ${accentColor}; zOffset: 0.5; font: exo2semibold; baseline: bottom; align: center; width: 20; value: ${text}`);
//   }
// }

function setupText(id) {
  //<a-text value="Hello, World!" width="1" ></a-text>

  if (!document.querySelector(`#${id}`)) {
    const ardoc = document.querySelector('#ar');
    ardoc.insertAdjacentHTML('beforeend',`
     <a-text id="${id}" value="NULL"  position="0 0 -5" rotation="-90 0 0" baseline="bottom" align="center" width="5" color="${accentColor}"></a-text>
    `);
  }
}

async function updateText(id, text) {
  const element = document.getElementById(`${id}`);
  if (element) {
    element.setAttribute('value', `${text}`);
  }
}

/*
use https://kigiri.github.io/fetch/ to transfer CURL to JS fetch
###Including an Adafruit IO Key
When making HTTP requests to Adafruit IO, you can include the API key as a query parameter named x-aio-key or as a request header named X-AIO-Key. In both cases, "X-AIO-Key" is case insensitive.
curl -H "X-AIO-Key: b780002b85d6411ca0ad9f9c60195f72" \
    https://io.adafruit.com/api/v2/test_username/feeds

curl "https://io.adafruit.com/api/v2/test_username/feeds?x-aio-key=b780002b85d6411ca0ad9f9c60195f72"
$ curl -H "X-AIO-Key: {io_key}" https://io.adafruit.com/api/v2/{username}/feeds/{feed_key}/data?limit=1

`https://io.adafruit.com/api/v2/${user}/feeds/${feed}/data?limit=10`

###creat data
POST/api/v2/{username}/feeds/{feed_key}/data

# Send new data with a value of 42
$ curl -F 'value=42' -H "X-AIO-Key: {io_key}" https://io.adafruit.com/api/v2/{username}/feeds/{feed_key}/data

# Send new data with a value of 42 and include optional location metadata
curl -H "Content-Type: application/json" -d '{"value": 42, "lat": 23.1, "lon": "-73.3"}'  -H "X-AIO-Key: {io_key}" https://io.adafruit.com/api/v2/{username}/feeds/{feed_key}/data

###get data
GET/api/v2/{username}/feeds/{feed_key}/data
# get the most recent value
$ curl -H "X-AIO-Key: {io_key}" https://io.adafruit.com/api/v2/{username}/feeds/{feed_key}/data?limit=1

*/
var adaIO_user = "";
var adaIO_key = "";

function iotLogin(user, passward){  
  adaIO_user = user;
  adaIO_key = passward;
}

async function iotGetData(feed){
  let dataRaw = null;
  let data = null;

  try {
    dataRaw = await fetch(`https://io.adafruit.com/api/v2/${adaIO_user}/feeds/${feed}/data?limit=1`, {
      headers: {
        "X-AIO-Key": `${adaIO_key}`
      }
    });
    data = await dataRaw.json();
  } catch (err) {
    throw new Error('Failed to fetch feed, please check user and feed name are correct.');
  }

  if (data.length < 1) {
    throw new Error('Empty Feed');
  }
  
  var value = Number(data[0]['value'])
  if (!value){
    value = data[0]['value'];
  }

  return value;
}

async function iotPublish(feed, value){
  const body = new FormData;
  body.append("value", `${value}`);

  try {
    dataRaw = await fetch(`https://io.adafruit.com/api/v2/${adaIO_user}/feeds/${feed}/data`, {
      body,
      headers: {
        "Content-Type": "multipart/form-data",
        "X-AIO-Key": `${adaIO_key}`
      }
    });

  } catch (err) {
    throw new Error('Failed to publish feed');
  }  
}



async function lineChart(id, feed, title, xLable, yLable) {
  d3.selectAll(`#svg-${id} > *`).remove();

  // Use the margin convention practice
  const margin = {
    top: 50, right: 50, bottom: 50, left: 50,
  };
  const width = imageWidth - margin.left - margin.right; // Use the window's width
  const height = imageHeight - margin.top - margin.bottom; // Use the window's height
  const timeFormat = d3.timeFormat('%H:%M');


  // An array of objects of length N. Each object has key -> value pair

  const dataset = [];
  let uri = `https://io.adafruit.com/api/v2/${adaIO_user}/feeds/${feed}/data?limit=10`;
  let dataRaw = null;
  let data = null;

  try {
    dataRaw = await fetch(uri);
    data = await dataRaw.json();
  } catch (err) {
    throw new Error('Failed to fetch feed, please check user and feed name are correct.');
  }

  if (data.length < 1) {
    throw new Error('Empty Feed');
  }

  data.forEach((d) => { d.time = new Date(d.created_epoch * 1000); });

  const xName = 'time';
  const yName = 'value';

  let minX = data[0][xName];
  let maxX = data[0][xName];
  let minY = parseFloat(data[0][yName]);
  let maxY = parseFloat(data[0][yName]);

  data.forEach((item) => {
    if (item[xName] < minX) minX = item[xName];
    if (item[xName] > maxX) maxX = item[xName];
    if (parseFloat(item[yName]) < minY) minY = item[yName];
    if (parseFloat(item[yName]) > maxY) maxY = item[yName];
    dataset.push({ x: item[xName], y: item[yName] });
  });

  const xScale = d3.scaleLinear()
    .domain([minX, maxX]) // input
    .range([0, width]); // output

  const yScale = d3.scaleLinear()
    .domain([minY, maxY]) // input
    .range([height, 0]); // output

  // d3's line generator
  const line = d3.line()
    .x(d => xScale(d.x)) // set the x values for the line generator
    .y(d => yScale(d.y)) // set the y values for the line generator
    .curve(d3.curveMonotoneX); // apply smoothing to the line

  // Add the SVG to the page and employ #2
  const svg = d3.select(`#svg-${id}`)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Dark background
  svg.append('rect')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('transform', `translate(${-margin.left},${-margin.top})`)
    .attr('fill', backgroundColor);

  // Call the x axis in a group tag
  svg.append('g')
    .attr('class', 'x axis')
    .style('color', foregroundColor)
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(timeFormat)); // Create an axis component with d3.axisBottom

  // text label for the x axis
  svg.append('text')
    .attr('transform',
      `translate(${width / 2} ,${
        height + margin.top * 3 / 4})`)
    .style('text-anchor', 'middle')
    .style('fill', foregroundColor)
    .style('font-family', 'sans-serif')
    .text(xLable);

  // Call the y axis in a group tag
  svg.append('g')
    .attr('class', 'y axis')
    .style('color', foregroundColor)
    .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  // text label for the y axis
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('fill', foregroundColor)
    .style('font-family', 'sans-serif')
    .text(yLable);

  // Append the path, bind the data, and call the line generator
  svg.append('path')
    .datum(dataset) // Binds data to the line
    .attr('class', 'line') // Assign a class for styling
    .attr('d', line) // Calls the line generator
    .style('fill', 'none')
    .style('stroke', accentColor)
    .style('stroke-width', graphLine);


  // Appends a circle for each datapoint
  svg.selectAll('.dot')
    .data(dataset)
    .enter().append('circle') // Uses the enter().append() method
    .attr('class', 'dot') // Assign a class for styling
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', graphDot) // Radius of dot
    .style('fill', accentColor)
    .style('stroke', accentColor);

  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('fill', foregroundColor)
    .style('font-size', '16px')
    .style('font-family', 'sans-serif')
    .text(title);
}



function setupGraph(id) {
  if (!document.querySelector(`#${id}`)) {
    const arDoc = document.querySelector('#ar');
    const arAssets = document.querySelector('a-assets');
    arDoc.insertAdjacentHTML('beforeend', `<a-plane id="${id}" src="" scale="0.1 0.1 0.1" height="${arHeight}" color="#FFFFFF" width="${arWidth}" rotation="-90 0 0"></a-plane>`);
    arAssets.insertAdjacentHTML('beforeend', `<svg id="svg-${id}"></svg>`);
    arAssets.insertAdjacentHTML('beforeend', `<img id="image1-${id}" src="">`);
    arAssets.insertAdjacentHTML('beforeend', `<img id="image2-${id}" src="">`);
  }
}
async function updateGraph(id, feed, title, xLable, yLable) {
  try {
    await lineChart(id, feed, title, xLable, yLable);
    const graph = document.querySelector(`#${id}`);
    const mySVG = document.querySelector(`#svg-${id}`); // Inline SVG element
    const tgtImage1 = document.querySelector(`#image1-${id}`); // Where to draw the result
    const tgtImage2 = document.querySelector(`#image2-${id}`); // Where to draw the result
    const can = document.createElement('canvas'); // Not shown on page
    const ctx = can.getContext('2d');
    const loader = new Image(); // Not shown on page

    can.width = imageHeight;
    loader.width = imageHeight;
    can.height = imageWidth;
    loader.height = imageWidth;
    loader.onload = () => {
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, can.width, can.height);
      ctx.drawImage(loader, 0, 0);
      tgtImage1.src = can.toDataURL('image/png');
      tgtImage2.src = can.toDataURL('image/png');
    };
    const svgAsXML = (new XMLSerializer()).serializeToString(mySVG);
    loader.src = `data:image/svg+xml,${encodeURIComponent(svgAsXML)}`;

    // This is needed to trick aframe to reload the image
    // We swap images each time so it knows there is something new
    setTimeout(() => {
      if (imageToggle) {
        graph.setAttribute('src', `#image1-${id}`);
        imageToggle = 0;
      } else {
        graph.setAttribute('src', `#image2-${id}`);
        imageToggle = 1;
      }
    }, 1000); // Delays swap by 1 second, triggering update
    // TODO find a cleaner way to do this

    //setTimeout(() => displayGraph(user, feed, title, xLable, yLable), dataRefreshInterval);
  } catch (err) {
    const plane = document.querySelector("a-plane");
    plane.setAttribute('visible', false); // Unable to delete because parent node is null
    console.error(err);
    setupText('error');
    updateText('error', err);
  }
}


function setup3DModel(id) {
  if (!document.querySelector(id)) {
    const arDoc = document.querySelector('#ar');
    const arAssets = document.querySelector('a-assets');
    
    arDoc.insertAdjacentHTML('beforeend', `<a-entity id="${id}" obj-model="" scale="0.01 0.01 0.01" position="0 0.2 -0.5" rotation="90 0 0"></a-entity>`);
    arAssets.insertAdjacentHTML('beforeend', `<a-asset-item id="${id}-obj" src="">`);
    arAssets.insertAdjacentHTML('beforeend', `<a-asset-item id="${id}-mtl" src="">`);
  }
}

function load3DModel(id, obj, mtl) {
  if (!obj) {
    setupText('Missing 3D files');
    return;
  }

    const arAssets = document.querySelector('a-assets');
    var models = "";

    arAssets.insertAdjacentHTML('beforeend', `<a-asset-item id="${id}-obj" src="`+obj+`">`);
    const entityOBJ = document.querySelector(`#${id}-obj`);
    entityOBJ.setAttribute('src', obj);
    models = models + `obj: #${id}-obj;`;
    if (mtl && mtl != "null"){
      const entityMTL = document.querySelector(`#${id}-mtl`);
      entityMTL.setAttribute('src', mtl);
      models = models + ` mtl: #${id}-mtl;`;
    }
    const entity = document.querySelector(`#${id}`);
    entity.setAttribute('obj-model', models);
}


async function arScaleSet(id, x, y, z) {
  const element = document.getElementById(id);
  if (element) {
    element.object3D.scale.set(x/100, y/100, z/100);
  }
}

async function arRotationSet(id, x, y, z) {
  const element = document.getElementById(id);
  if (element) {
    element.object3D.rotation.set(
      THREE.Math.degToRad(x),
      THREE.Math.degToRad(y),
      THREE.Math.degToRad(z)
    );
    element.object3D.rotation.x += Math.PI;
  }
}

// A-Frame’s distance unit is in meters; 这里用的是object3D？不是A-Frame
//For performance and ergonomics, we recommend updating position directly via the three.js Object3D .position Vector3 versus via .setAttribute.
// With three.js
//el.object3D.position.set(1, 2, 3);
// With .setAttribute (less recommended).
//el.setAttribute('position', {x: 1, y: 2, z: 3});

async function arPositionSet(id, x, y, z) {
  const element = document.getElementById(id);
  if (element) {
    element.object3D.position.set(x, y, z);
  }
}

async function arColorSet(id, color){
  const element = document.getElementById(id);
  if (element) {
    element.setAttribute('color', `${color}`);
  }
}

async function arShow(id) {
  const element = document.getElementById(id);
  if (element) {
    element.setAttribute('visible', true);
  }
}

async function arHide(id) {
  const element = document.getElementById(id);
  if (element) {
    element.setAttribute('visible', false);
  }
}

async function arRemove(id) {
  const element = document.getElementById(id);
  if (element) {
    element.parentNode.removeChild(element);
  }
}

// @todo{}
// AxesHelper可以在场景中显示坐标系，坐标轴的颜色为RGB，分别对应XYZ；参数代表坐标轴长度。
// var axesHelper = new THREE.AxesHelper( 500 );
// scene.add( axesHelper );
