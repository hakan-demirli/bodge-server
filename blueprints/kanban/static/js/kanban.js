
$(function () {
'use strict'

    var fuckcss = `<div class="form-group" style="  visibility: hidden; width: 9%;">
                    <textarea class="form-control" rows="1" placeholder=""></textarea>
                    <button type="submit" class="btn btn-primary w-50" id="kanban-add-button"><i class="fa-solid fa-check"></i></button>
                    <button type="submit" class="btn btn-secondary float-right w-50" id="kanban-cancel-button"><i class="fas fa-times"></i></button>
                </div>`; // Size of the columns expand/shrink if smth added/removed to the empty column. Hence, add an invisible card to prevent it.

    function savedCard(header,type,guid,txt,icon,title,time,priority){
        let bg_color = '';
        switch(priority){
            case "5": bg_color = 'style="border-bottom: 1px solid rgb(255,   0,   0);"'; break;
            case "4": bg_color = 'style="border-bottom: 1px solid rgb(255, 150,   0);"'; break;
            case "3": bg_color = 'style="border-bottom: 1px solid rgb(100, 250,   0);"'; break;
            case "2": bg_color = 'style="border-bottom: 1px solid rgb( 50, 190, 140);"'; break;
            case "1": bg_color = ''; break;
        }
        let ak = `
        <div class="card card-saved" style="">
            ${header ?(`<div class="card-header card-header-drag" ${bg_color}>
                            <div id="title" style="float: left;">${title}</div>
                            <div id="time" style="float: right;">${time}</div>
                        </div>`):('')}
            <div class="card-body card-saved-body ${type}" id=${guid} style="white-space: pre-line">${txt}</div>
            <a href='#'><i class="${icon}"></i></a>
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
                        new tempusDominus.TempusDominus(document.getElementById('datetimepicker1'));
                    </script>
                    `):('')}
            <button type="submit" class="btn btn-primary w-50" id="kanban-add-button"><i class="fa-solid fa-check"></i></button>
            <button type="submit" class="btn btn-secondary float-right w-50" id="kanban-cancel-button"><i class="fas fa-times"></i></button>
        </div>`;
        return ak;
    }

    var projects_selected = {};
    var selected = {'root': '',
                    'branch': '',
                    'leaf': ''};
    var selected_old = {'root': '',
                    'branch': '',
                    'leaf': ''};

    class KanbanDataClass{
        constructor(proj,proj_ac) {
            this.projects = proj;
            this.projects_accessible = proj_ac;
        }
        recreateProjectsAccessible(){
            this.projects_accessible = {root: {},branch: {},leaf: {},todo:{},prog:{},done:{}};
            for(let root_id in this.projects){ // for every root
                for(let branch_id in this.projects[root_id]['childs']){ // for every branch of the root
                    this.projects_accessible['branch'][branch_id] = this.projects[root_id]['childs'][branch_id];
                    for(let leaf_id in this.projects[root_id]['childs'][branch_id]['childs']){ // for every leaf of the branch
                        this.projects_accessible['leaf'][leaf_id] = this.projects[root_id]['childs'][branch_id]['childs'][leaf_id];
                        for(let tpd in this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs']){ // for every todo/prog/done of the leaf
                            for(let tpd_id in this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd]){ // for every id in the todo/prog/done
                                this.projects_accessible[tpd][tpd_id] = this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd][tpd_id];
                            }
                        }
                    }
                }
            }
        }
        add(id,type,txt,title,time,priority,prog_time,done_time){
            switch(type) {
                case 'root':
                    this.projects[id] = {txt:txt,childs:{}};
                    break;
                case 'branch':
                    this.projects[selected['root']]['childs'][id] = {parent:selected['root'], txt:txt,childs:{}};
                    this.projects_accessible[type][id] = this.projects[selected['root']]['childs'][id];
                    break;
                case 'leaf':
                    this.projects[selected['root']]['childs'][selected['branch']]['childs'][id] = {parents:{branch:selected['branch'],root:selected['root']},txt:txt,time:time,childs:{todo:{},prog:{},done:{}}};
                    this.projects_accessible['branch'][selected['branch']]['childs'] = this.projects[selected['root']]['childs'][selected['branch']]['childs'];
                    this.projects_accessible[type][id] = this.projects[selected['root']]['childs'][selected['branch']]['childs'][id];
                    break;
                case 'todo':
                case 'prog':
                case 'done':
                    this.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'][type][id] = {parents:{branch:selected['branch'],
                        root:selected['root'],
                        leaf:selected['leaf']},
                        txt:txt,
                        title:title,
                        time:time,
                        priority:priority,
                        prog_time:prog_time,
                        done_time:done_time};
                    this.projects_accessible['branch'][selected['branch']]['childs'] = this.projects[selected['root']]['childs'][selected['branch']]['childs'];
                    this.projects_accessible['leaf'][selected['leaf']]['childs'] = this.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'];
                    this.projects_accessible[type][id] = this.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'][type][id];
                    break;
            }
            this.recreateProjectsAccessible();
        }
        remove(id,type){
            switch(type) {
                case 'root':
                    delete this.projects[id];
                    break;
                case 'branch':
                    let prootid = this.projects_accessible[type][id]['parent'];
                    delete this.projects[prootid]['childs'][id];
                    break;
                case 'leaf':
                    let psrootid = this.projects_accessible[type][id]['parents']['root'];
                    let psbranchid = this.projects_accessible[type][id]['parents']['branch'];
                    delete this.projects[psrootid]['childs'][psbranchid]['childs'][id];
                    break;
                case 'todo':
                case 'prog':
                case 'done':
                    let ps3rootid = this.projects_accessible[type][id]['parents']['root'];
                    let ps3branchid = this.projects_accessible[type][id]['parents']['branch'];
                    let ps3leafid = this.projects_accessible[type][id]['parents']['leaf'];
                    delete this.projects[ps3rootid]['childs'][ps3branchid]['childs'][ps3leafid]['childs'][type][id];
                    break;
            }
            this.recreateProjectsAccessible();
        }
        type(id){
            if(this.projects_accessible["root"][id]   !== undefined){return 'root'}
            if(this.projects_accessible["branch"][id] !== undefined){return 'branch'}
            if(this.projects_accessible["leaf"][id]   !== undefined){return 'leaf'}
            if(this.projects_accessible["todo"][id]   !== undefined){return 'todo'}
            if(this.projects_accessible["prog"][id]   !== undefined){return 'prog'}
            if(this.projects_accessible["done"][id]   !== undefined){return 'done'}
            throw new Error('No match found!');
        }
    }

    function addEditCard(e){
        let ak = editCard(e.data.extra.row,e.data.extra.date,e.data.extra.summary);
        $(e.target.closest(`#${e.data.extra.name}-card`)).find(`#${e.data.extra.name}-body`).prepend(ak);
    }

    function removeCard(e) {
        e.target.closest('.form-group').remove();
    }

    function removeAddedCard(e) {
        let body = $(e.target).closest('.card-saved').children('.card-saved-body');
        let id = body.attr("id");
        e.target.closest('.card').remove();
        if(body.hasClass('todo')){kanban_data.remove(id,'todo');}
        if(body.hasClass('prog')){kanban_data.remove(id,'prog');}
        if(body.hasClass('done')){kanban_data.remove(id,'done');}
        kanbanWriteBackend();
    }

    function removeAddedProjectNode(e) {
        let body = $(e.target).closest('.card-saved').children('.card-saved-body');
        let id = body.attr("id");
        if(id == selected['root'] || id == selected['branch'] || id == selected['leaf']){
            toastr.warning("you can't delete selected items");
        }else{
            if (confirm('Delete? U sure?')){
                e.target.closest('.card').remove();
                if(body.hasClass('root')){
                    delete projects_selected[id];
                    kanban_data.remove(id,'root');
                }
                if(body.hasClass('branch')){
                    projects_selected[kanban_data.projects_accessible['branch'][id]['parent']][1] = '';
                    projects_selected[kanban_data.projects_accessible['branch'][id]['parent']][2] = '';
                    kanban_data.remove(id,'branch');
                }
                if(body.hasClass('leaf')){
                    projects_selected[kanban_data.projects_accessible['leaf'][id]['parents']['root']][2] = '';
                    kanban_data.remove(id,'leaf');
                }
                kanbanWriteBackend();
            }
        }
    }

    function saveCard(e){
        let txt      = $(e.target.closest('.form-group')).children('#content').val();
        let title    = $(e.target.closest('.form-group')).children('.input-group').children('#title').val();
        let time     = $(e.target.closest('.form-group')).children('.input-group').children('#clock-add-time').val();
        let priority = $(e.target.closest('.form-group')).children('.input-group').children('.input-group-append').children('.form-select').val();
        if(time=="" && selected['leaf'] !== undefined){
            time = kanban_data.projects_accessible['leaf'][selected['leaf']]['time'];}
        let myguid = guid();
        let ak = savedCard(e.data.extra.header,e.data.extra.type,myguid,txt,e.data.extra.icon,title,time,priority);
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
        tmp.prepend(ak);
        removeCard(e);
        kanban_data.add(myguid,e.data.extra.type,txt,title,time,priority,prog_time,done_time);
        selectCardBackend(e.data.extra.type,myguid);
        recreateRightColumns(e.data.extra.type);
        selectCardFrontend(e.data.extra.type);
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
                    let ak = savedCard(0,'branch',key,br['txt'],"fa-solid fa-rectangle-xmark",br['title'],br['time'],br['priority']);
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
                    let ak = savedCard(0,'leaf',key,lf['txt'],"fa-solid fa-rectangle-xmark",lf['title'],lf['time'],lf['priority']);
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
                        let ak = savedCard(1,tpd,key,t[tpd][key]['txt'],"fa-solid fa-square-xmark",t[tpd][key]['title'],t[tpd][key]['time'],t[tpd][key]['priority']);
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

    function selectCardFrontend(column_type){
        let root_sel, branch_sel, leaf_sel;
        let root_exst, branch_exst, leaf_exst = 0;
        if(selected_old[column_type] != '')
            $(`.kanban-projects-${column_type}`).children('#kanban-projects-body').children(`.card`).children(`#${selected_old[column_type]}`).toggleClass('bg-info');
        if(selected['root'] != ''){
            root_sel = $(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${selected['root']}`);
            root_exst = 1;
            if(selected['branch'] != ''){
                branch_sel = $(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${selected['branch']}`);
                branch_exst = 1;
                if(selected['leaf'] != ''){
                    leaf_sel = $(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${selected['leaf']}`);
                    leaf_exst = 1;
                }
            }
        }else{return;}

        switch(column_type) {
            case 'root':
                if(!root_sel.hasClass('bg-info')){root_sel.toggleClass('bg-info');}
                if(branch_exst){branch_sel.toggleClass('bg-info');}
                if(leaf_exst){leaf_sel.toggleClass('bg-info');}
            break;
            case 'branch':
                if(!branch_sel.hasClass('bg-info')){branch_sel.toggleClass('bg-info');}
                if(leaf_exst){leaf_sel.toggleClass('bg-info');}
            break;
            case 'leaf':
                if(!leaf_sel.hasClass('bg-info')){leaf_sel.toggleClass('bg-info');}
                updateRemaningTime(kanban_data.projects_accessible['leaf'][selected['leaf']]['time']);
            break;
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

    function selectCardBackend(column_type,id){
        switch(column_type) {
            case 'root':
                selected_old['root'] = selected['root'];
                selected_old['branch'] = '';
                selected_old['leaf'] = '';
                selected[column_type] = id;
                selected['branch'] = '';
                selected['leaf'] = '';

                if (selected['root'] in projects_selected){
                    if (projects_selected[selected['root']][1] != ''){
                        selected['branch'] = projects_selected[selected['root']][1];
                    }else{
                        selected['branch'] = '';
                    }
                    if (projects_selected[selected['root']][2] != ''){
                        selected['leaf'] = projects_selected[selected['root']][2];
                    }else{
                        selected['leaf'] = '';
                    }
                }else{
                    projects_selected[selected['root']] = Array(3).fill('');
                    projects_selected[selected['root']][0] = selected['root'];
                }
            break;
            case 'branch':
                selected_old['branch'] =  selected['branch'];
                selected_old['leaf'] = '';
                selected[column_type] = id;
                selected['leaf'] = '';
                projects_selected[selected['root']][1] = selected[column_type];
                projects_selected[selected['root']][2] = '';

                if (projects_selected[selected['root']][2] != ''){
                    selected['leaf'] = projects_selected[selected['root']][2];
                }else{
                    let akey;
                    for(akey in kanban_data.projects_accessible['branch'][id]['childs']){
                        break;
                    }
                    selected['leaf'] = akey;
                }
            break;
            case 'leaf':
                selected_old['leaf'] = selected['leaf'];
                selected[column_type] = id;
                projects_selected[selected['root']][2] = selected[column_type];
            break;
        }
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
            selected_old: selected_old,
            projects_selected: projects_selected,
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
                selected_old = data['selected_old'];
                projects_selected = data['projects_selected'];

                let tmp = '';
                for(let key in kanban_data.projects){
                    let txt      = kanban_data.projects[key]['txt'];
                    let title    = kanban_data.projects[key]['title'];
                    let time     = kanban_data.projects[key]['time'];
                    let priority = kanban_data.projects[key]['priority'];
                    let ak = savedCard(0,'root',key,txt,"fa-solid fa-rectangle-xmark",title,time,priority);
                    tmp = tmp + ak;
                }
                tmp = tmp + fuckcss;
                $(`.kanban-projects-root`).children('#kanban-projects-body').html(tmp);
                selectCardFrontend('root');
                if( selected['root'] != '')
                    recreateRightColumns('root');
                selectCardFrontend('root');
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
        var sAMPM = "AM";
        var iHourCheck = parseInt(sHour);

        if (iHourCheck > 12) {
            sAMPM = "PM";
            sHour = iHourCheck - 12;
        }
        else if (iHourCheck === 0) {
            sHour = "12";
        }
        sHour = padValue(sHour);
        return sMonth + "/" + sDay + "/" + sYear + ", " + sHour + ":" + sMinute + " " + sAMPM;
    }

    function padValue(value) {
        return (value < 10) ? "0" + value : value;
    }

    $('.connectedSortable').sortable({
        cancel: ".unsortable",
        update: function(e, ui) {

        },
        receive: function( e, ui ) {
            let dropped_card_body = ui.item.find(".card-saved-body");
            let card_id   = dropped_card_body.attr('id');
            let card_type = kanban_data.type(card_id);
            let body_name = e.target.id;
            let txt       = kanban_data.projects_accessible[card_type][card_id]['txt'];
            let title     = kanban_data.projects_accessible[card_type][card_id]['title'];
            let time      = kanban_data.projects_accessible[card_type][card_id]['time'];
            let priority  = kanban_data.projects_accessible[card_type][card_id]['priority'];
            let prog_time = kanban_data.projects_accessible[card_type][card_id]['prog_time'];
            let done_time = kanban_data.projects_accessible[card_type][card_id]['done_time'];
            let new_guid  = guid();
            kanban_data.remove(card_id,card_type);
            dropped_card_body.toggleClass(card_type);
            dropped_card_body.attr('id',new_guid)

            switch(body_name){
                case 'kanban-todo-body':
                    dropped_card_body.toggleClass('todo');
                    kanban_data.add(new_guid,'todo',txt,title,time,priority,'','');
                break;
                case 'kanban-prog-body':
                    dropped_card_body.toggleClass('prog');
                    kanban_data.add(new_guid,'prog',txt,title,time,priority,formatDate(new Date()),'');
                break;
                case 'kanban-done-body':
                    dropped_card_body.toggleClass('done');
                    kanban_data.add(new_guid,'done',txt,title,time,priority,prog_time,formatDate(new Date()));
                break;
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


    $('.card').on("click",('.card-saved'),function(e) {
        let column_type;
        if($(e.target).hasClass('root')){
            column_type = 'root';
        }
        if($(e.target).hasClass('branch')){
            column_type = 'branch';
        }
        if($(e.target).hasClass('leaf')){
            column_type = 'leaf';
        }
        selectCardBackend(column_type,$(e.target).attr('id'));
        recreateRightColumns(column_type);
        selectCardFrontend(column_type);
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
            let itm = kanban_data.projects_accessible[info.event.groupId][info.event.id];
            let types = {root:'', branch:'', leaf:''}; //order matters
            for(let type in types){
                selectCardBackend(type,itm['parents'][type]);
                recreateRightColumns(type);
                selectCardFrontend(type);
            }
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
                let lid = event_raw['parents']['leaf'];
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

    function timelineItem(header,body,id,time,priority,icon,branch_color,item_color){
        let bg_color = ''
        switch(priority){
            case "5": bg_color = 'style="border-bottom: 1px solid rgb(255,   0,   0);"'; break;
            case "4": bg_color = 'style="border-bottom: 1px solid rgb(255, 150,   0);"'; break;
            case "3": bg_color = 'style="border-bottom: 1px solid rgb(100, 250,   0);"'; break;
            case "2": bg_color = 'style="border-bottom: 1px solid rgb( 50, 190, 140);"'; break;
            case "1": bg_color = ''; break;
        }
        let ak = `  <div>
                        <i class="${icon}" style="color:${item_color}; background-color:${branch_color}; text-shadow: 0 0 4px #000000;"></i>
                        <div class="timeline-item" id="${id}">
                            <span class="time">${time}\xa0\xa0<i class="far fa-clock"></i></span>
                            <h3 class="timeline-header" ${bg_color}>${header}</h3>
                            <div class="timeline-body">${body}</div>
                        </div>
                    </div>`;
        return ak;
    }

    function createTimeline(){
        let tmp = '';
        let chronicle_pro = [];
        let parent_branches = {};
        let parent_leafs = {};
        let done_dic = kanban_data.projects_accessible['done'];
        for(let key in done_dic){
            done_dic[key]['my_id'] = key;
            chronicle_pro.push(done_dic[key]);
            parent_branches[done_dic[key]['parents']['branch']] = '';
            parent_leafs[done_dic[key]['parents']['leaf']] = '';
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
        for (const item of chronicle_pro) {
            let ak = timelineItem(item['title'],
                item['txt'],
                item['my_id'],
                item['done_time'],
                item['priority'],
                "fas fa-flag",
                parent_branches[item['parents']['branch']],parent_leafs[item['parents']['leaf']])
            tmp = ak + tmp;
            ii = ii + 1;
        }
        tmp = timeline_beg + tmp + timeline_end;
        $('.timeline').html(tmp);
    }

    $('.timeline').on('click','.timeline-item',selectLeftSide);
    $('.nav-item').on('click','#pills-timeline-view-tab',createTimeline);

    function selectLeftSide(e){
        let itm = kanban_data.projects_accessible['done'][$(e.currentTarget).attr('id')];
        let types = {root:'', branch:'', leaf:''}; //order matters
        for(let type in types){
            selectCardBackend(type,itm['parents'][type]);
            recreateRightColumns(type);
            selectCardFrontend(type);
        }
    }

    $('.nav-item').on('click','#pills-table-view-tab',fillTable);

    function initializeTable(){
        let projects_table = $('#table_id').DataTable();
        fillTable(projects_table);
    }

    function fillTable(projects_table){
        projects_table.clear();
        let types = {todo:'', prog:'',done:''};
        for(let type in types){
            for(let event_id in kanban_data.projects_accessible[type]){
                let event_raw = kanban_data.projects_accessible[type][event_id];
                projects_table.row.add([event_raw['title'],
                                        event_raw['priority'],
                                        event_raw['prog_time'],
                                        event_raw['done_time'],
                                        event_raw['txt']]);
            }
        }
        projects_table.draw(false);
    }
})