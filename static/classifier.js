//========================================================================
// Drag and drop image handling
//========================================================================

var fileDrag = document.getElementById("file-drag");
var fileSelect = document.getElementById("file-upload");

// Add event listeners
fileDrag.addEventListener("dragover", fileDragHover, false);
fileDrag.addEventListener("dragleave", fileDragHover, false);
fileDrag.addEventListener("drop", fileSelectHandler, false);
fileSelect.addEventListener("change", fileSelectHandler, false);

function fileDragHover(e) {
  // prevent default behaviour
  e.preventDefault();
  e.stopPropagation();

  fileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function fileSelectHandler(e) {
  // handle file selecting
  var files = e.target.files || e.dataTransfer.files;
  fileDragHover(e);
  for (var i = 0, f; (f = files[i]); i++) {
    previewFile(f);
  }
}

//========================================================================
// Webcam handling
//========================================================================
var webcamPlayer = document.getElementById("webcam");
var webcamAvailable = false;

navigator.mediaDevices.getUserMedia({video: true}).then((stream) =>{
  webcamPlayer.srcObject = stream;
  webcamAvailable = true;
} )
//========================================================================
// Web page elements for functions to use
//========================================================================

var imagePreview = document.getElementById("image-preview");
var imageDisplay = document.getElementById("image-display");
var uploadCaption = document.getElementById("upload-caption");
var predResult = document.getElementById("pred-result2");
var loader = document.getElementById("loader");
var model = undefined;

//========================================================================
// Main button events
//========================================================================
async function initialize() {
    model = await tf.loadLayersModel('/model/model.json');
}

async function predict() {
  // action for the submit button
  if (!imageDisplay.src && !imageDisplay.src.startsWith("data") && !webcamAvailable) {
    window.alert("Selectionnez une image avant de commencer. ou activez votre caméra");
    return;
  }

  predResult.innerHTML = ""

  emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

  let tensorImg;
  //On utilise la webcam par défaut
  if(webcamAvailable){
    const webcam = await tf.data.webcam(webcamPlayer, {
      resizeWidth: 48,
      resizeHeight: 48,
    })
    tensorImg = (await webcam.capture()).mean(2).expandDims(-1).expandDims(0);
  } else{
    //Sinon l'image utilisé
    tensorImg = tf.browser.fromPixels(imagePreview).resizeNearestNeighbor([48, 48], 1).toFloat().expandDims(0);
  }

  prediction = await model.predict(tensorImg).data();
  
  for(let i = 0 ; i < emotions.length; i++){
    predResult.innerHTML += "<br/>" + emotions[i] + " : " + prediction[i].toPrecision(4) * 100 + "% de chances"
  }


  show(predResult)

}

function clearImage() {
  // reset selected files
  fileSelect.value = "";

  // remove image sources and hide them
  imagePreview.src = "";
  imageDisplay.src = "";
  predResult.innerHTML = "";

  hide(imagePreview);
  hide(imageDisplay);
  hide(loader);
  hide(predResult);
  show(uploadCaption);
  show(webcamPlayer)

  imageDisplay.classList.remove("loading");
}

function previewFile(file) {
  // show the preview of the image
  var fileName = encodeURI(file.name);

  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    imagePreview.src = URL.createObjectURL(file);

    show(imagePreview);
    hide(uploadCaption);

    // reset
    predResult.innerHTML = "";
    imageDisplay.classList.remove("loading");

    displayImage(reader.result, "image-display");
  };
  hide(webcamPlayer)
}

//========================================================================
// Helper functions
//========================================================================

function displayImage(image, id) {
  // display image on given id <img> element
  let display = document.getElementById(id);
  display.src = image;
  show(display);
}

function hide(el) {
  // hide an element
  el.classList.add("hidden");
}

function show(el) {
  // show an element
  el.classList.remove("hidden");
}

initialize();