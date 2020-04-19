const VERSION = "5.0";
//https://ourcodeworld.com/articles/read/202/how-to-include-and-use-jquery-in-electron-framework
// window.$ = window.jQuery = require('jquery');
// try {$ = jQuery = module.exports;} catch(e) {}


var deviceName = "";

var blocklyArea = document.getElementById("blocklyArea");
var blocklyDiv = document.getElementById("blocklyDiv");

var runButton = document.getElementById("runButton");
var arButton = document.getElementById("arButton");
var arCodeButton = document.getElementById("arCodeButton");

var tokymakerToolbox = document.getElementById("tokymakerToolbox");
var arToolbox = document.getElementById("arToolbox");

var workspace = Blockly.inject(blocklyDiv, {
  comments: true,
  toolbox: tokymakerToolbox,
  collapse: true,
  maxBlocks: Infinity,
  media: "static/media/",
  oneBasedIndex: true,
  scrollbars: true,
  grid: {
    spacing: 36,
    length: 3,
    colour: "#ddd",
    snap: true
  },
  zoom: {
    controls: true,
    wheel: false,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.25,
    scaleSpeed: 1.1
  },
  trashcan: true
});

// outputArea.value = "** " + VERSION + " **" + "\n";

function initApi(interpreter, scope) {
  // Add an API function for the alert() block, generated for "text_print" blocks.
  var wrapper = function(text) {
    text = text ? text.toString() : text === 0 ? "0" : "";
    window.consoleView.appendMsg('\n'+text);
  };
  interpreter.setProperty(
    scope,
    "alert",
    interpreter.createNativeFunction(wrapper)
  );

  // Add an API function for the prompt() block.
  var wrapper = function(text) {
    text = text ? text.toString() : "";
    return interpreter.createPrimitive(prompt(text));
  };
  interpreter.setProperty(
    scope,
    "prompt",
    interpreter.createNativeFunction(wrapper)
  );

  initInterpreterGetInput(interpreter, scope);
  initInterpreterSetOutput(interpreter, scope);
  initInterpreterScreenPrint(interpreter, scope);
  initInterpreterScreenClear(interpreter, scope);
  initInterpreterScreenDrawPixel(interpreter, scope);
  initInterpreterDelay(interpreter, scope);

  // Add an API function for highlighting blocks.
  var wrapper = function(id) {
    id = id ? id.toString() : "";
    return interpreter.createPrimitive(highlightBlock(id));
  };

  interpreter.setProperty(
    scope,
    "highlightBlock",
    interpreter.createNativeFunction(wrapper)
  );
}
/**function**/

var highlightPause = false;
var latestCode = "";

function highlightBlock(id) {
  workspace.highlightBlock(id);
  highlightPause = true;
}

function resetStepUi(clearOutput) {
  workspace.highlightBlock(null);
  highlightPause = false;
  runButton.disabled = "";

  if (clearOutput) {
      window.consoleView.setMsg('Console');
  }
}

var currentTarget = "tokymaker";
/**
 * Backup code blocks to localStorage.
 */
function backup_blocks() {
  if ("localStorage" in window) {
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    window.localStorage.setItem(currentTarget, Blockly.Xml.domToText(xml));
  }
}

/**
 * Restore code blocks from localStorage.
 */
function restore_blocks() {
  if ("localStorage" in window) {
    let xmlStored = window.localStorage.getItem(currentTarget);
    if (xmlStored) {
      var xml = Blockly.Xml.textToDom(xmlStored);
      Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);
    }
  }
}

/**
 * Save Arduino generated code to local file.
 */
function saveCode() {
  var fileName = vex.dialog.prompt({
    message: "What would you like to name your file?",
    placeholder: "Tokymaker Project",
    callback: function(filename) {
      if (fileName) {
        var blob = new Blob([Blockly.Arduino.workspaceToCode()], {
          type: "text/plain;charset=utf-8"
        });
        saveAs(blob, fileName + ".js");
      }
    }
  });
}

/**
 * Load blocks from local file.
 */

function loadLocal(event) {
  var files = event.target.files;
  // Only allow uploading one file.
  if (files.length != 1) {
    return;
  }

  // FileReader
  var reader = new FileReader();
  reader.onloadend = function(event) {
    var target = event.target;
    // 2 == FileReader.DONE
    if (target.readyState == 2) {
      try {
        var xml = Blockly.Xml.textToDom(target.result);
      } catch (e) {
        vex.dialog.alert("Error parsing XML:" + e);
        return;
      }
      var count = Blockly.mainWorkspace.getAllBlocks().length;

      if (count) {
        vex.dialog.confirm({
          message: "Replace or Merge existing blocks?",
          buttons: [
            $.extend({}, vex.dialog.buttons.YES, { text: "Replace" }),
            $.extend({}, vex.dialog.buttons.NO, { text: "Merge" })
          ],
          callback: function(value) {
            if (value) {
              Blockly.mainWorkspace.clear();
            }

            Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);
          }
        });
      } else {
        Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);
      }
    }
    // Reset value of input after loading because Chrome will not fire
    // a 'change' event if the same file is loaded again.
    document.getElementById("load").value = "";
  };
  reader.readAsText(files[0]);
}

