window.local_Storage = {};
(function($) {

    function delete_sub_url(del_obj) {
        var del = [];
        del = JSON.parse(localStorage.getItem("del")) || [];
        del.push(del_obj);
        localStorage.setItem("del", JSON.stringify(del));
    }

    function update_sub_url(update_obj) {
        var update = [];
        update = JSON.parse(localStorage.getItem("update_sub_url")) || [];
        update.push(update_obj);
        localStorage.setItem("update_sub_url", JSON.stringify(update));
    }

    function update_order(update_obj) {
        var update = [];
        update = JSON.parse(localStorage.getItem("update_order")) || [];
        update.push(update_obj);
        localStorage.setItem("update_order", JSON.stringify(update));
    }

    local_Storage.delete_sub_url = delete_sub_url;
    local_Storage.update_sub_url = update_sub_url;
    local_Storage.update_order = update_order;
})($);