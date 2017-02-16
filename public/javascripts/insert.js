//import get, post, getJSON from 'service.js'
var object_type_id = {
    city: 6,
    suburb: 7,
    listing: 14,
    Project: 1,
    locality: 4
};
var config = {};
var category_id;
var flag = false;

function populateDropdown(list, config) {
    if (list != 1) {
        service.post("Show_Templates", list).then(function(resolve) {
            $('#templatetable').html(resolve);
        }, function(reject) {
            $('#status').text("problem showing");
        });
    }
    return service.post('populate', config).then(function(resolve) {
        var li = '';
        for (var i = 0; i < resolve.length; i++) {
            li += '<li class="list-group-item" data-id=' + resolve[i].id + '>' + resolve[i].id + '  ' + resolve[i].name + '</li>';
        }
        return li;
    }, function(reject) {
        $('#status').text("error");
    });
}

$(document).ready(function() {



    $('#city').on('click', 'li', function() {
        var id = $(this).attr('data-id');
        var list = [object_type_id.city];
        config.current_object_id = object_type_id.city;
        config.city_id = id;
        $("#citybtn").text($(this).text());
        $("#citybtn").val($(this).text());
        $('#suburb').parent().parent().css('display', 'inline-block');
        populateDropdown(list, { id: id, type: 'city' }).then(function(result) {
            $('#suburb').html(result);
            bindTableEvent();
        });

    });

    $('#suburb').on('click', 'li', function() {
        var id = $(this).attr('data-id');
        var list = [object_type_id.suburb];
        config.current_object_id = object_type_id.suburb;
        config.suburb_id = id;
        $("#suburbbtn").text($(this).text());
        $("#suburbbtn").val($(this).text());
        $('#locality').parent().parent().css('display', 'inline-block');
        populateDropdown(list, { id: id, type: 'suburb' }).then(function(result) {
            $('#locality').html(result);
        });
    });

    $('#locality').on('click', 'li', function() {
        var id = $(this).attr('data-id');
        var list = [object_type_id.locality];
        config.current_object_id = object_type_id.locality;
        config.locality_id = id;
        $("#localitybtn").text($(this).text());
        $("#localitybtn").val($(this).text());
        $('#projects').parent().parent().css('display', 'inline-block');
        populateDropdown(list, { id: id, type: 'locality' }).then(function(result) {
            $('#projects').html(result);
        });
    });

    // $('#projects').on('click', 'li', function() {
    //     var id = $(this).attr('data-id');
    //     var list = [object_type_id.project];
    //     config.current_object_id = object_type_id.project;
    //     config.project_id = id;
    //     $("#projectbtn").text($(this).text());
    //     $("#projectbtn").val($(this).text());
    //     $('#property').parent().parent().css('display', 'inline-block');
    //     populateDropdown(list, { id: id, type: 'project' }).then(function(result) {
    //         $('#property').html(result);
    //     });
    // });


    $("#undo").on('click', function() {

    })
});

function bindTableEvent() {
    $('#templatetable').on('click', 'tr', function() {
        var id = $(this).attr('data-id');
        config.url_category_id = id;
        var child = $(this).children();
        $('#templatetable table tr').removeClass('selected_rows');
        $(this).addClass('selected_rows');
        service.post('show_url', config).then(function(resolve) {
            console.log(resolve);
            $('#listingtable').html(resolve);
        }, function(reject) {
            console.log(reject);
        });
    });
}

$(function() {
    $("#url").on('click', 'li', function() {
        $(".btn-default").text($(this).text());
        $(".btn-default").val($(this).text());
        var id = [$(this).attr('data-id')];
        if (!flag || confirm("Save Changes") == true) {
            saveChanges();
            category_id = id;
            show_table(id);
        } else {
            localStorage.removeItem('undo');
            flag = false;
            show_table(id);
        }
    });
})

function show_table(id) {
    service.post("show_table", id).then(function(resolve) {
        $('#breadcrumbtable').html(resolve);
        $("#status").text("");
        plus();
        setval();
        insert();
        contentEditable();
    }, function(reject) {
        $('#status').text("error");
    });
}

function plus() {
    $('.plus').on('click', function() {
        var level = $(this).attr("data-level");
        $('#' + level).find('.inputs').css('display', 'inline');
    });
};

