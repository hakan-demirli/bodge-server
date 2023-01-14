
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
                            <span class="time">${formatDate(new Date(time))}\xa0\xa0<i class="far fa-clock"></i></span>
                            ${sub}
                            <div class="timeline-body">${body}</div>
                            ${child_timeline}
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
            let tmp_sub = '';
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