/**
 * Save blocks to local file.
 * better include Blob and FileSaver for browser compatibility
 */
function saveLocal() {
  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var data = Blockly.Xml.domToText(xml);

  vex.dialog.prompt({
    message: "What would you like to name your file?",
    placeholder: "Tokymaker Project",
    callback: function(fileName) {
      if (fileName) {
        var blob = new Blob([data], { type: "text/xml" });
        saveAs(blob, fileName + ".xml");
      }
    }
  });
}

function saveFile() {
  if (isEnglish) {
    vex.dialog.confirm({
      message: "Where do you want to save?",
      focusFirstInput: false,
      showCloseButton: true,
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, {
          text: "Computer",
          click: saveLocal
        }),
        $.extend({}, vex.dialog.buttons.YES, {
          text: "Google Drive",
          click: () => saveToDrive(blocklyFileID)
        })
      ],
      callback: () => {
        return;
      }
    });
  } else {
    saveLocal();
  }
}

function openLocal() {
  var loadInput = document.getElementById("load");
  loadInput.click();
}

function openFile() {
  if (isEnglish) {
    vex.dialog.confirm({
      message: "Where do you want to load from?",
      focusFirstInput: false,
      showCloseButton: true,
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, {
          text: "Computer",
          click: openLocal
        }),
        $.extend({}, vex.dialog.buttons.YES, {
          text: "Google Drive",
          click: openFromDrivePicker
        })
      ],
      callback: () => {
        return;
      }
    });
  } else {
    openLocal();
  }
}

/**
 * Discard all blocks from the workspace.
 */
function discard() {
  var count = Blockly.mainWorkspace.getAllBlocks().length;

  if (count < 2) {
    Blockly.mainWorkspace.clear();
  } else {
    vex.dialog.confirm({
      message: "Delete all blocks?",
      callback: function(value) {
        if (value) {
          Blockly.mainWorkspace.clear();
        }
      }
    });
  }
}

function undo() {
  Blockly.mainWorkspace.undo(false);
}

function redo() {
  Blockly.mainWorkspace.undo(true);
}

var isCtrlShow = false;

function toggleShowCtrl(e) {
  var gameCtrl = document.querySelector(".game-control-mask");
  if (!isCtrlShow) {
    if (!bleVue.$data.connected) {
      vex.dialog.alert("Connect BLE at first!");
      return;
    }

    gameCtrl.classList.add("show");
    isCtrlShow = !isCtrlShow;
  } else {
    gameCtrl.classList.remove("show");
    isCtrlShow = !isCtrlShow;
  }
}

var shopBannerMask = document.querySelector(".shop-banner-mask");

function closeShopBanner(e) {
  var shopBannerMask = document.querySelector(".shop-banner-mask");

  shopBannerMask.classList.remove("show");

  // console.log("close banner");
}

/**game controller**/
/*Keep the id of Object as same as the Blocks. the maximum id < the gen_device.cpp in firmware as follows:
#define REMOTE_BTN_NUM 8
#define REMOTE_SLIDER_NUM 3
**/
const REMOTE_BTN_A = 0;
const REMOTE_BTN_B = 1;
const REMOTE_BTN_UP = 2;
const REMOTE_BTN_DOWN = 3;
const REMOTE_BTN_LEFT = 4;
const REMOTE_BTN_RIGHT = 5;

const REMOTE_SLIDER_A = 0;
const REMOTE_SLIDER_B = 1;

const STATE_PRESS = 0; //keep same as remote.h
const STATE_RELEASE = 1;

var BleWriteQueue = [];