function setval() {
    $('.new').on('click', 'li', function() {
        var id = $(this).attr("data-id");
        $(".btn:first-child").text($(this).text());
        $(".btn:first-child").val($(this).text());
    });
};

function insert() {
    $('.okbtn').on('click', function() {
        var level = $(this).data('level');
        var id = [$(this).attr("data-id")];
        var val = $('#' + level).find('.btn').val();
        var sub_id = val.split(" ");
        var order = $('#' + level).find('#input' + level).val();
        var list = [$(this).attr("data-id"), sub_id[0], $(this).attr("data-level"), order];
        insert_to_database(list, id);
        $('#' + level).find('.inputs').css('display', 'none');

    });
};

function insert_to_database(list, id) {
    service.post("insert", list).then(function(resolve) {
        $('#status').text(resolve);
        show_table(id);
    }, function(reject) {
        $('#status').text("problem inserting");
    });
}

function deleteId(idClicked) {
    flag = true;
    var del_obj = {};
    var id_category = $('#breadcrumbtable').find('#minus').attr("data-category-id");
    var level = $('#breadcrumbtable').find('#minus').attr("data-level");
    var order = $('#breadcrumbtable').find('#minus').attr("data-order");
    var list = [id_category, idClicked];
    $('[data-id=' + idClicked + ']').remove();
    del.obj.type = "delete";
    del_obj.old_value[level] = level;
    del_obj.old_value[id] = parseInt(id_category);
    del_obj.old_value[order] = order;
    del_obj.old_value[sub_url_id] = idClicked;
    local_Storage.delete_sub_url(del_obj);
};

function saveChanges() {
    if (flag) {
        var undo = [];
        if (JSON.parse(localStorage.getItem("undo"))) {
            var undo = JSON.parse(localStorage.getItem("undo"));
            service.post('delete', undo).then(function(resolve) {
                $('#status').text("Successfully saved");
                show_table([category_id]);
            }, function(reject) {
                $('#status').text("Problem Saving");
            });
        }
    }
    flag = false;
    localStorage.removeItem('undo');
}


$(function() {
    var list_item = typeahead.setArray("search");
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
});

function contentEditable() {
    $(function() {
        $(".sub_url").dblclick(function(e) {
            e.stopPropagation();
            var currentEle = $(this);
            var value = $(this).html();
            var id = $(this).data('id');
            var level = $(this).data('level');
            var category_id = $(this).data('category_id');
            update_sub_url(id, currentEle, value, level, category_id);
        });
    });

    $(function() {
        $(".url_order").dblclick(function(e) {
            e.stopPropagation();
            var currentEle = $(this);
            var value = $(this).html();
            var id = $(this).data('id');
            var level = $(this).data('level');
            var category_id = $(this).data('category_id');
            update_order(id, currentEle, value, level, category_id);
        });
    });

    function update_order(id, currentEle, value, level, category_id) {
        $(currentEle).html('<input class="thVal" type="text" value="' + value + '" />');
        var update_order = {
            id: id,
            level: level,
            category_id: category_id
        }
        $(".thVal").focus();
        $(".thVal").keyup(function(event) {
            if (event.keyCode == 13) {
                update_order['order'] = $(".thVal").val();
                $(currentEle).html($(".thVal").val().trim());
                local_Storage.update_order(update_order);
            }
        });
    }

    function update_sub_url(id, currentEle, value, level, category_id) {
        $(currentEle).html('<div id="newTypeahead" class="container"><input id = "' + id + '" class = "typeahead" type = "text" placeholder = "Template Name"></div>');
        var list_item = typeahead.setArray(id);
        var update_suburl = {
            id: id,
            level: level,
            category_id: category_id
        }
        $("#" + id).focus();
        $("#" + id).keyup(function(event) {
            if (event.keyCode == 13) {
                update_suburl['new_id'] = list_item[$("#" + id).val()];
                $(currentEle).html($("#" + id).val().trim());
                local_Storage.update_sub_url(update_suburl);
            }
        });

        // $(document).click(function() {
        //     $(currentEle).html($("#isearch").val().trim());
        //     //$('#newTypeahead').remove();
        // });
    }
}