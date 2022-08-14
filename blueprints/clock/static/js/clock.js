
$(function () {
    var countdown_list = [];
    $(document).ready(function() {
        clockUpdate();
        countdownUpdate();
        setInterval(clockUpdate, 1000);
        setInterval(countdownUpdate, 1000);
    })

    function clockUpdate() {
        let date = new Date();
        $('.digital-clock').css({'color': '#fff', 'text-shadow': '0 0 6px #ff0'});
        function addZero(x) {
            if (x < 10) { return x = '0' + x;}
            else { return x; }
        }
        function twelveHour(x) {
            if (x > 12) { return x = x - 12;}
            else if (x == 0) { return x = 12;}
            else { return x;}
        }

        let h = addZero(twelveHour(date.getHours()));
        let m = addZero(date.getMinutes());
        let s = addZero(date.getSeconds());

        $('.digital-clock').text(h + ':' + m + ':' + s)
    }

    function countdownUpdate() {
        let now = new Date();
        countdown_list.forEach(function(val){
            let mdate = new Date(val['time']);
            let diff = mdate.getTime()-now.getTime()
            if(diff<0){
                $('.' + val['id']).text('TIMEOUT')
            }else{
                let days = Math.floor(diff / (1000 * 60 * 60 * 24));
                let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((diff % (1000 * 60)) / 1000);
                const spacePad = (num, places) => String(num).padStart(places, '\xa0')
                $('.' + val['id']).css({'color': '#fff', 'text-shadow': '0 0 2px #00f'});
                $('.' + val['id']).text(spacePad(days,3) + 'd ' + spacePad(hours,2) + ':' + spacePad(minutes,2) + ':' + spacePad(seconds,2) + "|\xa0\xa0")

            }
        });
    }

    const clock_add_button_id = 'clock-add-button';
    const clock_add_time_id = 'clock-add-time';
    const clock_add_name_id = 'clock-add-name';
    const clock_list_id = 'clock-list';
    const clock_remove_icon_class = 'clock-remove-icon';

    function clockListAddItemButton() {
        let uid =  guid();
        let txt_time = `${$('#'+clock_add_time_id).val()}`;
        let txt_name = `${$('#'+clock_add_name_id).val()}`;
        console.log(txt_time)
        console.log(txt_name)
        console.log($('#clock-add-time').val())

        $('#'+clock_add_time_id).val('');
        $('#'+clock_add_name_id).val('');
        countdown_list.push({id:uid,time:txt_time,name:txt_name})
        clockListAddItem(txt_name,uid);
        clockListWriteBackend();
    }

    function clockListAddItem(txt,uid) {
        let clock_list_element = `\
        <li class="callout callout-danger" id='${uid}'>\
            <p class="${uid} d-inline text-monospace h3"></p>
            <span class="text">${txt}</span>\
            <div class="tools">\
                <i class="fas fa-trash-alt clock-remove-icon"></i>\
            </div>\
        </li>`;
        $('#'+clock_list_id).append(clock_list_element);
    }

    function clockListRemoveItem(e) {
        let gid = $(e.target).closest('li').attr('id');
        console.log('gid',gid)
        console.log('gid',countdown_list)
        countdown_list.forEach(function(val,indx) {
            console.log(indx)
            console.log(String(val['id']))
            console.log(gid)
            if (String(val['id']) === String(gid)) {
                console.log('deleted')
                countdown_list.splice(indx, 1);
            }
        });

        e.target.closest('li').remove();
        clockListWriteBackend();
    }

    function clockListEnterToAdd(e){
        if(e.keyCode == 13)
            clockListAddItemButton()
    }

    function clockListWriteBackend() {

        let entry = {
            countdown_list: countdown_list,
            command: 'WRITE'
        };

        fetch(`${window.origin}/clock/backend`, {
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
            //console.log(data);
        });
        })
        .catch(function (error) {
            console.log("Fetch error: " + error);
        });
    }

    function clockListReadBackend() {

        let entry = {
            command: 'READ'
        };

        fetch(`${window.origin}/clock/backend`, {
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

                data['countdown_list'].forEach(function(val){
                    countdown_list.push(val)
                    clockListAddItem(val['name'],val['id']);
                    clockListWriteBackend();
            });
        });
        })
        .catch(function (error) {
            console.log("Fetch error: " + error);
        });
    }


    $('#'+clock_add_time_id).on("keydown",clockListEnterToAdd);
    $('#'+clock_add_button_id).on('click', clockListAddItemButton);
    $('#'+clock_list_id).on("click",('.'+clock_remove_icon_class),clockListRemoveItem);
    clockListReadBackend();



    /**
    * Generates a GUID string.
    * @returns {string} The generated GUID.
    * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
    * @author Slavik Meltser.
    * @link http://slavik.meltser.info/?p=142
    */
     function guid() {
        function _p8(s) {
            var p = (Math.random().toString(16)+"000000000").substr(2,8);
            return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }
})

