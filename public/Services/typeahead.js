window.typeahead = {};
(function($) {
    function setArray(id) {
        var val = $('#DROP').find('.list-group-item');
        var arr = [];
        var list_item = {};
        $.each(val, function(i, value) {
            list_item[$(value).text()] = $(value).data('id');
            arr.push($(value).text());
        });
        setTypeahead(id,arr);
        return list_item;
    }

    function setTypeahead(id,arr) {
        $('#'+id).typeahead({
            name: 'val',
            local: arr,
            limit: 1000
        });
    }

    function mainClick() {
        $('#search').bind('typeahead:selected', function(name) {
            var id = [list_item[name.currentTarget.value]];
            if (!flag || confirm("Save Changes") == true) {
                saveChanges();
                category_id = id;
                show_table(id);
            } else {
                localStorage.removeItem('undo');
                flag = false;
                show_table(id);
            }
        })
    }

    typeahead.setArray = setArray;
    //typeahead.setTypeahead = setTypeahead;
    typeahead.mainClick = mainClick;
})($);