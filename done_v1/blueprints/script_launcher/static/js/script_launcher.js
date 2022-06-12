

$(function () {

    var script_list = {};

    function scriptLauncherAddItem(key,value) {
        let script_list_element = `\
        <li class="callout callout-danger">\
            ${key}\
            <div class="float-right"><input type="checkbox" name="${key}" checked data-bootstrap-switch data-off-color="danger" data-on-color="success"></div>\
        </li>`;
        $('#script-list').append(script_list_element);
        $(`input[name="${key}"]`).bootstrapSwitch('state', value == "on");
        $(`input[name="${key}"]`).on('switchChange.bootstrapSwitch',function(event, state)
        {
            scriptLauncherListWriteBackend(event, state);
        });
    }

    function scriptLauncherListWriteBackend(event, state) {
        // scriptLauncherGetOrder
        console.log(event,state);
        script_list[event.target.name] = state ? 'on' : 'off';
        let entry = {
            script_list: script_list,
            command: 'WRITE'
        };

        fetch(`${window.origin}/script_launcher/backend`, {
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
            //console.log(data);
        });
        })
        .catch(function (error) {
            console.log("Fetch error: " + error);
        });
    }

    function scriptLauncherReadBackend() {

        let entry = {
            command: 'READ'
        };

        fetch(`${window.origin}/script_launcher/backend`, {
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
            script_list = data;
            console.log("from script_launcher",script_list);
            for (const [key, value] of Object.entries(script_list)) {
                console.log(key, value);
                scriptLauncherAddItem(key,value);
            }
        });
        })
        .catch(function (error) {
            console.log("Fetch error: " + error);
        });
    }

    scriptLauncherReadBackend()

})
