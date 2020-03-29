
/**
Google sign-in and API related
*/

// The Browser API key obtained from the Google API Console.
var developerKey = 'AIzaSyCuIT3Iwe-yWhkq3a0Zd4KJsXpOrsw_jRE';

// The Client ID obtained from the Google API Console. Replace with your own Client ID.
var clientId = '901502487955-pihb2fji8ufgkmd4p6jut4kno9qipppj.apps.googleusercontent.com';

// Scope to use to access user's drive. drive.file allows creating new files and reading ones created by this app
// https://developers.google.com/identity/protocols/googlescopes
var scope = 'https://www.googleapis.com/auth/drive.readonly  https://www.googleapis.com/auth/drive.file ';

var pickerApiLoaded = false;
var oauthToken = null;
var blocklyFileID = null;
var arFileID = null;
var qrFileID = null;
var fileLink = null;

function handleClientLoad() {
        // this is called when google's api.js finishes loading
        // Loads the client library and the auth2 library together for efficiency.
        // Loading the auth2 library is optional here since `gapi.client.init` function will load
        // it if not already loaded. Loading it upfront can save one network request.
        gapi.load('client:auth2', initClient);
        gapi.load('picker', onPickerApiLoad);
      }

function initClient() {
        // Initialize the client with API key and People API, and initialize OAuth with an
        // OAuth 2.0 client ID and scopes (space delimited string) to request access.
        gapi.client.init({
            apiKey: developerKey,
            //discoveryDocs: ["https://peopleoogleapi.goK/$discovery/rest?version=v1"],
            clientId: clientId,
            scope: scope
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
          loadSignInButton(false);
        });
}

function loadSignInButton(isSignedIn) {
  let buttonDiv = document.getElementById('signin-button');
  while (buttonDiv.firstChild) {
    buttonDiv.removeChild(buttonDiv.firstChild);
  }
  let user = document.createElement('div');
  if (isSignedIn) {
    // Display "Sign Out" button
    user.id = 'sign-out';
    user.onclick = driveSignOut;
    user.title = 'sign out';
    user.innerHTML = '<img src="static/media/signout.png">';
  } else {
    // Display "Sign In" button
    user.id = 'sign-in';
    user.onclick = driveSignIn;
    user.title = 'sign in';
    user.innerHTML = '<img src="static/media/signin.png">';
  }
  user.class = 'item btn';
  buttonDiv.appendChild(user);
}

function loadGoogleClassButton(isReady) {
  let gclassDiv = document.getElementById('googleclass');
  while (gclassDiv.firstChild) {
    gclassDiv.removeChild(gclassDiv.firstChild);
  }
  if (isReady) {
    // Display button
    let googleClassButton = document.createElement('div');
    googleClassButton.id = 'googleclass-button';
    gclassDiv.appendChild(googleClassButton);
    gapi.sharetoclassroom.render(
      'googleclass-button',
      {
        'url': fileLink,
        'size': '32',
        'onsharestart': () => {
          let xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
          let data = Blockly.Xml.domToText(xml);
          let file = new Blob([data], { type: 'text/xml' });
          overwriteFile(blocklyFileID, file);
        }
      });
  } else {
    // Display notice instructing user to save first
    gclassDiv.innerHTML = 'Save to share to<br>Google Classroom'; 
  }
}

async function updateSigninStatus(isSignedIn) {
  // When signin status changes, this function is called.
  // If the signin status is changed to signedIn, we make an API call.
  if (isSignedIn) {
    //makeApiCall();
    oauthToken = await gapi.auth.getToken().access_token;
  } else {
    loadGoogleClassButton(false);
    oauthToken = null;
    blocklyFileID = null;
    fileLink = null;
  }
  loadSignInButton(isSignedIn);
}

async function driveSignIn(event) {
        // Ideally the button should only show up after gapi.client.init finishes, so that this
        // handler won't be called before OAuth is initialized.
        await gapi.auth2.getAuthInstance().signIn();
        await updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
}

function driveSignOut(event) {
        gapi.auth2.getAuthInstance().signOut();
}


// Drive picker related:
// Docs: https://developers.google.com/picker/docs/

function onPickerApiLoad() {
  pickerApiLoaded = true;
}

