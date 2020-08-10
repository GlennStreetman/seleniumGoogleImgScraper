let clickedImageList = {};
let visableFolder = "pictures/";

folderSelect(visableFolder);
//finds image name
function getFileName(indexRef) {
  imagePath = clickedImageList[indexRef];

  fileName = imagePath.substring(
    imagePath.lastIndexOf("/") + 1,
    imagePath.lastIndexOf(".")
  );

  return fileName;
}
//finds image filepath
function getFilePath(indexRef) {
  imagePath = clickedImageList[indexRef];
  filePath = imagePath.substring(
    imagePath.lastIndexOf("static/") + 7,
    imagePath.lastIndexOf("/") + 1
  );
  return filePath;
}
//toggles image hidden/visable
function imgClick(myArg) {
  var clickedImage = document.getElementById(myArg);
  var clickCheckBox = document.getElementById("c" + myArg);

  if (clickedImage.style.opacity == 1 || null) {
    clickedImage.style.opacity = 0.5;
    clickCheckBox.style.opacity = 0.5;
    clickedImageList[myArg] = clickedImage.src;
  } else {
    clickedImage.style.opacity = 1;
    clickCheckBox.style.opacity = 0;
    delete clickedImageList[myArg];
  }
  // console.log(clickedImageList);
  updateNav();
  hideToggle();
}

//toggle sidebar
function hideToggle() {
  if (Object.keys(clickedImageList).length == 0) {
    // document.getElementById("toggleButton").style.display = "none";
    document.getElementById("sideBarOpen").style.display = "none";
  } else {
    // document.getElementById("toggleButton").style.display = "block";
    document.getElementById("sideBarOpen").style.display = "block";
  }
}
//adjust sidebar padding when sidebar toggled.
function openNav() {
  //Adjust the padding to make room for sidebar.
  document.getElementById("mySidenav").style.width = "20%";
  document.getElementsByClassName("pictureContainer")[0].style.paddingLeft =
    "20%";
  document.getElementsByClassName("pictureContainer")[0].style.paddingRight =
    "0%";
  document.getElementById("sideBarOpen").style.display = "none";
}

//update sidebar with list of selected pictures.
function updateNav() {
  document.getElementById("mySidenav").innerHTML = ""; //remove all inner html from sidebar
  document.getElementById("mySidenav").innerHTML += //remove all from nav bar
    "<button class='sideToggle' onclick='resetNav()'><i class='fa fa-close'></i></button>";
  document.getElementById("mySidenav").innerHTML += //show bulk move modal
    "<button class='sideToggle' onclick=showModal('bulkMoveFiles')><i class='fa fa-folder-open'></i></button>";
  document.getElementById("mySidenav").innerHTML += //hide sidebar
    "<button class='sideToggle' onclick='closeNav()'><i class='fa fa-arrow-left'></i></button>";
  for (i = 0; i < Object.keys(clickedImageList).length; i++) {
    //add links for all selected images to sidebar
    var imagelistitem =
      "<button class='sidePic' onclick='updatePictureModal(" +
      Object.keys(clickedImageList)[i] +
      ")'>" +
      "[" +
      Object.keys(clickedImageList)[i] +
      "]" +
      getFileName(Object.keys(clickedImageList)[i]);
    +"</button>";
    document.getElementById("mySidenav").innerHTML += imagelistitem;
  }
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementsByClassName("pictureContainer")[0].style.paddingLeft =
    "10%";
  document.getElementsByClassName("pictureContainer")[0].style.paddingRight =
    "10%";
}

//refreshes sidebar content.
function resetNav() {
  if (Object.keys(clickedImageList).length != 0) {
    for (img in clickedImageList) {
      imgClick(img);
    }
  }
  document.getElementById("sideBarOpen").style.display = "none";
  updateNav();
  closeNav();
}
//updates folder dropdowns
function addFolderDropdown(folderPath) {
  function updateDropdownWith() {
    var opt = document.createElement("option");
    opt.text = folderPath + "/";
    opt.value = folderPath + "/";
    return opt;
  }

  console.log("Updating drop downs");
  document
    .getElementById("newFolderFilePath")
    .options.add(updateDropdownWith());
  document
    .getElementById("bulkDestinationPath")
    .options.add(updateDropdownWith());
  document.getElementById("modalFilePath").options.add(updateDropdownWith());
  appDirs[folderPath] = folderPath;
  document.getElementById("topBarFolderList").innerHTML +=
    "<a href='#' onclick=folderSelect('" +
    folderPath +
    "/" +
    "');>" +
    folderPath +
    "/" +
    "</a>";
}

