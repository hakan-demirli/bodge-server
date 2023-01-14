$.when(
    $.getScript( "/kanban/static/js/kanban_global.js" ),
    $.getScript( "/kanban/static/js/calendar_view.js" ),
    $.getScript( "/kanban/static/js/table_view.js" ),
    $.getScript( "/kanban/static/js/sp_view.js" ),
    $.getScript( "/kanban/static/js/timeline_view.js" ),
    $.Deferred(function( deferred ){
        $( deferred.resolve );
    })
).done(function(){
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
            parent_card.children('.card-body').children('.card').children('.todo-list').append(savedSubtask(new_guid,done_state,txt));
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
        let parent_time = '';
        if(type == 'todo' || type == 'prog' || type == 'done'){
            let subtasks = kanban_data.projects_accessible[type][guid]['childs'];
            for(let sbtsk in subtasks){
                tmp = tmp + savedSubtask(sbtsk,subtasks[sbtsk]['done_state'],subtasks[sbtsk]['txt']);
            }
            childs = subtasks_body_up + tmp + subtasks_body_down;
            let leaf_id    = kanban_data.projects_accessible['id'][guid][2];
            parent_time = kanban_data.projects_accessible['leaf'][leaf_id]['time'];
        }
        let ak_time = '';
        if((time != 0) && (parent_time != time)){
            ak_time = ` <div class="card-header card-header-drag" ${bg_color}>
                            <div id="time" class="d-flex justify-content-center">
                                <font color="#ced4da">${formatDate(new Date(time))}</font>
                            </div>
                        </div>`
            bg_color = '';
        }
        let ak = `
        <div class="card card-saved" style="">
            ${header ?(`<div class="card-header card-header-drag hide-icon" ${bg_color}>
                            <div id="title" style="float: left;">${title}</div>
                            <div class="ml-auto" style="float: right;">
                                <div id="sp" style="float: left;">
                                    <font color="#d7c0ae">${sp}</font>
                                    &#128220;
                                </div>
                                <a href='#' style="float: right; color: #fff;"><i class="fa-solid fa-pen-to-square"></i></a>
                            </div>
                            <a href='#'><i class="${icon}"></i></a>
                        </div>
                        ${ak_time}`):(`<div class="hide-icon"><a href='#'><i class="${icon}"></i></a></div>`)}
            <div class="card-body card-saved-body-${header ? 'tpd':'rbl'} ${type}" id=${guid} style="white-space: pre-line">${txt}</div>

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
                <div class="sp-group" style="width: 100%; overflow: hidden;">
                    <input type="range" min="1" max="100" step="1" value="0" class="story-points" oninput="this.nextElementSibling.value = this.value +'&#128220'" style="flex:auto; margin-left: 0.1rem;"/>
                    <output class="float-right" style="  margin-left: 0.6rem; margin-right: 0.6rem;">1&#128220</output>
                </div>
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
        if($('#pills-calendar-view').hasClass('active')){
            renderCalendar();
        }
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

        if(time=="" && ((selected['leaf'] !== undefined) && (selected['leaf'] !== ""))){
            time = kanban_data.projects_accessible['leaf'][selected['leaf']]['time'];
        }else{
            time = new Date(time).getTime();
        }
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
        if (time == null || time == 0){
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
        if(selected['leaf']!='')
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
            calendar_recurring: calendar_recurring,
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
                calendar_recurring = data['calendar_recurring'];

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
                    kanban_data.add(card_id,'todo',crd['txt'],crd['title'],crd['time'],crd['priority'],crd['sp'],null,null);
                    card_type_new = 'todo';
                break;
                case 'kanban-prog-body':
                    dropped_card_body.toggleClass('prog');
                    kanban_data.add(card_id,'prog',crd['txt'],crd['title'],crd['time'],crd['priority'],crd['sp'],new Date().getTime(),null);
                    card_type_new = 'prog';
                break;
                case 'kanban-done-body':
                    dropped_card_body.toggleClass('done');
                    let tm = new Date().getTime();
                    let prog_time = crd['prog_time'];
                    if(prog_time === null){
                        prog_time = tm-1000;
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
                kanban_data.add(id,'subtask',txt,'','',priority,sp,new Date().getTime(),'',parent_type,parent_id,tpd_subtask);
                break;
            case '2':
                let tm = new Date().getTime();
                if(prog_time === null){
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


})
