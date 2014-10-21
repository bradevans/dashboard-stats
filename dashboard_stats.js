$(function () {
    if (typeof reporter_data_missing === "object") {
        $(".nodata-hide").hide();
        $(".nodata-show").show();
    } else {
        $(".nodata-hide").show();
        $(".nodata-show").hide();
        
        var late_column,
	        on_time_column,
        	reviewer_column,
	        reviewer_column1,
        	reviewer_column2,
			unsubmitted;

        function Render(average, chart_id, color, is_reviewer, users, reviewer_bottom_list) {
            this.average = average;
            this.chart_id = chart_id;
            this.color = color;
            this.is_reviewer = is_reviewer;

            this.data = function () {
                if (users === null) {
                    if (reviewer_bottom_list === null) {
                        $("#reviewer-col").add($("#reviewer-1-col")).removeClass("span4").addClass("span6");
                        $("#reviewer-2-col").remove();
                        return false;
                    } else {
                        if (!$("#reviewer-2-col").length) {
                            $("#reviewer-col").add($("#reviewer-1-col")).removeClass("span6").addClass("span4");
                            $("#reviewer-1-col").after("<div class='span4' id='reviewer-2-col'><div class='reviewer-2-col text-anchor-middle svg-fill-orange'></div></div>");
                        }
                        return reviewer_bottom_list;
                    }
                } else {
                    return users;
                }
            };

            this.circles = function () {
            
            	var arc,
	            	background,
	            	foreground,
	            	new_angle,     		      	
      		      	svg,
      		      	height = 208,
	            	tau = 2 * Math.PI,
	            	width = height;
            	
                function arcTween(transition, newAngle) {
                    transition.attrTween("d", function (d) {
                        var interpolate = d3.interpolate(d.endAngle, newAngle);
                        return function (t) {
                            d.endAngle = interpolate(t);
                            return arc(d);
                        };
                    });
                }
	            
				arc = d3.svg.arc()
                    .innerRadius(96)
                    .outerRadius(width / 2)
                    .startAngle(0);

                svg = d3.select("." + this.chart_id + "-col").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                svg.append("text")
                    .text(this.average + "%")
                    .attr("class", "very-large-text")
                    .attr("transform", "translate(0, 10)");

                svg.append("text")
                    .text(function () {
                        switch (chart_id) {
                    	case "on-time":
                            return "On Time";
                            break;
                        case "late":
                            return "Late";
                            break;
                        case "unsubmitted":
                            return "Unsubmitted";
                            break;
                        case "reviewer":
                            return "Reviewed";
                            break;
                        }
                    })
                    .attr("class", "semibold")
                    .attr("transform", "translate(0, 55)");

                background = svg.append("path")
                    .datum({endAngle: tau})
                    .attr("class", "svg-fill-white")
                    .attr("d", arc);

                foreground = svg.append("path")
                    .datum({endAngle: 0})
                    .style("fill", this.color)
                    .attr("d", arc);

                new_angle = (this.average / 100) * tau;

                setTimeout(function () {
                    foreground.transition()
                        .duration(750)
                        .call(arcTween, new_angle);
                }, 250);
            };

            this.render = function () {
                this.circles();
                this.tables();
            };

            this.tables = function () {
                
                var chart_id_sub,
                	list_first_row,
                	list_last_row,
                	reviewer1_chart_id_sub,
                	reviewer2_chart_id_sub,
                	x_scale,
                	_this = this,
                	list = d3.select("." + _this.chart_id + "-col").append("div").attr("id", _this.chart_id + "-table-div"),
                	svg_width = 158;
                
                list_first_row = list.selectAll("table")
                    .data(_this.data)
                    .enter()
                    .append("table")
                    .attr("id", function (d, i) {
	                        if (_this.chart_id === "reviewer-1") {
                            reviewer1_chart_id_sub = _this.chart_id.substring(0, 2);
                            return reviewer1_chart_id_sub + (i + 1) + "1";
                        } else if (_this.chart_id === "reviewer-2") {
                            reviewer2_chart_id_sub = _this.chart_id.substring(0, 2);
                            return reviewer2_chart_id_sub + (i + 1) + "2";
                        } else {
                            chart_id_sub = _this.chart_id.substring(0, 4);
                            return chart_id_sub + (i + 1);
                        }
                    })
                    .attr("class", function (d) {
                        if (d.current_user === true) {
                            return "table-cyan-padded";
                        } else {
                            return "table-padded";
                        }
                    })
                    .append("tr");

                list_first_row.append("td")
                    .attr("width", "26px")
                    .attr("class", "text-align-right")
                    .attr("rowspan", 2)
                    .text(function (d) {
                        if (d.rank) {
                            return d.rank + "/" + reporter_data_json.reporter_stat_count;
                        }
                    });

                list_first_row.append("td")
                    .attr("width", "60px")
                    .attr("class", "text-align-center")
                    .attr("rowspan", 2)
                    .append("img")
                    .attr("src", function (d) {
                        return d.avatar_url;
                    })
                    .attr("class", function (d, i) {
                        return "avatar avatar-width";
                    });

                list_first_row.append("td")
                    .text(function (d) {
                        if (d.display_name.length > 14) {
                            return d.display_name.substring(0, 14) + "...";
                        } else {
                            return d.display_name;
                        }
                    });

                list_first_row.append("td")
                    .attr("class", "text-align-right")
                    .text(function (d) {
                        if (is_reviewer) {
                            return d["reviewed_percent"] + "%";
                        } else {
                            if(_this.chart_id === "on-time"){
                                return d["on_time_percent"] + "%";
                            }
                            return d[_this.chart_id + "_percent"] + "%";
                        }
                    })
                    .style("color", _this.color);

                list_last_row = list.selectAll("table").append("tr");

                list_last_row.append("td")
                    .attr("colspan", 2)
                    .append("svg")
                    .attr("width", svg_width)
                    .attr("height", "8");

                list_last_row.select("svg")
                    .append("rect")
                    .attr("width", svg_width)
                    .attr("height", "8")
                    .attr("class", "svg-fill-white");

                x_scale = d3.scale.linear()
                    .domain([0, 100])
                    .range([0, svg_width]);

                list_last_row.select("svg")
                    .append("rect")
                    .attr("width", function (d) {
                        if (is_reviewer) {
                            return d["reviewed_percent"] + "%";
                        } else {
                            if(_this.chart_id === "on-time"){
                                return x_scale(d["on_time_percent"]);
                            }
                            return x_scale(d[_this.chart_id + "_percent"]);
                        }
                    })
                    .attr("height", "8")
                    .attr("fill", _this.color);
            };
        }

        function remove(clicked) {
            if (clicked === "period") {
                $(".reviewer-col").empty();
                $(".reviewer-1-col").empty();
                $(".reviewer-2-col").empty();
            }
            $(".on-time-col").empty();
            $(".late-col").empty();
            $(".unsubmitted-col").empty();
        }

        function redraw(period_id, for_whom, clicked) {
            var url = Urls.ff_dashboard_combined_json_data();
            if (clicked === "whom") {
                $("#historical-averages").addClass("lower-opacity");
            } else {
                $(".blue-wrapper").addClass("lower-opacity");
            }

            $.get(url, { dashboard_period_id: period_id, for_whom: for_whom })
                .done(function (data) {
                    reporter_data_json = data.reporter_data;
                    reviewer_data_json = data.reviewer_data;

                    if (clicked === "whom") {
                        $("#historical-averages").removeClass("lower-opacity");
                    } else {
                        $(".blue-wrapper").removeClass("lower-opacity");
                    }

                    $(".period_display").text(get_period().display);
                    remove(clicked);

                    $("#reviewed-count").text(reviewer_data_json.reviewed_report_count);
                    $("#reviewed-total").text(reviewer_data_json.submitted_report_count);
                    $("#total-reports-due").text(reporter_data_json.total_reports_due);
                    $("#total-reports-submitted").text(reporter_data_json.submitted_report_count);
                    $("#reporter-period-description").text(reporter_data_json.period_description);
                    $("#avg-likes").text(reporter_data_json.per_report_avg_likes);
                    $("#avg-comments").text(reporter_data_json.per_report_avg_comments);

                    if (clicked === "period") {
                        reviewer_column = new Render(reviewer_data_json.overall_reviewed_percent, "reviewer", "#ff6933").circles();
                        reviewer_column2 = new Render(null, "reviewer-2", "#ff6933", true, null, reviewer_data_json.reviewer_user_list_bottom).data();
                        reviewer_column2 = new Render(null, "reviewer-2", "#ff6933", true, null, reviewer_data_json.reviewer_user_list_bottom).tables();
                        reviewer_column1 = new Render(reviewer_data_json.overall_reviewed_percent, "reviewer-1", "#ff6933", true, reviewer_data_json.reviewer_user_list_top, reviewer_data_json.reviewer_user_list_bottom).tables();
                    }

                    on_time_column = new Render(reporter_data_json.overall_on_time_percent, "on-time", "#2c97cf", false, reporter_data_json.on_time_user_list).render();
                    late_column = new Render(reporter_data_json.overall_late_percent, "late", "#7ac5cc", false, reporter_data_json.late_user_list).render();
                    unsubmitted = new Render(reporter_data_json.overall_unsubmitted_percent, "unsubmitted", "#ff6933", false, reporter_data_json.unsubmitted_user_list).render();
                });
        }

        function get_period() {
            var obj = {};
            $(".period-id-buttons button").each(function () {
                if ($(this).hasClass("active")) {
                    obj = {
                        "id": $(this).data("period-id"),
                        "display": $(this).data("value")
                    };
                }
            });
            return obj;
        }

        function get_for_whom() {
            var for_whom;
            $(".for-whom-buttons button").each(function () {
                if ($(this).hasClass("active")) {
                    if ($(this).data("for-whom") === "group") {
                        for_whom = "g" + $("#group-search").val();
                    } else if ($(this).data("for-whom") === "individual") {
                        for_whom = "u" + get_users_typeahead().individuals_id[get_users_typeahead().individuals.indexOf($("#individual-search").val())];
                    } else {
                        for_whom = $(this).data("for-whom");
                    }
                }
            });
            return for_whom;
        }

        function get_users_typeahead() {
            var obj = {}, individuals = [], individuals_id = [];
            for (key in users_typeahead_data) {
                for (key2 in users_typeahead_data[key]) {
                    individuals.push(users_typeahead_data[key][key2]);
                    individuals_id.push(key2);
                }
            }

            obj = {
                "individuals": individuals,
                "individuals_id": individuals_id
            };
            return obj;
        }

        $(".period-id-buttons button").on("click", function () {
            if (!$(this).hasClass("active")) {
                $(".period-id-buttons button").removeClass("active");
                $(this).addClass("active");
                redraw(get_period().id, get_for_whom(), "period");
            }
        });

        $(".for-whom-buttons button").on("click", function (e) {
            e.preventDefault();
            if (!$(this).hasClass("active")) {
                $(".for-whom-buttons button").removeClass("active");
                $(this).addClass("active");
                switch ($(this).attr("id")) {
                case "groupBtn":
                    $("#group-search-dropdown").removeClass("hidden");
                    $("#individual-search-dropdown").addClass("hidden");

                    $.each(groups_typeahead_data, function (key) {
                        $.each(groups_typeahead_data[key], function (key, value) {
                            $("#group-search").append($("<option></option>").attr("value", key).text(value));
                        })
                    });

                    $("#group-search").select2({
                        placeholder: "Select a Group",
                        allowClear: true
                    });

                    $("#group-search").on("change", function () {
                        redraw(get_period().id, "g" + $("#group-search").val(), "whom");
                    });
                    break;
                case "individual-btn":
                    $("#group-search-dropdown").addClass("hidden");
                    $("#individual-search-dropdown").removeClass("hidden");

                    $("#individual-search").val("")
                        .attr("placeholder", "Search")
                        .focus();

                    $("#individual-search-dropdown").submit(function (e) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        redraw(get_period().id, "u" + get_users_typeahead().individuals_id[get_users_typeahead().individuals.indexOf($("#individual-search").val())], "whom");
                    });
                    break;
                case "reporters-btn":
                    $("#group-search-dropdown").addClass("hidden");
                    $("#individual-search-dropdown").addClass("hidden");
                    redraw(get_period().id, "reporters", "whom");
                    break;
                case "everyone-btn":
                    $("#group-search-dropdown").addClass("hidden");
                    $("#individual-search-dropdown").addClass("hidden");
                    redraw(get_period().id, "everyone", "whom");
                    break;
                }
            }
        });

        $("#individual-search").typeahead({ source: get_users_typeahead().individuals });

        reviewer_column = new Render(reviewer_data_json.overall_reviewed_percent, "reviewer", "#ff6933").circles();
        reviewer_column2 = new Render(null, "reviewer-2", "#ff6933", true, null, reviewer_data_json.reviewer_user_list_bottom).tables();
        reviewer_column1 = new Render(reviewer_data_json.overall_reviewed_percent, "reviewer-1", "#ff6933", true, reviewer_data_json.reviewer_user_list_top, reviewer_data_json.reviewer_user_list_bottom).tables();
        on_time_column = new Render(reporter_data_json.overall_on_time_percent, "on-time", "#2c97cf", false, reporter_data_json.on_time_user_list).render();
        late_column = new Render(reporter_data_json.overall_late_percent, "late", "#7ac5cc", false, reporter_data_json.late_user_list).render();
        unsubmitted = new Render(reporter_data_json.overall_unsubmitted_percent, "unsubmitted", "#ff6933", false, reporter_data_json.unsubmitted_user_list).render();
    }
});