//show picture rename modal.
function updatePictureModal(pictureID) {
  document.getElementById("modalPictureName").value = getFileName(pictureID);
  document.getElementById("modalFilePath").selected = getFilePath(pictureID);
  photo = document.getElementsByClassName("img-responsive");
  photo[0].src = clickedImageList[pictureID];
  photo[0].id = "m" + pictureID;
  showModal("renamePictureModal");
}

// When the user clicks on <span> (x), close the modal
function hideModal() {
  modal = document.getElementById("pictureModal");
  modal.style.display = "none";
}
//  sets target of hidden button then clicks to show target modal.
function showModal(modalName) {
  console.log(modalName);
  target = document.getElementById("showModalButton");
  target.dataset.target = "#" + modalName;
  target.click();
  // dragElement(document.getElementById(modalName));
}

// submit rename picture modal. getelementbyid
$("#picInfoForm").submit(function (event) {
  // get the form data
  var formData = {
    newPhotoName: $("input[name=modalPictureName]").val(),
    newPhotoSource: $("select[name=modalFilePath]").val(),
    imgSource: $("img[name=modalPhoto]").attr("src"),
  };

  console.log(formData);

  $.ajax({
    type: "POST", // define the type of HTTP verb we want to use (POST for our form)
    contentType: "application/json",
    url: "_update_picture", // the url where we want to POST
    data: JSON.stringify(formData), // our data object
    dataType: "json", // what type of data do we expect back from the server
    encode: true,
  })
    // using the done promise callback
    .done(function (data) {
      // log data to the console so we can see
      console.log(data);
      if (data["error"] != "none") {
        alert(data["error"]);
      } else {
        alert(data["success"]);
        document.getElementById("renamePictureModal").click();
        modalPhotoID = document.getElementsByName("modalPhoto")[0].id;
        modalPhotoAlt = document.getElementById(modalPhotoID[1]).alt;

        updatePictureDetails = document.getElementById(modalPhotoID[1]);
        updatePictureDetails.src =
          "static/" +
          formData["newPhotoSource"] +
          formData["newPhotoName"] +
          ".jpg";
        updatePictureDetails.alt = formData["newPhotoSource"];
        movePictureFrame = document.getElementById(
          modalPhotoAlt + modalPhotoID[1]
        );
        movePictureFrame.id = formData["newPhotoSource"] + modalPhotoID[1];

        //rename photo in photo pane.
        clickedImageList[modalPhotoID[1]] =
          "static/" +
          formData["newPhotoSavePath"] +
          formData["newPhotoName"] +
          ".jpg";
        delete clickedImageList[modalPhotoID[1]];
        imgClick(modalPhotoID[1]);
        updateNav();
        folderSelect(visableFolder);
      }

      // here we will handle errors and validation messages
    });

  // stop the form from submitting the normal way and refreshing the page
  event.preventDefault();
});

//create new folder path.
$("#filePathModal").submit(function (event) {
  // get the form data
  var formData = {
    newFolder: $("input[name=newFolder]").val(),
    newFolderPath: $("select[name=newFolderFilePath]").val(),
  };

  let updateDropdown =
    $("select[name=newFolderFilePath]").val() +
    $("input[name=newFolder]").val();

  console.log(formData);

  $.ajax({
    type: "POST", // define the type of HTTP verb we want to use (POST for our form)
    contentType: "application/json",
    url: "_new_folder", // the url where we want to POST
    data: JSON.stringify(formData), // our data object
    dataType: "json", // what type of data do we expect back from the server
    encode: true,
  })
    // using the done promise callback
    .done(function (data) {
      console.log(data);
      if (data["error"] != "none") {
        alert(data["error"]);
      } else {
        alert(data["success"]);
        showModal("filePathModal");
        //document.getElementById("filePathModal").click();
        addFolderDropdown(updateDropdown);
      }
    });

  // stop the form from submitting the normal way and refreshing the page
  event.preventDefault();
});

