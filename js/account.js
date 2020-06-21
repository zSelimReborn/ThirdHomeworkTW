$(function() {
    let generateToken = (username, password) => {
        let pattern = username + ':' + password;
        let hash = btoa(pattern);
        return hash;
      
    };

    measures = [];

    let getMeasures = () => {
        data = {};
        if (!localStorage["auth_token"]) {
            return;
        }

        window.clearMarkers();
        data["token"] = localStorage["auth_token"]
        $.ajax({
            url: 'http://localhost:5000/measures',
            type: 'GET',
            contentType: 'application/json',
            success: function (data) {
                result = JSON.parse(data);
                if (result["success"] === false) {
                    window.addToast("danger", result["message"]);
                    return;
                }

                for (marker of result) {
                    window.addMarker(marker["latitude"], marker["longitude"], marker["message"], false, true);
                }
            },

            error: function() {
                window.addToast("danger", "Impossibile contattare il server per recuperare le misure");
            },

            headers: data
        });
    };

    let sendToken = (token) => {
        $.ajax({
            url: 'http://localhost:5000/login',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                result = JSON.parse(data);
                if (result["success"] === false) {
                    window.addToast("danger", result["message"]);
                    return;
                }

                localStorage["auth_token"] = token;
                window.addToast("success", "Login effettuato correttamente");

                $(".login-wrapper.not-logged-in").removeClass("active");
                $(".login-wrapper.logged-in").addClass("active");

                getMeasures();
            },

            error: function() {
                addToast("danger", "Impossibile contattare il server per il login!");
            },

            data: JSON.stringify({"token": token})
        });

    };

    $(".login-wrapper .login-btn").on("click", function() {
        let username = $("#username").val();
        let password = $("#password").val();

        let token = generateToken(username, password);
        sendToken(token);
    });

    $(".login-wrapper .logout-btn").on("click", function() {
        localStorage["auth_token"] = "";
        $(".login-wrapper.not-logged-in").addClass("active");
        $(".login-wrapper.logged-in").removeClass("active");

        window.clearMarkers();
    }); 

    if (localStorage["auth_token"]) {
        $(".login-wrapper.not-logged-in").removeClass("active");
        $(".login-wrapper.logged-in").addClass("active");
    } 

    getMeasures();
});