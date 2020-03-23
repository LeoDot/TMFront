const wrapFront = `
<!DOCTYPE html>
<html>

<head>
  <title>Tokylabs AR</title>
  <script src="/js/aframe.min.js"></script>
  <script src="/js/aframe-ar.js"></script>
  <script src="/js/ar-frontend.js"></script>
  <script src="/js/d3.v5.min.js"></script>
</head>

<body style='margin : 0px; overflow: hidden;'>
  <div class="page-head"></div>
  <a-scene id="ar" embedded arjs='debugUIEnabled: false;' antialias="true">
    <a-assets>
    </a-assets>
    <a-marker-camera type='pattern' url='/media/toky-marker.patt'></a-marker-camera>
  </a-scene>
  <div style="position: fixed; left: 0%; bottom: 10px; width:100%; text-align: center; z-index: 1;color: grey;">
    <div style="color: rgba(0, 0, 0, 0.9); background-color: rgba(127, 127, 127, 0.5); display: inline-block; padding: 0.5em; margin: 0.5em; text-align: left;">
      <a href="${window.location.origin}" style="display: block; color: coral; font-family: monospace; text-decoration: none;">
       Try it yourself with Tokymaker AR
      </a>
    </div>
  </div>
  <script>
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

async function uploadAR(){
  // Get code from the workspace
  // TODO: This takes all the code, so if there are non-AR parts there will
  // be issues
  let runScript = Blockly.JavaScript.workspaceToCode(workspace);

  // This wraps the file in the standard code
  runScript = wrapFront + runScript + wrapBack;
  
  // Converts the script into an html file
  let file = new Blob([runScript], { type: 'text/html' });

  const folderId = await saveDrivePicker('Please pick a place to save your AR experience');
  let fileName = await getFileName();
  await createFile(`${fileName}_experience`, file, folderId, 'html');

  if (arFileID) {
    let qrcode = `${window.location.origin}/ar/v1/experience/${arFileID}`;
    let url = await QRCode.toDataURL(qrcode)
    ARCode = await combineImages(url, "media/toky-marker.jpg");
    imgFile = dataURItoBlob(ARCode);
    await createFile(`${fileName}_qrcode`, imgFile, folderId, 'png');
    viewQR();
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

function viewQR() {
  if (!ARCode) {
    vex.dialog.alert("Please generate AR experience first");
    return;
  }
  vex.dialog.open({
    afterOpen: () => {
      let img = document.createElement('IMG');
      img.src = ARCode;
      let div = document.querySelector('.vex-content');
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
      div.appendChild(img);
    }
  })
}