//bulk move all files in clicked image list.
$("#bulkMoveFiles").submit(function (event) {
  // get the form data
  var formData = {
    selectedPictures: clickedImageList,
    newFolderPath: $("select[name=bulkDestinationPath]").val(),
  };
  //set to zero when update is complete to end live update.
  liveUpdate = 1;

  newFolder = $("select[name=bulkDestinationPath]").val();

  $.ajax({
    type: "POST", // define the type of HTTP verb we want to use (POST for our form)
    contentType: "application/json",
    url: "_bulk_Move", // the url where we want to POST
    data: JSON.stringify(formData), // our data object
    dataType: "json", // what type of data do we expect back from the server
    encode: true,
  }).done(
    function (data) {
      //log data to the console so we can see
      console.log(data.length);
      document.getElementById("BM1").innerHTML = "";
      for (let i = 0; i < data.length; i++) {
        document.getElementById("BM1").innerHTML += data[i];
        document.getElementById("BM1").innerHTML += "<br>";
      }
      alert("Move Complete");
      liveUpdate = 0;
      movedPictureKeys = Object.keys(clickedImageList);
      for (let i = 0; i < Object.keys(clickedImageList).length; i++) {
        updateImage = document.getElementById(movedPictureKeys[i]);
        updatePictureFrame = document.getElementById(
          updateImage.alt + movedPictureKeys[i]
        );
        updateImage.src = updateImage.src.replace(updateImage.alt, newFolder);
        updateImage.alt = newFolder;
        updatePictureFrame.id = newFolder + movedPictureKeys[i];
      }
      resetNav();
      folderSelect(visableFolder);
    }
    // here we will handle errors and validation messages
  ),
    (liveLog = setInterval(function updateLog(data) {
      // console.log("Running update log");
      $.ajax({
        type: "GET", // define the type of HTTP verb we want to use (POST for our form)
        contentType: "application/json",
        url: "_bulk_Move", // the url where we want to POST
        data: JSON.stringify(formData),
        dataType: "json", // what type of data do we expect back from the server
        encode: true,
        success: function (data) {
          console.log("Is data received?");
          console.log(data);
          document.getElementById("BM1").innerHTML = "";
          for (let i = 0; i < data.length; i++) {
            console.log("updating status");
            document.getElementById("BM1").innerHTML += data[i];
            document.getElementById("BM1").innerHTML += "<br>";
          }
          if (liveUpdate != 1) {
            console.log("turning off");
            clearInterval(liveLog);
          }
        },
      });
    }, 1000));
  // stop the form from submitting the normal way and refreshing the page
  event.preventDefault();
});

//create new google image scrape modal.
function newScrapeModal() {
  newModalID = new Date().getTime();
  newModalHTML = $("#createScrapeModal").html();
  newModalHTML = newModalHTML.replaceAll("@@id", newModalID);
  document.getElementById("modalHook").innerHTML += newModalHTML;
  showModalString = "scrapeImageModal" + newModalID;
  for (dir in appDirs) {
    dirOption = document.createElement("option");
    dirOption.setAttribute("value", appDirs[dir]);
    dirOption.innerHTML = appDirs[dir];
    document
      .getElementById("scrapeDestination" + newModalID)
      .options.add(dirOption);
  }
  showModal(showModalString);
}

//remove scrape modal from DOM upon close
function removeNewScrapeModal(modalReference) {
  removeElem = document.getElementById(modalReference);
  removeElem.parentNode.removeChild(removeElem);
}

//show/hide pictures based upon folder selection.
function folderSelect(folder) {
  // console.log("show folder: " + folder);
  var allPics = document.getElementsByClassName("pictureBox");
  for (i = 0; i < allPics.length; i++) {
    if (
      allPics[i].id.substring(0, allPics[i].id.lastIndexOf("/") + 1) == folder
    ) {
      allPics[i].style.display = "block";
    } else {
      // console.log(allPics[i].alt);
      allPics[i].style.display = "none";
    }
  }
  document.getElementById("currentDirectory").innerHTML =
    "Current Folder: " + folder;
  visableFolder = folder;
}

