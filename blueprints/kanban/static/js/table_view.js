
    $('.nav-item').on('click','#pills-table-view-tab',recreateTable);

    function recreateTable(){
        let projects_table = $('#table_id').DataTable();
        projects_table.column(0).visible(false);
        fillTable(projects_table);
    }

    function initializeTable(){
        let dateType = $.fn.dataTable.absoluteOrder( [
            { value: "", position: 'bottom' }
        ] );
        let projects_table = $('#table_id').DataTable({
            columnDefs: [
                { type: dateType, targets: [4,6] }
            ],
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
                let root_id    = kanban_data.projects_accessible['id'][event_id][0];
                let branch_id  = kanban_data.projects_accessible['id'][event_id][1];
                let root_txt = kanban_data.projects[root_id]['txt'];
                let branch_txt = kanban_data.projects_accessible['branch'][branch_id]['txt'];
                let prog_time_raw = new Date(event_raw['prog_time']);
                let prog_time = prog_time_raw.getTime() == 0 ? "" : formatDate(prog_time_raw);
                let time_raw = new Date(event_raw['time']);
                let time = time_raw.getTime() == 0 ? "" : formatDate(time_raw);

                projects_table.row.add([event_id,
                                        event_raw['title'],
                                        event_raw['priority'],
                                        event_raw['sp'],
                                        time,
                                        event_raw['txt'],
                                        prog_time,
                                        branch_txt]);
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
