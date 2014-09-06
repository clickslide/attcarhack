$.get("templates/" + tmpsrc + "/listpages.html").done(function (data) {
    $.templates("listpagesTemplate", data);
    //var listpagesTemplate = $.templates(data);
    var html = listpagesTemplate.render(json.ListPage);
    $("#content-container").html(html);
});