//lazy loading of images
document.addEventListener("DOMContentLoaded", function () {
  var lazyloadImages;

  if ("IntersectionObserver" in window) {
    lazyloadImages = document.querySelectorAll(".lazy");
    var imageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var image = entry.target;
          image.src = image.dataset.src;
          image.classList.replace("lazy", "photo");
          imageObserver.unobserve(image);
        }
      });
    });

    lazyloadImages.forEach(function (image) {
      imageObserver.observe(image);
    });
  } else {
    var lazyloadThrottleTimeout;
    lazyloadImages = document.querySelectorAll(".lazy");

    function lazyload() {
      if (lazyloadThrottleTimeout) {
        clearTimeout(lazyloadThrottleTimeout);
      }

      lazyloadThrottleTimeout = setTimeout(function () {
        var scrollTop = window.pageYOffset;
        lazyloadImages.forEach(function (img) {
          if (img.offsetTop < window.innerHeight + scrollTop) {
            img.src = img.dataset.src;
            img.classList.replace("lazy", "photo");
          }
        });
        if (lazyloadImages.length == 0) {
          document.removeEventListener("scroll", lazyload);
          window.removeEventListener("resize", lazyload);
          window.removeEventListener("orientationChange", lazyload);
        }
      }, 20);
    }

    document.addEventListener("scroll", lazyload);
    window.addEventListener("resize", lazyload);
    window.addEventListener("orientationChange", lazyload);
  }
});

function googleImageScrape(x) {
  new ScrapeRequest(x).runScrapeRequest();
}

//finds the last class child of pictureContainer
function last_of_class(elt, cls) {
  var children = elt.getElementsByClassName(cls);
  return children[children.length - 1];
}

class ScrapeRequest {
  constructor(scrapeID) {
    this.scrapeModelID = scrapeID;
    this.scrapeProgress = 1;
    this.scrapeModel;
    this.scrapeLog;
    this.lastPicture;
    this.lastPictureIndex;
    this.modelLog;
    this.newPicture;
    this.newPictureBox;
    this.checkMarkDiv;
    this.checkMarkImage;
    this.docPictureContainer;
    this.requestDateTime;
    this.formDataStatus;
    this.formData;
    this.increment;

    this.checkStats = setInterval(this.scrapePictureLog.bind(this), 1000);
  }

  scrapeStatusCheck(data) {
    console.log("scrapeProgress on Success: ");
    console.log(data);
    if (this.scrapeProgress == 1) {
      //modelLog = scrapeModelID.querySelector('div[name="progressLog"]');
      console.log("scrapeProgress is 1");
      this.modelLog = document.getElementById(this.scrapeModelID + "Log");
      this.modelLog.innerHTML = "";
      for (let i = 0; i < Object.keys(data).length; i++) {
        // console.log("updating status");
        this.modelLog.innerHTML += data[i];
        this.modelLog.innerHTML += "<br>";
      }
      console.log("still on: " + this.scrapeProgress);
    }
    if (this.scrapeProgress != 1) {
      console.log("turning off");
      clearInterval(this.checkStats);
    }
  }

  scrapePictureLog = () => {
    console.log(this.formDataStatus);
    console.log(this.setState);
    $.ajax({
      type: "POST", // define the type of HTTP verb we want to use (POST for our form)
      contentType: "application/json",
      url: "_scrape_Request", // the url where we want to POST
      data: JSON.stringify(this.formDataStatus), // our data object
      dataType: "json", // what type of data do we expect back from the server
      encode: true,
      success: (data) => this.scrapeStatusCheck(data),
    });
  };

