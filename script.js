let fileInput = document.getElementById("fileInput");
let uploadBox = document.getElementById("uploadBox");
let icon = document.getElementById("icon");
let text = document.getElementById("text");
let showExifBtn = document.getElementById("showExifBtn");
let exifTableContainer = document.getElementById("exifTableContainer");

// IMAGE UPLOAD
fileInput.addEventListener("change", function() {
  if(fileInput.files && fileInput.files[0]){
    let reader = new FileReader();

    reader.onload = function(event){
      // Clear old image & table
      uploadBox.querySelectorAll("img").forEach(i => i.remove());
      exifTableContainer.innerHTML = "";
      exifTableContainer.style.display = "none"; // hide table until needed

      icon.style.display = "none";
      text.style.display = "none";

      // Show uploaded image
      let img = document.createElement("img");
      img.src = event.target.result;
      img.style.maxWidth = "90%";
      img.style.maxHeight = "300px";
      img.style.marginBottom = "10px";
      uploadBox.appendChild(img);

      // Show EXIF button
      showExifBtn.style.display = "inline-block";

      showExifBtn.onclick = function() {
        EXIF.getData(img, function() {
          let allMetaData = EXIF.getAllTags(this);

          exifTableContainer.style.display = "block"; // show only now

          if(Object.keys(allMetaData).length === 0){
            exifTableContainer.innerHTML = "<p>No EXIF data found.</p>";
            return;
          }

          let table = document.createElement("table");
          table.innerHTML = `<thead>
            <tr><th>Tag</th><th>Value</th></tr>
          </thead><tbody></tbody>`;
          let tbody = table.querySelector("tbody");

          for(let tag in allMetaData){
            let value = allMetaData[tag];
            if(typeof value === 'string' && value.length > 30){
              value = value.substring(0,30) + "...";
            }
            let row = document.createElement("tr");
            row.innerHTML = `<td>${tag}</td><td>${value}</td>`;
            tbody.appendChild(row);
          }

          exifTableContainer.innerHTML = "";
          exifTableContainer.appendChild(table);
        });
      };
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
});

// LOGIN / SIGNUP PANEL LOGIC
function openLogin(){
  document.getElementById("loginpanel").classList.add("active");
  document.getElementById("overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLogin(){
  document.getElementById("loginpanel").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

function openSignin(){
  document.getElementById("signinpanel").classList.add("active");
  document.getElementById("overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeSignin(){
  document.getElementById("signinpanel").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

document.getElementById("overlay").addEventListener("click", function(){
  closeLogin(); closeSignin();
});

document.getElementById("openSignup").addEventListener("click", function(e){
  e.preventDefault(); closeLogin(); openSignin();
});
document.getElementById("openLogin").addEventListener("click", function(e){
  e.preventDefault(); closeSignin(); openLogin();
});
