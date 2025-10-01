let fileInput = document.getElementById("fileInput");
let uploadBox = document.getElementById("uploadBox");
let icon = document.getElementById("icon");
let text = document.getElementById("text");
let showExifBtn = document.getElementById("showExifBtn");
let exifTableContainer = document.getElementById("exifTableContainer");
let mapContainer = document.getElementById("mapContainer");

// IMAGE UPLOAD
fileInput.addEventListener("change", function () {
  if (fileInput.files && fileInput.files[0]) {
    let reader = new FileReader();

    reader.onload = function (event) {
      // Clear old image & table
      uploadBox.querySelectorAll("img").forEach(i => i.remove());
      exifTableContainer.innerHTML = "";
      exifTableContainer.style.display = "none";
      mapContainer.style.display = "none";
      mapContainer.innerHTML = `
  <h3 style="text-align: center; margin-bottom: 15px;">Image Location Map</h3>
  <div id="map" style="height: 400px; width: 100%; border: 1px solid #ddd; border-radius: 6px;"></div>
  <div id="safetyInfo" style="margin-top: 10px; text-align: center;"></div>
`;

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

      showExifBtn.onclick = function () {
        EXIF.getData(img, function () {
          let allMetaData = EXIF.getAllTags(this);
          exifTableContainer.style.display = "block";

          if (Object.keys(allMetaData).length === 0) {
            exifTableContainer.innerHTML = "<p>No EXIF data found.</p>";
            return;
          }

          // Create simple clean table
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
          if (fileInput.files && fileInput.files[0]) {
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
          let gpsData = null;

          for (let tag in importantTags) {
            if (allMetaData[tag] !== undefined && allMetaData[tag] !== null && allMetaData[tag] !== "") {
              hasImportantData = true;
              let value = allMetaData[tag];

              // Store GPS data for mapping
              if (tag === 'GPSLatitude' && allMetaData['GPSLatitudeRef'] && allMetaData['GPSLongitude'] && allMetaData['GPSLongitudeRef']) {
                gpsData = {
                  lat: allMetaData['GPSLatitude'],
                  latRef: allMetaData['GPSLatitudeRef'],
                  lng: allMetaData['GPSLongitude'],
                  lngRef: allMetaData['GPSLongitudeRef']
                };
              }

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

          // Show map if GPS data is available
          if (gpsData) {
            plotOnMap(gpsData);
          }

          if (!hasImportantData) {
            exifTableContainer.innerHTML = "<p>No important EXIF data found.</p>";
          }
        });
      };
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
});

// Function to plot location on map
function plotOnMap(gpsData) {
  const latitude = convertGPSToDecimal(gpsData.lat, gpsData.latRef);
  const longitude = convertGPSToDecimal(gpsData.lng, gpsData.lngRef);

  if (!latitude || !longitude) return;

  mapContainer.style.display = "block";

  // Initialize map
  const map = L.map('map').setView([latitude, longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Classify safety
  const safetyLevel = classifySafety(latitude, longitude);
  const markerColor = getSafetyColor(safetyLevel);

  // Add marker
  L.marker([latitude, longitude], {
    icon: L.divIcon({
      className: 'safety-marker',
      html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24]
    })
  }).addTo(map).bindPopup(`
        <strong>Image Location</strong><br>
        <b>Safety:</b> ${safetyLevel}<br>
        <b>Coordinates:</b> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
    `).openPopup();

  // Show safety info
  document.getElementById('safetyInfo').innerHTML = `
        <p><strong>Safety Classification:</strong> <span style="color: ${markerColor}; font-weight: bold">${safetyLevel}</span></p>
        <p><strong>Coordinates:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
    `;
}

// Convert GPS coordinates to decimal
function convertGPSToDecimal(gpsArray, ref) {
  if (!gpsArray || !Array.isArray(gpsArray)) return null;

  const degrees = gpsArray[0];
  const minutes = gpsArray[1];
  const seconds = gpsArray[2];

  let decimal = degrees + (minutes / 60) + (seconds / 3600);

  if (ref === 'S' || ref === 'W') {
    decimal = -decimal;
  }

  return decimal;
}


function classifySafety(lat, lon) {
  if (lat > 40 && lat < 41 && lon > -74 && lon < -73) {
    return 'Most Dangerous';
  } else if (lat > 34 && lat < 35 && lon > -118 && lon < -117) {
    return 'Danger';
  } else {
    return 'Safe';
  }
}

// Get color based on safety level
function getSafetyColor(safetyLevel) {
  switch (safetyLevel) {
    case 'Safe': return '#28a745';
    case 'Danger': return '#ffc107';
    case 'Most Dangerous': return '#dc3545';
    default: return '#007bff';
  }
}

// LOGIN / SIGNUP PANEL LOGIC
function openLogin() {
  document.getElementById("loginpanel").classList.add("active");
  document.getElementById("overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLogin() {
  document.getElementById("loginpanel").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

function openSignin() {
  document.getElementById("signinpanel").classList.add("active");
  document.getElementById("overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeSignin() {
  document.getElementById("signinpanel").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

document.getElementById("overlay").addEventListener("click", function () {
  closeLogin(); closeSignin();
});

document.getElementById("openSignup").addEventListener("click", function (e) {
  e.preventDefault(); closeLogin(); openSignin();
});
document.getElementById("openLogin").addEventListener("click", function (e) {
  e.preventDefault(); closeSignin(); openLogin();
});
