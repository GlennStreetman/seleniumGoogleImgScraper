let clickedImageList = {};
let staticPath = "E:/Flask/pictureApp/pictureApp/static/pictures/";

function getFileName(indexRef) {
  imagePath = clickedImageList[indexRef];

  fileName = imagePath.substring(
    imagePath.lastIndexOf("/") + 1,
    imagePath.lastIndexOf(".")
  );

  return fileName;
}

function getFilePath(indexRef) {
  imagePath = clickedImageList[indexRef];
  filePath = imagePath.substring(
    imagePath.lastIndexOf("static/") + 7,
    imagePath.lastIndexOf("/") + 1
  );
  return filePath;
}

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

function updateNav() {
  document.getElementById("mySidenav").innerHTML = ""; //remove all inner html from sidebar
  document.getElementById("mySidenav").innerHTML += //remove all from nav bar
    "<button class='sideToggle' onclick='resetNav()'><i class='fa fa-close'></i></button>";
  document.getElementById("mySidenav").innerHTML += //show bulk move modal
    "<button class='sideToggle' onclick='bulkMoveModal()'><i class='fa fa-folder-open'></i></button>";
  document.getElementById("mySidenav").innerHTML += //hide sidebar
    "<button class='sideToggle' onclick='closeNav()'><i class='fa fa-arrow-left'></i></button>";
  for (i = 0; i < Object.keys(clickedImageList).length; i++) {
    //add links for all selected images to sidebar
    var imagelistitem =
      "<button class='sidePic' onclick='showModal(" +
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

function hideToggle() {
  if (Object.keys(clickedImageList).length == 0) {
    document.getElementById("toggleButton").style.display = "none";
  } else {
    document.getElementById("toggleButton").style.display = "block";
  }
}

function openNav() {
  //Adjust the padding to make room for sidebar.
  document.getElementById("mySidenav").style.width = "20%";
  document.getElementsByClassName("pictureContainer")[0].style.paddingLeft =
    "20%";
  document.getElementsByClassName("pictureContainer")[0].style.paddingRight =
    "0%";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementsByClassName("pictureContainer")[0].style.paddingLeft =
    "10%";
  document.getElementsByClassName("pictureContainer")[0].style.paddingRight =
    "10%";
}

function resetNav() {
  for (img in clickedImageList) {
    imgClick(img);
    updateNav();
    closeNav();
  }
}

function addFolderDropdown(folderPath) {
  // Create an Option object
  var opt = document.createElement("option");

  // Assign text and value to Option object
  opt.text = folderPath;
  opt.value = folderPath;

  // Add an Option object to Drop Down List Box
  document.getElementById("newFolderFilePath").options.add(opt);
  document.getElementById("modalFilePath").options.add(opt);
  document.getElementById("topBarFolderList").innerHTML +=
    "<a href='#' onclick=folderSelect('" +
    folderPath +
    "');>" +
    folderPath +
    "</a>";
}

function showModal(pictureID) {
  document.getElementById("modalPictureName").value = getFileName(pictureID);
  document.getElementById("modalFilePath").selected = getFilePath(pictureID);
  photo = document.getElementsByClassName("img-responsive");
  photo[0].src = clickedImageList[pictureID];
  photo[0].id = Object.keys(clickedImageList)[pictureID];
  document.getElementById("hiddenModel").click();
}

function newFolderModal() {
  document.getElementById("newFileModalButton").click();
}

function bulkMoveModal() {
  document.getElementById("bulkMoveModalButton").click();
}

// When the user clicks on <span> (x), close the modal
function hideModal() {
  modal = document.getElementById("pictureModal");
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  modal = document.getElementById("pictureModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

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
        document.getElementById("hiddenModel").click();
      }

      // here we will handle errors and validation messages
    });

  // stop the form from submitting the normal way and refreshing the page
  event.preventDefault();
});

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
      // log data to the console so we can see
      console.log(data);
      if (data["error"] != "none") {
        alert(data["error"]);
      } else {
        alert(data["success"]);
        document.getElementById("newFileModalButton").click();
        addFolderDropdown(updateDropdown);
      }

      // here we will handle errors and validation messages
    });

  // stop the form from submitting the normal way and refreshing the page
  event.preventDefault();
});

$("#bulkMoveFiles").submit(function (event) {
  // get the form data
  var formData = {
    selectedPictures: clickedImageList,
    newFolderPath: $("select[name=bulkDestinationPath]").val(),
  };

  console.log(formData);

  $.ajax({
    type: "POST", // define the type of HTTP verb we want to use (POST for our form)
    contentType: "application/json",
    url: "_bulk_Move", // the url where we want to POST
    data: JSON.stringify(formData), // our data object
    dataType: "json", // what type of data do we expect back from the server
    encode: true,
  })
    // using the done promise callback
    .done(
      function (data) {
        // log data to the console so we can see
        console.log(data);
        alert(data);
        //Update location and hide moved pictures
        //set clickedImageList = {}
      }

      // here we will handle errors and validation messages
    );

  // stop the form from submitting the normal way and refreshing the page
  event.preventDefault();
});

function folderSelect(folder) {
  console.log(folder);
  var allPics = document.getElementsByClassName("pictureBox");
  for (i = 0; i < allPics.length; i++) {
    if (allPics[i].id == folder) {
      allPics[i].style.display = "block";
    } else {
      console.log(allPics[i].alt);
      allPics[i].style.display = "none";
    }
  }
}

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