function configCtrlEvent() {
  var leftBtn = document.querySelector("#leftBtn");
  leftBtn.onmousedown = leftBtn.ontouchstart = function() {
    // console.log("LeftDown");

    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_LEFT;
    Data[1] = STATE_PRESS;

    makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);
    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };

  leftBtn.onmouseup = leftBtn.ontouchend = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_LEFT;
    Data[1] = STATE_RELEASE;

    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };

  var rightBtn = document.querySelector("#rightBtn");
  rightBtn.onmousedown = rightBtn.ontouchstart = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_RIGHT;
    Data[1] = STATE_PRESS;

    makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);
    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };
  rightBtn.onmouseup = rightBtn.ontouchend = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_RIGHT;
    Data[1] = STATE_RELEASE;

    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };

  var topBtn = document.querySelector("#topBtn");
  topBtn.onmousedown = topBtn.ontouchstart = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_UP;
    Data[1] = STATE_PRESS;

    makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);
    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };

  topBtn.onmouseup = topBtn.ontouchend = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_UP;
    Data[1] = STATE_RELEASE;

    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };

  var bottomBtn = document.querySelector("#bottomBtn");
  bottomBtn.onmousedown = bottomBtn.ontouchstart = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_DOWN;
    Data[1] = STATE_PRESS;

    makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);
    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };
  bottomBtn.onmouseup = bottomBtn.ontouchend = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_DOWN;
    Data[1] = STATE_RELEASE;

    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };

  var rangeA = document.querySelector("#rangeA");
  rangeA.oninput = function(e) {
    // console.log('a=',e.target.value);
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_SLIDER_A;
    Data[1] = e.target.value; //[0,100]

    Frame = makeBleFrame(FUNC_CMD_REMOTE_SLIDER, Data);

    sendSingleData(Frame);
  };

  var rangeB = document.querySelector("#rangeB");
  rangeB.oninput = function(e) {
    // console.log('b=',e.target.value);
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_SLIDER_B;
    Data[1] = e.target.value; //[0,100]

    Frame = makeBleFrame(FUNC_CMD_REMOTE_SLIDER, Data);

    sendSingleData(Frame);
  };

  var btnA = document.querySelector("#btnA");
  btnA.onmousedown = btnA.ontouchstart = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_A;
    Data[1] = STATE_PRESS;

    makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);
    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };
  btnA.onmouseup = btnA.ontouchend = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_A;
    Data[1] = STATE_RELEASE;

    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };

  var btnB = document.querySelector("#btnB");
  btnB.onmousedown = btnB.ontouchstart = function() {
    // console.log("btnB");
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_B;
    Data[1] = STATE_PRESS;

    makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);
    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };
  btnB.onmouseup = btnB.ontouchend = function() {
    var Data = new Uint8Array(2);

    Data[0] = REMOTE_BTN_B;
    Data[1] = STATE_RELEASE;

    Frame = makeBleFrame(FUNC_CMD_REMOTE_BTN, Data);

    sendSingleData(Frame);
  };
}

configCtrlEvent();

/*
 * auto save and restore blocks
 */
function auto_save_and_restore_blocks() {
  // Restore saved blocks in a separate thread so that subsequent
  // initialization is not affected from a failed load.
  window.setTimeout(restore_blocks, 0);
  // Hook a save function onto unload.
  bindEvent(window, "unload", backup_blocks);
  //tabClick(selected);

  // Init load event.
  var loadInput = document.getElementById("load");
  loadInput.addEventListener("change", loadLocal, false);
}

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {!Function} func Function to call when event is triggered.
 *     W3 browsers will call the function with the event object as a parameter,
 *     MSIE will not.
 */
function bindEvent(element, name, func) {
  if (element.addEventListener) {
    // W3C
    element.addEventListener(name, func, false);
  } else if (element.attachEvent) {
    // IE
    element.attachEvent("on" + name, func);
  }
}

/*JS二进制 https://www.cnblogs.com/SolarWings/p/6262932.html*/

/**offline
 1 byte: Frame head = command
 2 bytes: the length of Frame content
 2 bytes: the ~length of Frame content
 n bytes: Frame content
 **/

const FUNC_CMD_BASE = 0x80;
const FUNC_CMD_REMOTE_BTN = FUNC_CMD_BASE + 0;
const FUNC_CMD_REMOTE_SLIDER = FUNC_CMD_BASE + 1;

const TRANSCATION_BASE = 0xf0;
const TRANSCATION_LOADCODE = TRANSCATION_BASE + 1;

function makeBleFrame(command, data) {
  var headerLen = 5;

  dataLen = data.length;
  FrameBuffer = new ArrayBuffer(headerLen + dataLen);

  var Frame = new DataView(FrameBuffer);
  var FrameData = new Uint8Array(FrameBuffer, headerLen);

  index = 0;
  Frame.setUint8(index, command);
  index++;
  Frame.setUint16(index, dataLen, false);
  index += 2;
  Frame.setUint16(index, ~dataLen, false);

  FrameData.set(data);

  return new Uint8Array(FrameBuffer);
}

var runBtnClass = document.querySelector("#runButton i");

/**getcode and send**/
var BLE_sendIndex;
var BLE_sendBuffer = new Uint8Array();

var getInfoIntervalHandle = null;
var isBleRead = false;
window.isUploading = false;

