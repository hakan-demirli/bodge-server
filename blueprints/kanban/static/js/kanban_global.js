
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



