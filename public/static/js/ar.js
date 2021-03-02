// https://github.com/AR-js-org/AR.js , https://d3js.org/
const wrapFront = `
<!DOCTYPE html>
<html>

<head>
  <title>Tokylabs AR</title>
  <link rel="icon" type="image/png" href="/v5/static/media/favicon.png"/>
  <script src="/v5/static/js/aframe.min.js"></script>
  <script src="/v5/static/js/aframe-ar.js"></script>
  <script src="/v5/static/js/ar-frontend.js"></script>
  <script src="/v5/static/js/d3.v5.min.js"></script>
</head>

<body style='margin : 0px; overflow: hidden;'>
  <div class="page-head"></div>
  <a-scene id="sys" embedded arjs='debugUIEnabled: true;' renderer="antialias: true">
    <a-assets>
    </a-assets>

    <a-entity camera look-controls position="0 1.6 5">
      <a-marker id="ar" type="pattern" url='/v5/static/media/toky-marker.patt' emitevents='true' smooth='true'>

      </a-marker>
    </a-entity>
    
  </a-scene>
  <div style="position: fixed; left: 0%; bottom: 10px; width:100%; text-align: center; z-index: 1;color: grey;">
    <div style="color: rgba(0, 0, 0, 0.9); background-color: rgba(127, 127, 127, 0.5); display: inline-block; padding: 0.5em; margin: 0.5em; text-align: left;">
      <a href="${window.location.origin}" style="display: block; color: coral; font-family: monospace; text-decoration: none;">
       Try it yourself with Tokymaker AR
      </a>
    </div>
  </div>
  <script>
    var m = document.querySelector("a-marker")
    m.addEventListener("markerFound", (e)=>{
      console.log("Marker found")
    })

    m.addEventListener("markerLost", (e)=>{
      console.log("Marker lost")
    })
    
    async function AR() {
`;

const wrapBack = `
    }
    AR();
  </script>
</body>
</html>
`;

var ARCode = null;
var arQrName = "TokyAr";
var arSeverFileName = "";
var arUrl = "";

window.isArUploading = false;




function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
  else
      byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type:mimeString});
}

function uploadARFile (blob, filename) {
  var formData = new FormData()
  formData.append('file', blob, filename)
  return new Promise((resolve => {
    $.ajax({
      url: "/arupload",
      type: "POST",
      data: formData,
      processData: false,  // 不处理数据
      contentType: false, // 不设置内容类型
      success: (res) => {
        resolve(res)
      }
    });
  }))
}

var arRunEl =arButton.children[0];
let arRunElPreColor = arRunEl.style.color;

async function uploadAR(){
  if (window.isUploading) {
    return;
  }

  arRunEl.style.color = "grey";
  window.isArUploading = true;

  try{
    // Get code from the workspace
    let runScript = Blockly.JavaScript.workspaceToCode(workspace);

    // This wraps the file in the standard code
    runScript = wrapFront + runScript + wrapBack;

    // Converts the script into an html file
    let fileContent = new Blob([runScript], { type: 'text/html' });
    if (arSeverFileName.length < 3){
      arSeverFileName = uuid() + ".html";
    }
    let res = await uploadARFile(fileContent, arSeverFileName);
    arUrl = `https://${window.location.host}${res.data.url}`;
    let qrCode = await QRCode.toDataURL(arUrl);
    ARCode = await combineImages(qrCode, "static/media/toky-marker.jpg");

    viewQR();

  } catch (e) {
    console.log(e);
    window.isArUploading = false;
    arRunEl.style.color = arRunElPreColor;
  }
}

function combineImages(image1src, image2src) {
  return new Promise((resolve, reject) => {
    let c = document.createElement("canvas");
    let ctx = c.getContext("2d");
    ctx.canvas.width  = 2000;
    ctx.canvas.height = 1000;
    let imageObj1 = new Image();
    let imageObj2 = new Image();
    imageObj1.src = image1src;
    imageObj1.onload = function () {
      ctx.drawImage(imageObj1, 0, 0, 1000, 1000);
      imageObj2.src = image2src;
      imageObj2.onload = function () {
        ctx.drawImage(imageObj2, 1000, 0, 1000, 1000);
        let img = c.toDataURL("image/png");
        resolve(img);
      }
    };
  });
}


//https://www.jqueryscript.net/lightbox/Highly-Configurable-JS-Modal-Dialog-Box-Library-Vex.html
/* {<div class="vex-content">
  <form class="vex-dialog-form">
    <div class="vex-dialog-message"></div>
    <div class="vex-dialog-input"></div>
    <div class="vex-dialog-buttons">
      <button type="submit" class="vex-dialog-button-primary vex-dialog-button vex-first">Save</button>
      <button type="button" class="vex-dialog-button-secondary vex-dialog-button vex-last">Cacel</button>
    </div>
  </form>
  <div class="vex-close"></div>
</div> }*/

function viewQR() {
  vex.dialog.open({
    afterOpen: () => {
      let img = document.createElement('IMG');
      img.src = ARCode;
      let saveinfo = document.createElement('TEXT');
      saveinfo.innerHTML='<br><p style="color:black;text-align:center;font-size:small;">The AR will be kept 7 days after SAVE</p>';
      let urlInfo = document.createElement('TEXT');
      urlInfo.innerHTML=`<p>Scan or Click <a href="${arUrl}" target="_blank">link</a></p> `;
      document.querySelector('.vex-dialog-message').appendChild(urlInfo);
      urlInfo.append(img);
      // document.querySelector('.vex-dialog-message').appendChild(img);
      document.querySelector('.vex-content').appendChild(saveinfo); 
    },
    afterClose: () => {
      window.isArUploading = false;
      arRunEl.style.color = arRunElPreColor;
    },

    focusFirstInput: false,
    showCloseButton: false,    
    buttons: [
      $.extend({}, vex.dialog.buttons.YES, {
        text: "SAVE",
        click: saveQR
      }),
      $.extend({}, vex.dialog.buttons.NO, {
        text: "CLOSE",
      })
    ]

  })
}


function saveQR(){
  vex.dialog.prompt({
    message: "What would you like to name your file?",
    placeholder: `${arQrName}`,
    callback: function(fileName) {
      if (fileName) {
        arQrName = fileName;
        let imgBlob = dataURItoBlob(ARCode)
        if (bleVue.$data.isiOS) {
            uploadFile(imgBlob, fileName + ".png", function (res) {
              downloadData( res.data.url )
            })
        } else {
          saveAs(imgBlob, fileName + ".png");
        }

        arSeverFileName = "";
      }
    }
  });
}


function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}
