
    $('.card').on("click",('.card-saved-body-rbl'),function(e) {
        if($('#pills-sp-view').hasClass('active')){
            updateSpView();
        }
    });

    function updateSpView(){

        if(selected['root'] == '' || selected['branch'] == '' || selected['leaf'] == ''){
            toastr.warning("No leaf is selected.");
            $('#chart').html('');
            $('#sp-predictions-title').html('');
            $('#sp-predictions-body').html('');
            return;
        }
        let leaf = kanban_data.projects_accessible['leaf'][selected['leaf']];
        if(leaf['time']==null || leaf['time']==0){
            $('#pills-time-view-tab').text('No leaf time.');
        }
        if($.isEmptyObject(leaf['childs']['done'])){
            $('#chart').html('');
            $('#sp-predictions-title').html('');
            $('#sp-predictions-body').html('');
            return;
        }

        let sp_points = ['sp'];
        let time_points = ['time'];
        sp_points.push(leaf['sp_total']);

        let chronicle_done = [];
        for(let done_id in leaf['childs']['done']){
            chronicle_done.push(leaf['childs']['done'][done_id]);
        }
        chronicle_done.sort(function(a,b) {
            return a.done_time - b.done_time;
        });
        time_points.push(chronicle_done[0]['prog_time']);
        for(const item of chronicle_done){
            sp_points.push(sp_points[sp_points.length - 1] - item['sp']);
            time_points.push(item['done_time']);
        }

        let sp_current = sp_points[sp_points.length - 1];
        let sp_future =  ['sp_future'].concat(Array(sp_points.length-2).fill(null));
        let sp_done = leaf['sp_total'] - sp_current;
        let time_diff = time_points[time_points.length - 1] - time_points[1];
        let time_diff_min = leaf['time'] - (new Date().getTime());
        let ms_per_sp = time_diff/parseFloat(sp_done);
        let ms_per_sp_min = time_diff_min/parseFloat(sp_current);
        let time_required = ms_per_sp*sp_current;
        let number_of_points_sofar= sp_points.length-2;
        let sp_drop_per_point = sp_done/parseFloat(number_of_points_sofar);
        let number_of_future_points = 0;
        let sp_next = 69; //nice
        let time_diff_fnl = 0;
        do {
            sp_next = sp_current-(sp_drop_per_point*(number_of_future_points));
            if(sp_next<0){
                time_diff_fnl = sp_current * ms_per_sp;
                sp_next = 0;
            }
            sp_future.push(sp_next);
            number_of_future_points = number_of_future_points + 1;
        } while(sp_next>0);

        let ms_per_future_point = time_diff/parseFloat(number_of_future_points);
        for(let i = 0;i<number_of_future_points;i++){
            time_points.push(new Date(new Date().getTime() + (ms_per_future_point*(i+1))).getTime());
        }
        if(time_diff_fnl==0){
            time_points.push(new Date(new Date().getTime() + (ms_per_future_point*(number_of_future_points+1))).getTime());
        }else{
            time_points.push(new Date(time_points[time_points.length-1] + (time_diff_fnl)).getTime());
        }
        let fail_limit = leaf['time']-time_points[time_points.length-1];
        let sp_per_day = 86400000*(1/ms_per_sp);
        let sp_per_day_min = 86400000*(1/ms_per_sp_min);
        let sp_per_day_ratio = sp_per_day/sp_per_day_min;
        let pred_title = '';
        if(leaf['time']==null || leaf['time']==0){
            pred_title = '<font color="#beb533" style="float: right;">Ignore the stats. No leaf time.</font>';
        }else{
            pred_title = (sp_per_day_ratio<1) ? (`YOU WILL FAIL!`) : (`Keep going, good job!`);
        }

        let speed_up_ratio = (sp_per_day_ratio<1) ? (`<div class="col-md-6" id="sp-info">Increase your efficiency by:<font color="#ced4da" style="float: right;">${(1/sp_per_day_ratio).toFixed(2)}</font></div>`) : (``);
        $('#sp-predictions-title').html(pred_title);
        $('#sp-predictions-body').html(`<div class="col-md-6" id="sp-info">Story Points per day:<font color="#ced4da" style="float: right;">${(sp_per_day).toFixed(2)}</font></div>
                                        <div class="col-md-6" id="sp-info">Story Points per day minimum:<font color="#ced4da" style="float: right;">${(sp_per_day_min).toFixed(2)}</font></div>
                                        <div class="col-md-6" id="sp-info">Current Ratio:<font color="#ced4da" style="float: right;">${(sp_per_day_ratio).toFixed(2)}</font></div>
                                        ${speed_up_ratio}
        `);
        let chart = c3.generate({
            bindto: '#chart',
            data: {
                x: 'time',
                columns: [
                    time_points,
                    sp_points,
                    sp_future
                ],
                types: {
                    sp: 'area-spline'
                }
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        multiline: true,
                        format: '%Y-%m-%d %H:%M',
                        rotate: 45,
                    }
                },
                y: {
                    label: {
                    text: 'Story Points',
                    position: 'outer-middle'
                    }
                }
            },
            spline: {
                interpolation: {
                    type: 'monotone'
                }
            }
        });
    }

    $('.nav-item').on('click','#pills-sp-view-tab',updateSpView);
