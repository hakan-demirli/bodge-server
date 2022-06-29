
var serializedData = [];
let serializedFull;

let grid = GridStack.init({
minRow: 1, // don't let it collapse when empty
cellHeight: '7rem'
});

grid.on('added removed change', function(e, items) {
    let str = '';
    items.forEach(function(item) { str += ' (x,y)=' + item.x + ',' + item.y; });
    console.log(e.type + ' ' + items.length + ' items:' + str );
});

// 2.x method - just saving list of widgets with content (default)
loadGrid = function() {
    grid.load(serializedData, true); // update things
}

$('iframe').css('pointer-events', 'none');
// 3.1 full method saving the grid options + children (which is recursive for nested grids)
saveFullGrid = function() {
    serializedFull = grid.save(true, true);
    serializedData = serializedFull.children;
    document.querySelector('#saved-data').value = JSON.stringify(serializedFull, null, '  ');
    writeBackend();
}

clearGrid = function() {
    grid.removeAll();
}

function readBackend() {
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
            console.log('reading backend dash: ',data);
            data["cards"].forEach(function(val){
                let cnt = `<div class="my-card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="${val["icon"]}"></i>
                                    ${val["name"]}
                                </h3>
                                <div class="card-tools">
                                    <button type="button" class="btn btn-tool btn-sm" onClick="grid.removeWidget(this.parentNode.parentNode.parentNode.parentNode.parentNode);"><i class="fas fa-times"></i></button>
                                </div>
                            </div>
                            <div id="resizable">
                                <iframe src="${val["url"]}" frameborder="0" id="elemId"></iframe>
                            </div>
                           </div>`;
                let uid = guid();
                serializedData.push({w: 1, h: 1, id: uid, content: cnt});
            });
            console.log('serialized data: ',serializedData);
            loadGrid();
        });
    })
    .catch(function (error) {
        console.log("Fetch error: " + error);
    });
}

function writeBackend() {

    let entry = {
        serializedData: serializedData,
        command: 'WRITE'
    };

    fetch(`${window.origin}/dashboard/backend`, {
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

/**
* Generates a GUID string.
* @returns {string} The generated GUID.
* @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
* @author Slavik Meltser.
* @link http://slavik.meltser.info/?p=142
*/
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

readBackend();