// picker to open project from google drive
async function openFromDrivePicker() {
  if (!pickerApiLoaded) throw new Error('Picker API Not Loaded'); 
  if (!oauthToken) {
    // There will be no auth token if the user has not yet signed in
    // Make them sign in
    try {  
      await driveSignIn();
    } catch(err) {
      vex.dialog.alert("Sign in failed, please try again");
      return;
    }
  }
  var picker = new google.picker.PickerBuilder().
    addView(google.picker.ViewId.DOCS).
    setOAuthToken(oauthToken).
    setDeveloperKey(developerKey).
    setCallback(openFromDrivePickerCallback).
    build();
  picker.setVisible(true);
}

async function pickAndSave(file, type, message, postSaveCallback) {
  const folderId = await saveDrivePicker(message);
  const fileName = await getFileName();
  createFile(fileName, file, folderId, type, postSaveCallback);
}

// picker to open project from google drive
async function saveDrivePicker(message) {
  if (!pickerApiLoaded) throw new Error('Picker API Not Loaded');
  if (!oauthToken) {
    // There will be no auth token if the user has not yet signed in
    // Make them sign in
    try {
      await driveSignIn();
    } catch (err) {
      vex.dialog.alert("Sign in failed, please try again");
      reject();
    }
  }

  return new Promise((resolve, reject) => {
    var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS);
    view.setMimeTypes('application/vnd.google-apps.folder');
    view.setSelectFolderEnabled(true);
    view.setParent('root');

    var picker = new google.picker.PickerBuilder().
      addView(view).
      setOAuthToken(oauthToken).
      setDeveloperKey(developerKey).
      setTitle(message).
      setCallback((data) => {
        if (data[google.picker.Response.ACTION] != google.picker.Action.PICKED) {
          return;
        }
        console.log("Premature?");
        let doc = data[google.picker.Response.DOCUMENTS][0];
        let folderId = doc[google.picker.Document.ID];
        resolve(folderId);
        return;
      }).
      disableFeature('MULTISELECT_ENABLED').
      build();
    picker.setVisible(true);
  });
}


/**
Callback for the OpenFromDrivePicker(), if a drive file is picked, it will be loaded into the project using loadProjectXml()
*/    

async function openFromDrivePickerCallback(data) {
  if (data[google.picker.Response.ACTION] != google.picker.Action.PICKED) {
    return;
  }

  let doc = data[google.picker.Response.DOCUMENTS][0];
  let id = doc[google.picker.Document.ID];
  let url = doc[google.picker.Document.URL];

  if (id) {
    // https://developers.google.com/drive/api/v3/reference/files/get
    try {
      let response = await fetch('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media', {
        headers: new Headers({ 'Authorization': 'Bearer ' + oauthToken }),
        });
      let text = await response.text();
      loadProjectXml(text);
      blocklyFileID = id;
      fileLink = url;
      loadGoogleClassButton(true);
    } catch(error) {
      console.log('Request failed', error)
    }
  }
}

/**
Load project xml - generic. Call with the xml content as parameter.
*/

function loadProjectXml(content) {

  try {
    var xml = Blockly.Xml.textToDom(content);
    }
  catch (e) {
    vex.dialog.alert('Error parsing XML:' + e);
    return;
    }

  var count = Blockly.mainWorkspace.getAllBlocks().length;

  if (count) {
    vex.dialog.confirm({
      message: 'Replace or Merge existing blocks?',
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, { text: 'Replace' }),
        $.extend({}, vex.dialog.buttons.NO, { text: 'Merge' })
        ],
      callback: function (value) {
        if (value) {
          Blockly.mainWorkspace.clear();
          }
        Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);
        }
      })
    }
  else {
    Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);
    }
}


/**
Save project to google drive
Super useful: API explorer: https://developers.google.com/apis-explorer/#p/drive/v3/
*/