function upload() {
  if (window.isUploading) {
    return;
  }

  if ("*" == deviceName.substr(0, 1)) {
    vex.dialog.alert("The Tokymaker is in Upload Protection state!");
    return;
  }

  runScript = Blockly.Arduino.workspaceToCode(workspace);

  // console.log("script length=",runScript.length, runScript[1]);

  runButton.disabled = true; //todo no effect

  if (!bleVue.$data.connected) {
    vex.dialog.alert("Connect BLE at first!");
    return;
  }

  window.isUploading = true;

    window.consoleView.setMsg("Compiling...");

  // sendToBluetoothDevice();
  // ref:  https://segmentfault.com/a/1190000004322487
  $.get("/sendCode/", { code: runScript }, function(hexa) {
    // console.log("Id of compiled code " + hexa);
    try {
      var request = new XMLHttpRequest();
      request.open("GET", "/getHex/" + hexa, true);
      request.responseType = "arraybuffer";

      request.onload = function() {

        if (this.status == 200 || this.status == 304) {
          var arrayBuffer = request.response;
          codeData = new Uint8Array(arrayBuffer);

          BLE_sendBuffer = makeBleFrame(TRANSCATION_LOADCODE, codeData);

          BLE_sendIndex = 0;

          uploadInfoDiv.classList.remove('success');
          uploadInfoDiv.classList.remove('failure');
          uploadInfoDiv.classList.add('uploadprogress');

          return new Promise(function(resolve, reject) {
            sendNextDataBatch(resolve, reject);
          });
        } else {
          window.consoleView.setMsg("Compilation Failed!");
          window.isUploading = false;
          uploadInfoDiv.classList.remove('uploadprogress');
          uploadInfoDiv.classList.add('failure');
        }
      };

      request.onerror = function(err) {
        // console.error(err);
        window.consoleView.setMsg("Compilation Failed!");
        window.isUploading = false;
        uploadInfoDiv.classList.remove('uploadprogress');
        uploadInfoDiv.classList.add('failure');
      };

      request.send();
    } catch (err) {
      // console.error(err);
      window.consoleView.setMsg("Compilation Failed!");
      window.isUploading = false;
      uploadInfoDiv.classList.remove('uploadprogress');
      uploadInfoDiv.classList.add('failure');
    }
  }).fail(function() {
    window.isUploading = false;
    window.consoleView.setMsg("Get URL failed!");
    uploadInfoDiv.classList.remove('uploadprogress');
    uploadInfoDiv.classList.add('failure');
  });
}

var chunkSize = 512;

var uploadInfoDiv = document.querySelector('#uploadInfoDiv');
var uploadProgress = document.querySelector('#uploadInfoDiv .uploadprogress');

function sendNextDataBatch(resolve, reject) {
  // Can only write 512 bytes at a time to the characteristic
  // Need to send the image data in 512 byte batches
  if (BLE_sendIndex + chunkSize < BLE_sendBuffer.length) {
    let slicedData = BLE_sendBuffer.slice(
      BLE_sendIndex,
      BLE_sendIndex + chunkSize
    );
    if (bleVue.$data.isiOS) {
      //todo, change to syn
      bleVue.webkitSendData(slicedData);
      BLE_sendIndex += chunkSize;
      let progress = Math.floor((BLE_sendIndex * 1000.0) / BLE_sendBuffer.length) / 10.0 ;
      window.consoleView.setMsg("Send " + progress + "%");
      uploadProgress.innerHTML = progress+'%';

      sendNextDataBatch(resolve, reject);
    } else {
      bleVue.$data.cachedBLEcharacteristic
        .writeValue(slicedData)
        .then(() => {
          BLE_sendIndex += chunkSize;
          // console.log("Data Transfer Progress : " + Math.floor(BLE_sendIndex*1000.0/BLE_sendBuffer.length)/10.0 + "%");
          let progress = Math.floor((BLE_sendIndex * 1000.0) / BLE_sendBuffer.length) / 10.0 ;
          window.consoleView.setMsg("Send " + progress + "%");
          uploadProgress.innerHTML = progress+'%';
          sendNextDataBatch(resolve, reject);
        })
        .catch(error => {
          reject(error);
          window.consoleView.setMsg("BLE error");
          uploadInfoDiv.classList.remove('uploadprogress');
          uploadInfoDiv.classList.add("failure");
          window.isUploading = false;
        });
    }
  } else {
    // Send the last bytes
    var result = "100%";
    if (BLE_sendIndex < BLE_sendBuffer.length) {
      let slicedData = BLE_sendBuffer.slice(
        BLE_sendIndex,
        BLE_sendBuffer.length
      );
      if (bleVue.$data.isiOS) {
        bleVue.webkitSendData(slicedData);
      } else {
        bleVue.$data.cachedBLEcharacteristic
          .writeValue(slicedData)
          .then(resolve)
          .catch(error => {
            reject(error);
            result = "BLE error";
          });
      }
    } else {
      resolve();
    }

    window.consoleView.setMsg(result);
    window.isUploading = false;

    uploadInfoDiv.classList.remove("uploadprogress");
    if (result == "100%") {
      uploadInfoDiv.classList.add("success");
    } else {
      uploadInfoDiv.classList.add("failure");
    }
  }
}

function sendSingleData(Frame) {
  bleVue.sendData(Frame);
}


var preIsolateEvent = null;

