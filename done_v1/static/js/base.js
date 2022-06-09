

let wrapper = document.getElementById('wrapper');
let sidebar_toggle = document.getElementById('menu-toggle');
sidebar_toggle.onclick=function(){
    wrapper.classList.toggle('toggled');
}



function sidebarReadBackend() {
    let entry = {
        command: 'READ'
    };

    fetch(`${window.origin}/backend`, {
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
            data["sidebar"]["order"].forEach(function(val, idx){
                let tml = `<li class="nav-item">
                            <a href="${val['url']}" class="nav-link" aria-current="page">
                            <i class="${val["icon"]}"></i>
                            ${val['name']}
                            </a>
                        </li>`;
                document.getElementById('base-sidebar').innerHTML += tml;
            });
        });
    })
    .catch(function (error) {
        console.log("Fetch error: " + error);
    });
}

sidebarReadBackend()

