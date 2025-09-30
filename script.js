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
      exifTableContainer.style.display = "none";

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
          exifTableContainer.style.display = "block";

          if(Object.keys(allMetaData).length === 0){
            exifTableContainer.innerHTML = "<p>No EXIF data found.</p>";
            return;
          }

          // Create simple clean table like your first example
          let table = document.createElement("table");
          table.style.width = "100%";
          table.style.borderCollapse = "collapse";
          table.style.marginTop = "20px";
          table.style.fontFamily = "Arial, sans-serif";
          
          // Create header
          let thead = document.createElement("thead");
          let headerRow = document.createElement("tr");
          
          let th1 = document.createElement("th");
          th1.textContent = "Tag";
          th1.style.border = "1px solid #ddd";
          th1.style.padding = "8px";
          th1.style.backgroundColor = "#f2f2f2";
          th1.style.textAlign = "left";
          
          let th2 = document.createElement("th");
          th2.textContent = "Value";
          th2.style.border = "1px solid #ddd";
          th2.style.padding = "8px";
          th2.style.backgroundColor = "#f2f2f2";
          th2.style.textAlign = "left";
          
          headerRow.appendChild(th1);
          headerRow.appendChild(th2);
          thead.appendChild(headerRow);
          table.appendChild(thead);

          // Create table body
          let tbody = document.createElement("tbody");

          // Add file size
          if(fileInput.files && fileInput.files[0]){
            let fileSize = (fileInput.files[0].size / 1024 / 1024).toFixed(2);
            let row = document.createElement("tr");
            
            let td1 = document.createElement("td");
            td1.textContent = "File Size";
            td1.style.border = "1px solid #ddd";
            td1.style.padding = "8px";
            
            let td2 = document.createElement("td");
            td2.textContent = fileSize + " MB";
            td2.style.border = "1px solid #ddd";
            td2.style.padding = "8px";
            
            row.appendChild(td1);
            row.appendChild(td2);
            tbody.appendChild(row);
          }

          // Define important tags to show
          const importantTags = {
            'Software': 'Software',
            'Make': 'Camera Make', 
            'Model': 'Camera Model',
            'DateTimeOriginal': 'Date Taken',
            'GPSLatitudeRef': 'GPS Latitude Ref',
            'GPSLatitude': 'GPS Latitude',
            'GPSLongitudeRef': 'GPS Longitude Ref',
            'GPSLongitude': 'GPS Longitude',
            'ImageWidth': 'Image Width',
            'ImageHeight': 'Image Height'
          };

          let hasImportantData = false;

          for(let tag in importantTags){
            if(allMetaData[tag] !== undefined && allMetaData[tag] !== null && allMetaData[tag] !== ""){
              hasImportantData = true;
              let value = allMetaData[tag];
              
              let row = document.createElement("tr");
              
              let td1 = document.createElement("td");
              td1.textContent = importantTags[tag];
              td1.style.border = "1px solid #ddd";
              td1.style.padding = "8px";
              
              let td2 = document.createElement("td");
              td2.textContent = value;
              td2.style.border = "1px solid #ddd";
              td2.style.padding = "8px";
              
              row.appendChild(td1);
              row.appendChild(td2);
              tbody.appendChild(row);
            }
          }

          table.appendChild(tbody);
          exifTableContainer.innerHTML = "";
          exifTableContainer.appendChild(table);

          if(!hasImportantData){
            exifTableContainer.innerHTML = "<p>No important EXIF data found.</p>";
          }
        });
      };
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
});

// LOGIN / SIGNUP PANEL LOGIC (keep this same)
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