function postChange(event) {
  // console.log(event);
  // console.log(event.type);
  // deal replace block.  or there are many isolate blocks on workspace.
  if (event.type == Blockly.Events.MOVE) {

    if (
      typeof event.newParentId != "undefined" &&
      typeof event.oldParentId == "undefined"
    ) {
      //new event

      if (null != preIsolateEvent) {
        if (
          event.blockId != preIsolateEvent.blockId &&
          event.newParentId == preIsolateEvent.oldParentId &&
          event.newInputName == preIsolateEvent.oldInputName
        ) {
          var isolatedBlock = Blockly.mainWorkspace.getBlockById(
            preIsolateEvent.blockId
          );
          isolatedBlock.dispose();
        }
      }

      preIsolateEvent = null;
    } else if (
      typeof event.newParentId == "undefined" &&
      typeof event.oldParentId != "undefined"
    ) {
      //isolate event
      preIsolateEvent = event;
    } else {
      preIsolateEvent = null;
    }




  } else {
    preIsolateEvent = null;
  }


  if ((event.type == Blockly.Events.MOVE) || (event.type == Blockly.Events.DELETE) ) {
    //show JS code
    var code;
    if ( "tokymaker" == currentTarget ){
      code = Blockly.arduinoJS.workspaceToCode(workspace);
    } else {
      code = Blockly.JavaScript.workspaceToCode(workspace);
    }

    window.setJs(code);
  }



}

// window.librariesToAdd = "";

window.addEventListener("resize", onresize, false);

workspace.addChangeListener(postChange);

auto_save_and_restore_blocks();

// onresize();

function hasClass(ele, cls) {
  return ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

function addClass(ele, cls) {
  if (!this.hasClass(ele, cls)) ele.className += " " + cls;
}

function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    ele.className = ele.className.replace(reg, "");
  }
}

var isExpand = false;

onload = function() {
  Blockly.svgResize(workspace);
  var debugWin = document.getElementById("debug-win");
  var debugBtn = document.getElementById("debug-btn");
  var debugText = document.querySelector("#debug-win pre");
  debugBtn.onclick = function() {
    if (isExpand) {
      // debugWin.style.height = "40px"
      removeClass(debugWin, "expand");
      removeClass(debugBtn, "fa fa-hand-o-down");
      addClass(debugBtn, "fa fa-hand-o-up");
    } else {
      // debugWin.style.height = "50%"
      addClass(debugWin, "expand");
      removeClass(debugBtn, "fa fa-hand-o-up");
      addClass(debugBtn, "fa fa-hand-o-down");
    }
    isExpand = !isExpand;
  };
};

const SERVICE_UUID = 0x00ee;
const CHAR_UUID = 0xee01;
const service_uuid_str = "00EE";
const char_uuid_str = "EE01";

var decoder = new TextDecoder("utf-8");

