
$(function () {
'use strict'
    console.log("hi")
    // Make the dashboard widgets sortable Using jquery UI
    $('.connectedSortable').sortable({
    cancel: ".unsortable",
    update: function(e, ui) {
        writeBackend();
    },
    placeholder: 'sort-highlight',
    connectWith: '.connectedSortable',
    handle: '.card-header-drag',
    forcePlaceholderSize: true,
    zIndex: 999999
    })
    $('.connectedSortable .card-header-drag').css('cursor', 'move')
    // bootstrap WYSIHTML5 - text editor
})