
$(function () {
'use strict'
    $('.connectedSortable').sortable({
    cancel: ".unsortable",
    update: function(e, ui) {

    },
    placeholder: 'sort-highlight',
    connectWith: '.connectedSortable',
    handle: '.card-header-drag',
    forcePlaceholderSize: true,
    zIndex: 999999
    })
    $('.connectedSortable .card-header-drag').css('cursor', 'move')


    function addEditCard(e){
        console.log(e.data.extra.row)
        let ak = `
        <div class="form-group">
            <textarea class="form-control" rows="${e.data.extra.row}" placeholder="Enter a note"></textarea>
            <button type="submit" class="btn btn-primary w-50" id="kanban-add-button"><i class="fa-solid fa-check"></i></button>
            <button type="submit" class="btn btn-secondary float-right w-50" id="kanban-cancel-button"><i class="fas fa-times"></i></button>
        </div>`;
        $(e.target.closest(`#${e.data.extra.name}-card`)).find(`#${e.data.extra.name}-body`).append(ak);
    }

    function removeCard(e) {
        e.target.closest('.form-group').remove();
    }
    function removeAddedCard(e) {
        e.target.closest('.card').remove();
        console.log(e.target.closest('#kanban-projects-body'))
    }
    function removeAddedProjectNode(e) {
        if (confirm('Delete? U sure?')){
            e.target.closest('.card').remove();
        }
    }
    var projects = {};
    function saveCard(e){
        let txt = $(e.target.closest('.form-group')).find('.form-control').val();
        let myguid = guid();
        let ak = `
        <div class="card">
            ${e.data.extra.header ?('<div class="card-header card-header-drag"></div>'):('')}
            <div class="card-body card-saved ${e.data.extra.type}" id=${myguid} style='white-space:pre'>${txt}</div><i class="${e.data.extra.icon}"></i>
        </div>`;
        let tmp = $(e.target.closest(`#${e.data.extra.name}-card`)).find(`#${e.data.extra.name}-body`);

        switch(e.data.extra.type) {
            case 'root':
                tmp.append(ak);
                removeCard(e);
                highlighted_root_guid = myguid;
                if(highlighted_root)
                    highlighted_root.toggleClass('bg-info');
                highlighted_root = tmp.children('.card').children(`#${myguid}`);
                console.log(projects);
                highlighted_root.toggleClass('bg-info');
                projects[highlighted_root_guid] = {txt:txt,childs:{}};
                break;
            case 'branch':
                if(!$.isEmptyObject(projects)){
                    highlighted_branch_guid = myguid;
                    console.log(projects)
                    console.log(projects[highlighted_root_guid])
                    projects[highlighted_root_guid]['childs'][highlighted_branch_guid] = {txt:txt,childs:{}};
                    tmp.append(ak);
                    removeCard(e);
                    if(highlighted_branch)
                        highlighted_branch.toggleClass('bg-info');
                    highlighted_branch = tmp.children('.card').children(`#${myguid}`);
                    highlighted_branch.toggleClass('bg-info');
                }else{
                    alert("Create a root first");
                }
                break;
            case 'leaf':
                if(!$.isEmptyObject(projects)){
                    highlighted_leaf_guid = myguid;
                    console.log(projects);
                    console.log( projects[highlighted_root_guid]['childs'][highlighted_branch_guid]);
                    projects[highlighted_root_guid]['childs'][highlighted_branch_guid]['childs'] = {txt:txt,childs:{}};
                    tmp.append(ak);
                    removeCard(e);
                    if(highlighted_leaf)
                        highlighted_leaf.toggleClass('bg-info');
                    highlighted_leaf = tmp.children('.card').children(`#${myguid}`);
                    highlighted_leaf.toggleClass('bg-info');
                }else{
                    alert("Create a root first");
                }
                break;
        }
    }
    $('#kanban-todo-tools').on("click",('.kanban-plus'),{ extra : {row:4,name:'kanban'}},addEditCard);
    $('#kanban-body').on("click",('#kanban-add-button'),{ extra : {name:'kanban',icon:"fa-solid fa-square-xmark",header:1}},saveCard);
    $('#kanban-body').on("click",('#kanban-cancel-button'),removeCard);
    $('.card-body, .fa-square-xmark').on("click",('.fa-square-xmark'),removeAddedCard);

    $('#kanban-projects-card,#kanban-projects-root-button  ').on("click",('#kanban-projects-root-button  '),{ extra : {row:1,name:'kanban-projects'}},addEditCard);
    $('#kanban-projects-card,#kanban-projects-branch-button').on("click",('#kanban-projects-branch-button'),{ extra : {row:1,name:'kanban-projects'}},addEditCard);
    $('#kanban-projects-card,#kanban-projects-leaf-button  ').on("click",('#kanban-projects-leaf-button  '),{ extra : {row:1,name:'kanban-projects'}},addEditCard);
    $('.kanban-projects-root  ').on("click",('#kanban-add-button'),{extra : {name:'kanban-projects',icon:"fa-solid fa-rectangle-xmark",header:0,type:'root'}},saveCard);
    $('.kanban-projects-branch').on("click",('#kanban-add-button'),{extra : {name:'kanban-projects',icon:"fa-solid fa-rectangle-xmark",header:0,type:'branch'}},saveCard);
    $('.kanban-projects-leaf  ').on("click",('#kanban-add-button'),{extra : {name:'kanban-projects',icon:"fa-solid fa-rectangle-xmark",header:0,type:'leaf'}},saveCard);
    $('.kanban-projects-root  ').on("click",('#kanban-cancel-button'),removeCard);
    $('.kanban-projects-branch').on("click",('#kanban-cancel-button'),removeCard);
    $('.kanban-projects-leaf  ').on("click",('#kanban-cancel-button'),removeCard);
    $('.card-body, .fa-rectangle-xmark').on("click",('.fa-rectangle-xmark'),removeAddedProjectNode);

    var highlighted_root = 0;
    var highlighted_branch = 0;
    var highlighted_leaf = 0;
    var highlighted_root_guid = 0;
    var highlighted_branch_guid = 0;
    var highlighted_leaf_guid = 0;

    $('.card').on("click",('.card-saved'),function(e) {

        if($(e.target).hasClass('root')){
            highlighted_root.toggleClass('bg-info');
            $(e.target).toggleClass('bg-info');
            if(highlighted_branch){
                highlighted_branch.closest('#kanban-projects-body').html("<div>hi</div>");
                recreate();
            }
            highlighted_root = $(e.target);
            highlighted_root_guid = $(e.target).attr('id');
            console.log(highlighted_root_guid);

        }
        if($(e.target).hasClass('leaf')){
            highlighted_leaf.toggleClass('bg-info');
            $(e.target).toggleClass('bg-info');
            highlighted_leaf = $(e.target)
        }
        if($(e.target).hasClass('branch')){
            highlighted_branch.toggleClass('bg-info');
            $(e.target).toggleClass('bg-info');
            highlighted_branch = $(e.target)
        }
        kanbanWriteBackend();
    });
    function recreate(){
        let akey = Object.keys(projects)[0];
        console.log('akey',akey);
        let adict = projects[akey]['childs'];
        console.log('adict',adict);}
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




 function kanbanWriteBackend() {

    let entry = {
        pro: projects,
        command: 'WRITE'
    };

    fetch(`${window.origin}/kanban/backend`, {
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
        console.log(data);
    });
    })
    .catch(function (error) {
        console.log("Fetch error: " + error);
    });
}
})