var bleVue = new Vue({
  data: {
    connected: false,
    device: null,
    devicesAlreadyFound: [], //{name: 'Tokymaker1', select: 1, rssi : 33},{name: 'Tokymaker2', select: 2, rssi : 33}
    cachedBLEcharacteristic: null,
    environment: "browser",
    showList: false,
    delayCnt: 0,
    writeQueue: [],
    isDealData: false,
    bluetooth: null,

    isiOS:
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.AppModel,
    data: "",
    promiseId: 1,
    promises: {}
  },
  el: "#bleVueContainer",
  template: `
    <div @click="controlBle()">

        <div class="item" id="pairBluetooth" title="connect to Tokymaker">
            <i class="fa fa-bluetooth-b" aria-hidden="true" :class="{bleConnected : connected}"></i>
        </div>
        <div v-show="showList" class="deviceList">
            <span v-if="devicesAlreadyFound.length==0" @click.stop.prevent="selectDevice(-1)">No device found</span>
            <ul id="devices">
                <li id="deviceItem" v-for="(device, index) in devicesAlreadyFound" @click.stop.prevent="selectDevice(index)">
                    {{device.name}}
                </li>
            </ul>
        </div>

    </div>
    `,
  created() {
    if (this.isiOS) {
      window.bleResolve = (promiseId, status) => {
        if (status == "true") {
          this.promises[promiseId].resolve(true);
        } else {
          this.promises[promiseId].resolve(false);
        }
        // this.promises[promiseId].reject(success)
        delete this.promises[promiseId];
      };

      window.bleGetData = data => {
        window.consoleView.appendMsg(data, true);
      };

      window.bleRequestDevice = (service, characteristic) => {
        return new Promise((resolve, reject) => {
          var pid = ++this.promiseId;
          this.promises[pid] = { resolve, resolve };
          try {
            window.webkit.messageHandlers.AppModel.postMessage({
              type: "requestDevice",
              pid,
              service,
              characteristic
            });
          } catch (e) {
            console.log(e);
          }
        });
      };

      window.onBleDisconnected = () => {
        this.onDisconnected();
      };

      window.bleDisConnect = () => {
        this.connected = false;
        try {
          window.webkit.messageHandlers.AppModel.postMessage({
            type: "disConnect"
          });
        } catch (e) {
          console.log(e);
        }
      };

      window.bleReadData = () => {
        window.webkit.messageHandlers.AppModel.postMessage({
          type: "readData"
        });
      };

      window.bleSendData = data => {
        let b64encoded = window.btoa(String.fromCharCode.apply(null, data));
        window.webkit.messageHandlers.AppModel.postMessage({
          type: "sendData",
          data: b64encoded
        });
      };
      window.bleSendString = data => {
        window.webkit.messageHandlers.AppModel.postMessage({
          type: "sendString",
          data: data
        });
      };

      window.setInterval(window.bleReadData, 1000);
    } else {
      if (window.process) {
        this.environment = "electron"; ////////////////////////////// Cordova code would allow another environment.
      }
      window.setInterval(this.getInfoFromDevice, 1000);

      if (this.environment == "browser") {
        this.bluetooth = navigator.bluetooth;
      } else {
        var webbluetooth = require("webbluetooth");
        this.devicesAlreadyFound = [];
        this.bluetooth = new webbluetooth.Bluetooth({
          deviceFound: this.handleDeviceFound
        });
      }
    }
  },
  methods: {
    onDisconnected: function() {
      console.log("BLE is disconnected.");

      this.cachedBLEcharacteristic = null;
      this.device = null;
      this.connected = false;
      document.getElementById(
        "pairBluetooth"
      ).style.color = pairBleOriginalColor;
      document.getElementById("pairBluetooth").title = "connect to Tokymaker";

      if (isCtrlShow) {
        vex.dialog.alert("BLE is broken!");
        var gameCtrl = document.querySelector(".game-control-mask");

        gameCtrl.classList.remove("show");
        isCtrlShow = !isCtrlShow;
      }
    },
    getInfoFromDevice: function() {
      if (this.connected) {
        if (!window.isUploading) {
          this.delayCnt++;
        } else {
          this.delayCnt = 0;
        }

        if (this.isDealData) return;

        //delayCnt to prevent the confict after uploaded

        if (this.delayCnt > 1 && this.cachedBLEcharacteristic) {
          this.delayCnt = 2;
          this.isDealData = true;
          this.cachedBLEcharacteristic
            .readValue()
            .then(value => {
              var byteBuff = value.buffer;
              var newInfoLen = byteBuff.byteLength;
              if (newInfoLen > 0) {
                window.consoleView.appendMsg(decoder.decode(byteBuff), true);
              }
              this.isDealData = false;
            })
            .catch(err => {
              console.log(err);
              this.isDealData = false;
            });
        }
      }
    },
    sendData(Frame) {
      if (this.isiOS) {
        this.webkitSendData(Frame);
      } else {
        if (window.isUploading) return;

        if (!this.cachedBLEcharacteristic) return;
        if (Frame.length > 512) return;

        this.writeQueue.push(Frame);

        if (!this.isDealData) {
          this.isDealData = true;
          this.dealBleWriteQueue();
        }
      }
    },
    webkitSendData(Frame) {
      window.bleSendData(Frame);
    },
    dealBleWriteQueue() {
      var Frame = this.writeQueue.shift();
      // console.log(Frame);

      this.cachedBLEcharacteristic
        .writeValue(Frame)
        .then(() => {
          // console.log("Sent");
          if (this.writeQueue.length > 0) {
            this.dealBleWriteQueue();
          } else {
            this.isDealData = false;
          }
        })
        .catch(err => {
          console.log(err);
          if (this.writeQueue.length > 0) {
            this.dealBleWriteQueue();
          } else {
            this.isDealData = false;
          }
        });
    },
    controlBle() {
      if (this.isiOS) {
        if (this.connected) {
          window.bleDisConnect();
          this.onDisconnected();
        } else {
          window
            .bleRequestDevice(service_uuid_str, char_uuid_str)
            .then(status => {
              if (status) {
                this.connected = true;
                console.log("Connected to the sweeeet ESP32");
                document.getElementById("pairBluetooth").style.color =
                  "rgba(58,178,199,1)";
              } else {
                this.connected = false;
              }
            })
            .catch(err => {
              window.console.log(err);
              this.connected = false;
            });
        }
      } else {
        if (!this.cachedBLEcharacteristic) {
          this.connectToDevice();
        } else {
          this.device.gatt.disconnect();
          this.onDisconnected();
        }
      }
    },
    connectToDevice() {
      if (this.environment != "browser") {
        this.showList = true;
      }
      this.bluetooth
        .requestDevice({
          filters: [
            {
              services: [SERVICE_UUID]
            }
          ]
        })
        .then(device => {
          deviceName = device.name;
          console.log("> Connected to " + deviceName);
          // device.name is usually of the form 'Tokymaker2   .0-#########'
          var regexp = /[0-9]+\.[0-9]/;
          var deviceVersion = deviceName.match(regexp);
          var deviceMajorVersion = deviceVersion.toString().match(/[0-9]+/);
          if (deviceVersion == VERSION) {
            this.device = device;
            this.connected = true;
            device.addEventListener(
              "gattserverdisconnected",
              this.onDisconnected
            );
            document.getElementById("pairBluetooth").title = deviceName;

            return device.gatt.connect();
          } else if (4 == deviceMajorVersion) {
            vex.dialog.alert(
              "Firmware V" +
                deviceVersion +
                " is incompatible with the Web V" +
                VERSION +
                "!  Please contact supplier."
            );
            return Promise.reject("OldFirmware");
          } else if (deviceMajorVersion) {
            vex.dialog.alert(
              "Firmware V" +
                deviceVersion +
                " is incompatible with the Web V" +
                VERSION +
                "!  Please use " +
                urlHost +
                "/V" +
                deviceMajorVersion
            );
            return Promise.reject("OldFirmware");
          } else {
            vex.dialog.alert(
              "Firmware is incompatible with the Web V" +
                VERSION +
                "!  Please check Tokymaker "
            );
          }
        })
        .then(server => server.getPrimaryService(SERVICE_UUID))
        .then(service => service.getCharacteristics())
        .then(characteristics => {
          this.cachedBLEcharacteristic = characteristics[0];
          console.log("Connected to the sweeeet ESP32");
          document.getElementById("pairBluetooth").style.color =
            "rgba(58,178,199,1)";
        })
        .catch(err => console.log(err));
    },
    handleDeviceFound(newDevice, confirmConnectFunction) {
      var deviceInTheList = this.devicesAlreadyFound.filter(
        e => newDevice.name == e.name
      )[0];
      console.log("deviceInTheList=" + deviceInTheList);
      if (deviceInTheList) {
        deviceInTheList.rssi = newDevice.adData.rssi;
        deviceInTheList.select = confirmConnectFunction;
      } else {
        this.devicesAlreadyFound.push({
          name: newDevice.name,
          select: confirmConnectFunction,
          rssi: newDevice.adData.rssi
        });
      }
    },
    selectDevice(index) {
      this.showList = false;

      if (index < 0) return;

      this.devicesAlreadyFound[index].select();
      this.devicesAlreadyFound = [];
    }
  }
});

