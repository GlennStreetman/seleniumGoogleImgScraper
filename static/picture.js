let clickedImageList = {};
let staticPath = "E:/Flask/pictureApp/pictureApp/static/pictures/";
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
    document.getElementById("toggleButton").style.display = "none";
  } else {
    document.getElementById("toggleButton").style.display = "block";
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
  for (img in clickedImageList) {
    imgClick(img);
    updateNav();
    closeNav();
  }
}
//updates folder dropdowns
function addFolderDropdown(folderPath) {
  function updateDropdownWith() {
    var opt = document.createElement("option");
    opt.text = folderPath;
    opt.value = folderPath;
    return opt;
  }

  console.log("Updating drop downs");
  document
    .getElementById("newFolderFilePath")
    .options.add(updateDropdownWith());
  document
    .getElementById("bulkDestinationPath")
    .options.add(updateDropdownWith());
  document
    .getElementById("scrapeDestination")
    .options.add(updateDropdownWith());
  document.getElementById("topBarFolderList").innerHTML +=
    "<a href='#' onclick=folderSelect('" +
    folderPath +
    "');>" +
    folderPath +
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

function showModal(modalName) {
  target = document.getElementById("showModalButton");
  target.dataset.target = "#" + modalName;
  target.click();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  modal = document.getElementById("pictureModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// submit rename picture model. getelementbyid
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
        document.getElementById(modalPhotoID[1]).src =
          "static/" +
          formData["newPhotoSource"] +
          formData["newPhotoName"] +
          ".jpg"; //rename photo in photo pane.
        clickedImageList[modalPhotoID[1]] =
          "static/" +
          formData["newPhotoSource"] +
          formData["newPhotoName"] +
          ".jpg";
        updateNav();
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

      // here we will handle errors and validation messages
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

$("#scrapeImageModal").submit(function (event) {
  // get the form data
  var formData = {
    imageDescription: $("input[name=imageDescription]").val(),
    imageCount: $("input[name=imageCount]").val(),
    scrapeDestination: $("select[name=scrapeDestination]").val(),
  };

  //finds the last class child of element
  function last_of_class(elt, cls) {
    var children = elt.getElementsByClassName(cls);
    return children[children.length - 1];
  }

  console.log(formData);
  scrapeProgress = 1;

  $.ajax({
    type: "POST", // define the type of HTTP verb we want to use (POST for our form)
    contentType: "application/json",
    url: "_scrape_Request", // the url where we want to POST
    data: JSON.stringify(formData), // our data object
    dataType: "json", // what type of data do we expect back from the server
    encode: true,
  })
    // using the done promise callback
    .done(
      function (data) {
        //find last picture box in pictureFrame and insert the following below.
        scrapeProgress = 0;
        lastPicture = last_of_class(pictureContainer, "pictureBox");
        console.log("Last Picture:");
        console.log(lastPicture);
        //if picture is successfully downloaded update picture frame.
        lastPictureIndex = parseInt(
          lastPicture.id.substring(
            lastPicture.id.lastIndexOf("/") + 1,
            lastPicture.id.length + 1
          )
        );

        console.log(data);
        console.log(Object.keys(data).length);
        logMessages = Object.keys(data).length;
        for (x = 0; x < logMessages; x++) {
          document.getElementById("SI1").innerHTML += data[x];
          document.getElementById("SI1").innerHTML += "<br>";

          if (data[x].substring(0, 7) == "SUCCESS") {
            increment = lastPictureIndex + x - 1;
            //create picture box
            newPictureBox = document.createElement("div");
            newPictureBox.setAttribute(
              "id",
              data[x].substring(
                data[x].indexOf("as /static/") + 11,
                data[x].lastIndexOf("/") + increment
              )
            );
            newPictureBox.setAttribute("class", "pictureBox");
            newPictureBox.setAttribute(
              "onClick",
              "imgClick(" + increment + ")"
            );
            console.log("break point");
            newPicture = document.createElement("img");
            newPicture.setAttribute("id", increment);
            newPicture.setAttribute("class", "photo");
            newPicture.setAttribute(
              "alt",
              $("select[name=scrapeDestination]").val()
            );
            newPicture.setAttribute(
              "src",
              data[x].substring(
                data[x].indexOf("as /static/") + 4,
                data[x].length + 1
              )
            );
            //create check mark division
            checkMarkDiv = document.createElement("div");
            checkMarkDiv.setAttribute("class", "overlay");
            checkMarkDiv.setAttribute("id", "c" + increment);
            //create checkmark image
            checkMarkImage = document.createElement("img");
            checkMarkImage.setAttribute("class", "checkmark");
            checkMarkImage.setAttribute("src", "/static/checkmark.png");
            //append check mark to picture to checkmark division, append checkmark division to picturebox, append picture to picturebox, append picturebox as
            pictureContainer.appendChild(newPictureBox);
            newPictureBox.appendChild(newPicture);
            newPictureBox.appendChild(checkMarkDiv);
            checkMarkDiv.appendChild(document.createElement("div"));
            checkMarkDiv.appendChild(checkMarkImage);

            console.log($("select[name=scrapeDestination]").val());
            folderSelect($("select[name=scrapeDestination]").val());
            //rerun show photo function
          }
        }
      }

      // here we will handle errors and validation messages
    ),
    (scrapeLog = setInterval(function scrapePictureLog(data) {
      $.ajax({
        type: "GET", // define the type of HTTP verb we want to use (POST for our form)
        contentType: "application/json",
        url: "_scrape_Request", // the url where we want to POST
        data: JSON.stringify(formData), // our data object
        dataType: "json", // what type of data do we expect back from the server
        encode: true,
        success: function (data) {
          console.log(data);
          document.getElementById("SI1").innerHTML = "";
          for (let i = 0; i < Object.keys(data).length; i++) {
            console.log("updating status");
            document.getElementById("SI1").innerHTML += data[i];
            document.getElementById("SI1").innerHTML += "<br>";
          }
          console.log("still on: " + scrapeProgress);
          if (scrapeProgress != 1) {
            console.log("turning off");
            clearInterval(scrapeLog);
          }
        },
      });
    }, 1000));

  // stop the form from submitting the normal way and refreshing the page
  event.preventDefault();
});

//show/hide pictures based upon folder selection.
function folderSelect(folder) {
  console.log("show folder: " + folder);
  var allPics = document.getElementsByClassName("pictureBox");
  for (i = 0; i < allPics.length; i++) {
    if (
      allPics[i].id.substring(0, allPics[i].id.lastIndexOf("/") + 1) == folder
    ) {
      allPics[i].style.display = "block";
    } else {
      console.log(allPics[i].alt);
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
