
$(function () {
'use strict'

    const fuckcss = `<div class="form-group" style="  visibility: hidden; width: 9%;">
                    <textarea class="form-control" rows="1" placeholder=""></textarea>
                    <button type="submit" class="btn btn-primary w-50" ><i class="fa-solid fa-check"></i></button>
                    <button type="submit" class="btn btn-secondary float-right w-50" ><i class="fas fa-times"></i></button>
                </div>`; // Size of the columns expand/shrink if smth added/removed to the empty column. Hence, add an invisible card to prevent it.

    const subtasks_footer = `
                            <div class="form-group">
                                <div class="input-group">
                                    <textarea class="form-control" rows="2" placeholder="..." id="content"></textarea>
                                    <span class="input-group-append">
                                        <button type="submit" class="btn btn-primary" id="subtasks-add-button"><i class="fa-solid fa-check"></i></button>
                                        <button type="submit" class="btn btn-secondary float-right" id="subtasks-cancel-button"><i class="fas fa-times"></i></button>
                                    </span>
                                </div>
                            </div>`;

    function savedSubtask(guid,done,txt){
        let ak = `\
        <li id="${guid}" class="subtask">\
            <span class="handle">\
                <i class="fas fa-ellipsis-v"></i>\
                <i class="fas fa-ellipsis-v"></i>\
            </span>\
            <input type="range" min="0" max="2" step="1" value="${done}" id="${guid}" class="subtask-range" />\
            <a href='#'><i class="fas fa-trash-alt float-right" id="subtask-remove-icon"></i></a>
            <span class="text" style="white-space: pre-line; width:100%;">${txt}</span>\
        </li>`;
        return ak;
    }

    const subtasks_body_up = `<div class="card dark-mode">
                                    <ul class="todo-list" data-widget="todo-list" id="todo-list">
                            `;
    const subtasks_body_down = `    </ul>
                            </div>`;

    function saveSubtaskButton(e){
        let txt             = $(e.target.closest('.form-group .input-group')).children('#content').val();
        let parent_card     = $(e.target.closest('.card-saved'));
        let parent_id       = parent_card.children('.card-body').attr('id');
        let parent_type     = kanban_data.type(parent_id);
        let parent_time     = kanban_data.projects_accessible[parent_type][parent_id]['time'];
        let parent_priority = kanban_data.projects_accessible[parent_type][parent_id]['priority'];
        let subtasks        = kanban_data.projects_accessible[parent_type][parent_id]['childs'];
        let tmp = '';
        let new_guid = guid();
        let done_state = 0;
        if($.isEmptyObject(subtasks)){
            tmp = subtasks_body_up + savedSubtask(new_guid,done_state,txt) + subtasks_body_down;
            parent_card.children('.card-body').append(tmp);
        }else{
            parent_card.children('.card').children('.todo-list').append(savedSubtask(new_guid,done_state,txt));
        }
        kanban_data.add(new_guid,'subtask',txt,'',parent_time,parent_priority,0,'','',parent_type,parent_id,done_state);
        removeCard(e);
        kanbanWriteBackend();
    }

    function savedCard(header,type,guid,txt,icon,title,time,priority,sp){
        let bg_color = '';
        switch(priority){
            case "5": bg_color = 'style="border-bottom: 1px solid rgb(255,   0,   0);"'; break;
            case "4": bg_color = 'style="border-bottom: 1px solid rgb(255, 150,   0);"'; break;
            case "3": bg_color = 'style="border-bottom: 1px solid rgb(100, 250,   0);"'; break;
            case "2": bg_color = 'style="border-bottom: 1px solid rgb( 50, 190, 140);"'; break;
            case "1": bg_color = ''; break;
        }
        let childs = ``;
        let tmp = '';
        if(type == 'todo' || type == 'prog' || type == 'done'){
            let subtasks = kanban_data.projects_accessible[type][guid]['childs'];
            for(let sbtsk in subtasks){
                tmp = tmp + savedSubtask(sbtsk,subtasks[sbtsk]['done_state'],subtasks[sbtsk]['txt']);
            }
            childs = subtasks_body_up + tmp + subtasks_body_down;
        }
        let ak_time = '';
        if(time != ''){
            ak_time = ` <div class="card-header card-header-drag" ${bg_color}>
                            <div id="time" class="d-flex justify-content-center">
                                <font color="#ced4da">${time}</font>
                            </div>
                        </div>`
            bg_color = '';
        }
        let ak = `
        <div class="card card-saved" style="">
            ${header ?(`<div class="card-header card-header-drag" ${bg_color}>
                            <div id="title" style="float: left;">${title}</div>
                            <div class="ml-auto" style="float: right;">
                                <div id="sp" style="float: left;">
                                    <font color="#d7c0ae">${sp}</font>
                                    &#128220;
                                </div>
                                <a href='#'  style="float: right; color: #fff;"><i class="fa-solid fa-pen-to-square"></i></a>
                            </div>
                        </div>
                        ${ak_time}`):('')}
            <div class="card-body card-saved-body-${header ? 'tpd':'rbl'} ${type}" id=${guid} style="white-space: pre-line">${txt}</div>
            <a href='#'><i class="${icon}"></i></a>
            ${childs}
        </div>`;
        return ak;
    }

    function editCard(row,date,summary){
        let ak = `
        <div class="form-group">
            ${summary ?(`
            <div class="input-group">
                <input type="text" placeholder="Summary" class="form-control" id="title">
                <div class="input-group-append">
                    <select class="form-select">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <input type="range" min="1" max="100" step="1" value="0" class="story-points" oninput="this.nextElementSibling.value = this.value" style="flex:auto; margin-left: 0.2rem;"/>
                <output style="  margin-left: 0.6rem; margin-right: 0.6rem;">1</output>
                <div style="margin-right: 0.8rem;">&#128220;</div>
            </div>
            `):('')}
            <textarea class="form-control" rows="${row}" placeholder="..." id="content"></textarea>
            ${date ?(`
                    <div class='input-group' id='datetimepicker1' data-td-target-input='nearest' data-td-target-toggle='nearest'>
                        <input id='clock-add-time' type='text' class='form-control datetimepicker-input' data-td-target='#datetimepicker1'/>
                        <span class='input-group-text' data-td-target='#datetimepicker1' data-td-toggle='datetimepicker'>
                        <span class='fa-solid fa-calendar'></span>
                        </span>
                    </div>
                    <script>
                        new tempusDominus.TempusDominus(document.getElementById('datetimepicker1'),{
                            display: {
                                      components: {
                                        useTwentyfourHour: true
                                      }
                                     }
                        });
                    </script>
                    `):('')}
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
                // every root is already accessible
                for(let branch_id in this.projects[root_id]['childs']){ // for every branch of the root
                    this.projects_accessible['branch'][branch_id] = this.projects[root_id]['childs'][branch_id];
                    this.projects_accessible['id'][branch_id] = [root_id];
                    for(let leaf_id in this.projects[root_id]['childs'][branch_id]['childs']){ // for every leaf of the branch
                        this.projects_accessible['leaf'][leaf_id] = this.projects[root_id]['childs'][branch_id]['childs'][leaf_id];
                        this.projects_accessible['id'][leaf_id] = [root_id,branch_id];
                        for(let tpd in this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs']){ // for every todo/prog/done of the leaf
                            for(let tpd_id in this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd]){ // for every id in the todo/prog/done
                                this.projects_accessible[tpd][tpd_id] = this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd][tpd_id];
                                this.projects_accessible['id'][tpd_id] = [root_id,branch_id,leaf_id];
                                for(let subt_id in this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd][tpd_id]['childs']){ // for every id in the subtasks
                                    this.projects_accessible['subtask'][subt_id] = this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd][tpd_id]['childs'][subt_id];
                                    this.projects_accessible['id'][subt_id] = [root_id,branch_id,leaf_id,tpd_id];
                                }
                            }
                        }
                    }
                }
            }
        }
        add(id,type,txt,title,time,priority,sp,prog_time,done_time,type_tpd,id_tpd,done_state){
            switch(type) {
                case 'root':
                    this.projects[id] = {txt:txt,childs:{},selected:''};
                    break;
                case 'branch':
                    this.projects[selected['root']]['childs'][id] = {txt:txt,childs:{},selected:''};
                    break;
                case 'leaf':
                    this.projects[selected['root']]['childs'][selected['branch']]['childs'][id] = {txt:txt,time:time,childs:{todo:{},prog:{},done:{}},selected:''};
                    break;
                case 'todo':
                case 'prog':
                case 'done':
                    this.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'][type][id] = {
                        txt:txt,
                        title:title,
                        time:time,
                        priority:priority,
                        sp:sp,
                        prog_time:prog_time,
                        done_time:done_time,
                        childs:{}};
                    break;
                case 'subtask':
                    this.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'][type_tpd][id_tpd]['childs'][id] = {
                        done_state:done_state,
                        txt:txt,
                        prog_time:prog_time,
                        done_time:done_time};
                    break;
            }
            this.recreateProjectsAccessible();
        }
        remove(id){
            let type = this.type(id);
            let root_id    = this.projects_accessible['id'][id][0];
            let branch_id  = this.projects_accessible['id'][id][1];
            let leaf_id    = this.projects_accessible['id'][id][2];
            let tpd_id     = this.projects_accessible['id'][id][3];

            switch(type) {
                case 'root':
                    delete this.projects[id];
                    break;
                case 'branch':
                    delete this.projects[root_id]['childs'][id];
                    break;
                case 'leaf':
                    delete this.projects[root_id]['childs'][branch_id]['childs'][id];
                    break;
                case 'todo':
                case 'prog':
                case 'done':
                    delete this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][type][id];
                    break;
                case 'subtask':
                    let tpd_type = this.type(tpd_id);
                    delete this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd_type][tpd_id]['childs'][id];
                    break;
            }
            this.recreateProjectsAccessible();
        }
        type(id){
            if(this.projects[id] !== undefined){return 'root'}
            if(this.projects_accessible["branch"][id]  !== undefined){return 'branch'}
            if(this.projects_accessible["leaf"][id]    !== undefined){return 'leaf'}
            if(this.projects_accessible["todo"][id]    !== undefined){return 'todo'}
            if(this.projects_accessible["prog"][id]    !== undefined){return 'prog'}
            if(this.projects_accessible["done"][id]    !== undefined){return 'done'}
            if(this.projects_accessible["subtask"][id] !== undefined){return 'subtask'}
            throw new Error('No match found!');
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

    function removeAddedCard(e) {
        let body = $(e.target).closest('.card-saved').children('.card-saved-body-tpd');
        let id = body.attr("id");
        e.target.closest('.card').remove();
        kanban_data.remove(id);
        kanbanWriteBackend();
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
        let sp       = $(e.target.closest('.form-group')).children('.input-group').children('.story-points').val();

        if(time=="" && selected['leaf'] !== undefined){
            time = kanban_data.projects_accessible['leaf'][selected['leaf']]['time'];}
        let myguid = guid();

        let tmp = $(e.target.closest(`#${e.data.extra.name}-card`)).find(`#${e.data.extra.name}-body`);
        let prog_time = '';
        let done_time = '';

        switch(e.data.extra.type) {
            case 'branch':
                if(selected['root'] == ''){
                    toastr.warning(`Can't add without a parent.`);
                    return;
                }
                break;
            case 'leaf':
                if(selected['branch'] == ''){
                    toastr.warning(`Can't add without a parent.`);
                    return;
                }
                break;
            case 'todo':
            case 'prog':
            case 'done':
                if(selected['leaf'] == '' || $.isEmptyObject(kanban_data.projects_accessible['branch'][selected['branch']]['childs'])){
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
            case 'leaf':
                if(selected['leaf'] == '')
                    break;
                let t = kanban_data.projects_accessible['leaf'][selected['leaf']]["childs"];
                tmp = '';
                for(let tpd in {'todo':'','prog':'','done':''}){
                    let pri = Array(5).fill('');
                    for(let key in t[tpd]){
                        let ak = savedCard(
                            1,
                            tpd,
                            key,
                            t[tpd][key]['txt'],
                            "fa-solid fa-square-xmark",
                            t[tpd][key]['title'],
                            t[tpd][key]['time'],
                            t[tpd][key]['priority'],
                            t[tpd][key]['sp']
                        );
                        switch(t[tpd][key]['priority']){
                            case "5": pri[4] = pri[4] + ak; break;
                            case "4": pri[3] = pri[3] + ak; break;
                            case "3": pri[2] = pri[2] + ak; break;
                            case "2": pri[1] = pri[1] + ak; break;
                            default:  pri[0] = pri[0] + ak; break;
                        }
                    }
                    $(`#kanban-${tpd}-card`).children(`#kanban-${tpd}-body`).html(pri[4]+pri[3]+pri[2]+pri[1]+pri[0]); //dont use .join()
                    tmp = '';
                }
        }
    }

    function updateRemaningTime(time){
        if (time == ""){
            $('#pills-time-view-tab').text("");
            return
        }
        let now = new Date();
        let mdate = new Date(time);
        let diff = mdate.getTime()-now.getTime();
        if(diff<0){
            $('#pills-time-view-tab').text('TIMEOUT')
        }else{
            let days = Math.floor(diff / (1000 * 60 * 60 * 24));
            let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            let t_weeks = Math.floor(days / (7));
            let t_days = Math.floor(days-t_weeks*7);
            if((t_weeks)>=3){
                $('#pills-time-view-tab').text(t_weeks + ' weeks remaining')
            }else{
                if(t_weeks>=1){
                    $('#pills-time-view-tab').text(t_weeks + ' weeks ' + t_days + ' days remaining');
                }else{
                    if(days>=1){
                        $('#pills-time-view-tab').text(days + ' days remaining');
                    }else{
                        $('#pills-time-view-tab').text(hours + ' hours remaining');
                    }
                }
            }
        }
    }

    function selectCard(id){

        let type = kanban_data.type(id);
        try{$(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${selected['root']}`).removeClass('bg-info');}catch(err){}
        try{$(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${selected['branch']}`).removeClass('bg-info');}catch(err){}
        try{$(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${selected['leaf']}`).removeClass('bg-info');}catch(err){}

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
            case 'leaf':
                kanban_data.projects_accessible['branch'][selected['branch']]['selected'] = id;
                selected['leaf'] = id;
            break;
        }

        recreateRightColumns(type);

        try{$(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${selected['root']}`).addClass('bg-info');}catch(err){}
        try{$(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${selected['branch']}`).addClass('bg-info');}catch(err){}
        try{$(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${selected['leaf']}`).addClass('bg-info');}catch(err){}
        updateRemaningTime(kanban_data.projects_accessible['leaf'][selected['leaf']]['time']);
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
                $(`.kanban-projects-leaf`).children('#kanban-projects-body').html(fuckcss);
                $(`.kanban-projects-branch`).children('#kanban-projects-body').html(fuckcss);
                $(`#kanban-todo-card`).children('#kanban-todo-body').html('');
                $(`#kanban-prog-card`).children('#kanban-prog-body').html('');
                $(`#kanban-done-card`).children('#kanban-done-body').html('');
            break;
            case 'branch':
                $(`.kanban-projects-leaf`).children('#kanban-projects-body').html(fuckcss);
                $(`#kanban-todo-card`).children('#kanban-todo-body').html('');
                $(`#kanban-prog-card`).children('#kanban-prog-body').html('');
                $(`#kanban-done-card`).children('#kanban-done-body').html('');
            break;
            case 'leaf':
                $(`#kanban-todo-card`).children('#kanban-todo-body').html('');
                $(`#kanban-prog-card`).children('#kanban-prog-body').html('');
                $(`#kanban-done-card`).children('#kanban-done-body').html('');
            break;
        }
    }

    function kanbanWriteBackend() {

        let entry = {
            projects: kanban_data.projects,
            selected: selected,
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
                initializeTable();
            });
        })
        .catch(function (error) {
            console.log("Fetch error: " + error);
        });
    }

    function formatDate(newDate) {
        var sMonth = padValue(newDate.getMonth() + 1);
        var sDay = padValue(newDate.getDate());
        var sYear = newDate.getFullYear();
        var sHour = newDate.getHours();
        var sMinute = padValue(newDate.getMinutes());
        sHour = padValue(sHour);
        return sMonth + "/" + sDay + "/" + sYear + ", " + sHour + ":" + sMinute;
    }

    function padValue(value) {
        return (value < 10) ? "0" + value : value;
    }

    $('.connectedSortable').sortable({
        cancel: ".unsortable",
        update: function(e, ui) {},
        receive: function( e, ui ) {
            let dropped_card_body = ui.item.find(".card-saved-body-tpd");
            let card_id   = dropped_card_body.attr('id');
            let card_type = kanban_data.type(card_id);
            let body_name = e.target.id;
            let crd = kanban_data.projects_accessible[card_type][card_id];
            let card_type_new = '';
            kanban_data.remove(card_id);
            dropped_card_body.toggleClass(card_type);

            switch(body_name){
                case 'kanban-todo-body':
                    dropped_card_body.toggleClass('todo');
                    kanban_data.add(card_id,'todo',crd['txt'],crd['title'],crd['time'],crd['priority'],crd['sp'],'','');
                    card_type_new = 'todo';
                break;
                case 'kanban-prog-body':
                    dropped_card_body.toggleClass('prog');
                    kanban_data.add(card_id,'prog',crd['txt'],crd['title'],crd['time'],crd['priority'],crd['sp'],formatDate(new Date()),'');
                    card_type_new = 'prog';
                break;
                case 'kanban-done-body':
                    dropped_card_body.toggleClass('done');
                    let tm = formatDate(new Date());
                    let prog_time = crd['prog_time'];
                    if(prog_time === ''){
                        prog_time = tm;
                    }
                    kanban_data.add(card_id,'done',crd['txt'],crd['title'],crd['time'],crd['priority'],crd['sp'],prog_time,tm);
                    card_type_new = 'done';
                break;
                default:
                    throw Error("No Column Found!");
            }
            for(let key in crd['childs']){
                let sbtsk = crd['childs'][key];
                kanban_data.add(key,'subtask',sbtsk['txt'],'',crd['time'],crd['priority'],0,sbtsk['prog_time'],sbtsk['done_time'],card_type_new,card_id,sbtsk['done_state']);
            }
            kanbanWriteBackend();
        },
        placeholder: 'sort-highlight',
        connectWith: '.connectedSortable',
        handle: '.card-header-drag',
        forcePlaceholderSize: true,
        zIndex: 999999
    })

    $('.connectedSortable .card-header-drag').css('cursor', 'move');

    window.onload = kanbanReadBackend();

    var kanban_data = new KanbanDataClass({}, {root:{},branch:{},leaf:{},todo:{},prog:{},done:{}});

    $('#kanban-todo-card').children('.card-header').children('.card-tools').on("click",('.kanban-plus'),{ extra : {row:4,name:'kanban-todo',date:1,summary:1}},addEditCard);
    $('#kanban-todo-body').on("click",('#kanban-add-button'),{ extra : {name:'kanban-todo',icon:"fa-solid fa-square-xmark",header:1,type:'todo'}},saveCard);
    $('#kanban-todo-body').on("click",('#kanban-cancel-button'),removeCard);
    $('.card-body, .fa-square-xmark').on("click",('.fa-square-xmark'),removeAddedCard);

    $('#kanban-projects-card,#kanban-projects-root-button  ').on("click",('#kanban-projects-root-button  '),{ extra : {row:1,name:'kanban-projects',date:0,summary:0}},addEditCard);
    $('#kanban-projects-card,#kanban-projects-branch-button').on("click",('#kanban-projects-branch-button'),{ extra : {row:1,name:'kanban-projects',date:0,summary:0}},addEditCard);
    $('#kanban-projects-card,#kanban-projects-leaf-button  ').on("click",('#kanban-projects-leaf-button  '),{ extra : {row:1,name:'kanban-projects',date:1,summary:0}},addEditCard);
    $('.kanban-projects-root  ').on("click",('#kanban-add-button'),{extra : {name:'kanban-projects',icon:"fa-solid fa-rectangle-xmark",header:0,type:'root'}},saveCard);
    $('.kanban-projects-branch').on("click",('#kanban-add-button'),{extra : {name:'kanban-projects',icon:"fa-solid fa-rectangle-xmark",header:0,type:'branch'}},saveCard);
    $('.kanban-projects-leaf  ').on("click",('#kanban-add-button'),{extra : {name:'kanban-projects',icon:"fa-solid fa-rectangle-xmark",header:0,type:'leaf'}},saveCard);
    $('.kanban-projects-root  ').on("click",('#kanban-cancel-button'),removeCard);
    $('.kanban-projects-branch').on("click",('#kanban-cancel-button'),removeCard);
    $('.kanban-projects-leaf  ').on("click",('#kanban-cancel-button'),removeCard);
    $('.card-body, .fa-rectangle-xmark').on("click",('.fa-rectangle-xmark'),removeAddedProjectNode);
    $('.card-body, .fa-pen-to-square').on("click",('.fa-pen-to-square'),addSubtasksEdit);
    $('#kanban-todo-body').on("click",('#subtasks-cancel-button'),removeCard);
    $('#kanban-prog-body').on("click",('#subtasks-cancel-button'),removeCard);
    $('#kanban-done-body').on("click",('#subtasks-cancel-button'),removeCard);
    $('#kanban-todo-body').on("click",('#subtasks-add-button'),saveSubtaskButton);
    $('#kanban-prog-body').on("click",('#subtasks-add-button'),saveSubtaskButton);
    $('#kanban-done-body').on("click",('#subtasks-add-button'),saveSubtaskButton);

    function addSubtasksEdit(e){
        let body = $(e.target).closest('.card-saved').children('.card-saved-body-tpd');
        let id = body.attr("id");
        $('#'+id).closest('.card').append(subtasks_footer);
        $(e.target).closest('.card-saved .card-header #title a').attr('style', 'visibility: hidden !important');
    }

    $('.card').on("click",'#subtask-remove-icon',function(e){
        let subtask = $(e.target).closest('.subtask');
        let id = subtask.attr('id');
        kanban_data.remove(id);
        $(e.target).closest('.subtask').remove();
        kanbanWriteBackend();
    });
    $('.card').on("input",'.subtask-range',function() {
        let id = $(this).attr('id');
        let tpd_subtask = $(this).val();
        let txt         = kanban_data.projects_accessible['subtask'][id]['txt'];
        let prog_time   = kanban_data.projects_accessible['subtask'][id]['prog_time'];
        let priority    = kanban_data.projects_accessible['subtask'][id]['priority'];
        let sp    = kanban_data.projects_accessible['subtask'][id]['priority'];
        let tpd_id      = kanban_data.projects_accessible['id'][id][3];
        let parent_id   = tpd_id;
        let parent_type = kanban_data.type(tpd_id);

        switch(tpd_subtask){
            case '0':
                kanban_data.add(id,'subtask',txt,'','',priority,sp,'','',parent_type,parent_id,tpd_subtask);
                break;
            case '1':
                kanban_data.add(id,'subtask',txt,'','',priority,sp,formatDate(new Date()),'',parent_type,parent_id,tpd_subtask);
                break;
            case '2':
                let tm = formatDate(new Date());
                if(prog_time === ''){
                    prog_time = tm;
                }
                kanban_data.add(id,'subtask',txt,'','',priority,sp,prog_time,tm,parent_type,parent_id,tpd_subtask);
                break;
            default:
                throw Error("Can't Slide ;(");
        }
        kanbanWriteBackend();
    });

    $('.card').on("click",('.card-saved-body-rbl'),function(e) {
        let id = $(e.target).attr('id');
        selectCard(id);
        kanbanWriteBackend();
    });

    $('.card').on("click",('.card-saved-body-rbl'),function(e) {
        let id = $(e.target).attr('id');
        selectCard(id);
        kanbanWriteBackend();
    });

    // <src="../plugins/moment/moment.min.js">
    /* initialize the external events
    -----------------------------------------------------------------*/
    function ini_events(ele) {
        ele.each(function () {
            // create an Event Object (https://fullcalendar.io/docs/event-object)
            // it doesn't need to have a start or end
            var eventObject = {
                title: $.trim($(this).text()) // use the element's text as the event title
            }
            // store the Event Object in the DOM element so we can get to it later
            $(this).data('eventObject', eventObject)
            // make the event draggable using jQuery UI
            $(this).draggable({
                zIndex        : 1070,
                revert        : true, // will cause the event to go back to its
                revertDuration: 0  //  original position after the drag
            })
        })
    }

    ini_events($('#external-events div.external-event'));

    var Calendar = FullCalendar.Calendar;
    var calendarEl = document.getElementById('calendar');
    var calendar = new Calendar(calendarEl, {
        eventClick: function(info) {
            selectCard(kanban_data.projects_accessible['id'][info.event.id][0]);
            selectCard(kanban_data.projects_accessible['id'][info.event.id][1]);
            selectCard(kanban_data.projects_accessible['id'][info.event.id][2]);
        },
        headerToolbar: {
            left  : 'prev,next today',
            center: 'title',
            right : 'dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek,listMonth'
        },
        views: {
            listDay: { buttonText: 'list day' },
            listWeek: { buttonText: 'list week' },
            listMonth: { buttonText: 'list month' }
        },
        eventTimeFormat: {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        },
        themeSystem: 'bootstrap',
        firstDay: 1,
        events: [],
        editable  : false,
        droppable : false
    });

    var myTimeout;
    function renderCalendar(){
        // calendar is distorted at the beginning. This is an official bug.
        // Fix it by rendering it few times at the beginning.
        createEventsFromKanban();
        calendar.render();
    }

    $('#sidebar-toggle-button, #pills-calendar-view-tab').on( "click", function() {
        // Sidebar distorts the calendar. We have to re-render it.
        // Bootstrap 5 tabs distorts the calendar. We have to re-render it.
        // Movement of sidebar is slower than the render speed. Which causes an incorrect render.
        // Hence, call the render function after sidebar is fully extended. Which means waiting a little bit before requesting render.
        myTimeout = setTimeout(function(){calendar.updateSize();clearTimeout(myTimeout);}, 100);
        setTimeout(calendarSizeFix, 200); // Ubuntu 20 LTS specific fix
    });

    function calendarSizeFix(){
        myTimeout = setTimeout(function(){calendar.updateSize();clearTimeout(myTimeout);}, 100);
    }

    $('.nav-item').on('click','#pills-calendar-view-tab',renderCalendar);

    function createEventsFromKanban(){
        calendar.removeAllEvents();
        let types = {todo:'', prog:'',done:''};
        for(let type in types){
            for(let event_id in kanban_data.projects_accessible[type]){
                let event_raw = kanban_data.projects_accessible[type][event_id];
                let lid = kanban_data.projects_accessible['id'][event_id][2];
                let l_time = new Date(kanban_data.projects_accessible['leaf'][lid]['time']);
                let e_time = new Date(event_raw['time']);
                let e_done_time = new Date(event_raw['done_time']);
                let start_time = e_time;
                let end_time = type==='done' ? e_done_time : new Date((e_time).getTime() + 1000);
                let all_day = false;

                if (l_time.getFullYear() === e_time.getFullYear() && l_time.getMonth() === e_time.getMonth() && l_time.getDate() === e_time.getDate()){
                    start_time =  new Date();
                    end_time = type==='done' ? e_done_time : l_time;
                    all_day = true;
                }
                let event_calendar = {
                    id             : event_id,
                    title          : event_raw['title'],
                    groupId        : type,
                    start          : start_time,
                    end            : end_time,
                    allDay         : all_day,
                    backgroundColor: '#ff73b7',
                    borderColor    : '#ff7fff'
                };
                calendar.addEvent(event_calendar);
            }
        }
    }

    function hsv2Rgb(h,s,v){
        let f= (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);
        return [f(5),f(3),f(1)];
    }

    function distinctColors(count) {
        var colors = [];
        for(let hue = 0; hue < 360; hue += 360 / count) {
            let rgb = hsv2Rgb(hue, 0.8, 1);
            rgb = rgb.map(x => Math.floor(x * 255));
            colors.push(rgb);
        }
        return colors;
    }

    function arrayRotate(arr, count) {
        count -= arr.length * Math.floor(count / arr.length);
        arr.push.apply(arr, arr.splice(0, count));
        return arr;
    }

    let timeline_beg = `<div class="time-label">
                            <span class="bg-success">Now</span>
                        </div>`;

    let timeline_end = `<div class="time-label">
                            <span class="bg-danger">The Dark Age</span>
                        </div>`;

    function timelineItem(header,body,id,time,priority,icon,branch_color,item_color,child_timeline){

        let bg_color = ''
        switch(priority){
            case "5": bg_color = 'style="border-bottom: 1px solid rgb(255,   0,   0);"'; break;
            case "4": bg_color = 'style="border-bottom: 1px solid rgb(255, 150,   0);"'; break;
            case "3": bg_color = 'style="border-bottom: 1px solid rgb(100, 250,   0);"'; break;
            case "2": bg_color = 'style="border-bottom: 1px solid rgb( 50, 190, 140);"'; break;
            case "1": bg_color = ''; break;
        }

        let sub = (kanban_data.type(id) != 'subtask')?(`<h3 class="timeline-header" ${bg_color}>${header}</h3>`):('');
        let ak = `  <div>
                        <i class="${icon}" style="color:${item_color}; background-color:${branch_color}; text-shadow: 0 0 4px #000000;"></i>
                        <div class="timeline-item" id="${id}">
                            <span class="time">${time}\xa0\xa0<i class="far fa-clock"></i></span>
                            ${sub}
                            <div class="timeline-body">${body}</div>
                            ${child_timeline}
                        </div>
                    </div>`;
        return ak;
    }

    function createTimeline(){
        let tmp = '';
        let tmp_sub = '';
        let chronicle_pro = [];
        let parent_branches = {};
        let parent_leafs = {};
        let done_dic = kanban_data.projects_accessible['done'];
        for(let key in done_dic){
            let tmp = jQuery.extend(true, {}, done_dic);
            tmp[key]['my_id'] = key;
            chronicle_pro.push(tmp[key]);
            parent_branches[kanban_data.projects_accessible['id'][key][1]] = '';
            parent_leafs[kanban_data.projects_accessible['id'][key][2]] = '';
        }
        let branch_colors = distinctColors(Object.keys(parent_branches).length);
        let leaf_colors = distinctColors(Object.keys(parent_leafs).length);
        leaf_colors = arrayRotate(leaf_colors,Math.floor(leaf_colors.length/4));
        let ii = 0;
        for(let key in parent_branches){
            parent_branches[key] = `rgb(${branch_colors[ii][0]},${branch_colors[ii][1]},${branch_colors[ii][2]})`;
            ii = ii + 1;
        }
        ii = 0;
        for(let key in parent_leafs){
            parent_leafs[key] = `rgb(${leaf_colors[ii][0]},${leaf_colors[ii][1]},${leaf_colors[ii][2]})`;
            ii = ii + 1;
        }
        chronicle_pro.sort(function(a,b) {
            return new Date(a.done_time).getTime() - new Date(b.done_time).getTime()
        });
        ii = 0;
        for(const item of chronicle_pro){
            if(!$.isEmptyObject(item['childs'])){
                let chronicle_childs = [];
                for(let subtask_id in item['childs']){
                    let tmp = jQuery.extend(true, {}, item['childs'][subtask_id]);
                    tmp['my_id'] = subtask_id;
                    chronicle_childs.push(tmp);
                }
                chronicle_childs.sort(function(a,b) {
                    return new Date(a.done_time).getTime() - new Date(b.done_time).getTime()
                });
                for(const subtask of chronicle_childs){
                    if(subtask['done_state'] == 2){
                        let ak_sub = timelineItem(
                            '',
                            subtask['txt'],
                            subtask['my_id'],
                            subtask['done_time'],
                            item['priority'],
                            "fas fa-flag",
                            parent_branches[kanban_data.projects_accessible['id'][item['my_id']][1]],
                            parent_leafs[kanban_data.projects_accessible['id'][item['my_id']][2]],
                            '');
                        tmp_sub = ak_sub + tmp_sub;
                    }
                }
                tmp_sub = '<div class="timeline">' + tmp_sub + '</div>';
            }
            let ak = timelineItem(
                item['title'],
                item['txt'],
                item['my_id'],
                item['done_time'],
                item['priority'],
                "fas fa-flag",
                parent_branches[kanban_data.projects_accessible['id'][item['my_id']][1]],
                parent_leafs[kanban_data.projects_accessible['id'][item['my_id']][2]],
                tmp_sub);
            tmp = ak + tmp;
            ii = ii + 1;
        }
        tmp = timeline_beg + tmp + timeline_end;
        $('.timeline').html(tmp);
    }

    $('.timeline').on('click','.timeline-item',selectLeftSide);
    $('.nav-item').on('click','#pills-timeline-view-tab',createTimeline);

    function selectLeftSide(e){
        selectCard(kanban_data.projects_accessible['id'][$(e.currentTarget).attr('id')][0]);
        selectCard(kanban_data.projects_accessible['id'][$(e.currentTarget).attr('id')][1]);
        selectCard(kanban_data.projects_accessible['id'][$(e.currentTarget).attr('id')][2]);
    }

    $('.nav-item').on('click','#pills-table-view-tab',recreateTable);

    function recreateTable(){
        let projects_table = $('#table_id').DataTable();
        projects_table.column(0).visible(false);
        fillTable(projects_table);
    }

    function initializeTable(){
        let projects_table = $('#table_id').DataTable({
            order: [[ 2, 'desc' ]]
        });
        projects_table.column(0).visible(false);
        fillTable(projects_table);
    }

    function fillTable(projects_table){
        projects_table.clear();
        let types = {todo:'', prog:''};
        for(let type in types){
            for(let event_id in kanban_data.projects_accessible[type]){
                let event_raw = kanban_data.projects_accessible[type][event_id];
                projects_table.row.add([event_id,
                                        event_raw['title'],
                                        event_raw['priority'],
                                        event_raw['prog_time'],
                                        event_raw['txt']]);
            }
        }
        projects_table.draw(false);
    }

    $('#table_id tbody').on('click', 'tr', function (e) {
        e.preventDefault();
        let currentRow = $(this).closest("tr");
        let data = $('#table_id').DataTable().row(currentRow).data();
        let id = data[0];
        selectCard(kanban_data.projects_accessible['id'][id][0]);
        selectCard(kanban_data.projects_accessible['id'][id][1]);
        selectCard(kanban_data.projects_accessible['id'][id][2]);
    });

    var chart = c3.generate({
        bindto: '#chart',
        data: {
          columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
          ]
        }
    });
})