function gotoIfttt() {
  window.open("https://ifttt.com/");
}

function gotoIoAdafruit() {
  window.open("https://io.adafruit.com/");
}

var bleButton = document.getElementById("pairBluetooth");
var gamePadButton = document.getElementById("gamePad");

function targetSelect() {
  let targetSelect = document.getElementById("targetSelect");
  let target = targetSelect.options[targetSelect.selectedIndex].value;
  switchTarget(target);
}

function switchTarget(target) {
  backup_blocks();
  currentTarget = target;
  Blockly.mainWorkspace.clear();

  gamePadButton.style.display = "none";
  bleButton.style.display = "none";
  runButton.style.display = "none";
  arButton.style.display = "none";
  arCodeButton.style.display = "none";

  window.setJs("");

  switch (target) {
    case "tokymaker":
      gamePadButton.style.display = "";
      bleButton.style.display = "";
      runButton.style.display = "";
      window.consoleView.enable();
      workspace.updateToolbox(tokymakerToolbox);
      break;
    case "ar":
      arButton.style.display = "";
      arCodeButton.style.display = "";
      window.consoleView.disable();
      workspace.updateToolbox(arToolbox);
      break;
    default:
      throw new Error("Trying to switch to unknown device");
  }

  restore_blocks();
}


workspace.registerButtonCallback("key_gotoIfttt", gotoIfttt);
workspace.registerButtonCallback("key_gotoIoAdafruit", gotoIoAdafruit);

let pairBleOriginalColor = document.getElementById("pairBluetooth").style.color;

if (window.location.protocol === 'https:') {
  shopBannerMask.classList.add("show");
}

//Tabs functionality
window.onload = function() {
  // By default open Help tab
  $("#v-pills-home-tab").click();

  // hide the original console
  // $("#debug-win").hide()
  var wwidth = $(window).width();
  var wheight = $(window).height();

  var isMobile = false; //initiate as false
  // device detection
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  ) {
    isMobile = true;
  }

  window.wwidth = wwidth;
  window.wheigth = wheight;

  if (isMobile) {
    horizontal_tabs(wwidth, wheight);
  } else {
    vertical_tabs(wwidth, wheight);
  }
  //
  // console.log(window.vue)
  // window.vue.$children[0].$children[1].isShow = false
};

var tabState = "";

function closeTab(evt) {
  if (tabState != "hide") {
    // console.log(tabState)
    $("#tabContent").hide();
    tabState = "hide";
  }
}

function showTab(evt) {
  if (tabState != "show") {
    // console.log(tabState)
    $("#tabContent").show();
    tabState = "show";
  } else {
    $("#tabContent").hide();
    tabState = "hide";
  }
}



/////////////////////////
function isChrome(evt) {
  // IsChrome
  var isChromium = window.chrome;
  var winNav = window.navigator;
  var vendorName = winNav.vendor;
  var isOpera = typeof window.opr !== "undefined";
  var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
  var isIOSChrome = winNav.userAgent.match("CriOS");

  if (isIOSChrome) {
    // is Google Chrome on IOS
  } else if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
  ) {
    // is Google Chrome
    console.log("is Google Chrome");
  } else {
    // not Google Chrome
    $("#noChrome").modal("show");
  }
}

$("#pairBluetooth").on("click", function() {
  if (!bleVue.$data.isiOS) {
    isChrome();
  }
});

