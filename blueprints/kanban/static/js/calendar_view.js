

var calendar_recurring;

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
    var recurring_event_toggle = 1;
    var kanban_event_toggle = 1;
    var calendar = new Calendar(calendarEl, {
        eventClick: function(info) {
            if(info.event.groupId != 'recurring') {
                selectCard(kanban_data.projects_accessible['id'][info.event.id][0]);
                selectCard(kanban_data.projects_accessible['id'][info.event.id][1]);
                selectCard(kanban_data.projects_accessible['id'][info.event.id][2]);
            }
        },
        customButtons: {
            toggle_recurring_events: {
                text: 'RT',
                click: function() {
                    let allEvents = calendar.getEvents();
                    for (let ev of allEvents) {
                        if (ev.groupId == 'recurring') {
                            if(recurring_event_toggle)
                                ev.setProp("display", "none");
                            else
                                ev.setProp("display", "auto");
                        }
                    }
                    recurring_event_toggle = !recurring_event_toggle;
                }
            },
            toggle_kanban_events: {
                text: 'KT',
                click: function() {
                    let allEvents = calendar.getEvents();
                    for (let ev of allEvents) {
                        if (ev.groupId != 'recurring') {
                            if(kanban_event_toggle)
                                ev.setProp("display", "none");
                            else
                                ev.setProp("display", "auto");
                        }
                    }
                    kanban_event_toggle = !kanban_event_toggle;
                }
            }
        },
        headerToolbar: {
            left  : 'prev,next today',
            center: 'title',
            right : 'dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek,listMonth,toggle_recurring_events,toggle_kanban_events'
        },
        views: {
            listDay: { buttonText: 'list day' },
            listWeek: { buttonText: 'list week' },
            listMonth: { buttonText: 'list month' }
        },
        eventTimeFormat: {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        },
        themeSystem: 'bootstrap',
        firstDay: 1,
        events: [],
        editable  : false,
        droppable : false
    });

    var myTimeout;
    function renderCalendar(){
        createEventsFromKanban();
        calendar.render();
    }

    $('#sidebar-toggle-button, #pills-calendar-view-tab').on( "click", function() {
        // Sidebar distorts the calendar. We have to re-render it.
        // Bootstrap 5 tabs distorts the calendar. We have to re-render it.
        // Movement of sidebar is slower than the render speed. Which causes an incorrect render.
        // Hence, call the render function after sidebar is fully extended. Which means waiting a little bit before requesting render.
        myTimeout = setTimeout(function(){calendar.updateSize();clearTimeout(myTimeout);}, 100);
        setTimeout(calendarSizeFix, 100); // Ubuntu 20 LTS specific fix
    });

    function calendarSizeFix(){
        myTimeout = setTimeout(function(){calendar.updateSize();clearTimeout(myTimeout);}, 100);
    }

    $('.nav-item').on('click','#pills-calendar-view-tab',renderCalendar);

    function createEventsFromKanban(){
        calendar.removeAllEvents();
        let types = {todo:'', prog:''};
        let events = [];
        for(let type in types){
            for(let event_id in kanban_data.projects_accessible[type]){
                let event_raw = kanban_data.projects_accessible[type][event_id];

                let event = {
                    id             : event_id,
                    title          : event_raw['title'],
                    groupId        : type,
                    start          : event_raw['time'],
                    end            : event_raw['time']+1000,
                    allDay         : false,
                    backgroundColor: '#ff73b7',
                    borderColor    : '#ff7fff'
                };
                events.push(event);
            }
        }
        for(let index in calendar_recurring){
            events.push(calendar_recurring[index]);
        }
        events.forEach(event => calendar.addEvent(event)); // too slow but I don't have a solution
    }
