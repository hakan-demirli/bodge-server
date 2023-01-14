
    // User data structure and left menu is defined here.

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
                    for(let leaf_id in this.projects[root_id]['childs'][branch_id]['childs']){ // for every leaf of the branch
                        let sp_total = 0;
                        let sp_done = 0;
                        for(let tpd in this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs']){ // for every todo/prog/done of the leaf
                            for(let tpd_id in this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd]){ // for every id in the todo/prog/done
                                for(let subt_id in this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd][tpd_id]['childs']){ // for every id in the subtasks
                                    this.projects_accessible['subtask'][subt_id] = this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd][tpd_id]['childs'][subt_id];
                                    this.projects_accessible['id'][subt_id] = [root_id,branch_id,leaf_id,tpd_id];
                                }
                                this.projects_accessible[tpd][tpd_id] = this.projects[root_id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd][tpd_id];
                                this.projects_accessible['id'][tpd_id] = [root_id,branch_id,leaf_id];
                                let sp = this.projects_accessible[tpd][tpd_id]['sp'];
                                if(tpd == 'done')
                                    sp_done = sp_done + sp;
                                sp_total = sp_total + sp
                            }
                        }
                        this.projects_accessible['leaf'][leaf_id] = this.projects[root_id]['childs'][branch_id]['childs'][leaf_id];
                        this.projects_accessible['leaf'][leaf_id]['sp_done']  = sp_done;
                        this.projects_accessible['leaf'][leaf_id]['sp_total'] = sp_total;
                        this.projects_accessible['id'][leaf_id] = [root_id,branch_id];
                    }
                    this.projects_accessible['branch'][branch_id] = this.projects[root_id]['childs'][branch_id];
                    this.projects_accessible['id'][branch_id] = [root_id];
                }
                // every root is already accessible
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
                    this.projects[selected['root']]['childs'][selected['branch']]['childs'][id] = {txt:txt,time:time,childs:{todo:{},prog:{},done:{}}};
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
            let root_id,branch_id,leaf_id,tpd_id;
            if(type != 'root'){
                root_id    = this.projects_accessible['id'][id][0];
                branch_id  = this.projects_accessible['id'][id][1];
                leaf_id    = this.projects_accessible['id'][id][2];
                tpd_id     = this.projects_accessible['id'][id][3];
            }

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

    var kanban_data = new KanbanDataClass({}, {root:{},branch:{},leaf:{},todo:{},prog:{},done:{}});

    function formatDate(newDate) {
        if(newDate.getTime()>64){
            let sMonth = padValue(newDate.getMonth() + 1);
            let sDay = padValue(newDate.getDate());
            let sYear = newDate.getFullYear();
            let sHour = newDate.getHours();
            let sMinute = padValue(newDate.getMinutes());
            sHour = padValue(sHour);
            return sMonth + "/" + sDay + "/" + sYear + ", " + sHour + ":" + sMinute;
        }
        return '';
    }

    function padValue(value) {
        return (value < 10) ? "0" + value : value;
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

    const fuckcss = `<div class="form-group" style="  visibility: hidden; width: 9%;">
                    <textarea class="form-control" rows="1" placeholder=""></textarea>
                    <button type="submit" class="btn btn-primary w-50" ><i class="fa-solid fa-check"></i></button>
                    <button type="submit" class="btn btn-secondary float-right w-50" ><i class="fas fa-times"></i></button>
                </div>`; // Size of the columns expand/shrink if smth added/removed to the empty column. Hence, add an invisible card to prevent it.


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

    const subtasks_body_up = `<div class="card dark-mode">
                                    <ul class="todo-list" data-widget="todo-list" id="todo-list">
                            `;

    const subtasks_body_down = `    </ul>
                            </div>`;

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

