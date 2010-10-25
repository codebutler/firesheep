(function($) {

  function print_array(obj, opts) {
    var result = [];
    for (var i = 0; i < Math.min(opts.max_array, obj.length); i++)
      result.push($.print(obj[i], $.extend({}, opts, { max_array: 3, max_string: 40 })));

    if (obj.length > opts.max_array)
      result.push((obj.length - opts.max_array) + ' more...');
    if (result.length == 0) return "[]"
      return "[ " + result.join(", ") + " ]";
  }

  function print_element(obj) {
    if (obj.nodeType == 1) {
      var result = [];
      var properties = [ 'className', 'id' ];
      var extra = {
        'input': ['type', 'name', 'value'],
        'a': ['href', 'target'],
        'form': ['method', 'action'],
        'script': ['src'],
        'link': ['href'],
        'img': ['src']
      };

      $.each(properties.concat(extra[obj.tagName.toLowerCase()] || []), function(){
        if (obj[this])
          result.push(' ' + this.replace('className', 'class') + "=" + $.print(obj[this]))
      });
      return "<" + obj.tagName.toLowerCase()
              + result.join('') + ">";
    }
  }

  function print_object(obj, opts) {
    var seen = opts.seen || [ obj ];

    var result = [], key, value;
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && $.inArray(obj[k], seen) < 0) {
        seen.push(obj[k]);
        value = $.print(obj[k], $.extend({}, opts, { max_array: 6, max_string: 40, seen: seen }));
      } else
        value = "...";
      result.push(k + ": " + value);
    }
    if (result.length == 0) return "{}";
    return "{ " + result.join(", ") + " }";
  }

  function print_string(value, opts) {
    var character_substitutions = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"' : '\\"',
      '\\': '\\\\'
    };
    var r = /["\\\x00-\x1f\x7f-\x9f]/g;
    
    var str = r.test(value)
      ? value.replace(r, function (a) {
          var c = character_substitutions[a];
          if (c) return c;
          c = a.charCodeAt();
          return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
        })
      : value ;
    if (str.length > opts.max_string)
      return str.slice(0, opts.max_string + 1) + '..."';
    else
      return str;
  }

  $.print = function(obj, options) {
    var opts = $.extend({}, { max_array: 10, max_string: 100 }, options);

    if (typeof obj == 'undefined')
      return "undefined";
    else if (typeof obj == 'boolean')
      return obj.toString();
    else if (typeof obj == 'number')
      return obj.toString();
    else if (!obj)
      return "null";
    else if (typeof obj == 'string')
      return print_string(obj, opts);
    else if (obj instanceof RegExp)
      return obj.toString();
    else if (obj instanceof Array || obj.callee || obj.item)
      return print_array(obj, opts);
    else if (typeof obj == 'function' || obj instanceof Function)
      return obj.toString().match(/^([^)]*\))/)[1];
    else if (obj.nodeType)
      return print_element(obj);
    else if (obj instanceof jQuery)
      return "$(" + $.print(obj.get()) + ")";
    else if (obj instanceof Error)
      return print_object(obj, $.extend({}, options, { max_string: 200 }));
    else if (obj instanceof Object)
      return print_object(obj, opts);
    else
      return obj.toString().replace(/\n\s*/g, '');
  }

})(jQuery);