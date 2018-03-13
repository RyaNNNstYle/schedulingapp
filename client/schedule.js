var Scheduler = function() {
    var postUrl = function() {
        var postOnTwitter = document.getElementById('postOnTwitter');
        var postOnFacebook = document.getElementById('postOnFacebook');
        var postUrl = document.getElementById('postUrl');
        var fbLoginData = JSON.parse(sessionStorage.getItem('fbLoginPermissions'));
        var twLoginData = JSON.parse(sessionStorage.getItem('twLoginPermissions'));

        var validationObject = postValidation(postOnFacebook.checked, postOnTwitter.checked, postUrl.value, fbLoginData, twLoginData);

        if(!validationObject.valid) {
            alert(validationObject.errorMessage);
            return;
        }

        var autoschedule = document.getElementById('autoschedule');

        var http = new XMLHttpRequest();
        var url = "schedule";

        http.open("POST", url, true);
        
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        if(postOnFacebook.checked) {
            var fbPostData = {
                'Url': postUrl.value,
                'Autoschedule': autoschedule.checked,
                'UserID': fbLoginData.authResponse.userID,
                'AccessToken': fbLoginData.authResponse.accessToken,
                'Target': 'Facebook'
            }

            http.send(JSON.stringify(fbPostData));
        }

        http.onreadystatechange = function() {
            if(this.status == 200 && this.readyState == 4) {
                alert(this.responseText);
            }
        }
    }

    var postValidation = function(postOnFacebook, postOnTwitter, postUrl, fbData, twData) {
        var retObj = {};

        retObj.valid = true;
        retObj.errorMessage = '';

        if(postUrl == '') {
            retObj.errorMessage = 'Input value is required';
            retObj.valid = false;
            return retObj;
        }

        if(!postOnFacebook && !postOnTwitter) {
            retObj.errorMessage = 'Target is required';
            retObj.valid = false;
            return retObj;
        }

        if((postOnFacebook && !fbData) || (postOnFacebook && fbData.status != 'connected')) {
            retObj.errorMessage = 'In order to post on Facebook, you need to connect Facebook account';
            retObj.valid = false;
            return retObj;
        }

        if((postOnTwitter && !twData) || (postOnTwitter && twData.status != 'connected')) {
            retObj.errorMessage = 'In order to post on Twitter, you need to connect Twitter account';
            retObj.valid = false;   
            return retObj;
        }

        return retObj;
    }

    return {
        postUrl: postUrl
    }
}();