function foo(element, label, datas, total) {
  var plot = $.plot($(element),
    [ { data: datas, label: label} ], {
      series: {
        lines:  { show: true },
        points: { show: true }
      },
      grid:  { hoverable: true, clickable: true },
      xaxis: { ticks: total, min: 0, max: total },
      yaxis: { min: 0, max: 100 }
    });

  function showTooltip(x, y, contents) {
    $('<div id="tooltip">' + contents + '</div>').css( {
      position: 'absolute',
      display: 'none',
      top: y + 5,
      left: x + 5,
      border: '1px solid #fdd',
      padding: '2px',
      'background-color': '#fee',
      opacity: 0.80
    }).appendTo("body").fadeIn(200);
  }

  var previousPoint = null;
  $(element).bind("plothover", function (event, pos, item) {
    $("#x").text(pos.x.toFixed(2));
    $("#y").text(pos.y.toFixed(2));

      if (item) {
        if (previousPoint != item.dataIndex) {
          previousPoint = item.dataIndex;

          $("#tooltip").remove();
          var x = Math.floor(item.datapoint[0].toFixed(2));
          var y = item.datapoint[1].toFixed(2);

          var noun = "women";
          if (x == 1) {
            noun = "woman";
          }

          var text = "";
          if (item.series.label[2] == ">") {
            text = "P(>" + x + " " + noun + ") = " + y + "%";
          }
          else {
            text = "P(" + x + " " + noun + ") = " + y + "%";
          }

          showTooltip(item.pageX, item.pageY, text);
        }
      }
      else {
        $("#tooltip").remove();
        previousPoint = null;
      }
  });

  $(element).bind("plotclick", function (event, pos, item) {
    if (item) {
//      $("#clickdata").text("You clicked point " + item.dataIndex + " in " + item.series.label + ".");
//      plot.highlight(item.series, item.datapoint);
    }
  });
}

$(function () {
  var total = parseFloat($("#total").val());

  var probs = [];
  for (var i = 0; i <= total; i += 1) {
    probs.push([i, parseFloat($("#prob_" + i).val())]);
  }

  var rolls = [];
  for (var i = 0; i < total; i += 1) {
    rolls.push([i, parseFloat($("#roll_" + i).val())]);
  }

  foo("#prob", "P(x women)", probs, total);
  foo("#roll", "P(>x women)", rolls, total);
});
