$(function() {
    let map = L.map('map');
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 17,
            attribution: 'By Pasquale Giaccio & Alessio Romaniello',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(map);

    let marker = L.marker([0, 0]).addTo(map);
    marker.bindPopup("Tu sei qui!").openPopup();

    let count = 0;
    let positions = localStorage["positions"];

    if (typeof positions === 'undefined' || positions === "") {
        positions = [];
    } else {
        positions = JSON.parse(positions);
    }

    let printLastPositions = () => {
        let lastPosition = positions[positions.length - 1];
        
        let list = $(".list-positions");
        let li = $("<li>Lettura #" + count + " " + lastPosition['latitude'].toFixed(7) + " - " + lastPosition["longitude"].toFixed(7) + "</li>");

        let items = list.find("li").length;
        if (items >= 5) {
            list.find("li").first().remove();
        } 

        list.append(li);
    };

    let startAnimation = (callback) => {
        let wrapper = $( "#button-wrapper" );
        if (wrapper.not(".checked")) {
            wrapper.addClass("checked");
            setTimeout(function(){
                wrapper.removeClass("checked");
                callback();
            }, 6000);
        }

    };

    let addToast = (type, message) => {
        let toastWrapper = $(".toast-wrapper");
        toastWrapper.html("");
        
        let toast = $("<div class='toast toast-" + type + "'>" + message + "</div>")
        toast.hide();
        toastWrapper.append(toast);
        toast.fadeIn();

        setTimeout(function() {
            toast.fadeOut();
        }, 2000);
    };  

    window.addToast = addToast;

    let sendPosition = (latitude, longitude, text) => {
        data = {
            "latitude": latitude,
            "longitude": longitude,
            "message": text
        };

        if (localStorage["auth_token"]) {
            data["token"] = localStorage["auth_token"];
        }

        $.ajax({
            url: 'http://localhost:5000/measures',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                measure = JSON.parse(data);
                if (measure["success"] === false) {
                    addToast("danger", "Problema: " + measure["message"]);
                    return;
                }

                addToast("success", "Misura aggiunta correttamente");
            },

            error: function() {
                addToast("danger", "Impossibile contattare il server");
            },

            data: JSON.stringify(data)
        });

    };

    allMarkers = [];
    let addMarker = (latitude, longitude, text, shouldAnimate = true, oldMarker = false) => {
        let errorControl = $(".errors-wrapper .error");
        let successControl = $(".success-wrapper .success");

        successControl.text("");
        errorControl.text("");

        if (!latitude || typeof latitude === 'undefined' || !longitude || typeof longitude === 'undefined') {
            errorControl.text("Latitudine e longitudine non valide");
            errorControl.addClass("active");
            return;
        }

        errorControl.removeClass("active");

        let createMarker = () => {
            let marker = L.marker([latitude, longitude]).addTo(map);
            let index = allMarkers.push(marker) - 1;

            let measuresListWrapper = $(".measures-list-container");
            let liWrapper = $("<li></li>");
            let markerHtml = $("<div class='marker-html'></div>");
            let markerContent = $("<p class='marker-content'>" + text + "</p>");
            let markerActions = $("<div class='marker-actions' data-marker-index='" + index + "'><button class='btn btn-danger disable-btn active'>Disattiva</button><button class='btn btn-success enable-btn'>Attiva</button><button class='btn btn-primary edit-btn'>Modifica</button></div>");

            markerHtml.append(markerContent);
            markerHtml.append(markerActions);
            liWrapper.append(markerHtml);

            measuresListWrapper.append(liWrapper);
            
            if (text != "") {
                marker.bindPopup(text).openPopup();
            }

            $('#text').val("");
            $('#latitude').val("");
            $('#longitude').val("");

            if (!oldMarker)  {
                successControl.text("Misura aggiunta correttamente!");
            }


            return marker;
        }
        
        if (shouldAnimate) {
            startAnimation(createMarker);
        } else {
            createMarker();
        }

        if (!oldMarker) {
            sendPosition(latitude, longitude, text);
        }
    };

    $(document).on("click", ".marker-html .marker-actions .btn", function() {
        let element = $(this);
        let index = element.closest(".marker-actions").attr("data-marker-index");
        let content = element.closest(".marker-html").find(".marker-content").text().trim();

        let marker = allMarkers[index];
        if (element.hasClass("disable-btn")) {
            map.removeLayer(marker);
            element.removeClass("active");
            element.closest(".marker-actions").find(".enable-btn").addClass("active");
        } else if (element.hasClass("enable-btn")) {
            marker.addTo(map);
            element.removeClass("active");
            element.closest(".marker-actions").find(".disable-btn").addClass("active");
        } else if (element.hasClass("edit-btn")) {
            $('.edit-marker-message #edit_marker_id').val(index);
            $('.edit-marker-message #edit_marker_message').val(content);
            $('.edit-marker-message.modal').modal();
        }
    });

    $(document).on("click", ".edit-marker-message.modal .edit-marker-btn", function() {
        let markerIndex = parseInt($('.edit-marker-message #edit_marker_id').val());
        let newContent = $('.edit-marker-message #edit_marker_message').val();

        marker = allMarkers[markerIndex];
        marker.bindPopup(newContent).openPopup();

        $('.edit-marker-message.modal').modal('hide');
    });

    let clearMarkers = () => {
        for (marker of allMarkers) {
            map.removeLayer(marker);
        }

        $(".measures-list-container").html("");
        allMarkers = [];
    };

    window.clearMarkers = clearMarkers;
    window.addMarker = addMarker;

    let onSubmitMarker = () => {
        let latitude, longitude, text;
        latitude = parseFloat($('#latitude').val());
        longitude = parseFloat($('#longitude').val());
        text = $('#text').val();

        addMarker(latitude, longitude, text);
    };

    $('#addMarkerButton').on('click', onSubmitMarker);

    let printAverage = () => {
        let lastElementsLenght = 5;
        let lastElements = positions.slice(Math.max(positions.length - lastElementsLenght, 0));

        let avgLat = 0;
        let avgLong = 0;

        for (element of lastElements) {
            avgLat += element["latitude"];
            avgLong += element["longitude"];
        }

        avgLat /= lastElementsLenght;
        avgLong /= lastElementsLenght;

        $("#avg-positions").html(avgLat + " - " + avgLong);
    };

    let onCurrentPosition = (position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        let lanLongObj = {"latitude": latitude, "longitude": longitude};
        
        positions.push(lanLongObj);
        localStorage["positions"] = JSON.stringify(positions);

        let zoom = (map.getZoom())? map.getZoom() : 17;

        map.setView([latitude, longitude], zoom);

        addMarker(latitude, longitude, "Sei stato qui!", false, true);

        $("#latlng-text").html("Lettura attuale: <br>" + latitude.toFixed(7) + " - " + longitude.toFixed(7));
        count++;

        printLastPositions();
        printAverage();
    };
    
    let getCurrentPosition = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onCurrentPosition, function(err) {
                alert(`Errore geolocalizzazione: ERROR(${err.code}): ${err.message}`);
            });
          } else {
              alert("Abilita geolocalizzazione")
          }        
    };

    let onMapClick = (e) => {
        $('.marker-message.modal').modal();

        let latitude = e.latlng["lat"];
        let longitude = e.latlng["lng"];

        let message = latitude.toFixed(7) + " - " + longitude.toFixed(7);
        
        $("#marker_message").val(message);
        $("#marker_latitude").val(latitude);
        $("#marker_longitude").val(longitude);
    };

    let onSubmitModalMarker = () => {
        let latitude = $("#marker_latitude").val();
        let longitude = $("#marker_longitude").val();
        let message = $("#marker_message").val();

        addMarker(latitude, longitude, message, false);
        $('.marker-message.modal').modal('hide');
    };

    $(".modal.marker-message .save-marker").on("click", onSubmitModalMarker);    
    map.on('click', onMapClick);

    getCurrentPosition();
    setInterval(getCurrentPosition, 20000);
});