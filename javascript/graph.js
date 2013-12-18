function update_plots(options) {
  var values = compute(options.p, options.s, options.t);

  $('#header h2 .group').val(options.g);
  $('#header h2 .adjective').val(options.a);

  $('#input_headers .noun').val(options.n);
  $('#input_headers .verb').val(options.v);

  $('#result_header h3 span').text(options.t);
  $('#result_header h3 input').val(options.v);

  $('#inputs .percent').val(options.p);
  $('#inputs .sample').val(options.s);
  $('#inputs .total').val(options.t);

  plot("#prob", "P(x "+options.n+")", values.probs, options.t);
  plot("#roll", "P(>x "+options.n+")", values.rolls, options.t);

  var p_value = values.probs[options.s][1];
  var p_this = values.rolls[options.s][1];
  var over_representation = Math.floor(options.t*options.p);
  var p_gt_value = values.rolls[over_representation][1];

  $('#conclusions ul li.p').text("The probability of having "+options.s+" "+options.n+" "+options.v+" is "+ p_value + "%");
  $('#conclusions ul li.p_gt').text("The probability of coincidentally over-representing "+options.n+" is "+ p_gt_value + "%");

  var group_caps = options.g.charAt(0).toUpperCase() + options.g.slice(1);

  if (p_this > 30.0 && p_this < 60.0) {
    $('#conclusions ul li.takeaway').text(group_caps+" has done its due diligence in representing "+options.n+".");
  }
  else if (p_this <= 30.0) {
    $('#conclusions ul li.takeaway').text(group_caps+" completely disrupts the status quo by over-representing "+options.n+".");
  }
  else {
    $('#conclusions ul li.takeaway').text("It is more likely to over-represent "+options.n+" than to have only "+options.s+".");
  }

  var link = document.URL.split("?")[0]+"?p="+options.p+"&s="+options.s+"&t="+options.t+"&n="+options.n+"&g="+options.g+"&a="+options.a+"&v="+options.v;
  $('#link').text(link);
  window.history.pushState({},"",link);
}

function compute(percent, sampled, total) {
  // Factorial function
  var f = [];
  function factorial(n) {
    if (n == 0 || n == 1)
      return 1;
    if (f[n] > 0)
      return f[n];
    return f[n] = factorial(n-1) * n;
  }

  var probs = [];
  for (var i = 0; i <= total; i++) {
    var num_success = i;
    var num_failure = total - i;

    // How many ways can this outcome occur?
    var num_outcomes =
      factorial(total) /
      (factorial(num_success) * factorial(num_failure));

    // What is the probability of this outcome occuring once?
    var prob = Math.pow(1 - percent, num_failure) *
               Math.pow(    percent, num_success);

    // What is the total probability of the distribution?
    var total_prob = prob * num_outcomes;
    var simple_percent = Math.floor(total_prob * 1000) / 10;

    probs[i] = [i, simple_percent];
  }

  var rolling = 100;

  var rolls = [];

  probs.forEach(function(p, i) {
    var simple_percent = Math.floor(rolling * 10) / 10;
    rolling = rolling - p[1];
    if (i > 0) {
      rolls[i-1] = [i-1, simple_percent];
    }
  });

  return {
    rolls: rolls,
    probs: probs
  };
}

function plot(element, label, datas, total) {
  var e = $(element);

  e.css("height", e.width() * (3/5));

  var num_ticks = 11;
  if (total == 25) {
    num_ticks = 12;
  }

  var plot = $.plot(e,
    [ { data: datas, label: label} ], {
      series: {
        lines:  { show: true },
        points: { show: true }
      },
      grid:  { hoverable: true, clickable: true },
      xaxis: { ticks: num_ticks, min: 0, max: total },
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
  e.bind("plothover", function (event, pos, item) {
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
}

function getParameters() {
  return decodeURIComponent(window.location.search.replace("?", "")).split('&')
}

$(function() {
  params = getParameters();

  var options = {};

  if (params[0] == "") {
    $('input').css("background-color", "#333");
  }

  params.forEach(function(param) {
    param = param.split('=');
    var key = param[0];
    var value = param[1];

    options[key] = value;
  });

  if (!('p' in options)) {
    options.p = "0.2";
  }

  if (!('s' in options)) {
    options.s = "10";
  }

  if (!('t' in options)) {
    options.t = "30";
  }

  if (!('g' in options)) {
    options.g = "this conference";
  }

  if (!('n' in options)) {
    options.n = "women";
  }

  if (!('v' in options)) {
    options.v = "speaking";
  }

  if (!('a' in options)) {
    options.a = "gender";
  }

  update_plots(options);

  var update_percent = function() {
    options.p = $(this).val();
    update_plots(options);
  };

  $('#inputs .percent').change(update_percent).keyup(update_percent);

  var update_sample = function() {
    options.s = $(this).val();
    update_plots(options);
  };

  $('#inputs .sample').change(update_sample).keyup(update_sample);

  var update_total = function() {
    options.t = $(this).val();
    update_plots(options);
  };

  $('#inputs .total').change(update_total).keyup(update_total);

  var update_verb = function() {
    ele = $('<span></span>').text($(this).val()).css("display", "none");
    $('#result_header input').parent().append(ele);
    $('#result_header input').css("width", ele.innerWidth());
    ele.remove();

    ele = $('<span></span>').text($(this).val()).css("display", "none");
    $('#input_headers input.verb').parent().append(ele);
    $('#input_headers input.verb').css("width", ele.innerWidth());
    ele.remove();

    options.v = $(this).val();
    update_plots(options);
  }

  $('#result_header input').change(update_verb).keyup(update_verb).trigger('change');
  $('#input_headers input.verb').change(update_verb).keyup(update_verb).trigger('change');

  var update_group = function() {
    ele = $('<span></span>').text($(this).val()).css("display", "none");
    $(this).parent().append(ele);
    $(this).css("width", ele.innerWidth());
    ele.remove();

    options.g = $(this).val();
    update_plots(options);
  }

  $('#header input.group').change(update_group).keyup(update_group).trigger('change');

  var update_adjective = function() {
    ele = $('<span></span>').text($(this).val()).css("display", "none");
    $(this).parent().append(ele);
    $(this).css("width", ele.innerWidth());
    ele.remove();

    options.a = $(this).val();
    update_plots(options);
  }

  $('#header input.adjective').change(update_adjective).keyup(update_adjective).trigger('change');

  var update_noun = function() {
    ele = $('<span></span>').text($(this).val()).css("display", "none");
    $(this).parent().append(ele);
    $('#input_headers input.noun').css("width", ele.innerWidth());
    ele.remove();

    options.n = $(this).val();
    update_plots(options);
  }

  $('#input_headers input.noun').change(update_noun).keyup(update_noun).trigger('change');
});
