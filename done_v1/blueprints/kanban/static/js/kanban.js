
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
        let id = $(e.target).parent('.card').children('.card-saved').attr("id");
        console.log($(e.target).parent('.card').children('.card-saved').attr("id"));
        if(id == selected['root'] ||id == selected['branch'] ||id == selected['leaf']){
            alert("you can't delete selected items");
        }else{
            if (confirm('Delete? U sure?')){
                e.target.closest('.card').remove();
                delete projects[id];
                delete projects_selected[id];
            }
        }
        console.log(projects);
        console.log(projects_selected);
    }
    var projects = {};
    var projects_selected = {};
    var selected = {'root': '',
                    'branch': '',
                    'leaf': ''};
    var selected_old = {'root': '',
                    'branch': '',
                    'leaf': ''};

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
                projects[myguid] = {txt:txt,childs:{}};
                selectCardBackend(e.data.extra.type,myguid);
                recreateRightColumns(e.data.extra.type);
                selectCardFrontend(e.data.extra.type);
                break;
            case 'branch':
                if(selected['root'] != ''){
                    tmp.append(ak);
                    removeCard(e);
                    projects[selected['root']]['childs'][myguid] = {txt:txt,childs:{}};
                    selectCardBackend(e.data.extra.type,myguid);
                    recreateRightColumns(e.data.extra.type);
                    selectCardFrontend(e.data.extra.type);
                }
                break;
            case 'leaf':
                if(selected['branch'] != ''){
                    tmp.append(ak);
                    removeCard(e);
                    projects[selected['root']]['childs'][selected['branch']]['childs'][myguid] = {txt:txt,childs:{}};
                    selectCardBackend(e.data.extra.type,myguid);
                    recreateRightColumns(e.data.extra.type);
                    selectCardFrontend(e.data.extra.type);
                }
                break;
        }
        kanbanWriteBackend();
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


    $('.card').on("click",('.card-saved'),function(e) {

        if($(e.target).hasClass('root')){
            let column_type = 'root';
            selectCardBackend(column_type,$(e.target).attr('id'));
            recreateRightColumns(column_type);
            selectCardFrontend(column_type);
        }
        if($(e.target).hasClass('branch')){
            let column_type = 'branch';
            selectCardBackend(column_type,$(e.target).attr('id'));
            recreateRightColumns(column_type);
            selectCardFrontend(column_type);
        }
    });

    function recreateRightColumns(column_type){
        nukeRightColumns(column_type);
        let tmp = '';
        switch(column_type) {
            case 'root':
                if ($.isEmptyObject(projects[selected['root']]["childs"]))
                    break;
                for(var key in projects[selected['root']]["childs"]){
                    let txt =  projects[selected['root']]["childs"][key]['txt'];
                    let ak = `
                    <div class="card">
                        <div class="card-body card-saved branch" id=${key} style='white-space:pre'>${txt}</div><i class="fa-solid fa-rectangle-xmark"></i>
                    </div>`;
                    tmp = tmp + ak;
                }
                $(`.kanban-projects-branch`).children('#kanban-projects-body').html(tmp);

                if( selected['branch'] == '')
                break;
                if ($.isEmptyObject(projects[selected['root']]["childs"][selected['branch']]["childs"]))
                    break;

                tmp = '';
                for(var key in projects[selected['root']]["childs"][selected['branch']]["childs"]){
                    let txt =  projects[selected['root']]["childs"][selected['branch']]["childs"][key]['txt'];
                    let ak = `
                    <div class="card">
                        <div class="card-body card-saved leaf" id=${key} style='white-space:pre'>${txt}</div><i class="fa-solid fa-rectangle-xmark"></i>
                    </div>`;
                    tmp = tmp + ak;
                }
                $(`.kanban-projects-leaf`).children('#kanban-projects-body').html(tmp);
            break;
            case 'branch':
                if( selected['branch'] == '')
                    break;
                if ($.isEmptyObject(projects[selected['root']]["childs"][selected['branch']]["childs"]))
                    break;

                for(var key in projects[selected['root']]["childs"][selected['branch']]["childs"]){
                    let txt =  projects[selected['root']]["childs"][selected['branch']]["childs"][key]['txt'];
                    let ak = `
                    <div class="card">
                        <div class="card-body card-saved leaf" id=${key} style='white-space:pre'>${txt}</div><i class="fa-solid fa-rectangle-xmark"></i>
                    </div>`;
                    tmp = tmp + ak;
                }
                $(`.kanban-projects-leaf`).children('#kanban-projects-body').html(tmp);
            break;
        }
    }

    function selectCardFrontend(column_type){
        if (selected_old[column_type] != '')
            $(`.kanban-projects-${column_type}`).children('#kanban-projects-body').children(`.card`).children(`#${selected_old[column_type]}`).toggleClass('bg-info');
        if( selected['root'] == '')
            return;

        switch(column_type) {
            case 'root':
                if($(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${projects_selected[selected['root']][0]}`).hasClass('bg-info')){
                    console.log("nope")
                }else{
                    $(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${projects_selected[selected['root']][0]}`).toggleClass('bg-info')
                }
                if (projects_selected[selected['root']][1] != '')
                    $(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${projects_selected[selected['root']][1]}`).toggleClass('bg-info');
                if (projects_selected[selected['root']][2] != '')
                    $(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${projects_selected[selected['root']][2]}`).toggleClass('bg-info');

            break;
            case 'branch':
                if($(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${projects_selected[selected['root']][1]}`).hasClass('bg-info')){
                    console.log("nope")
                }else{
                    $(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${projects_selected[selected['root']][1]}`).toggleClass('bg-info')
                }
                if (projects_selected[selected['root']][2] != '')
                    $(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${projects_selected[selected['root']][2]}`).toggleClass('bg-info');
            break;
            case 'leaf':
                if($(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${projects_selected[selected['root']][2]}`).hasClass('bg-info')){
                    console.log("nope")
                }else{
                    $(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${projects_selected[selected['root']][2]}`).toggleClass('bg-info')
                }
            break;
        }
    }

    function selectCardBackend(column_type,id){
        switch(column_type) {
            case 'root':
                selected_old['root'] = selected['root'];
                selected_old['branch'] = '';
                selected_old['leaf'] = '';
                selected[column_type] = id;

                if ((selected['root'] in projects_selected) && (selected['root'] != '')){
                    selectCardBackend('branch',projects_selected[selected['root']][1]);
                }else{
                    projects_selected[selected['root']] = Array(3).fill('');
                    projects_selected[selected['root']][0] = selected['root'];
                }
            break;
            case 'branch':
                selected_old['branch'] =  selected['branch'];
                selected_old['leaf'] = '';
                selected[column_type] = id;
                if ((projects_selected[selected['root']][1] in projects_selected) && (selected['root'][1] != '')){
                    selectCardBackend('leaf',projects_selected[selected['root']][2]);
                }else{
                    projects_selected[selected['root']][1] = selected['branch'];
                }
            break;
            case 'leaf':
                selected_old['leaf'] = selected['leaf'];
                selected[column_type] = id;
                if ((projects_selected[selected['root']][2] in projects_selected) && (selected['root'][2] != '')){

                }else{
                    projects_selected[selected['root']][2] = selected['leaf'];
                }
            break;
        }
        console.log('projects_selected',projects_selected);
        console.log('selected',selected);
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

function nukeRightColumns(column_type){
    switch(column_type) {
        case 'root':
            $(`.kanban-projects-leaf`).children('#kanban-projects-body').html('');
            $(`.kanban-projects-branch`).children('#kanban-projects-body').html('');
        break;
        case 'branch':
            $(`.kanban-projects-leaf`).children('#kanban-projects-body').html('');
        break;
        case 'leaf':
        break;
    }
}

function kanbanWriteBackend() {

    let entry = {
        projects: projects,
        projects_selected: projects_selected,
        selected: selected,
        selected_old: selected_old,
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



function kanbanReadBackend() {

    let entry = {
        command: 'READ'
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
            projects =  data['projects'];
            projects_selected = data['projects_selected'];
            selected = data['selected'];
            selected_old = data['selected_old'];

            let tmp = '';
            for(var key in projects){
                let txt =  projects[key]['txt'];
                let ak = `
                <div class="card">
                    <div class="card-body card-saved branch" id=${key} style='white-space:pre'>${txt}</div><i class="fa-solid fa-rectangle-xmark"></i>
                </div>`;
                tmp = tmp + ak;
            }
            $(`.kanban-projects-root`).children('#kanban-projects-body').html(tmp);
            selectCardFrontend('root');
            console.log("here")
            if( selected['root'] != '')
                recreateRightColumns('root');
            selectCardFrontend('root');
        });
    })
    .catch(function (error) {
        console.log("Fetch error: " + error);
    });
    }
    window.onload = kanbanReadBackend();
})