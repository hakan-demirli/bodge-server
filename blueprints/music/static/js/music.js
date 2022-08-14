
$(function () {
'use strict'

    const fuckcss = `<div class="form-group" style="  visibility: hidden; width: 9%;">
                    <textarea class="form-control" rows="1" placeholder=""></textarea>
                    <button type="submit" class="btn btn-primary w-50" ><i class="fa-solid fa-check"></i></button>
                    <button type="submit" class="btn btn-secondary float-right w-50" ><i class="fas fa-times"></i></button>
                </div>`; // Size of the columns expand/shrink if smth added/removed to the empty column. Hence, add an invisible card to prevent it.

    function savedCard(header,type,guid,txt,icon,title,time,priority,sp){
        let ak = `
        <div class="card card-saved" style="">
            <div class="hide-icon"><a href='#'><i class="${icon}"></i></a></div>
            <div class="card-body card-saved-body-rbl ${type}" id=${guid} style="white-space: pre-line">${txt}</div>
        </div>`;
        return ak;
    }

    function editCard(){
        let ak = `
        <div class="form-group">
            <textarea class="form-control" rows="1" placeholder="..." id="content"></textarea>
            <button type="submit" class="btn btn-primary w-50" id="kanban-add-button"><i class="fa-solid fa-check"></i></button>
            <button type="submit" class="btn btn-secondary float-right w-50" id="kanban-cancel-button"><i class="fas fa-times"></i></button>
        </div>`;
        return ak;
    }

    var selected = {'root': '',
                    'branch': '',
                    'leaf': ''};

    class KanbanDataClass{
        constructor(proj,proj_ac) {
            this.projects = proj;
            this.projects_accessible = proj_ac;
        }
        recreateProjectsAccessible(){
            this.projects_accessible = {root: {},branch: {},leaf: {},todo:{},prog:{},done:{},subtask:{},id:{}};
            for(let root_id in this.projects){ // for every root
                for(let branch_id in this.projects[root_id]['childs']){ // for every branch of the root
                    this.projects_accessible['branch'][branch_id] = this.projects[root_id]['childs'][branch_id];
                    this.projects_accessible['id'][branch_id] = [root_id];
                }
                // every root is already accessible
            }
        }
        add(id,type,txt){
            switch(type) {
                case 'root':
                    this.projects[id] = {txt:txt,childs:{},selected:''};
                    break;
                case 'branch':
                    this.projects[selected['root']]['childs'][id] = {txt:txt,childs:{},selected:''};
                    break;
            }
            this.recreateProjectsAccessible();
        }
        remove(id){
            let type = this.type(id);
            let root_id;
            if(type != 'root'){
                root_id    = this.projects_accessible['id'][id][0];
            }

            switch(type) {
                case 'root':
                    delete this.projects[id];
                    break;
                case 'branch':
                    delete this.projects[root_id]['childs'][id];
                    break;
            }
            this.recreateProjectsAccessible();
        }
        type(id){
            if(this.projects[id] !== undefined){return 'root'}
            if(this.projects_accessible["branch"][id]  !== undefined){return 'branch'}
        }
    }

    function addEditCard(e){
        let ak = editCard(e.data.extra.row,e.data.extra.date,e.data.extra.summary);
        $(e.target.closest(`#${e.data.extra.name}-card`)).find(`#${e.data.extra.name}-body`).prepend(ak);
    }

    function removeCard(e) {
        $(e.target).closest('.card-saved').children('.card-header').children('#title').children('a').attr('style', ' ');
        e.target.closest('.form-group').remove();
    }


    function removeAddedProjectNode(e) {
        let body = $(e.target).closest('.card-saved').children('.card-saved-body-rbl');
        let id = body.attr("id");
        if(id == selected['root'] || id == selected['branch'] || id == selected['leaf']){
            toastr.warning("you can't delete selected items");
        }else{
            if (confirm('Delete? U sure?')){
                e.target.closest('.card').remove();
                kanban_data.remove(id);
                kanbanWriteBackend();
            }
        }
    }

    function saveCard(e){
        let txt      = $(e.target.closest('.form-group')).children('#content').val();
        let title    = $(e.target.closest('.form-group')).children('.input-group').children('#title').val();
        let time     = $(e.target.closest('.form-group')).children('.input-group').children('#clock-add-time').val();
        let priority = $(e.target.closest('.form-group')).children('.input-group').children('.input-group-append').children('.form-select').val();
        let sp       = parseInt($(e.target.closest('.form-group')).children('.input-group').children('.sp-group').children('.story-points').val());

        time = new Date(time).getTime();
        if(time==null && selected['leaf'] !== undefined){
            time = kanban_data.projects_accessible['leaf'][selected['leaf']]['time'];}
        let myguid = guid();

        let tmp = $(e.target.closest(`#${e.data.extra.name}-card`)).find(`#${e.data.extra.name}-body`);
        let prog_time = null;
        let done_time = null;

        switch(e.data.extra.type) {
            case 'branch':
                if(selected['root'] == ''){
                    toastr.warning(`Can't add without a parent.`);
                    return;
                }
                break;
        }
        kanban_data.add(myguid,e.data.extra.type,txt,title,time,priority,sp,prog_time,done_time);
        removeCard(e);
        tmp.prepend(savedCard(e.data.extra.header,e.data.extra.type,myguid,txt,e.data.extra.icon,title,time,priority,sp));
        selectCard(myguid);
        kanbanWriteBackend();
    }

    function recreateRightColumns(column_type){
        nukeRightColumns(column_type);
        let tmp = '';
        switch(column_type) {
            case 'root':
                if($.isEmptyObject(kanban_data.projects[selected['root']]["childs"]))
                    break;
                for(let key in kanban_data.projects[selected['root']]["childs"]){
                    let br = kanban_data.projects_accessible['branch'][key];
                    let ak = savedCard(0,'branch',key,br['txt'],"fa-solid fa-rectangle-xmark",br['title'],br['time'],br['priority'],br['sp']);
                    tmp = tmp + ak;
                }
                tmp = tmp + fuckcss;
                $(`.kanban-projects-branch`).children('#kanban-projects-body').html(tmp);
            case 'branch':
                if(selected['branch'] == '')
                    break;
                if($.isEmptyObject(kanban_data.projects[selected['root']]["childs"][selected['branch']]["childs"]))
                    break;
                tmp = '';
                for(let key in kanban_data.projects_accessible['branch'][selected['branch']]["childs"]){
                    let lf = kanban_data.projects_accessible['leaf'][key];
                    let ak = savedCard(0,'leaf',key,lf['txt'],"fa-solid fa-rectangle-xmark",lf['title'],lf['time'],lf['priority'],lf['sp']);
                    tmp = tmp + ak;
                }
                tmp = tmp + fuckcss;
                $(`.kanban-projects-leaf`).children('#kanban-projects-body').html(tmp);
        }
    }

    function selectCard(id){

        let type = kanban_data.type(id);
        try{$(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${selected['root']}`).removeClass('bg-info');}catch(err){}
        try{$(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${selected['branch']}`).removeClass('bg-info');}catch(err){}

        switch(type) {
            case 'root':
                selected['root'] = id;
                selected['branch'] = kanban_data.projects[id]['selected'];
                if (selected['branch'] in kanban_data.projects_accessible['branch']){
                    selected['leaf'] = kanban_data.projects_accessible['branch'][selected['branch']]['selected'];
                }
            break;
            case 'branch':
                kanban_data.projects[selected['root']]['selected'] = id;
                selected['branch'] = id;
                selected['leaf'] = kanban_data.projects_accessible['branch'][selected['branch']]['selected'];
            break;
        }

        recreateRightColumns(type);

        try{$(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${selected['root']}`).addClass('bg-info');}catch(err){}
        try{$(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${selected['branch']}`).addClass('bg-info');}catch(err){}

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
            let p = (Math.random().toString(16)+"000000000").substr(2,8);
            return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }

    function nukeRightColumns(column_type){
        switch(column_type) {
            case 'root':
                $(`.kanban-projects-branch`).children('#kanban-projects-body').html(fuckcss);
                $(`.kanban-projects-leaf`).children('#kanban-projects-body').html(fuckcss);
            break;
            case 'branch':
                $(`.kanban-projects-leaf`).children('#kanban-projects-body').html(fuckcss);
            break;
        }
    }

    function kanbanWriteBackend() {

        let entry = {
            projects: kanban_data.projects,
            selected: selected,
            command: 'WRITE'
        };

        fetch(`${window.origin}/music/backend`, {
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

    function kanbanReadBackend() {

        let entry = {
            command: 'READ'
        };

        fetch(`${window.origin}/music/backend`, {
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
                kanban_data.projects =  data['projects'];
                kanban_data.recreateProjectsAccessible();
                selected = data['selected'];

                let tmp = '';
                for(let key in kanban_data.projects){
                    let txt      = kanban_data.projects[key]['txt'];
                    let title    = kanban_data.projects[key]['title'];
                    let time     = kanban_data.projects[key]['time'];
                    let priority = kanban_data.projects[key]['priority'];
                    let sp = kanban_data.projects[key]['sp'];
                    let ak = savedCard(0,'root',key,txt,"fa-solid fa-rectangle-xmark",title,time,priority,sp);
                    tmp = tmp + ak;
                }
                tmp = tmp + fuckcss;
                $(`.kanban-projects-root`).children('#kanban-projects-body').html(tmp);
                if( selected['root'] != ''){
                    recreateRightColumns('root');
                    try{$(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${selected['root']}`).addClass('bg-info');}catch(err){}
                    try{$(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${selected['branch']}`).addClass('bg-info');}catch(err){}
                    try{$(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${selected['leaf']}`).addClass('bg-info');}catch(err){}
                }
            });
        })
        .catch(function (error) {
            console.log("Fetch error: " + error);
        });
    }

    window.onload = kanbanReadBackend();

    var kanban_data = new KanbanDataClass({}, {root:{},branch:{}});

    $('#kanban-projects-card,#kanban-projects-root-button  ').on("click",('#kanban-projects-root-button  '),{ extra : {row:1,name:'kanban-projects',date:0,summary:0}},addEditCard);
    $('#kanban-projects-card,#kanban-projects-branch-button').on("click",('#kanban-projects-branch-button'),{ extra : {row:1,name:'kanban-projects',date:0,summary:0}},addEditCard);
    $('.kanban-projects-root  ').on("click",('#kanban-add-button'),{extra : {name:'kanban-projects',icon:"fa-solid fa-rectangle-xmark",header:0,type:'root'}},saveCard);
    $('.kanban-projects-branch').on("click",('#kanban-add-button'),{extra : {name:'kanban-projects',icon:"fa-solid fa-rectangle-xmark",header:0,type:'branch'}},saveCard);
    $('.kanban-projects-root  ').on("click",('#kanban-cancel-button'),removeCard);
    $('.kanban-projects-branch').on("click",('#kanban-cancel-button'),removeCard);
    $('.card-body, .fa-rectangle-xmark').on("click",('.fa-rectangle-xmark'),removeAddedProjectNode);
    $('.card-body, .fa-pen-to-square').on("click",('.fa-pen-to-square'),addSubtasksEdit);

    function addSubtasksEdit(e){
        let body = $(e.target).closest('.card-saved').children('.card-saved-body-tpd');
        let id = body.attr("id");
        $('#'+id).closest('.card').append(subtasks_footer);
        $(e.target).closest('.card-saved .card-header #title a').attr('style', 'visibility: hidden !important');
    }

    $('.card').on("click",('.card-saved-body-rbl'),function(e) {
        let id = $(e.target).attr('id');
        selectCard(id);
        kanbanWriteBackend();
    });
})
