
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

            data["sidebar"].forEach(function(val){
                let tml = ` <li class="nav-item">
                                <a href="${val['url']}" class="nav-link {% if '${val['name']}' in segment %}  {% endif %}">
                                    <i class="nav-icon ${val["icon"]}"></i>
                                    <p>${val['name']}</p>
                                </a>
                            </li>`;

                let a = document.getElementsByClassName('nav-sidebar')[0];
                if(a){
                    a.innerHTML +=tml;
                }
            });
        });
    })
    .catch(function (error) {
        console.log("Fetch error: " + error);
    });
}

sidebarReadBackend()

