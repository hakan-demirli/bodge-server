
$(function () {

$('#repo-submit').on('click',function(e){
    console.log('hi');
    settingsWriteBackend();
});


function settingsWriteBackend() {

    let entry = {
        command: 'PUSH'
    };

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
});