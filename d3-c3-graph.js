if (ieError == false) { 
        $.when(
        $.getScript( "http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.13/d3.min.js" ),
        $.getScript( "https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js" ),
        $.getScript( "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js" ),
        $.Deferred(function( deferred ){
            $( deferred.resolve );
        })
        ).done(function(){

        d3.csv('data/scholarData.csv', function (error, data) {
        data.sort(d3.ascending);
        //data.sort(function (a, b) {return d3.ascending(a.school,b.school);});
        var width = window.innerWidth*0.8, height = window.innerHeight*0.8;

        //color blind friendly
        var fill = d3.scale.ordinal().range(["#386cb0","#b2c81d","#bf5b17","#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666","#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#d9d9d9","#f781bf","#2d004b","#ae017e","#762a83","#b30000","#9ebcda","#d0d1e6","#ffffcc","#e5f5e0"])
        var svg = d3.select("#scholarChart").append("svg")
            .attr("width", width)
            .attr("height", height);

        for (var j = 0; j < data.length; j++) {
          //can use this format to change size by value: +data[j].comb/2  
          data[j].radius = 6;
          data[j].x = Math.random() * width;
          data[j].y = Math.random() * height;
        }

        var padding = 2;
        var maxRadius = d3.max(_.pluck(data, 'radius'));

        var getCenters = function (vname, size) {
          var centers, map;
          centers = _.uniq(_.pluck(data, vname)).map(function (d) {
            return {name: d, value: 1};
          });

          map = d3.layout.treemap().size(size).ratio(1/1);
          map.nodes({children: centers});

          return centers;
        };

        var force = d3.layout.force()
            
        var nodes = svg.selectAll("circle")
          .data(data);
          
        nodes.enter().append("circle")
          .attr("class", "node")
          .attr("cx", function (d) { return d.x; })
          .attr("cy", function (d) { return d.y; })
          .attr("r", function (d) { return d.radius; })
          .style("fill", function (d) { return fill(d.school); })
          .on("mouseover", function (d) { showPopover.call(this, d); })
          .on("mouseout", function (d) { removePopovers(); })

        draw('type');

        //filter
        $( ".btn" ).click(function() {
          draw(this.id);
        });

    // Method to create the filter
    createFilter();

    // Method to create the filter, generate checkbox options on fly
    function createFilter() {
        d3.select(".filterContainer").selectAll("div")
          .data(["2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002"])
          .enter()  
          .append("div")
          .attr("class", "checkbox-container")
          .append("label")
          .each(function (d) {
                // create checkbox for each data
                d3.select(this).append("input")
                  .attr("type", "checkbox")
                  .attr("id", function (d) {
                      return "chk_" + d;
                   })
                  .attr("checked", true)
                  .on("click", function (d, i) {
                      // register on click event
                      var lVisibility = this.checked ? "visible" : "hidden";
                      var yrFilter=d;
                      if(lVisibility=="hidden"){
                        nodes.filter(function(d) {return d.YearofAward == yrFilter; }).style("visibility", "hidden");
                      }else{
                        nodes.filter(function(d) {return d.YearofAward == yrFilter; }).style("visibility", "visible");
                      }
                   })
                d3.select(this).append("span")
                    .text(function (d) {
                        return d;
                    });
        });
        $("#sidebar").show();
    }

        function draw (varname) {
          var centers = getCenters(varname, [width-100, height-100]);
          force.on("tick", tick(centers, varname));
          labels(centers,varname)
          force.start();
        }

        function tick (centers, varname) {
          var foci = {};
          for (var i = 0; i < centers.length; i++) {
            foci[centers[i].name] = centers[i];
          }
          return function (e) {
            for (var i = 0; i < data.length; i++) {
              var o = data[i];
              var f = foci[o[varname]];
              o.y += ((f.y + (f.dy / 2)) - o.y) * e.alpha;
              o.x += ((f.x + (f.dx / 2)) - o.x) * e.alpha;
            }
            nodes.each(collide(.11))
              .attr("cx", function (d) { return d.x; })
              .attr("cy", function (d) { return d.y; });
          }
        }
        
        function labels (centers,varname) {
            
          svg.selectAll(".label").remove();

          svg.selectAll(".label")
          .data(centers).enter().append("text")
          .attr("class", "label")
          .text(function (d) {          
                              var slist = $.grep(data, function(e){ 
                                        return e[varname] == d.name; 
                              }); 
                              return d.name+": "+slist.length+" ("+Math.round(slist.length/733*100)+"%)" 
                            })
          .call(wrap, 120)
          .attr("transform", function (d) {
            return "translate(" + (d.x + (d.dx / 2 - 50)) + ", " + (d.y + 20) + ")";
          });
        }

        function removePopovers () {
          $('.popover').each(function() {
            $(this).remove();
          }); 
        }

        function showPopover (d) {
          $(this).popover({
            placement: 'auto top',
            container: 'body',
            trigger: 'manual',
            html : true,
            content: function() { 
              return "Scholarship: " + d.ScholarshipAwarded+ "<br/>Sch: " + d.school+ "<br/>Year: " + d.YearofAward+
              "<br/>Course: " + d.Course +"<br/>Last Known role: "+ d.LastKnownRole+" "+d.Organisation
              }
          });
          $(this).popover('show')
        }
        
        function wrap(text, width) {
          text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")) || 0,
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
            
            //IE 7, 9, 10 throw error for getComputedTextLength
            try{
                tSpanLength=tspan.node().getComputedTextLength();
            }catch(e){
                tSpanLength=8 //just set it to 8 
            }
            
              if (tSpanLength > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
            }
          });
        }

        function collide(alpha) {
          var quadtree = d3.geom.quadtree(data);
          return function (d) {
            var r = d.radius + maxRadius + padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
              if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + quad.point.radius + padding;
                if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.point.x += x;
                  quad.point.y += y;
                }
              }
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          };
        }
      });//end of data
      
      //parallel sets
        $.getScript("js/d3-parsets/d3.parsets.js", function(){
        var Width = window.innerWidth*0.8, Height = window.innerHeight*0.8; 
            var chart = d3.parsets()
                  .dimensions(["Scholarship", "Course","Organisation"])
                  .tension(0.9)
                  .width(Width)
                  .height(Height);

            var parallelViz = d3.select("#parallelViz").append("svg")
                .attr("width", chart.width())
                .attr("height", chart.height());

            d3.csv("data/scholarData2.csv", function(error, csv) {
              parallelViz.datum(csv).call(chart);
              }); 
              
            });//d3.parsets 
      
      
      //C3 graphs
      
     $.getScript("http://cdnjs.cloudflare.com/ajax/libs/c3/0.3.0/c3.min.js", function(){
    
        //============chart0============\\ 
        chart0 = c3.generate({
    
                    size: '100%',
    
                    data: {     
            json:
                 [{"PriSchGenParity":0,"SecSchGenParity":0,"TerSchGenParity":0,"MalayPostSec":0.01,"ChinesePostSec":0.01,"IndianPostSec":0.04,"OverallPostSec":0.02,"PriSchPupilTeacher":-0.02,"SecSchPupilTeacher":-0.01,"PSLEPass":0,"NOLvlPass":0.01,"AlvlPass":-0.03,"PriSchNum":-0.01,"SecSchNum":-0.02,"PriEnrolment":-0.01,"MalePriEnrolment":-0.01,"FemalePriEnrolment":-0.01,"SecEnrolment":0.03,"MaleSecEnrolment":0.03,"FemaleSecEnrolment":0.04,"GovtExpenditureEdu":0,"Year":2004},{"PriSchGenParity":0,"SecSchGenParity":0,"TerSchGenParity":0.04,"MalayPostSec":0.04,"ChinesePostSec":0.02,"IndianPostSec":0.03,"OverallPostSec":0.03,"PriSchPupilTeacher":-0.06,"SecSchPupilTeacher":-0.03,"PSLEPass":0,"NOLvlPass":0.01,"AlvlPass":-0.03,"PriSchNum":0,"SecSchNum":-0.03,"PriEnrolment":-0.03,"MalePriEnrolment":-0.03,"FemalePriEnrolment":-0.03,"SecEnrolment":0.03,"MaleSecEnrolment":0.03,"FemaleSecEnrolment":0.03,"GovtExpenditureEdu":-0.02,"Year":2005},{"PriSchGenParity":0,"SecSchGenParity":0,"TerSchGenParity":0.04,"MalayPostSec":0.06,"ChinesePostSec":0.02,"IndianPostSec":0.06,"OverallPostSec":0.03,"PriSchPupilTeacher":-0.09,"SecSchPupilTeacher":-0.04,"PSLEPass":0,"NOLvlPass":0.01,"AlvlPass":0,"PriSchNum":-0.01,"SecSchNum":-0.03,"PriEnrolment":-0.05,"MalePriEnrolment":-0.05,"FemalePriEnrolment":-0.05,"SecEnrolment":0.04,"MaleSecEnrolment":0.04,"FemaleSecEnrolment":0.05,"GovtExpenditureEdu":0.12,"Year":2006},{"PriSchGenParity":0,"SecSchGenParity":0,"TerSchGenParity":0.07,"MalayPostSec":0.07,"ChinesePostSec":0.03,"IndianPostSec":0.07,"OverallPostSec":0.04,"PriSchPupilTeacher":-0.11,"SecSchPupilTeacher":-0.04,"PSLEPass":0,"NOLvlPass":0.01,"AlvlPass":-0.01,"PriSchNum":-0.02,"SecSchNum":-0.04,"PriEnrolment":-0.05,"MalePriEnrolment":-0.05,"FemalePriEnrolment":-0.05,"SecEnrolment":0.06,"MaleSecEnrolment":0.05,"FemaleSecEnrolment":0.06,"GovtExpenditureEdu":0.21,"Year":2007},{"PriSchGenParity":0,"SecSchGenParity":0,"TerSchGenParity":0.1,"MalayPostSec":0.1,"ChinesePostSec":0.04,"IndianPostSec":0.1,"OverallPostSec":0.06,"PriSchPupilTeacher":-0.14,"SecSchPupilTeacher":-0.06,"PSLEPass":-0.01,"NOLvlPass":0.01,"AlvlPass":0.01,"PriSchNum":0.01,"SecSchNum":-0.04,"PriEnrolment":-0.07,"MalePriEnrolment":-0.07,"FemalePriEnrolment":-0.07,"SecEnrolment":0.05,"MaleSecEnrolment":0.05,"FemaleSecEnrolment":0.05,"GovtExpenditureEdu":0.32,"Year":2008},{"PriSchGenParity":0,"SecSchGenParity":-0.01,"TerSchGenParity":0.07,"MalayPostSec":0.11,"ChinesePostSec":0.05,"IndianPostSec":0.1,"OverallPostSec":0.06,"PriSchPupilTeacher":-0.21,"SecSchPupilTeacher":-0.14,"PSLEPass":0,"NOLvlPass":0.01,"AlvlPass":0.01,"PriSchNum":-0.01,"SecSchNum":-0.04,"PriEnrolment":-0.09,"MalePriEnrolment":-0.09,"FemalePriEnrolment":-0.09,"SecEnrolment":0.05,"MaleSecEnrolment":0.05,"FemaleSecEnrolment":0.05,"GovtExpenditureEdu":0.4,"Year":2009},{"PriSchGenParity":0.01,"SecSchGenParity":0,"TerSchGenParity":0.15,"MalayPostSec":0.13,"ChinesePostSec":0.05,"IndianPostSec":0.12,"OverallPostSec":0.07,"PriSchPupilTeacher":-0.22,"SecSchPupilTeacher":-0.16,"PSLEPass":-0.01,"NOLvlPass":0.02,"AlvlPass":0.03,"PriSchNum":0,"SecSchNum":-0.03,"PriEnrolment":-0.12,"MalePriEnrolment":-0.12,"FemalePriEnrolment":-0.12,"SecEnrolment":0.04,"MaleSecEnrolment":0.04,"FemaleSecEnrolment":0.04,"GovtExpenditureEdu":0.59,"Year":2010},{"PriSchGenParity":0.01,"SecSchGenParity":0,"TerSchGenParity":0.17,"MalayPostSec":0.14,"ChinesePostSec":0.06,"IndianPostSec":0.13,"OverallPostSec":0.08,"PriSchPupilTeacher":-0.25,"SecSchPupilTeacher":-0.23,"PSLEPass":-0.01,"NOLvlPass":0.03,"AlvlPass":0.03,"PriSchNum":0.01,"SecSchNum":-0.04,"PriEnrolment":-0.14,"MalePriEnrolment":-0.14,"FemalePriEnrolment":-0.14,"SecEnrolment":0.01,"MaleSecEnrolment":0.01,"FemaleSecEnrolment":0.01,"GovtExpenditureEdu":0.73,"Year":2011},{"PriSchGenParity":0.01,"SecSchGenParity":0,"TerSchGenParity":0.16,"MalayPostSec":0.15,"ChinesePostSec":0.06,"IndianPostSec":0.14,"OverallPostSec":0.09,"PriSchPupilTeacher":-0.29,"SecSchPupilTeacher":-0.27,"PSLEPass":0,"NOLvlPass":0.03,"AlvlPass":0.02,"PriSchNum":0.01,"SecSchNum":-0.04,"PriEnrolment":-0.16,"MalePriEnrolment":-0.16,"FemalePriEnrolment":-0.15,"SecEnrolment":-0.02,"MaleSecEnrolment":-0.02,"FemaleSecEnrolment":-0.02,"GovtExpenditureEdu":0.69,"Year":2012}]
            , 

                        type: 'spline',
                        keys: {
                            x: 'Year',
                            value: [
                                    'PriSchGenParity',
                                    'SecSchGenParity',
                                    'TerSchGenParity',
                                    'MalayPostSec',
                                    'ChinesePostSec',
                                    'IndianPostSec',
                                    'OverallPostSec',
                                    'PriSchPupilTeacher',
                                    'SecSchPupilTeacher',
                                    'NOLvlPass',
                                    'AlvlPass',
                                    'PriEnrolment',
                                    'SecEnrolment',
                                    'MaleSecEnrolment',
                                    'FemaleSecEnrolment',
                                    'GovtExpenditureEdu'
                                    ]
                        },
            
                        colors: {
                    
                            //cluster dark green
                            GovtExpenditureEdu:'#00441b',
                    
                            //cluster dark-light green
                            TerSchGenParity:'#006d2c',
                            MalayPostSec:'#238b45',
                            IndianPostSec:'#41ab5d',
            
                            //cluster light green
                            OverallPostSec:'#74c476',
                            SecEnrolment:'#a1d99b',
                            MaleSecEnrolment:'#c7e9c0',
                            ChinesePostSec:'#a1d99b',
                            FemaleSecEnrolment:'#74c476',
                        
                            //cluster middle blue
                            PriSchGenParity:'#6baed6',
                            SecSchGenParity:'#9ecae1',
                            NOLvlPass:'#6baed6',
                            AlvlPass:'#9ecae1',
                
                            //cluster red
                            PriEnrolment:'#fc9272',

                            //cluster dark red
                            PriSchPupilTeacher:'#a50f15',
                            SecSchPupilTeacher:'#cb181d'
                        
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            label: {text: 'Year', position: 'outer-center'},
                            tick: {culling: {max: 6}}
                        },
                        y: {
                            label: {text: '% Change Relative to 2003', position: 'outer-middle'},
                            tick: {format: d3.format("%")}
                        }
                    },
        
                    point: { r: 2.5 },
                    tooltip: {grouped: false},
                    legend: {show: false},

                    grid: {
                            y: {
                                lines: [{value: 0, text: '2003 Levels'}]
                            }
                    }
                });   
                 $("#chart0").append(chart0.element); 
    
        //============chart1============\\   
        chart1 = c3.generate({
        
                size: '60%',
        
                data: {     
        json:
             [{"Year":1981,"GovtExpenditureEdu":1.67},{"Year":1982,"GovtExpenditureEdu":2.31},{"Year":1983,"GovtExpenditureEdu":2.71},{"Year":1984,"GovtExpenditureEdu":2.9},{"Year":1985,"GovtExpenditureEdu":2.96},{"Year":1986,"GovtExpenditureEdu":2.71},{"Year":1987,"GovtExpenditureEdu":2.72},{"Year":1988,"GovtExpenditureEdu":2.6},{"Year":1989,"GovtExpenditureEdu":2.8},{"Year":1990,"GovtExpenditureEdu":3.15},{"Year":1991,"GovtExpenditureEdu":4.17},{"Year":1992,"GovtExpenditureEdu":3.76},{"Year":1993,"GovtExpenditureEdu":4.11},{"Year":1994,"GovtExpenditureEdu":4.56},{"Year":1995,"GovtExpenditureEdu":4.65},{"Year":1996,"GovtExpenditureEdu":5.02},{"Year":1997,"GovtExpenditureEdu":5.81},{"Year":1998,"GovtExpenditureEdu":6.35},{"Year":1999,"GovtExpenditureEdu":6.36},{"Year":2000,"GovtExpenditureEdu":7.58},{"Year":2001,"GovtExpenditureEdu":7.98},{"Year":2002,"GovtExpenditureEdu":8.47},{"Year":2003,"GovtExpenditureEdu":7.94},{"Year":2004,"GovtExpenditureEdu":7.81},{"Year":2005,"GovtExpenditureEdu":7.61},{"Year":2006,"GovtExpenditureEdu":8.62},{"Year":2007,"GovtExpenditureEdu":9.13},{"Year":2008,"GovtExpenditureEdu":9.36},{"Year":2009,"GovtExpenditureEdu":9.82},{"Year":2010,"GovtExpenditureEdu":10.86},{"Year":2011,"GovtExpenditureEdu":11.23},{"Year":2012,"GovtExpenditureEdu":10.53}]
             ,
                    type: 'line',
                    keys: {
                        x: 'Year',
                        value: ['GovtExpenditureEdu']
                    },
                    /*colors: {GovtExpenditureEdu:'#00441b'}*/
                },
                axis: {
                    x: {
                        type: 'category',
                        label: {text: 'Year', position: 'outer-center'},
                        tick: {culling: {max: 6}}
                    },
                    y: {
                        label: {text: 'Expenditure (Billions)', position: 'outer-middle'},
                         tick: {format: d3.format("$")},
                         min: 0
                    }
                }
            });  
            $("#chart1").append(chart1.element);   
 
        //============chart2============\\           
         chart2 = c3.generate({
    
                size: '60%',
    
                data: {     
        json:
             [{"year":1960,"primary":283,"secondary":51},{"year":1970,"primary":363,"secondary":133},{"year":1980,"primary":292,"secondary":156},{"year":1990,"primary":258,"secondary":161},{"year":2000,"primary":306,"secondary":175},{"year":2003,"primary":300,"secondary":206},{"year":2004,"primary":296,"secondary":214},{"year":2005,"primary":290,"secondary":213},{"year":2006,"primary":285,"secondary":215},{"year":2007,"primary":285,"secondary":218},{"year":2008,"primary":279,"secondary":217},{"year":2009,"primary":272,"secondary":217},{"year":2010,"primary":264,"secondary":214},{"year":2011,"primary":258,"secondary":208},{"year":2012,"primary":253,"secondary":203},{"year":2013,"primary":244,"secondary":197}]
             ,
                    type: 'line',
                    keys: {
                        x: 'year',
                        value: ['primary','secondary']
                    },
                    /*colors: {primary:'#fc9272',secondary:'#a1d99b'}*/
                },
                axis: {
                    x: {
                        type: 'category',
                        label: {text: 'Year', position: 'outer-center'},
                        tick: {culling: {max: 6}}
                    },
                    y: {
                        label: {text: 'Enrolment Numbers(\'000)', position: 'outer-middle'}
                    }
                }
            });
            $("#chart2").append(chart2.element);
     
        //============chart3============\\       
         chart3 = c3.generate({
        
                size: '60%',
        
                data: {     
                    json:
             [{"year":1995,"Malay":45.1,"Chinese":73.3,"Indian":50.1,"Overall":67.7},{"year":1996,"Malay":49.8,"Chinese":76.8,"Indian":54,"Overall":71.3},{"year":1997,"Malay":54.5,"Chinese":78.2,"Indian":58.7,"Overall":72.9},{"year":1998,"Malay":62.6,"Chinese":81,"Indian":61.1,"Overall":76.3},{"year":1999,"Malay":66.4,"Chinese":82.4,"Indian":64.6,"Overall":78.2},{"year":2000,"Malay":70,"Chinese":88.4,"Indian":74.9,"Overall":83.8},{"year":2001,"Malay":74.6,"Chinese":90.2,"Indian":77.7,"Overall":86.2},{"year":2002,"Malay":76.2,"Chinese":91.4,"Indian":80.1,"Overall":87.6},{"year":2003,"Malay":78.4,"Chinese":91.6,"Indian":82,"Overall":88},{"year":2004,"Malay":79,"Chinese":92.9,"Indian":85.1,"Overall":89.5},{"year":2005,"Malay":81.7,"Chinese":93.6,"Indian":84.7,"Overall":90.9},{"year":2006,"Malay":82.9,"Chinese":93.6,"Indian":86.6,"Overall":90.8},{"year":2007,"Malay":84.1,"Chinese":94.3,"Indian":87.6,"Overall":91.8},{"year":2008,"Malay":86,"Chinese":95.6,"Indian":90.2,"Overall":93.2},{"year":2009,"Malay":87.2,"Chinese":95.8,"Indian":90.5,"Overall":93.7},{"year":2010,"Malay":88.3,"Chinese":96.5,"Indian":92.2,"Overall":94.5},{"year":2011,"Malay":89.3,"Chinese":96.9,"Indian":92.8,"Overall":95.1},{"year":2012,"Malay":89.9,"Chinese":97.3,"Indian":93.8,"Overall":95.6}]
             ,
                    type: 'line',
                    keys: {
                        x: 'year',
                        value: ['Malay','Chinese','Indian','Overall']
                    },
                    /*
                    colors: {Malay:'#238b45',
                            Indian:'#41ab5d',
                            Overall:'#74c476',
                            Chinese:'#a1d99b'}
                    */
                },
                axis: {
                    x: {
                        type: 'category',
                        label: {text: 'Year', position: 'outer-center'},
                        tick: {culling: {max: 6}}
                    },
                    y: {
                        label: {text: 'Racial %', position: 'outer-middle'},
                        min: 0
                    }
                }
            }); 
            $("#chart3").append(chart3.element);
    
        //============chart4============\\
         chart4 = c3.generate({
        
                size: '60%',
        
                data: {     
        json:
             [{"year":1990,"primary":0.99,"secondary":1.06,"tertiary":0.77},{"year":1991,"primary":0.99,"secondary":1.05,"tertiary":0.79},{"year":1992,"primary":0.99,"secondary":1.04,"tertiary":0.8},{"year":1993,"primary":0.99,"secondary":1.06,"tertiary":0.81},{"year":1994,"primary":0.99,"secondary":1.02,"tertiary":0.83},{"year":1995,"primary":0.99,"secondary":1.01,"tertiary":0.86},{"year":1996,"primary":0.99,"secondary":1.01,"tertiary":0.83},{"year":1997,"primary":0.99,"secondary":1,"tertiary":0.85},{"year":1998,"primary":0.99,"secondary":1,"tertiary":0.85},{"year":1999,"primary":0.99,"secondary":1,"tertiary":0.89},{"year":2000,"primary":0.99,"secondary":1,"tertiary":0.91},{"year":2001,"primary":0.99,"secondary":1,"tertiary":0.93},{"year":2002,"primary":1,"secondary":1,"tertiary":0.92},{"year":2003,"primary":0.99,"secondary":1,"tertiary":0.94},{"year":2004,"primary":0.99,"secondary":1,"tertiary":0.94},{"year":2005,"primary":0.99,"secondary":1,"tertiary":0.98},{"year":2006,"primary":0.99,"secondary":1,"tertiary":0.98},{"year":2007,"primary":0.99,"secondary":1,"tertiary":1.01},{"year":2008,"primary":0.99,"secondary":1,"tertiary":1.03},{"year":2009,"primary":0.99,"secondary":0.99,"tertiary":1.01},{"year":2010,"primary":1,"secondary":1,"tertiary":1.08},{"year":2011,"primary":1,"secondary":1,"tertiary":1.1},{"year":2012,"primary":1,"secondary":1,"tertiary":1.09}]
        ,
                    type: 'line',
                    keys: {
                        x: 'year',
                        value: ['primary','secondary','tertiary']
                    },
                    /*colors: {primary:'#6baed6',
                            secondary:'#9ecae1',
                            tertiary:'#006d2c'}*/
                },
                axis: {
                    x: {
                        type: 'category',
                        label: {text: 'Year', position: 'outer-center'},
                        tick: {culling: {max: 6}}
                    },
                    y: {
                        label: {text: 'Females to Male Ratio', position: 'outer-middle'}
                    }
                }
            });
            $("#chart4").append(chart4.element);
        
        //============chart5============\\ 
        chart5 = c3.generate({
        
                size: '60%',
        
                data: {     
        json:
             [{"year":1960,"primary":413,"secondary":48},{"year":1970,"primary":388,"secondary":85},{"year":1980,"primary":313,"secondary":107},{"year":1990,"primary":200,"secondary":133},{"year":2000,"primary":195,"secondary":157},{"year":2003,"primary":173,"secondary":160},{"year":2004,"primary":172,"secondary":157},{"year":2005,"primary":173,"secondary":156},{"year":2006,"primary":172,"secondary":155},{"year":2007,"primary":170,"secondary":154},{"year":2008,"primary":174,"secondary":154},{"year":2009,"primary":172,"secondary":154},{"year":2010,"primary":173,"secondary":155},{"year":2011,"primary":174,"secondary":154},{"year":2012,"primary":175,"secondary":154},{"year":2013,"primary":182,"secondary":154}]
             ,
                    type: 'line',
                    keys: {
                        x: 'year',
                        value: ['primary','secondary']
                    },
                    /*colors: {primary:'#c6dbef',
                            secondary:'#6baed6'}*/
                },
                axis: {
                    x: {
                        type: 'category',
                        label: {text: 'Year', position: 'outer-center'},
                        tick: {culling: {max: 6}}
                    },
                    y: {
                        label: {text: 'Number of Pri & Sec Schools', position: 'outer-middle'}
                    }
                }
            });
            $("#chart5").append(chart5.element);
        
        //============chart6============\\ 
        chart6 = c3.generate({
        
                size: '60%',
        
                data: {     
        json:
             [{"year":1981,"primary":30.1,"secondary":21.6},{"year":1982,"primary":30.3,"secondary":21.5},{"year":1983,"primary":29.3,"secondary":21.5},{"year":1984,"primary":27.7,"secondary":23.5},{"year":1985,"primary":26.8,"secondary":22.8},{"year":1986,"primary":26.2,"secondary":24},{"year":1987,"primary":25.7,"secondary":22.5},{"year":1988,"primary":26,"secondary":22.9},{"year":1989,"primary":25.8,"secondary":22.3},{"year":1990,"primary":25.8,"secondary":21.7},{"year":1991,"primary":26.4,"secondary":21.2},{"year":1992,"primary":25.8,"secondary":20.8},{"year":1993,"primary":24.4,"secondary":20.9},{"year":1994,"primary":23.8,"secondary":21.8},{"year":1995,"primary":25,"secondary":22.7},{"year":1996,"primary":25.3,"secondary":21.5},{"year":1997,"primary":26.5,"secondary":19.8},{"year":1998,"primary":26.3,"secondary":20.1},{"year":1999,"primary":26.6,"secondary":19.4},{"year":2000,"primary":25.6,"secondary":19.2},{"year":2001,"primary":25.1,"secondary":19.6},{"year":2002,"primary":24.4,"secondary":18.9},{"year":2003,"primary":24.9,"secondary":19.1},{"year":2004,"primary":24.3,"secondary":19},{"year":2005,"primary":23.5,"secondary":18.5},{"year":2006,"primary":22.6,"secondary":18.4},{"year":2007,"primary":22.1,"secondary":18.3},{"year":2008,"primary":21.4,"secondary":17.9},{"year":2009,"primary":19.6,"secondary":16.4},{"year":2010,"primary":19.3,"secondary":16.1},{"year":2011,"primary":18.6,"secondary":14.8},{"year":2012,"primary":17.7,"secondary":13.9}]
        ,
                    type: 'line',
                    keys: {
                        x: 'year',
                        value: ['primary','secondary']
                    },
                    /*colors: {primary:'#a50f15',
                            secondary:'#cb181d'}*/
                },
                axis: {
                    x: {
                        type: 'category',
                        label: {text: 'Year', position: 'outer-center'},
                        tick: {culling: {max: 6}}
                    },
                    y: {
                        label: {text: 'Student to Teacher Ratio', position: 'outer-middle'},
                        min: 0
                    }
                }
            });
            $("#chart6").append(chart6.element);
           
  //insight graphs
    insight1 = c3.generate({
    bindto: '#insight1',
    size: '60%',
    data: {
	x: 'x',
      columns: [
	    ['x', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012','2013'],
		['Number of Scholars', 68, 49, 35, 32, 39, 57, 71, 84, 69, 72, 63,95]
      ]
    },
	axis: {
        x: {
            tick: { count: 11 },
			tick: { fit: false }
        },
        y:{min: 0}
    }
    });   
    
    insight2 = c3.generate({
    bindto: '#insight2',
    size: '60%',
    data: {
	x: 'x',
      columns: [
	    ['x', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013'],
		['Science + Tech + Engineering + Maths (STEM)', 44.12, 36.73, 37.14, 34.38, 28.21, 33.33, 32.39, 26.19, 28.99, 11.11, 11.11, 25.26],
		['Economics + Business + Humanities', 48.53,	51.02,	54.29,	59.38,	48.72,	49.12,	54.93,	58.33,	57.97,	62.50, 61.90, 55.79],		
		
      ]
    },
	
	
	axis: {
        x: {
            tick: { count: 11 },
			tick: { fit: false }
        },
        y: {
            label: 'Percentage (%)',
            min: 0
        }
    }
    });
    
    var chart = c3.generate({
    bindto: '#insight3',
    size: '60%',
    data: {
	x: 'x',
      columns: [
	    ['x', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013'],
		['Engineering', 32.35,	12.24,	25.71,	15.63,	15.38,	15.79,	12.68,	11.90,	11.59,	4.17,	7.94,  13.68],
		['Economics', 33.82,	36.73,	42.86,	40.63,	35.90,	24.56,	33.80,	39.29,	34.78,	40.28,	34.92,  17.89],	
		['Humanities', 14.71,	14.29,	11.43,	18.75,	12.82,	24.56,	18.31,	16.67,	18.84,	20.83,	20.63,  35.79],	
		['Law', 4.41,	4.08,	5.71,	3.13,	12.82,	5.26,	7.04,	10.71,	13.04,	15.28,	17.46,  16.84],
		['Others',14.71,32.66,14.29,21.86,23.08,29.83,28.17,21.43,21.75,19.44,19.05,15.85]
      ],
      types:{
        Engineering:'area',
        Economics:'area',
        Humanities:'area',
        Law:'area',
        Others:'area'
      },
      groups: [['Engineering','Economics','Humanities','Law','Others']], order: null 
    },
	
	
	axis: {
        x: {
            tick: { count: 11 },
			tick: { fit: false }
        },
        y: {
            min: 0,
            max: 90,
            label: 'Percentage (%)'
        }
    }
});
    
           
            });//end c3.js       
    
    //timeline js
       $(document).ready(function() {
        createStoryJS({
             width: "100%",
             height: "100%",
             font: "PT", 
             source:  'data/TimelineData.json',
             });
        });
    
    }); //end d3 call
    
} //end ieError