async function overwriteFile(fileID, file) {
  if (!fileID) throw new Error('No fileId');
  if (!file) throw new Error('No file');

  let metadata = {
    'mimeType': 'text/xml', // mimeType at Google Drive
    //'parents': ['### folder ID ###'], // Folder ID at Google Drive
  };

  let form = new FormData();
  
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  let uri = `https://www.googleapis.com/upload/drive/v3/files/${fileID}?uploadType=multipart&fields=id%2CwebContentLink%2CwebViewLink`;

  let response = await fetch(uri, {
    method: 'PATCH',
    headers: new Headers({ 'Authorization': 'Bearer ' + oauthToken }),
    body: form,
  });
  if (response.status == '200') {
    vex.dialog.alert({
      message: 'File saved'
    });
  } else {
    vex.dialog.alert({
      message: 'Issue saving file'
    });
  }
}

function getFileName() {
  return new Promise((resolve, reject) => {
    vex.dialog.prompt({
      message: 'What would you like to name your file?',
      placeholder: 'Tokymaker Project',
      callback: async (fileName) => {
        if (!fileName) {
          vex.dialog.alert({
            message: 'Save failed: Need to give a file name'
          })
          reject();
          return;
        }
        resolve(fileName);
        return;
      }
    });
  });
}

async function createFile(fileName, file, folderId, type) {
  let mimeType = '';
  switch (type) {
    case 'png':
      mimeType = 'img/png';
      break;
    case 'xml':
      mimeType = 'txt/xml';
      break;
    case 'html':
      mimeType = 'txt/html';
      break;
    default:
      throw new Error("Trying to save an unsupported file");
  }

  let metadata = {
    'name': fileName + '.' + type, // Filename at Google Drive
    'mimeType': mimeType, // mimeType at Google Drive
    'parents': [folderId], // Folder ID at Google Drive
  };

  let form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);
  // https://developers.google.com/drive/api/v3/about-permissions
  // anyone:reader makes resource available on the webContentLink and webViewLink

  let permissions = {
    'role': 'reader',
    'type': 'anyone'
  };

  // https://developers.google.com/drive/api/v3/manage-uploads
  let saveResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id%2CwebContentLink%2CwebViewLink', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + oauthToken }),
    body: form,
  })

  saveResponse = await saveResponse.json();

  let linkResponse = await fetch('https://www.googleapis.com/drive/v3/files/' + saveResponse.id + '/permissions', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + oauthToken }),
    body: new Blob([JSON.stringify(permissions)], { type: 'application/json' })
  });
  return new Promise((resolve, reject) => {
    if (linkResponse.status == '200') {
      vex.dialog.confirm({
        message: `${fileName}.${type} saved to your Drive.`,
        focusFirstInput: false,
        showCloseButton: true,
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Ok' }),
          $.extend({}, vex.dialog.buttons.YES, { text: 'View', click: () => window.open(saveResponse.webViewLink) })
        ],
        callback: () => {
          resolve(saveResponse.id);
        }
      });
      // TODO: This can be done better
      switch (type) {
        case 'png':
          qrFileId = saveResponse.id;
          break;
        case 'xml':
          blocklyFileID = saveResponse.id;
          break;
        case 'html':
          arFileID = saveResponse.id;
          break;
        default:
          throw new Error("Trying to save an unsupported file");
      }
      fileLink = saveResponse.webViewLink;
      loadGoogleClassButton(true);
    } else {
      vex.dialog.alert('Error saving to drive');
      reject();
    }
  });
}


async function saveToDrive(fileID) {
  if (!pickerApiLoaded) throw new Error('Picker API Not Loaded');
  if (!oauthToken) {
    // There will be no auth token if the user has not yet signed in
    // Make them sign in
    try {
      await driveSignIn();
    } catch (err) {
      vex.dialog.alert("Sign in failed, please try again");
      return;
    };
  }

  let xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  let data = Blockly.Xml.domToText(xml);
  let file = new Blob([data], { type: 'text/xml' });

  // If fileID exists then the user has already saved the file so overwrite
  if (fileID) {
    vex.dialog.confirm({
      message: 'Would you like to?',
      focusFirstInput: false,
      showCloseButton: true,
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, { text: 'Overwrite', click: () => overwriteFile(fileID, file) }),
        $.extend({}, vex.dialog.buttons.YES, { text: 'Save New', click: () => pickAndSave(file, 'xml', 'Please pick a place to save your tokylabs project', null) })
      ],
      callback: () => { return }
    });
    return;
  }

  // If fileID does not exist then this is the first time saving
  pickAndSave(file, 'xml', 'Please pick a place to save your tokylabs project', null);
}
