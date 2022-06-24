
$(function () {
'use strict'

var fuckcss = `<div class="form-group" style="  visibility: hidden; width: 9%;">
                <textarea class="form-control" rows="1" placeholder="Enter a note"></textarea>
                <button type="submit" class="btn btn-primary w-50" id="kanban-add-button"><i class="fa-solid fa-check"></i></button>
                <button type="submit" class="btn btn-secondary float-right w-50" id="kanban-cancel-button"><i class="fas fa-times"></i></button>
               </div>`;

class KanbanDataClass{
    constructor(proj,proj_ac) {
        this.projects = proj;
        this.projects_accesable = proj_ac;
    }
    add(id,type,txt){
        switch(type) {
            case 'root':
                this.projects[id] = {txt:txt,childs:{}};
                break;
            case 'branch':
                this.projects[selected['root']]['childs'][id] = {parent:selected['root'], txt:txt,childs:{}};
                this.projects_accesable[type][id] = this.projects[selected['root']]['childs'][id];
                break;
            case 'leaf':
                this.projects[selected['root']]['childs'][selected['branch']]['childs'][id] = {parents:{branch:selected['branch'],root:selected['root']},txt:txt,childs:{todo:{},prog:{},done:{}}};
                this.projects_accesable['branch'][selected['branch']]['childs'] = this.projects[selected['root']]['childs'][selected['branch']]['childs'];
                this.projects_accesable[type][id] = this.projects[selected['root']]['childs'][selected['branch']]['childs'][id];
                break;
            case 'todo':
            case 'prog':
            case 'done':
                this.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'][type][id] = {parents:{branch:selected['branch'],root:selected['root'],leaf:selected['leaf']},txt:txt};
                this.projects_accesable['branch'][selected['branch']]['childs'] = this.projects[selected['root']]['childs'][selected['branch']]['childs'];
                this.projects_accesable['leaf'][selected['leaf']]['childs'] = this.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'];
                this.projects_accesable[type][id] = this.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'][type][id];
                break;
        }
        kanbanWriteBackend();
    }
    remove(id,type){
        switch(type) {
            case 'root':
                for(let branch_id in this.projects[id]['childs']){ //for every branch
                    for(let leaf_id in this.projects[id]['childs'][branch_id]['childs']){ // for every leaf
                        for(let tpd in {'todo':'','prog':'','done':''}){ // for every todo,prog,done
                            for(let entity in this.projects[id]['childs'][branch_id]['childs'][leaf_id]['childs'][tpd]){ // for every todo,prog,done
                                delete this.projects_accesable[tpd][entity];
                            }
                        }
                        delete this.projects_accesable['leaf'][leaf_id];
                    }
                    delete this.projects_accesable['branch'][branch_id];
                }
                delete this.projects[id];
                break;
            case 'branch':
                let prootid = this.projects_accesable[type][id]['parent'];
                console.log(type);
                console.log(id);
                console.log(prootid);
                for(let leaf_id in this.projects[prootid]['childs'][id]['childs']){ // for every leaf
                    for(let tpd in {'todo':'','prog':'','done':''}){ // for every todo,prog,done
                        for(let entity in this.projects[prootid]['childs'][id]['childs'][leaf_id]['childs'][tpd]){ // for every todo,prog,done
                            delete this.projects_accesable[tpd][entity];
                        }
                    }
                    delete this.projects_accesable['leaf'][leaf_id];
                }
                delete this.projects[prootid]['childs'][id];
                delete this.projects_accesable[type][id];
                break;
            case 'leaf':
                let psrootid = this.projects_accesable[type][id]['parents']['root'];
                let psbranchid = this.projects_accesable[type][id]['parents']['branch'];
                for(let tpd in {'todo':'','prog':'','done':''}){ // for every todo,prog,done
                    for(let entity in this.projects[psrootid]['childs'][psbranchid]['childs'][id]['childs'][tpd]){ // for every todo,prog,done
                        delete this.projects_accesable[tpd][entity];
                    }
                }
                delete this.projects_accesable[type][id];
                delete this.projects_accesable['branch'][psbranchid]['childs'][id];
                delete this.projects[psrootid]['childs'][psbranchid]['childs'][id];
                break;
            case 'todo':
            case 'prog':
            case 'done':
                let ps3rootid = this.projects_accesable[type][id]['parents']['root'];
                let ps3branchid = this.projects_accesable[type][id]['parents']['branch'];
                let ps3leafid = this.projects_accesable[type][id]['parents']['leaf'];
                delete this.projects[ps3rootid]['childs'][ps3branchid]['childs'][ps3leafid]['childs'][type][id];
                delete this.projects_accesable['branch'][ps3branchid]['childs'][ps3leafid]['childs'][type][id];
                delete this.projects_accesable['leaf'][ps3leafid]['childs'][type][id];
                delete this.projects_accesable[type][id];
                break;
        }
        kanbanWriteBackend();
    }
}

    function addEditCard(e){
        console.log("here adding the edit card");
        let ak = `
        <div class="form-group">
            <textarea class="form-control" rows="${e.data.extra.row}" placeholder="..."></textarea>
            <button type="submit" class="btn btn-primary w-50" id="kanban-add-button"><i class="fa-solid fa-check"></i></button>
            <button type="submit" class="btn btn-secondary float-right w-50" id="kanban-cancel-button"><i class="fas fa-times"></i></button>
        </div>`;
        console.log(`#${e.data.extra.name}-card`);
        console.log($(e.target.closest(`#${e.data.extra.name}-card`)));
        console.log($(e.target.closest(`#${e.data.extra.name}-card`)).find(`#${e.data.extra.name}-body`));
        $(e.target.closest(`#${e.data.extra.name}-card`)).find(`#${e.data.extra.name}-body`).prepend(ak);
    }

    function removeCard(e) {
        e.target.closest('.form-group').remove();
    }

    function removeAddedCard(e) {
        let id = $(e.target).parent('.card').children('.card-saved').attr("id");
        let column_type_todo = $(e.target).parent('.card').children('.card-saved').hasClass('todo');
        let column_type_prog = $(e.target).parent('.card').children('.card-saved').hasClass('prog');
        let column_type_done = $(e.target).parent('.card').children('.card-saved').hasClass('done');
        e.target.closest('.card').remove();
        if(column_type_todo){
            kanban_data.remove(id,'todo');
        }
        if(column_type_prog){
            kanban_data.remove(id,'prog');
        }
        if(column_type_done){
            kanban_data.remove(id,'done');
        }
    }

    function removeAddedProjectNode(e) {
        let id = $(e.target).parent('.card').children('.card-saved').attr("id");
        let column_type_root = $(e.target).parent('.card').children('.card-saved').hasClass('root');
        let column_type_branch = $(e.target).parent('.card').children('.card-saved').hasClass('branch');
        let column_type_leaf = $(e.target).parent('.card').children('.card-saved').hasClass('leaf');
        if(id == selected['root'] || id == selected['branch'] || id == selected['leaf']){
            toastr.warning("you can't delete selected items");
        }else{
            if (confirm('Delete? U sure?')){
                e.target.closest('.card').remove();
                if(column_type_root){
                    delete projects_selected[id];
                    kanban_data.remove(id,'root');
                }
                if(column_type_branch){
                    projects_selected[kanban_data.projects_accesable['branch'][id]['parent']][1] = '';
                    projects_selected[kanban_data.projects_accesable['branch'][id]['parent']][2] = '';
                    kanban_data.remove(id,'branch');
                }
                if(column_type_leaf){
                    projects_selected[kanban_data.projects_accesable['leaf'][id]['parents']['root']][2] = '';
                    kanban_data.remove(id,'leaf');
                }
                kanbanWriteBackend();
            }
        }
    }

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
                if(selected['leaf'] == '' || $.isEmptyObject(kanban_data.projects_accesable['branch'][selected['branch']]['childs'])){
                    toastr.warning(`Can't add without a parent.`);
                    return;
                }
                break;
        }
        tmp.prepend(ak);
        removeCard(e);
        kanban_data.add(myguid,e.data.extra.type,txt);
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
                if ($.isEmptyObject(kanban_data.projects[selected['root']]["childs"]))
                    break;
                for(let key in kanban_data.projects[selected['root']]["childs"]){
                    let txt =  kanban_data.projects[selected['root']]["childs"][key]['txt'];
                    let ak = `
                    <div class="card">
                        <div class="card-body card-saved branch" id=${key} style='white-space:pre'>${txt}</div><i class="fa-solid fa-rectangle-xmark"></i>
                    </div>`;
                    tmp = tmp + ak;
                }
                tmp = tmp + fuckcss;
                $(`.kanban-projects-branch`).children('#kanban-projects-body').html(tmp);
            case 'branch':
                if( selected['branch'] == '')
                    break;
                if ($.isEmptyObject(kanban_data.projects[selected['root']]["childs"][selected['branch']]["childs"]))
                    break;
                tmp = '';
                for(let key in kanban_data.projects[selected['root']]["childs"][selected['branch']]["childs"]){
                    let txt =  kanban_data.projects[selected['root']]["childs"][selected['branch']]["childs"][key]['txt'];
                    let ak = `
                    <div class="card">
                        <div class="card-body card-saved leaf" id=${key} style='white-space:pre'>${txt}</div><i class="fa-solid fa-rectangle-xmark"></i>
                    </div>`;
                    tmp = tmp + ak;
                }
                tmp = tmp + fuckcss;
                $(`.kanban-projects-leaf`).children('#kanban-projects-body').html(tmp);
            case 'leaf':
                if(selected['leaf'] == '')
                    break;
                if($.isEmptyObject(kanban_data.projects[selected['root']]["childs"][selected['branch']]["childs"][selected['leaf']]["childs"]['todo']) &&
                    $.isEmptyObject(kanban_data.projects[selected['root']]["childs"][selected['branch']]["childs"][selected['leaf']]["childs"]['prog']) &&
                    $.isEmptyObject(kanban_data.projects[selected['root']]["childs"][selected['branch']]["childs"][selected['leaf']]["childs"]['done']))
                    break;
                tmp = '';
                for(let tpd in {'todo':'','prog':'','done':''}){
                    for(let key in  kanban_data.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'][tpd]){
                        let txt = kanban_data.projects[selected['root']]['childs'][selected['branch']]['childs'][selected['leaf']]['childs'][tpd][key]['txt'];
                        let ak = `<div class="card">
                                    <div class="card-header card-header-drag"></div>
                                    <div class="card-body card-saved ${tpd}" id=${key} style='white-space:pre'>${txt}</div><i class="fa-solid fa-square-xmark"></i>
                                </div>`;
                        tmp = tmp + ak;
                    }
                    $(`#kanban-${tpd}-card`).children(`#kanban-${tpd}-body`).html(tmp);
                    tmp = '';
                }
        }
    }

    function selectCardFrontend(column_type){
        if (selected_old[column_type] != '')
            $(`.kanban-projects-${column_type}`).children('#kanban-projects-body').children(`.card`).children(`#${selected_old[column_type]}`).toggleClass('bg-info');
        if( selected['root'] == '')
            return;

        switch(column_type) {
            case 'root':
                if($(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${selected['root']}`).hasClass('bg-info')){
                    //console.log("nope")
                }else{
                    $(`.kanban-projects-root`).children('#kanban-projects-body').children(`.card`).children(`#${selected['root']}`).toggleClass('bg-info');
                }
                if (selected['branch'] != '')
                    $(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${selected['branch']}`).toggleClass('bg-info');
                if (selected['leaf'] != '')
                    $(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${selected['leaf']}`).toggleClass('bg-info');

            break;
            case 'branch':
                if($(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${selected['branch']}`).hasClass('bg-info')){
                    //console.log("nope")
                }else{
                    $(`.kanban-projects-branch`).children('#kanban-projects-body').children(`.card`).children(`#${selected['branch']}`).toggleClass('bg-info');
                }
                if (selected['leaf'] != '')
                    $(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${selected['leaf']}`).toggleClass('bg-info');
            break;
            case 'leaf':
                if($(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${selected['leaf']}`).hasClass('bg-info')){
                    //console.log("nope");
                }else{
                    $(`.kanban-projects-leaf`).children('#kanban-projects-body').children(`.card`).children(`#${selected['leaf']}`).toggleClass('bg-info');
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
                    for(akey in kanban_data.projects_accesable['branch'][id]['childs']){
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
        console.log('selected',selected);
        console.log('projects_selected',projects_selected);
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
            projects_accesable: kanban_data.projects_accesable,
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
                kanban_data.projects =  data['projects'];
                kanban_data.projects_accesable = data['projects_accesable'];
                selected = data['selected'];
                selected_old = data['selected_old'];
                projects_selected = data['projects_selected'];

                let tmp = '';
                for(let key in kanban_data.projects){
                    let txt =  kanban_data.projects[key]['txt'];
                    let ak = `
                    <div class="card">
                        <div class="card-body card-saved root" id=${key} style='white-space:pre'>${txt}</div><i class="fa-solid fa-rectangle-xmark"></i>
                    </div>`;
                    tmp = tmp + ak;
                }
                tmp = tmp + fuckcss;
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
    $('.connectedSortable').sortable({
        cancel: ".unsortable",
        update: function(e, ui) {

        },
        receive: function( e, ui ) {
            let dropped_card = ui.item.find(".card-saved");
            let card_id = dropped_card.attr('id');
            let body_name = e.target.id;
            console.log(body_name);
            console.log(card_id);
            console.log(dropped_card.text());
            switch(body_name){
                case 'kanban-todo-body':
                    kanban_data.add(card_id,'todo',dropped_card.text());
                    if(dropped_card.hasClass("prog")){
                        kanban_data.remove(card_id,'prog');
                        dropped_card.toggleClass('prog');
                        dropped_card.toggleClass('todo');
                    }
                    if(dropped_card.hasClass("done")){
                        kanban_data.remove(card_id,'done');
                        dropped_card.toggleClass('done');
                        dropped_card.toggleClass('todo');
                    }
                break;
                case 'kanban-prog-body':
                    kanban_data.add(card_id,'prog',dropped_card.text());
                    if(dropped_card.hasClass("done")){
                        kanban_data.remove(card_id,'done');
                        dropped_card.toggleClass('done');
                        dropped_card.toggleClass('prog');
                    }
                    if(dropped_card.hasClass("todo")){
                        kanban_data.remove(card_id,'todo');
                        dropped_card.toggleClass('todo');
                        dropped_card.toggleClass('prog');
                    }
                break;
                case 'kanban-done-body':
                    kanban_data.add(card_id,'done',dropped_card.text());
                    if(dropped_card.hasClass("prog")){
                        kanban_data.remove(card_id,'prog');
                        dropped_card.toggleClass('prog');
                        dropped_card.toggleClass('done');
                    }
                    if(dropped_card.hasClass("todo")){
                        kanban_data.remove(card_id,'todo');
                        dropped_card.toggleClass('todo');
                        dropped_card.toggleClass('done');
                    }
                break;
            }
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

    $('#kanban-todo-card').children('.card-header').children('.card-tools').on("click",('.kanban-plus'),{ extra : {row:4,name:'kanban-todo'}},addEditCard);
    $('#kanban-todo-body').on("click",('#kanban-add-button'),{ extra : {name:'kanban-todo',icon:"fa-solid fa-square-xmark",header:1,type:'todo'}},saveCard);
    $('#kanban-todo-body').on("click",('#kanban-cancel-button'),removeCard);
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

  ini_events($('#external-events div.external-event'))

  /* initialize the calendar
   -----------------------------------------------------------------*/
  //Date for the calendar events (dummy data)
  var date = new Date()
  var d    = date.getDate(),
      m    = date.getMonth(),
      y    = date.getFullYear()

  var Calendar = FullCalendar.Calendar;
  var calendarEl = document.getElementById('calendar');

  // initialize the external events
  // -----------------------------------------------------------------


  var calendar = new Calendar(calendarEl, {
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
    //Random default events
    events: [
      {
        title          : 'All Day Event',
        start          : new Date(y, m, 1),
        backgroundColor: '#f56954', //red
        borderColor    : '#f56954', //red
        allDay         : true
      },
      {
        title          : 'Long Event',
        start          : new Date(y, m, d - 5),
        end            : new Date(y, m, d - 2),
        backgroundColor: '#f39c12', //yellow
        borderColor    : '#f39c12' //yellow
      },
      {
        title          : 'Meeting',
        start          : new Date(y, m, d, 10, 30),
        allDay         : false,
        backgroundColor: '#0073b7', //Blue
        borderColor    : '#0073b7' //Blue
      },
      {
        title          : 'Lunch',
        start          : new Date(y, m, d, 12, 0),
        end            : new Date(y, m, d, 14, 0),
        allDay         : false,
        backgroundColor: '#00c0ef', //Info (aqua)
        borderColor    : '#00c0ef' //Info (aqua)
      },
      {
        title          : 'Birthday Party',
        start          : new Date(y, m, d + 1, 19, 0),
        end            : new Date(y, m, d + 1, 22, 30),
        allDay         : false,
        backgroundColor: '#00a65a', //Success (green)
        borderColor    : '#00a65a' //Success (green)
      },
      {
        title          : 'Click for Google',
        start          : new Date(y, m, 28),
        end            : new Date(y, m, 29),
        url            : 'https://www.google.com/',
        backgroundColor: '#3c8dbc', //Primary (light-blue)
        borderColor    : '#3c8dbc' //Primary (light-blue)
      }
    ],
    editable  : false,
    droppable : false
  });

  calendar.render();

})