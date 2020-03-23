Blockly.Blocks['ar_text_create'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Create TEXT Element");
    this.appendValueInput("ID")
      .setCheck("String")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("with ID");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['ar_text_create'] = function(block) {
  var value_id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `await setupText(${value_id});\n`;
  return code;
};

Blockly.Blocks['ar_text_update'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Set TEXT element");
    this.appendValueInput("ID")
      .setCheck("String")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("with ID");
    this.appendValueInput("STRING")
      .setCheck("String")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("to string");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['ar_text_update'] = function(block) {
  var value_id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  var value_string = Blockly.JavaScript.valueToCode(block, 'STRING', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `await updateText(${value_id}, ${value_string});\n`;
  return code;
};

Blockly.Blocks['iot_feed'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Get data from /")
      .appendField(new Blockly.FieldTextInput("user"), "USER")
      .appendField(" /")
      .appendField(new Blockly.FieldTextInput("feed"), "FEED");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("IoT Feed");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['iot_feed'] = function(block) {
  var text_user = block.getFieldValue('USER');
  var text_feed = block.getFieldValue('FEED');

  var code = `((await (await fetch('https://io.adafruit.com/api/v2/` + text_user + `/feeds/` + text_feed + `/data')).json())[0].value)`;
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
};

Blockly.Blocks['ar_graph_create'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Create GRAPH element")
    this.appendValueInput("ID")
      .setCheck("String")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("with ID");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("AR Graph");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['ar_graph_create'] = function(block) {
  var value_id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `await setupGraph(${value_id});\n`;
  return code;
};

Blockly.Blocks['ar_graph_update'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Set GRAPH element");
    this.appendValueInput("ID")
      .setCheck("String")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("with ID");
    this.appendDummyInput()
      .appendField(" to get data from /")
      .appendField(new Blockly.FieldTextInput("user"), "USER")
      .appendField(" /")
      .appendField(new Blockly.FieldTextInput("feed"), "FEED")
      .appendField(" - With: ")
      .appendField(new Blockly.FieldTextInput("Title"), "TITLE")
      .appendField(new Blockly.FieldTextInput("X Axis Lable"), "XLABLE")
      .appendField(new Blockly.FieldTextInput("Y Axis Lable"), "YLABLE");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("AR Graph");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['ar_graph_update'] = function(block) {
  var id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  var user = block.getFieldValue('USER');
  var feed = block.getFieldValue('FEED');
  var text_title = block.getFieldValue('TITLE');
  var text_xlable = block.getFieldValue('XLABLE');
  var text_ylable = block.getFieldValue('YLABLE');

  var code = `await updateGraph(${id}, "${user}", "${feed}", "${text_title}", "${text_xlable}", "${text_ylable}");\n`;
  return code;
};


var renderFiles = {};
var fileSelectIsOpen = false;

Blockly.Blocks['ar_model_create'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Create 3D MODEL element")
    this.appendValueInput("ID")
      .setCheck("String")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("with ID");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("AR Graph");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['ar_model_create'] = function(block) {
  var value_id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `await setup3DModel(${value_id});\n`;
  return code;
};

function saveRenderFile(srcId, component) {
  var file = $(srcId).prop('files')[0];
  var blockId = $('#blockId').val();

  if (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      renderFiles[blockId][component] = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

Blockly.Blocks['ar_model_update'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Update 3D MODEL element")
    this.appendValueInput("ID")
      .setCheck("String")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("with ID");
    this.appendDummyInput()
      .appendField('Click to set files');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("AR Graph");
    this.setHelpUrl("Image textures currently unsupported");
    this.setOnChange((event) => {
      if (!event.element || event.element !== 'click') return;
      if (fileSelectIsOpen) return;
      fileSelectIsOpen = true;
      renderFiles[event.blockId] = { obj: null, mtl: null };
      vex.dialog.open({
        message: 'Please select your OBJ and MTL files.',
        input: [
          '<style>',
          '.vex-custom-field-wrapper {',
          'margin: 1em 0;',
          '}',
          '.vex-custom-field-wrapper > label {',
          'display: inline-block;',
          'margin-bottom: .2em;',
          '}',
          '</style>',
          '<input type="hidden" id="blockId" name="blockId" value="'+event.blockId+'"></input>',
          '<div  class="vex-custom-field-wrapper">',
          '<label for="obj">OBJ File</label>',
          '<div class="vex-custom-input-wrapper">',
          '<input id="objInput" name="obj" type="file" value="" />',
          '</div>',
          '</div>',
          '<div  class="vex-custom-field-wrapper">',
          '<label for="mtl">MTL File</label>',
          '<div class="vex-custom-input-wrapper">',
          '<input id="mtlInput" name="mtl" type="file" value="" />',
          '</div>',
          '</div>',
        ].join(''),
        callback: function (data) {
          fileSelectIsOpen = false;
        }
      });

      $('#objInput').change(function () { saveRenderFile('#objInput', 'obj') });
      $('#mtlInput').change(function () { saveRenderFile('#mtlInput', 'mtl') });
    });
  }
};

Blockly.JavaScript['ar_model_update'] = function(block) {
  //const value_id = block.getFieldValue('ID');
  var value_id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  if (!renderFiles[block.id] || !renderFiles[block.id].obj) {
    vex.dialog.alert("No OBJ file detected, please select one by clicking on your 3D model block");
    throw new Error("No OBJ file selected")
  }
  var obj = renderFiles[block.id].obj;
  var mtl = renderFiles[block.id].mtl;

  var code = `await load3DModel(${value_id}, "${obj}", "${mtl}");\n`;
  return code;
};

Blockly.Blocks['ar_scale_set'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Set scale for element");
    this.appendValueInput("ID")
      .setCheck("String")
      .appendField("with ID");
    this.appendDummyInput()
      .appendField("to {")
      .appendField("X:");
    this.appendValueInput("X")
      .setCheck("Number");
    this.appendDummyInput()
      .appendField("Y:");
    this.appendValueInput("Y")
      .setCheck("Number");
    this.appendDummyInput()
      .appendField("Z:");
    this.appendValueInput("Z")
      .setCheck("Number");
    this.appendDummyInput()
      .appendField("}");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
}

Blockly.JavaScript['ar_scale_set'] = function(block) {
  var value_id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `await arScaleSet(${value_id}, ${value_x}, ${value_y}, ${value_z});\n`;
  return code;
};

Blockly.Blocks['ar_rotation_set'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Set rotation for element");
    this.appendValueInput("ID")
      .setCheck("String")
      .appendField("with ID");
    this.appendDummyInput()
      .appendField("to {")
      .appendField("X:");
    this.appendValueInput("X")
      .setCheck("Number");
    this.appendDummyInput()
      .appendField("Y:");
    this.appendValueInput("Y")
      .setCheck("Number");
    this.appendDummyInput()
      .appendField("Z:");
    this.appendValueInput("Z")
      .setCheck("Number");
    this.appendDummyInput()
      .appendField("}");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
}

Blockly.JavaScript['ar_rotation_set'] = function(block) {
  var value_id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `await arRotationSet(${value_id}, ${value_x}, ${value_y}, ${value_z});\n`;
  return code;
};

Blockly.Blocks['ar_position_set'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Set position for element");
    this.appendValueInput("ID")
      .setCheck("String")
      .appendField("with ID");
    this.appendDummyInput()
      .appendField("to {")
      .appendField("X:");
    this.appendValueInput("X")
      .setCheck("Number");
    this.appendDummyInput()
      .appendField("Y:");
    this.appendValueInput("Y")
      .setCheck("Number");
    this.appendDummyInput()
      .appendField("Z:");
    this.appendValueInput("Z")
      .setCheck("Number");
    this.appendDummyInput()
      .appendField("}");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
}

Blockly.JavaScript['ar_position_set'] = function(block) {
  var value_id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `await arPositionSet(${value_id}, ${value_x}, ${value_y}, ${value_z});\n`;
  return code;
};

Blockly.Blocks['ar_remove'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("AR: Remove element");
    this.appendValueInput("ID")
      .setCheck("String")
      .appendField("with ID");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['ar_remove'] = function(block) {
  var value_id = Blockly.JavaScript.valueToCode(block, 'ID', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `await arRemove(${value_id});\n`;
  return code;
};

Blockly.Blocks['async_loop'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Asyncronous Loop");
    this.appendValueInput("CONDITIONAL")
      .setCheck("Boolean")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("repeat while ");
    this.appendStatementInput("CODE")
      .setCheck(null)
      .appendField("do");
    this.appendValueInput("DELAY")
      .setCheck("Number")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField("delay");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(135);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

let loopID = 0;

Blockly.JavaScript['async_loop'] = function(block) {
  var conditional = Blockly.JavaScript.valueToCode(block, 'CONDITIONAL', Blockly.JavaScript.ORDER_ATOMIC);
  var code = Blockly.JavaScript.statementToCode(block, 'CODE');
  var delay = Blockly.JavaScript.valueToCode(block, 'DELAY', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `
  async function loop${loopID}() {
    if(${conditional}) {
      ${code}
      setTimeout(loop${loopID}, ${delay});
    }
  }
  loop${loopID}();
  \n`;
  loopID += 1;
  return code;
};
