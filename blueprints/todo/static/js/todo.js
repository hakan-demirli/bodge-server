$(function () {
    const todo_add_button_id = 'todo-add-button';
    const todo_add_text_id = 'todo-add-text';
    const todo_list_id = 'todo-list';
    const todo_remove_icon_class = 'todo-remove-icon';

    function todoListAddItemButton() {
        let uid = guid();
        let txt = `${$('#'+todo_add_text_id).val()}`;
        $('#'+todo_add_text_id).val('');
        todoListAddItem(txt,uid);
        todoListWriteBackend();
    }

    function todoListAddItemBackend(txt,uid) {
        let kk = 0;
        for(kk=0;kk<txt.length;kk=kk+1){
            todoListAddItem(txt[kk],uid[kk]);
        }
        todoListWriteBackend();
    }

    function todoListAddItem(txt,uid) {
        let todo_list_element = `\
        <li id='${uid}'>\
            <span class="handle">\
                <i class="fas fa-ellipsis-v"></i>\
                <i class="fas fa-ellipsis-v"></i>\
            </span>\
            <div  class="icheck-primary d-inline ml-2">\
                <input type="checkbox" value="" name="todo${uid}" id="todoCheck${uid}">\
                <label for="todoCheck${uid}"></label>\
            </div>\
            <span class="text">${txt}</span>\
            <div class="tools">\
                <i class="fas fa-trash-alt todo-remove-icon"></i>\
            </div>\
        </li>`;
        $('#'+todo_list_id).append(todo_list_element);
    }

    function todoListRemoveItem(e) {
        e.target.closest('li').remove()
        todoListWriteBackend();
    }

    function todoListEnterToAdd(e){
        if(e.keyCode == 13)
            todoListAddItemButton()
    }

    function todoListWriteBackend() {
        // todoListGetOrder
        let todo_items = $('#'+todo_list_id).children();
        let todo_order = []
        todo_items.each(function(idx, val){
            todo_order.push(val.id)
        });

        // todoListGetTexts
        let todo_texts = []
        todo_items.children('.text').each(function(idx, val){
            todo_texts.push(val.textContent)
        });

        let entry = {
            todo_order: todo_order,
            todo_texts: todo_texts,
            command: 'WRITE'
        };

        fetch(`${window.origin}/todo/backend`, {
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

    function todoListReadBackend() {

        let entry = {
            command: 'READ'
        };

        fetch(`${window.origin}/todo/backend`, {
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
            console.log(data['todo_order']);
            console.log(data['todo_texts']);
            todoListAddItemBackend(data['todo_texts'],data['todo_order']);
        });
        })
        .catch(function (error) {
            console.log("Fetch error: " + error);
        });
    }


    // Make TODO list items sortable
    $('.todo-list').sortable({
        update: function(e, ui) {
            todoListWriteBackend();
        },
        placeholder: 'sort-highlight',
        handle: '.handle',
        forcePlaceholderSize: true,
        zIndex: 999999
    })

    $('#'+todo_add_text_id).on("keydown",todoListEnterToAdd);
    $('#'+todo_add_button_id).on('click', todoListAddItemButton);
    $('#'+todo_list_id).on("click",('.'+todo_remove_icon_class),todoListRemoveItem);
    todoListReadBackend()







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