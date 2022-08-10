
$(function () {

var padlock_state = 0;
$('#repo-submit').on('click',function(e){

    console.log('hi');
    $('#repo-lock').toggleClass('fa-lock');
    $('#repo-lock').toggleClass('fa-lock-open');
    if(padlock_state) {
        $("#git-repo").attr("disabled", "");
        let entry = {
            command: 'CHANGE_REMOTE',
            git_repo_url: $("#git-repo").val()
        };
        settingsWriteBackend(entry)
    }else{
        $("#git-repo").removeAttr("disabled");
    }

    padlock_state = !padlock_state;
});

$('#repo-sync').on('click',function(e){
    let entry = {
        command: 'SYNC_REPO'
    };
    settingsWriteBackend(entry)
});

function settingsWriteBackend(entry) {

    fetch(`${window.origin}/settings/backend`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(entry),
        cache: "no-cache",
        headers: new Headers({"content-type": "application/json"})
    }).then(function (response) {
        if (response.status !== 200) {
            console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }
        response.json().then(function (data) {});
    })
    .catch(function (error) {
        console.log("Fetch error: " + error);
    });
}

function settingsReadBackend(entry) {

    fetch(`${window.origin}/settings/backend`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(entry),
        cache: "no-cache",
        headers: new Headers({"content-type": "application/json"})
    }).then(function (response) {
        if (response.status !== 200) {
            console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }
        response.json().then(function (data) {
            $("#git-repo").val(data['git_repo_url'])
        });
    })
    .catch(function (error) {
        console.log("Fetch error: " + error);
    });
}

window.onerror = function(e){
    document.getElementById('error-log').innerHTML = e.toString();
}

let entry = {
    command: 'READ'
};

settingsReadBackend(entry)

});