// Detect orientation
window.addEventListener("orientationchange", function() {
  if (window.matchMedia("(orientation: portrait)").matches) {
    // you're in PORTRAIT mode

    wwidth = $(window).height();
    wheight = $(window).width();

    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        navigator.userAgent.substr(0, 4)
      )
    ) {
      isMobile = true;
    }
    if (isMobile) {
      vertical_tabs(wwidth, wheight);
    } else {
      horizontal_tabs(wwidth, wheight);
    }
  }

  if (window.matchMedia("(orientation: landscape)").matches) {
    // you're in LANDSCAPE mode
    wwidth = $(window).height();
    wheight = $(window).width();

    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        navigator.userAgent.substr(0, 4)
      )
    ) {
      isMobile = true;
    }
    if (isMobile) {
      horizontal_tabs(wwidth, wheight);
    } else {
      vertical_tabs(wwidth, wheight);
    }
  }
});

// Convert horizontal tabs
function horizontal_tabs(wwidth, wheight) {
  //container
  $("#tabcontainer")
    .addClass("tabhorizontal")
    .removeClass("tabvertical");

  $("div.row")
    .addClass("col")
    .removeClass("row");
  $("#col1")
    .addClass("row")
    .removeClass("col");
  $("div.col-px10")
    .addClass("row-px10")
    .removeClass("col-px10");
  $("div.col-8")
    .addClass("row-8")
    .removeClass("col-8");
  $("div.flex-column")
    .addClass("flex-row")
    .removeClass("flex-column");
  $("a.nav-link").removeClass("vertical");

  $("#v-pills-home")
    .addClass("contenthorizontal")
    .removeClass("contentvertical");
  $("#v-pills-profile")
    .addClass("contenthorizontal")
    .removeClass("contentvertical");

  $(".tabhorizontal").css("padding-left", $(".blocklyToolboxDiv").width() + 3);

  var tabwidth = wwidth - $(".blocklyToolboxDiv").width() - 3;
  var tabheight = (wheight - 74) * 0.5;
  // console.log(tabheight)

  $("#v-pills-tabContent").css("height", "");
  // $('#v-pills-tabContent').css("width", tabwidth)

  $(".contenthorizontal").css("width", "");
  $(".contenthorizontal").css("height", tabheight);
  $(".carousel-control-next-icon").removeClass("fixarrow");
  $(".carousel-control-prev-icon").removeClass("fixarrow");
}

function vertical_tabs(wwidth, wheight) {
  //container
  $("#tabcontainer")
    .addClass("tabvertical")
    .removeClass("tabhorizontal");

  $("div.col")
    .addClass("row")
    .removeClass("col");
  $("#col1")
    .addClass("col")
    .removeClass("row");
  $("div.row-px10")
    .addClass("col-px10")
    .removeClass("row-px10");
  $("div.row-8")
    .addClass("col-8")
    .removeClass("row-8");
  $("div.flex-row")
    .addClass("flex-column")
    .removeClass("flex-row");

  $("#v-pills-home")
    .addClass("contentvertical")
    .removeClass("contenthorizontal");
  $("#v-pills-profile")
    .addClass("contentvertical")
    .removeClass("contenthorizontal");
  // $('#v-pills-tabContent').addClass('tabcontentvertical').removeClass('tabcontenthorizontal');

  $("a.nav-link").addClass("vertical");
  // console.log("vertical_tabs")

  var tabheight = wheight - parseInt($(".tabvertical").css("padding-top"));
  var tabwidth = wwidth * 0.3;

  $("#v-pills-tabContent").css("width", "");
  $("#v-pills-tabContent").css("height", tabheight);

  $(".contentvertical").css("height", "");

  if (tabwidth > 400) {
    tabwidth = 400;
  }
  $(".contentvertical").css("width", tabwidth);

  $(".carousel-control-next-icon").addClass("fixarrow");
  $(".carousel-control-prev-icon").addClass("fixarrow");
}

// Convert Carrousel into slides finish last picture
$("#carouselExampleControls").on("slid", "", checkitem); // on caroussel move
$("#carouselExampleControls").on("slid.bs.carousel", "", checkitem); // on carousel move

$(document).ready(function() {
  // on document ready
  checkitem();
});

function checkitem() {
  // check function
  var $this = $("#carouselExampleControls");
  if ($(".carousel-inner .carousel-item:first").hasClass("active")) {
    $(".carousel-control-prev").hide();
    $(".carousel-control-next").show();
  } else if ($(".carousel-inner .carousel-item:last").hasClass("active")) {
    $(".carousel-control-prev").show();
    $(".carousel-control-next").hide();
  } else {
    $(".carousel-control-prev").show();
    $(".carousel-control-next").show();
  }
}


$(".switch-btn").on("click", function () {
    if ($(".switch-btn").hasClass("active")) {
        $(".switch-btn").removeClass("active")
      $(".btnBox1").removeClass("show")
      $(".btnBox2").addClass("show")
    } else {
      $(".switch-btn").addClass("active")
      $(".btnBox1").addClass("show")
      $(".btnBox2").removeClass("show")

    }

})