  runScrapeRequest() {
    this.scrapeModel = document.getElementById(this.scrapeModelID);
    this.requestDateTime = new Date().getTime();
    this.formData = {
      imageDescription: this.scrapeModel.querySelector(
        'input[name="imageDescription"]'
      ).value,
      imageCount: this.scrapeModel.querySelector('input[name="imageCount"]')
        .value,
      scrapeDestination: this.scrapeModel.querySelector(
        'select[name="scrapeDestination"]'
      ).value,
      requestName:
        this.scrapeModel.querySelector('input[name="imageDescription"]').value +
        this.requestDateTime,
      postType: "Scrape",
    };

    this.formDataStatus = {
      imageDescription: this.scrapeModel.querySelector(
        'input[name="imageDescription"]'
      ).value,
      imageCount: this.scrapeModel.querySelector('input[name="imageCount"]')
        .value,
      scrapeDestination: this.scrapeModel.querySelector(
        'select[name="scrapeDestination"]'
      ).value,
      requestName:
        this.scrapeModel.querySelector('input[name="imageDescription"]').value +
        this.requestDateTime,
      postType: "Log",
    };
    //this is also a function so i need to acces the correct THIS for this to work right. It must be affecting the promise as well.
    // var that = this;
    $.ajax({
      type: "POST", // define the type of HTTP verb we want to use (POST for our form)
      contentType: "application/json",
      url: "_scrape_Request", // the url where we want to POST
      data: JSON.stringify(this.formData), // our data object
      dataType: "json", // what type of data do we expect back from the server
      encode: true,
      success: (data) => {
        // find last picture box in pictureFram  and insert the following below.
        // console.log(data);
        this.scrapeProgress = 0;
        // console.log(this.scrapeProgress);
        this.lastPicture = last_of_class(pictureContainer, "pictureBox");
        //if picture is successfully downloaded update picture frame.
        this.lastPictureIndex = parseInt(
          this.lastPicture.id.substring(
            this.lastPicture.id.lastIndexOf("/") + 1,
            this.lastPicture.id.length + 1
          )
        );
        // console.log(
        //   "Container Break: lastpicture then lastPictureIndex",
        //   lastPicture,
        //   lastPictureIndex
        // );
        this.modelLog = document.getElementById(this.scrapeModelID + "Log");
        // console.log(this.modelLog);
        this.modelLog.innerHTML += "Complete!";
        // console.log("update picture frame next");
        this.logMessages = Object.keys(data).length;
        for (var x = 0; x < this.logMessages; x++) {
          // console.log("testing string: " + data[x]);
          if (data[x].substring(0, 7) == "SUCCESS") {
            this.increment = this.lastPictureIndex + x - 1;
            // console.log("newPicture success");
            this.newPictureBox = document.createElement("div");
            this.newPictureBox.setAttribute("id", "pictures/" + this.increment);

            this.newPictureBox.setAttribute("class", "pictureBox");
            this.newPictureBox.setAttribute(
              "onClick",
              "imgClick(" + this.increment + ")"
            );
            // console.log("New Picture Box:");
            // console.log(this.newPictureBox);
            this.newPicture = document.createElement("img");
            this.newPicture.setAttribute("id", this.increment);
            this.newPicture.setAttribute("class", "photo");
            this.newPicture.setAttribute(
              "alt",
              $("select[name=scrapeDestination]").val()
            );
            this.newPicture.setAttribute(
              "src",
              data[x].substring(
                data[x].indexOf("as /static/") + 4,
                data[x].length + 1
              )
            );
            this.newPicture.setAttribute("style", "opacity: 1");

            //create check mark division
            this.checkMarkDiv = document.createElement("div");
            this.checkMarkDiv.setAttribute("class", "overlay");
            this.checkMarkDiv.setAttribute("id", "c" + this.increment);
            this.checkMarkDiv.setAttribute("style", "opacity: 0");
            this.checkMarkDiv.innerHTML = "<h1>" + this.increment + "</h1>";
            //create checkmark image
            this.checkMarkImage = document.createElement("img");
            this.checkMarkImage.setAttribute("class", "checkMark");
            this.checkMarkImage.setAttribute("src", "/static/checkmark.png");
            //append check mark to picture to checkmark division, append checkmark division to picturebox, append picture to picturebox, append picturebox as
            this.docPictureContainer = document.getElementById(
              "pictureContainer"
            );
            this.docPictureContainer.appendChild(this.newPictureBox);
            this.newPictureBox.appendChild(this.newPicture);
            this.newPictureBox.appendChild(this.checkMarkDiv);
            // checkMarkDiv.appendChild(document.createElement("div"));
            this.checkMarkDiv.appendChild(this.checkMarkImage);
            // console.log(this.checkMarkDiv);
            // console.log("Done");
            // console.log($("select[name=scrapeDestination]").val());
            folderSelect($("select[name=scrapeDestination]").val());
            //rerun show photo function
          }
        }
      },
    }),
      //.done($.proxy(this.completeScrapeRequest({ 0: "data" }), that)),
      this.scrapePictureLog();
  }
}

function dragElement(elmnt) {
  console.log("starting drag");
  console.log(elmnt);
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "button")) {
    console.log("found button");
    // if present, the button is where you move the DIV from:
    document.getElementById(elmnt.id + "button").onmousedown = dragMouseDown;
  } else {
    console.log("could not find button");
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
