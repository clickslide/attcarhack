/*
Copyright (C) 2014 by Clickslide Limited

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
/*jshint unused: false */
/*globals cordova, PhoneGap, phonegap, $, NML, appconfig*/
var app = {
    isGap: false,
    nml: null,
    /**
     * Keep the dates for use in the NML.get method. This will be used to create postparams.
     * TODO: Default to right now +24 hours
     * @variable
     * @public
     */
    dateKeeper: [
        {
            name: "starttime",
            value: "2014-07-28T18:30"
        },
        {
            name: "endtime",
            value: "2014-07-29T18:30"
        }
    ],
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    bindEvents: function () {
        if (document.location.protocol === "file:") {
            this.isGap = true;
            document.addEventListener(
                "deviceready",
                this.onDeviceReady,
                false
            );
        } else {
            var that = this;
            // no phonegap, start initialisation immediately
            $(document).ready(function () {
                that.onDeviceReady();
            });
        }
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.nml = new NML();
        app.nml.onGetData = this.onGetData;
        app.nml.loadDialogs(this.onAppReady);
    },
    onAppReady: function () {

        // our main API endpiont
        app.nml.setBaseUrl("clickslide/app", "https", "datadipity.com");
        // so we know it's phonegap
        app.nml.isGap = this.isGap;
        $.get("templates/jsviews/page-one.html").done(function (data) {
            $("#app").html(data);
            $('.list').on('click', function (evt) {
                evt.preventDefault();
                // Page Two List Algorithm
                $.get("templates/jsviews/listpages.html").done(function (data) {
                    $("#app").html(data);
                    $('.list').on('click', function (evt) {
                        evt.preventDefault();
                        // execute mashup
                        // go to next page
                        var appurl = "https://datadipity.com/clickslide/pickupandgo.json?update&postparam[origin]=36.137875,-115.165389&postparam[destination]=36.102623,-115.174567&postparam[first]=aaron&postparam[last]=franco&PHPSESSID= tlb93vfukg3m3h03bpr68v2i04";
                        //$.get(appurl);
                        $.ajax({
                            type: "GET",
                            url: appurl,
                            crossDomain: true,
                            success: function (data) {
                                console.log("Made NML Request");
                            },
                            error: function (err) {
                                console.log("NML Failed!");
                                console.log(JSON.stringify(err));
                            }
                        });
                        // Page Three GET algorithm
                        $.get("templates/jsviews/page-three.html").done(function (data) {
                            var mapurl = "https://cs6-nbwa.navbuilder.nimlbs.net/lws/api/v2/map/png?center=36.102263,-115.174567&scale=25&width=300&height=120&ppi=318&apikey=RwKEdt2mXQLNz58W7cuVJDzLxP5JVcnkSwnLf9rz&uid=d00dad12345678901234567890123456&pid=411164";
                            // Map Tiles from TCS
                            $.get(mapurl).done(function (imgdata) {
                                $("#app").html(data);
                                $("#loca").css("background", "url(data:image/png;base64," + imgdata.image + ") no-repeat left center");
                                        // Progress Bar
                                var tick = 0;
                                var timed = 0;
                                var pb = $("#timer").progressbar();
                                var int=setInterval(function(evt){
                                        tick++;
                                        pb.progressbar('value', tick);
                                        timed = (100/tick);
                                        $("#notation").html(Math.round(timed)+"min... and counting");
                                        if(tick == 100){
                                            clearInterval(int);
                                        }
                                    }, 100);
                                }
                            );
                        });
                    });
                });
            });
        });
    },
    /**
     * Callback for NML.get function
     * This is where we will process the data
     */
    onGetData: function (data) {
        var json = JSON.parse(data);
        console.log(json);
        var that = app;
        app.nml.setHomePageId(json.ListPage["@attributes"].id);
        // don't do anything until the template loads
        $.get("templates/jsviews/listpages.html").done(function (data) {
            // Render once all templates for template composition are loaded
            var listpagesTemplate = $.templates(data);
            var html = listpagesTemplate.render(json.ListPage);
            $("#content-container").html(html);
            // manage clicks on the tweets
            $(".tweet-retweet").bind("click", that.onTweetRetweetClick);

            if (json.ListPage.search === 1 || json.ListPage.search === "1") {
                $.get("templates/jsviews/search.html").done(function (data) {
                    var searchpagesTemplate = $.templates(data);
                    var html = searchpagesTemplate.render();
                    $("#searchBarHolder").html(html);
                    console.log(that.dateKeeper[0].value);
                    $("#datetimepicker1").combodate({
                        format: "YYYY-MM-DDTHH:mm",
                        value: that.dateKeeper[0].value,
                        customClass: "form-control"
                    }).bind("change", function (evt) {
                        that.dateKeeper[0].value = $("#datetimepicker1").combodate("getValue");
                    });
                    $("#datetimepicker2").combodate({
                        format: "YYYY-MM-DDTHH:mm",
                        value: that.dateKeeper[1].value,
                        customClass: "form-control"
                    }).bind("change", function (evt) {
                        that.dateKeeper[1].value = $("#datetimepicker2").combodate("getValue");
                    });
                });
            }
            $("#loader").modal("toggle");
        });
    }
};
