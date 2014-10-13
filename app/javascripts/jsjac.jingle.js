/**
 * jsjac-jingle [uncompressed]
 * @fileoverview JSJaC Jingle library, implementation of XEP-0166.
 *
 * @version 0.8.0
 * @date 2014-10-13
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license MPL 2.0
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @repository git+https://github.com/valeriansaliou/jsjac-jingle.git
 * @depends https://github.com/sstrigler/JSJaC
 */

//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

/*
Ring.js

Copyright (c) 2013, Nicolas Vanhoren

Released under the MIT license

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {
/* jshint es3: true, proto: true */
"use strict";

if (typeof(exports) !== "undefined") { // nodejs
    var underscore = require("underscore");
    underscore.extend(exports, declare(underscore));
} else if (typeof(define) !== "undefined") { // amd
    define(["underscore"], declare);
} else { // define global variable
    window.ring = declare(_);
}


function declare(_) {
    var ring = {};

    function RingObject() {}
    /**
        ring.Object

        The base class of all other classes. It doesn't have much uses except
        testing testing if an object uses the Ring.js class system using
        ring.instance(x, ring.Object)
    */
    ring.Object = RingObject;
    _.extend(ring.Object, {
        __mro__: [ring.Object],
        __properties__: {__ringConstructor__: function() {}},
        __classId__: 1,
        __parents__: [],
        __classIndex__: {"1": ring.Object}
    });
    _.extend(ring.Object.prototype, {
        __ringConstructor__: ring.Object.__properties__.__ringConstructor__
    });

    // utility function to have Object.create on all browsers
    var objectCreate = function(o) {
        function CreatedObject(){}
        CreatedObject.prototype = o;
        var tmp = new CreatedObject();
        tmp.__proto__ = o;
        return tmp;
    };
    ring.__objectCreate = objectCreate;

    var classCounter = 3;
    var fnTest = /xyz/.test(function(){xyz();}) ? /\$super\b/ : /.*/;

    /**
        ring.create([parents,] properties)

        Creates a new class and returns it.

        properties is a dictionary of the methods and attributes that should
        be added to the new class' prototype.

        parents is a list of the classes this new class should extend. If not
        specified or an empty list is specified this class will inherit from one
        class: ring.Object.
    */
    ring.create = function() {
        // arguments parsing
        var args = _.toArray(arguments);
        args.reverse();
        var props = args[0];
        var parents = args.length >= 2 ? args[1] : [];
        if (! (parents instanceof Array))
            parents = [parents];
        _.each(parents, function(el) {
            toRingClass(el);
        });
        if (parents.length === 0)
            parents = [ring.Object];
        // constructor handling
        var cons = props.constructor !== Object ? props.constructor : undefined;
        props = _.clone(props);
        delete props.constructor;
        if (cons)
            props.__ringConstructor__ = cons;
        else { //retro compatibility
            cons = props.init;
            delete props.init;
            if (cons)
                props.__ringConstructor__ = cons;
        }
        // create real class
        var claz = function Instance() {
            this.$super = null;
            this.__ringConstructor__.apply(this, arguments);
        };
        claz.__properties__ = props;
        // mro creation
        var toMerge = _.pluck(parents, "__mro__");
        toMerge = toMerge.concat([parents]);
        var __mro__ = [claz].concat(mergeMro(toMerge));
        //generate prototype
        var prototype = Object.prototype;
        _.each(_.clone(__mro__).reverse(), function(claz) {
            var current = objectCreate(prototype);
            _.extend(current, claz.__properties__);
            _.each(_.keys(current), function(key) {
                var p = current[key];
                if (typeof p !== "function" || ! fnTest.test(p) || p.__classId__ ||
                    (key !== "__ringConstructor__" && claz.__ringConvertedObject__))
                    return;
                current[key] = (function(name, fct, supProto) {
                    return function() {
                        var tmp = this.$super;
                        this.$super = supProto[name];
                        try {
                            return fct.apply(this, arguments);
                        } finally {
                            this.$super = tmp;
                        }
                    };
                })(key, p, prototype);
            });
            current.constructor = claz;
            prototype = current;
        });
        // remaining operations
        var id = classCounter++;
        claz.__mro__ = __mro__;
        claz.__parents__ = parents;
        claz.prototype = prototype;
        claz.__classId__ = id;
        // construct classes index
        claz.__classIndex__ = {};
        _.each(claz.__mro__, function(c) {
            claz.__classIndex__[c.__classId__] = c;
        });
        // class init
        if (claz.prototype.classInit) {
            claz.__classInit__ = claz.prototype.classInit;
            delete claz.prototype.classInit;
        }
        _.each(_.chain(claz.__mro__).clone().reverse().value(), function(c) {
            if (c.__classInit__) {
                var ret = c.__classInit__(claz.prototype);
                if (ret !== undefined)
                    claz.prototype = ret;
            }
        });

        return claz;
    };

    var mergeMro = function(toMerge) {
        /* jshint loopfunc:true */
        // C3 merge() implementation
        var __mro__ = [];
        var current = _.clone(toMerge);
        while (true) {
            var found = false;
            for (var i=0; i < current.length; i++) {
                if (current[i].length === 0)
                    continue;
                var currentClass = current[i][0];
                var isInTail = _.find(current, function(lst) {
                    return _.contains(_.rest(lst), currentClass);
                });
                if (! isInTail) {
                    found = true;
                    __mro__.push(currentClass);
                    current = _.map(current, function(lst) {
                        if (_.head(lst) === currentClass)
                            return _.rest(lst);
                        else
                            return lst;
                    });
                    break;
                }
            }
            if (found)
                continue;
            if (_.all(current, function(i) { return i.length === 0; }))
                return __mro__;
            throw new ring.ValueError("Cannot create a consistent method resolution order (MRO)");
        }
    };

    /**
        Convert an existing class to be used with the ring.js class system.
    */
    var toRingClass = function(claz) {
        if (claz.__classId__)
            return;
        var proto = ! Object.getOwnPropertyNames ? claz.prototype : (function() {
            var keys = {};
            (function crawl(p) {
                if (p === Object.prototype)
                    return;
                _.extend(keys, _.chain(Object.getOwnPropertyNames(p))
                    .map(function(el) {return [el, true];})
                    .object().value());
                crawl(Object.getPrototypeOf(p));
            })(claz.prototype);
            return _.object(_.map(_.keys(keys), function(k) {return [k, claz.prototype[k]];}));
        })();
        proto = _.chain(proto).map(function(v, k) { return [k, v]; })
            .filter(function(el) {return el[0] !== "constructor" && el[0] !== "__proto__";})
            .object().value();
        var id = classCounter++;
        _.extend(claz, {
            __mro__: [claz, ring.Object],
            __properties__: _.extend({}, proto, {
                __ringConstructor__: function() {
                    this.$super.apply(this, arguments);
                    var tmp = this.$super;
                    this.$super = null;
                    try {
                        claz.apply(this, arguments);
                    } finally {
                        this.$super = tmp;
                    }
                }
            }),
            __classId__: id,
            __parents__: [ring.Object],
            __classIndex__: {"1": ring.Object},
            __ringConvertedObject__: true
        });
        claz.__classIndex__[id] = claz;
    };

    /**
        ring.instance(obj, type)

        Returns true if obj is an instance of type or an instance of a sub-class of type.

        It is necessary to use this method instead of instanceof when using the Ring.js class
        system because instanceof will not be able to detect sub-classes.

        If used with obj or type that do not use the Ring.js class system this method will
        use instanceof instead. So it should be safe to replace all usages of instanceof
        by ring.instance() in any program, whether or not it uses Ring.js.

        Additionaly this method allows to test the type of simple JavaScript types like strings.
        To do so, pass a string instead of a type as second argument. Examples:

            ring.instance("", "string") // returns true
            ring.instance(function() {}, "function") // returns true
            ring.instance({}, "object") // returns true
            ring.instance(1, "number") // returns true
    */
    ring.instance = function(obj, type) {
        if (obj !== null && typeof(obj) === "object" && obj.constructor && obj.constructor.__classIndex__ &&
            typeof(type) === "function" && typeof(type.__classId__) === "number") {
            return obj.constructor.__classIndex__[type.__classId__] !== undefined;
        }
        if (typeof(type) === "string")
            return typeof(obj) === type;
        return obj instanceof type;
    };

    /**
        A class to easily create new classes representing exceptions. This class is special
        because it is a sub-class of the standard Error class of JavaScript. Examples:

        ring.instance(e, Error)

        e instanceof Error

        This two expressions will always be true if e is an instance of ring.Error or any
        sub-class of ring.Error.

    */
    ring.Error = ring.create({
        /**
            The name attribute is used in the default implementation of the toString() method
            of the standard JavaScript Error class. According to the standard, all sub-classes
            of Error should define a new name.
        */
        name: "ring.Error",
        /**
            A default message to use in instances of this class if there is no arguments given
            to the constructor.
        */
        defaultMessage: "",
        /**
            Constructor arguments:

            message: The message to put in the instance. If there is no message specified, the
            message will be this.defaultMessage.
        */
        constructor: function(message) {
            this.message = message || this.defaultMessage;
        },
        classInit: function(prototype) {
            // some black magic to reconstitute a complete prototype chain
            // with Error at the end
            var protos = [];
            var gather = function(proto) {
                if (! proto)
                    return;
                protos.push(proto);
                gather(proto.__proto__);
            };
            gather(prototype);
            var current = new Error();
            _.each(_.clone(protos).reverse(), function(proto) {
                var tmp = objectCreate(current);
                // using _.each to avoid traversing prototypes
                _.each(proto, function(v, k) {
                    if (k !== "__proto__")
                        tmp[k] = v;
                });
                current = tmp;
            });
            return current;
        }
    });

    /**
        A type of exception to inform that a method received an argument with an incorrect value.
    */
    ring.ValueError = ring.create([ring.Error], {
        name: "ring.ValueError"
    });

    /**
        This method allows to find the super of a method when that method has been re-defined
        in a child class.

        Contrary to this.$super(), this function allows to find a super method in another method
        than the re-defining one. Example:

        var A = ring.create({
            fctA: function() {...};
        });

        var B = ring.create([A], {
            fctA: function() {...};
            fctB: function() {
                ring.getSuper(B, this, "fctA")(); // here we call the original fctA() method
                // as it was defined in the A class
            };
        });

        This method is much slower than this.$super(), so this.$super() should always be
        preferred when it is possible to use it.

        Arguments:

        * currentClass: The current class. It is necessary to specify it for this function
          to work properly.
        * obj: The current object (this in most cases).
        * attributeName: The name of the desired attribute as it appeared in the base class.

        Returns the attribute as it was defined in the base class. If that attribute is a function,
        it will be binded to obj.
    */
    ring.getSuper = function(currentClass, obj, attributeName) {
        var pos;
        var __mro__ = obj.constructor.__mro__;
        for (var i = 0; i < __mro__.length; i++) {
            if (__mro__[i] === currentClass) {
                pos = i;
                break;
            }
        }
        if (pos === undefined)
            throw new ring.ValueError("Class not found in instance's method resolution order.");
        var find = function(proto, counter) {
            if (counter === 0)
                return proto;
            return find(proto.__proto__, counter - 1);
        };
        var proto = find(obj.constructor.prototype, pos + 1);
        var att;
        if (attributeName !== "constructor" && attributeName !== "init") // retro compatibility
            att = proto[attributeName];
        else
            att = proto.__ringConstructor__;
        if (ring.instance(att, "function"))
            return _.bind(att, obj);
        else
            return att;
    };

    return ring;
}
})();

/**
 * @fileoverview JSJaC Jingle library - Header
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/header */


/**
 * Implements:
 *
 * See the PROTOCOL.md file for a list of supported protocol extensions
 *
 *
 * Workflow:
 *
 * This negotiation example associates JSJaCJingle.js methods to a real workflow
 * We assume in this workflow example remote user accepts the call he gets
 *
 * 1.cmt Local user wants to start a WebRTC session with remote user
 * 1.snd Local user sends a session-initiate type='set'
 * 1.hdl Remote user sends back a type='result' to '1.snd' stanza (ack)
 *
 * 2.cmt Local user waits silently for remote user to send a session-accept
 * 2.hdl Remote user sends a session-accept type='set'
 * 2.snd Local user sends back a type='result' to '2.hdl' stanza (ack)
 *
 * 3.cmt WebRTC session starts
 * 3.cmt Users chat, and chat, and chat. Happy Jabbering to them!
 *
 * 4.cmt Local user wants to stop WebRTC session with remote user
 * 4.snd Local user sends a session-terminate type='set'
 * 4.hdl Remote user sends back a type='result' to '4.snd' stanza (ack)
 */
/**
 * @fileoverview JSJaC Jingle library - Constants map
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/constants */


/**
 * JINGLE WEBRTC
 */

/**
 * @constant
 * @global
 * @type {Function}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_GET_MEDIA           = ( navigator.webkitGetUserMedia     ||
                                   navigator.mozGetUserMedia        ||
                                   navigator.msGetUserMedia         ||
                                   navigator.getUserMedia           );

/**
 * @constant
 * @global
 * @type {Function}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_PEER_CONNECTION     = ( window.webkitRTCPeerConnection   ||
                                   window.mozRTCPeerConnection      ||
                                   window.RTCPeerConnection         );

/**
 * @constant
 * @global
 * @type {Function}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_SESSION_DESCRIPTION = ( window.mozRTCSessionDescription  ||
                                   window.RTCSessionDescription     );

/**
 * @constant
 * @global
 * @type {Function}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_ICE_CANDIDATE       = ( window.mozRTCIceCandidate        ||
                                   window.RTCIceCandidate           );

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_CONFIGURATION = {
  peer_connection : {
    config        : {
      iceServers : [{
        url: 'stun:stun.jappix.com'
      }]
    },

    constraints   : {
      optional : [{
        'DtlsSrtpKeyAgreement': true
      }]
    }
  },

  create_offer    : {
    mandatory: {
      'OfferToReceiveAudio' : true,
      'OfferToReceiveVideo' : true
    }
  },

  create_answer   : {
    mandatory: {
      'OfferToReceiveAudio' : true,
      'OfferToReceiveVideo' : true
    }
  }
};

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_SDP_LINE_BREAK      = '\r\n';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_SDP_TYPE_OFFER      = 'offer';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_SDP_TYPE_ANSWER     = 'answer';

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_WEBRTC_SHORT_CANDIDATE   = 'candidate:(\\w{1,32}) (\\d{1,5}) (udp|tcp) (\\d{1,10}) ([a-zA-Z0-9:\\.]{1,45}) (\\d{1,5}) (typ) (host|srflx|prflx|relay)( (raddr) ([a-zA-Z0-9:\\.]{1,45}) (rport) (\\d{1,5}))?( (generation) (\\d))?';

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_WEBRTC_DATA_CANDIDATE    = new RegExp('^(?:a=)?' + R_WEBRTC_SHORT_CANDIDATE, 'i');

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_WEBRTC_SDP_CANDIDATE     = new RegExp('^a=' + R_WEBRTC_SHORT_CANDIDATE, 'i');

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var R_WEBRTC_SDP_ICE_PAYLOAD   = {
  rtpmap          : /^a=rtpmap:(\d+) (([^\s\/]+)\/(\d+)(\/([^\s\/]+))?)?/i,
  fmtp            : /^a=fmtp:(\d+) (.+)/i,
  group           : /^a=group:(\S+) (.+)/,
  rtcp_fb         : /^a=rtcp-fb:(\S+) (\S+)( (\S+))?/i,
  rtcp_fb_trr_int : /^a=rtcp-fb:(\d+) trr-int (\d+)/i,
  pwd             : /^a=ice-pwd:(\S+)/i,
  ufrag           : /^a=ice-ufrag:(\S+)/i,
  ptime           : /^a=ptime:(\d+)/i,
  maxptime        : /^a=maxptime:(\d+)/i,
  ssrc            : /^a=ssrc:(\d+) (\w+)(:(.+))?/i,
  ssrc_group      : /^a=ssrc-group:(\S+) ([\d ]+)/i,
  rtcp_mux        : /^a=rtcp-mux/i,
  crypto          : /^a=crypto:(\d{1,9}) (\S+) (\S+)( (\S+))?/i,
  zrtp_hash       : /^a=zrtp-hash:(\S+) (\S+)/i,
  fingerprint     : /^a=fingerprint:(\S+) (\S+)/i,
  setup           : /^a=setup:(\S+)/i,
  extmap          : /^a=extmap:([^\s\/]+)(\/([^\s\/]+))? (\S+)/i,
  bandwidth       : /^b=(\w+):(\d+)/i,
  media           : /^m=(audio|video|application|data) /i
};

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var R_NETWORK_PROTOCOLS        = {
  stun: /^stun:/i
};

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var R_NETWORK_IP               = {
  all: {
    v4: /((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])/,
    v6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
  },

  lan: {
    v4: /(^127\.0\.0\.1)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/,
    v6: /((::1)|(^fe80::))(.+)?/i
  }
};

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_JSJAC_JINGLE_SERVICE_URI    = /^(\w+):([^:\?]+)(?::(\d+))?(?:\?transport=(\w+))?/i;


/**
 * JINGLE NAMESPACES
 */

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE                                       = 'urn:xmpp:jingle:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_ERRORS                                = 'urn:xmpp:jingle:errors:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP                              = 'urn:xmpp:jingle:apps:rtp:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_INFO                         = 'urn:xmpp:jingle:apps:rtp:info:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_AUDIO                        = 'urn:xmpp:jingle:apps:rtp:audio';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_VIDEO                        = 'urn:xmpp:jingle:apps:rtp:video';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_RTP_HDREXT                   = 'urn:xmpp:jingle:apps:rtp:rtp-hdrext:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_RTCP_FB                      = 'urn:xmpp:jingle:apps:rtp:rtcp-fb:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_ZRTP                         = 'urn:xmpp:jingle:apps:rtp:zrtp:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_SSMA                         = 'urn:xmpp:jingle:apps:rtp:ssma:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_DTLS                             = 'urn:xmpp:tmp:jingle:apps:dtls:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_GROUPING                         = 'urn:xmpp:jingle:apps:grouping:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_TRANSPORTS_RAWUDP                     = 'urn:xmpp:jingle:transports:raw-udp:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_MESSAGE                               = 'urn:xmpp:jingle-message:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_JINGLENODES                           = 'http://jabber.org/protocol/jinglenodes';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_JINGLENODES_CHANNEL                   = 'http://jabber.org/protocol/jinglenodes#channel';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_MUC                                   = 'http://jabber.org/protocol/muc';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_MUC_OWNER                             = 'http://jabber.org/protocol/muc#owner';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_MUC_ROOMCONFIG                        = 'http://jabber.org/protocol/muc#roomconfig';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_MUC_USER                              = 'http://jabber.org/protocol/muc#user';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_CONFERENCE                            = 'jabber:x:conference';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_DATA                                  = 'jabber:x:data';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_MUJI                                         = 'urn:xmpp:muji:tmp';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_MUJI_INVITE                                  = 'urn:xmpp:muji:invite:tmp';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_EXTDISCO                                     = 'urn:xmpp:extdisco:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_IETF_XMPP_STANZAS                            = 'urn:ietf:params:xml:ns:xmpp-stanzas';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_IETF_RFC_3264                                = 'urn:ietf:rfc:3264';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_IETF_RFC_5576                                = 'urn:ietf:rfc:5576';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_IETF_RFC_5888                                = 'urn:ietf:rfc:5888';

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_NS_JINGLE_APP                                 = /^urn:xmpp:jingle:app:(\w+)(:(\w+))?(:(\d+))?$/;

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_NS_JINGLE_TRANSPORT                           = /^urn:xmpp:jingle:transport:(\w+)$/;

/**
 * @constant
 * @global
 * @type {Array}
 * @readonly
 * @default
 * @public
 */
var MAP_DISCO_JINGLE                                = [
  /* http://xmpp.org/extensions/xep-0166.html#support */
  /* http://xmpp.org/extensions/xep-0167.html#support */
  NS_JINGLE,
  NS_JINGLE_APPS_RTP,
  NS_JINGLE_APPS_RTP_AUDIO,
  NS_JINGLE_APPS_RTP_VIDEO,

  /* http://xmpp.org/extensions/xep-0177.html */
  NS_JINGLE_TRANSPORTS_RAWUDP,

  /* http://xmpp.org/extensions/xep-0176.html#support */
  NS_JINGLE_TRANSPORTS_ICEUDP,
  NS_IETF_RFC_3264,

  /* http://xmpp.org/extensions/xep-0339.html#disco */
  NS_IETF_RFC_5576,

  /* http://xmpp.org/extensions/xep-0338.html#disco */
  NS_IETF_RFC_5888,

  /* http://xmpp.org/extensions/xep-0293.html#determining-support */
  NS_JINGLE_APPS_RTP_RTCP_FB,

  /* http://xmpp.org/extensions/xep-0294.html#determining-support */
  NS_JINGLE_APPS_RTP_RTP_HDREXT,

  /* http://xmpp.org/extensions/xep-0320.html#disco */
  NS_JINGLE_APPS_DTLS,

  /* http://xmpp.org/extensions/xep-0262.html */
  NS_JINGLE_APPS_RTP_ZRTP,

  /* http://xmpp.org/extensions/xep-0353.html */
  NS_JINGLE_MESSAGE,

  /* http://xmpp.org/extensions/xep-0278.html */
  NS_JABBER_JINGLENODES,

  /* http://xmpp.org/extensions/xep-0215.html */
  NS_EXTDISCO
];


/**
 * @constant
 * @global
 * @type {Array}
 * @readonly
 * @default
 * @public
 */
var MAP_DISCO_MUJI                                = [
  /* http://xmpp.org/extensions/xep-0272.html */
  NS_MUJI,

  /* http://xmpp.org/extensions/xep-0272.html#inviting */
  NS_MUJI_INVITE,

  /* http://xmpp.org/extensions/xep-0249.html */
  NS_JABBER_CONFERENCE
];



/**
 * JSJAC JINGLE CONSTANTS
 */

/**
 * @constant
 * @global
 * @type {Boolean}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_AVAILABLE                           = WEBRTC_GET_MEDIA ? true : false;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_SINGLE                      = 'single';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_MUJI                        = 'muji';

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT                = 15;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT             = 5;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIA_READYSTATE_UNINITIALIZED      = 0;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIA_READYSTATE_LOADING            = 1;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIA_READYSTATE_LOADED             = 2;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIA_READYSTATE_INTERACTIVE        = 3;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIA_READYSTATE_COMPLETED          = 4;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_TIMEOUT                      = 10;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_BROADCAST_TIMEOUT                   = 30;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_ID_PRE                       = 'jj';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_NETWORK                             = '0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_GENERATION                          = '0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_DIRECTION_LOCAL                     = 'local';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_DIRECTION_REMOTE                    = 'remote';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_FIREFOX                     = 'Firefox';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_CHROME                      = 'Chrome';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_SAFARI                      = 'Safari';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_OPERA                       = 'Opera';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_IE                          = 'IE';

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS_BOTH                        = { jingle: 'both',      sdp: 'sendrecv' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS_INITIATOR                   = { jingle: 'initiator', sdp: 'sendonly' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS_NONE                        = { jingle: 'none',      sdp: 'inactive' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS_RESPONDER                   = { jingle: 'responder', sdp: 'recvonly' };

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_CREATOR_INITIATOR                   = 'initiator';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_CREATOR_RESPONDER                   = 'responder';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_INACTIVE                     = 'inactive';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_INITIATING                   = 'initiating';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_INITIATED                    = 'initiated';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_ACCEPTING                    = 'accepting';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_ACCEPTED                     = 'accepted';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_TERMINATING                  = 'terminating';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_TERMINATED                   = 'terminated';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_ACCEPT               = 'content-accept';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_ADD                  = 'content-add';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_MODIFY               = 'content-modify';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_REJECT               = 'content-reject';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_REMOVE               = 'content-remove';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_DESCRIPTION_INFO             = 'description-info';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SECURITY_INFO                = 'security-info';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SESSION_ACCEPT               = 'session-accept';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SESSION_INFO                 = 'session-info';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SESSION_INITIATE             = 'session-initiate';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SESSION_TERMINATE            = 'session-terminate';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT             = 'transport-accept';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_TRANSPORT_INFO               = 'transport-info';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_TRANSPORT_REJECT             = 'transport-reject';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE            = 'transport-replace';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_ACTION_PROPOSE              = 'propose';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_ACTION_RETRACT              = 'retract';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_ACTION_ACCEPT               = 'accept';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_ACTION_PROCEED              = 'proceed';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_ACTION_REJECT               = 'reject';

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_OUT_OF_ORDER                  = { jingle: 'out-of-order',           xmpp: 'unexpected-request',         type: 'wait'   };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_TIE_BREAK                     = { jingle: 'tie-break',              xmpp: 'conflict',                   type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_UNKNOWN_SESSION               = { jingle: 'unknown-session',        xmpp: 'item-not-found',             type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO              = { jingle: 'unsupported-info',       xmpp: 'feature-not-implemented',    type: 'modify' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_SECURITY_REQUIRED             = { jingle: 'security-required',      xmpp: 'not-acceptable',             type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_UNEXPECTED_REQUEST                    = { xmpp: 'unexpected-request',       type: 'wait' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_CONFLICT                              = { xmpp: 'conflict',                 type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_ITEM_NOT_FOUND                        = { xmpp: 'item-not-found',           type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_NOT_ACCEPTABLE                        = { xmpp: 'not-acceptable',           type: 'modify' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_NOT_AUTHORIZED                        = { xmpp: 'not-authorized',           type: 'auth' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_FEATURE_NOT_IMPLEMENTED               = { xmpp: 'feature-not-implemented',  type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_SERVICE_UNAVAILABLE                   = { xmpp: 'service-unavailable',      type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_REDIRECT                              = { xmpp: 'redirect',                 type: 'modify' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_RESOURCE_CONSTRAINT                   = { xmpp: 'resource-constraint',      type: 'wait'   };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_BAD_REQUEST                           = { xmpp: 'bad-request',              type: 'cancel' };


/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION          = 'alternative-session';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_BUSY                         = 'busy';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_CANCEL                       = 'cancel';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR           = 'connectivity-error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_DECLINE                      = 'decline';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_EXPIRED                      = 'expired';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_FAILED_APPLICATION           = 'failed-application';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_FAILED_TRANSPORT             = 'failed-transport';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_GENERAL_ERROR                = 'general-error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_GONE                         = 'gone';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS      = 'incompatible-parameters';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_MEDIA_ERROR                  = 'media-error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_SECURITY_ERROR               = 'security-error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_SUCCESS                      = 'success';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_TIMEOUT                      = 'timeout';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS     = 'unsupported-applications';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS       = 'unsupported-transports';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_ACTIVE                 = 'active';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_HOLD                   = 'hold';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_MUTE                   = 'mute';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_RINGING                = 'ringing';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_UNHOLD                 = 'unhold';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_UNMUTE                 = 'unmute';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIA_AUDIO                         = 'audio';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIA_VIDEO                         = 'video';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_VIDEO_SOURCE_CAMERA                 = 'camera';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_VIDEO_SOURCE_SCREEN                 = 'screen';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_IQ                           = 'iq';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_MESSAGE                      = 'message';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_PRESENCE                     = 'presence';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_ALL                    = 'all';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_NORMAL                 = 'normal';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_CHAT                   = 'chat';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_HEADLINE               = 'headline';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_GROUPCHAT              = 'groupchat';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_ERROR                  = 'error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPE_ALL                   = 'all';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE             = 'available';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE           = 'unavailable';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPE_ERROR                 = 'error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_ALL                         = 'all';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_RESULT                      = 'result';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_SET                         = 'set';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_GET                         = 'get';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_ERROR                       = 'error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ICE_CONNECTION_STATE_NEW            = 'new';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ICE_CONNECTION_STATE_CHECKING       = 'checking';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ICE_CONNECTION_STATE_CONNECTED      = 'connected';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ICE_CONNECTION_STATE_COMPLETED      = 'completed';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ICE_CONNECTION_STATE_FAILED         = 'failed';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ICE_CONNECTION_STATE_DISCONNECTED   = 'disconnected';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ICE_CONNECTION_STATE_CLOSED         = 'closed';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST             = 'host';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX            = 'srflx';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_PRFLX            = 'prflx';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_RELAY            = 'relay';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE            = 'ice';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW            = 'raw';

/**
 * @constant
 * @global
 * @type {Array}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_MAP_ICEUDP            = [
  { n: 'component',  r: 1 },
  { n: 'foundation', r: 1 },
  { n: 'generation', r: 1 },
  { n: 'id',         r: 1 },
  { n: 'ip',         r: 1 },
  { n: 'network',    r: 1 },
  { n: 'port',       r: 1 },
  { n: 'priority',   r: 1 },
  { n: 'protocol',   r: 1 },
  { n: 'rel-addr',   r: 0 },
  { n: 'rel-port',   r: 0 },
  { n: 'type',       r: 1 }
];

/**
 * @constant
 * @global
 * @type {Array}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP            = [
  { n: 'component',  r: 1 },
  { n: 'generation', r: 1 },
  { n: 'id',         r: 1 },
  { n: 'ip',         r: 1 },
  { n: 'port',       r: 1 },
  { n: 'type',       r: 1 }
];

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_LOCAL           = 'IN';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE          = 'IN';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4          = 'IP4';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V6          = 'IP6';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_TCP          = 'tcp';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_UDP          = 'udp';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IP_V4                 = '0.0.0.0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IP_V6                 = '::';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT            = JSJAC_JINGLE_SDP_CANDIDATE_IP_V4;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PORT_DEFAULT          = '1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT         = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT     = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_DEFAULT      = JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_UDP;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PRIORITY_DEFAULT      = '1';



/**
 * JSJAC JINGLE MUJI CONSTANTS
 */

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_ACTION_PREPARE                 = 'prepare';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_ACTION_INITIATE                = 'initiate';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_ACTION_LEAVE                   = 'leave';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_INACTIVE                = 'inactive';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_PREPARING               = 'preparing';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_PREPARED                = 'prepared';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_INITIATING              = 'initiating';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_INITIATED               = 'initiated';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_LEAVING                 = 'leaving';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_LEFT                    = 'left';

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_INITIATE_WAIT                  = 2;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_LEAVE_WAIT                     = 1;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_PARTICIPANT_ACCEPT_WAIT        = 0.250;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA         = 'get_user_media';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_MUC_AFFILIATION_ADMIN          = 'admin';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_MUC_AFFILIATION_MEMBER         = 'member';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_MUC_AFFILIATION_NONE           = 'none';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_MUC_AFFILIATION_OUTCAST        = 'outcast';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_MUC_AFFILIATION_OWNER          = 'owner';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_MUC_OWNER_SUBMIT               = 'submit';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_MUC_CONFIG_SECRET              = 'muc#roomconfig_roomsecret';



/**
 * JSJSAC JINGLE CONSTANTS MAPPING
 */

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ICE_CONNECTION_STATES = {};
JSJAC_JINGLE_ICE_CONNECTION_STATES[JSJAC_JINGLE_ICE_CONNECTION_STATE_NEW]           = 1;
JSJAC_JINGLE_ICE_CONNECTION_STATES[JSJAC_JINGLE_ICE_CONNECTION_STATE_CHECKING]      = 1;
JSJAC_JINGLE_ICE_CONNECTION_STATES[JSJAC_JINGLE_ICE_CONNECTION_STATE_CONNECTED]     = 1;
JSJAC_JINGLE_ICE_CONNECTION_STATES[JSJAC_JINGLE_ICE_CONNECTION_STATE_COMPLETED]     = 1;
JSJAC_JINGLE_ICE_CONNECTION_STATES[JSJAC_JINGLE_ICE_CONNECTION_STATE_FAILED]        = 1;
JSJAC_JINGLE_ICE_CONNECTION_STATES[JSJAC_JINGLE_ICE_CONNECTION_STATE_DISCONNECTED]  = 1;
JSJAC_JINGLE_ICE_CONNECTION_STATES[JSJAC_JINGLE_ICE_CONNECTION_STATE_CLOSED]        = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPES   = {};
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST]              = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX]             = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_PRFLX]             = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_RELAY]             = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSERS              = {};
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_FIREFOX]                                 = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_CHROME]                                  = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_SAFARI]                                  = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_OPERA]                                   = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_IE]                                      = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS               = {};
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_BOTH.jingle]                              = JSJAC_JINGLE_SENDERS_BOTH.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_INITIATOR.jingle]                         = JSJAC_JINGLE_SENDERS_INITIATOR.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_NONE.jingle]                              = JSJAC_JINGLE_SENDERS_NONE.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_RESPONDER.jingle]                         = JSJAC_JINGLE_SENDERS_RESPONDER.sdp;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_CREATORS              = {};
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_INITIATOR]                               = 1;
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_RESPONDER]                               = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUSES              = {};
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INACTIVE]                                 = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATING]                               = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATED]                                = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTING]                                = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTED]                                 = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATING]                              = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATED]                               = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTIONS               = {};
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ACCEPT]                            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ADD]                               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_MODIFY]                            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REJECT]                            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REMOVE]                            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_DESCRIPTION_INFO]                          = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SECURITY_INFO]                             = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_ACCEPT]                            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INFO]                              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INITIATE]                          = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_TERMINATE]                         = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT]                          = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_INFO]                            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REJECT]                          = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE]                         = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_ACTIONS               = {};
JSJAC_JINGLE_MESSAGE_ACTIONS[JSJAC_JINGLE_MESSAGE_ACTION_PROPOSE]                   = 1;
JSJAC_JINGLE_MESSAGE_ACTIONS[JSJAC_JINGLE_MESSAGE_ACTION_RETRACT]                   = 1;
JSJAC_JINGLE_MESSAGE_ACTIONS[JSJAC_JINGLE_MESSAGE_ACTION_ACCEPT]                    = 1;
JSJAC_JINGLE_MESSAGE_ACTIONS[JSJAC_JINGLE_MESSAGE_ACTION_PROCEED]                   = 1;
JSJAC_JINGLE_MESSAGE_ACTIONS[JSJAC_JINGLE_MESSAGE_ACTION_REJECT]                    = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_ERRORS                = {};
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_OUT_OF_ORDER.jingle]                         = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_TIE_BREAK.jingle]                            = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNKNOWN_SESSION.jingle]                      = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.jingle]                     = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_SECURITY_REQUIRED.jingle]                    = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERRORS                        = {};
XMPP_ERRORS[XMPP_ERROR_UNEXPECTED_REQUEST.xmpp]                                     = 1;
XMPP_ERRORS[XMPP_ERROR_CONFLICT.xmpp]                                               = 1;
XMPP_ERRORS[XMPP_ERROR_ITEM_NOT_FOUND.xmpp]                                         = 1;
XMPP_ERRORS[XMPP_ERROR_NOT_ACCEPTABLE.xmpp]                                         = 1;
XMPP_ERRORS[XMPP_ERROR_FEATURE_NOT_IMPLEMENTED.xmpp]                                = 1;
XMPP_ERRORS[XMPP_ERROR_SERVICE_UNAVAILABLE.xmpp]                                    = 1;
XMPP_ERRORS[XMPP_ERROR_REDIRECT.xmpp]                                               = 1;
XMPP_ERRORS[XMPP_ERROR_RESOURCE_CONSTRAINT.xmpp]                                    = 1;
XMPP_ERRORS[XMPP_ERROR_BAD_REQUEST.xmpp]                                            = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_REASONS               = {};
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION]                       = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_BUSY]                                      = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CANCEL]                                    = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_DECLINE]                                   = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_EXPIRED]                                   = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_APPLICATION]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_TRANSPORT]                          = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GENERAL_ERROR]                             = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GONE]                                      = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS]                   = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_MEDIA_ERROR]                               = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SECURITY_ERROR]                            = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SUCCESS]                                   = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_TIMEOUT]                                   = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS]                  = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS]                    = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFOS         = {};
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_ACTIVE]                        = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_HOLD]                          = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_MUTE]                          = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_RINGING]                       = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNHOLD]                        = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNMUTE]                        = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIAS                = {};
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_AUDIO]                                       = { label: '0' };
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_VIDEO]                                       = { label: '1' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_VIDEO_SOURCES         = {};
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_CAMERA]                        = 1;
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_SCREEN]                        = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPES         = {};
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_ALL]                           = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_NORMAL]                        = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_CHAT]                          = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_HEADLINE]                      = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_GROUPCHAT]                     = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_ERROR]                         = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPES        = {};
JSJAC_JINGLE_PRESENCE_TYPES[JSJAC_JINGLE_PRESENCE_TYPE_ALL]                         = 1;
JSJAC_JINGLE_PRESENCE_TYPES[JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE]                   = 1;
JSJAC_JINGLE_PRESENCE_TYPES[JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE]                 = 1;
JSJAC_JINGLE_PRESENCE_TYPES[JSJAC_JINGLE_PRESENCE_TYPE_ERROR]                       = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPES              = {};
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_ALL]                                     = 1;
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_RESULT]                                  = 1;
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_SET]                                     = 1;
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_GET]                                     = 1;
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_ERROR]                                   = 1;



/**
 * JSJAC JINGLE MUJI CONSTANTS MAPPING
 */

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_ACTIONS          = {};
JSJAC_JINGLE_MUJI_ACTIONS[JSJAC_JINGLE_MUJI_ACTION_PREPARE]    = 1;
JSJAC_JINGLE_MUJI_ACTIONS[JSJAC_JINGLE_MUJI_ACTION_INITIATE]   = 1;
JSJAC_JINGLE_MUJI_ACTIONS[JSJAC_JINGLE_MUJI_ACTION_LEAVE]      = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS           = {};
JSJAC_JINGLE_MUJI_STATUS[JSJAC_JINGLE_MUJI_STATUS_INACTIVE]    = 1;
JSJAC_JINGLE_MUJI_STATUS[JSJAC_JINGLE_MUJI_STATUS_PREPARING]   = 1;
JSJAC_JINGLE_MUJI_STATUS[JSJAC_JINGLE_MUJI_STATUS_PREPARED]    = 1;
JSJAC_JINGLE_MUJI_STATUS[JSJAC_JINGLE_MUJI_STATUS_INITIATING]  = 1;
JSJAC_JINGLE_MUJI_STATUS[JSJAC_JINGLE_MUJI_STATUS_INITIATED]   = 1;
JSJAC_JINGLE_MUJI_STATUS[JSJAC_JINGLE_MUJI_STATUS_LEAVING]     = 1;
JSJAC_JINGLE_MUJI_STATUS[JSJAC_JINGLE_MUJI_STATUS_LEFT]        = 1;

/**
 * @fileoverview JSJaC Jingle library - Storage layer
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla private License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/storage */
/** @exports JSJaCJingleStorage */


/**
 * Storage layer wrapper.
 * @instance
 * @requires   nicolas-van/ring.js
 * @requires   jsjac-jingle/constants
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var JSJaCJingleStorage = new (ring.create(
  /** @lends JSJaCJingleStorage.prototype */
  {
    /**
     * Constructor
     */
    constructor: function() {
      /**
       * JSJAC JINGLE STORAGE
       */

      /**
       * @member {JSJaCConnection}
       * @default
       * @private
       */
      this._connection = null;

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._sessions                               = {};
      this._sessions[JSJAC_JINGLE_SESSION_SINGLE]  = {};
      this._sessions[JSJAC_JINGLE_SESSION_MUJI]    = {};

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._broadcast_ids                          = {};

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_initiate = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_propose = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_retract = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_accept = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_reject = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_proceed = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._muji_invite     = undefined;

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._debug      = {
        log : function() {}
      };

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._extdisco   = {
        stun : [],
        turn : []
      };

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._fallback   = {
        stun : [],
        turn : []
      };

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._relaynodes = {
        stun  : []
      };

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._defer      = {
        deferred : false,
        count    : 0,
        fn       : []
      };
    },



    /**
     * JSJSAC JINGLE STORAGE GETTERS
     */

    /**
     * Gets the connection object
     * @public
     * @returns {JSJaCConnection} Connection
     */
    get_connection: function() {
      return this._connection;
    },

    /**
     * Gets the sessions storage
     * @public
     * @returns {Object} Sessions
     */
    get_sessions: function() {
      return this._sessions;
    },

    /**
     * Gets the broadcast_ids storage
     * @public
     * @returns {Object} Broadcast ID medias
     */
    get_broadcast_ids: function(id) {
      if(id in this._broadcast_ids)
        return this._broadcast_ids[id];

      return null;
    },

    /**
     * Gets the Single initiate function
     * @public
     * @returns {Function} Single initiate
     */
    get_single_initiate: function() {
      if(typeof this._single_initiate == 'function')
        return this._single_initiate;

      return function(stanza) {};
    },

    /**
     * Gets the Single initiate raw value
     * @public
     * @returns {Function} Single initiate raw value
     */
    get_single_initiate_raw: function() {
      return this._single_initiate;
    },

    /**
     * Gets the Single propose function
     * @public
     * @returns {Function} Single propose
     */
    get_single_propose: function() {
      if(typeof this._single_propose == 'function')
        return this._single_propose;

      return function(stanza) {};
    },

    /**
     * Gets the Single retract function
     * @public
     * @returns {Function} Single retract
     */
    get_single_retract: function() {
      if(typeof this._single_retract == 'function')
        return this._single_retract;

      return function(stanza) {};
    },

    /**
     * Gets the Single accept function
     * @public
     * @returns {Function} Single accept
     */
    get_single_accept: function() {
      if(typeof this._single_accept == 'function')
        return this._single_accept;

      return function(stanza) {};
    },

    /**
     * Gets the Single reject function
     * @public
     * @returns {Function} Single reject
     */
    get_single_reject: function() {
      if(typeof this._single_reject == 'function')
        return this._single_reject;

      return function(stanza) {};
    },

    /**
     * Gets the Single proceed function
     * @public
     * @returns {Function} Single proceed
     */
    get_single_proceed: function() {
      if(typeof this._single_proceed == 'function')
        return this._single_proceed;

      return function(stanza) {};
    },

    /**
     * Gets the Muji invite function
     * @public
     * @returns {Function} Muji invite
     */
    get_muji_invite: function() {
      if(typeof this._muji_invite == 'function')
        return this._muji_invite;

      return function(stanza) {};
    },

    /**
     * Gets the Muji invite raw value
     * @public
     * @returns {Function} Muji invite raw value
     */
    get_muji_invite_raw: function() {
      return this._muji_invite;
    },

    /**
     * Gets the debug interface
     * @public
     * @returns {Object} Debug
     */
    get_debug: function() {
      return this._debug;
    },

    /**
     * Gets the extdisco storage
     * @public
     * @returns {Object} Extdisco
     */
    get_extdisco: function() {
      return this._extdisco;
    },

    /**
     * Gets the fallback storage
     * @public
     * @returns {Object} Fallback
     */
    get_fallback: function() {
      return this._fallback;
    },

    /**
     * Gets the relay nodes storage
     * @public
     * @returns {Object} Relay nodes
     */
    get_relaynodes: function() {
      return this._relaynodes;
    },

    /**
     * Gets the defer storage
     * @public
     * @returns {Object} Defer
     */
    get_defer: function() {
      return this._defer;
    },



    /**
     * JSJSAC JINGLE STORAGE SETTERS
     */

    /**
     * Sets the connection object
     * @public
     * @param {JSJaCConnection} Connection
     */
    set_connection: function(connection) {
      this._connection = connection;
    },

    /**
     * Sets the sessions storage
     * @public
     * @param {Object} sessions
     */
    set_sessions: function(sessions) {
      this._sessions = sessions;
    },

    /**
     * Sets the broadcast IDs storage
     * @public
     * @param {String} id
     * @param {Object} medias
     * @param {Boolean} [proceed_unset]
     */
    set_broadcast_ids: function(id, medias, proceed_unset) {
      this._broadcast_ids[id] = medias;

      if(proceed_unset === true && id in this._broadcast_ids)
        delete this._broadcast_ids[id];
    },

    /**
     * Sets the Single initiate function
     * @public
     * @param {Function} Single initiate
     */
    set_single_initiate: function(single_initiate) {
      this._single_initiate = single_initiate;
    },

    /**
     * Sets the Single propose function
     * @public
     * @param {Function} Single propose
     */
    set_single_propose: function(single_propose) {
      this._single_propose = single_propose;
    },

    /**
     * Sets the Single retract function
     * @public
     * @param {Function} Single retract
     */
    set_single_retract: function(single_retract) {
      this._single_retract = single_retract;
    },

    /**
     * Sets the Single accept function
     * @public
     * @param {Function} Single accept
     */
    set_single_accept: function(single_accept) {
      this._single_accept = single_accept;
    },

    /**
     * Sets the Single reject function
     * @public
     * @param {Function} Single reject
     */
    set_single_reject: function(single_reject) {
      this._single_reject = single_reject;
    },

    /**
     * Sets the Single proceed function
     * @public
     * @param {Function} Single proceed
     */
    set_single_proceed: function(single_proceed) {
      this._single_proceed = single_proceed;
    },

    /**
     * Sets the Muji invite function
     * @public
     * @param {Function} Muji invite
     */
    set_muji_invite: function(muji_invite) {
      this._muji_invite = muji_invite;
    },

    /**
     * Sets the debug interface
     * @public
     * @param {Object} Debug
     */
    set_debug: function(debug) {
      this._debug = debug;
    },

    /**
     * Sets the extdisco storage
     * @public
     * @param {Object} Extdisco
     */
    set_extdisco: function(extdisco) {
      this._extdisco = extdisco;
    },

    /**
     * Sets the fallback storage
     * @public
     * @param {Object} Fallback
     */
    set_fallback: function(fallback) {
      this._fallback = fallback;
    },

    /**
     * Sets the relay nodes storage
     * @public
     * @param {Object} Relay nodes
     */
    set_relaynodes: function(relaynodes) {
      this._relaynodes = relaynodes;
    },

    /**
     * Sets the defer storage
     * @public
     * @param {Object} Defer
     */
    set_defer: function(defer) {
      this._defer = defer;
    },
  }
))();

/**
 * @fileoverview JSJaC Jingle library - Utilities
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/utils */
/** @exports JSJaCJingleUtils */


/**
 * Utilities class.
 * @class
 * @classdesc  Utilities class.
 * @param      {JSJaCJingleSingle|JSJaCJingleMuji} parent Parent class.
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var JSJaCJingleUtils = ring.create(
  /** @lends JSJaCJingleUtils.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(parent) {
      /**
       * @constant
       * @member {JSJaCJingleSingle|JSJaCJingleMuji}
       * @readonly
       * @default
       * @public
       */
      this.parent = parent;
    },

    /**
     * Removes a given array value
     * @public
     * @param {Array} array
     * @param {*} value
     * @returns {Array} New array
     */
    array_remove_value: function(array, value) {
      try {
        var i;

        for(i = 0; i < array.length; i++) {
          if(array[i] === value) {
            array.splice(i, 1); i--;
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] array_remove_value > ' + e, 1);
      }

      return array;
    },

    /**
     * Returns whether an object is empty or not
     * @public
     * @param {Object} object
     * @returns {Number} Object length
     */
    object_length: function(object) {
      var key;
      var l = 0;

      try {
        for(key in object) {
          if(object.hasOwnProperty(key))  l++;
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] object_length > ' + e, 1);
      }

      return l;
    },

    /**
     * Returns whether given objects are equal or not
     * @public
     * @param {...Object} arguments - Objects to be compared
     * @returns {Boolean} Equality
     */
    object_equal: function() {
      var equal = true,
          last_value = null;

      if(arguments.length >= 1) {
        for(var i = 0; i < arguments.length; i++) {
          if(i > 0) {
            equal = (JSON.stringify(last_value) === JSON.stringify(arguments[i]));
            if(equal !== true)  break;
          }

          last_value = arguments[i];
        }
      } else {
        equal = false;
      }

      return equal;
    },

    /**
     * Collects given objects
     * @public
     * @param {...Object} arguments - Objects to be collected
     * @returns {Object} Collected object
     */
    object_collect: function() {
      var i, p;

      var collect_obj = {};

      for(i = 0; i < arguments.length; i++) {
        for(p in arguments[i]) {
          if(arguments[i].hasOwnProperty(p))
            collect_obj[p] = arguments[i][p];
        }
      }

      return collect_obj;
    },

    /**
     * Collects given arrays
     * @public
     * @param {...Array} arguments - Arrays to be collected
     * @returns {Array} Collected array
     */
    array_collect: function() {
      var i, j, p,
          cur_arr;

      var collect_arr = [];

      for(i = 0; i < arguments.length; i++) {
        cur_arr = arguments[i];

        loop_arr: for(j = 0; j < cur_arr.length; j++) {
          // Ensure uniqueness of object
          for(p in collect_arr) {
            if(this.object_equal(cur_arr[j], collect_arr[p]))  continue loop_arr;
          }

          collect_arr.push(cur_arr[j]);
        }
      }

      return collect_arr;
    },

    /**
     * Clones a given object
     * @public
     * @param {Object} object
     * @returns {Date|Array|Object} Cloned object
     */
    object_clone: function(object) {
      try {
        var copy, i, attr;

        // Assert
        if(object === null || typeof object !== 'object') return object;

        // Handle Date
        if(object instanceof Date) {
            copy = new Date();
            copy.setTime(object.getTime());

            return copy;
        }

        // Handle Array
        if(object instanceof Array) {
            copy = [];

            for(i = 0, len = object.length; i < len; i++)
              copy[i] = this.object_clone(object[i]);

            return copy;
        }

        // Handle Object
        if(object instanceof Object) {
            copy = {};

            for(attr in object) {
                if(object.hasOwnProperty(attr))
                  copy[attr] = this.object_clone(object[attr]);
            }

            return copy;
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] object_clone > ' + e, 1);
      }

      this.parent.get_debug().log('[JSJaCJingle:utils] object_clone > Cannot clone this object.', 1);
    },

    /**
     * Gets the browser info
     * @public
     * @returns {Object} Browser info
     */
    browser: function() {
      var browser_info = {
        name    : 'Generic'
      };

      try {
        var user_agent, detect_arr, cur_browser;

        detect_arr = {
          'firefox' : JSJAC_JINGLE_BROWSER_FIREFOX,
          'chrome'  : JSJAC_JINGLE_BROWSER_CHROME,
          'safari'  : JSJAC_JINGLE_BROWSER_SAFARI,
          'opera'   : JSJAC_JINGLE_BROWSER_OPERA,
          'msie'    : JSJAC_JINGLE_BROWSER_IE
        };

        user_agent = navigator.userAgent.toLowerCase();

        for(cur_browser in detect_arr) {
          if(user_agent.indexOf(cur_browser) > -1) {
            browser_info.name = detect_arr[cur_browser];
            break;
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] browser > ' + e, 1);
      }

      return browser_info;
    },

    /**
     * Gets the ICE config
     * @public
     * @returns {Object} ICE config
     */
    config_ice: function() {
      try {
        // Collect data (user + server)
        var stun_config = this.array_collect(
          this.parent.get_stun(),
          JSJaCJingleStorage.get_extdisco().stun,
          JSJaCJingleStorage.get_relaynodes().stun,
          JSJaCJingleStorage.get_fallback().stun
        );

        var turn_config = this.array_collect(
          this.parent.get_turn(),
          JSJaCJingleStorage.get_extdisco().turn,
          JSJaCJingleStorage.get_fallback().turn
        );

        // Can proceed?
        if(stun_config.length || turn_config.length) {
          var config = {
            iceServers : []
          };

          // STUN servers
          var i, cur_stun_obj, cur_stun_config;

          for(i in stun_config) {
            cur_stun_obj = stun_config[i];

            cur_stun_config = {};
            cur_stun_config.url = 'stun:' + cur_stun_obj.host;

            if(cur_stun_obj.port)
              cur_stun_config.url += ':' + cur_stun_obj.port;

            if(cur_stun_obj.transport && this.browser().name != JSJAC_JINGLE_BROWSER_FIREFOX)
              cur_stun_config.url += '?transport=' + cur_stun_obj.transport;

            (config.iceServers).push(cur_stun_config);
          }

          // TURN servers
          var j, cur_turn_obj, cur_turn_config;

          for(j in turn_config) {
            cur_turn_obj = turn_config[j];

            cur_turn_config = {};
            cur_turn_config.url = 'turn:' + cur_turn_obj.host;

            if(cur_turn_obj.port)
              cur_turn_config.url += ':' + cur_turn_obj.port;

            if(cur_turn_obj.transport)
              cur_turn_config.url += '?transport=' + cur_turn_obj.transport;

            if(cur_turn_obj.username)
              cur_turn_config.username = cur_turn_obj.username;

            if(cur_turn_obj.password)
              cur_turn_config.password = cur_turn_obj.password;

            (config.iceServers).push(cur_turn_config);
          }

          // Check we have at least a STUN server (if user can traverse NAT)
          var k;
          var has_stun = false;

          for(k in config.iceServers) {
            if((config.iceServers[k].url).match(R_NETWORK_PROTOCOLS.stun)) {
              has_stun = true; break;
            }
          }

          if(!has_stun) {
            (config.iceServers).push({
              url: (WEBRTC_CONFIGURATION.peer_connection.config.iceServers)[0].url
            });
          }

          return config;
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] config_ice > ' + e, 1);
      }

      return WEBRTC_CONFIGURATION.peer_connection.config;
    },

    /**
     * Gets the node value from a stanza element
     * @public
     * @param {DOM} stanza
     * @returns {String|Object} Node value
     */
    stanza_get_value: function(stanza) {
      try {
        return stanza.firstChild.nodeValue || null;
      } catch(e) {
        try {
          return (stanza[0]).firstChild.nodeValue || null;
        } catch(_e) {
          this.parent.get_debug().log('[JSJaCJingle:utils] stanza_get_value > ' + _e, 1);
        }
      }

      return null;
    },

    /**
     * Gets the attribute value from a stanza element
     * @public
     * @param {DOM} stanza
     * @param {String} name
     * @returns {String|Object} Attribute value
     */
    stanza_get_attribute: function(stanza, name) {
      if(!name) return null;

      try {
        return stanza.getAttribute(name) || null;
      } catch(e) {
        try {
          return (stanza[0]).getAttribute(name) || null;
        } catch(_e) {
          this.parent.get_debug().log('[JSJaCJingle:utils] stanza_get_attribute > ' + _e, 1);
        }
      }

      return null;
    },

    /**
     * Sets the attribute value to a stanza element
     * @public
     * @param {DOM} stanza
     * @param {String} name
     * @param {*} value
     */
    stanza_set_attribute: function(stanza, name, value) {
      if(!(name && value && stanza)) return;

      try {
        stanza.setAttribute(name, value);
      } catch(e) {
        try {
          (stanza[0]).setAttribute(name, value);
        } catch(_e) {
          this.parent.get_debug().log('[JSJaCJingle:utils] stanza_set_attribute > ' + _e, 1);
        }
      }
    },

    /**
     * Gets the Jingle node from a stanza
     * @public
     * @param {DOM} stanza
     * @param {String} name
     * @param {String} [ns]
     * @returns {DOM} Selected DOM elements
     */
    stanza_get_element: function(stanza, name, ns) {
      var matches_result = [];

      // Assert
      if(!stanza)        return matches_result;
      if(stanza.length)  stanza = stanza[0];

      ns = (ns || '*');

      try {
        var i;

        // Get only in lower level (not all sub-levels)
        var matches = stanza.getElementsByTagNameNS(ns, name);

        if(matches && matches.length) {
          for(i = 0; i < matches.length; i++) {
            if(matches[i] && matches[i].parentNode == stanza)
              matches_result.push(matches[i]);
          }
        }

        return matches_result;
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_get_element > ' + e, 1);
      }

      return matches_result;
    },

    /**
     * Gets the error node from a stanza
     * @private
     * @param {JSJaCPacket} stanza
     * @param {Object} [error_match_obj]
     * @returns {Boolean} Password invalid state
     */
    stanza_get_error: function(stanza, error_match_obj) {
      var matches_result = [];

      try {
        var i,
            error_child, cur_error_child;

        error_child = stanza.getChild('error', NS_CLIENT);

        if(error_child && error_child.length) {
          for(i = 0; i < error_child.length; i++) {
            cur_error_child = error_child[i];

            if(typeof error_match_obj == 'object') {
              if(cur_error_child.getAttribute('type') === error_match_obj.type  &&
                 cur_error_child.getChild(error_match_obj.xmpp, NS_IETF_XMPP_STANZAS)) {
                matches_result.push(cur_error_child);
              }
            } else {
              matches_result.push(cur_error_child);
            }
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:utils] stanza_get_error > ' + e, 1);
      }

      return matches_result;
    },

    /**
     * Gets the Jingle node from a stanza
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {DOM|Object} Jingle node
     */
    stanza_jingle: function(stanza) {
      try {
        return stanza.getChild('jingle', this.parent.get_namespace());
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_jingle > ' + e, 1);
      }

      return null;
    },

    /**
     * Gets the Jingle Muji node from a stanza
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {DOM|Object} Jingle node
     */
    stanza_muji: function(stanza) {
      try {
        return stanza.getChild('muji', NS_MUJI);
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_muji > ' + e, 1);
      }

      return null;
    },

    /**
     * Gets the from value from a stanza
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {String|Object} From value
     */
    stanza_from: function(stanza) {
      try {
        return stanza.getFrom() || null;
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_from > ' + e, 1);
      }

      return null;
    },

    /**
     * Extracts username from stanza
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {String|Object} Username
     */
    stanza_username: function(stanza) {
      try {
        return this.extract_username(stanza.getFrom());
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_username > ' + e, 1);
      }

      return null;
    },

    /**
     * Gets the SID value from a stanza
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {String|Object} SID value
     */
    stanza_sid: function(stanza) {
      try {
        return this.stanza_get_attribute(
          this.stanza_jingle(stanza),
          'sid'
        );
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_sid > ' + e, 1);
      }
    },

    /**
     * Checks if a stanza is safe (known SID + sender)
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Safety state
     */
    stanza_safe: function(stanza) {
      try {
        return !((stanza.getType() == JSJAC_JINGLE_IQ_TYPE_SET && this.stanza_sid(stanza) != this.parent.get_sid()) || this.stanza_from(stanza) != this.parent.get_to());
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_safe > ' + e, 1);
      }

      return false;
    },

    /**
     * Gets a stanza terminate reason
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {String|Object} Reason code
     */
    stanza_terminate_reason: function(stanza) {
      try {
        var jingle = this.stanza_jingle(stanza);

        if(jingle) {
          var reason = this.stanza_get_element(jingle, 'reason', this.parent.get_namespace());

          if(reason.length) {
            var cur_reason;

            for(cur_reason in JSJAC_JINGLE_REASONS) {
              if(this.stanza_get_element(reason[0], cur_reason, this.parent.get_namespace()).length)
                return cur_reason;
            }
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_terminate_reason > ' + e, 1);
      }

      return null;
    },

    /**
     * Gets a stanza session info
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {String|Object} Info code
     */
    stanza_session_info: function(stanza) {
      try {
        var jingle = this.stanza_jingle(stanza);

        if(jingle) {
          var cur_info;

          for(cur_info in JSJAC_JINGLE_SESSION_INFOS) {
            if(this.stanza_get_element(jingle, cur_info, NS_JINGLE_APPS_RTP_INFO).length)
              return cur_info;
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_session_info > ' + e, 1);
      }

      return null;
    },

    /**
     * Set a timeout limit to a stanza
     * @public
     * @param {String} t_type
     * @param {String} t_id
     * @param {Object} [handlers]
     */
    stanza_timeout: function(t_node, t_type, t_id, handlers) {
      try {
        var t_sid = this.parent.get_sid();
        var t_status = this.parent.get_status();

        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Registered (node: ' + t_node + ', type: ' + t_type + ', id: ' + t_id + ', status: ' + t_status + ').', 4);

        var _this = this;

        setTimeout(function() {
          _this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Cheking (node: ' + t_node + ', type: ' + t_type + ', id: ' + t_id + ', status: ' + t_status + '-' + _this.parent.get_status() + ').', 4);

          // State did not change?
          if(_this.parent.get_sid() == t_sid && _this.parent.get_status() == t_status && !(t_id in _this.parent.get_received_id())) {
            _this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Stanza timeout.', 2);

            _this.parent.unregister_handler(t_node, t_type, t_id);

            if(typeof handlers == 'object') {
              if(handlers.external)  (handlers.external)(_this);
              if(handlers.internal)  (handlers.internal)();
            }
          } else {
            _this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Stanza successful.', 4);
          }
        }, (JSJAC_JINGLE_STANZA_TIMEOUT * 1000));
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > ' + e, 1);
      }
    },

    /**
     * Parses stanza node
     * @public
     * @param {DOM} parent
     * @param {String} name
     * @param {String} ns
     * @param {Object} obj
     * @param {Array} attrs
     * @param {Object} [value]
     */
    stanza_parse_node: function(parent, name, ns, obj, attrs, value) {
      try {
        var i, j,
            error, child, child_arr;
        var children = this.stanza_get_element(parent, name, ns);

        if(children.length) {
          for(i = 0; i < children.length; i++) {
            // Initialize
            error = 0;
            child = children[i];
            child_arr = {};

            // Parse attributes
            for(j in attrs) {
              child_arr[attrs[j].n] = this.stanza_get_attribute(child, attrs[j].n);

              if(attrs[j].r && !child_arr[attrs[j].n]) {
                error++; break;
              }
            }

            // Parse value
            if(value) {
              child_arr[value.n] = this.stanza_get_value(child);
              if(value.r && !child_arr[value.n])  error++;
            }

            if(error !== 0) continue;

            // Push current children
            obj.push(child_arr);
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_node > ' + e, 1);
      }
    },

    /**
     * Parses stanza content
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Success
     */
    stanza_parse_content: function(stanza) {
      try {
        var i,
            jingle, namespace, content, cur_content,
            content_creator, content_name, content_senders,
            cur_candidates;

        // Parse initiate stanza
        switch(stanza.name) {
          case JSJAC_JINGLE_STANZA_IQ:
            // Jingle elements are encapsulated into IQs
            jingle = this.stanza_jingle(stanza); break;

          case JSJAC_JINGLE_STANZA_PRESENCE:
            // Muji elements are encapsulated into Presences
            jingle = this.stanza_muji(stanza); break;

          default:
            throw 'Stanza is not Jingle, nor Muji.';
        }

        if(jingle) {
          // Childs
          content = this.stanza_get_element(jingle, 'content', this.parent.get_namespace());

          if(content && content.length) {
            for(i = 0; i < content.length; i++) {
              cur_content = content[i];

              // Attrs (avoids senders & creators to be changed later in the flow)
              content_name    = this.stanza_get_attribute(cur_content, 'name');
              content_senders = this.parent.get_senders(content_name) || this.stanza_get_attribute(cur_content, 'senders');
              content_creator = this.parent.get_creator(content_name) || this.stanza_get_attribute(cur_content, 'creator');

              this.parent._set_name(content_name);
              this.parent._set_senders(content_name, content_senders);
              this.parent._set_creator(content_name, content_creator);

              // Payloads (non-destructive setters / cumulative)
              this.parent._set_payloads_remote_add(
                content_name,
                this.stanza_parse_payload(cur_content)
              );

              // Candidates (enqueue them for ICE processing, too)
              cur_candidate = this.stanza_parse_candidate(cur_content);

              this.parent._set_candidates_remote_add(
                content_name,
                cur_candidate
              );

              this.parent._set_candidates_queue_remote(
                content_name,
                cur_candidate
              );
            }

            return true;
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_content > ' + e, 1);
      }

      return false;
    },

    /**
     * Parses stanza group
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Success
     */
    stanza_parse_group: function(stanza) {
      try {
        var i, j,
            jingle,
            group, cur_group,
            content, cur_content, group_content_names;

        // Parse initiate stanza
        jingle = this.stanza_jingle(stanza);

        if(jingle) {
          // Childs
          group = this.stanza_get_element(jingle, 'group', NS_JINGLE_APPS_GROUPING);

          if(group && group.length) {
            for(i = 0; i < group.length; i++) {
              cur_group = group[i];
              group_content_names = [];

              // Attrs
              group_semantics = this.stanza_get_attribute(cur_group, 'semantics');

              // Contents
              content = this.stanza_get_element(cur_group, 'content', NS_JINGLE_APPS_GROUPING);

              for(j = 0; j < content.length; j++) {
                cur_content = content[j];

                // Content attrs
                group_content_names.push(
                  this.stanza_get_attribute(cur_content, 'name')
                );
              }

              // Payloads (non-destructive setters / cumulative)
              this.parent._set_group_remote(
                group_semantics,
                group_content_names
              );
            }
          }
        }

        return true;
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_group > ' + e, 1);
      }

      return false;
    },

    /**
     * Parses stanza payload
     * @public
     * @param {DOM} stanza_content
     * @returns {Object} Payload object
     */
    stanza_parse_payload: function(stanza_content) {
      var payload_obj = {
        descriptions : {},
        transports   : {}
      };

      try {
        // Common vars
        var j, k, l, error,
            cur_ssrc, cur_ssrc_id,
            cur_ssrc_group, cur_ssrc_group_semantics,
            cur_payload, cur_payload_arr, cur_payload_id;

        // Common functions
        var init_content = function() {
          var ic_key;
          var ic_arr = {
            'attrs'      : {},
            'rtcp-fb'    : [],
            'bandwidth'  : [],
            'payload'    : {},
            'rtp-hdrext' : [],
            'rtcp-mux'   : 0,

            'encryption' : {
              'attrs'     : {},
              'crypto'    : [],
              'zrtp-hash' : []
            },

            'ssrc': {},
            'ssrc-group': {}
          };

          for(ic_key in ic_arr)
            if(!(ic_key in payload_obj.descriptions))  payload_obj.descriptions[ic_key] = ic_arr[ic_key];
        };

        var init_payload = function(id) {
          var ip_key;
          var ip_arr = {
            'attrs'           : {},
            'parameter'       : [],
            'rtcp-fb'         : [],
            'rtcp-fb-trr-int' : []
          };

          if(!(id in payload_obj.descriptions.payload))  payload_obj.descriptions.payload[id] = {};

          for(ip_key in ip_arr)
            if(!(ip_key in payload_obj.descriptions.payload[id]))  payload_obj.descriptions.payload[id][ip_key] = ip_arr[ip_key];
        };

        var init_ssrc_group_semantics = function(semantics) {
          if(typeof payload_obj.descriptions['ssrc-group'][semantics] != 'object')
            payload_obj.descriptions['ssrc-group'][semantics] = [];
        };

        // Parse session description
        var description = this.stanza_get_element(stanza_content, 'description', NS_JINGLE_APPS_RTP);

        if(description.length) {
          description = description[0];

          var cd_media = this.stanza_get_attribute(description, 'media');
          var cd_ssrc  = this.stanza_get_attribute(description, 'ssrc');

          if(!cd_media)
            this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_payload > No media attribute to ' + cc_name + ' stanza.', 1);

          // Initialize current description
          init_content();

          payload_obj.descriptions.attrs.media = cd_media;
          payload_obj.descriptions.attrs.ssrc  = cd_ssrc;

          // Loop on multiple payloads
          var payload = this.stanza_get_element(description, 'payload-type', NS_JINGLE_APPS_RTP);

          if(payload.length) {
            for(j = 0; j < payload.length; j++) {
              error           = 0;
              cur_payload     = payload[j];
              cur_payload_arr = {};

              cur_payload_arr.channels  = this.stanza_get_attribute(cur_payload, 'channels');
              cur_payload_arr.clockrate = this.stanza_get_attribute(cur_payload, 'clockrate');
              cur_payload_arr.id        = this.stanza_get_attribute(cur_payload, 'id') || error++;
              cur_payload_arr.name      = this.stanza_get_attribute(cur_payload, 'name');

              payload_obj.descriptions.attrs.ptime     = this.stanza_get_attribute(cur_payload, 'ptime');
              payload_obj.descriptions.attrs.maxptime  = this.stanza_get_attribute(cur_payload, 'maxptime');

              if(error !== 0) continue;

              // Initialize current payload
              cur_payload_id = cur_payload_arr.id;
              init_payload(cur_payload_id);

              // Push current payload
              payload_obj.descriptions.payload[cur_payload_id].attrs = cur_payload_arr;

              // Loop on multiple parameters
              this.stanza_parse_node(
                cur_payload,
                'parameter',
                NS_JINGLE_APPS_RTP,
                payload_obj.descriptions.payload[cur_payload_id].parameter,
                [ { n: 'name', r: 1 }, { n: 'value', r: 0 } ]
              );

              // Loop on multiple RTCP-FB
              this.stanza_parse_node(
                cur_payload,
                'rtcp-fb',
                NS_JINGLE_APPS_RTP_RTCP_FB,
                payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb'],
                [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
              );

              // Loop on multiple RTCP-FB-TRR-INT
              this.stanza_parse_node(
                cur_payload,
                'rtcp-fb-trr-int',
                NS_JINGLE_APPS_RTP_RTCP_FB,
                payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb-trr-int'],
                [ { n: 'value', r: 1 } ]
              );
            }
          }

          // Parse the encryption element
          var encryption = this.stanza_get_element(description, 'encryption', NS_JINGLE_APPS_RTP);

          if(encryption.length) {
            encryption = encryption[0];

            payload_obj.descriptions.encryption.attrs.required = this.stanza_get_attribute(encryption, 'required') || '0';

            // Loop on multiple cryptos
            this.stanza_parse_node(
              encryption,
              'crypto',
              NS_JINGLE_APPS_RTP,
              payload_obj.descriptions.encryption.crypto,
              [ { n: 'crypto-suite', r: 1 }, { n: 'key-params', r: 1 }, { n: 'session-params', r: 0 }, { n: 'tag', r: 1 } ]
            );

            // Loop on multiple zrtp-hash
            this.stanza_parse_node(
              encryption,
              'zrtp-hash',
              NS_JINGLE_APPS_RTP_ZRTP,
              payload_obj.descriptions.encryption['zrtp-hash'],
              [ { n: 'version', r: 1 } ],
              { n: 'value', r: 1 }
            );
          }

          // Parse the SSRC-GROUP elements
          var ssrc_group = this.stanza_get_element(description, 'ssrc-group', NS_JINGLE_APPS_RTP_SSMA);

          if(ssrc_group && ssrc_group.length) {
            for(k = 0; k < ssrc_group.length; k++) {
              cur_ssrc_group = ssrc_group[k];
              cur_ssrc_group_semantics = this.stanza_get_attribute(cur_ssrc_group, 'semantics') || null;

              if(cur_ssrc_group_semantics !== null) {
                cur_ssrc_group_semantics_obj = {
                  'sources': []
                };

                init_ssrc_group_semantics(cur_ssrc_group_semantics);

                this.stanza_parse_node(
                  cur_ssrc_group,
                  'source',
                  NS_JINGLE_APPS_RTP_SSMA,
                  cur_ssrc_group_semantics_obj.sources,
                  [ { n: 'ssrc', r: 1 } ]
                );

                payload_obj.descriptions['ssrc-group'][cur_ssrc_group_semantics].push(cur_ssrc_group_semantics_obj);
              }
            }
          }

          // Parse the SSRC (source) elements
          var ssrc = this.stanza_get_element(description, 'source', NS_JINGLE_APPS_RTP_SSMA);

          if(ssrc && ssrc.length) {
            for(l = 0; l < ssrc.length; l++) {
              cur_ssrc = ssrc[l];
              cur_ssrc_id = this.stanza_get_attribute(cur_ssrc, 'ssrc') || null;

              if(cur_ssrc_id !== null) {
                payload_obj.descriptions.ssrc[cur_ssrc_id] = [];

                this.stanza_parse_node(
                  cur_ssrc,
                  'parameter',
                  NS_JINGLE_APPS_RTP_SSMA,
                  payload_obj.descriptions.ssrc[cur_ssrc_id],
                  [ { n: 'name', r: 1 }, { n: 'value', r: 0 } ]
                );
              }
            }
          }

          // Loop on common RTCP-FB
          this.stanza_parse_node(
            description,
            'rtcp-fb',
            NS_JINGLE_APPS_RTP_RTCP_FB,
            payload_obj.descriptions['rtcp-fb'],
            [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
          );

          // Loop on bandwidth
          this.stanza_parse_node(
            description,
            'bandwidth',
            NS_JINGLE_APPS_RTP,
            payload_obj.descriptions.bandwidth,
            [ { n: 'type', r: 1 } ],
            { n: 'value', r: 1 }
          );

          // Parse the RTP-HDREXT element
          this.stanza_parse_node(
            description,
            'rtp-hdrext',
            NS_JINGLE_APPS_RTP_RTP_HDREXT,
            payload_obj.descriptions['rtp-hdrext'],
            [ { n: 'id', r: 1 }, { n: 'uri', r: 1 }, { n: 'senders', r: 0 } ]
          );

          // Parse the RTCP-MUX element
          var rtcp_mux = this.stanza_get_element(description, 'rtcp-mux', NS_JINGLE_APPS_RTP);

          if(rtcp_mux.length) {
            payload_obj.descriptions['rtcp-mux'] = 1;
          }
        }

        // Parse transport (need to get 'ufrag' and 'pwd' there)
        var transport = this.stanza_get_element(stanza_content, 'transport', NS_JINGLE_TRANSPORTS_ICEUDP);

        if(transport.length) {
          payload_obj.transports.pwd          = this.stanza_get_attribute(transport, 'pwd');
          payload_obj.transports.ufrag        = this.stanza_get_attribute(transport, 'ufrag');

          var fingerprint = this.stanza_get_element(transport, 'fingerprint', NS_JINGLE_APPS_DTLS);

          if(fingerprint.length) {
            payload_obj.transports.fingerprint       = {};
            payload_obj.transports.fingerprint.setup = this.stanza_get_attribute(fingerprint, 'setup');
            payload_obj.transports.fingerprint.hash  = this.stanza_get_attribute(fingerprint, 'hash');
            payload_obj.transports.fingerprint.value = this.stanza_get_value(fingerprint);
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_payload > ' + e, 1);
      }

      return payload_obj;
    },

    /**
     * Parses stanza candidate
     * @public
     * @param {Array} Candidates array
     */
    stanza_parse_candidate: function(stanza_content) {
      var candidate_arr = [];

      try {
        var _this = this;

        var fn_parse_transport = function(namespace, parse_obj) {
          var transport = _this.stanza_get_element(stanza_content, 'transport', namespace);

          if(transport.length) {
            _this.stanza_parse_node(
              transport,
              'candidate',
              namespace,
              candidate_arr,
              parse_obj
            );
          }
        };

        // Parse ICE-UDP transport candidates
        fn_parse_transport(
          NS_JINGLE_TRANSPORTS_ICEUDP,
          JSJAC_JINGLE_SDP_CANDIDATE_MAP_ICEUDP
        );

        // Parse RAW-UDP transport candidates
        fn_parse_transport(
          NS_JINGLE_TRANSPORTS_RAWUDP,
          JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP
        );
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_candidate > ' + e, 1);
      }

      return candidate_arr;
    },

    /*
     * Builds stanza node
     * @param {JSJaCPacket} doc
     * @param {DOM} parent
     * @param {Array} children
     * @param {String} name
     * @param {String} ns
     * @param {String} [value]
     * @returns {DOM} Built node
     */
    stanza_build_node: function(doc, parent, children, name, ns, value) {
      var node = null;

      try {
        var i, child, attr;

        if(children && children.length) {
          for(i in children) {
            child = children[i];

            if(!child) continue;

            node = parent.appendChild(doc.buildNode(
              name,
              { 'xmlns': ns },
              (value && child[value]) ? child[value] : null
            ));

            for(attr in child)
              if(attr != value)  this.stanza_set_attribute(node, attr, child[attr]);
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_build_node > name: ' + name + ' > ' + e, 1);
      }

      return node;
    },

    /**
     * Generates stanza Jingle node
     * @public
     * @param {JSJaCPacket} stanza
     * @param {Object} attrs
     * @returns {DOM} Jingle node
     */
    stanza_generate_jingle: function(stanza, attrs) {
      var jingle = null;

      try {
        var cur_attr;

        jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', { 'xmlns': this.parent.get_namespace() }));

        if(!attrs.sid) attrs.sid = this.parent.get_sid();

        for(cur_attr in attrs) this.stanza_set_attribute(jingle, cur_attr, attrs[cur_attr]);
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_jingle > ' + e, 1);
      }

      return jingle;
    },

    /**
     * Generates stanza Muji node
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {DOM} Muji node
     */
    stanza_generate_muji: function(stanza) {
      var muji = null;

      try {
        muji = stanza.getNode().appendChild(stanza.buildNode('muji', { 'xmlns': NS_MUJI }));
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_muji > ' + e, 1);
      }

      return muji;
    },

    /**
     * Generates stanza session info
     * @public
     * @param {JSJaCPacket} stanza
     * @param {DOM} jingle
     * @param {Object} args
     */
    stanza_generate_session_info: function(stanza, jingle, args) {
      try {
        var info = jingle.appendChild(stanza.buildNode(args.info, { 'xmlns': NS_JINGLE_APPS_RTP_INFO }));

        // Info attributes
        switch(args.info) {
          case JSJAC_JINGLE_SESSION_INFO_MUTE:
          case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
            this.stanza_set_attribute(info, 'creator', this.parent.get_creator_this());
            this.stanza_set_attribute(info, 'name',    args.name);

            break;
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_session_info > ' + e, 1);
      }
    },

    /**
     * Generates stanza local content
     * @public
     * @param {JSJaCPacket} stanza
     * @param {DOM} jingle
     * @param {Boolean} has_transport
     * @param {Object} [override_content]
     */
    stanza_generate_content_local: function(stanza, jingle, has_transport, override_content) {
      try {
        var cur_media;
        var content_local = override_content ? override_content : this.parent.get_content_local();

        var _this = this;

        var fn_build_transport = function(content, transport_obj, namespace) {
          var transport = _this.stanza_build_node(
            stanza,
            content,
            [transport_obj.attrs],
            'transport',
            namespace
          );

          // Fingerprint
          _this.stanza_build_node(
            stanza,
            transport,
            [transport_obj.fingerprint],
            'fingerprint',
            NS_JINGLE_APPS_DTLS,
            'value'
          );

          // Candidates
          _this.stanza_build_node(
            stanza,
            transport,
            transport_obj.candidate,
            'candidate',
            namespace
          );
        };

        for(cur_media in content_local) {
          var cur_content = content_local[cur_media];

          var content = jingle.appendChild(stanza.buildNode('content', { 'xmlns': this.parent.get_namespace() }));

          this.stanza_set_attribute(content, 'creator', cur_content.creator);
          this.stanza_set_attribute(content, 'name',    cur_content.name);
          this.stanza_set_attribute(content, 'senders', cur_content.senders);

          // Build description (if action type allows that element)
          if(this.stanza_get_attribute(jingle, 'action') != JSJAC_JINGLE_ACTION_TRANSPORT_INFO) {
            var cs_description  = cur_content.description;
            var cs_d_attrs      = cs_description.attrs;
            var cs_d_rtcp_fb    = cs_description['rtcp-fb'];
            var cs_d_bandwidth  = cs_description.bandwidth;
            var cs_d_payload    = cs_description.payload;
            var cs_d_encryption = cs_description.encryption;
            var cs_d_ssrc       = cs_description.ssrc;
            var cs_d_ssrc_group = cs_description['ssrc-group'];
            var cs_d_rtp_hdrext = cs_description['rtp-hdrext'];
            var cs_d_rtcp_mux   = cs_description['rtcp-mux'];

            var description = this.stanza_build_node(
                                stanza, content,
                                [cs_d_attrs],
                                'description',
                                NS_JINGLE_APPS_RTP
                              );

            // Payload-type
            if(cs_d_payload) {
              var i, j,
                  cur_ssrc_id,
                  cur_cs_d_ssrc_group_semantics, cur_cs_d_ssrc_group_semantics_sub,
                  cs_d_p, payload_type;

              for(i in cs_d_payload) {
                cs_d_p = cs_d_payload[i];

                payload_type = this.stanza_build_node(
                  stanza,
                  description,
                  [cs_d_p.attrs],
                  'payload-type',
                  NS_JINGLE_APPS_RTP
                );

                // Parameter
                this.stanza_build_node(
                  stanza,
                  payload_type,
                  cs_d_p.parameter,
                  'parameter',
                  NS_JINGLE_APPS_RTP
                );

                // RTCP-FB (sub)
                this.stanza_build_node(
                  stanza,
                  payload_type,
                  cs_d_p['rtcp-fb'],
                  'rtcp-fb',
                  NS_JINGLE_APPS_RTP_RTCP_FB
                );

                // RTCP-FB-TRR-INT
                this.stanza_build_node(
                  stanza,
                  payload_type,
                  cs_d_p['rtcp-fb-trr-int'],
                  'rtcp-fb-trr-int',
                  NS_JINGLE_APPS_RTP_RTCP_FB
                );
              }

              // SSRC-GROUP
              if(cs_d_ssrc_group) {
                for(cur_cs_d_ssrc_group_semantics in cs_d_ssrc_group) {
                  for(j in cs_d_ssrc_group[cur_cs_d_ssrc_group_semantics]) {
                    cur_cs_d_ssrc_group_semantics_sub = cs_d_ssrc_group[cur_cs_d_ssrc_group_semantics][j];

                    if(cur_cs_d_ssrc_group_semantics_sub !== undefined) {
                      var ssrc_group = description.appendChild(stanza.buildNode('ssrc-group', {
                        'semantics': cur_cs_d_ssrc_group_semantics,
                        'xmlns': NS_JINGLE_APPS_RTP_SSMA
                      }));

                      this.stanza_build_node(
                        stanza,
                        ssrc_group,
                        cur_cs_d_ssrc_group_semantics_sub.sources,
                        'source',
                        NS_JINGLE_APPS_RTP_SSMA
                      );
                    }
                  }
                }
              }

              // SSRC
              if(cs_d_ssrc) {
                for(cur_ssrc_id in cs_d_ssrc) {
                  var ssrc = description.appendChild(stanza.buildNode('source', {
                    'ssrc': cur_ssrc_id,
                    'xmlns': NS_JINGLE_APPS_RTP_SSMA
                  }));

                  this.stanza_build_node(
                    stanza,
                    ssrc,
                    cs_d_ssrc[cur_ssrc_id],
                    'parameter',
                    NS_JINGLE_APPS_RTP_SSMA
                  );
                }
              }

              // Encryption?
              if(has_transport === true) {
                if(cs_d_encryption &&
                   (cs_d_encryption.crypto && cs_d_encryption.crypto.length ||
                    cs_d_encryption['zrtp-hash'] && cs_d_encryption['zrtp-hash'].length)) {
                  var encryption = description.appendChild(stanza.buildNode('encryption', { 'xmlns': NS_JINGLE_APPS_RTP }));

                  this.stanza_set_attribute(encryption, 'required', (cs_d_encryption.attrs.required || '0'));

                  // Crypto
                  this.stanza_build_node(
                    stanza,
                    encryption,
                    cs_d_encryption.crypto,
                    'crypto',
                    NS_JINGLE_APPS_RTP
                  );

                  // ZRTP-HASH
                  this.stanza_build_node(
                    stanza,
                    encryption,
                    cs_d_encryption['zrtp-hash'],
                    'zrtp-hash',
                    NS_JINGLE_APPS_RTP_ZRTP,
                    'value'
                  );
                }
              }

              // RTCP-FB (common)
              this.stanza_build_node(
                stanza,
                description,
                cs_d_rtcp_fb,
                'rtcp-fb',
                NS_JINGLE_APPS_RTP_RTCP_FB
              );

              // Bandwidth
              this.stanza_build_node(
                stanza,
                description,
                cs_d_bandwidth,
                'bandwidth',
                NS_JINGLE_APPS_RTP,
                'value'
              );

              // RTP-HDREXT
              this.stanza_build_node(
                stanza,
                description,
                cs_d_rtp_hdrext,
                'rtp-hdrext',
                NS_JINGLE_APPS_RTP_RTP_HDREXT
              );

              // RTCP-MUX
              if(cs_d_rtcp_mux)
                description.appendChild(stanza.buildNode('rtcp-mux', { 'xmlns': NS_JINGLE_APPS_RTP }));
            }
          }

          // Build transport?
          if(has_transport === true) {
            var cs_transport = this.generate_transport(cur_content.transport);

            // Transport candidates: ICE-UDP
            if((cs_transport.ice.candidate).length > 0) {
              fn_build_transport(
                content,
                cs_transport.ice,
                NS_JINGLE_TRANSPORTS_ICEUDP
              );
            }

            // Transport candidates: RAW-UDP
            if((cs_transport.raw.candidate).length > 0) {
              fn_build_transport(
                content,
                cs_transport.raw,
                NS_JINGLE_TRANSPORTS_RAWUDP
              );
            }
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_content_local > ' + e, 1);
      }
    },

    /**
     * Generates stanza local group
     * @public
     * @param {JSJaCPacket} stanza
     * @param {DOM} jingle
     */
    stanza_generate_group_local: function(stanza, jingle) {
      try {
        var i,
            cur_semantics, cur_group, cur_group_name,
            group;

        var group_local = this.parent.get_group_local();

        for(cur_semantics in group_local) {
          cur_group = group_local[cur_semantics];

          group = jingle.appendChild(stanza.buildNode('group', {
            'xmlns': NS_JINGLE_APPS_GROUPING,
            'semantics': cur_semantics
          }));

          for(i in cur_group) {
            cur_group_name = cur_group[i];

            group.appendChild(stanza.buildNode('content', {
              'xmlns': NS_JINGLE_APPS_GROUPING,
              'name': cur_group_name
            }));
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_group_local > ' + e, 1);
      }
    },

    /**
     * Generates content
     * @public
     * @param {String} creator
     * @param {String} name
     * @param {Object} senders
     * @param {Object} payloads
     * @param {Object} transports
     * @returns {Object} Content object
     */
    generate_content: function(creator, name, senders, payloads, transports) {
      var content_obj = {};

      try {
        // Generation process
        content_obj.creator     = creator;
        content_obj.name        = name;
        content_obj.senders     = senders;
        content_obj.description = {};
        content_obj.transport   = {};

        // Generate description
        var i;
        var description_cpy      = this.object_clone(payloads.descriptions);
        var description_ptime    = description_cpy.attrs.ptime;
        var description_maxptime = description_cpy.attrs.maxptime;

        if(description_ptime)     delete description_cpy.attrs.ptime;
        if(description_maxptime)  delete description_cpy.attrs.maxptime;

        for(i in description_cpy.payload) {
          if(!('attrs' in description_cpy.payload[i]))
            description_cpy.payload[i].attrs        = {};

          description_cpy.payload[i].attrs.ptime    = description_ptime;
          description_cpy.payload[i].attrs.maxptime = description_maxptime;
        }

        content_obj.description = description_cpy;

        // Generate transport
        content_obj.transport.candidate   = transports;
        content_obj.transport.attrs       = {};
        content_obj.transport.attrs.pwd   = payloads.transports ? payloads.transports.pwd   : null;
        content_obj.transport.attrs.ufrag = payloads.transports ? payloads.transports.ufrag : null;

        if(payloads.transports && payloads.transports.fingerprint)
          content_obj.transport.fingerprint = payloads.transports.fingerprint;
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] generate_content > ' + e, 1);
      }

      return content_obj;
    },

    /**
     * Generates transport
     * @public
     * @param {Object} transport_init_obj
     * @returns {Object} Transport object
     */
    generate_transport: function(transport_init_obj) {
      var transport_obj = {
        'ice': {},
        'raw': {}
      };

      try {
        var i, j, k,
            cur_attr,
            cur_candidate, cur_transport;

        // Reduce RAW-UDP map object for simpler search
        var rawudp_map = {};
        for(i in JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP) {
          rawudp_map[JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP[i].n] = 1;
        }

        var fn_init_obj = function(transport_sub_obj) {
          transport_sub_obj.attrs = transport_init_obj.attrs;
          transport_sub_obj.fingerprint = transport_init_obj.fingerprint;
          transport_sub_obj.candidate = [];
        };

        for(j in transport_obj)
          fn_init_obj(transport_obj[j]);

        // Nest candidates in their category
        for(k = 0; k < (transport_init_obj.candidate).length; k++) {
          cur_candidate = this.object_clone(transport_init_obj.candidate[k]);

          if(cur_candidate.type in JSJAC_JINGLE_SDP_CANDIDATE_TYPES) {
            // Remove attributes that are not required by RAW-UDP (XEP-0177 compliance)
            if(JSJAC_JINGLE_SDP_CANDIDATE_TYPES[cur_candidate.type] === JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW) {
              for(cur_attr in cur_candidate) {
                if(typeof rawudp_map[cur_attr] == 'undefined')
                  delete cur_candidate[cur_attr];
              }
            }

            cur_transport = transport_obj[JSJAC_JINGLE_SDP_CANDIDATE_TYPES[cur_candidate.type]];
            cur_transport.candidate.push(cur_candidate);
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] generate_transport > ' + e, 1);
      }

      return transport_obj;
    },

    /**
     * Builds local content
     * @public
     */
    build_content_local: function() {
      try {
        var cur_name;

        for(cur_name in this.parent.get_name()) {
          this.parent._set_content_local(
            cur_name,

            this.generate_content(
              JSJAC_JINGLE_SENDERS_INITIATOR.jingle,
              cur_name,
              this.parent.get_senders(cur_name),
              this.parent.get_payloads_local(cur_name),
              this.parent.get_candidates_local(cur_name)
            )
          );
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] build_content_local > ' + e, 1);
      }
    },

    /**
     * Builds remote content
     * @public
     */
    build_content_remote: function() {
      try {
        var cur_name;

        for(cur_name in this.parent.get_name()) {
          this.parent._set_content_remote(
            cur_name,

            this.generate_content(
              this.parent.get_creator(cur_name),
              cur_name,
              this.parent.get_senders(cur_name),
              this.parent.get_payloads_remote(cur_name),
              this.parent.get_candidates_remote(cur_name)
            )
          );
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] build_content_remote > ' + e, 1);
      }
    },

    /**
     * Generates media name
     * @public
     * @param {String} media
     * @returns {String} Media name
     */
    name_generate: function(media) {
      var name = null;

      try {
        var i, cur_name;

        var content_all = [];

        // Push remote contents
        var cur_participant, participants,
            content_remote = {};

        if(typeof this.parent.get_content_remote == 'function')
          content_remote = this.parent.get_content_remote();

        for(cur_participant in content_remote) {
          content_all.push(
            content_remote[cur_participant]
          );
        }

        // Push local content
        content_all.push(
          this.parent.get_content_local()
        );

        for(i in content_all) {
          for(cur_name in content_all[i]) {
            try {
              if(content_all[i][cur_name].description.attrs.media === media) {
                name = cur_name; break;
              }
            } catch(e) {}
          }

          if(name) break;
        }

        if(!name) name = media;
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] name_generate > ' + e, 1);
      }

      return name;
    },

    /**
     * Generates media
     * @public
     * @param {String} name
     * @returns {String} Media
     */
    media_generate: function(name) {
      var cur_media;
      var media = null;

      try {
        if(typeof name == 'number') {
          for(cur_media in JSJAC_JINGLE_MEDIAS) {
            if(name == parseInt(JSJAC_JINGLE_MEDIAS[cur_media].label, 10)) {
              media = cur_media; break;
            }
          }
        } else {
          for(cur_media in JSJAC_JINGLE_MEDIAS) {
            if(name == this.name_generate(cur_media)) {
              media = cur_media; break;
            }
          }
        }

        if(!media)  media = name;
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] media_generate > ' + e, 1);
      }

      return media;
    },

    /**
     * Generates a MD5 hash from the given value
     * @public
     * @param {String} value
     * @returns {String} MD5 hash value
     */
    generate_hash_md5: function(value) {
      return hex_md5(value);
    },

    /**
     * Generates a random value
     * @public
     * @param {Number} i
     * @returns {String} Random value
     */
    generate_random: function(i) {
      return JSJaCUtils.cnonce(i);
    },

    /**
     * Generates a random SID value
     * @public
     * @returns {String} SID value
     */
    generate_sid: function() {
      return this.generate_random(16);
    },

    /**
     * Generates a random IID value
     * @public
     * @returns {String} IID value
     */
    generate_iid: function() {
      return this.generate_random(24);
    },

    /**
     * Generates a random password value
     * @public
     * @returns {String} Password value
     */
    generate_password: function() {
      return this.generate_random(64);
    },

    /**
     * Generates a random ID value
     * @public
     * @returns {String} ID value
     */
    generate_id: function() {
      return this.generate_random(10);
    },

    /**
     * Generates the constraints object
     * @public
     * @returns {Object} constraints object
     */
    generate_constraints: function() {
      var constraints = {
        audio : false,
        video : false
      };

      try {
        // Medias?
        constraints.audio = true;
        constraints.video = (this.parent.get_media() == JSJAC_JINGLE_MEDIA_VIDEO);

        // Video configuration
        if(constraints.video === true) {
          // Resolution?
          switch(this.parent.get_resolution()) {
            // 16:9
            case '720':
            case 'hd':
              constraints.video = {
                mandatory : {
                  minWidth       : 1280,
                  minHeight      : 720,
                  minAspectRatio : 1.77
                }
              };
              break;

            case '360':
            case 'md':
              constraints.video = {
                mandatory : {
                  minWidth       : 640,
                  minHeight      : 360,
                  minAspectRatio : 1.77
                }
              };
              break;

            case '180':
            case 'sd':
              constraints.video = {
                mandatory : {
                  minWidth       : 320,
                  minHeight      : 180,
                  minAspectRatio : 1.77
                }
              };
              break;

            // 4:3
            case '960':
              constraints.video = {
                mandatory : {
                  minWidth  : 960,
                  minHeight : 720
                }
              };
              break;

            case '640':
            case 'vga':
              constraints.video = {
                mandatory : {
                  maxWidth  : 640,
                  maxHeight : 480
                }
              };
              break;

            case '320':
              constraints.video = {
                mandatory : {
                  maxWidth  : 320,
                  maxHeight : 240
                }
              };
              break;
          }

          // Bandwidth?
          if(this.parent.get_bandwidth())
            constraints.video.optional = [{ bandwidth: this.parent.get_bandwidth() }];

          // FPS?
          if(this.parent.get_fps())
            constraints.video.mandatory.minFrameRate = this.parent.get_fps();

          // Custom video source? (screenshare)
          if(this.parent.get_media()        == JSJAC_JINGLE_MEDIA_VIDEO         &&
             this.parent.get_video_source() != JSJAC_JINGLE_VIDEO_SOURCE_CAMERA ) {
            if(document.location.protocol !== 'https:')
              this.parent.get_debug().log('[JSJaCJingle:utils] generate_constraints > HTTPS might be required to share screen, otherwise you may get a permission denied error.', 0);

            // Unsupported browser? (for that feature)
            if(this.browser().name != JSJAC_JINGLE_BROWSER_CHROME) {
              this.parent.get_debug().log('[JSJaCJingle:utils] generate_constraints > Video source not supported by ' + this.browser().name + ' (source: ' + this.parent.get_video_source() + ').', 1);

              this.parent.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);
              return;
            }

            constraints.audio           = false;
            constraints.video.mandatory = {
              'chromeMediaSource': this.parent.get_video_source()
            };
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] generate_constraints > ' + e, 1);
      }

      return constraints;
    },

    /**
     * Returns whether SDP credentials are common or not (fingerprint & so)
     * @public
     * @param {Array} payloads
     * @returns {Boolean} Credientials same state
     */
    is_sdp_common_credentials: function(payloads) {
      var is_same = true;

      try {
        var i,
            prev_credentials, cur_credentials;

        for(i in payloads) {
          cur_credentials = payloads[i].transports;

          if(typeof prev_credentials == 'object') {
            if((prev_credentials.ufrag !== cur_credentials.ufrag)  ||
               (prev_credentials.pwd !== cur_credentials.pwd)      ||
               this.object_equal(prev_credentials.fingerprint, cur_credentials.fingerprint)
              ) {
              is_same = false;
              break;
            }
          }

          prev_credentials = cur_credentials;
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] is_sdp_common_credentials > ' + e, 1);
      }

      return is_same;
    },

    /**
     * Returns number of candidates in candidates object
     * @public
     * @param {Object} candidates_obj
     * @returns {Number} Number of candidates
     */
    count_candidates: function(candidates_obj) {
      var count_candidates = 0;

      try {
        var i;

        for(i in candidates_obj) {
          count_candidates += (typeof candidates_obj[i] == 'object') ? candidates_obj[i].length : 0;
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] count_candidates > ' + e, 1);
      } finally {
        return count_candidates;
      }

    },

    /**
     * Extracts network main details
     * @public
     * @param {String} media
     * @param {Array} candidates
     * @returns {Object} Network details
     */
    network_extract_main: function(media, candidates) {
      var network_obj = {
        'ip': JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT,
        'port': JSJAC_JINGLE_SDP_CANDIDATE_PORT_DEFAULT,
        'scope': JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT,
        'protocol': JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT
      };

      var local_obj, remote_obj;

      try {
        var i,
            cur_candidate, cur_candidate_parse;

        var fn_proceed_parse = function(type, candidate_eval) {
          var r_lan, protocol;

          var parse_obj = {
            'ip': candidate_eval.ip,
            'port': candidate_eval.port
          };

          if(candidate_eval.ip.match(R_NETWORK_IP.all.v4)) {
            r_lan = R_NETWORK_IP.lan.v4;
            parse_obj.protocol = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4;
          } else if(candidate_eval.ip.match(R_NETWORK_IP.all.v6)) {
            r_lan = R_NETWORK_IP.lan.v6;
            parse_obj.protocol = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V6;
          } else {
            return;
          }

          if((type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST) &&
             candidate_eval.ip.match(r_lan)) {
            // Local
            parse_obj.scope = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_LOCAL;
          } else if(type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX) {
            // Remote
            parse_obj.scope = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE;
          } else {
            return;
          }

          return parse_obj;
        };

        for(i in candidates) {
          cur_candidate = candidates[i];

          if(cur_candidate.id == media || cur_candidate.label == media) {
            cur_candidate_parse = this.parent.sdp._parse_candidate(cur_candidate.candidate);

            if(cur_candidate_parse.type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST) {
              // Only proceed if no local network yet
              if(typeof local_obj == 'undefined') {
                local_obj = fn_proceed_parse(JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST, cur_candidate_parse);
              }
            } else if(cur_candidate_parse.type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX) {
              // Only proceed if no remote network yet
              if(typeof remote_obj == 'undefined') {
                remote_obj = fn_proceed_parse(JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX, cur_candidate_parse);
              }
            }
          }
        }

        if(typeof remote_obj != 'undefined') {
          network_obj = remote_obj;
        } else if(typeof local_obj != 'undefined') {
          network_obj = local_obj;
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] network_extract_main > ' + e, 1);
      }

      return network_obj;
    },

    /**
     * Extracts username from full JID
     * @public
     * @param {String} full_jid
     * @returns {String|Object} Username
     */
    extract_username: function(full_jid) {
      try {
        return (new JSJaCJID(full_jid)).getResource();
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] extract_username > ' + e, 1);
      }

      return null;
    },

    /**
     * Returns our negotiation status
     * @public
     * @returns {String} Negotiation status
     */
    negotiation_status: function() {
      return (this.parent.get_initiator() == this.connection_jid()) ? JSJAC_JINGLE_SENDERS_INITIATOR.jingle : JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
    },

    /**
     * Get my connection JID
     * @public
     * @returns {String} JID value
     */
    connection_jid: function() {
      return this.parent.get_connection().username + '@' +
             this.parent.get_connection().domain   + '/' +
             this.parent.get_connection().resource;
    },

    /**
     * Get my connection username
     * @public
     * @returns {String} Username value
     */
    connection_username: function() {
      return this.parent.get_connection().username;
    },

    /**
     * Get my connection domain
     * @public
     * @returns {String} Domain value
     */
    connection_domain: function() {
      return this.parent.get_connection().domain;
    },

    /**
     * Get my connection resource
     * @public
     * @returns {String} Resource value
     */
    connection_resource: function() {
      return this.parent.get_connection().resource;
    },

    /**
     * Registers a view to map
     * @public
     * @param {String} type
     * @returns {Object} View register functions map
     */
    map_register_view: function(type) {
      var fn = {
        type   : null,
        mute   : false,

        view   : {
          get : null,
          set : null
        },

        stream : {
          get : null,
          set : null
        }
      };

      try {
        switch(type) {
          case JSJAC_JINGLE_DIRECTION_LOCAL:
            fn.type       = type;
            fn.mute       = true;
            fn.view.get   = this.parent.get_local_view;
            fn.view.set   = this.parent._set_local_view;
            fn.stream.get = this.parent.get_local_stream;
            fn.stream.set = this.parent._set_local_stream;
            break;

          case JSJAC_JINGLE_DIRECTION_REMOTE:
            fn.type       = type;
            fn.view.get   = this.parent.get_remote_view;
            fn.view.set   = this.parent._set_remote_view;
            fn.stream.get = this.parent.get_remote_stream;
            fn.stream.set = this.parent._set_remote_stream;
            break;
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] map_register_view > ' + e, 1);
      }

      return fn;
    },

    /**
     * Unregister a view from map
     * @public
     * @param {String} type
     * @returns {Object} View unregister functions map
     */
    map_unregister_view: function(type) {
      return this.map_register_view(type);
    },
  }
);

/**
 * @fileoverview JSJaC Jingle library - SDP tools
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/sdp */
/** @exports JSJaCJingleSDP */


/**
 * SDP helpers class.
 * @class
 * @classdesc  SDP helpers class.
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @param      {JSJaCJingleSingle|JSJaCJingleMuji} parent Parent class.
 */
var JSJaCJingleSDP = ring.create(
  /** @lends JSJaCJingleSDP.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(parent) {
      /**
       * @constant
       * @member {JSJaCJingleSingle|JSJaCJingleMuji}
       * @readonly
       * @default
       * @public
       */
      this.parent = parent;
    },


    /**
     * Parses SDP payload
     * @private
     * @param {String} sdp_payload
     * @returns {Object} Parsed payload object
     */
    _parse_payload: function(sdp_payload) {
      var payload = {};

      try {
        if(!sdp_payload || sdp_payload.indexOf('\n') == -1)  return payload;

        // Common vars
        var lines     = sdp_payload.split('\n');
        var cur_name  = null;
        var cur_media = null;

        var common_transports = {
          'fingerprint' : {},
          'pwd'         : null,
          'ufrag'       : null
        };

        var error, i, j, k,
            cur_line,
            cur_fmtp, cur_fmtp_id, cur_fmtp_values, cur_fmtp_attrs, cur_fmtp_key, cur_fmtp_value,
            cur_rtpmap, cur_rtcp_fb, cur_rtcp_fb_trr_int,
            cur_crypto, cur_zrtp_hash, cur_fingerprint, cur_ssrc,
            cur_ssrc_group, cur_ssrc_group_semantics, cur_ssrc_group_ids, cur_ssrc_group_id,
            cur_extmap, cur_rtpmap_id, cur_rtcp_fb_id, cur_bandwidth,
            m_rtpmap, m_fmtp, m_rtcp_fb, m_rtcp_fb_trr_int, m_crypto, m_zrtp_hash,
            m_fingerprint, m_pwd, m_ufrag, m_ptime, m_maxptime, m_bandwidth, m_media, m_candidate,
            cur_check_name, cur_transport_sub;

        // Common functions
        var init_content = function(name) {
          if(!(name in payload))  payload[name] = {};
        };

        var init_descriptions = function(name, sub, sub_default) {
          init_content(name);

          if(!('descriptions' in payload[name]))        payload[name].descriptions      = {};
          if(!(sub  in payload[name].descriptions))  payload[name].descriptions[sub] = sub_default;
        };

        var init_transports = function(name, sub, sub_default) {
          init_content(name);

          if(!('transports' in payload[name]))        payload[name].transports      = {};
          if(!(sub  in payload[name].transports))  payload[name].transports[sub] = sub_default;
        };

        var init_ssrc = function(name, id) {
          init_descriptions(name, 'ssrc', {});

          if(!(id in payload[name].descriptions.ssrc))
            payload[name].descriptions.ssrc[id] = [];
        };

        var init_ssrc_group = function(name, semantics) {
          init_descriptions(name, 'ssrc-group', {});

          if(!(semantics in payload[name].descriptions['ssrc-group']))
            payload[name].descriptions['ssrc-group'][semantics] = [];
        };

        var init_payload = function(name, id) {
          init_descriptions(name, 'payload', {});

          if(!(id in payload[name].descriptions.payload)) {
            payload[name].descriptions.payload[id] = {
              'attrs'           : {},
              'parameter'       : [],
              'rtcp-fb'         : [],
              'rtcp-fb-trr-int' : []
            };
          }
        };

        var init_encryption = function(name) {
          init_descriptions(name, 'encryption', {
            'attrs'     : {
              'required' : '1'
            },

            'crypto'    : [],
            'zrtp-hash' : []
          });
        };

        for(i in lines) {
          cur_line = lines[i];

          m_media = (R_WEBRTC_SDP_ICE_PAYLOAD.media).exec(cur_line);

          // 'audio/video' line?
          if(m_media) {
            cur_media = m_media[1];
            cur_name  = this.parent.utils.name_generate(cur_media);

            // Push it to parent array
            init_descriptions(cur_name, 'attrs', {});
            payload[cur_name].descriptions.attrs.media = cur_media;

            continue;
          }

          m_bandwidth = (R_WEBRTC_SDP_ICE_PAYLOAD.bandwidth).exec(cur_line);

          // 'bandwidth' line?
          if(m_bandwidth) {
            // Populate current object
            error = 0;
            cur_bandwidth = {};

            cur_bandwidth.type  = m_bandwidth[1]  || error++;
            cur_bandwidth.value = m_bandwidth[2]  || error++;

            // Incomplete?
            if(error !== 0) continue;

            // Push it to parent array
            init_descriptions(cur_name, 'bandwidth', []);
            payload[cur_name].descriptions.bandwidth.push(cur_bandwidth);

            continue;
          }

          m_rtpmap = (R_WEBRTC_SDP_ICE_PAYLOAD.rtpmap).exec(cur_line);

          // 'rtpmap' line?
          if(m_rtpmap) {
            // Populate current object
            error = 0;
            cur_rtpmap = {};

            cur_rtpmap.channels  = m_rtpmap[6];
            cur_rtpmap.clockrate = m_rtpmap[4];
            cur_rtpmap.id        = m_rtpmap[1] || error++;
            cur_rtpmap.name      = m_rtpmap[3];

            // Incomplete?
            if(error !== 0) continue;

            cur_rtpmap_id = cur_rtpmap.id;

            // Push it to parent array
            init_payload(cur_name, cur_rtpmap_id);
            payload[cur_name].descriptions.payload[cur_rtpmap_id].attrs = cur_rtpmap;

            continue;
          }

          m_fmtp = (R_WEBRTC_SDP_ICE_PAYLOAD.fmtp).exec(cur_line);

          // 'fmtp' line?
          if(m_fmtp) {
            cur_fmtp_id = m_fmtp[1];

            if(cur_fmtp_id) {
              cur_fmtp_values = m_fmtp[2] ? (m_fmtp[2]).split(';') : [];

              for(j in cur_fmtp_values) {
                // Parse current attribute
                if(cur_fmtp_values[j].indexOf('=') !== -1) {
                  cur_fmtp_attrs = cur_fmtp_values[j].split('=');
                  cur_fmtp_key   = cur_fmtp_attrs[0];
                  cur_fmtp_value = cur_fmtp_attrs[1];

                  while(cur_fmtp_key.length && !cur_fmtp_key[0])
                    cur_fmtp_key = cur_fmtp_key.substring(1);
                } else {
                  cur_fmtp_key = cur_fmtp_values[j];
                  cur_fmtp_value = null;
                }

                // Populate current object
                error = 0;
                cur_fmtp = {};

                cur_fmtp.name  = cur_fmtp_key    || error++;
                cur_fmtp.value = cur_fmtp_value;

                // Incomplete?
                if(error !== 0) continue;

                // Push it to parent array
                init_payload(cur_name, cur_fmtp_id);
                payload[cur_name].descriptions.payload[cur_fmtp_id].parameter.push(cur_fmtp);
              }
            }

            continue;
          }

          m_rtcp_fb = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb).exec(cur_line);

          // 'rtcp-fb' line?
          if(m_rtcp_fb) {
            // Populate current object
            error = 0;
            cur_rtcp_fb = {};

            cur_rtcp_fb.id      = m_rtcp_fb[1] || error++;
            cur_rtcp_fb.type    = m_rtcp_fb[2];
            cur_rtcp_fb.subtype = m_rtcp_fb[4];

            // Incomplete?
            if(error !== 0) continue;

            cur_rtcp_fb_id = cur_rtcp_fb.id;

            // Push it to parent array
            if(cur_rtcp_fb_id == '*') {
              init_descriptions(cur_name, 'rtcp-fb', []);
              (payload[cur_name].descriptions['rtcp-fb']).push(cur_rtcp_fb);
            } else {
              init_payload(cur_name, cur_rtcp_fb_id);
              (payload[cur_name].descriptions.payload[cur_rtcp_fb_id]['rtcp-fb']).push(cur_rtcp_fb);
            }

            continue;
          }

          m_rtcp_fb_trr_int = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb_trr_int).exec(cur_line);

          // 'rtcp-fb-trr-int' line?
          if(m_rtcp_fb_trr_int) {
            // Populate current object
            error = 0;
            cur_rtcp_fb_trr_int = {};

            cur_rtcp_fb_trr_int.id      = m_rtcp_fb_trr_int[1] || error++;
            cur_rtcp_fb_trr_int.value   = m_rtcp_fb_trr_int[2] || error++;

            // Incomplete?
            if(error !== 0) continue;

            cur_rtcp_fb_trr_int_id = cur_rtcp_fb_trr_int.id;

            // Push it to parent array
            init_payload(cur_name, cur_rtcp_fb_trr_int_id);
            (payload[cur_name].descriptions.payload[cur_rtcp_fb_trr_int_id]['rtcp-fb-trr-int']).push(cur_rtcp_fb_trr_int);

            continue;
          }

          m_crypto = (R_WEBRTC_SDP_ICE_PAYLOAD.crypto).exec(cur_line);

          // 'crypto' line?
          if(m_crypto) {
            // Populate current object
            error = 0;
            cur_crypto = {};

            cur_crypto['crypto-suite']   = m_crypto[2]  || error++;
            cur_crypto['key-params']     = m_crypto[3]  || error++;
            cur_crypto['session-params'] = m_crypto[5];
            cur_crypto.tag               = m_crypto[1]  || error++;

            // Incomplete?
            if(error !== 0) continue;

            // Push it to parent array
            init_encryption(cur_name);
            (payload[cur_name].descriptions.encryption.crypto).push(cur_crypto);

            continue;
          }

          m_zrtp_hash = (R_WEBRTC_SDP_ICE_PAYLOAD.zrtp_hash).exec(cur_line);

          // 'zrtp-hash' line?
          if(m_zrtp_hash) {
            // Populate current object
            error = 0;
            cur_zrtp_hash = {};

            cur_zrtp_hash.version = m_zrtp_hash[1]  || error++;
            cur_zrtp_hash.value   = m_zrtp_hash[2]  || error++;

            // Incomplete?
            if(error !== 0) continue;

            // Push it to parent array
            init_encryption(cur_name);
            (payload[cur_name].descriptions.encryption['zrtp-hash']).push(cur_zrtp_hash);

            continue;
          }

          m_ptime = (R_WEBRTC_SDP_ICE_PAYLOAD.ptime).exec(cur_line);

          // 'ptime' line?
          if(m_ptime) {
            // Push it to parent array
            init_descriptions(cur_name, 'attrs', {});
            payload[cur_name].descriptions.attrs.ptime = m_ptime[1];

            continue;
          }

          m_maxptime = (R_WEBRTC_SDP_ICE_PAYLOAD.maxptime).exec(cur_line);

          // 'maxptime' line?
          if(m_maxptime) {
            // Push it to parent array
            init_descriptions(cur_name, 'attrs', {});
            payload[cur_name].descriptions.attrs.maxptime = m_maxptime[1];

            continue;
          }

          m_ssrc = (R_WEBRTC_SDP_ICE_PAYLOAD.ssrc).exec(cur_line);

          // 'ssrc' line?
          if(m_ssrc) {
            // Populate current object
            error = 0;
            cur_ssrc = {};

            cur_ssrc_id    = m_ssrc[1]  || error++;
            cur_ssrc.name  = m_ssrc[2]  || error++;
            cur_ssrc.value = m_ssrc[4];

            // Incomplete?
            if(error !== 0) continue;

            // Push it to storage array
            init_ssrc(cur_name, cur_ssrc_id);
            (payload[cur_name].descriptions.ssrc[cur_ssrc_id]).push(cur_ssrc);

            // Push it to parent array (common attr required for Jingle)
            init_descriptions(cur_name, 'attrs', {});
            payload[cur_name].descriptions.attrs.ssrc = cur_ssrc_id;

            continue;
          }

          m_ssrc_group = (R_WEBRTC_SDP_ICE_PAYLOAD.ssrc_group).exec(cur_line);

          // 'ssrc-group' line?
          if(m_ssrc_group) {
            // Populate current object
            error = 0;
            cur_ssrc_group = {};

            cur_ssrc_group_semantics = m_ssrc_group[1]  || error++;
            cur_ssrc_group_ids       = m_ssrc_group[2]  || error++;

            // Explode sources into a list
            cur_ssrc_group.sources = [];
            cur_ssrc_group_ids = cur_ssrc_group_ids.trim();

            if(cur_ssrc_group_ids) {
              cur_ssrc_group_ids = cur_ssrc_group_ids.split(' ');

              for(k in cur_ssrc_group_ids) {
                cur_ssrc_group_id = cur_ssrc_group_ids[k].trim();

                if(cur_ssrc_group_id) {
                  cur_ssrc_group.sources.push({
                    'ssrc': cur_ssrc_group_id
                  });
                }
              }
            }

            if(cur_ssrc_group.sources.length === 0)  error++;

            // Incomplete?
            if(error !== 0) continue;

            // Push it to storage array
            init_ssrc_group(cur_name, cur_ssrc_group_semantics);
            (payload[cur_name].descriptions['ssrc-group'][cur_ssrc_group_semantics]).push(cur_ssrc_group);

            continue;
          }

          m_rtcp_mux = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_mux).exec(cur_line);

          // 'rtcp-mux' line?
          if(m_rtcp_mux) {
            // Push it to parent array
            init_descriptions(cur_name, 'rtcp-mux', 1);

            continue;
          }

          m_extmap = (R_WEBRTC_SDP_ICE_PAYLOAD.extmap).exec(cur_line);

          // 'extmap' line?
          if(m_extmap) {
            // Populate current object
            error = 0;
            cur_extmap = {};

            cur_extmap.id      = m_extmap[1]  || error++;
            cur_extmap.uri     = m_extmap[4]  || error++;
            cur_extmap.senders = m_extmap[3];

            // Incomplete?
            if(error !== 0) continue;

            // Push it to parent array
            init_descriptions(cur_name, 'rtp-hdrext', []);
            (payload[cur_name].descriptions['rtp-hdrext']).push(cur_extmap);

            continue;
          }

          m_fingerprint = (R_WEBRTC_SDP_ICE_PAYLOAD.fingerprint).exec(cur_line);

          // 'fingerprint' line?
          if(m_fingerprint) {
            // Populate current object
            error = 0;
            cur_fingerprint = common_transports.fingerprint || {};

            cur_fingerprint.hash  = m_fingerprint[1]  || error++;
            cur_fingerprint.value = m_fingerprint[2]  || error++;

            // Incomplete?
            if(error !== 0) continue;

            // Push it to parent array
            init_transports(cur_name, 'fingerprint', cur_fingerprint);
            common_transports.fingerprint = cur_fingerprint;

            continue;
          }

          m_setup = (R_WEBRTC_SDP_ICE_PAYLOAD.setup).exec(cur_line);

          // 'setup' line?
          if(m_setup) {
            // Populate current object
            cur_fingerprint = common_transports.fingerprint || {};
            cur_fingerprint.setup = m_setup[1];

            // Push it to parent array
            if(cur_fingerprint.setup) {
              // Map it to fingerprint as XML-wise it is related
              init_transports(cur_name, 'fingerprint', cur_fingerprint);
              common_transports.fingerprint = cur_fingerprint;
            }

            continue;
          }

          m_pwd = (R_WEBRTC_SDP_ICE_PAYLOAD.pwd).exec(cur_line);

          // 'pwd' line?
          if(m_pwd) {
            init_transports(cur_name, 'pwd', m_pwd[1]);

            if(!common_transports.pwd)
              common_transports.pwd = m_pwd[1];

            continue;
          }

          m_ufrag = (R_WEBRTC_SDP_ICE_PAYLOAD.ufrag).exec(cur_line);

          // 'ufrag' line?
          if(m_ufrag) {
            init_transports(cur_name, 'ufrag', m_ufrag[1]);

            if(!common_transports.ufrag)
              common_transports.ufrag = m_ufrag[1];

            continue;
          }

          // 'candidate' line? (shouldn't be there)
          m_candidate = R_WEBRTC_SDP_CANDIDATE.exec(cur_line);

          if(m_candidate) {
            this._parse_candidate_store({
              media     : cur_media,
              candidate : cur_line
            });

            continue;
          }
        }

        // Filter medias
        for(cur_check_name in payload) {
          // Undesired media?
          if(!this.parent.get_name()[cur_check_name]) {
            delete payload[cur_check_name]; continue;
          }

          // Validate transports
          if(typeof payload[cur_check_name].transports !== 'object')
            payload[cur_check_name].transports = {};

          for(cur_transport_sub in common_transports) {
            if(!payload[cur_check_name].transports[cur_transport_sub])
              payload[cur_check_name].transports[cur_transport_sub] = common_transports[cur_transport_sub];
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] _parse_payload > ' + e, 1);
      }

      return payload;
    },

    /**
     * Parses SDP group
     * @private
     * @param {String} sdp_payload
     * @returns {Object} Parsed group object
     */
    _parse_group: function(sdp_payload) {
      var group = {};

      try {
        if(!sdp_payload || sdp_payload.indexOf('\n') == -1)  return group;

        // Common vars
        var lines = sdp_payload.split('\n');
        var i, cur_line,
            m_group;

        var init_group = function(semantics) {
          if(!(semantics in group))  group[semantics] = [];
        };

        for(i in lines) {
          cur_line = lines[i];

          // 'group' line?
          m_group = (R_WEBRTC_SDP_ICE_PAYLOAD.group).exec(cur_line);

          if(m_group) {
            if(m_group[1] && m_group[2]) {
              init_group(m_group[1]);

              group[m_group[1]] = (m_group[2].indexOf(' ') === -1 ? [m_group[2]] : m_group[2].split(' '));
            }

            continue;
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] _parse_group > ' + e, 1);
      }

      return group;
    },

    /**
     * Update video resolution in payload
     * @private
     * @param {Object} payload
     * @returns {Object} Updated payload
     */
    _resolution_payload: function(payload) {
      try {
        if(!payload || typeof payload !== 'object') return {};

        // No video?
        if(this.parent.get_media_all().indexOf(JSJAC_JINGLE_MEDIA_VIDEO) === -1) return payload;

        var i, j, k, cur_media;
        var cur_payload, res_arr, constraints;
        var res_height = null;
        var res_width  = null;

        // Try local view? (more reliable)
        for(i in this.parent.get_local_view()) {
          if(typeof this.parent.get_local_view()[i].videoWidth  == 'number'  &&
             typeof this.parent.get_local_view()[i].videoHeight == 'number'  ) {
            res_height = this.parent.get_local_view()[i].videoHeight;
            res_width  = this.parent.get_local_view()[i].videoWidth;

            if(res_height && res_width)  break;
          }
        }

        // Try media constraints? (less reliable)
        if(!res_height || !res_width) {
          this.parent.get_debug().log('[JSJaCJingle:sdp] _resolution_payload > Could not get local video resolution, falling back on constraints (local video may not be ready).', 0);

          constraints = this.parent.utils.generate_constraints();

          // Still nothing?!
          if(typeof constraints.video                     !== 'object'  ||
             typeof constraints.video.mandatory           !== 'object'  ||
             typeof constraints.video.mandatory.minWidth  !== 'number'  ||
             typeof constraints.video.mandatory.minHeight !== 'number'  ) {
            this.parent.get_debug().log('[JSJaCJingle:sdp] _resolution_payload > Could not get local video resolution (not sending it).', 1);
            return payload;
          }

          res_height = constraints.video.mandatory.minHeight;
          res_width  = constraints.video.mandatory.minWidth;
        }

        // Constraints to be used
        res_arr = [
          {
            name  : 'height',
            value : res_height
          },

          {
            name  : 'width',
            value : res_width
          }
        ];

        for(cur_media in payload) {
          if(cur_media != JSJAC_JINGLE_MEDIA_VIDEO) continue;

          cur_payload = payload[cur_media].descriptions.payload;

          for(j in cur_payload) {
            if(typeof cur_payload[j].parameter !== 'object')  cur_payload[j].parameter = [];

            for(k in res_arr)
              (cur_payload[j].parameter).push(res_arr[k]);
          }
        }

        this.parent.get_debug().log('[JSJaCJingle:sdp] _resolution_payload > Got local video resolution (' + res_width + 'x' + res_height + ').', 2);
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] _resolution_payload > ' + e, 1);
      }

      return payload;
    },

    /**
     * Parses SDP candidate
     * @private
     * @param {String} sdp_candidate
     * @returns {Object} Parsed candidates object
     */
    _parse_candidate: function(sdp_candidate) {
      var candidate = {};

      try {
        if(!sdp_candidate)  return candidate;

        var error     = 0;
        var matches   = R_WEBRTC_DATA_CANDIDATE.exec(sdp_candidate);

        // Matches!
        if(matches) {
          candidate.component     = matches[2]  || error++;
          candidate.foundation    = matches[1]  || error++;
          candidate.generation    = matches[16] || JSJAC_JINGLE_GENERATION;
          candidate.id            = this.parent.utils.generate_id();
          candidate.ip            = matches[5]  || error++;
          candidate.network       = JSJAC_JINGLE_NETWORK;
          candidate.port          = matches[6]  || error++;
          candidate.priority      = matches[4]  || error++;
          candidate.protocol      = matches[3]  || error++;
          candidate['rel-addr']   = matches[11];
          candidate['rel-port']   = matches[13];
          candidate.type          = matches[8]  || error++;
        }

        // Incomplete?
        if(error !== 0) return {};
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] _parse_candidate > ' + e, 1);
      }

      return candidate;
    },

    /**
     * Parses SDP candidate & store it
     * @private
     * @param {Object} sdp_candidate
     */
    _parse_candidate_store: function(sdp_candidate) {
      // Store received candidate
      var candidate_media = sdp_candidate.media;
      var candidate_data  = sdp_candidate.candidate;

      // Convert SDP raw data to an object
      var candidate_obj   = this._parse_candidate(candidate_data);
      var candidate_name  = this.parent.utils.name_generate(candidate_media);

      this.parent._set_candidates_local(
        candidate_name,
        candidate_obj
      );

      // Enqueue candidate
      this.parent._set_candidates_queue_local(
        candidate_name,
        candidate_obj
      );
    },

    /**
     * Parses SDP candidate & store it from data
     * @private
     * @param {Object} data
     */
    _parse_candidate_store_store_data: function(data) {
      this._parse_candidate_store({
        media     : (isNaN(data.candidate.sdpMid) ? data.candidate.sdpMid
                                                  : this.parent.utils.media_generate(parseInt(data.candidate.sdpMid, 10))),
        candidate : data.candidate.candidate
      });
    },

    /**
     * Generates SDP description
     * @private
     * @param {String} type
     * @param {Object} group
     * @param {Object} payloads
     * @param {Object} candidates
     * @returns {Object} SDP object
     */
    _generate: function(type, group, payloads, candidates) {
      try {
        var sdp_obj = {};

        sdp_obj.candidates  = this._generate_candidates(candidates);
        sdp_obj.description = this._generate_description(type, group, payloads, sdp_obj.candidates);

        return sdp_obj;
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] _generate > ' + e, 1);
      }

      return {};
    },

    /**
     * Generate SDP candidates
     * @private
     * @param {Object} candidates
     * @returns {Array} SDP candidates array
     */
    _generate_candidates: function(candidates) {
      var candidates_arr = [];

      try {
        // Parse candidates
        var i,
            cur_media, cur_name, cur_c_name, cur_candidate, cur_label, cur_id, cur_candidate_str;

        for(cur_name in candidates) {
          cur_c_name = candidates[cur_name];
          cur_media   = this.parent.utils.media_generate(cur_name);

          for(i in cur_c_name) {
            cur_candidate = cur_c_name[i];

            cur_label         = JSJAC_JINGLE_MEDIAS[cur_media].label;
            cur_id            = cur_label;
            cur_candidate_str = '';

            cur_candidate_str += 'a=candidate:';
            cur_candidate_str += (cur_candidate.foundation || cur_candidate.id);
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.component;
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.protocol || JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_DEFAULT;
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.priority || JSJAC_JINGLE_SDP_CANDIDATE_PRIORITY_DEFAULT;
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.ip;
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.port;

            if(cur_candidate.type) {
              cur_candidate_str += ' ';
              cur_candidate_str += 'typ';
              cur_candidate_str += ' ';
              cur_candidate_str += cur_candidate.type;
            }

            if(cur_candidate['rel-addr'] && cur_candidate['rel-port']) {
              cur_candidate_str += ' ';
              cur_candidate_str += 'raddr';
              cur_candidate_str += ' ';
              cur_candidate_str += cur_candidate['rel-addr'];
              cur_candidate_str += ' ';
              cur_candidate_str += 'rport';
              cur_candidate_str += ' ';
              cur_candidate_str += cur_candidate['rel-port'];
            }

            if(cur_candidate.generation) {
              cur_candidate_str += ' ';
              cur_candidate_str += 'generation';
              cur_candidate_str += ' ';
              cur_candidate_str += cur_candidate.generation;
            }

            cur_candidate_str   += WEBRTC_SDP_LINE_BREAK;

            candidates_arr.push({
              label     : cur_label,
              id        : cur_id,
              candidate : cur_candidate_str
            });
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] _generate_candidates > ' + e, 1);
      }

      return candidates_arr;
    },

    /**
     * Generates SDP description
     * @private
     * @param {String} type
     * @param {Object} group
     * @param {Object} payloads
     * @param {Object} sdp_candidates
     * @returns {Object} SDP description payloads
     */
    _generate_description: function(type, group, payloads, sdp_candidates) {
      var payloads_obj = {};

      try {
        var payloads_str = '';
        var is_common_credentials = this.parent.utils.is_sdp_common_credentials(payloads);

        // Common vars
        var i, c, j, k, l, m, n, o, p, q, r, s, t, u,
            cur_name, cur_name_first, cur_name_obj,
            cur_media, cur_senders,
            cur_group_semantics, cur_group_names, cur_group_name,
            cur_network_obj, cur_transports_obj, cur_transports_obj_first, cur_description_obj,
            cur_d_pwd, cur_d_ufrag, cur_d_fingerprint,
            cur_d_attrs, cur_d_rtcp_fb, cur_d_bandwidth, cur_d_encryption,
            cur_d_ssrc, cur_d_ssrc_id, cur_d_ssrc_obj, cur_d_ssrc_group, cur_d_ssrc_group_semantics, cur_d_ssrc_group_obj,
            cur_d_rtcp_fb_obj,
            cur_d_payload, cur_d_payload_obj, cur_d_payload_obj_attrs, cur_d_payload_obj_id,
            cur_d_payload_obj_parameter, cur_d_payload_obj_parameter_obj, cur_d_payload_obj_parameter_str,
            cur_d_payload_obj_rtcp_fb, cur_d_payload_obj_rtcp_fb_obj,
            cur_d_payload_obj_rtcp_fb_ttr_int, cur_d_payload_obj_rtcp_fb_ttr_int_obj,
            cur_d_crypto_obj, cur_d_zrtp_hash_obj,
            cur_d_rtp_hdrext, cur_d_rtp_hdrext_obj,
            cur_d_rtcp_mux;

        // Payloads headers
        payloads_str += this._generate_protocol_version();
        payloads_str += WEBRTC_SDP_LINE_BREAK;
        payloads_str += this._generate_origin();
        payloads_str += WEBRTC_SDP_LINE_BREAK;
        payloads_str += this._generate_session_name();
        payloads_str += WEBRTC_SDP_LINE_BREAK;
        payloads_str += this._generate_timing();
        payloads_str += WEBRTC_SDP_LINE_BREAK;

        // Add groups
        for(cur_group_semantics in group) {
          cur_group_names = group[cur_group_semantics];

          payloads_str += 'a=group:' + cur_group_semantics;

          for(s in cur_group_names) {
            cur_group_name = cur_group_names[s];
            payloads_str += ' ' + cur_group_name;
          }

          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // Common credentials?
        if(is_common_credentials === true) {
          for(cur_name_first in payloads) {
            cur_transports_obj_first = payloads[cur_name_first].transports || {};

            payloads_str += this._generate_credentials(
              cur_transports_obj_first.ufrag,
              cur_transports_obj_first.pwd,
              cur_transports_obj_first.fingerprint
            );

            break;
          }
        }

        // Add media groups
        for(cur_name in payloads) {
          cur_name_obj          = payloads[cur_name];
          cur_senders           = this.parent.get_senders(cur_name);
          cur_media             = this.parent.get_name(cur_name) ? this.parent.utils.media_generate(cur_name) : null;

          // No media?
          if(!cur_media) continue;

          // Network
          cur_network_obj       = this.parent.utils.network_extract_main(cur_name, sdp_candidates);

          // Transports
          cur_transports_obj    = cur_name_obj.transports || {};
          cur_d_pwd             = cur_transports_obj.pwd;
          cur_d_ufrag           = cur_transports_obj.ufrag;
          cur_d_fingerprint     = cur_transports_obj.fingerprint;

          // Descriptions
          cur_description_obj   = cur_name_obj.descriptions;
          cur_d_attrs           = cur_description_obj.attrs;
          cur_d_rtcp_fb         = cur_description_obj['rtcp-fb'];
          cur_d_bandwidth       = cur_description_obj.bandwidth;
          cur_d_payload         = cur_description_obj.payload;
          cur_d_encryption      = cur_description_obj.encryption;
          cur_d_ssrc            = cur_description_obj.ssrc;
          cur_d_ssrc_group      = cur_description_obj['ssrc-group'];
          cur_d_rtp_hdrext      = cur_description_obj['rtp-hdrext'];
          cur_d_rtcp_mux        = cur_description_obj['rtcp-mux'];

          // Current media
          payloads_str += this._generate_description_media(
            cur_media,
            cur_network_obj.port,
            cur_d_encryption,
            cur_d_fingerprint,
            cur_d_payload
          );
          payloads_str += WEBRTC_SDP_LINE_BREAK;

          payloads_str += 'c=' +
                          cur_network_obj.scope + ' ' +
                          cur_network_obj.protocol + ' ' +
                          cur_network_obj.ip;
          payloads_str += WEBRTC_SDP_LINE_BREAK;

          payloads_str += 'a=rtcp:' +
                          cur_network_obj.port + ' ' +
                          cur_network_obj.scope + ' ' +
                          cur_network_obj.protocol + ' ' +
                          cur_network_obj.ip;
          payloads_str += WEBRTC_SDP_LINE_BREAK;

          // Specific credentials?
          if(is_common_credentials === false) {
            payloads_str += this._generate_credentials(
              cur_d_ufrag,
              cur_d_pwd,
              cur_d_fingerprint
            );
          }

          // Fingerprint
          if(cur_d_fingerprint && cur_d_fingerprint.setup) {
            payloads_str += 'a=setup:' + cur_d_fingerprint.setup;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // RTP-HDREXT
          if(cur_d_rtp_hdrext && cur_d_rtp_hdrext.length) {
            for(i in cur_d_rtp_hdrext) {
              cur_d_rtp_hdrext_obj = cur_d_rtp_hdrext[i];

              payloads_str += 'a=extmap:' + cur_d_rtp_hdrext_obj.id;

              if(cur_d_rtp_hdrext_obj.senders)
                payloads_str += '/' + cur_d_rtp_hdrext_obj.senders;

              payloads_str += ' ' + cur_d_rtp_hdrext_obj.uri;
              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          // Senders
          if(cur_senders) {
            payloads_str += 'a=' + JSJAC_JINGLE_SENDERS[cur_senders];
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // Name
          if(cur_media && JSJAC_JINGLE_MEDIAS[cur_media]) {
            payloads_str += 'a=mid:' + (JSJAC_JINGLE_MEDIAS[cur_media]).label;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // RTCP-MUX
          // WARNING: no spec!
          // See: http://code.google.com/p/libjingle/issues/detail?id=309
          //      http://mail.jabber.org/pipermail/jingle/2011-December/001761.html
          if(cur_d_rtcp_mux) {
            payloads_str += 'a=rtcp-mux';
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'encryption'
          if(cur_d_encryption) {
            // 'crypto'
            for(j in cur_d_encryption.crypto) {
              cur_d_crypto_obj = cur_d_encryption.crypto[j];

              payloads_str += 'a=crypto:'                       +
                              cur_d_crypto_obj.tag           + ' ' +
                              cur_d_crypto_obj['crypto-suite']  + ' ' +
                              cur_d_crypto_obj['key-params']    +
                              (cur_d_crypto_obj['session-params'] ? (' ' + cur_d_crypto_obj['session-params']) : '');

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }

            // 'zrtp-hash'
            for(p in cur_d_encryption['zrtp-hash']) {
              cur_d_zrtp_hash_obj = cur_d_encryption['zrtp-hash'][p];

              payloads_str += 'a=zrtp-hash:'                  +
                              cur_d_zrtp_hash_obj.version  + ' ' +
                              cur_d_zrtp_hash_obj.value;

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          // 'rtcp-fb' (common)
          for(n in cur_d_rtcp_fb) {
            cur_d_rtcp_fb_obj = cur_d_rtcp_fb[n];

            payloads_str += 'a=rtcp-fb:*';
            payloads_str += ' ' + cur_d_rtcp_fb_obj.type;

            if(cur_d_rtcp_fb_obj.subtype)
              payloads_str += ' ' + cur_d_rtcp_fb_obj.subtype;

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'bandwidth' (common)
          for(q in cur_d_bandwidth) {
            cur_d_bandwidth_obj = cur_d_bandwidth[q];

            payloads_str += 'b=' + cur_d_bandwidth_obj.type;
            payloads_str += ':'  + cur_d_bandwidth_obj.value;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'payload-type'
          for(k in cur_d_payload) {
            cur_d_payload_obj                 = cur_d_payload[k];
            cur_d_payload_obj_attrs           = cur_d_payload_obj.attrs;
            cur_d_payload_obj_parameter       = cur_d_payload_obj.parameter;
            cur_d_payload_obj_rtcp_fb         = cur_d_payload_obj['rtcp-fb'];
            cur_d_payload_obj_rtcp_fb_ttr_int = cur_d_payload_obj['rtcp-fb-trr-int'];

            cur_d_payload_obj_id              = cur_d_payload_obj_attrs.id;

            payloads_str += 'a=rtpmap:' + cur_d_payload_obj_id;

            // 'rtpmap'
            if(cur_d_payload_obj_attrs.name) {
              payloads_str += ' ' + cur_d_payload_obj_attrs.name;

              if(cur_d_payload_obj_attrs.clockrate) {
                payloads_str += '/' + cur_d_payload_obj_attrs.clockrate;

                if(cur_d_payload_obj_attrs.channels)
                  payloads_str += '/' + cur_d_payload_obj_attrs.channels;
              }
            }

            payloads_str += WEBRTC_SDP_LINE_BREAK;

            // 'parameter'
            if(cur_d_payload_obj_parameter.length) {
              payloads_str += 'a=fmtp:' + cur_d_payload_obj_id + ' ';
              cur_d_payload_obj_parameter_str = '';

              for(o in cur_d_payload_obj_parameter) {
                cur_d_payload_obj_parameter_obj = cur_d_payload_obj_parameter[o];

                if(cur_d_payload_obj_parameter_str)  cur_d_payload_obj_parameter_str += ';';

                cur_d_payload_obj_parameter_str += cur_d_payload_obj_parameter_obj.name;

                if(cur_d_payload_obj_parameter_obj.value !== null) {
                  cur_d_payload_obj_parameter_str += '=';
                  cur_d_payload_obj_parameter_str += cur_d_payload_obj_parameter_obj.value;
                }
              }

              payloads_str += cur_d_payload_obj_parameter_str;
              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }

            // 'rtcp-fb' (sub)
            for(l in cur_d_payload_obj_rtcp_fb) {
              cur_d_payload_obj_rtcp_fb_obj = cur_d_payload_obj_rtcp_fb[l];

              payloads_str += 'a=rtcp-fb:' + cur_d_payload_obj_id;
              payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_obj.type;

              if(cur_d_payload_obj_rtcp_fb_obj.subtype)
                payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_obj.subtype;

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }

            // 'rtcp-fb-ttr-int'
            for(m in cur_d_payload_obj_rtcp_fb_ttr_int) {
              cur_d_payload_obj_rtcp_fb_ttr_int_obj = cur_d_payload_obj_rtcp_fb_ttr_int[m];

              payloads_str += 'a=rtcp-fb:' + cur_d_payload_obj_id;
              payloads_str += ' ' + 'trr-int';
              payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_ttr_int_obj.value;
              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          if(cur_d_attrs.ptime)     payloads_str += 'a=ptime:'    + cur_d_attrs.ptime + WEBRTC_SDP_LINE_BREAK;
          if(cur_d_attrs.maxptime)  payloads_str += 'a=maxptime:' + cur_d_attrs.maxptime + WEBRTC_SDP_LINE_BREAK;

          // 'ssrc-group'
          for(cur_d_ssrc_group_semantics in cur_d_ssrc_group) {
            for(t in cur_d_ssrc_group[cur_d_ssrc_group_semantics]) {
              cur_d_ssrc_group_obj = cur_d_ssrc_group[cur_d_ssrc_group_semantics][t];

              payloads_str += 'a=ssrc-group';
              payloads_str += ':' + cur_d_ssrc_group_semantics;

              for(u in cur_d_ssrc_group_obj.sources) {
                payloads_str += ' ' + cur_d_ssrc_group_obj.sources[u].ssrc;
              }

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          // 'ssrc'
          for(cur_d_ssrc_id in cur_d_ssrc) {
            for(r in cur_d_ssrc[cur_d_ssrc_id]) {
              cur_d_ssrc_obj = cur_d_ssrc[cur_d_ssrc_id][r];

              payloads_str += 'a=ssrc';
              payloads_str += ':' + cur_d_ssrc_id;
              payloads_str += ' ' + cur_d_ssrc_obj.name;

              if(cur_d_ssrc_obj.value)
                payloads_str += ':' + cur_d_ssrc_obj.value;

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          // Candidates (some browsers require them there, too)
          if(typeof sdp_candidates == 'object') {
            for(c in sdp_candidates) {
              if((sdp_candidates[c]).label == JSJAC_JINGLE_MEDIAS[cur_media].label)
                payloads_str += (sdp_candidates[c]).candidate;
            }
          }
        }

        // Push to object
        payloads_obj.type = type;
        payloads_obj.sdp  = payloads_str;
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] _generate_description > ' + e, 1);
      }

      return payloads_obj;
    },

    /**
     * Generates SDP protocol version
     * @private
     * @returns {String} SDP protocol version raw text
     */
    _generate_protocol_version: function() {
      return 'v=0';
    },

    /**
     * Generates SDP origin
     * @private
     * @returns {String} SDP origin raw text
     */
    _generate_origin: function() {
      var sdp_origin = '';

      try {
        // Values
        var jid = new JSJaCJID(this.parent.get_initiator());

        var username        = jid.getNode() ? jid.getNode() : '-';
        var session_id      = '1';
        var session_version = '1';
        var nettype         = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT;
        var addrtype        = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT;
        var unicast_address = JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT;

        // Line content
        sdp_origin += 'o=';
        sdp_origin += username + ' ';
        sdp_origin += session_id + ' ';
        sdp_origin += session_version + ' ';
        sdp_origin += nettype + ' ';
        sdp_origin += addrtype + ' ';
        sdp_origin += unicast_address;
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] _generate_origin > ' + e, 1);
      }

      return sdp_origin;
    },

    /**
     * Generates SDP session name
     * @private
     * @returns {String} SDP session name raw text
     */
    _generate_session_name: function() {
      return 's=' + (this.parent.get_sid() || '-');
    },

    /**
     * Generates SDP timing
     * @private
     * @returns {String} SDP timing raw text
     */
    _generate_timing: function() {
      return 't=0 0';
    },

    /**
     * Generates SDP credentials
     * @private
     * @param {String} ufrag
     * @param {String} pwd
     * @param {Object} fingerprint
     * @returns {String} SDP credentials raw text
     */
    _generate_credentials: function(ufrag, pwd, fingerprint) {
      var sdp = '';

      // ICE credentials
      if(ufrag)  sdp += 'a=ice-ufrag:' + ufrag + WEBRTC_SDP_LINE_BREAK;
      if(pwd)    sdp += 'a=ice-pwd:' + pwd + WEBRTC_SDP_LINE_BREAK;

      // Fingerprint
      if(fingerprint) {
        if(fingerprint.hash && fingerprint.value) {
          sdp += 'a=fingerprint:' + fingerprint.hash + ' ' + fingerprint.value;
          sdp += WEBRTC_SDP_LINE_BREAK;
        }
      }

      return sdp;
    },

    /**
     * Generates SDP media description
     * @private
     * @param {String} media
     * @param {String} port
     * @param {String} crypto
     * @param {Object} fingerprint
     * @param {Array} payload
     * @returns {String} SDP media raw text
     */
    _generate_description_media: function(media, port, crypto, fingerprint, payload) {
      var sdp_media = '';

      try {
        var i;
        var type_ids = [];

        sdp_media += 'm=' + media + ' ' + port + ' ';

        // Protocol
        if((crypto && crypto.length) || (fingerprint && fingerprint.hash && fingerprint.value))
          sdp_media += 'RTP/SAVPF';
        else
          sdp_media += 'RTP/AVPF';

        // Payload type IDs
        for(i in payload)  type_ids.push(payload[i].attrs.id);

        sdp_media += ' ' + type_ids.join(' ');
      } catch(e) {
        this.parent.get_debug().log('[JSJaCJingle:sdp] _generate_description_media > ' + e, 1);
      }

      return sdp_media;
    },
  }
);

/**
 * @fileoverview JSJaC Jingle library - Base call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/base */
/** @exports __JSJaCJingleBase */


/**
 * Abstract base class for XMPP Jingle sessions.
 * @abstract
 * @class
 * @classdesc  Abstract base class for XMPP Jingle sessions.
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @requires   jsjac-jingle/utils
 * @requires   jsjac-jingle/sdp
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 * @param      {Object}         [args]                        - Jingle session arguments.
 * @property   {DOM}            [args.local_view]             - The path to the local stream view element.
 * @property   {Boolean}        [args.local_stream_readonly]  - Whether the local stream is read-only or not.
 * @property   {String}         [args.to]                     - The full JID to start the Jingle session with.
 * @property   {String}         [args.connection]             - The connection to be attached to.
 * @property   {String}         [args.media]                  - The media type to be used in the Jingle session.
 * @property   {String}         [args.resolution]             - The resolution to be used for video in the Jingle session.
 * @property   {String}         [args.bandwidth]              - The bandwidth to be limited for video in the Jingle session.
 * @property   {String}         [args.fps]                    - The framerate to be used for video in the Jingle session.
 * @property   {Array}          [args.stun]                   - A list of STUN servers to use (override the default one).
 * @property   {Array}          [args.turn]                   - A list of TURN servers to use.
 * @property   {Boolean}        [args.sdp_trace]              - Log SDP trace in console (requires a debug interface).
 * @property   {Boolean}        [args.net_trace]              - Log network packet trace in console (requires a debug interface).
 * @property   {JSJaCDebugger}  [args.debug]                  - A reference to a debugger implementing the JSJaCDebugger interface.
 */
var __JSJaCJingleBase = ring.create(
  /** @lends __JSJaCJingleBase.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      /**
       * @constant
       * @member {JSJaCJingleUtils}
       * @readonly
       * @default
       * @public
       */
      this.utils = new JSJaCJingleUtils(this);

      /**
       * @constant
       * @member {JSJaCJingleSDP}
       * @readonly
       * @default
       * @public
       */
      this.sdp = new JSJaCJingleSDP(this);

      if(args && args.to)
        /**
         * @constant
         * @member {String}
         * @default
         * @private
         */
        this._to = args.to;

      if(args && args.connection) {
        /**
         * @constant
         * @member {JSJaCConnection}
         * @default
         * @private
         */
        this._connection = args.connection;
      } else {
        /**
         * @constant
         * @member {JSJaCConnection}
         * @default
         * @private
         */
        this._connection = JSJaCJingleStorage.get_connection();
      }

      if(args && args.media)
        /**
         * @member {String}
         * @default
         * @private
         */
        this._media = args.media;

      if(args && args.video_source)
        /**
         * @member {String}
         * @default
         * @private
         */
        this._video_source = args.video_source;

      if(args && args.resolution)
        /**
         * @member {String}
         * @default
         * @private
         */
        this._resolution = args.resolution;

      if(args && args.bandwidth)
        /**
         * @member {Number}
         * @default
         * @private
         */
        this._bandwidth = args.bandwidth;

      if(args && args.fps)
        /**
         * @member {Number}
         * @default
         * @private
         */
        this._fps = args.fps;

      if(args && args.local_view) {
        if(args.local_view instanceof Array) {
          /**
           * @member {DOM}
           * @default
           * @private
           */
          this._local_view = args.local_view;
        } else {
          /**
           * @member {DOM}
           * @default
           * @private
           */
          this._local_view = [args.local_view];
        }
      }

      if(args && args.local_stream_readonly) {
        /**
         * @constant
         * @member {Boolean}
         * @default
         * @private
         */
        this._local_stream_readonly = args.local_stream_readonly;
      } else {
        this._local_stream_readonly = false;
      }

      if(args && args.stun) {
        /**
         * @constant
         * @member {Array}
         * @default
         * @private
         */
        this._stun = args.stun;
      } else {
        this._stun = [];
      }

      if(args && args.turn) {
        /**
         * @constant
         * @member {Array}
         * @default
         * @private
         */
        this._turn = args.turn;
      } else {
        this._turn = [];
      }

      if(args && args.sdp_trace)
        /**
         * @member {Boolean}
         * @default
         * @private
         */
        this._sdp_trace = args.sdp_trace;

      if(args && args.net_trace)
        /**
         * @member {Boolean}
         * @default
         * @private
         */
        this._net_trace = args.net_trace;

      if(args && args.debug && args.debug.log) {
        /**
         * @member {JSJaCDebugger}
         * @default
         * @private
         */
        this._debug = args.debug;
      } else {
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._debug = JSJaCJingleStorage.get_debug();
      }

      /**
       * @member {String}
       * @default
       * @private
       */
      this._initiator = '';

      /**
       * @member {String}
       * @default
       * @private
       */
      this._responder = '';

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._creator = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._senders = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._local_stream = null;

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._content_local = [];

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._peer_connection = {};

      /**
       * @member {Number}
       * @default
       * @private
       */
      this._id = 0;

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._sent_id = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._received_id = {};

      /**
       * @member {Array}
       * @default
       * @private
       */
      this._payloads_local = [];

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._group_local = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._candidates_local = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._candidates_queue_local = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._registered_handlers = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._deferred_handlers = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._mute = {};

      /**
       * @member {Boolean}
       * @default
       * @private
       */
      this._lock = false;

      /**
       * @member {Boolean}
       * @default
       * @private
       */
      this._media_busy = false;

      /**
       * @member {String}
       * @default
       * @private
       */
      this._sid = '';

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._name = {};
    },



    /**
     * JSJSAC JINGLE REGISTERS
     */

    /**
     * Registers a given handler on a given Jingle stanza
     * @public
     * @param {String} node
     * @param {String} type
     * @param {String} id
     * @param {Function} fn
     * @returns {Boolean} Success
     */
    register_handler: function(node, type, id, fn) {
      this.get_debug().log('[JSJaCJingle:base] register_handler', 4);

      try {
        if(typeof fn !== 'function') {
          this.get_debug().log('[JSJaCJingle:base] register_handler > fn parameter not passed or not a function!', 1);
          return false;
        }

        if(id) {
          this._set_registered_handlers(node, type, id, fn);

          this.get_debug().log('[JSJaCJingle:base] register_handler > Registered handler for node: ' + node + ', id: ' + id + ' and type: ' + type, 3);
          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] register_handler > Could not register handler (no ID).', 1);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] register_handler > ' + e, 1);
      }

      return false;
    },

    /**
     * Unregisters the given handler on a given Jingle stanza
     * @public
     * @param {String} node
     * @param {String} type
     * @param {String} id
     * @returns {Boolean} Success
     */
    unregister_handler: function(node, type, id) {
      this.get_debug().log('[JSJaCJingle:base] unregister_handler', 4);

      try {
        if(this.get_registered_handlers(node, type, id).length >= 1) {
          this._set_registered_handlers(node, type, id, null);

          this.get_debug().log('[JSJaCJingle:base] unregister_handler > Unregistered handler for node: ' + node + ', id: ' + id + ' and type: ' + type, 3);
          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] unregister_handler > Could not unregister handler with node: ' + node + ', id: ' + id + ' and type: ' + type + ' (not found).', 2);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] unregister_handler > ' + e, 1);
      }

      return false;
    },

    /**
     * Defers a given handler
     * @public
     * @param {String} ns
     * @param {Function} fn
     * @returns {Boolean} Success
     */
    defer_handler: function(ns, fn) {
      this.get_debug().log('[JSJaCJingle:base] defer_handler', 4);

      try {
        if(typeof fn !== 'function') {
          this.get_debug().log('[JSJaCJingle:base] defer_handler > fn parameter not passed or not a function!', 1);
          return false;
        }

        this._set_deferred_handlers(ns, fn);

        this.get_debug().log('[JSJaCJingle:base] defer_handler > Deferred handler for namespace: ' + ns, 3);
        return true;
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] defer_handler > ' + e, 1);
      }

      return false;
    },

    /**
     * Undefers the given handler
     * @public
     * @param {String} ns
     * @returns {Boolean} Success
     */
    undefer_handler: function(ns) {
      this.get_debug().log('[JSJaCJingle:base] undefer_handler', 4);

      try {
        if(ns in this._deferred_handlers) {
          this._set_deferred_handlers(ns, null);

          this.get_debug().log('[JSJaCJingle:base] undefer_handler > Undeferred handler for namespace: ' + ns, 3);
          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] undefer_handler > Could not undefer handler with namespace: ' + ns + ' (not found).', 2);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] undefer_handler > ' + e, 1);
      }

      return false;
    },

    /**
     * Registers a view element
     * @public
     * @param {String} tyoe
     * @param {DOM} view
     * @returns {Boolean} Success
     */
    register_view: function(type, view) {
      this.get_debug().log('[JSJaCJingle:base] register_view', 4);

      try {
        // Get view functions
        var fn = this.utils.map_register_view(type);

        if(fn.type == type) {
          var i;

          // Check view is not already registered
          for(i in (fn.view.get)()) {
            if((fn.view.get)()[i] == view) {
              this.get_debug().log('[JSJaCJingle:base] register_view > Could not register view of type: ' + type + ' (already registered).', 2);
              return true;
            }
          }

          // Proceeds registration
          (fn.view.set)(view);

          this.utils._peer_stream_attach(
            [view],
            (fn.stream.get)(),
            fn.mute
          );

          this.get_debug().log('[JSJaCJingle:base] register_view > Registered view of type: ' + type, 3);

          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] register_view > Could not register view of type: ' + type + ' (type unknown).', 1);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] register_view > ' + e, 1);
      }

      return false;
    },

    /**
     * Unregisters a view element
     * @public
     * @param {String} type
     * @param {DOM} view
     * @returns {Boolean} Success
     */
    unregister_view: function(type, view) {
      this.get_debug().log('[JSJaCJingle:base] unregister_view', 4);

      try {
        // Get view functions
        var fn = this.utils.map_unregister_view(type);

        if(fn.type == type) {
          var i;

          // Check view is registered
          for(i in (fn.view.get)()) {
            if((fn.view.get)()[i] == view) {
              // Proceeds un-registration
              this.utils._peer_stream_detach(
                [view]
              );

              this.utils.array_remove_value(
                (fn.view.get)(),
                view
              );

              this.get_debug().log('[JSJaCJingle:base] unregister_view > Unregistered view of type: ' + type, 3);
              return true;
            }
          }

          this.get_debug().log('[JSJaCJingle:base] unregister_view > Could not unregister view of type: ' + type + ' (not found).', 2);
          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] unregister_view > Could not unregister view of type: ' + type + ' (type unknown).', 1);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] unregister_view > ' + e, 1);
      }

      return false;
    },



    /**
     * JSJSAC JINGLE PEER TOOLS
     */

    /**
     * Creates a new peer connection
     * @private
     * @param {Function} sdp_message_callback
     */
    _peer_connection_create: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:base] _peer_connection_create', 4);

      try {
        // Create peer connection instance
        this._peer_connection_create_instance();

        // Event callbacks
        this._peer_connection_callbacks(sdp_message_callback);

        // Add local stream
        this._peer_connection_create_local_stream();

        // Create offer/answer
        this._peer_connection_create_dispatch(sdp_message_callback);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_connection_create > ' + e, 1);
      }
    },

    /**
     * Creates peer connection local stream
     * @private
     */
    _peer_connection_create_local_stream: function() {
      this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_local_stream', 4);

      try {
        this.get_peer_connection().addStream(
          this.get_local_stream()
      	);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_local_stream > ' + e, 1);
      }
    },

    /**
     * Requests the user media (audio/video)
     * @private
     * @param {Function} callback
     */
    _peer_get_user_media: function(callback) {
      this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media', 4);

      try {
        if(this.get_local_stream() === null) {
          this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media > Getting user media...', 2);

          (WEBRTC_GET_MEDIA.bind(navigator))(
            this.utils.generate_constraints(),
            this._peer_got_user_media_success.bind(this, callback),
            this._peer_got_user_media_error.bind(this)
          );
        } else {
          this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media > User media already acquired.', 2);

          callback();
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media > ' + e, 1);
      }
    },

    /**
     * Triggers the media obtained success event
     * @private
     * @param {Function} callback
     * @param {Object} stream
     */
    _peer_got_user_media_success: function(callback, stream) {
      this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success', 4);

      try {
        this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success > Got user media.', 2);

        this._set_local_stream(stream);

        if(callback && typeof callback == 'function') {
          if((this.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) && this.get_local_view().length) {
            var _this = this;

            var fn_loaded = function() {
              _this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success > Local video loaded.', 2);

              this.removeEventListener('loadeddata', fn_loaded, false);
              callback();
            };

            if(_this.get_local_view()[0].readyState >= JSJAC_JINGLE_MEDIA_READYSTATE_LOADED) {
              fn_loaded();
            } else {
              this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success > Waiting for local video to be loaded...', 2);

              _this.get_local_view()[0].addEventListener('loadeddata', fn_loaded, false);
            }
          } else {
            callback();
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success > ' + e, 1);
      }
    },

    /**
     * Triggers the SDP description retrieval success event
     * @private
     * @param {Object} sdp_local
     * @param {Function} [sdp_message_callback]
     */
    _peer_got_description: function(sdp_local, sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:base] _peer_got_description', 4);

      try {
        this.get_debug().log('[JSJaCJingle:base] _peer_got_description > Got local description.', 2);

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:base] _peer_got_description > SDP (local:raw)' + '\n\n' + sdp_local.sdp, 4);

        // Convert SDP raw data to an object
        var cur_name;
        var payload_parsed = this.sdp._parse_payload(sdp_local.sdp);
        this.sdp._resolution_payload(payload_parsed);

        for(cur_name in payload_parsed) {
          this._set_payloads_local(
            cur_name,
            payload_parsed[cur_name]
          );
        }

        var cur_semantics;
        var group_parsed = this.sdp._parse_group(sdp_local.sdp);

        for(cur_semantics in group_parsed) {
          this._set_group_local(
            cur_semantics,
            group_parsed[cur_semantics]
          );
        }

        // Filter our local description (remove unused medias)
        var sdp_local_desc = this.sdp._generate_description(
          sdp_local.type,
          this.get_group_local(),
          this.get_payloads_local(),

          this.sdp._generate_candidates(
            this.get_candidates_local()
          )
        );

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:base] _peer_got_description > SDP (local:gen)' + '\n\n' + sdp_local_desc.sdp, 4);

        var _this = this;

        this.get_peer_connection().setLocalDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_local_desc)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            var error_str = (typeof e == 'string') ? e : null;
            error_str = (error_str || e.message || e.name || 'Unknown error');

            if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:base] _peer_got_description > SDP (local:error)' + '\n\n' + error_str, 1);

            // Error (descriptions are incompatible)
          }
        );

        // Need to wait for local candidates?
        if(typeof sdp_message_callback == 'function') {
          this.get_debug().log('[JSJaCJingle:base] _peer_got_description > Executing SDP message callback.', 2);

          /* @function */
          sdp_message_callback();
        } else if(this.utils.count_candidates(this._shortcut_local_user_candidates()) === 0) {
          this.get_debug().log('[JSJaCJingle:base] _peer_got_description > Waiting for local candidates...', 2);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_got_description > ' + e, 1);
      }
    },

    /**
     * Triggers the SDP description not retrieved error event
     * @private
     */
    _peer_fail_description: function() {
      this.get_debug().log('[JSJaCJingle:base] _peer_fail_description', 4);

      try {
        this.get_debug().log('[JSJaCJingle:base] _peer_fail_description > Could not get local description!', 1);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_fail_description > ' + e, 1);
      }
    },

    /**
     * Enables/disables the local stream sound
     * @private
     * @param {Boolean} enable
     */
    _peer_sound: function(enable) {
      this.get_debug().log('[JSJaCJingle:base] _peer_sound', 4);

      try {
        this.get_debug().log('[JSJaCJingle:base] _peer_sound > Enable: ' + enable, 2);

        var i;
        var audio_tracks = this.get_local_stream().getAudioTracks();

        for(i = 0; i < audio_tracks.length; i++)
          audio_tracks[i].enabled = enable;
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_sound > ' + e, 1);
      }
    },

    /**
     * Attaches given stream to given DOM element
     * @private
     * @param {DOM} element
     * @param {Object} stream
     * @param {Boolean} mute
     */
    _peer_stream_attach: function(element, stream, mute) {
      try {
        var i;
        var stream_src = stream ? URL.createObjectURL(stream) : '';

        for(i in element) {
          element[i].src = stream_src;

          if(navigator.mozGetUserMedia)
            element[i].play();
          else
            element[i].autoplay = true;

          if(typeof mute == 'boolean') element[i].muted = mute;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_stream_attach > ' + e, 1);
      }
    },

    /**
     * Detaches stream from given DOM element
     * @private
     * @param {DOM} element
     */
    _peer_stream_detach: function(element) {
      try {
        var i;

        for(i in element) {
          element[i].pause();
          element[i].src = '';
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_stream_detach > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE STATES
     */

    /**
     * Am I responder?
     * @public
     * @returns {Boolean} Receiver state
     */
    is_responder: function() {
      return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
    },

    /**
     * Am I initiator?
     * @public
     * @returns {Boolean} Initiator state
     */
    is_initiator: function() {
      return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_INITIATOR.jingle;
    },



    /**
     * JSJSAC JINGLE SHORTCUTS
     */

    /**
     * Gets function handler for given member
     * @private
     * @param {Function|Object} member
     * @returns {Function} Handler
     */
    _shortcut_get_handler: function(member) {
      if(typeof member == 'function')
        return member;

      return function() {};
    },



    /**
     * JSJSAC JINGLE GETTERS
     */

    /**
     * Gets the namespace
     * @public
     * @returns {String} Namespace value
     */
    get_namespace: function() {
      return this._namespace;
    },

    /**
     * Gets the local payloads
     * @public
     * @param {String} [name]
     * @returns {Object} Local payloads object
     */
    get_payloads_local: function(name) {
      if(name)
        return (name in this._payloads_local) ? this._payloads_local[name] : {};

      return this._payloads_local;
    },

    /**
     * Gets the local group
     * @public
     * @param {String} [semantics]
     * @returns {Object} Local group object
     */
    get_group_local: function(semantics) {
      if(semantics)
        return (semantics in this._group_local) ? this._group_local[semantics] : {};

      return this._group_local;
    },

    /**
     * Gets the local candidates
     * @public
     * @param {String} [name]
     * @returns {Object} Local candidates object
     */
    get_candidates_local: function(name) {
      if(name)
        return (name in this._candidates_local) ? this._candidates_local[name] : {};

      return this._candidates_local;
    },

    /**
     * Gets the local candidates queue
     * @public
     * @param {String} [name]
     * @returns {Object} Local candidates queue object
     */
    get_candidates_queue_local: function(name) {
      if(name)
        return (name in this._candidates_queue_local) ? this._candidates_queue_local[name] : {};

      return this._candidates_queue_local;
    },

    /**
     * Gets the local content
     * @public
     * @param {String} [name]
     * @returns {Object} Local content object
     */
    get_content_local: function(name) {
      if(name)
        return (name in this._content_local) ? this._content_local[name] : {};

      return this._content_local;
    },

    /**
     * Gets the peer connection
     * @public
     * @returns {Object} Peer connection
     */
    get_peer_connection: function() {
      return this._peer_connection;
    },

    /**
     * Gets the ID
     * @public
     * @returns {Number} ID value
     */
    get_id: function() {
      return this._id;
    },

    /**
     * Gets the new ID
     * @public
     * @returns {String} New ID value
     */
    get_id_new: function() {
      var trans_id = this.get_id() + 1;
      this._set_id(trans_id);

      return this.get_id_pre() + trans_id;
    },

    /**
     * Gets the sent IDs
     * @public
     * @returns {Object} Sent IDs object
     */
    get_sent_id: function() {
      return this._sent_id;
    },

    /**
     * Gets the received IDs
     * @public
     * @returns {Object} Received IDs object
     */
    get_received_id: function() {
      return this._received_id;
    },

    /**
     * Gets the registered stanza handler
     * @public
     * @param {String} node
     * @param {String} type
     * @param {String} id
     * @returns {Array} Stanza handler
     */
    get_registered_handlers: function(node, type, id) {
      if(id && node in this._registered_handlers  &&
         type in this._registered_handlers[node]  &&
         typeof this._registered_handlers[node][type][id] == 'object')
        return this._registered_handlers[node][type][id];

      return [];
    },

    /**
     * Gets the deferred stanza handler
     * @public
     * @param {String} ns
     * @returns {Array} Stanza handler
     */
    get_deferred_handlers: function(ns) {
      return this._deferred_handlers[ns] || [];
    },

    /**
     * Gets the mute state
     * @public
     * @param {String} [name]
     * @returns {Boolean} Mute value
     */
    get_mute: function(name) {
      if(!name) name = '*';

      return (name in this._mute) ? this._mute[name] : false;
    },

    /**
     * Gets the lock value
     * @public
     * @returns {Boolean} Lock value
     */
    get_lock: function() {
      return this._lock || !JSJAC_JINGLE_AVAILABLE;
    },

    /**
     * Gets the media busy value
     * @public
     * @returns {Boolean} Media busy value
     */
    get_media_busy: function() {
      return this._media_busy;
    },

    /**
     * Gets the sid value
     * @public
     * @returns {String} SID value
     */
    get_sid: function() {
      return this._sid;
    },

    /**
     * Gets the status value
     * @public
     * @returns {String} Status value
     */
    get_status: function() {
      return this._status;
    },

    /**
     * Gets the connection value
     * @public
     * @returns {JSJaCConnection} Connection value
     */
    get_connection: function() {
      return this._connection;
    },

    /**
     * Gets the to value
     * @public
     * @returns {String} To value
     */
    get_to: function() {
      return this._to;
    },

    /**
     * Gets the initiator value
     * @public
     * @returns {String} Initiator value
     */
    get_initiator: function() {
      return this._initiator;
    },

    /**
     * Gets the responder value
     * @public
     * @returns {String} Responder value
     */
    get_responder: function() {
      return this._responder;
    },

    /**
     * Gets the creator value
     * @public
     * @param {String} [name]
     * @returns {String|Object} Creator value
     */
    get_creator: function(name) {
      if(name)
        return (name in this._creator) ? this._creator[name] : null;

      return this._creator;
    },

    /**
     * Gets the creator value (for this)
     * @public
     * @param {String} name
     * @returns {String} Creator value
     */
    get_creator_this: function(name) {
      return this.get_responder() == this.get_to() ? JSJAC_JINGLE_CREATOR_INITIATOR : JSJAC_JINGLE_CREATOR_RESPONDER;
    },

    /**
     * Gets the senders value
     * @public
     * @param {String} [name]
     * @returns {String} Senders value
     */
    get_senders: function(name) {
      if(name)
        return (name in this._senders) ? this._senders[name] : null;

      return this._senders;
    },

    /**
     * Gets the media value
     * @public
     * @returns {String} Media value
     */
    get_media: function() {
      return (this._media && this._media in JSJAC_JINGLE_MEDIAS) ? this._media : JSJAC_JINGLE_MEDIA_VIDEO;
    },

    /**
     * Gets a list of medias in use
     * @public
     * @returns {Object} Media list
     */
    get_media_all: function() {
      if(this.get_media() == JSJAC_JINGLE_MEDIA_AUDIO)
        return [JSJAC_JINGLE_MEDIA_AUDIO];

      return [JSJAC_JINGLE_MEDIA_AUDIO, JSJAC_JINGLE_MEDIA_VIDEO];
    },

    /**
     * Gets the video source value
     * @public
     * @returns {String} Video source value
     */
    get_video_source: function() {
      return (this._video_source && this._video_source in JSJAC_JINGLE_VIDEO_SOURCES) ? this._video_source : JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
    },

    /**
     * Gets the resolution value
     * @public
     * @returns {String} Resolution value
     */
    get_resolution: function() {
      return this._resolution ? (this._resolution).toString() : null;
    },

    /**
     * Gets the bandwidth value
     * @public
     * @returns {String} Bandwidth value
     */
    get_bandwidth: function() {
      return this._bandwidth ? (this._bandwidth).toString() : null;
    },

    /**
     * Gets the FPS value
     * @public
     * @returns {String} FPS value
     */
    get_fps: function() {
      return this._fps ? (this._fps).toString() : null;
    },

    /**
     * Gets the name value
     * @public
     * @param {String} [name]
     * @returns {String} Name value
     */
    get_name: function(name) {
      if(name)
        return name in this._name;

      return this._name;
    },

    /**
     * Gets the local stream
     * @public
     * @returns {Object} Local stream instance
     */
    get_local_stream: function() {
      return this._local_stream;
    },

    /**
     * Gets the local stream read-only state
     * @public
     * @returns {Boolean} Read-only state
     */
    get_local_stream_readonly: function() {
      return this._local_stream_readonly;
    },

    /**
     * Gets the local view value
     * @public
     * @returns {DOM} Local view
     */
    get_local_view: function() {
      return (typeof this._local_view == 'object') ? this._local_view : [];
    },

    /**
     * Gets the STUN servers
     * @public
     * @returns {Array} STUN servers
     */
    get_stun: function() {
      return (typeof this._stun == 'object') ? this._stun : [];
    },

    /**
     * Gets the TURN servers
     * @public
     * @returns {Array} TURN servers
     */
    get_turn: function() {
      return (typeof this._turn == 'object') ? this._turn : [];
    },

    /**
     * Gets the SDP trace value
     * @public
     * @returns {Boolean} SDP trace value
     */
    get_sdp_trace: function() {
      return (this._sdp_trace === true);
    },

    /**
     * Gets the network packet trace value
     * @public
     * @returns {Boolean} Network packet trace value
     */
    get_net_trace: function() {
      return (this._net_trace === true);
    },

    /**
     * Gets the debug value
     * @public
     * @returns {JSJaCDebugger} Debug value
     */
    get_debug: function() {
      return this._debug;
    },



    /**
     * JSJSAC JINGLE SETTERS
     */

    /**
     * Sets the namespace
     * @private
     * @param {String} Namespace value
     */
    _set_namespace: function(namespace) {
      this._namespace = namespace;
    },

    /**
     * Sets the local stream
     * @private
     * @param {Object} local_stream
     */
    _set_local_stream: function(local_stream) {
      try {
        if(this.get_local_stream_readonly() === true) {
          this.get_debug().log('[JSJaCJingle:base] _set_local_stream > Local stream is read-only, not setting it.', 0); return;
        }

        if(!local_stream && this._local_stream) {
          (this._local_stream).stop();

          this._peer_stream_detach(
            this.get_local_view()
          );
        }

        this._set_local_stream_raw(local_stream);

        if(local_stream) {
          this._peer_stream_attach(
            this.get_local_view(),
            this.get_local_stream(),
            true
          );
        } else {
          this._peer_stream_detach(
            this.get_local_view()
          );
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _set_local_stream > ' + e, 1);
      }
    },

    /**
     * Sets the local stream raw object (no further processing)
     * @private
     * @param {Object} local_stream
     */
    _set_local_stream_raw: function(local_stream) {
      this._local_stream = local_stream;
    },

    /**
     * Sets the local stream read-only state
     * @private
     * @param {Boolean} local_stream_readonly
     */
    _set_local_stream_readonly: function(local_stream_readonly) {
      this._local_stream_readonly = local_stream_readonly;
    },

    /**
     * Sets the local view
     * @private
     * @param {DOM} local_view
     */
    _set_local_view: function(local_view) {
      if(typeof this._local_view !== 'object')
        this._local_view = [];

      this._local_view.push(local_view);
    },

    /**
     * Sets the local payload
     * @private
     * @param {String} name
     * @param {Object} payload_data
     */
    _set_payloads_local: function(name, payload_data) {
      this._payloads_local[name] = payload_data;
    },

    /**
     * Sets the local group
     * @private
     * @param {String} name
     * @param {Object} group_data
     */
    _set_group_local: function(semantics, group_data) {
      this._group_local[semantics] = group_data;
    },

    /**
     * Sets the local candidates
     * @private
     * @param {String} name
     * @param {Object} candidate_data
     */
    _set_candidates_local: function(name, candidate_data) {
      if(!(name in this._candidates_local))  this._candidates_local[name] = [];

      (this._candidates_local[name]).push(candidate_data);
    },

    /**
     * Sets the local candidates queue
     * @private
     * @param {String} name
     * @param {Object} candidate_data
     */
    _set_candidates_queue_local: function(name, candidate_data) {
      try {
        if(name === null) {
          this._candidates_queue_local = {};
        } else {
          if(!(name in this._candidates_queue_local))  this._candidates_queue_local[name] = [];

          (this._candidates_queue_local[name]).push(candidate_data);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _set_candidates_queue_local > ' + e, 1);
      }
    },

    /**
     * Sets the local content
     * @private
     * @param {String} name
     * @param {Object} content_local
     */
    _set_content_local: function(name, content_local) {
      this._content_local[name] = content_local;
    },

    /**
     * Sets the peer connection
     * @private
     * @param {Object} peer_connection
     */
    _set_peer_connection: function(peer_connection) {
      this._peer_connection = peer_connection;
    },

    /**
     * Sets the ID
     * @private
     * @param {String|Number} id
     */
    _set_id: function(id) {
      this._id = id;
    },

    /**
     * Sets the sent ID
     * @private
     * @param {String|Number} sent_id
     */
    _set_sent_id: function(sent_id) {
      this._sent_id[sent_id] = 1;
    },

    /**
     * Sets the last received ID
     * @private
     * @param {String|Number} received_id
     */
    _set_received_id: function(received_id) {
      this._received_id[received_id] = 1;
    },

    /**
     * Sets the registered stanza handlers
     * @private
     * @param {String} node
     * @param {String} type
     * @param {String|Number} id
     * @param {Function} handler
     */
    _set_registered_handlers: function(node, type, id, handler) {
      if(!(node in this._registered_handlers))        this._registered_handlers[node] = {};
      if(!(type in this._registered_handlers[node]))  this._registered_handlers[node][type] = {};

      if(handler === null) {
        if(id in this._registered_handlers[node][type])
          delete this._registered_handlers[node][type][id];
      } else {
        if(typeof this._registered_handlers[node][type][id] != 'object')
          this._registered_handlers[node][type][id] = [];

        this._registered_handlers[node][type][id].push(handler);
      }
    },

    /**
     * Sets the deferred stanza handlers
     * @private
     * @param {String} ns
     * @param {Function|Object} handler
     */
    _set_deferred_handlers: function(ns, handler) {
      if(!(ns in this._deferred_handlers))  this._deferred_handlers[ns] = [];

      if(handler === null)
        delete this._deferred_handlers[ns];
      else
        this._deferred_handlers[ns].push(handler);
    },

    /**
     * Sets the mute state
     * @private
     * @param {String} [name]
     * @param {String} mute
     */
    _set_mute: function(name, mute) {
      if(!name || name == '*') {
        this._mute = {};
        name = '*';
      }

      this._mute[name] = mute;
    },

    /**
     * Sets the lock value
     * @private
     * @param {Boolean} lock
     */
    _set_lock: function(lock) {
      this._lock = lock;
    },

    /**
     * Gets the media busy value
     * @private
     * @param {Boolean} busy
     */
    _set_media_busy: function(busy) {
      this._media_busy = busy;
    },

    /**
     * Sets the session ID
     * @private
     * @param {String} sid
     */
    _set_sid: function(sid) {
      this._sid = sid;
    },

    /**
     * Sets the session status
     * @private
     * @param {String} status
     */
    _set_status: function(status) {
      this._status = status;
    },

    /**
     * Sets the session to value
     * @private
     * @param {String} to
     */
    _set_to: function(to) {
      this._to = to;
    },

    /**
     * Sets the session connection value
     * @private
     * @param {JSJaCConnection} connection
     */
    _set_connection: function(connection) {
      this._connection = connection;
    },

    /**
     * Sets the session initiator
     * @private
     * @param {String} initiator
     */
    _set_initiator: function(initiator) {
      this._initiator = initiator;
    },

    /**
     * Sets the session responder
     * @private
     * @param {String} responder
     */
    _set_responder: function(responder) {
      this._responder = responder;
    },

    /**
     * Sets the session creator
     * @private
     * @param {String} name
     * @param {String} creator
     */
    _set_creator: function(name, creator) {
      if(!(creator in JSJAC_JINGLE_CREATORS)) creator = JSJAC_JINGLE_CREATOR_INITIATOR;

      this._creator[name] = creator;
    },

     /**
     * Sets the session senders
     * @private
     * @param {String} name
     * @param {String} senders
     */
    _set_senders: function(name, senders) {
      if(!(senders in JSJAC_JINGLE_SENDERS)) senders = JSJAC_JINGLE_SENDERS_BOTH.jingle;

      this._senders[name] = senders;
    },

    /**
     * Sets the session media
     * @private
     * @param {String} media
     */
    _set_media: function(media) {
      this._media = media;
    },

    /**
     * Sets the video source
     * @private
     */
    _set_video_source: function() {
      this._video_source = video_source;
    },

    /**
     * Sets the video resolution
     * @private
     * @param {String} resolution
     */
    _set_resolution: function(resolution) {
      this._resolution = resolution;
    },

    /**
     * Sets the video bandwidth
     * @private
     * @param {Number} bandwidth
     */
    _set_bandwidth: function(bandwidth) {
      this._bandwidth = bandwidth;
    },

    /**
     * Sets the video FPS
     * @private
     * @param {Number} fps
     */
    _set_fps: function(fps) {
      this._fps = fps;
    },

    /**
     * Sets the source name
     * @private
     * @param {String} name
     */
    _set_name: function(name) {
      this._name[name] = 1;
    },

    /**
     * Sets the STUN server address
     * @private
     * @param {String} stun_host
     * @param {Object} stun_data
     */
    _set_stun: function(stun_host, stun_data) {
      this._stun.push(
        this.utils.object_collect(
          { 'host': stun_host },
          stun_data
        )
      );
    },

    /**
     * Sets the TURN server address
     * @private
     * @param {String} turn_host
     * @param {Object} turn_data
     */
    _set_turn: function(turn_host, turn_data) {
      this._turn.push(
        this.utils.object_collect(
          { 'host': turn_host },
          turn_data
        )
      );
    },

    /**
     * Enables/disables SDP traces
     * @public
     * @param {Boolean} sdp_trace
     */
    set_sdp_trace: function(sdp_trace) {
      this._sdp_trace = sdp_trace;
    },

    /**
     * Enables/disables network traces
     * @public
     * @param {Boolean} net_trace
     */
    set_net_trace: function(net_trace) {
      this._net_trace = net_trace;
    },

    /**
     * Sets the debugging wrapper
     * @public
     * @param {JSJaCDebugger} debug
     */
    set_debug: function(debug) {
      this._debug = debug;
    },
  }
);

/**
 * @fileoverview JSJaC Jingle library - Single (one-to-one) call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/single */
/** @exports JSJaCJingleSingle */


/**
 * Creates a new XMPP Jingle session.
 * @class
 * @classdesc  Creates a new XMPP Jingle session.
 * @augments   __JSJaCJingleBase
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @requires   jsjac-jingle/main
 * @requires   jsjac-jingle/base
 * @see        {@link http://xmpp.org/extensions/xep-0166.html|XEP-0166: Jingle}
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 * @param      {Object}    [args]                            - Jingle session arguments.
 * @property   {*}         [args.*]                          - Herits of JSJaCJingle() baseclass prototype.
 * @property   {Function}  [args.session_initiate_pending]   - The initiate pending custom handler.
 * @property   {Function}  [args.session_initiate_success]   - The initiate success custom handler.
 * @property   {Function}  [args.session_initiate_error]     - The initiate error custom handler.
 * @property   {Function}  [args.session_initiate_request]   - The initiate request custom handler.
 * @property   {Function}  [args.session_accept_pending]     - The accept pending custom handler.
 * @property   {Function}  [args.session_accept_success]     - The accept success custom handler.
 * @property   {Function}  [args.session_accept_error]       - The accept error custom handler.
 * @property   {Function}  [args.session_accept_request]     - The accept request custom handler.
 * @property   {Function}  [args.session_info_pending]       - The info request custom handler.
 * @property   {Function}  [args.session_info_success]       - The info success custom handler.
 * @property   {Function}  [args.session_info_error]         - The info error custom handler.
 * @property   {Function}  [args.session_info_request]       - The info request custom handler.
 * @property   {Function}  [args.session_terminate_pending]  - The terminate pending custom handler.
 * @property   {Function}  [args.session_terminate_success]  - The terminate success custom handler.
 * @property   {Function}  [args.session_terminate_error]    - The terminate error custom handler.
 * @property   {Function}  [args.session_terminate_request]  - The terminate request custom handler.
 * @property   {Function}  [args.stream_add]                 - The stream add custom handler.
 * @property   {Function}  [args.stream_remove]              - The stream remove custom handler.
 * @property   {Function}  [args.stream_connected]           - The stream connected custom handler.
 * @property   {Function}  [args.stream_disconnected]        - The stream disconnected custom handler.
 * @property   {DOM}       [args.remote_view]                - The path to the remote stream view element.
 * @property   {DOM}       [args.sid]                        - The session ID (forced).
 */
var JSJaCJingleSingle = ring.create([__JSJaCJingleBase],
  /** @lends JSJaCJingleSingle.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      this.$super(args);

      if(args && args.session_initiate_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_pending = args.session_initiate_pending;

      if(args && args.session_initiate_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_success = args.session_initiate_success;

      if(args && args.session_initiate_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_error = args.session_initiate_error;

      if(args && args.session_initiate_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_request = args.session_initiate_request;

      if(args && args.session_accept_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_accept_pending = args.session_accept_pending;

      if(args && args.session_accept_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_accept_success = args.session_accept_success;

      if(args && args.session_accept_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_accept_error = args.session_accept_error;

      if(args && args.session_accept_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_accept_request = args.session_accept_request;

      if(args && args.session_info_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_info_pending = args.session_info_pending;

      if(args && args.session_info_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_info_success = args.session_info_success;

      if(args && args.session_info_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_info_error = args.session_info_error;

      if(args && args.session_info_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_info_request = args.session_info_request;

      if(args && args.session_terminate_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_terminate_pending = args.session_terminate_pending;

      if(args && args.session_terminate_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_terminate_success = args.session_terminate_success;

      if(args && args.session_terminate_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_terminate_error = args.session_terminate_error;

      if(args && args.session_terminate_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_terminate_request = args.session_terminate_request;

      if(args && args.stream_add)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._stream_add = args.stream_add;

      if(args && args.stream_remove)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._stream_remove = args.stream_remove;

      if(args && args.stream_connected)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._stream_connected = args.stream_connected;

      if(args && args.stream_disconnected)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._stream_disconnected = args.stream_disconnected;

      if(args && args.remote_view)
        /**
         * @member {Object}
         * @default
         * @private
         */
        this._remote_view = [args.remote_view];

      if(args && args.sid)
        /**
         * @member {String}
         * @default
         * @private
         */
        this._sid = [args.sid];

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._remote_stream = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._content_remote = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._payloads_remote = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._group_remote = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._candidates_remote = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._candidates_queue_remote = {};

      /**
       * @member {String|Object}
       * @default
       * @private
       */
      this._last_ice_state = null;

      /**
       * @constant
       * @member {String}
       * @default
       * @private
       */
      this._status = JSJAC_JINGLE_STATUS_INACTIVE;

      /**
       * @constant
       * @member {String}
       * @default
       * @private
       */
      this._reason = JSJAC_JINGLE_REASON_CANCEL;

      /**
       * @constant
       * @member {String}
       * @default
       * @private
       */
      this._namespace = NS_JINGLE;
    },


    /**
     * Initiates a new Jingle session.
     * @public
     * @fires JSJaCJingleSingle#get_session_initiate_pending
     */
    initiate: function() {
      this.get_debug().log('[JSJaCJingle:single] initiate', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:single] initiate > Cannot initiate, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.initiate(); })) {
          this.get_debug().log('[JSJaCJingle:single] initiate > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Slot unavailable?
        if(this.get_status() !== JSJAC_JINGLE_STATUS_INACTIVE) {
          this.get_debug().log('[JSJaCJingle:single] initiate > Cannot initiate, resource not inactive (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.get_debug().log('[JSJaCJingle:single] initiate > New Jingle Single session with media: ' + this.get_media(), 2);

        // Common vars
        var i, cur_name;

        // Trigger init pending custom callback
        /* @function */
        (this.get_session_initiate_pending())(this);

        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_INITIATING);

        // Set session values
        if(!this.get_sid())  this._set_sid(this.utils.generate_sid());

        this._set_initiator(this.utils.connection_jid());
        this._set_responder(this.get_to());

        for(i in this.get_media_all()) {
          cur_name = this.utils.name_generate(
            this.get_media_all()[i]
          );

          this._set_name(cur_name);

          this._set_senders(
            cur_name,
            JSJAC_JINGLE_SENDERS_BOTH.jingle
          );

          this._set_creator(
            cur_name,
            JSJAC_JINGLE_CREATOR_INITIATOR
          );
        }

        // Register session to common router
        JSJaCJingle._add(JSJAC_JINGLE_SESSION_SINGLE, this.get_sid(), this);

        // Initialize WebRTC
        this._peer_get_user_media(function() {
          _this._peer_connection_create(
            function() {
              _this.get_debug().log('[JSJaCJingle:single] initiate > Ready to begin Jingle negotiation.', 2);

              _this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INITIATE });
            }
          );
        });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] initiate > ' + e, 1);
      }
    },

    /**
     * Accepts the Jingle session.
     * @public
     * @fires JSJaCJingleSingle#get_session_accept_pending
     */
    accept: function() {
      this.get_debug().log('[JSJaCJingle:single] accept', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:single] accept > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.accept(); })) {
          this.get_debug().log('[JSJaCJingle:single] accept > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Slot unavailable?
        if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATED) {
          this.get_debug().log('[JSJaCJingle:single] accept > Cannot accept, resource not initiated (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.get_debug().log('[JSJaCJingle:single] accept > New Jingle session with media: ' + this.get_media(), 2);

        // Trigger accept pending custom callback
        /* @function */
        (this.get_session_accept_pending())(this);

        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

        // Initialize WebRTC
        this._peer_get_user_media(function() {
          _this._peer_connection_create(
            function() {
              _this.get_debug().log('[JSJaCJingle:single] accept > Ready to complete Jingle negotiation.', 2);

              // Process accept actions
              _this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_ACCEPT });
            }
          );
        });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] accept > ' + e, 1);
      }
    },

    /**
     * Sends a Jingle session info.
     * @public
     * @param {String} name
     * @param {Object} [args]
     */
    info: function(name, args) {
      this.get_debug().log('[JSJaCJingle:single] info', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:single] info > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.info(name, args); })) {
          this.get_debug().log('[JSJaCJingle:single] info > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Slot unavailable?
        if(!(this.get_status() === JSJAC_JINGLE_STATUS_INITIATED  ||
             this.get_status() === JSJAC_JINGLE_STATUS_ACCEPTING  ||
             this.get_status() === JSJAC_JINGLE_STATUS_ACCEPTED)) {
          this.get_debug().log('[JSJaCJingle:single] info > Cannot send info, resource not active (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Trigger info pending custom callback
        /* @function */
        (this.get_session_info_pending())(this);

        if(typeof args !== 'object') args = {};

        // Build final args parameter
        args.action = JSJAC_JINGLE_ACTION_SESSION_INFO;
        if(name) args.info = name;

        this.send(JSJAC_JINGLE_IQ_TYPE_SET, args);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] info > ' + e, 1);
      }
    },

    /**
     * Terminates the Jingle session.
     * @public
     * @fires JSJaCJingleSingle#get_session_terminate_pending
     * @param {String} reason
     */
    terminate: function(reason) {
      this.get_debug().log('[JSJaCJingle:single] terminate', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:single] terminate > Cannot terminate, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.terminate(reason); })) {
          this.get_debug().log('[JSJaCJingle:single] terminate > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_STATUS_TERMINATED) {
          this.get_debug().log('[JSJaCJingle:single] terminate > Cannot terminate, resource already terminated (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_TERMINATING);

        // Trigger terminate pending custom callback
        /* @function */
        (this.get_session_terminate_pending())(this);

        // Process terminate actions
        this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_TERMINATE, reason: reason });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] terminate > ' + e, 1);
      }
    },

    /**
     * Aborts the Jingle session.
     * @public
     * @param {Boolean} [set_lock]
     */
    abort: function(set_lock) {
      this.get_debug().log('[JSJaCJingle:single] abort', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

        // Stop WebRTC
        this._peer_stop();

        // Lock session? (cannot be used later)
        if(set_lock === true)  this._set_lock(true);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] abort > ' + e, 1);
      }
    },

    /**
     * Sends a given Jingle stanza packet
     * @public
     * @param {String} type
     * @param {Object} [args]
     * @returns {Boolean} Success
     */
    send: function(type, args) {
      this.get_debug().log('[JSJaCJingle:single] send', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:single] send > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
          return false;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.send(type, args); })) {
          this.get_debug().log('[JSJaCJingle:single] send > Deferred (waiting for the library components to be initiated).', 0);
          return false;
        }

        // Assert
        if(typeof args !== 'object') args = {};

        // Build stanza
        var stanza = new JSJaCIQ();
        stanza.setTo(this.get_to());

        if(type) stanza.setType(type);

        if(!args.id) args.id = this.get_id_new();
        stanza.setID(args.id);

        if(type == JSJAC_JINGLE_IQ_TYPE_SET) {
          if(!(args.action && args.action in JSJAC_JINGLE_ACTIONS)) {
            this.get_debug().log('[JSJaCJingle:single] send > Stanza action unknown: ' + (args.action || 'undefined'), 1);
            return false;
          }

          // Submit to registered handler
          switch(args.action) {
            case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
              this._send_content_accept(stanza); break;

            case JSJAC_JINGLE_ACTION_CONTENT_ADD:
              this._send_content_add(stanza); break;

            case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
              this._send_content_modify(stanza); break;

            case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
              this._send_content_reject(stanza); break;

            case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
              this._send_content_remove(stanza); break;

            case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
              this._send_description_info(stanza); break;

            case JSJAC_JINGLE_ACTION_SECURITY_INFO:
              this._send_security_info(stanza); break;

            case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
              this._send_session_accept(stanza, args); break;

            case JSJAC_JINGLE_ACTION_SESSION_INFO:
              this._send_session_info(stanza, args); break;

            case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
              this._send_session_initiate(stanza, args); break;

            case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
              this._send_session_terminate(stanza, args); break;

            case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
              this._send_transport_accept(stanza); break;

            case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
              this._send_transport_info(stanza, args); break;

            case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
              this._send_transport_reject(stanza); break;

            case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
              this._send_transport_replace(stanza); break;

            default:
              this.get_debug().log('[JSJaCJingle:single] send > Unexpected error.', 1);

              return false;
          }
        } else if(type != JSJAC_JINGLE_IQ_TYPE_RESULT) {
          this.get_debug().log('[JSJaCJingle:single] send > Stanza type must either be set or result.', 1);

          return false;
        }

        this._set_sent_id(args.id);

        this.get_connection().send(stanza);

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:single] send > Outgoing packet sent' + '\n\n' + stanza.xml());

        return true;
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] send > ' + e, 1);
      }

      return false;
    },

    /**
     * Handles a given Jingle stanza response
     * @private
     * @fires JSJaCJingleSingle#_handle_content_accept
     * @fires JSJaCJingleSingle#_handle_content_add
     * @fires JSJaCJingleSingle#_handle_content_modify
     * @fires JSJaCJingleSingle#_handle_content_reject
     * @fires JSJaCJingleSingle#_handle_content_remove
     * @fires JSJaCJingleSingle#_handle_description_info
     * @fires JSJaCJingleSingle#_handle_security_info
     * @fires JSJaCJingleSingle#_handle_session_accept
     * @fires JSJaCJingleSingle#_handle_session_info
     * @fires JSJaCJingleSingle#_handle_session_initiate
     * @fires JSJaCJingleSingle#_handle_session_terminate
     * @fires JSJaCJingleSingle#_handle_transport_accept
     * @fires JSJaCJingleSingle#_handle_transport_info
     * @fires JSJaCJingleSingle#_handle_transport_reject
     * @fires JSJaCJingleSingle#_handle_transport_replace
     * @param {JSJaCPacket} stanza
     */
    handle: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] handle', 4);

      try {
        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:single] handle > Incoming packet received' + '\n\n' + stanza.xml());

        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:single] handle > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.handle(stanza); })) {
          this.get_debug().log('[JSJaCJingle:single] handle > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        var id   = stanza.getID();
        var type = stanza.getType();

        if(id && type == JSJAC_JINGLE_IQ_TYPE_RESULT)  this._set_received_id(id);

        // Submit to custom handler
        var i, handlers = this.get_registered_handlers(JSJAC_JINGLE_STANZA_IQ, type, id);

        if(typeof handlers == 'object' && handlers.length) {
          this.get_debug().log('[JSJaCJingle:single] handle > Submitted to custom registered handlers.', 2);

          for(i in handlers) {
            /* @function */
            handlers[i](stanza);
          }

          this.unregister_handler(JSJAC_JINGLE_STANZA_IQ, type, id);

          return;
        }

        var jingle = this.utils.stanza_jingle(stanza);

        // Don't handle non-Jingle stanzas there...
        if(!jingle) return;

        var action = this.utils.stanza_get_attribute(jingle, 'action');

        // Don't handle action-less Jingle stanzas there...
        if(!action) return;

        // Submit to registered handler
        switch(action) {
          case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
            this._handle_content_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_ADD:
            this._handle_content_add(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
            this._handle_content_modify(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
            this._handle_content_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
            this._handle_content_remove(stanza); break;

          case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
            this._handle_description_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SECURITY_INFO:
            this._handle_security_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
            this._handle_session_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_SESSION_INFO:
            this._handle_session_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
            this._handle_session_initiate(stanza); break;

          case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
            this._handle_session_terminate(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
            this._handle_transport_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
            this._handle_transport_info(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
            this._handle_transport_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
            this._handle_transport_replace(stanza); break;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] handle > ' + e, 1);
      }
    },

    /**
     * Mutes a Jingle session (local)
     * @public
     * @param {String} name
     */
    mute: function(name) {
      this.get_debug().log('[JSJaCJingle:single] mute', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:single] mute > Cannot mute, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.mute(name); })) {
          this.get_debug().log('[JSJaCJingle:single] mute > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Already muted?
        if(this.get_mute(name) === true) {
          this.get_debug().log('[JSJaCJingle:single] mute > Resource already muted.', 0);
          return;
        }

        this._peer_sound(false);
        this._set_mute(name, true);

        this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_MUTE, name: name });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] mute > ' + e, 1);
      }
    },

    /**
     * Unmutes a Jingle session (local)
     * @public
     * @param {String} name
     */
    unmute: function(name) {
      this.get_debug().log('[JSJaCJingle:single] unmute', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:single] unmute > Cannot unmute, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.unmute(name); })) {
          this.get_debug().log('[JSJaCJingle:single] unmute > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Already unmute?
        if(this.get_mute(name) === false) {
          this.get_debug().log('[JSJaCJingle:single] unmute > Resource already unmuted.', 0);
          return;
        }

        this._peer_sound(true);
        this._set_mute(name, false);

        this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_UNMUTE, name: name });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] unmute > ' + e, 1);
      }
    },

    /**
     * Toggles media type in a Jingle session
     * @todo Code media() (Single version)
     * @public
     * @param {String} [media]
     */
    media: function(media) {
      /* DEV: don't expect this to work as of now! */
      /* MEDIA() - SINGLE VERSION */

      this.get_debug().log('[JSJaCJingle:single] media', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:single] media > Cannot change media, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.media(media); })) {
          this.get_debug().log('[JSJaCJingle:single] media > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Toggle media?
        if(!media)
          media = (this.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;

        // Media unknown?
        if(!(media in JSJAC_JINGLE_MEDIAS)) {
          this.get_debug().log('[JSJaCJingle:single] media > No media provided or media unsupported (media: ' + media + ').', 0);
          return;
        }

        // Already using provided media?
        if(this.get_media() == media) {
          this.get_debug().log('[JSJaCJingle:single] media > Resource already using this media (media: ' + media + ').', 0);
          return;
        }

        // Switch locked for now? (another one is being processed)
        if(this.get_media_busy()) {
          this.get_debug().log('[JSJaCJingle:single] media > Resource already busy switching media (busy: ' + this.get_media() + ', media: ' + media + ').', 0);
          return;
        }

        this.get_debug().log('[JSJaCJingle:single] media > Changing media to: ' + media + '...', 2);

        // Store new media
        this._set_media(media);
        this._set_media_busy(true);

        // Toggle video mode (add/remove)
        if(media == JSJAC_JINGLE_MEDIA_VIDEO) {
          /* @todo the flow is something like that... */
          /*this._peer_get_user_media(function() {
            this._peer_connection_create(
              function() {
                this.get_debug().log('[JSJaCJingle:muji] media > Ready to change media (to: ' + media + ').', 2);

                // 'content-add' >> video
                // @todo restart video stream configuration

                // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)

                this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_ADD, name: JSJAC_JINGLE_MEDIA_VIDEO });
              }
            )
          });*/
        } else {
          /* @todo the flow is something like that... */
          /*this._peer_get_user_media(function() {
            this._peer_connection_create(
              function() {
                this.get_debug().log('[JSJaCJingle:muji] media > Ready to change media (to: ' + media + ').', 2);

                // 'content-remove' >> video
                // @todo remove video stream configuration

                // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)
                //          here, only stop the video stream, do not touch the audio stream

                this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_REMOVE, name: JSJAC_JINGLE_MEDIA_VIDEO });
              }
            )
          });*/
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] media > ' + e, 1);
      }
    },


    /**
     * JSJSAC JINGLE SENDERS
     */

    /**
     * Sends the Jingle content accept
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_content_accept: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_accept', 4);

      try {
        /* @todo remove from remote 'content-add' queue */
        /* @todo reprocess content_local/content_remote */

        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_content_accept > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_content_accept > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle content add
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_content_add: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_add', 4);

      try {
        /* @todo push to local 'content-add' queue */

        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_content_add > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_content_add > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle content modify
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_content_modify: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_modify', 4);

      try {
        /* @todo push to local 'content-modify' queue */

        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_content_modify > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_content_modify > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle content reject
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_content_reject: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_reject', 4);

      try {
        /* @todo remove from remote 'content-add' queue */

        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_content_reject > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_content_reject > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle content remove
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_content_remove: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_remove', 4);

      try {
        /* @todo add to local 'content-remove' queue */

        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_content_remove > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_content_remove > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle description info
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_description_info: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_description_info', 4);

      try {
        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_description_info > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_description_info > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle security info
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_security_info: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_security_info', 4);

      try {
        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_security_info > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_security_info > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle session accept
     * @private
     * @fires JSJaCJingleSingle#_handle_session_accept_success
     * @fires JSJaCJingleSingle#_handle_session_accept_error
     * @fires JSJaCJingleSingle#get_session_accept_success
     * @fires JSJaCJingleSingle#get_session_accept_error
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_accept: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:single] _send_session_accept', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTING) {
          this.get_debug().log('[JSJaCJingle:single] _send_session_accept > Cannot send accept stanza, resource not accepting (status: ' + this.get_status() + ').', 0);
          this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:single] _send_session_accept > Arguments not provided.', 1);
          return;
        }

        // Build Jingle stanza
        var jingle = this.utils.stanza_generate_jingle(stanza, {
          'action'    : JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
          'responder' : this.get_responder()
        });

        this.utils.stanza_generate_content_local(stanza, jingle, true);
        this.utils.stanza_generate_group_local(stanza, jingle);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
          /* @function */
          (_this.get_session_accept_success())(_this, stanza);
          _this._handle_session_accept_success(stanza);
        });

        // Schedule error timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
          /* @function */
          external:   this.get_session_accept_error().bind(this),
          internal:   this._handle_session_accept_error.bind(this)
        });

        this.get_debug().log('[JSJaCJingle:single] _send_session_accept > Sent.', 4);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_accept > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle session info
     * @private
     * @fires JSJaCJingleSingle#_handle_session_info_success
     * @fires JSJaCJingleSingle#_handle_session_info_error
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_info: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:single] _send_session_info', 4);

      try {
        if(!args) {
          this.get_debug().log('[JSJaCJingle:single] _send_session_info > Arguments not provided.', 1);
          return;
        }

        // Filter info
        args.info = args.info || JSJAC_JINGLE_SESSION_INFO_ACTIVE;

        // Build Jingle stanza
        var jingle = this.utils.stanza_generate_jingle(stanza, {
          'action'    : JSJAC_JINGLE_ACTION_SESSION_INFO,
          'initiator' : this.get_initiator()
        });

        this.utils.stanza_generate_session_info(stanza, jingle, args);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
          /* @function */
          (_this.get_session_info_success())(this, stanza);
          _this._handle_session_info_success(stanza);
        });

        // Schedule error timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
          /* @function */
          external:   this.get_session_info_error().bind(this),
          internal:   this._handle_session_info_error.bind(this)
        });

        this.get_debug().log('[JSJaCJingle:single] _send_session_info > Sent (name: ' + args.info + ').', 2);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_info > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle session initiate
     * @private
     * @fires JSJaCJingleSingle#_handle_initiate_info_success
     * @fires JSJaCJingleSingle#_handle_initiate_info_error
     * @fires JSJaCJingleSingle#get_session_initiate_success
     * @fires JSJaCJingleSingle#get_session_initiate_error
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_initiate: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:single] _send_session_initiate', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATING) {
          this.get_debug().log('[JSJaCJingle:single] _send_session_initiate > Cannot send initiate stanza, resource not initiating (status: ' + this.get_status() + ').', 0);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:single] _send_session_initiate > Arguments not provided.', 1);
          return;
        }

        // Build Jingle stanza
        var jingle = this.utils.stanza_generate_jingle(stanza, {
          'action'    : JSJAC_JINGLE_ACTION_SESSION_INITIATE,
          'initiator' : this.get_initiator()
        });

        this.utils.stanza_generate_content_local(stanza, jingle, true);
        this.utils.stanza_generate_group_local(stanza, jingle);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
          /* @function */
          (_this.get_session_initiate_success())(_this, stanza);
          _this._handle_session_initiate_success(stanza);
        });

        // Schedule error timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
          /* @function */
          external:   this.get_session_initiate_error().bind(this),
          internal:   this._handle_session_initiate_error.bind(this)
        });

        this.get_debug().log('[JSJaCJingle:single] _send_session_initiate > Sent.', 2);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_initiate > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle session terminate
     * @private
     * @fires JSJaCJingleSingle#_handle_session_terminate_success
     * @fires JSJaCJingleSingle#_handle_session_terminate_error
     * @fires JSJaCJingleSingle#get_session_terminate_success
     * @fires JSJaCJingleSingle#get_session_terminate_error
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_terminate: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:single] _send_session_terminate', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_STATUS_TERMINATING) {
          this.get_debug().log('[JSJaCJingle:single] _send_session_terminate > Cannot send terminate stanza, resource not terminating (status: ' + this.get_status() + ').', 0);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:single] _send_session_terminate > Arguments not provided.', 1);
          return;
        }

        // Filter reason
        args.reason = args.reason || JSJAC_JINGLE_REASON_SUCCESS;

        // Store terminate reason
        this._set_reason(args.reason);

        // Build terminate stanza
        var jingle = this.utils.stanza_generate_jingle(stanza, {
          'action': JSJAC_JINGLE_ACTION_SESSION_TERMINATE
        });

        var jingle_reason = jingle.appendChild(stanza.buildNode('reason', {'xmlns': this.get_namespace()}));
        jingle_reason.appendChild(stanza.buildNode(args.reason, {'xmlns': this.get_namespace()}));

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
          /* @function */
          (_this.get_session_terminate_success())(_this, stanza);
          _this._handle_session_terminate_success(stanza);
        });

        // Schedule error timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
          /* @function */
          external:   this.get_session_terminate_error().bind(this),
          internal:   this._handle_session_terminate_error.bind(this)
        });

        this.get_debug().log('[JSJaCJingle:single] _send_session_terminate > Sent (reason: ' + args.reason + ').', 2);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_terminate > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle transport accept
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_transport_accept: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_transport_accept', 4);

      try {
        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_transport_accept > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_transport_accept > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle transport info
     * @private
     * @fires JSJaCJingleSingle#_handle_transport_info_success
     * @fires JSJaCJingleSingle#_handle_transport_info_error
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_transport_info: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:single] _send_transport_info', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATED  &&
           this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTING  &&
           this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTED) {
          this.get_debug().log('[JSJaCJingle:single] _send_transport_info > Cannot send transport info, resource not initiated, nor accepting, nor accepted (status: ' + this.get_status() + ').', 0);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:single] _send_transport_info > Arguments not provided.', 1);
          return;
        }

        if(this.utils.object_length(this.get_candidates_queue_local()) === 0) {
          this.get_debug().log('[JSJaCJingle:single] _send_transport_info > No local candidate in queue.', 1);
          return;
        }

        // Build Jingle stanza
        var jingle = this.utils.stanza_generate_jingle(stanza, {
          'action'    : JSJAC_JINGLE_ACTION_TRANSPORT_INFO,
          'initiator' : this.get_initiator()
        });

        // Build queue content
        var cur_name;
        var content_queue_local = {};

        for(cur_name in this.get_name()) {
          content_queue_local[cur_name] = this.utils.generate_content(
              this.get_creator(cur_name),
              cur_name,
              this.get_senders(cur_name),
              this.get_payloads_local(cur_name),
              this.get_candidates_queue_local(cur_name)
          );
        }

        this.utils.stanza_generate_content_local(stanza, jingle, true, content_queue_local);
        this.utils.stanza_generate_group_local(stanza, jingle);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
          _this._handle_transport_info_success(stanza);
        });

        // Schedule error timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_IQ, JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
          internal: this._handle_transport_info_error.bind(this)
        });

        this.get_debug().log('[JSJaCJingle:single] _send_transport_info > Sent.', 2);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_transport_info > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle transport reject
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_transport_reject: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_transport_reject', 4);

      try {
        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_transport_reject > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_transport_reject > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle transport replace
     * @private
     * @param {JSJaCPacket} stanza
     */
    _send_transport_replace: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _send_transport_replace', 4);

      try {
        // Not implemented for now
        this.get_debug().log('[JSJaCJingle:single] _send_transport_replace > Feature not implemented!', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_transport_replace > ' + e, 1);
      }
    },

    /**
     * Sends the Jingle transport replace
     * @private
     * @param {JSJaCPacket} stanza
     * @param {Object} error
     */
    _send_error: function(stanza, error) {
      this.get_debug().log('[JSJaCJingle:single] _send_error', 4);

      try {
        // Assert
        if(!('type' in error)) {
          this.get_debug().log('[JSJaCJingle:single] _send_error > Type unknown.', 1);
          return;
        }

        if('jingle' in error && !(error.jingle in JSJAC_JINGLE_ERRORS)) {
          this.get_debug().log('[JSJaCJingle:single] _send_error > Jingle condition unknown (' + error.jingle + ').', 1);
          return;
        }

        if('xmpp' in error && !(error.xmpp in XMPP_ERRORS)) {
          this.get_debug().log('[JSJaCJingle:single] _send_error > XMPP condition unknown (' + error.xmpp + ').', 1);
          return;
        }

        var stanza_error = new JSJaCIQ();

        stanza_error.setType('error');
        stanza_error.setID(stanza.getID());
        stanza_error.setTo(this.get_to());

        var error_node = stanza_error.getNode().appendChild(stanza_error.buildNode('error', {'xmlns': NS_CLIENT, 'type': error.type}));

        if('xmpp'   in error) error_node.appendChild(stanza_error.buildNode(error.xmpp,   { 'xmlns': NS_STANZAS       }));
        if('jingle' in error) error_node.appendChild(stanza_error.buildNode(error.jingle, { 'xmlns': NS_JINGLE_ERRORS }));

        this.get_connection().send(stanza_error);

        this.get_debug().log('[JSJaCJingle:single] _send_error > Sent: ' + (error.jingle || error.xmpp), 2);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _send_error > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE HANDLERS
     */

    /**
     * Handles the Jingle content accept
     * @private
     * @event JSJaCJingleSingle#_handle_content_accept
     * @param {JSJaCPacket} stanza
     */
    _handle_content_accept: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_accept', 4);

      try {
        /* @todo start to flow accepted stream */
        /* @todo remove accepted content from local 'content-add' queue */
        /* @todo reprocess content_local/content_remote */

        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_content_accept > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle content add
     * @private
     * @event JSJaCJingleSingle#_handle_content_add
     * @param {JSJaCPacket} stanza
     */
    _handle_content_add: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_add', 4);

      try {
        /* @todo request the user to start this content (need a custom handler)
         *       on accept: send content-accept */
        /* @todo push to remote 'content-add' queue */
        /* @todo reprocess content_local/content_remote */

        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_content_add > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle content modify
     * @private
     * @event JSJaCJingleSingle#_handle_content_modify
     * @param {JSJaCPacket} stanza
     */
    _handle_content_modify: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_modify', 4);

      try {
        /* @todo change 'senders' value (direction of the stream)
         *       if(send:from_me): notify the user that media is requested
         *       if(unacceptable): terminate the session
         *       if(accepted):     change local/remote SDP */
        /* @todo reprocess content_local/content_remote */

        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_content_modify > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle content reject
     * @private
     * @event JSJaCJingleSingle#_handle_content_reject
     * @param {JSJaCPacket} stanza
     */
    _handle_content_reject: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_reject', 4);

      try {
        /* @todo remove rejected content from local 'content-add' queue */

        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_content_reject > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle content remove
     * @private
     * @event JSJaCJingleSingle#_handle_content_remove
     * @param {JSJaCPacket} stanza
     */
    _handle_content_remove: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_remove', 4);

      try {
        /* @todo stop flowing removed stream */
        /* @todo reprocess content_local/content_remote */

        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_content_remove > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle description info
     * @private
     * @event JSJaCJingleSingle#_handle_description_info
     * @param {JSJaCPacket} stanza
     */
    _handle_description_info: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_description_info', 4);

      try {
        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_description_info > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle security info
     * @private
     * @event JSJaCJingleSingle#_handle_security_info
     * @param {JSJaCPacket} stanza
     */
    _handle_security_info: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_security_info', 4);

      try {
        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_security_info > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session accept
     * @private
     * @event JSJaCJingleSingle#_handle_session_accept
     * @fires JSJaCJingleSingle#_handle_session_accept_success
     * @fires JSJaCJingleSingle#_handle_session_accept_error
     * @fires JSJaCJingleSingle#get_session_accept_success
     * @fires JSJaCJingleSingle#get_session_accept_error
     * @fires JSJaCJingleSingle#get_session_accept_request
     * @param {JSJaCPacket} stanza
     */
    _handle_session_accept: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_accept', 4);

      try {
        // Security preconditions
        if(!this.utils.stanza_safe(stanza)) {
          this.get_debug().log('[JSJaCJingle:single] _handle_session_accept > Dropped unsafe stanza.', 0);

          this._send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
          return;
        }

        // Can now safely dispatch the stanza
        switch(stanza.getType()) {
          case JSJAC_JINGLE_IQ_TYPE_RESULT:
            /* @function */
            (this.get_session_accept_success())(this, stanza);
            this._handle_session_accept_success(stanza);

            break;

          case 'error':
            /* @function */
            (this.get_session_accept_error())(this, stanza);
            this._handle_session_accept_error(stanza);

            break;

          case JSJAC_JINGLE_IQ_TYPE_SET:
            // External handler must be set before internal one here...
            /* @function */
            (this.get_session_accept_request())(this, stanza);
            this._handle_session_accept_request(stanza);

            break;

          default:
            this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_accept > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session accept success
     * @private
     * @event JSJaCJingleSingle#_handle_session_accept_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_accept_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_success', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_ACCEPTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session accept error
     * @private
     * @event JSJaCJingleSingle#_handle_session_accept_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_accept_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_error', 4);

      try {
        // Terminate the session (timeout)
        this.terminate(JSJAC_JINGLE_REASON_TIMEOUT);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session accept request
     * @private
     * @event JSJaCJingleSingle#_handle_session_accept_request
     * @fires JSJaCJingleSingle#_handle_session_accept_success
     * @fires JSJaCJingleSingle#_handle_session_accept_error
     * @fires JSJaCJingleSingle#get_session_accept_success
     * @fires JSJaCJingleSingle#get_session_accept_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_accept_request: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_request', 4);

      try {
        // Slot unavailable?
        if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATED) {
          this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_request > Cannot handle, resource already accepted (status: ' + this.get_status() + ').', 0);
          this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
          return;
        }

        // Common vars
        var i, cur_candidate_obj;

        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

        var rd_sid = this.utils.stanza_sid(stanza);

        // Request is valid?
        if(rd_sid && this.is_initiator() && this.utils.stanza_parse_content(stanza)) {
          // Handle additional data (optional)
          this.utils.stanza_parse_group(stanza);

          // Generate and store content data
          this.utils.build_content_remote();

          // Trigger accept success callback
          /* @function */
          (this.get_session_accept_success())(this, stanza);
          this._handle_session_accept_success(stanza);

          var sdp_remote = this.sdp._generate(
            WEBRTC_SDP_TYPE_ANSWER,
            this.get_group_remote(),
            this.get_payloads_remote(),
            this.get_candidates_queue_remote()
          );

          if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:single] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

          // Remote description
          var _this = this;

          this.get_peer_connection().setRemoteDescription(
            (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

            function() {
              // Success (descriptions are compatible)
            },

            function(e) {
              if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:single] SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

              // Error (descriptions are incompatible)
              _this.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
            }
          );

          // ICE candidates
          for(i in sdp_remote.candidates) {
            cur_candidate_obj = sdp_remote.candidates[i];

            this.get_peer_connection().addIceCandidate(
              new WEBRTC_ICE_CANDIDATE({
                sdpMLineIndex : cur_candidate_obj.id,
                candidate     : cur_candidate_obj.candidate
              })
            );
          }

          // Empty the unapplied candidates queue
          this._set_candidates_queue_remote(null);

          // Success reply
          this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });
        } else {
          // Trigger accept error callback
          /* @function */
          (this.get_session_accept_error())(this, stanza);
          this._handle_session_accept_error(stanza);

          // Send error reply
          this._send_error(stanza, XMPP_ERROR_BAD_REQUEST);

          this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_request > Error.', 1);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session info
     * @private
     * @event JSJaCJingleSingle#_handle_session_info
     * @fires JSJaCJingleSingle#_handle_session_info_success
     * @fires JSJaCJingleSingle#_handle_session_info_error
     * @fires JSJaCJingleSingle#_handle_session_info_request
     * @fires JSJaCJingleSingle#get_session_info_success
     * @fires JSJaCJingleSingle#get_session_info_error
     * @fires JSJaCJingleSingle#get_session_info_request
     * @param {JSJaCPacket} stanza
     */
    _handle_session_info: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_info', 4);

      try {
        // Security preconditions
        if(!this.utils.stanza_safe(stanza)) {
          this.get_debug().log('[JSJaCJingle:single] _handle_session_info > Dropped unsafe stanza.', 0);

          this._send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
          return;
        }

        // Can now safely dispatch the stanza
        switch(stanza.getType()) {
          case JSJAC_JINGLE_IQ_TYPE_RESULT:
            /* @function */
            (this.get_session_info_success())(this, stanza);
            this._handle_session_info_success(stanza);

            break;

          case 'error':
            /* @function */
            (this.get_session_info_error())(this, stanza);
            this._handle_session_info_error(stanza);

            break;

          case JSJAC_JINGLE_IQ_TYPE_SET:
            /* @function */
            (this.get_session_info_request())(this, stanza);
            this._handle_session_info_request(stanza);

            break;

          default:
            this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_info > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session info success
     * @private
     * @event JSJaCJingleSingle#_handle_session_info_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_info_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_info_success', 4);
    },

    /**
     * Handles the Jingle session info error
     * @private
     * @event JSJaCJingleSingle#_handle_session_info_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_info_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_info_error', 4);
    },

    /**
     * Handles the Jingle session info request
     * @private
     * @event JSJaCJingleSingle#_handle_session_info_request
     * @fires JSJaCJingleSingle#_handle_session_info_success
     * @fires JSJaCJingleSingle#_handle_session_info_error
     * @fires JSJaCJingleSingle#get_session_info_success
     * @fires JSJaCJingleSingle#get_session_info_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_info_request: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_info_request', 4);

      try {
        // Parse stanza
        var info_name = this.utils.stanza_session_info(stanza);
        var info_result = false;

        switch(info_name) {
          case JSJAC_JINGLE_SESSION_INFO_ACTIVE:
          case JSJAC_JINGLE_SESSION_INFO_RINGING:
          case JSJAC_JINGLE_SESSION_INFO_MUTE:
          case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
            info_result = true; break;
        }

        if(info_result) {
          this.get_debug().log('[JSJaCJingle:single] _handle_session_info_request > (name: ' + (info_name || 'undefined') + ').', 3);

          // Process info actions
          this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });

          // Trigger info success custom callback
          /* @function */
          (this.get_session_info_success())(this, stanza);
          this._handle_session_info_success(stanza);
        } else {
          this.get_debug().log('[JSJaCJingle:single] _handle_session_info_request > Error (name: ' + (info_name || 'undefined') + ').', 1);

          // Send error reply
          this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

          // Trigger info error custom callback
          /* @function */
          (this.get_session_info_error())(this, stanza);
          this._handle_session_info_error(stanza);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_info_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session initiate
     * @private
     * @event JSJaCJingleSingle#_handle_session_initiate
     * @fires JSJaCJingleSingle#_handle_session_initiate_success
     * @fires JSJaCJingleSingle#_handle_session_initiate_error
     * @fires JSJaCJingleSingle#_handle_session_initiate_request
     * @fires JSJaCJingleSingle#get_session_initiate_success
     * @fires JSJaCJingleSingle#get_session_initiate_error
     * @fires JSJaCJingleSingle#get_session_initiate_request
     * @param {JSJaCPacket} stanza
     */
    _handle_session_initiate: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate', 4);

      try {
        switch(stanza.getType()) {
          case JSJAC_JINGLE_IQ_TYPE_RESULT:
            /* @function */
            (this.get_session_initiate_success())(this, stanza);
            this._handle_session_initiate_success(stanza);

            break;

          case 'error':
            /* @function */
            (this.get_session_initiate_error())(this, stanza);
            this._handle_session_initiate_error(stanza);

            break;

          case JSJAC_JINGLE_IQ_TYPE_SET:
            /* @function */
            (this.get_session_initiate_request())(this, stanza);
            this._handle_session_initiate_request(stanza);

            break;

          default:
            this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session initiate success
     * @private
     * @event JSJaCJingleSingle#_handle_session_initiate_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_initiate_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_success', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_INITIATED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session initiate error
     * @private
     * @event JSJaCJingleSingle#_handle_session_initiate_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_initiate_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_error', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_INACTIVE);

        // Stop WebRTC
        this._peer_stop();

        // Lock session (cannot be used later)
        this._set_lock(true);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session initiate request
     * @private
     * @event JSJaCJingleSingle#_handle_session_initiate_request
     * @fires JSJaCJingleSingle#_handle_session_initiate_success
     * @fires JSJaCJingleSingle#_handle_session_initiate_error
     * @fires JSJaCJingleSingle#get_session_initiate_success
     * @fires JSJaCJingleSingle#get_session_initiate_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_initiate_request: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request', 4);

      try {
        // Slot unavailable?
        if(this.get_status() !== JSJAC_JINGLE_STATUS_INACTIVE) {
          this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request > Cannot handle, resource already initiated (status: ' + this.get_status() + ').', 0);
          this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
          return;
        }

        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_INITIATING);

        // Common vars
        var rd_from = this.utils.stanza_from(stanza);
        var rd_sid  = this.utils.stanza_sid(stanza);

        // Request is valid?
        if(rd_sid && this.utils.stanza_parse_content(stanza)) {
          // Handle additional data (optional)
          this.utils.stanza_parse_group(stanza);

          // Set session values
          this._set_sid(rd_sid);
          this._set_to(rd_from);
          this._set_initiator(rd_from);
          this._set_responder(this.utils.connection_jid());

          // Register session to common router
          JSJaCJingle._add(JSJAC_JINGLE_SESSION_SINGLE, rd_sid, this);

          // Generate and store content data
          this.utils.build_content_remote();

          // Video or audio-only session?
          if(JSJAC_JINGLE_MEDIA_VIDEO in this.get_content_remote()) {
            this._set_media(JSJAC_JINGLE_MEDIA_VIDEO);
          } else if(JSJAC_JINGLE_MEDIA_AUDIO in this.get_content_remote()) {
            this._set_media(JSJAC_JINGLE_MEDIA_AUDIO);
          } else {
            // Session initiation not done
            /* @function */
            (this.get_session_initiate_error())(this, stanza);
            this._handle_session_initiate_error(stanza);

            // Error (no media is supported)
            this.terminate(JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS);

            this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request > Error (unsupported media).', 1);
            return;
          }

          // Session initiate done
            /* @function */
          (this.get_session_initiate_success())(this, stanza);
          this._handle_session_initiate_success(stanza);

          this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });
        } else {
          // Session initiation not done
            /* @function */
          (this.get_session_initiate_error())(this, stanza);
          this._handle_session_initiate_error(stanza);

          // Send error reply
          this._send_error(stanza, XMPP_ERROR_BAD_REQUEST);

          this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request > Error (bad request).', 1);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session terminate
     * @private
     * @event JSJaCJingleSingle#_handle_session_terminate
     * @fires JSJaCJingleSingle#_handle_session_terminate_success
     * @fires JSJaCJingleSingle#_handle_session_terminate_error
     * @fires JSJaCJingleSingle#_handle_session_terminate_request
     * @fires JSJaCJingleSingle#get_session_terminate_success
     * @fires JSJaCJingleSingle#get_session_terminate_error
     * @fires JSJaCJingleSingle#get_session_terminate_request
     * @param {JSJaCPacket} stanza
     */
    _handle_session_terminate: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate', 4);

      try {
        var type = stanza.getType();

        // Security preconditions
        if(!this.utils.stanza_safe(stanza)) {
          this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate > Dropped unsafe stanza.', 0);

          this._send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
          return;
        }

        // Can now safely dispatch the stanza
        switch(stanza.getType()) {
          case JSJAC_JINGLE_IQ_TYPE_RESULT:
            /* @function */
            (this.get_session_terminate_success())(this, stanza);
            this._handle_session_terminate_success(stanza);

            break;

          case 'error':
            /* @function */
            (this.get_session_terminate_error())(this, stanza);
            this._handle_session_terminate_error(stanza);

            break;

          case JSJAC_JINGLE_IQ_TYPE_SET:
            /* @function */
            (this.get_session_terminate_request())(this, stanza);
            this._handle_session_terminate_request(stanza);

            break;

          default:
            this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session terminate success
     * @private
     * @event JSJaCJingleSingle#_handle_session_terminate_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_terminate_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_success', 4);

      try {
        this.abort();
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session terminate error
     * @private
     * @event JSJaCJingleSingle#_handle_session_terminate_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_terminate_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_error', 4);

      try {
        this.abort(true);

        this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_error > Forced session termination locally.', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session terminate request
     * @private
     * @event JSJaCJingleSingle#_handle_session_terminate_request
     * @fires JSJaCJingleSingle#_handle_session_terminate_success
     * @fires JSJaCJingleSingle#get_session_terminate_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_terminate_request: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_request', 4);

      try {
        // Slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_STATUS_INACTIVE  ||
           this.get_status() === JSJAC_JINGLE_STATUS_TERMINATED) {
          this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_request > Cannot handle, resource not active (status: ' + this.get_status() + ').', 0);
          this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
          return;
        }

        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_TERMINATING);

        // Store termination reason
        this._set_reason(this.utils.stanza_terminate_reason(stanza));

        // Trigger terminate success callbacks
        /* @function */
        (this.get_session_terminate_success())(this, stanza);
        this._handle_session_terminate_success(stanza);

        // Process terminate actions
        this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });

        this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_request > (reason: ' + this.get_reason() + ').', 3);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle transport accept
     * @private
     * @event JSJaCJingleSingle#_handle_transport_accept
     * @param {JSJaCPacket} stanza
     */
    _handle_transport_accept: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_transport_accept', 4);

      try {
        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_content_accept > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle transport info
     * @private
     * @event JSJaCJingleSingle#_handle_transport_info
     * @param {JSJaCPacket} stanza
     */
    _handle_transport_info: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_transport_info', 4);

      try {
        // Slot unavailable?
        if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATED  &&
           this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTING  &&
           this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTED) {
          this.get_debug().log('[JSJaCJingle:single] _handle_transport_info > Cannot handle, resource not initiated, nor accepting, nor accepted (status: ' + this.get_status() + ').', 0);
          this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
          return;
        }

        // Common vars
        var i, cur_candidate_obj;

        // Parse the incoming transport
        var rd_sid = this.utils.stanza_sid(stanza);

        // Request is valid?
        if(rd_sid && this.utils.stanza_parse_content(stanza)) {
          // Handle additional data (optional)
          // Still unsure if it is relevant to parse groups there... (are they allowed in such stanza?)
          //this.utils.stanza_parse_group(stanza);

          // Re-generate and store new content data
          this.utils.build_content_remote();

          var sdp_candidates_remote = this.sdp._generate_candidates(
            this.get_candidates_queue_remote()
          );

          // ICE candidates
          for(i in sdp_candidates_remote) {
            cur_candidate_obj = sdp_candidates_remote[i];

            this.get_peer_connection().addIceCandidate(
              new WEBRTC_ICE_CANDIDATE({
                sdpMLineIndex : cur_candidate_obj.id,
                candidate     : cur_candidate_obj.candidate
              })
            );
          }

          // Empty the unapplied candidates queue
          this._set_candidates_queue_remote(null);

          // Success reply
          this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });
        } else {
          // Send error reply
          this._send_error(stanza, XMPP_ERROR_BAD_REQUEST);

          this.get_debug().log('[JSJaCJingle:single] _handle_transport_info > Error.', 1);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_transport_info > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle transport info success
     * @private
     * @event JSJaCJingleSingle#_handle_transport_info_success
     * @param {JSJaCPacket} stanza
     */
    _handle_transport_info_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_transport_info_success', 4);
    },

    /**
     * Handles the Jingle transport info error
     * @private
     * @event JSJaCJingleSingle#_handle_transport_info_error
     * @param {JSJaCPacket} stanza
     */
    _handle_transport_info_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_transport_info_error', 4);
    },

    /**
     * Handles the Jingle transport reject
     * @private
     * @event JSJaCJingleSingle#_handle_transport_reject
     * @param {JSJaCPacket} stanza
     */
    _handle_transport_reject: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_transport_reject', 4);

      try {
        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_transport_reject > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle transport replace
     * @private
     * @event JSJaCJingleSingle#_handle_transport_replace
     * @param {JSJaCPacket} stanza
     */
    _handle_transport_replace: function(stanza) {
      this.get_debug().log('[JSJaCJingle:single] _handle_transport_replace', 4);

      try {
        // Not implemented for now
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _handle_transport_replace > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE PEER TOOLS
     */

    /**
     * Creates peer connection instance
     * @private
     */
    _peer_connection_create_instance: function() {
      this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_instance', 4);

      try {
        // Log STUN servers in use
        var i;
        var ice_config = this.utils.config_ice();

        if(typeof ice_config.iceServers == 'object') {
          for(i = 0; i < (ice_config.iceServers).length; i++)
            this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_instance > Using ICE server at: ' + ice_config.iceServers[i].url + ' (' + (i + 1) + ').', 2);
        } else {
          this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_instance > No ICE server configured. Network may not work properly.', 0);
        }

        // Create the RTCPeerConnection object
        this._set_peer_connection(
          new WEBRTC_PEER_CONNECTION(
            ice_config,
            WEBRTC_CONFIGURATION.peer_connection.constraints
          )
        );
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_instance > ' + e, 1);
      }
    },

    /**
     * Attaches peer connection callbacks
     * @private
     * @fires JSJaCJingleSingle#_peer_connection_callback_onicecandidate
     * @fires JSJaCJingleSingle#_peer_connection_callback_oniceconnectionstatechange
     * @fires JSJaCJingleSingle#_peer_connection_callback_onaddstream
     * @fires JSJaCJingleSingle#_peer_connection_callback_onremovestream
     * @param {Function} sdp_message_callback
     */
    _peer_connection_callbacks: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:single] _peer_connection_callbacks', 4);

      try {
        var _this = this;

        /**
         * Listens for incoming ICE candidates
         * @event JSJaCJingleSingle#_peer_connection_callback_onicecandidate
         * @type {Function}
         */
        this.get_peer_connection().onicecandidate = function(data) {
          _this._peer_connection_callback_onicecandidate.bind(this)(_this, sdp_message_callback, data);
        };

        /**
         * Listens for ICE connection state change
         * @event JSJaCJingleSingle#_peer_connection_callback_oniceconnectionstatechange
         * @type {Function}
         */
        this.get_peer_connection().oniceconnectionstatechange = function(data) {
          switch(this.iceConnectionState) {
            case JSJAC_JINGLE_ICE_CONNECTION_STATE_CONNECTED:
            case JSJAC_JINGLE_ICE_CONNECTION_STATE_COMPLETED:
              if(_this.get_last_ice_state() !== JSJAC_JINGLE_ICE_CONNECTION_STATE_CONNECTED) {
                /* @function */
                (_this.get_stream_connected()).bind(this)(_this, data);
                _this._set_last_ice_state(JSJAC_JINGLE_ICE_CONNECTION_STATE_CONNECTED);
              } break;

            case JSJAC_JINGLE_ICE_CONNECTION_STATE_DISCONNECTED:
            case JSJAC_JINGLE_ICE_CONNECTION_STATE_CLOSED:
              if(_this.get_last_ice_state() !== JSJAC_JINGLE_ICE_CONNECTION_STATE_DISCONNECTED) {
                /* @function */
                (_this.get_stream_disconnected()).bind(this)(_this, data);
                _this._set_last_ice_state(JSJAC_JINGLE_ICE_CONNECTION_STATE_DISCONNECTED);
              } break;
          }

          _this._peer_connection_callback_oniceconnectionstatechange.bind(this)(_this, data);
        };

        /**
         * Listens for stream add
         * @event JSJaCJingleSingle#_peer_connection_callback_onaddstream
         * @type {Function}
         */
        this.get_peer_connection().onaddstream = function(data) {
          /* @function */
          (_this.get_stream_add()).bind(this)(_this, data);
          _this._peer_connection_callback_onaddstream.bind(this)(_this, data);
        };

        /**
         * Listens for stream remove
         * @event JSJaCJingleSingle#_peer_connection_callback_onremovestream
         * @type {Function}
         */
        this.get_peer_connection().onremovestream = function(data) {
          /* @function */
          (_this.get_stream_remove()).bind(this)(_this, data);
          _this._peer_connection_callback_onremovestream.bind(this)(_this, data);
        };
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _peer_connection_callbacks > ' + e, 1);
      }
    },

    /**
     * Generates peer connection callback for 'onicecandidate'
     * @private
     * @callback
     * @param {JSJaCJingleSingle} _this
     * @param {Function} sdp_message_callback
     * @param {Object} data
     */
    _peer_connection_callback_onicecandidate: function(_this, sdp_message_callback, data) {
      _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onicecandidate', 4);

      try {
        if(data.candidate) {
          _this.sdp._parse_candidate_store_store_data(data);
        } else {
          // Build or re-build content (local)
          _this.utils.build_content_local();

          // In which action stanza should candidates be sent?
          if((_this.is_initiator() && _this.get_status() === JSJAC_JINGLE_STATUS_INITIATING)  ||
             (_this.is_responder() && _this.get_status() === JSJAC_JINGLE_STATUS_ACCEPTING)) {
            _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onicecandidate > Got initial candidates.', 2);

            // Execute what's next (initiate/accept session)
            sdp_message_callback();
          } else {
            _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onicecandidate > Got more candidates (on the go).', 2);

            // Send unsent candidates
            var candidates_queue_local = _this.get_candidates_queue_local();

            if(_this.utils.object_length(candidates_queue_local) > 0)
              _this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_TRANSPORT_INFO, candidates: candidates_queue_local });
          }

          // Empty the unsent candidates queue
          _this._set_candidates_queue_local(null);
        }
      } catch(e) {
        _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onicecandidate > ' + e, 1);
      }
    },

    /**
     * Generates peer connection callback for 'oniceconnectionstatechange'
     * @private
     * @callback
     * @param {JSJaCJingleSingle} _this
     * @param {Object} data
     */
    _peer_connection_callback_oniceconnectionstatechange: function(_this, data) {
      _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_oniceconnectionstatechange', 4);

      try {
        // Connection errors?
        switch(this.iceConnectionState) {
          case 'disconnected':
            _this._peer_timeout(this.iceConnectionState, {
              timer  : JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT,
              reason : JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR
            });
            break;

          case 'checking':
            _this._peer_timeout(this.iceConnectionState); break;
        }

        _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_oniceconnectionstatechange > (state: ' + this.iceConnectionState + ').', 2);
      } catch(e) {
        _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_oniceconnectionstatechange > ' + e, 1);
      }
    },

    /**
     * Generates peer connection callback for 'onaddstream'
     * @private
     * @callback
     * @param {JSJaCJingleSingle} _this
     * @param {Object} data
     */
    _peer_connection_callback_onaddstream: function(_this, data) {
      _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onaddstream', 4);

      try {
        if(!data) {
          _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onaddstream > No data passed, dropped.', 2); return;
        }

        // Attach remote stream to DOM view
        _this._set_remote_stream(data.stream);
      } catch(e) {
        _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onaddstream > ' + e, 1);
      }
    },

    /**
     * Generates peer connection callback for 'onremovestream'
     * @private
     * @callback
     * @param {JSJaCJingleSingle} _this
     * @param {Object} data
     */
    _peer_connection_callback_onremovestream: function(_this, data) {
      _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onremovestream', 4);

      try {
        // Detach remote stream from DOM view
        _this._set_remote_stream(null);
      } catch(e) {
        _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onremovestream > ' + e, 1);
      }
    },

    /**
     * Dispatches peer connection to correct creator (offer/answer)
     * @private
     * @param {Function} [sdp_message_callback] - Not used there
     */
    _peer_connection_create_dispatch: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_dispatch', 4);

      try {
        if(this.is_initiator())
          this._peer_connection_create_offer();
        else
          this._peer_connection_create_answer();
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_dispatch > ' + e, 1);
      }
    },

    /**
     * Creates peer connection offer
     * @private
     * @param {Function} [sdp_message_callback] - Not used there
     */
    _peer_connection_create_offer: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_offer', 4);

      try {
        // Create offer
        this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_offer > Getting local description...', 2);

        // Local description
        var _this = this;

        this.get_peer_connection().createOffer(
          function(sdp_local) {
            _this._peer_got_description(sdp_local);
          }.bind(this),

          this._peer_fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_offer
        );

        // Then, wait for responder to send back its remote description
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_offer > ' + e, 1);
      }
    },

    /**
     * Creates peer connection answer
     * @private
     */
    _peer_connection_create_answer: function() {
      this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_answer', 4);

      try {
        // Create offer
        this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_answer > Getting local description...', 2);

        // Apply SDP data
        sdp_remote = this.sdp._generate(
          WEBRTC_SDP_TYPE_OFFER,
          this.get_group_remote(),
          this.get_payloads_remote(),
          this.get_candidates_queue_remote()
        );

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_answer > SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        var _this = this;

        this.get_peer_connection().setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_answer > SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
            _this.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
          }
        );

        // Local description
        this.get_peer_connection().createAnswer(
          function(sdp_local) {
            _this._peer_got_description(sdp_local);
          }.bind(this),

          this._peer_fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_answer
        );

        // ICE candidates
        var c;
        var cur_candidate_obj;

        for(c in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[c];

          this.get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this._set_candidates_queue_remote(null);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_answer > ' + e, 1);
      }
    },

    /**
     * Triggers the media not obtained error event
     * @private
     * @fires JSJaCJingleSingle#get_session_initiate_error
     * @param {Object} error
     */
    _peer_got_user_media_error: function(error) {
      this.get_debug().log('[JSJaCJingle:single] _peer_got_user_media_error', 4);

      try {
        /* @function */
        (this.get_session_initiate_error())(this);

        // Not needed in case we are the responder (breaks termination)
        if(this.is_initiator()) this._handle_session_initiate_error();

        // Not needed in case we are the initiator (no packet sent, ever)
        if(this.is_responder()) this.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);

        this.get_debug().log('[JSJaCJingle:single] _peer_got_user_media_error > Failed (' + (error.PERMISSION_DENIED ? 'permission denied' : 'unknown' ) + ').', 1);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _peer_got_user_media_error > ' + e, 1);
      }
    },

    /**
     * Set a timeout limit to peer connection
     * @private
     * @param {String} state
     * @param {Object} [args]
     */
    _peer_timeout: function(state, args) {
      try {
        // Assert
        if(typeof args !== 'object') args = {};

        var t_sid = this.get_sid();

        var _this = this;

        setTimeout(function() {
          // State did not change?
          if(_this.get_sid() == t_sid && _this.get_peer_connection().iceConnectionState == state) {
            _this.get_debug().log('[JSJaCJingle:single] _peer_timeout > Peer timeout.', 2);

            // Error (transports are incompatible)
            _this.terminate(args.reason || JSJAC_JINGLE_REASON_FAILED_TRANSPORT);
          }
        }, ((args.timer || JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT) * 1000));
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _peer_timeout > ' + e, 1);
      }
    },

    /**
     * Stops ongoing peer connections
     * @private
     */
    _peer_stop: function() {
      this.get_debug().log('[JSJaCJingle:single] _peer_stop', 4);

      // Detach media streams from DOM view
      this._set_local_stream(null);
      this._set_remote_stream(null);

      // Close the media stream
      if(this.get_peer_connection()  &&
         (typeof this.get_peer_connection().close == 'function'))
        this.get_peer_connection().close();

      // Remove this session from router
      JSJaCJingle._remove(JSJAC_JINGLE_SESSION_SINGLE, this.get_sid());
    },



    /**
     * JSJSAC JINGLE SHORTCUTS
     */

    /**
     * Returns local user candidates
     * @private
     * @returns {Object} Candidates
     */
    _shortcut_local_user_candidates: function() {
      return this.get_candidates_local();
    },



    /**
     * JSJSAC JINGLE GETTERS
     */

    /**
     * Gets the session initiate pending callback function
     * @public
     * @event JSJaCJingleSingle#get_session_initiate_pending
     * @returns {Function} Callback function
     */
    get_session_initiate_pending: function() {
      return this._shortcut_get_handler(
        this._session_initiate_pending
      );
    },

    /**
     * Gets the session initiate success callback function
     * @public
     * @event JSJaCJingleSingle#get_session_initiate_success
     * @returns {Function} Callback function
     */
    get_session_initiate_success: function() {
      return this._shortcut_get_handler(
        this._session_initiate_success
      );
    },

    /**
     * Gets the session initiate error callback function
     * @public
     * @event JSJaCJingleSingle#get_session_initiate_error
     * @returns {Function} Callback function
     */
    get_session_initiate_error: function() {
      return this._shortcut_get_handler(
        this._session_initiate_error
      );
    },

    /**
     * Gets the session initiate request callback function
     * @public
     * @event JSJaCJingleSingle#get_session_initiate_request
     * @returns {Function} Callback function
     */
    get_session_initiate_request: function() {
      return this._shortcut_get_handler(
        this._session_initiate_request
      );
    },

    /**
     * Gets the session accept pending callback function
     * @public
     * @event JSJaCJingleSingle#get_session_accept_pending
     * @returns {Function} Callback function
     */
    get_session_accept_pending: function() {
      return this._shortcut_get_handler(
        this._session_accept_pending
      );
    },

    /**
     * Gets the session accept success callback function
     * @public
     * @event JSJaCJingleSingle#get_session_accept_success
     * @returns {Function} Callback function
     */
    get_session_accept_success: function() {
      return this._shortcut_get_handler(
        this._session_accept_success
      );
    },

    /**
     * Gets the session accept error callback function
     * @public
     * @event JSJaCJingleSingle#get_session_accept_error
     * @returns {Function} Callback function
     */
    get_session_accept_error: function() {
      return this._shortcut_get_handler(
        this._session_accept_error
      );
    },

    /**
     * Gets the session accept request callback function
     * @public
     * @event JSJaCJingleSingle#get_session_accept_request
     * @returns {Function} Callback function
     */
    get_session_accept_request: function() {
      return this._shortcut_get_handler(
        this._session_accept_request
      );
    },

    /**
     * Gets the session info pending callback function
     * @public
     * @event JSJaCJingleSingle#get_session_info_pending
     * @returns {Function} Callback function
     */
    get_session_info_pending: function() {
      return this._shortcut_get_handler(
        this._session_info_pending
      );
    },

    /**
     * Gets the session info success callback function
     * @public
     * @event JSJaCJingleSingle#get_session_info_success
     * @returns {Function} Callback function
     */
    get_session_info_success: function() {
      return this._shortcut_get_handler(
        this._session_info_success
      );
    },

    /**
     * Gets the session info error callback function
     * @public
     * @event JSJaCJingleSingle#get_session_info_error
     * @returns {Function} Callback function
     */
    get_session_info_error: function() {
      return this._shortcut_get_handler(
        this._session_info_error
      );
    },

    /**
     * Gets the session info request callback function
     * @public
     * @event JSJaCJingleSingle#get_session_info_request
     * @returns {Function} Callback function
     */
    get_session_info_request: function() {
      return this._shortcut_get_handler(
        this._session_info_request
      );
    },

    /**
     * Gets the session terminate pending callback function
     * @public
     * @event JSJaCJingleSingle#get_session_terminate_pending
     * @returns {Function} Callback function
     */
    get_session_terminate_pending: function() {
      return this._shortcut_get_handler(
        this._session_terminate_pending
      );
    },

    /**
     * Gets the session terminate success callback function
     * @public
     * @event JSJaCJingleSingle#get_session_terminate_success
     * @returns {Function} Callback function
     */
    get_session_terminate_success: function() {
      return this._shortcut_get_handler(
        this._session_terminate_success
      );
    },

    /**
     * Gets the session terminate error callback function
     * @public
     * @event JSJaCJingleSingle#get_session_terminate_error
     * @returns {Function} Callback function
     */
    get_session_terminate_error: function() {
      return this._shortcut_get_handler(
        this._session_terminate_error
      );
    },

    /**
     * Gets the session terminate request callback function
     * @public
     * @event JSJaCJingleSingle#get_session_terminate_request
     * @returns {Function} Callback function
     */
    get_session_terminate_request: function() {
      return this._shortcut_get_handler(
        this._session_terminate_request
      );
    },

    /**
     * Gets the stream add event callback function
     * @public
     * @event JSJaCJingleSingle#stream_add
     * @returns {Function} Callback function
     */
    get_stream_add: function() {
      return this._shortcut_get_handler(
        this._stream_add
      );
    },

    /**
     * Gets the stream remove event callback function
     * @public
     * @event JSJaCJingleSingle#stream_remove
     * @returns {Function} Callback function
     */
    get_stream_remove: function() {
      return this._shortcut_get_handler(
        this._stream_remove
      );
    },

    /**
     * Gets the stream connected event callback function
     * @public
     * @event JSJaCJingleSingle#stream_connected
     * @returns {Function} Callback function
     */
    get_stream_connected: function() {
      return this._shortcut_get_handler(
        this._stream_connected
      );
    },

    /**
     * Gets the stream disconnected event callback function
     * @public
     * @event JSJaCJingleSingle#stream_disconnected
     * @returns {Function} Callback function
     */
    get_stream_disconnected: function() {
      return this._shortcut_get_handler(
        this._stream_disconnected
      );
    },

    /**
     * Gets the prepended ID
     * @public
     * @returns {String} Prepended ID value
     */
    get_id_pre: function() {
      return JSJAC_JINGLE_STANZA_ID_PRE + '_' + (this.get_sid() || '0') + '_';
    },

    /**
     * Gets the reason value
     * @public
     * @returns {String} Reason value
     */
    get_reason: function() {
      return this._reason;
    },

    /**
     * Gets the remote_view value
     * @public
     * @returns {DOM} Remote view
     */
    get_remote_view: function() {
      return this._remote_view;
    },

    /**
     * Gets the remote stream
     * @public
     * @returns {Object} Remote stream instance
     */
    get_remote_stream: function() {
      return this._remote_stream;
    },

    /**
     * Gets the remote content
     * @public
     * @param {String} [name]
     * @returns {Object} Remote content object
     */
    get_content_remote: function(name) {
      if(name)
        return (name in this._content_remote) ? this._content_remote[name] : {};

      return this._content_remote;
    },

    /**
     * Gets the remote payloads
     * @public
     * @param {String} [name]
     * @returns {Object} Remote payloads object
     */
    get_payloads_remote: function(name) {
      if(name)
        return (name in this._payloads_remote) ? this._payloads_remote[name] : {};

      return this._payloads_remote;
    },

    /**
     * Gets the remote group
     * @public
     * @param {String} [semantics]
     * @returns {Object} Remote group object
     */
    get_group_remote: function(semantics) {
      if(semantics)
        return (semantics in this._group_remote) ? this._group_remote[semantics] : {};

      return this._group_remote;
    },

    /**
     * Gets the remote candidates
     * @public
     * @param {String} [name]
     * @returns {Object} Remote candidates object
     */
    get_candidates_remote: function(name) {
      if(name)
        return (name in this._candidates_remote) ? this._candidates_remote[name] : [];

      return this._candidates_remote;
    },

    /**
     * Gets the remote candidates queue
     * @public
     * @param {String} [name]
     * @returns {Object} Remote candidates queue object
     */
    get_candidates_queue_remote: function(name) {
      if(name)
        return (name in this._candidates_queue_remote) ? this._candidates_queue_remote[name] : {};

      return this._candidates_queue_remote;
    },

    /**
     * Gets the last ICE state value
     * @public
     * @returns {String|Object} Last ICE state value
     */
    get_last_ice_state: function() {
      return this._last_ice_state;
    },



    /**
     * JSJSAC JINGLE SETTERS
     */

    /**
     * Sets the session initiate pending callback function
     * @private
     * @param {Function} session_initiate_pending
     */
    _set_session_initiate_pending: function(session_initiate_pending) {
      this._session_initiate_pending = session_initiate_pending;
    },

    /**
     * Sets the session initiate success callback function
     * @private
     * @param {Function} initiate_success
     */
    _set_session_initiate_success: function(initiate_success) {
      this._session_initiate_success = initiate_success;
    },

    /**
     * Sets the session initiate error callback function
     * @private
     * @param {Function} initiate_error
     */
    _set_session_initiate_error: function(initiate_error) {
      this._session_initiate_error = initiate_error;
    },

    /**
     * Sets the session initiate request callback function
     * @private
     * @param {Function} initiate_request
     */
    _set_session_initiate_request: function(initiate_request) {
      this._session_initiate_request = initiate_request;
    },

    /**
     * Sets the session accept pending callback function
     * @private
     * @param {Function} accept_pending
     */
    _set_session_accept_pending: function(accept_pending) {
      this._session_accept_pending = accept_pending;
    },

    /**
     * Sets the session accept success callback function
     * @private
     * @param {Function} accept_success
     */
    _set_session_accept_success: function(accept_success) {
      this._session_accept_success = accept_success;
    },

    /**
     * Sets the session accept error callback function
     * @private
     * @param {Function} accept_error
     */
    _set_session_accept_error: function(accept_error) {
      this._session_accept_error = accept_error;
    },

    /**
     * Sets the session accept request callback function
     * @private
     * @param {Function} accept_request
     */
    _set_session_accept_request: function(accept_request) {
      this._session_accept_request = accept_request;
    },

    /**
     * Sets the session info pending callback function
     * @private
     * @param {Function} info_pending
     */
    _set_session_info_pending: function(info_pending) {
      this._session_info_pending = info_pending;
    },

    /**
     * Sets the session info success callback function
     * @private
     * @param {Function} info_success
     */
    _set_session_info_success: function(info_success) {
      this._session_info_success = info_success;
    },

    /**
     * Sets the session info error callback function
     * @private
     * @param {Function} info_error
     */
    _set_session_info_error: function(info_error) {
      this._session_info_error = info_error;
    },

    /**
     * Sets the session info request callback function
     * @private
     * @param {Function} info_request
     */
    _set_session_info_request: function(info_request) {
      this._session_info_request = info_request;
    },

    /**
     * Sets the session terminate pending callback function
     * @private
     * @param {Function} terminate_pending
     */
    _set_session_terminate_pending: function(terminate_pending) {
      this._session_terminate_pending = terminate_pending;
    },

    /**
     * Sets the session terminate success callback function
     * @private
     * @param {Function} terminate_success
     */
    _set_session_terminate_success: function(terminate_success) {
      this._session_terminate_success = terminate_success;
    },

    /**
     * Sets the session terminate error callback function
     * @private
     * @param {Function} terminate_error
     */
    _set_session_terminate_error: function(terminate_error) {
      this._session_terminate_error = terminate_error;
    },

    /**
     * Sets the session terminate request callback function
     * @private
     * @param {Function} terminate_request
     */
    _set_session_terminate_request: function(terminate_request) {
      this._session_terminate_request = terminate_request;
    },

    /**
     * Sets the stream add event callback function
     * @private
     * @param {Function} stream_add
     */
    _set_stream_add: function(stream_add) {
      this._stream_add = stream_add;
    },

    /**
     * Sets the stream remove event callback function
     * @private
     * @param {Function} stream_remove
     */
    _set_stream_remove: function(stream_remove) {
      this._stream_remove = stream_remove;
    },

    /**
     * Sets the stream connected event callback function
     * @private
     * @param {Function} stream_connected
     */
    _set_stream_connected: function(stream_connected) {
      this._stream_connected = stream_connected;
    },

    /**
     * Sets the stream disconnected event callback function
     * @private
     * @param {Function} stream_disconnected
     */
    _set_stream_disconnected: function(stream_disconnected) {
      this._stream_disconnected = stream_disconnected;
    },

    /**
     * Sets the termination reason
     * @private
     * @param {String} reason
     */
    _set_reason: function(reason) {
      this._reason = reason || JSJAC_JINGLE_REASON_CANCEL;
    },

    /**
     * Sets the remote stream
     * @private
     * @param {DOM} [remote_stream]
     */
    _set_remote_stream: function(remote_stream) {
      try {
        if(!remote_stream && this._remote_stream !== null) {
          this._peer_stream_detach(
            this.get_remote_view()
          );
        }

        if(remote_stream) {
          this._remote_stream = remote_stream;

          this._peer_stream_attach(
            this.get_remote_view(),
            this.get_remote_stream(),
            false
          );
        } else {
          this._remote_stream = null;

          this._peer_stream_detach(
            this.get_remote_view()
          );
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _set_remote_stream > ' + e, 1);
      }
    },

    /**
     * Sets the remote view
     * @private
     * @param {DOM} [remote_view]
     */
    _set_remote_view: function(remote_view) {
      if(typeof this._remote_view !== 'object')
        this._remote_view = [];

      this._remote_view.push(remote_view);
    },

    /**
     * Sets the remote content
     * @private
     * @param {String} name
     * @param {Object} content_remote
     */
    _set_content_remote: function(name, content_remote) {
      this._content_remote[name] = content_remote;
    },

    /**
     * Sets the remote payloads
     * @private
     * @param {String} name
     * @param {Object} payload_data
     */
    _set_payloads_remote: function(name, payload_data) {
      this._payloads_remote[name] = payload_data;
    },

    /**
     * Adds a remote payload
     * @private
     * @param {String} name
     * @param {Object} payload_data
     */
    _set_payloads_remote_add: function(name, payload_data) {
      try {
        if(!(name in this._payloads_remote)) {
          this._set_payloads_remote(name, payload_data);
        } else {
          var key;
          var payloads_store = this._payloads_remote[name].descriptions.payload;
          var payloads_add   = payload_data.descriptions.payload;

          for(key in payloads_add) {
            if(!(key in payloads_store))
              payloads_store[key] = payloads_add[key];
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _set_payloads_remote_add > ' + e, 1);
      }
    },

    /**
     * Sets the remote group
     * @private
     * @param {String} semantics
     * @param {Object} group_data
     */
    _set_group_remote: function(semantics, group_data) {
      this._group_remote[semantics] = group_data;
    },

    /**
     * Sets the remote candidates
     * @private
     * @param {String} name
     * @param {Object} candidate_data
     */
    _set_candidates_remote: function(name, candidate_data) {
      this._candidates_remote[name] = candidate_data;
    },

    /**
     * Sets the session initiate pending callback function
     * @private
     * @param {String} name
     * @param {Object} candidate_data
     */
    _set_candidates_queue_remote: function(name, candidate_data) {
      if(name === null)
        this._candidates_queue_remote = {};
      else
        this._candidates_queue_remote[name] = (candidate_data);
    },

    /**
     * Adds a remote candidate
     * @private
     * @param {String} name
     * @param {Object} candidate_data
     */
    _set_candidates_remote_add: function(name, candidate_data) {
      try {
        if(!name) return;

        if(!(name in this._candidates_remote))
          this._set_candidates_remote(name, []);

        var c, i;
        var candidate_ids = [];

        for(c in this.get_candidates_remote(name))
          candidate_ids.push(this.get_candidates_remote(name)[c].id);

        for(i in candidate_data) {
          if((candidate_data[i].id).indexOf(candidate_ids) !== -1)
            this.get_candidates_remote(name).push(candidate_data[i]);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:single] _set_candidates_remote_add > ' + e, 1);
      }
    },

    /**
     * Sets the last ICE state value
     * @private
     * @param {String|Object} last_ice_state
     */
    _set_last_ice_state: function(last_ice_state) {
      this._last_ice_state = last_ice_state;
    },
  }
);

/**
 * @fileoverview JSJaC Jingle library - Multi-user call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/muji */
/** @exports JSJaCJingleMuji */


/**
 * Creates a new XMPP Jingle Muji session.
 * @class
 * @classdesc  Creates a new XMPP Jingle Muji session.
 * @augments   __JSJaCJingleBase
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @requires   jsjac-jingle/main
 * @requires   jsjac-jingle/base
 * @see        {@link http://xmpp.org/extensions/xep-0272.html|XEP-0272: Multiparty Jingle (Muji)}
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 * @param      {Object}    [args]                                        - Muji session arguments.
 * @property   {*}         [args.*]                                      - Herits of JSJaCJingle() baseclass prototype.
 * @property   {String}    [args.username]                               - The username when joining room.
 * @property   {String}    [args.password]                               - The room password.
 * @property   {Boolean}   [args.password_protect]                       - Automatically password-protect the MUC if first joiner.
 * @property   {Function}  [args.room_message_in]                        - The incoming message custom handler.
 * @property   {Function}  [args.room_message_out]                       - The outgoing message custom handler.
 * @property   {Function}  [args.room_presence_in]                       - The incoming presence custom handler.
 * @property   {Function}  [args.room_presence_out]                      - The outgoing presence custom handler.
 * @property   {Function}  [args.session_prepare_pending]                - The session prepare pending custom handler.
 * @property   {Function}  [args.session_prepare_success]                - The session prepare success custom handler.
 * @property   {Function}  [args.session_prepare_error]                  - The session prepare error custom handler.
 * @property   {Function}  [args.session_initiate_pending]               - The session initiate pending custom handler.
 * @property   {Function}  [args.session_initiate_success]               - The session initiate success custom handler.
 * @property   {Function}  [args.session_initiate_error]                 - The session initiate error custom handler.
 * @property   {Function}  [args.session_leave_pending]                  - The session leave pending custom handler.
 * @property   {Function}  [args.session_leave_success]                  - The session leave success custom handler.
 * @property   {Function}  [args.session_leave_error]                    - The session leave error custom handler.
 * @property   {Function}  [args.participant_prepare]                    - The participant prepare custom handler.
 * @property   {Function}  [args.participant_initiate]                   - The participant initiate custom handler.
 * @property   {Function}  [args.participant_leave]                      - The participant session leave custom handler.
 * @property   {Function}  [args.participant_session_initiate_pending]   - The participant session initiate pending custom handler.
 * @property   {Function}  [args.participant_session_initiate_success]   - The participant session initiate success custom handler.
 * @property   {Function}  [args.participant_session_initiate_error]     - The participant session initiate error custom handler.
 * @property   {Function}  [args.participant_session_initiate_request]   - The participant session initiate request custom handler.
 * @property   {Function}  [args.participant_session_accept_pending]     - The participant session accept pending custom handler.
 * @property   {Function}  [args.participant_session_accept_success]     - The participant session accept success custom handler.
 * @property   {Function}  [args.participant_session_accept_error]       - The participant session accept error custom handler.
 * @property   {Function}  [args.participant_session_accept_request]     - The participant session accept request custom handler.
 * @property   {Function}  [args.participant_session_info_pending]       - The participant session info request custom handler.
 * @property   {Function}  [args.participant_session_info_success]       - The participant session info success custom handler.
 * @property   {Function}  [args.participant_session_info_error]         - The participant session info error custom handler.
 * @property   {Function}  [args.participant_session_info_request]       - The participant session info request custom handler.
 * @property   {Function}  [args.participant_session_terminate_pending]  - The participant session terminate pending custom handler.
 * @property   {Function}  [args.participant_session_terminate_success]  - The participant session terminate success custom handler.
 * @property   {Function}  [args.participant_session_terminate_error]    - The participant session terminate error custom handler.
 * @property   {Function}  [args.participant_session_terminate_request]  - The participant session terminate request custom handler.
 * @property   {Function}  [args.participant_stream_add]                 - The participant stream add custom handler.
 * @property   {Function}  [args.participant_stream_remove]              - The participant stream remove custom handler.
 * @property   {Function}  [args.participant_stream_connected]           - The participant stream connected custom handler.
 * @property   {Function}  [args.participant_stream_disconnected]        - The participant stream disconnected custom handler.
 * @property   {Function}  [args.add_remote_view]                        - The remote view media add (audio/video) custom handler.
 * @property   {Function}  [args.remove_remote_view]                     - The remote view media removal (audio/video) custom handler.
 */
var JSJaCJingleMuji = ring.create([__JSJaCJingleBase],
  /** @lends JSJaCJingleMuji.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      this.$super(args);

      if(args && args.room_message_in)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._room_message_in = args.room_message_in;

      if(args && args.room_message_out)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._room_message_out = args.room_message_out;

      if(args && args.room_presence_in)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._room_presence_in = args.room_presence_in;

      if(args && args.room_presence_out)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._room_presence_out = args.room_presence_out;

      if(args && args.session_prepare_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_prepare_pending = args.session_prepare_pending;

      if(args && args.session_prepare_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_prepare_success = args.session_prepare_success;

      if(args && args.session_prepare_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_prepare_error = args.session_prepare_error;

      if(args && args.session_initiate_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_pending = args.session_initiate_pending;

      if(args && args.session_initiate_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_success = args.session_initiate_success;

      if(args && args.session_initiate_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_error = args.session_initiate_error;

      if(args && args.session_leave_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_leave_pending = args.session_leave_pending;

      if(args && args.session_leave_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_leave_success = args.session_leave_success;

      if(args && args.session_leave_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_leave_error = args.session_leave_error;

      if(args && args.participant_prepare)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_prepare = args.participant_prepare;

      if(args && args.participant_initiate)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_initiate = args.participant_initiate;

      if(args && args.participant_leave)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_leave = args.participant_leave;

      if(args && args.participant_session_initiate_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_initiate_pending = args.participant_session_initiate_pending;

      if(args && args.participant_session_initiate_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_initiate_success = args.participant_session_initiate_success;

      if(args && args.participant_session_initiate_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_initiate_error = args.participant_session_initiate_error;

      if(args && args.participant_session_initiate_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_initiate_request = args.participant_session_initiate_request;

      if(args && args.participant_session_accept_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_accept_pending = args.participant_session_accept_pending;

      if(args && args.participant_session_accept_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_accept_success = args.participant_session_accept_success;

      if(args && args.participant_session_accept_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_accept_error = args.participant_session_accept_error;

      if(args && args.participant_session_accept_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_accept_request = args.participant_session_accept_request;

      if(args && args.participant_session_info_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_info_pending = args.participant_session_info_pending;

      if(args && args.participant_session_info_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_info_success = args.participant_session_info_success;

      if(args && args.participant_session_info_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_info_error = args.participant_session_info_error;

      if(args && args.participant_session_info_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_info_request = args.participant_session_info_request;

      if(args && args.participant_session_terminate_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_terminate_pending = args.participant_session_terminate_pending;

      if(args && args.participant_session_terminate_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_terminate_success = args.participant_session_terminate_success;

      if(args && args.participant_session_terminate_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_terminate_error = args.participant_session_terminate_error;

      if(args && args.participant_session_terminate_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_terminate_request = args.participant_session_terminate_request;

      if(args && args.participant_stream_add)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_stream_add = args.participant_stream_add;

      if(args && args.participant_stream_remove)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_stream_remove = args.participant_stream_remove;

      if(args && args.participant_stream_connected)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_stream_connected = args.participant_stream_connected;

      if(args && args.participant_stream_disconnected)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_stream_disconnected = args.participant_stream_disconnected;

      if(args && args.add_remote_view)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._add_remote_view = args.add_remote_view;

      if(args && args.remove_remote_view)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._remove_remote_view = args.remove_remote_view;

      if(args && args.username) {
        /**
         * @member {String}
         * @default
         * @private
         */
        this._username = args.username;
      } else {
        /**
         * @member {String}
         * @default
         * @private
         */
        this._username = this.utils.connection_username();
      }

      if(args && args.password)
        /**
         * @member {String}
         * @default
         * @private
         */
        this._password = args.password;

      if(args && args.password_protect)
        /**
         * @member {Boolean}
         * @default
         * @private
         */
        this._password_protect = args.password_protect;

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._participants = {};

      /**
       * @member {String}
       * @default
       * @private
       */
      this._iid = '';

      /**
       * @member {Boolean}
       * @default
       * @private
       */
      this._is_room_owner = false;

      /**
       * @constant
       * @member {String}
       * @default
       * @private
       */
      this._status = JSJAC_JINGLE_MUJI_STATUS_INACTIVE;

      /**
       * @constant
       * @member {String}
       * @default
       * @private
       */
      this._namespace = NS_MUJI;
    },


    /**
     * Initiates a new Muji session.
     * @public
     * @fires JSJaCJingleMuji#get_session_initiate_pending
     */
    join: function() {
      this.get_debug().log('[JSJaCJingle:muji] join', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] join > Cannot join, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.join(); })) {
          this.get_debug().log('[JSJaCJingle:muji] join > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Slot unavailable?
        if(this.get_status() !== JSJAC_JINGLE_STATUS_INACTIVE) {
          this.get_debug().log('[JSJaCJingle:muji] join > Cannot join, resource not inactive (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.get_debug().log('[JSJaCJingle:muji] join > New Jingle Muji session with media: ' + this.get_media(), 2);

        // Common vars
        var i, cur_name;

        // Trigger session prepare pending custom callback
        /* @function */
        (this.get_session_prepare_pending())(this);

        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_PREPARING);

        // Set session values
        this._set_iid(this.utils.generate_iid());
        this._set_sid(
          this.utils.generate_hash_md5(this.get_to())
        );

        this._set_initiator(this.get_to());
        this._set_responder(this.utils.connection_jid());

        for(i in this.get_media_all()) {
          cur_name = this.utils.name_generate(
            this.get_media_all()[i]
          );

          this._set_name(cur_name);

          this._set_senders(
            cur_name,
            JSJAC_JINGLE_SENDERS_BOTH.jingle
          );

          this._set_creator(
            cur_name,
            JSJAC_JINGLE_CREATOR_INITIATOR
          );
        }

        // Register session to common router
        JSJaCJingle._add(JSJAC_JINGLE_SESSION_MUJI, this.get_to(), this);

        // Send initial join presence
        this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_PREPARE });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] join > ' + e, 1);
      }
    },


    /**
     * Leaves current Muji session.
     * @public
     * @fires JSJaCJingleMuji#get_session_leave_pending
     */
    leave: function() {
      this.get_debug().log('[JSJaCJingle:muji] leave', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] leave > Cannot leave, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.leave(); })) {
          this.get_debug().log('[JSJaCJingle:muji] leave > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEFT) {
          this.get_debug().log('[JSJaCJingle:muji] leave > Cannot terminate, resource already terminated (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_LEAVING);

        // Trigger session leave pending custom callback
        /* @function */
        (this.get_session_leave_pending())(this);

        // Leave the room (after properly terminating participant sessions)
        this._terminate_participant_sessions(true, function() {
          _this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_LEAVE });
        });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] leave > ' + e, 1);
      }
    },

    /**
     * Aborts current Muji session.
     * @public
     * @param {Boolean} [set_lock]
     */
    abort: function(set_lock) {
      this.get_debug().log('[JSJaCJingle:muji] abort', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_LEFT);

        // Stop WebRTC
        this._peer_stop();

        // Flush all participant content
        this._set_participants(null);

        // Lock session? (cannot be used later)
        if(set_lock === true)  this._set_lock(true);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] abort > ' + e, 1);
      }
    },

    /**
     * Invites people to current Muji session
     * @public
     * @param {String|Array} jid
     * @param {String} [reason]
     */
    invite: function(jid, reason) {
      this.get_debug().log('[JSJaCJingle:muji] invite', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] invite > Cannot invite, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.invite(jid); })) {
          this.get_debug().log('[JSJaCJingle:muji] invite > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        if(!jid) {
          this.get_debug().log('[JSJaCJingle:muji] invite > JID parameter not provided or blank.', 0);
          return;
        }

        var i;
            jid_arr = (jid instanceof Array) ? jid : [jid];

        for(i = 0; i < jid_arr.length; i++)  this._send_invite(jid_arr[i], reason);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] invite > ' + e, 1);
      }
    },

    /**
     * Mutes a Muji session (local)
     * @public
     * @param {String} name
     */
    mute: function(name) {
      this.get_debug().log('[JSJaCJingle:muji] mute', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] mute > Cannot mute, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.mute(name); })) {
          this.get_debug().log('[JSJaCJingle:muji] mute > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Already muted?
        if(this.get_mute(name) === true) {
          this.get_debug().log('[JSJaCJingle:muji] mute > Resource already muted.', 0);
          return;
        }

        this._peer_sound(false);
        this._set_mute(name, true);

        // Mute all participants
        this._toggle_participants_mute(name, JSJAC_JINGLE_SESSION_INFO_MUTE);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] mute > ' + e, 1);
      }
    },

    /**
     * Unmutes a Muji session (local)
     * @public
     * @param {String} name
     */
    unmute: function(name) {
      this.get_debug().log('[JSJaCJingle:muji] unmute', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] unmute > Cannot unmute, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.unmute(name); })) {
          this.get_debug().log('[JSJaCJingle:muji] unmute > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Already unmute?
        if(this.get_mute(name) === false) {
          this.get_debug().log('[JSJaCJingle:muji] unmute > Resource already unmuted.', 0);
          return;
        }

        this._peer_sound(true);
        this._set_mute(name, false);

        // Unmute all participants
        this._toggle_participants_mute(name, JSJAC_JINGLE_SESSION_INFO_UNMUTE);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] unmute > ' + e, 1);
      }
    },

    /**
     * Toggles media type in a Muji session (local)
     * @todo Code media() (Muji version)
     * @public
     * @param {String} [media]
     */
    media: function(media) {
      /* DEV: don't expect this to work as of now! */
      /* MEDIA() - MUJI VERSION */

      this.get_debug().log('[JSJaCJingle:muji] media', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] media > Cannot change media, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.media(media); })) {
          this.get_debug().log('[JSJaCJingle:muji] media > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Toggle media?
        if(!media)
          media = (this.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;

        // Media unknown?
        if(!(media in JSJAC_JINGLE_MEDIAS)) {
          this.get_debug().log('[JSJaCJingle:muji] media > No media provided or media unsupported (media: ' + media + ').', 0);
          return;
        }

        // Already using provided media?
        if(this.get_media() == media) {
          this.get_debug().log('[JSJaCJingle:muji] media > Resource already using this media (media: ' + media + ').', 0);
          return;
        }

        // Switch locked for now? (another one is being processed)
        if(this.get_media_busy()) {
          this.get_debug().log('[JSJaCJingle:muji] media > Resource already busy switching media (busy: ' + this.get_media() + ', media: ' + media + ').', 0);
          return;
        }

        this.get_debug().log('[JSJaCJingle:muji] media > Changing media to: ' + media + '...', 2);

        // Store new media
        this._set_media(media);
        this._set_media_busy(true);

        // Toggle video mode (add/remove)
        if(media == JSJAC_JINGLE_MEDIA_VIDEO) {
          /* @todo the flow is something like that... */
          /*this._peer_get_user_media(function() {
            this._peer_connection_create(
              function() {
                this.get_debug().log('[JSJaCJingle:muji] media > Ready to change media (to: ' + media + ').', 2);

                // 'content-add' >> video
                // @todo restart video stream configuration

                // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)

                this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_ADD, name: JSJAC_JINGLE_MEDIA_VIDEO });
              }
            )
          });*/
        } else {
          /* @todo the flow is something like that... */
          /*this._peer_get_user_media(function() {
            this._peer_connection_create(
              function() {
                this.get_debug().log('[JSJaCJingle:muji] media > Ready to change media (to: ' + media + ').', 2);

                // 'content-remove' >> video
                // @todo remove video stream configuration

                // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)
                //          here, only stop the video stream, do not touch the audio stream

                this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_REMOVE, name: JSJAC_JINGLE_MEDIA_VIDEO });
              }
            )
          });*/
        }

        /* @todo loop on participant sessions and toggle medias individually */
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] media > ' + e, 1);
      }
    },

    /**
     * Sends a given Muji presence stanza
     * @public
     * @fires JSJaCJingleMuji#get_room_presence_out
     * @param {Object} [args]
     * @returns {Boolean} Success
     */
    send_presence: function(args) {
      this.get_debug().log('[JSJaCJingle:muji] send_presence', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] send_presence > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
          return false;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.send_presence(args); })) {
          this.get_debug().log('[JSJaCJingle:muji] send_presence > Deferred (waiting for the library components to be initiated).', 0);
          return false;
        }

        if(typeof args !== 'object') args = {};

        // Build stanza
        var stanza = new JSJaCPresence();
        stanza.setTo(this.get_muc_to());

        if(!args.id) args.id = this.get_id_new();
        stanza.setID(args.id);

        // Submit to registered handler
        switch(args.action) {
          case JSJAC_JINGLE_MUJI_ACTION_PREPARE:
            this._send_session_prepare(stanza, args); break;

          case JSJAC_JINGLE_MUJI_ACTION_INITIATE:
            this._send_session_initiate(stanza, args); break;

          case JSJAC_JINGLE_MUJI_ACTION_LEAVE:
            this._send_session_leave(stanza, args); break;

          default:
            this.get_debug().log('[JSJaCJingle:muji] send_presence > Unexpected error.', 1);

            return false;
        }

        this._set_sent_id(args.id);

        this.get_connection().send(stanza);

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] send_presence > Outgoing packet sent' + '\n\n' + stanza.xml());

        // Trigger custom callback
        /* @function */
        (this.get_room_presence_out())(this, stanza);

        return true;
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] send_presence > ' + e, 1);
      }

      return false;
    },

    /**
     * Sends a given Muji message stanza
     * @public
     * @fires JSJaCJingleMuji#get_room_message_out
     * @param {String} body
     * @returns {Boolean} Success
     */
    send_message: function(body) {
      this.get_debug().log('[JSJaCJingle:muji] send_message', 4);

      try {
        // Missing args?
        if(!body) {
          this.get_debug().log('[JSJaCJingle:muji] send_message > Message body missing.', 0);
          return false;
        }

        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] send_message > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
          return false;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.send_message(body); })) {
          this.get_debug().log('[JSJaCJingle:muji] send_message > Deferred (waiting for the library components to be initiated).', 0);
          return false;
        }

        // Build stanza
        var stanza = new JSJaCMessage();

        stanza.setTo(this.get_to());
        stanza.setType(JSJAC_JINGLE_MESSAGE_TYPE_GROUPCHAT);
        stanza.setBody(body);

        this.get_connection().send(stanza);

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] send_message > Outgoing packet sent' + '\n\n' + stanza.xml());

        // Trigger custom callback
        /* @function */
        (this.get_room_message_out())(this, stanza);

        return true;
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] send_message > ' + e, 1);
      }

      return false;
    },

    /**
     * Handles a Muji presence stanza
     * @public
     * @fires JSJaCJingleMuji#_handle_participant_prepare
     * @fires JSJaCJingleMuji#_handle_participant_initiate
     * @fires JSJaCJingleMuji#_handle_participant_leave
     * @fires JSJaCJingleMuji#get_room_presence_in
     * @fires JSJaCJingleMuji#get_participant_prepare
     * @fires JSJaCJingleMuji#get_participant_initiate
     * @fires JSJaCJingleMuji#get_participant_leave
     * @param {JSJaCPacket} stanza
     */
    handle_presence: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] handle_presence', 4);

      try {
        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] handle_presence > Incoming packet received' + '\n\n' + stanza.xml());

        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] handle_presence > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.handle_presence(stanza); })) {
          this.get_debug().log('[JSJaCJingle:muji] handle_presence > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Trigger custom callback
        /* @function */
        (this.get_room_presence_in())(this, stanza);

        var id = stanza.getID();
        var type = (stanza.getType() || JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE);

        if(id)  this._set_received_id(id);

        // Submit to custom handler (only for local user packets)
        var i, handlers, is_stanza_from_local;

        handlers = this.get_registered_handlers(JSJAC_JINGLE_STANZA_PRESENCE, type, id);
        is_stanza_from_local = this.is_stanza_from_local(stanza);

        if(typeof handlers == 'object' && handlers.length && is_stanza_from_local === true) {
          this.get_debug().log('[JSJaCJingle:muji] handle_presence > Submitted to custom registered handlers.', 2);

          for(i in handlers) {
            /* @function */
            handlers[i](stanza);
          }

          this.unregister_handler(JSJAC_JINGLE_STANZA_PRESENCE, type, id);

          return;
        }

        // Local stanza?
        if(is_stanza_from_local === true) {
          if(stanza.getType() === JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE) {
            this.get_debug().log('[JSJaCJingle:muji] handle_presence > Conference room going offline, forcing termination...', 1);

            // Change session status
            this._set_status(JSJAC_JINGLE_MUJI_STATUS_LEAVING);

            this._terminate_participant_sessions();

            // Trigger leave error handlers
            /* @function */
            this.get_session_leave_error()(this, stanza);
            this._handle_session_leave_error(stanza);
          } else {
            this.get_debug().log('[JSJaCJingle:muji] handle_presence > Dropped local stanza.', 1);
          }
        } else {
          // Defer if user media not ready yet
          this._defer_participant_handlers(function(is_deferred) {
            // Remote stanza handlers
            if(stanza.getType() === JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE) {
              _this._handle_participant_leave(stanza, is_deferred);

              /* @function */
              _this.get_participant_leave()(stanza);
            } else {
              var muji = _this.utils.stanza_muji(stanza);

              // Don't handle non-Muji stanzas there...
              if(!muji) return;

              // Submit to registered handler
              var username = _this.utils.stanza_username(stanza);
              var status = _this._shortcut_participant_status(username);

              var fn_log_drop = function() {
                _this.get_debug().log('[JSJaCJingle:muji] handle_presence > Dropped out-of-order participant stanza with status: ' + status, 1);
              };

              if(_this._stanza_has_preparing(muji)) {
                if(!status || status === JSJAC_JINGLE_MUJI_STATUS_INACTIVE) {
                  _this._handle_participant_prepare(stanza, is_deferred);

                  /* @function */
                  _this.get_participant_prepare()(_this, stanza);
                } else {
                  fn_log_drop();
                }
              } else if(_this._stanza_has_content(muji)) {
                if(!status || status === JSJAC_JINGLE_MUJI_STATUS_INACTIVE || status === JSJAC_JINGLE_MUJI_STATUS_PREPARED) {
                  _this._handle_participant_initiate(stanza, is_deferred);

                  /* @function */
                  _this.get_participant_initiate()(_this, stanza);
                } else {
                  fn_log_drop();
                }
              } else if(_this.is_stanza_from_participant(stanza)) {
                if(!status || status === JSJAC_JINGLE_MUJI_STATUS_INACTIVE || status === JSJAC_JINGLE_MUJI_STATUS_INITIATED) {
                  _this._handle_participant_leave(stanza, is_deferred);

                  /* @function */
                  _this.get_participant_leave()(_this, stanza);
                } else {
                  fn_log_drop();
                }
              }
            }
          });
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] handle_presence > ' + e, 1);
      }
    },

    /**
     * Handles a Muji message stanza
     * @public
     * @fires JSJaCJingleMuji#get_room_message_in
     * @param {JSJaCPacket} stanza
     */
    handle_message: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] handle_message', 4);

      try {
        var stanza_type = stanza.getType();

        if(stanza_type != JSJAC_JINGLE_MESSAGE_TYPE_GROUPCHAT) {
          this.get_debug().log('[JSJaCJingle:muji] handle_message > Dropped invalid stanza type: ' + stanza_type, 0);
          return;
        }

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] handle_message > Incoming packet received' + '\n\n' + stanza.xml());

        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] handle_message > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Trigger custom callback
        /* @function */
        (this.get_room_message_in())(this, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] handle_message > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE MUJI SENDERS
     */

    /**
     * Sends the invite message.
     * @private
     * @param {String} jid
     */
    _send_invite: function(jid, reason) {
      this.get_debug().log('[JSJaCJingle:muji] _send_invite', 4);

      try {
        var cur_participant, participants,
            stanza, x_invite;

        stanza = new JSJaCMessage();
        stanza.setTo(jid);

        x_invite = stanza.buildNode('x', {
          'jid': this.get_to(),
          'xmlns': NS_JABBER_CONFERENCE
        });

        if(reason)
          x_invite.setAttribute('reason', reason);
        if(this.get_password())
          x_invite.setAttribute('password', this.get_password());

        stanza.getNode().appendChild(x_invite);

        stanza.appendNode('x', {
          'media': this.get_media(),
          'xmlns': NS_MUJI_INVITE
        });

        this.get_connection().send(stanza);

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] _send_invite > Outgoing packet sent' + '\n\n' + stanza.xml());

        // Trigger custom callback
        /* @function */
        (this.get_room_message_out())(this, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _send_invite > ' + e, 1);
      }
    },

    /**
     * Sends the session prepare event.
     * @private
     * @fires JSJaCJingleMuji#_handle_session_prepare_success
     * @fires JSJaCJingleMuji#_handle_session_prepare_error
     * @fires JSJaCJingleMuji#get_session_prepare_success
     * @fires JSJaCJingleMuji#get_session_prepare_error
     * @fires JSJaCJingleMuji#get_session_prepare_pending
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_prepare: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_PREPARING) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > Cannot send prepare stanza, resource already prepared (status: ' + this.get_status() + ').', 0);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > Arguments not provided.', 1);
          return;
        }

        // Build Muji stanza
        var muji = this.utils.stanza_generate_muji(stanza);
        muji.appendChild(stanza.buildNode('preparing', { 'xmlns': NS_MUJI }));

        // Password-protected room?
        if(this.get_password()) {
          var x_muc = stanza.getNode().appendChild(stanza.buildNode('x', { 'xmlns': NS_JABBER_MUC }));

          x_muc.appendChild(
            stanza.buildNode('password', { 'xmlns': NS_JABBER_MUC }, this.get_password())
          );
        }

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE, args.id, function(stanza) {
          /* @function */
          (_this.get_session_prepare_success())(_this, stanza);
          _this._handle_session_prepare_success(stanza);
        });

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id, function(stanza) {
          /* @function */
          (_this.get_session_prepare_error())(_this, stanza);
          _this._handle_session_prepare_error(stanza);
        });

        // Schedule timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE, args.id, {
          /* @function */
          external:   this.get_session_prepare_error().bind(this),
          internal:   this._handle_session_prepare_error.bind(this)
        });
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id);

        this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > Sent.', 2);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > ' + e, 1);
      }
    },

    /**
     * Sends the session initiate event.
     * @private
     * @fires JSJaCJingleMuji#_handle_session_initiate_success
     * @fires JSJaCJingleMuji#_handle_session_initiate_error
     * @fires JSJaCJingleMuji#get_session_initiate_success
     * @fires JSJaCJingleMuji#get_session_initiate_error
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_initiate: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_INITIATING) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > Cannot send initiate stanza, resource already initiated (status: ' + this.get_status() + ').', 0);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > Arguments not provided.', 1);
          return;
        }

        // Build Muji stanza
        var muji = this.utils.stanza_generate_muji(stanza);

        this.utils.stanza_generate_content_local(stanza, muji, false);
        this.utils.stanza_generate_group_local(stanza, muji);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE, args.id, function(stanza) {
          /* @function */
          (_this.get_session_initiate_success())(_this, stanza);
          _this._handle_session_initiate_success(stanza);
        });

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id, function(stanza) {
          /* @function */
          (_this.get_session_initiate_error())(_this, stanza);
          _this._handle_session_initiate_error(stanza);
        });

        // Schedule timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE, args.id, {
          /* @function */
          external:   this.get_session_initiate_error().bind(this),
          internal:   this._handle_session_initiate_error.bind(this)
        });
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id);

        this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > Sent.', 2);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > ' + e, 1);
      }
    },

    /**
     * Sends the session leave event.
     * @private
     * @fires JSJaCJingleMuji#_handle_session_leave_success
     * @fires JSJaCJingleMuji#_handle_session_leave_error
     * @fires JSJaCJingleMuji#get_session_leave_success
     * @fires JSJaCJingleMuji#get_session_leave_error
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_leave: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:muji] _send_session_leave', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEAVING) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_leave > Cannot send leave stanza, resource already left (status: ' + this.get_status() + ').', 0);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_leave > Arguments not provided.', 1);
          return;
        }

        stanza.setType(JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE, args.id, function(stanza) {
          /* @function */
          (_this.get_session_leave_success())(_this, stanza);
          _this._handle_session_leave_success(stanza);
        });

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id, function(stanza) {
          /* @function */
          (_this.get_session_leave_error())(_this, stanza);
          _this._handle_session_leave_error(stanza);
        });

        // Schedule timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE, args.id, {
          /* @function */
          external:   this.get_session_leave_error().bind(this),
          internal:   this._handle_session_leave_error.bind(this)
        });
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id);

        this.get_debug().log('[JSJaCJingle:muji] _send_session_leave > Sent.', 2);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _send_session_leave > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE MUJI HANDLERS
     */

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_session_prepare_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_prepare_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_PREPARING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Cannot handle prepare success stanza, resource already prepared (status: ' + this.get_status() + ').', 0);
          return;
        }

        var username = this.utils.stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting session prepare stanza.';
        }

        if(this._stanza_has_room_owner(stanza)) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Current MUC affiliation is owner.', 2);

          this._set_is_room_owner(true);
        }

        if(this._stanza_has_password_invalid(stanza)) {
          // Password protected room?
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Password-protected room, aborting.', 1);

          /* @function */
          (this.get_session_leave_success())(this, stanza);
          this._handle_session_leave_success(stanza);
        } else if(this._stanza_has_username_conflict(stanza)) {
          // Username conflict
          var alt_username = (this.get_username() + this.utils.generate_random(4));

          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Conflicting username, changing it to: ' + alt_username, 2);

          this._set_username(alt_username);
          this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_PREPARE });
        } else {
          // Change session status
          this._set_status(JSJAC_JINGLE_MUJI_STATUS_PREPARED);

          // Initialize WebRTC
          var _this = this;

          this._peer_get_user_media(function() {
            _this._peer_connection_create(function() {
              _this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Ready to begin Muji initiation.', 2);

              // Trigger session initiate pending custom callback
              /* @function */
              (_this.get_session_initiate_pending())(_this);

              // Build content (local)
              _this.utils.build_content_local();

              // Change session status
              _this._set_status(JSJAC_JINGLE_MUJI_STATUS_INITIATING);

              _this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_INITIATE });
            });
          });
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare error
     * @private
     * @event JSJaCJingleMuji#_handle_session_prepare_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_prepare_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_error', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_PREPARING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_error > Cannot handle prepare error stanza, resource already prepared (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.leave();
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session initiate success
     * @private
     * @event JSJaCJingleMuji#_handle_session_initiate_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_initiate_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_success', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_INITIATING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_success > Cannot handle initiate success stanza, resource already initiated (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_INITIATED);

        // Undefer pending participant handlers
        this._undefer_participant_handlers();

        // Autoconfigure room password if new MUC
        if(this.get_is_room_owner() === true     &&
           this.get_password_protect() === true  &&
           this.utils.object_length(this.get_participants()) === 0) {
          this._autoconfigure_room_password();
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session initiate error
     * @private
     * @event JSJaCJingleMuji#_handle_session_initiate_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_initiate_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_error', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_INITIATING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_error > Cannot handle initiate error stanza, resource already initiated (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.leave();
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session leave success
     * @private
     * @event JSJaCJingleMuji#_handle_session_leave_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_leave_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEAVING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success > Cannot handle leave success stanza, resource already left (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.abort();
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session leave error
     * @private
     * @event JSJaCJingleMuji#_handle_session_leave_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_leave_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_error', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEAVING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success > Cannot handle leave error stanza, resource already left (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.abort(true);

        this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_error > Forced session exit locally.', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_error > ' + e, 1);
      }
    },

    /**
     * Handles the participant prepare event.
     * @private
     * @event JSJaCJingleMuji#_handle_participant_prepare
     * @param {JSJaCPacket} stanza
     * @param {Boolean} [is_deferred]
     */
    _handle_participant_prepare: function(stanza, is_deferred) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare', 4);

      try {
        var username = this.utils.stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting participant prepare stanza.';
        }

        // Local slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_INACTIVE  ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEAVING   ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEFT) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare > [' + username + '] > Cannot handle, resource not available (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Remote slot unavailable?
        var status = this._shortcut_participant_status(username);

        if(status !== JSJAC_JINGLE_MUJI_STATUS_INACTIVE) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare > [' + username + '] > Cannot handle prepare stanza, participant already prepared (status: ' + status + ').', 0);
          return;
        }

        this._set_participants(username, {
          status: JSJAC_JINGLE_MUJI_STATUS_PREPARED,
          view: this._shortcut_participant_view(username)
        });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare > ' + e, 1);
      }
    },

    /**
     * Handles the participant initiate event.
     * @private
     * @event JSJaCJingleMuji#_handle_participant_initiate
     * @param {JSJaCPacket} stanza
     * @param {Boolean} [is_deferred]
     */
    _handle_participant_initiate: function(stanza, is_deferred) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate', 4);

      try {
        var username = this.utils.stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting participant initiate stanza.';
        }

        // Local slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_INACTIVE  ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEAVING   ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEFT) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > [' + username + '] > Cannot handle, resource not available (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Remote slot unavailable?
        var status = this._shortcut_participant_status(username);

        if(status !== JSJAC_JINGLE_MUJI_STATUS_INACTIVE  &&
           status !== JSJAC_JINGLE_MUJI_STATUS_PREPARED) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > [' + username + '] > Cannot handle initiate stanza, participant already initiated (status: ' + status + ').', 0);
          return;
        }

        // Need to initiate? (participant was here before we joined)
        /* @see {@link http://xmpp.org/extensions/xep-0272.html#joining|XEP-0272: Multiparty Jingle (Muji) - Joining a Conference} */
        if(is_deferred === true) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > [' + username + '] Initiating participant Jingle session...', 2);

          // Create Jingle session
          this._create_participant_session(username).initiate();
        } else {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > [' + username + '] Waiting for participant Jingle initiation request...', 2);

          this._set_participants(username, {
            status: JSJAC_JINGLE_MUJI_STATUS_INITIATED,
            view: this._shortcut_participant_view(username)
          });
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > ' + e, 1);
      }
    },

    /**
     * Handles the participant leave event.
     * @private
     * @event JSJaCJingleMuji#_handle_participant_leave
     * @param {JSJaCPacket} stanza
     * @param {Boolean} [is_deferred]
     */
    _handle_participant_leave: function(stanza, is_deferred) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave', 4);

      try {
        var username = this.utils.stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting participant leave stanza.';
        }

        // Local slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_INACTIVE  ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEAVING   ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEFT) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave > [' + username + '] > Cannot handle, resource not available (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Remote slot unavailable?
        var status = this._shortcut_participant_status(username);

        if(status !== JSJAC_JINGLE_MUJI_STATUS_PREPARED  &&
           status !== JSJAC_JINGLE_MUJI_STATUS_INITIATED) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave > [' + username + '] > Cannot handle leave stanza, participant already left or inactive (status: ' + status + ').', 0);
          return;
        }

        // Remove participant session
        var session = (this.get_participants(username) || {}).session;

        if(session && session.get_status() !== JSJAC_JINGLE_STATUS_TERMINATED)
          session.abort(true);

        this._set_participants(username, null);
        this.get_remove_remote_view()(this, username);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE SESSION HANDLERS
     */

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_initiate_pending
     * @param {JSJaCJingleSingle} session
     */
    _handle_participant_session_initiate_pending: function(session) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_pending', 4);

      try {
        /* @function */
        (this.get_participant_session_initiate_pending())(this, session);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_pending > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_initiate_success
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_initiate_success: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_success', 4);

      try {
        /* @function */
        (this.get_participant_session_initiate_success())(this, session, stanza);

        // Mute participant?
        var cur_media_name;

        for(cur_media_name in this._mute) {
          if(this.get_mute(cur_media_name) === true) {
            this._toggle_participants_mute(
              cur_media_name,
              JSJAC_JINGLE_SESSION_INFO_MUTE,
              username
            );
          }
        }

        // Auto-accept incoming sessions
        if(session.is_responder()) {
          // Accept after a while
          setTimeout(function() {
            session.accept();
          }, (JSJAC_JINGLE_MUJI_PARTICIPANT_ACCEPT_WAIT * 1000));
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_initiate_error
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_initiate_error: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_error', 4);

      try {
        /* @function */
        (this.get_participant_session_initiate_error())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_initiate_request
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_initiate_request: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_request', 4);

      try {
        /* @function */
        (this.get_participant_session_initiate_request())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_accept_pending
     * @param {JSJaCJingleSingle} session
     */
    _handle_participant_session_accept_pending: function(session) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_pending', 4);

      try {
        /* @function */
        (this.get_participant_session_accept_pending())(this, session);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_pending > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_accept_success
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_accept_success: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_success', 4);

      try {
        /* @function */
        (this.get_participant_session_accept_success())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_accept_error
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_accept_error: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_error', 4);

      try {
        /* @function */
        (this.get_participant_session_accept_error())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_accept_request
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_accept_request: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_request', 4);

      try {
        /* @function */
        (this.get_participant_session_accept_request())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_info_pending
     * @param {JSJaCJingleSingle} session
     */
    _handle_participant_session_info_pending: function(session) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_pending', 4);

      try {
        /* @function */
        (this.get_participant_session_info_pending())(this, session);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_pending > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_info_success
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_info_success: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_success', 4);

      try {
        /* @function */
        (this.get_participant_session_info_success())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_info_error
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_info_error: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_error', 4);

      try {
        /* @function */
        (this.get_participant_session_info_error())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_info_request
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_info_request: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_request', 4);

      try {
        /* @function */
        (this.get_participant_session_info_request())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_terminate_pending
     * @param {JSJaCJingleSingle} session
     */
    _handle_participant_session_terminate_pending: function(session) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_pending', 4);

      try {
        /* @function */
        (this.get_participant_session_terminate_pending())(this, session);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_pending > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_terminate_success
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_terminate_success: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_success', 4);

      try {
        /* @function */
        (this.get_participant_session_terminate_success())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_terminate_error
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_terminate_error: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_error', 4);

      try {
        /* @function */
        (this.get_participant_session_terminate_error())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_terminate_request
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_terminate_request: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_request', 4);

      try {
        /* @function */
        (this.get_participant_session_terminate_request())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_request > ' + e, 1);
      }
    },

    /**
     * Handles the stream add event
     * @private
     * @event JSJaCJingleMuji#_handle_participant_stream_add
     * @param {JSJaCJingleSingle} session
     * @param {MediaStreamEvent} data
     */
    _handle_participant_stream_add: function(session, data) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_stream_add', 4);

      try {
        /* @function */
        (this.get_participant_stream_add())(this, session, data);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_stream_add > ' + e, 1);
      }
    },

    /**
     * Handles the stream remove event
     * @private
     * @event JSJaCJingleMuji#_handle_participant_stream_remove
     * @param {JSJaCJingleSingle} session
     * @param {MediaStreamEvent} data
     */
    _handle_participant_stream_remove: function(session, data) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_stream_remove', 4);

      try {
        /* @function */
        (this.get_participant_stream_remove())(this, session, data);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_stream_remove > ' + e, 1);
      }
    },

    /**
     * Handles the stream connected event
     * @private
     * @event JSJaCJingleMuji#_handle_participant_stream_connected
     * @param {JSJaCJingleSingle} session
     * @param {MediaStreamEvent} data
     */
    _handle_participant_stream_connected: function(session, data) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_stream_connected', 4);

      try {
        /* @function */
        (this.get_participant_stream_connected())(this, session, data);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_stream_connected > ' + e, 1);
      }
    },

    /**
     * Handles the stream disconnected event
     * @private
     * @event JSJaCJingleMuji#_handle_participant_stream_disconnected
     * @param {JSJaCJingleSingle} session
     * @param {MediaStreamEvent} data
     */
    _handle_participant_stream_disconnected: function(session, data) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_stream_disconnected', 4);

      try {
        /* @function */
        (this.get_participant_stream_disconnected())(this, session, data);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_stream_disconnected > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE STANZA PARSERS
     */

    /**
     * Returns whether user is preparing or not
     * @private
     * @param {DOM} muji
     * @returns {Boolean} Preparing state
     */
    _stanza_has_preparing: function(muji) {
      return this.utils.stanza_get_element(muji, 'preparing', NS_MUJI).length && true;
    },

    /**
     * Returns whether user has content or not
     * @private
     * @param {DOM} muji
     * @returns {Boolean} Content state
     */
    _stanza_has_content: function(muji) {
      return this.utils.stanza_get_element(muji, 'content', NS_MUJI).length && true;
    },

    /**
     * Returns whether stanza has the room owner code or not
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Room owner state
     */
    _stanza_has_room_owner: function(stanza) {
      var is_room_owner = false;

      try {
        var i, items,
            x_muc_user = stanza.getChild('x', NS_JABBER_MUC_USER);

        if(x_muc_user) {
          items = this.utils.stanza_get_element(x_muc_user, 'item', NS_JABBER_MUC_USER);

          for(i = 0; i < items.length; i++) {
            if(items[i].getAttribute('affiliation') === JSJAC_JINGLE_MUJI_MUC_AFFILIATION_OWNER) {
              is_room_owner = true; break;
            }
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _stanza_has_room_owner > ' + e, 1);
      } finally {
        return is_room_owner;
      }
    },

    /**
     * Returns whether stanza is a password invalid or not
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Password invalid state
     */
    _stanza_has_password_invalid: function(stanza) {
      return (this.utils.stanza_get_error(stanza, XMPP_ERROR_NOT_AUTHORIZED).length >= 1) && true;
    },

    /**
     * Returns whether stanza is an username conflict or not
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Local user state
     */
    _stanza_has_username_conflict: function(stanza) {
      return (this.utils.stanza_get_error(stanza, XMPP_ERROR_CONFLICT).length >= 1) && true;
    },



    /**
     * JSJSAC JINGLE PEER TOOLS
     */

    /**
     * Creates peer connection instance
     * @private
     */
    _peer_connection_create_instance: function() {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_instance', 4);

      try {
        // Create the RTCPeerConnection object
        this._set_peer_connection(
          new WEBRTC_PEER_CONNECTION(
            null,
            WEBRTC_CONFIGURATION.peer_connection.constraints
          )
        );
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_instance > ' + e, 1);
      }
    },

    /**
     * Attaches peer connection callbacks (not used)
     * @private
     * @param {Function} [sdp_message_callback]
     */
    _peer_connection_callbacks: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_callbacks', 4);

      try {
        // Not used for Muji
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_callbacks > ' + e, 1);
      }
    },

    /**
     * Dispatches peer connection to correct creator (offer/answer)
     * @private
     * @param {Function} [sdp_message_callback]
     */
    _peer_connection_create_dispatch: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_dispatch', 4);

      try {
        this._peer_connection_create_offer(sdp_message_callback);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_dispatch > ' + e, 1);
      }
    },

    /**
     * Creates peer connection offer
     * @private
     * @param {Function} [sdp_message_callback]
     */
    _peer_connection_create_offer: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_offer', 4);

      try {
        // Create offer
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_offer > Getting local description...', 2);

        // Local description
        this.get_peer_connection().createOffer(
          function(sdp_local) {
            this._peer_got_description(sdp_local, sdp_message_callback);
          }.bind(this),

          this._peer_fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_offer
        );
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_offer > ' + e, 1);
      }
    },

    /**
     * Triggers the media not obtained error event
     * @private
     * @fires JSJaCJingleMuji#get_session_initiate_error
     * @param {Object} error
     */
    _peer_got_user_media_error: function(error) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_got_user_media_error', 4);

      try {
        /* @function */
        (this.get_session_initiate_error())(this);
        this.handle_session_initiate_error();

        this.get_debug().log('[JSJaCJingle:muji] _peer_got_user_media_error > Failed (' + (error.PERMISSION_DENIED ? 'permission denied' : 'unknown' ) + ').', 1);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_got_user_media_error > ' + e, 1);
      }
    },

    /**
     * Set a timeout limit to peer connection
     * @private
     * @param {String} state
     * @param {Object} [args]
     */
    _peer_timeout: function(state, args) {
      try {
        // Assert
        if(typeof args !== 'object') args = {};

        var t_iid = this.get_iid();

        var _this = this;

        setTimeout(function() {
          try {
            // State did not change?
            if(_this.get_iid() == t_iid && _this.get_peer_connection().iceConnectionState == state) {
              _this.get_debug().log('[JSJaCJingle:muji] _peer_timeout > Peer timeout.', 2);
            }
          } catch(e) {
            _this.get_debug().log('[JSJaCJingle:muji] _peer_timeout > ' + e, 1);
          }
        }, ((args.timer || JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT) * 1000));
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_timeout > ' + e, 1);
      }
    },

    /**
     * Stops ongoing peer connections
     * @private
     */
    _peer_stop: function() {
      this.get_debug().log('[JSJaCJingle:muji] _peer_stop', 4);

      // Detach media streams from DOM view
      this._set_local_stream(null);

      // Close the media stream
      if(this.get_peer_connection()  &&
         (typeof this.get_peer_connection().close == 'function'))
        this.get_peer_connection().close();

      // Remove this session from router
      JSJaCJingle._remove(JSJAC_JINGLE_SESSION_SINGLE, this.get_sid());
    },



    /**
     * JSJSAC JINGLE STATES
     */

    /**
     * Is user media ready?
     * @public
     * @returns {Boolean} Ready state
     */
    is_ready_user_media: function() {
      return (this.get_local_stream() !== null) && true;
    },

    /**
     * Is this stanza from a participant?
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Participant state
     */
    is_stanza_from_participant: function(stanza) {
      var username = this.utils.stanza_username(stanza);
      return (this.get_participants(username) in JSJAC_JINGLE_MUJI_STATUS) && true;
    },

    /**
     * Is this stanza from local user?
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Local user state
     */
    is_stanza_from_local: function(stanza) {
      return this.utils.stanza_username(stanza) === this.get_username();
    },



    /**
     * JSJSAC JINGLE SHORTCUTS
     */

    /**
     * Returns participant status (even if inexistant)
     * @private
     * @param {String} username
     * @returns {String} Status
     */
    _shortcut_participant_status: function(username) {
      return ((this.get_participants(username) || {}).status || JSJAC_JINGLE_MUJI_STATUS_INACTIVE);
    },

    /**
     * Returns local user candidates
     * @private
     * @returns {Object} Candidates
     */
    _shortcut_local_user_candidates: function() {
      return this.get_candidates_local();
    },

    /**
     * Gets participant view (or create it)
     * @private
     * @param {String} username
     * @returns {Object} View
     */
    _shortcut_participant_view: function(username) {
      if((this.get_participants(username) || {}).view)
        return this.get_participants(username).view;

      return this.get_add_remote_view()(this, username, this.get_media());
    },



    /**
     * JSJSAC JINGLE VARIOUS TOOLS
     */

    /**
     * Terminate participant sessions
     * @private
     * @param {Boolean} [send_terminate]
     * @param {Function} [leave_callback]
     */
    _terminate_participant_sessions: function(send_terminate, leave_callback) {
      try {
        // Terminate each session
        var cur_username, cur_participant,
            participants = this.get_participants();

        for(cur_username in participants) {
          cur_participant = participants[cur_username];

          if(typeof cur_participant.session != 'undefined') {
            if(send_terminate === true)
              cur_participant.session.terminate();

            this.get_remove_remote_view()(this, cur_username);
          }
        }

        // Execute callback after a while
        var _this = this;

        if(typeof leave_callback == 'function') {
          setTimeout(function() {
            try {
              leave_callback();
            } catch(e) {
              _this.get_debug().log('[JSJaCJingle:muji] _terminate_participant_sessions > ' + e, 1);
            }
          }, (JSJAC_JINGLE_MUJI_LEAVE_WAIT * 1000));
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _terminate_participant_sessions > ' + e, 1);
      }
    },

    /**
     * Mutes/unmutes all or given participant(s)
     * @private
     * @param {String} media_name
     * @param {String} mute_action
     * @param {String} [username]
     */
    _toggle_participants_mute: function(media_name, mute_action, username) {
      try {
        var i, cur_participant;
        var participants = {};

        // One specific or all?
        if(username)
          participants[username] = this.get_participants(username);
        else
          participants = this.get_participants();

        for(i in participants) {
          cur_participant = participants[i];

          if(cur_participant.session.get_status() === JSJAC_JINGLE_STATUS_ACCEPTED) {
            switch(mute_action) {
              case JSJAC_JINGLE_SESSION_INFO_MUTE:
                cur_participant.session.mute(media_name); break;

              case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
                cur_participant.session.unmute(media_name); break;
            }
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _toggle_participants_mute > ' + e, 1);
      }
    },

    /**
     * Defers given participant handler (or executes it)
     * @private
     * @param {Function} fn
     * @returns {Boolean} Defer status
     */
    _defer_participant_handlers: function(fn) {
      var is_deferred = false;

      try {
        var _this = this;

        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_INITIATED  &&
           this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEAVING    &&
           this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEFT
          ) {
          this.defer_handler(JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA, function() {
            fn.bind(_this)(true);
          });

          is_deferred = true;

          this.get_debug().log('[JSJaCJingle:muji] _defer_participant_handlers > Deferred participant handler (waiting for user media).', 0);
        } else {
          fn(false);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _defer_participant_handlers > ' + e, 1);
      } finally {
        return is_deferred;
      }
    },

    /**
     * Undefers participant handlers
     * @private
     */
    _undefer_participant_handlers: function() {
      try {
        // Undefer pending handlers
        var i, handlers;
        handlers = this.get_deferred_handlers(JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA);

        if(typeof handlers == 'object' && handlers.length) {
          this.get_debug().log('[JSJaCJingle:muji] _undefer_participant_handlers > Submitted to deferred handlers.', 2);

          for(i = 0; i < handlers.length; i++) {
            /* @function */
            handlers[i]();
          }

          this.undefer_handler(JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _undefer_participant_handlers > ' + e, 1);
      }
    },

    /**
     * Creates participant Jingle session
     * @private
     * @param {String} username
     * @returns {JSJaCJingleSingle|Object} Jingle session instance
     */
    _create_participant_session: function(username) {
      var session = null;

      try {
        // Create Jingle session
        var session_args = this._generate_participant_session_args(username);

        session = new JSJaCJingleSingle(session_args);

        this._set_participants(username, {
          status: JSJAC_JINGLE_MUJI_STATUS_INITIATED,
          session: session,
          view: session_args.remote_view
        });

        // Configure Jingle session
        this.get_participants(username).session._set_local_stream_raw(
          this.get_local_stream()
        );
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _create_participant_session > ' + e, 1);
      } finally {
        return session;
      }
    },

    /**
     * Generates participant Jingle session arguments
     * @private
     * @param {String} username
     * @returns {Object} Jingle session arguments
     */
    _generate_participant_session_args: function(username) {
      args = {};

      try {
        // Main values
        args.connection             = this.get_connection();
        args.to                     = this.get_to() + '/' + username;
        args.local_view             = this.get_local_view();
        args.remote_view            = this._shortcut_participant_view(username);
        args.local_stream_readonly  = true;

        // Propagate values
        args.media         = this.get_media();
        args.video_source  = this.get_video_source();
        args.resolution    = this.get_resolution();
        args.bandwidth     = this.get_bandwidth();
        args.fps           = this.get_fps();
        args.stun          = this.get_stun();
        args.turn          = this.get_turn();
        args.sdp_trace     = this.get_sdp_trace();
        args.net_trace     = this.get_net_trace();
        args.debug         = this.get_debug();

        // Handlers
        args.session_initiate_pending   = this._handle_participant_session_initiate_pending.bind(this);
        args.session_initiate_success   = this._handle_participant_session_initiate_success.bind(this);
        args.session_initiate_error     = this._handle_participant_session_initiate_error.bind(this);
        args.session_initiate_request   = this._handle_participant_session_initiate_request.bind(this);

        args.session_accept_pending     = this._handle_participant_session_accept_pending.bind(this);
        args.session_accept_success     = this._handle_participant_session_accept_success.bind(this);
        args.session_accept_error       = this._handle_participant_session_accept_error.bind(this);
        args.session_accept_request     = this._handle_participant_session_accept_request.bind(this);

        args.session_info_pending       = this._handle_participant_session_info_pending.bind(this);
        args.session_info_success       = this._handle_participant_session_info_success.bind(this);
        args.session_info_error         = this._handle_participant_session_info_error.bind(this);
        args.session_info_request       = this._handle_participant_session_info_request.bind(this);

        args.session_terminate_pending  = this._handle_participant_session_terminate_pending.bind(this);
        args.session_terminate_success  = this._handle_participant_session_terminate_success.bind(this);
        args.session_terminate_error    = this._handle_participant_session_terminate_error.bind(this);
        args.session_terminate_request  = this._handle_participant_session_terminate_request.bind(this);

        args.stream_add                 = this._handle_participant_stream_add.bind(this);
        args.stream_remove              = this._handle_participant_stream_remove.bind(this);
        args.stream_connected           = this._handle_participant_stream_connected.bind(this);
        args.stream_disconnected        = this._handle_participant_stream_disconnected.bind(this);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _generate_participant_session_args > ' + e, 1);
      } finally {
        return args;
      }
    },

    /**
     * Autoconfigures MUC room password
     * @private
     */
    _autoconfigure_room_password: function() {
      try {
        // Build stanza
        stanza = new JSJaCIQ();

        stanza.setTo(this.get_to());
        stanza.setType(JSJAC_JINGLE_IQ_TYPE_GET);

        stanza.setQuery(NS_JABBER_MUC_OWNER);

        var _this = this;

        this.get_connection().send(stanza, function(_stanza) {
          if(_this.get_net_trace())  _this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > Incoming packet received' + '\n\n' + _stanza.xml());

          if(_stanza.getType() === JSJAC_JINGLE_IQ_TYPE_ERROR)
            _this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > Could not get room configuration.', 1);
          else
            _this._receive_autoconfigure_room_password(_stanza);
        });

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > Outgoing packet sent' + '\n\n' + stanza.xml());

        this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > Getting room configuration...', 4);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > ' + e, 1);
      }
    },

    /**
     * Receives MUC room password configuration
     * @private
     * @param {JSJaCPacket} stanza
     */
    _receive_autoconfigure_room_password: function(stanza) {
      try {
        var parse_obj = this._parse_autoconfigure_room_password(stanza);

        this._set_password(parse_obj.password);

        if(parse_obj.password != parse_obj.old_password) {
          this._send_autoconfigure_room_password(stanza, parse_obj);
        } else {
          this.get_debug().log('[JSJaCJingle:muji] _parse_autoconfigure_room_password > Room password already configured (password: ' + parse_obj.password + ').', 2);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _receive_autoconfigure_room_password > ' + e, 1);
      }
    },

    /**
     * Parses MUC room password configuration
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Object} Parse results
     */
    _parse_autoconfigure_room_password: function(stanza) {
      var i,
          x_data_sel, field_item_sel, password_field_sel, password_value_sel,
          old_password, password;

      try {
        // Get stanza items
        query_sel = stanza.getQuery(NS_JABBER_MUC_OWNER);

        if(!query_sel)  throw 'No query element received.';

        x_data_sel = this.utils.stanza_get_element(query_sel, 'x', NS_JABBER_DATA);
        if(!x_data_sel || x_data_sel.length === 0)  throw 'No X data element received.';

        x_data_sel = x_data_sel[0];

        field_item_sel = this.utils.stanza_get_element(x_data_sel, 'field', NS_JABBER_DATA);
        if(!field_item_sel || field_item_sel.length === 0)  throw 'No field element received.';

        for(i = 0; i < field_item_sel.length; i++) {
          if(field_item_sel[i].getAttribute('var') === JSJAC_JINGLE_MUJI_MUC_CONFIG_SECRET) {
            password_field_sel = field_item_sel[i]; break;
          }
        }

        if(password_field_sel === undefined)  throw 'No password field element received.';

        password_value_sel = this.utils.stanza_get_element(password_field_sel, 'value', NS_JABBER_DATA);
        if(!password_value_sel || password_value_sel.length === 0)  throw 'No password field value element received.';

        password_value_sel = password_value_sel[0];

        // Get old password
        old_password = password_value_sel.nodeValue;

        // Apply password?
        if(this.get_password() && old_password != this.get_password()) {
          password = this.get_password();
        } else if(old_password) {
          password = old_password;
        } else {
          password = this.utils.generate_password();
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _parse_autoconfigure_room_password > ' + e, 1);
      } finally {
        return {
          password           : password,
          old_password       : old_password,
          x_data_sel         : x_data_sel,
          field_item_sel     : field_item_sel,
          password_field_sel : password_field_sel,
          password_value_sel : password_value_sel,
        };
      }
    },

    /**
     * Receives MUC room password configuration
     * @private
     * @param {JSJaCPacket} stanza
     * @param {Object} parse_obj
     */
    _send_autoconfigure_room_password: function(stanza, parse_obj) {
      try {
        // Change stanza headers
        stanza.setID(this.get_id_new());
        stanza.setType(JSJAC_JINGLE_IQ_TYPE_SET);
        stanza.setTo(stanza.getFrom());
        stanza.setFrom(null);

        // Change stanza items
        parse_obj.x_data_sel.setAttribute('type', JSJAC_JINGLE_MUJI_MUC_OWNER_SUBMIT);

        parse_obj.password_value_sel.parentNode.removeChild(parse_obj.password_value_sel);
        parse_obj.password_field_sel.appendChild(
          stanza.buildNode('value', { 'xmlns': NS_JABBER_DATA }, parse_obj.password)
        );

        var _this = this;

        this.get_connection().send(stanza, function(_stanza) {
          if(_this.get_net_trace())  _this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Incoming packet received' + '\n\n' + _stanza.xml());

          if(_stanza.getType() === JSJAC_JINGLE_IQ_TYPE_ERROR) {
            _this._set_password(undefined);

            _this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Could not autoconfigure room password.', 1);
          } else {
            _this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Successfully autoconfigured room password.', 2);
          }
        });

        this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Autoconfiguring room password (password: ' + parse_obj.password + ')...', 4);

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Outgoing packet sent' + '\n\n' + stanza.xml());
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE MUJI GETTERS
     */

    /**
     * Gets the participants object
     * @public
     * @param {String} username
     * @returns {Object} Participants object
     */
    get_participants: function(username) {
      if(username)
        return this._participants[username];

      return this._participants;
    },

    /**
     * Gets the creator value
     * @public
     * @returns {String} Creator value
     */
    get_creator: function() {
      return this.get_to();
    },

    /**
     * Gets the incoming message callback function
     * @public
     * @event JSJaCJingleMuji#get_room_message_in
     * @returns {Function} Incoming message callback function
     */
    get_room_message_in: function() {
      return this._shortcut_get_handler(
        this._room_message_in
      );
    },

    /**
     * Gets the outgoing message callback function
     * @public
     * @event JSJaCJingleMuji#get_room_message_out
     * @returns {Function} Outgoing message callback function
     */
    get_room_message_out: function() {
      return this._shortcut_get_handler(
        this._room_message_out
      );
    },

    /**
     * Gets the incoming presence callback function
     * @public
     * @event JSJaCJingleMuji#get_room_presence_in
     * @returns {Function} Incoming presence callback function
     */
    get_room_presence_in: function() {
      return this._shortcut_get_handler(
        this._room_presence_in
      );
    },

    /**
     * Gets the outgoing presence callback function
     * @public
     * @event JSJaCJingleMuji#get_room_presence_out
     * @returns {Function} Outgoing presence callback function
     */
    get_room_presence_out: function() {
      return this._shortcut_get_handler(
        this._room_presence_out
      );
    },

    /**
     * Gets the session prepare pending callback function
     * @public
     * @event JSJaCJingleMuji#get_session_prepare_pending
     * @returns {Function} Session prepare pending callback function
     */
    get_session_prepare_pending: function() {
      return this._shortcut_get_handler(
        this._session_prepare_pending
      );
    },

    /**
     * Gets the session prepare success callback function
     * @public
     * @event JSJaCJingleMuji#get_session_prepare_success
     * @returns {Function} Session prepare success callback function
     */
    get_session_prepare_success: function() {
      return this._shortcut_get_handler(
        this._session_prepare_success
      );
    },

    /**
     * Gets the session prepare error callback function
     * @public
     * @event JSJaCJingleMuji#get_session_prepare_error
     * @returns {Function} Session prepare error callback function
     */
    get_session_prepare_error: function() {
      return this._shortcut_get_handler(
        this._session_prepare_error
      );
    },

    /**
     * Gets the session initiate pending callback function
     * @public
     * @event JSJaCJingleMuji#get_session_initiate_pending
     * @returns {Function} Session initiate pending callback function
     */
    get_session_initiate_pending: function() {
      return this._shortcut_get_handler(
        this._session_initiate_pending
      );
    },

    /**
     * Gets the session initiate success callback function
     * @public
     * @event JSJaCJingleMuji#get_session_initiate_success
     * @returns {Function} Session initiate success callback function
     */
    get_session_initiate_success: function() {
      return this._shortcut_get_handler(
        this._session_initiate_success
      );
    },

    /**
     * Gets the session initiate error callback function
     * @public
     * @event JSJaCJingleMuji#get_session_initiate_error
     * @returns {Function} Session initiate error callback function
     */
    get_session_initiate_error: function() {
      return this._shortcut_get_handler(
        this._session_initiate_error
      );
    },

    /**
     * Gets the session leave pending callback function
     * @public
     * @event JSJaCJingleMuji#get_session_leave_pending
     * @returns {Function} Session leave pending callback function
     */
    get_session_leave_pending: function() {
      return this._shortcut_get_handler(
        this._session_leave_pending
      );
    },

    /**
     * Gets the session leave success callback function
     * @public
     * @event JSJaCJingleMuji#get_session_leave_success
     * @returns {Function} Session leave success callback function
     */
    get_session_leave_success: function() {
      return this._shortcut_get_handler(
        this._session_leave_success
      );
    },

    /**
     * Gets the session leave error callback function
     * @public
     * @event JSJaCJingleMuji#get_session_leave_error
     * @returns {Function} Session leave error callback function
     */
    get_session_leave_error: function() {
      return this._shortcut_get_handler(
        this._session_leave_error
      );
    },

    /**
     * Gets the participant prepare callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_prepare
     * @returns {Function} Participant prepare callback function
     */
    get_participant_prepare: function() {
      return this._shortcut_get_handler(
        this._participant_prepare
      );
    },

    /**
     * Gets the participant initiate callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_initiate
     * @returns {Function} Participant initiate callback function
     */
    get_participant_initiate: function() {
      return this._shortcut_get_handler(
        this._participant_initiate
      );
    },

    /**
     * Gets the participant leave callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_leave
     * @returns {Function} Participant leave callback function
     */
    get_participant_leave: function() {
      return this._shortcut_get_handler(
        this._participant_leave
      );
    },

    /**
     * Gets the participant session initiate pending callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_initiate_pending
     * @returns {Function} Participant session initiate pending callback function
     */
    get_participant_session_initiate_pending: function() {
      return this._shortcut_get_handler(
        this._participant_session_initiate_pending
      );
    },

    /**
     * Gets the participant session initiate success callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_initiate_success
     * @returns {Function} Participant session initiate success callback function
     */
    get_participant_session_initiate_success: function() {
      return this._shortcut_get_handler(
        this._participant_session_initiate_success
      );
    },

    /**
     * Gets the participant session initiate error callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_initiate_error
     * @returns {Function} Participant session initiate error callback function
     */
    get_participant_session_initiate_error: function() {
      return this._shortcut_get_handler(
        this._participant_session_initiate_error
      );
    },

    /**
     * Gets the participant session initiate request callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_initiate_request
     * @returns {Function} Participant session initiate request callback function
     */
    get_participant_session_initiate_request: function() {
      return this._shortcut_get_handler(
        this._participant_session_initiate_request
      );
    },

    /**
     * Gets the participant session accept pending callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_accept_pending
     * @returns {Function} Participant session accept pending callback function
     */
    get_participant_session_accept_pending: function() {
      return this._shortcut_get_handler(
        this._participant_session_accept_pending
      );
    },

    /**
     * Gets the participant session accept success callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_accept_success
     * @returns {Function} Participant session accept success callback function
     */
    get_participant_session_accept_success: function() {
      return this._shortcut_get_handler(
        this._participant_session_accept_success
      );
    },

    /**
     * Gets the participant session accept error callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_accept_error
     * @returns {Function} Participant session accept error callback function
     */
    get_participant_session_accept_error: function() {
      return this._shortcut_get_handler(
        this._participant_session_accept_error
      );
    },

    /**
     * Gets the participant session accept request callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_accept_request
     * @returns {Function} Participant session accept request callback function
     */
    get_participant_session_accept_request: function() {
      return this._shortcut_get_handler(
        this._participant_session_accept_request
      );
    },

    /**
     * Gets the participant session info pending callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_info_pending
     * @returns {Function} Participant session info pending callback function
     */
    get_participant_session_info_pending: function() {
      return this._shortcut_get_handler(
        this._participant_session_info_pending
      );
    },

    /**
     * Gets the participant session info success callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_info_success
     * @returns {Function} Participant session info success callback function
     */
    get_participant_session_info_success: function() {
      return this._shortcut_get_handler(
        this._participant_session_info_success
      );
    },

    /**
     * Gets the participant session info error callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_info_error
     * @returns {Function} Participant session info error callback function
     */
    get_participant_session_info_error: function() {
      return this._shortcut_get_handler(
        this._participant_session_info_error
      );
    },

    /**
     * Gets the participant session info request callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_info_request
     * @returns {Function} Participant session info request callback function
     */
    get_participant_session_info_request: function() {
      return this._shortcut_get_handler(
        this._participant_session_info_request
      );
    },

    /**
     * Gets the participant session terminate pending callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_terminate_pending
     * @returns {Function} Participant session terminate pending callback function
     */
    get_participant_session_terminate_pending: function() {
      return this._shortcut_get_handler(
        this._participant_session_terminate_pending
      );
    },

    /**
     * Gets the participant session terminate success callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_terminate_success
     * @returns {Function} Participant session terminate success callback function
     */
    get_participant_session_terminate_success: function() {
      return this._shortcut_get_handler(
        this._participant_session_terminate_success
      );
    },

    /**
     * Gets the participant session terminate error callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_terminate_error
     * @returns {Function} Participant session terminate error callback function
     */
    get_participant_session_terminate_error: function() {
      return this._shortcut_get_handler(
        this._participant_session_terminate_error
      );
    },

    /**
     * Gets the participant session terminate request callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_terminate_request
     * @returns {Function} Participant session terminate request callback function
     */
    get_participant_session_terminate_request: function() {
      return this._shortcut_get_handler(
        this._participant_session_terminate_request
      );
    },

    /**
     * Gets the participant stream add event callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_stream_add
     * @returns {Function} Participant stream add event callback function
     */
    get_participant_stream_add: function() {
      return this._shortcut_get_handler(
        this._participant_stream_add
      );
    },

    /**
     * Gets the participant stream remove event callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_stream_remove
     * @returns {Function} Participant stream remove event callback function
     */
    get_participant_stream_remove: function() {
      return this._shortcut_get_handler(
        this._participant_stream_remove
      );
    },

    /**
     * Gets the participant stream connected event callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_stream_connected
     * @returns {Function} Participant stream connected event callback function
     */
    get_participant_stream_connected: function() {
      return this._shortcut_get_handler(
        this._participant_stream_connected
      );
    },

    /**
     * Gets the participant stream disconnected event callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_stream_disconnected
     * @returns {Function} Participant stream disconnected event callback function
     */
    get_participant_stream_disconnected: function() {
      return this._shortcut_get_handler(
        this._participant_stream_disconnected
      );
    },

    /**
     * Gets the remote view add callback function
     * @public
     * @event JSJaCJingleMuji#get_add_remote_view
     * @returns {Function} Remote view add callback function
     */
    get_add_remote_view: function() {
      return this._shortcut_get_handler(
        this._add_remote_view
      );
    },

    /**
     * Gets the remote view removal callback function
     * @public
     * @event JSJaCJingleMuji#get_remove_remote_view
     * @returns {Function} Remote view removal callback function
     */
    get_remove_remote_view: function() {
      return this._shortcut_get_handler(
        this._remove_remote_view
      );
    },

    /**
     * Gets the local username
     * @public
     * @returns {String} Local username
     */
    get_username: function() {
      return this._username;
    },

    /**
     * Gets the room password
     * @public
     * @returns {String} Room password
     */
    get_password: function() {
      return this._password;
    },

    /**
     * Gets the password protect state
     * @public
     * @returns {Boolean} Password protect state
     */
    get_password_protect: function() {
      return this._password_protect;
    },

    /**
     * Gets the MUC to value
     * @public
     * @returns {String} To value for MUC
     */
    get_muc_to: function() {
      return (this.get_to() + '/' + this.get_username());
    },

    /**
     * Gets the prepended ID
     * @public
     * @returns {String} Prepended ID value
     */
    get_id_pre: function() {
      return JSJAC_JINGLE_STANZA_ID_PRE + '_' + (this.get_sid() || '0') + '_' + this.get_username() + '_';
    },

    /**
     * Gets the instance ID
     * @public
     * @returns {String} IID value
     */
    get_iid: function() {
      return this._iid;
    },

    /**
     * Gets the room owner state
     * @public
     * @returns {Boolean} Room owner state
     */
    get_is_room_owner: function() {
      return this._is_room_owner;
    },



    /**
     * JSJSAC JINGLE MUJI SETTERS
     */

    /**
     * Sets the room message in callback function
     * @private
     * @param {Function} room_message_in
     */
    _set_room_message_in: function(room_message_in) {
      this._room_message_in = room_message_in;
    },

    /**
     * Sets the room message out callback function
     * @private
     * @param {Function} room_message_out
     */
    _set_room_message_out: function(room_message_out) {
      this._room_message_out = room_message_out;
    },

    /**
     * Sets the room presence in callback function
     * @private
     * @param {Function} room_presence_in
     */
    _set_room_presence_in: function(room_presence_in) {
      this._room_presence_in = room_presence_in;
    },

    /**
     * Sets the room presence out callback function
     * @private
     * @param {Function} room_presence_out
     */
    _set_room_presence_out: function(room_presence_out) {
      this._room_presence_out = room_presence_out;
    },

    /**
     * Sets the session prepare pending callback function
     * @private
     * @param {Function} session_prepare_pending
     */
    _set_session_prepare_pending: function(session_prepare_pending) {
      this._session_prepare_pending = session_prepare_pending;
    },

    /**
     * Sets the session prepare success callback function
     * @private
     * @param {Function} session_prepare_success
     */
    _set_session_prepare_success: function(session_prepare_success) {
      this._session_prepare_success = session_prepare_success;
    },

    /**
     * Sets the session prepare error callback function
     * @private
     * @param {Function} session_prepare_error
     */
    _set_session_prepare_error: function(session_prepare_error) {
      this._session_prepare_error = session_prepare_error;
    },

    /**
     * Sets the session initiate pending callback function
     * @private
     * @param {Function} session_initiate_pending
     */
    _set_session_initiate_pending: function(session_initiate_pending) {
      this._session_initiate_pending = session_initiate_pending;
    },

    /**
     * Sets the session initiate success callback function
     * @private
     * @param {Function} session_initiate_success
     */
    _set_session_initiate_success: function(session_initiate_success) {
      this._session_initiate_success = session_initiate_success;
    },

    /**
     * Sets the session initiate error callback function
     * @private
     * @param {Function} session_initiate_error
     */
    _set_session_initiate_error: function(session_initiate_error) {
      this._session_initiate_error = session_initiate_error;
    },

    /**
     * Sets the session leave pending callback function
     * @private
     * @param {Function} session_leave_pending
     */
    _set_session_leave_pending: function(session_leave_pending) {
      this._session_leave_pending = session_leave_pending;
    },

    /**
     * Sets the session leave success callback function
     * @private
     * @param {Function} session_leave_success
     */
    _set_session_leave_success: function(session_leave_success) {
      this._session_leave_success = session_leave_success;
    },

    /**
     * Sets the session leave error callback function
     * @private
     * @param {Function} session_leave_error
     */
    _set_session_leave_error: function(session_leave_error) {
      this._session_leave_error = session_leave_error;
    },

    /**
     * Sets the participant prepare callback function
     * @private
     * @param {Function} participant_prepare
     */
    _set_participant_prepare: function(participant_prepare) {
      this._participant_prepare = participant_prepare;
    },

    /**
     * Sets the participant initiate callback function
     * @private
     * @param {Function} participant_initiate
     */
    _set_participant_initiate: function(participant_initiate) {
      this._participant_initiate = participant_initiate;
    },

    /**
     * Sets the participant leave callback function
     * @private
     * @param {Function} participant_leave
     */
    _set_participant_leave: function(participant_leave) {
      this._participant_leave = participant_leave;
    },

    /**
     * Sets the participant session initiate pending callback function
     * @private
     * @param {Function} participant_session_initiate_pending
     */
    _set_participant_session_initiate_pending: function(participant_session_initiate_pending) {
      this._participant_session_initiate_pending = participant_session_initiate_pending;
    },

    /**
     * Sets the participant session initiate success callback function
     * @private
     * @param {Function} participant_session_initiate_success
     */
    _set_participant_session_initiate_success: function(participant_session_initiate_success) {
      this._participant_session_initiate_success = participant_session_initiate_success;
    },

    /**
     * Sets the participant session initiate error callback function
     * @private
     * @param {Function} participant_session_initiate_error
     */
    _set_participant_session_initiate_error: function(participant_session_initiate_error) {
      this._participant_session_initiate_error = participant_session_initiate_error;
    },

    /**
     * Sets the participant session initiate request callback function
     * @private
     * @param {Function} participant_session_initiate_request
     */
    _set_participant_session_initiate_request: function(participant_session_initiate_request) {
      this._participant_session_initiate_request = participant_session_initiate_request;
    },

    /**
     * Sets the participant session accept pending callback function
     * @private
     * @param {Function} participant_session_accept_pending
     */
    _set_participant_session_accept_pending: function(participant_session_accept_pending) {
      this._participant_session_accept_pending = participant_session_accept_pending;
    },

    /**
     * Sets the participant session accept success callback function
     * @private
     * @param {Function} participant_session_accept_success
     */
    _set_participant_session_accept_success: function(participant_session_accept_success) {
      this._participant_session_accept_success = participant_session_accept_success;
    },

    /**
     * Sets the participant session accept error callback function
     * @private
     * @param {Function} participant_session_accept_error
     */
    _set_participant_session_accept_error: function(participant_session_accept_error) {
      this._participant_session_accept_error = participant_session_accept_error;
    },

    /**
     * Sets the participant session accept request callback function
     * @private
     * @param {Function} participant_session_accept_request
     */
    _set_participant_session_accept_request: function(participant_session_accept_request) {
      this._participant_session_accept_request = participant_session_accept_request;
    },

    /**
     * Sets the participant session info pending callback function
     * @private
     * @param {Function} participant_session_info_pending
     */
    _set_participant_session_info_pending: function(participant_session_info_pending) {
      this._participant_session_info_pending = participant_session_info_pending;
    },

    /**
     * Sets the participant session info success callback function
     * @private
     * @param {Function} participant_session_info_success
     */
    _set_participant_session_info_success: function(participant_session_info_success) {
      this._participant_session_info_success = participant_session_info_success;
    },

    /**
     * Sets the participant session info error callback function
     * @private
     * @param {Function} participant_session_info_error
     */
    _set_participant_session_info_error: function(participant_session_info_error) {
      this._participant_session_info_error = participant_session_info_error;
    },

    /**
     * Sets the participant session info request callback function
     * @private
     * @param {Function} participant_session_info_request
     */
    _set_participant_session_info_request: function(participant_session_info_request) {
      this._participant_session_info_request = participant_session_info_request;
    },

    /**
     * Sets the participant session terminate pending callback function
     * @private
     * @param {Function} participant_session_terminate_pending
     */
    _set_participant_session_terminate_pending: function(participant_session_terminate_pending) {
      this._participant_session_terminate_pending = participant_session_terminate_pending;
    },

    /**
     * Sets the participant session terminate success callback function
     * @private
     * @param {Function} participant_session_terminate_success
     */
    _set_participant_session_terminate_success: function(participant_session_terminate_success) {
      this._participant_session_terminate_success = participant_session_terminate_success;
    },

    /**
     * Sets the participant session terminate error callback function
     * @private
     * @param {Function} participant_session_terminate_error
     */
    _set_participant_session_terminate_error: function(participant_session_terminate_error) {
      this._participant_session_terminate_error = participant_session_terminate_error;
    },

    /**
     * Sets the participant session terminate request callback function
     * @private
     * @param {Function} participant_session_terminate_request
     */
    _set_participant_session_terminate_request: function(participant_session_terminate_request) {
      this._participant_session_terminate_request = participant_session_terminate_request;
    },

    /**
     * Sets the participant stream add event callback function
     * @private
     * @param {Function} participant_stream_add
     */
    _set_participant_stream_add: function(participant_stream_add) {
      this._participant_stream_add = participant_stream_add;
    },

    /**
     * Sets the participant stream remove event callback function
     * @private
     * @param {Function} participant_stream_remove
     */
    _set_participant_stream_remove: function(participant_stream_remove) {
      this._participant_stream_remove = participant_stream_remove;
    },

    /**
     * Sets the participant stream connected event callback function
     * @private
     * @param {Function} participant_stream_connected
     */
    _set_participant_stream_connected: function(participant_stream_connected) {
      this._participant_stream_connected = participant_stream_connected;
    },

    /**
     * Sets the participant stream disconnected event callback function
     * @private
     * @param {Function} participant_stream_disconnected
     */
    _set_participant_stream_disconnected: function(participant_stream_disconnected) {
      this._participant_stream_disconnected = participant_stream_disconnected;
    },

    /**
     * Sets the add remote view callback function
     * @private
     * @param {Function} add_remote_view
     */
    _set_add_remote_view: function(add_remote_view) {
      this._add_remote_view = add_remote_view;
    },

    /**
     * Sets the remove remote view pending callback function
     * @private
     * @param {Function} remove_remote_view
     */
    _set_remove_remote_view: function(remove_remote_view) {
      this._remove_remote_view = remove_remote_view;
    },

    /**
     * Sets the participants object
     * @private
     * @param {String} username
     * @param {Object} data_obj
     */
    _set_participants: function(username, data_obj) {
      if(username === null) {
        this._participants = {};
      } else if(data_obj === null) {
        if(username in this._participants)
          delete this._participants[username];
      } else if(username) {
        this._participants[username] = data_obj;
      }
    },

    /**
     * Sets the local username
     * @private
     * @param {String} username
     */
    _set_username: function(username) {
      this._username = username;
    },

    /**
     * Sets the room password
     * @private
     * @param {String} password
     */
    _set_password: function(password) {
      this._password = password;
    },

    /**
     * Sets the password protect state
     * @private
     * @param {Boolean} password_protect
     */
    _set_password_protect: function(password_protect) {
      this._password_protect = password_protect;
    },

    /**
     * Sets the instance ID
     * @private
     * @param {String} iid
     */
    _set_iid: function(iid) {
      this._iid = iid;
    },

    /**
     * Sets the room owner state
     * @private
     * @param {Boolean} is_room_owner
     */
    _set_is_room_owner: function(is_room_owner) {
      this._is_room_owner = is_room_owner;
    },
  }
);
/**
 * @fileoverview JSJaC Jingle library - Initialization broadcast lib (XEP-0353)
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/broadcast */
/** @exports JSJaCJingleBroadcast */


/**
 * Library initialization class.
 * @class
 * @classdesc  Initialization broadcast class.
 * @requires   nicolas-van/ring.js
 * @requires   jsjac-jingle/main
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 * @see        {@link http://xmpp.org/extensions/xep-0353.html|XEP-0353: Jingle Message Initiation}
 */
var JSJaCJingleBroadcast = new (ring.create(
  /** @lends JSJaCJingleBroadcast.prototype */
  {
    /**
     * Proposes a call
     * @public
     * @param {String} to
     * @param {Object} medias
     * @returns {String} Call ID
     */
    propose: function(to, medias, cb_timeout) {
      var id, self;

      try {
        self = this;
        id = this._send_remote_propose(to, medias);

        if(typeof cb_timeout == 'function') {
          setTimeout(function() {
            // Call answered
            if(self._exists_id(id) === false) {
              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] propose > Propose successful.', 4);
            } else {
              cb_timeout(id);

              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] propose > Propose timeout.', 2);
            }
          }, (JSJAC_JINGLE_BROADCAST_TIMEOUT * 1000));
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] propose > ' + e, 1);
      } finally {
        return id;
      }
    },

    /**
     * Retracts from a call
     * @public
     * @param {String} to
     * @param {String} id
     */
    retract: function(to, id) {
      try {
        this._send_remote_retract(to, id);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] retract > ' + e, 1);
      }
    },

    /**
     * Accepts a call
     * @public
     * @param {String} to
     * @param {String} id
     * @param {Object} medias
     */
    accept: function(to, id, medias) {
      try {
        this._register_id(id, medias);

        this._send_local_accept(id);
        this._send_remote_proceed(to, id);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] accept > ' + e, 1);
      }
    },

    /**
     * Rejects a call
     * @public
     * @param {String} to
     * @param {String} id
     * @param {Object} medias
     */
    reject: function(to, id, medias) {
      try {
        this._register_id(id, medias);

        this._send_local_reject(id);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] reject > ' + e, 1);
      }
    },

    /**
     * Handles a call
     * @public
     * @param {JSJaCPacket} stanza
     */
    handle: function(stanza) {
      var i,
          is_handled, stanza_child,
          description, cur_description, cur_media,
          proposed_medias,
          id;

      try {
        is_handled = false;

        stanza_child = stanza.getChild(
          '*', NS_JINGLE_MESSAGE
        );

        if(stanza_child) {
          var _this = this;

          var id_unregister_fn = function(stanza) {
            id = _this.get_call_id(stanza);
            if(id)  _this._unregister_id(id);
          };

          switch(stanza_child.tagName) {
            case JSJAC_JINGLE_MESSAGE_ACTION_PROPOSE:
              proposed_medias = {};

              description = stanza_child.getElementsByTagNameNS(
                NS_JINGLE_APPS_RTP, 'description'
              );

              for(i = 0; i < description.length; i++) {
                cur_description = description[i];

                if(cur_description) {
                  cur_media = cur_description.getAttribute('media');

                  if(cur_media && cur_media in JSJAC_JINGLE_MEDIAS) {
                    proposed_medias[cur_media] = 1;
                  }
                }
              }

              JSJaCJingleStorage.get_single_propose()(stanza, proposed_medias);

              is_handled = true; break;

            case JSJAC_JINGLE_MESSAGE_ACTION_RETRACT:
              JSJaCJingleStorage.get_single_retract()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;

            case JSJAC_JINGLE_MESSAGE_ACTION_ACCEPT:
              JSJaCJingleStorage.get_single_accept()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;

            case JSJAC_JINGLE_MESSAGE_ACTION_REJECT:
              JSJaCJingleStorage.get_single_reject()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;

            case JSJAC_JINGLE_MESSAGE_ACTION_PROCEED:
              JSJaCJingleStorage.get_single_proceed()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;
          }
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] handle > ' + e, 1);
      } finally {
        return is_handled;
      }
    },

    /**
     * Returns the call ID
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {String} Call ID
     */
    get_call_id: function(stanza) {
      var call_id = null;

      try {
        var stanza_child = stanza.getChild(
          '*', NS_JINGLE_MESSAGE
        );

        if(stanza_child) {
          call_id = stanza_child.getAttribute('id') || null;
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] get_call_id > ' + e, 1);
      } finally {
        return call_id;
      }
    },

    /**
     * Returns the call medias
     * @public
     * @param {String} id
     * @returns {Object} Call medias
     */
    get_call_medias: function(id) {
      var call_medias = [];

      try {
        call_medias = JSJaCJingleStorage.get_broadcast_ids(id) || [];
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] get_call_medias > ' + e, 1);
      } finally {
        return call_medias;
      }
    },

    /**
     * Broadcasts a Jingle session proposal (remote packet)
     * @private
     * @see {@link http://xmpp.org/extensions/xep-0353.html#intent|XEP-0353 - Propose}
     */
    _send_remote_propose: function(to, medias) {
      var i, cur_media, propose, id;

      try {
        id = this._register_id(null, medias);
        propose = this._build_stanza(
          to, id, JSJAC_JINGLE_MESSAGE_ACTION_PROPOSE
        );

        if(medias && typeof medias == 'object' && medias.length) {
          for(i = 0; i < medias.length; i++) {
            cur_media = medias[i];

            if(cur_media) {
              propose[1].appendChild(
                propose[0].buildNode('description', {
                  'xmlns': NS_JINGLE_APPS_RTP,
                  'media': cur_media
                })
              );
            }
          }
        }

        this._send_stanza(propose);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_propose > ' + e, 1);
      } finally {
        return id;
      }
    },

    /**
     * Broadcasts a Jingle session retract (remote packet)
     * @private
     * @see {@link http://xmpp.org/extensions/xep-0353.html#retract|XEP-0353 - Retract}
     */
    _send_remote_retract: function(to, id) {
      try {
        if(this._exists_id(id) === true) {
          var retract = this._build_stanza(
            to, id, JSJAC_JINGLE_MESSAGE_ACTION_RETRACT
          );

          this._send_stanza(retract);
          this._unregister_id(id);
        } else {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_retract > Cannot retract, target ID not existing.', 0);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_retract > ' + e, 1);
      }
    },

    /**
     * Broadcasts a Jingle session proceed (remote packet)
     * @private
     * @see {@link http://xmpp.org/extensions/xep-0353.html#accept|XEP-0353 - Accept}
     */
    _send_remote_proceed: function(to, id) {
      try {
        // ID shouldn't exist at this point since we're the receiving party
        if(this._exists_id(id) === true) {
          var proceed = this._build_stanza(
            to, id, JSJAC_JINGLE_MESSAGE_ACTION_PROCEED
          );

          this._send_stanza(proceed);
          this._unregister_id(id);
        } else {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_proceed > Cannot proceed, target ID not existing.', 0);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_proceed > ' + e, 1);
      }
    },

    /**
     * Broadcasts a Jingle session accept (local packet)
     * @private-
     * @see {@link http://xmpp.org/extensions/xep-0353.html#accept|XEP-0353 - Accept}
     */
    _send_local_accept: function(id) {
      try {
        // ID shouldn't exist at this point since we're the receiving party
        if(this._exists_id(id) === true) {
          var accept = this._build_stanza(
            null, id, JSJAC_JINGLE_MESSAGE_ACTION_ACCEPT
          );

          this._send_stanza(accept);
        } else {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_local_accept > Cannot accept, target ID not existing.', 0);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_local_accept > ' + e, 1);
      }
    },

    /**
     * Broadcasts a Jingle session reject (local packet)
     * @private
     * @see {@link http://xmpp.org/extensions/xep-0353.html#reject|XEP-0353 - Reject}
     */
    _send_local_reject: function(id) {
      try {
        // ID shouldn't exist at this point since we're the receiving party
        if(this._exists_id(id) === true) {
          var reject = this._build_stanza(
            null, id, JSJAC_JINGLE_MESSAGE_ACTION_REJECT
          );

          this._send_stanza(reject);
        } else {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_local_reject > Cannot reject, target ID not existing.', 0);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_local_reject > ' + e, 1);
      }
    },

    /**
     * Builds a XEP-0353 stanza
     * @private
     */
    _build_stanza: function(to, id, action) {
      stanza_arr = [];

      try {
        var connection, stanza, node;

        stanza = new JSJaCMessage();

        // Set to connection user?
        if(to === null) {
          connection = JSJaCJingleStorage.get_connection();
          to = (connection.username + '@' + connection.domain);
        }

        stanza.setTo(to);

        node = stanza.getNode().appendChild(
          stanza.buildNode(action, {
            'xmlns': NS_JINGLE_MESSAGE,
            'id': id
          })
        );

        stanza_arr = [stanza, node];
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _build_stanza > ' + e, 1);
      } finally {
        return stanza_arr;
      }
    },

    /**
     * Sends a XEP-0353 stanza
     * @private
     */
    _send_stanza: function(stanza_arr) {
      try {
        JSJaCJingleStorage.get_connection().send(
          stanza_arr[0]
        );
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_stanza > ' + e, 1);
      }
    },

    /**
     * Returns whether an ID exists or not
     * @private
     */
    _exists_id: function(id) {
      var is_existing = false;

      try {
        is_existing = (JSJaCJingleStorage.get_broadcast_ids(id) !== null) && true;
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _exists_id > ' + e, 1);
      } finally {
        return is_existing;
      }
    },

    /**
     * Registers an ID
     * @private
     */
    _register_id: function(id, medias) {
      try {
        id = id || JSJaCUtils.cnonce(16);

        JSJaCJingleStorage.set_broadcast_ids(id, medias);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _register_id > ' + e, 1);
      } finally {
        return id;
      }
    },

    /**
     * Unregisters an ID
     * @private
     */
    _unregister_id: function(id) {
      try {
        JSJaCJingleStorage.set_broadcast_ids(id, null, true);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _unregister_id > ' + e, 1);
      }
    },
  }
))();

/**
 * @fileoverview JSJaC Jingle library - Initialization components
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/init */
/** @exports JSJaCJingleInit */


/**
 * Library initialization class.
 * @class
 * @classdesc  Library initialization class.
 * @requires   nicolas-van/ring.js
 * @requires   jsjac-jingle/main
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var JSJaCJingleInit = new (ring.create(
  /** @lends JSJaCJingleInit.prototype */
  {
    /**
     * Query the server for external services
     * @private
     */
    _extdisco: function() {
      JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _extdisco > Discovering available services...', 2);

      try {
        // Pending state (defer other requests)
        JSJaCJingle._defer(true);

        // Build request
        var request = new JSJaCIQ();

        request.setTo(JSJaCJingleStorage.get_connection().domain);
        request.setType(JSJAC_JINGLE_IQ_TYPE_GET);

        request.getNode().appendChild(request.buildNode('services', { 'xmlns': NS_EXTDISCO }));

        JSJaCJingleStorage.get_connection().send(request, function(response) {
          try {
            // Parse response
            if(response.getType() == JSJAC_JINGLE_IQ_TYPE_RESULT) {
              var i,
                  service_arr, cur_service,
                  cur_host, cur_password, cur_port, cur_transport, cur_type, cur_username,
                  store_obj;

              var services = response.getChild('services', NS_EXTDISCO);

              if(services) {
                service_arr = services.getElementsByTagNameNS(NS_EXTDISCO, 'service');

                for(i = 0; i < service_arr.length; i++) {
                  cur_service = service_arr[i];

                  cur_host      = cur_service.getAttribute('host')       || null;
                  cur_port      = cur_service.getAttribute('port')       || null;
                  cur_transport = cur_service.getAttribute('transport')  || null;
                  cur_type      = cur_service.getAttribute('type')       || null;

                  cur_username  = cur_service.getAttribute('username')   || null;
                  cur_password  = cur_service.getAttribute('password')   || null;

                  if(!cur_host || !cur_type)  continue;

                  if(!(cur_type in JSJaCJingleStorage.get_extdisco())) {
                    JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _extdisco > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                    continue;
                  }

                  store_obj = {
                    'host'      : cur_host,
                    'port'      : cur_port,
                    'transport' : cur_transport,
                    'type'      : cur_type
                  };

                  if(cur_type == 'turn') {
                    store_obj.username = cur_username;
                    store_obj.password = cur_password;
                  }

                  JSJaCJingleStorage.get_extdisco()[cur_type].push(store_obj);

                  JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _extdisco > handle > Service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                }
              }

              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _extdisco > handle > Discovered available services.', 2);
            } else {
              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _extdisco > handle > Could not discover services (server might not support XEP-0215).', 0);
            }
          } catch(e) {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _extdisco > handle > ' + e, 1);
          }

          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _extdisco > Ready.', 2);

          // Execute deferred requests
          JSJaCJingle._defer(false);
        });
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _extdisco > ' + e, 1);

        // Execute deferred requests
        JSJaCJingle._defer(false);
      }
    },

    /**
     * Query the server for Jingle Relay Nodes services
     * @private
     */
    _relaynodes: function() {
      JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _relaynodes > Discovering available Jingle Relay Nodes services...', 2);

      try {
        // Pending state (defer other requests)
        JSJaCJingle._defer(true);

        // Build request
        var request = new JSJaCIQ();

        request.setTo(JSJaCJingleStorage.get_connection().domain);
        request.setType(JSJAC_JINGLE_IQ_TYPE_GET);

        request.getNode().appendChild(request.buildNode('services', { 'xmlns': NS_JABBER_JINGLENODES }));

        JSJaCJingleStorage.get_connection().send(request, function(response) {
          try {
            // Parse response
            if(response.getType() == JSJAC_JINGLE_IQ_TYPE_RESULT) {
              var i,
                  stun_arr, cur_stun,
                  cur_policy, cur_address, cur_protocol;

              var services = response.getChild('services', NS_JABBER_JINGLENODES);

              if(services) {
                // Parse STUN servers
                stun_arr = services.getElementsByTagNameNS(NS_JABBER_JINGLENODES, 'stun');

                for(i = 0; i < stun_arr.length; i++) {
                  cur_stun = stun_arr[i];

                  cur_policy    = cur_stun.getAttribute('policy')    || null;
                  cur_address   = cur_stun.getAttribute('address')   || null;
                  cur_port      = cur_stun.getAttribute('port')      || null;
                  cur_protocol  = cur_stun.getAttribute('protocol')  || null;

                  if(!cur_address || !cur_protocol || !cur_policy || (cur_policy && cur_policy != 'public'))  continue;

                  JSJaCJingleStorage.get_relaynodes().stun.push({
                    'host'      : cur_address,
                    'port'      : cur_port,
                    'transport' : cur_protocol,
                    'type'      : 'stun'
                  });

                  JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _relaynodes > handle > STUN service stored (address: ' + cur_address + ', port: ' + cur_port + ', policy: ' + cur_policy + ', protocol: ' + cur_protocol + ').', 4);
                }
              }

              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _relaynodes > handle > Discovered available Jingle Relay Nodes services.', 2);
            } else {
              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _relaynodes > handle > Could not discover Jingle Relay Nodes services (server might not support XEP-0278).', 0);
            }
          } catch(e) {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _relaynodes > handle > ' + e, 1);
          }

          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _relaynodes > Ready.', 2);

          // Execute deferred requests
          JSJaCJingle._defer(false);
        });
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _relaynodes > ' + e, 1);

        // Execute deferred requests
        JSJaCJingle._defer(false);
      }
    },

    /**
     * Query some external APIs for fallback STUN/TURN (must be configured)
     * @private
     * @param {String} fallback_url
     */
    _fallback: function(fallback_url) {
      JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > Discovering fallback services...', 2);

      try {
        // Pending state (defer other requests)
        JSJaCJingle._defer(true);

        // Generate fallback API URL
        fallback_url += '?username=' +
                        encodeURIComponent(JSJaCJingleStorage.get_connection().username + '@' + JSJaCJingleStorage.get_connection().domain);

        // Proceed request
        var xhr = new XMLHttpRequest();
        xhr.open('GET', fallback_url, true);

        xhr.onreadystatechange = function() {
          if(xhr.readyState === 4) {
            // Success?
            if(xhr.status === 200) {
              var data = JSON.parse(xhr.responseText);

              var cur_parse,
                  i, cur_url,
                  cur_type, cur_host, cur_port, cur_transport,
                  cur_username, cur_password,
                  store_obj;

              if(data.uris && data.uris.length) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > handle > Parsing ' + data.uris.length + ' URIs...', 2);

                for(i in data.uris) {
                  cur_url = data.uris[i];

                  if(cur_url) {
                    // Parse current URL
                    cur_parse = R_JSJAC_JINGLE_SERVICE_URI.exec(cur_url);

                    if(cur_parse) {
                      cur_type = cur_parse[1]        || null;
                      cur_host = cur_parse[2]        || null;
                      cur_port = cur_parse[3]        || null;
                      cur_transport = cur_parse[4]   || null;

                      cur_username  = data.username  || null;
                      cur_password  = data.password  || null;

                      if(!cur_host || !cur_type)  continue;

                      if(!(cur_type in JSJaCJingleStorage.get_fallback())) {
                        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                        continue;
                      }

                      store_obj = {
                        'host'      : cur_host,
                        'port'      : cur_port,
                        'transport' : cur_transport,
                        'type'      : cur_type
                      };

                      if(cur_type == 'turn') {
                        store_obj.username = cur_username;
                        store_obj.password = cur_password;
                      }

                      JSJaCJingleStorage.get_fallback()[cur_type].push(store_obj);

                      JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > handle > Fallback service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                    } else {
                      JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > handle > Fallback service not stored, weird URI (' + cur_url + ').', 0);
                    }
                  }
                }

                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > handle > Finished parsing URIs.', 2);
              } else {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > handle > No URI to parse.', 2);
              }

              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > handle > Discovered fallback services.', 2);
            } else {
              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > handle > Could not discover fallback services (API malfunction).', 0);
            }

            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > Ready.', 2);

            // Execute deferred requests
            JSJaCJingle._defer(false);
          }
        };

        xhr.send();
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:init] _fallback > ' + e, 1);
      }
    },
  }
))();
/**
 * @fileoverview JSJaC Jingle library - Common components
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/main */
/** @exports JSJaCJingle */


/**
 * Library main class.
 * @instance
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @requires   jsjac-jingle/init
 * @requires   jsjac-jingle/single
 * @requires   jsjac-jingle/muji
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var JSJaCJingle = new (ring.create(
  /** @lends JSJaCJingle.prototype */
  {
    /**
     * Starts a new Jingle session
     * @public
     * @param {String} type
     * @param {Object} [args]
     * @returns {JSJaCJingleSingle|JSJaCJingleMuji} JSJaCJingle session instance
     */
    session: function(type, args) {
      var jingle;

      try {
        switch(type) {
          case JSJAC_JINGLE_SESSION_SINGLE:
            jingle = new JSJaCJingleSingle(args);
            break;

          case JSJAC_JINGLE_SESSION_MUJI:
            jingle = new JSJaCJingleMuji(args);
            break;

          default:
            throw ('Unknown session type: ' + type);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] session > ' + e, 1);
      } finally {
        return jingle;
      }
    },

    /**
     * Listens for Jingle events
     * @public
     * @param     {Object}           [args]
     * @property  {JSJaCConnection}  [args.connection]       - The connection to be attached to.
     * @property  {Function}         [args.single_initiate]  - The Jingle session initiate request custom handler.
     * @property  {Function}         [args.single_propose]   - The Jingle session propose request custom handler.
     * @property  {Function}         [args.single_retract]   - The Jingle session retract request custom handler.
     * @property  {Function}         [args.single_accept]    - The Jingle session accept request custom handler.
     * @property  {Function}         [args.single_reject]    - The Jingle session reject request custom handler.
     * @property  {Function}         [args.single_proceed]   - The Jingle session proceed request custom handler.
     * @property  {Function}         [args.muji_invite]      - The Muji session invite message custom handler.
     * @property  {JSJaCDebugger}    [args.debug]            - A reference to a debugger implementing the JSJaCDebugger interface.
     * @property  {Boolean}          [args.extdisco]         - Whether or not to discover external services as per XEP-0215.
     * @property  {Boolean}          [args.relaynodes]       - Whether or not to discover relay nodes as per XEP-0278.
     * @property  {Boolean}          [args.fallback]         - Whether or not to request STUN/TURN from a fallback URL.
     * @see {@link https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/fallback.json|Fallback JSON Sample} - Fallback URL format.
     */
    listen: function(args) {
      try {
        // Apply arguments
        if(args && args.connection)
          JSJaCJingleStorage.set_connection(args.connection);
        if(args && args.single_initiate)
          JSJaCJingleStorage.set_single_initiate(args.single_initiate);
        if(args && args.single_propose)
          JSJaCJingleStorage.set_single_propose(args.single_propose);
        if(args && args.single_retract)
          JSJaCJingleStorage.set_single_retract(args.single_retract);
        if(args && args.single_accept)
          JSJaCJingleStorage.set_single_accept(args.single_accept);
        if(args && args.single_reject)
          JSJaCJingleStorage.set_single_reject(args.single_reject);
        if(args && args.single_proceed)
          JSJaCJingleStorage.set_single_proceed(args.single_proceed);
        if(args && args.muji_invite)
          JSJaCJingleStorage.set_muji_invite(args.muji_invite);
        if(args && args.debug)
          JSJaCJingleStorage.set_debug(args.debug);

        // Incoming IQs handler
        var cur_type, route_map = {};
        route_map[JSJAC_JINGLE_STANZA_IQ]        = this._route_iq;
        route_map[JSJAC_JINGLE_STANZA_MESSAGE]   = this._route_message;
        route_map[JSJAC_JINGLE_STANZA_PRESENCE]  = this._route_presence;

        for(cur_type in route_map) {
          JSJaCJingleStorage.get_connection().registerHandler(
            cur_type,
            route_map[cur_type].bind(this)
          );
        }

        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] listen > Listening.', 2);

        // Discover available network services
        if(!args || args.extdisco !== false)
          JSJaCJingleInit._extdisco();
        if(!args || args.relaynodes !== false)
          JSJaCJingleInit._relaynodes();
        if(args.fallback && typeof args.fallback === 'string')
          JSJaCJingleInit._fallback(args.fallback);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] listen > ' + e, 1);
      }
    },

    /**
     * Maps the Jingle disco features
     * @public
     * @returns {Array} Feature namespaces
     */
    disco: function() {
      // Check for listen status
      var has_muji = (typeof JSJaCJingleStorage.get_muji_invite_raw() == 'function' && true);
      var has_jingle = ((has_muji || (typeof JSJaCJingleStorage.get_single_initiate_raw() == 'function')) && true);

      if(JSJAC_JINGLE_AVAILABLE && has_jingle) {
        if(has_muji) {
          return MAP_DISCO_JINGLE.concat(MAP_DISCO_MUJI);
        } else {
          return MAP_DISCO_JINGLE;
        }
      }

      return [];
    },

    /**
     * Routes Jingle IQ stanzas
     * @private
     * @param {JSJaCPacket} stanza
     */
    _route_iq: function(stanza) {
      try {
        var from = stanza.getFrom();

        if(from) {
          var jid_obj = new JSJaCJID(from);
          var from_bare = (jid_obj.getNode() + '@' + jid_obj.getDomain());

          // Single or Muji?
          var is_muji   = (this._read(JSJAC_JINGLE_SESSION_MUJI, from_bare) !== null);
          var is_single = !is_muji;

          var action        = null;
          var sid           = null;
          var session_route = null;

          // Route the incoming stanza
          var jingle = stanza.getChild('jingle', NS_JINGLE);

          if(jingle) {
            sid = jingle.getAttribute('sid');
            action = jingle.getAttribute('action');
          } else {
            var stanza_id = stanza.getID();

            if(stanza_id) {
              var is_jingle = stanza_id.indexOf(JSJAC_JINGLE_STANZA_ID_PRE + '_') !== -1;

              if(is_jingle) {
                var stanza_id_split = stanza_id.split('_');
                sid = stanza_id_split[1];
              }
            }
          }

          // WebRTC not available ATM?
          if(jingle && !JSJAC_JINGLE_AVAILABLE) {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Dropped Jingle packet (WebRTC not available).', 0);

            (new JSJaCJingleSingle({ to: from }))._send_error(stanza, XMPP_ERROR_SERVICE_UNAVAILABLE);
          } else if(is_muji) {
            var username, participant;

            username       = jid_obj.getResource();
            session_route  = this._read(JSJAC_JINGLE_SESSION_MUJI, from_bare);
            participant    = session_route.get_participants(username);

            // Muji: new session? Or registered one?
            if(participant && participant.session  &&
              (participant.session instanceof JSJaCJingleSingle)) {
              // Route to Single session
              var session_route_single = this._read(
                JSJAC_JINGLE_SESSION_SINGLE,
                participant.session.get_sid()
              );

              if(session_route_single !== null) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > [' + username + '] > Routed to Muji participant session (sid: ' + sid + ').', 2);

                session_route_single.handle(stanza);
              } else if(stanza.getType() == JSJAC_JINGLE_IQ_TYPE_SET && from) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Unknown Muji participant session route (sid: ' + sid + ').', 0);

                (new JSJaCJingleSingle({ to: from }))._send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
              }
            } else if(sid) {
              if(action == JSJAC_JINGLE_ACTION_SESSION_INITIATE) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > [' + username + '] > New Muji participant session (sid: ' + sid + ').', 2);

                session_route._create_participant_session(username).handle(stanza);
              } else if(stanza.getType() == JSJAC_JINGLE_IQ_TYPE_SET && from) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Unknown Muji participant session (sid: ' + sid + ').', 0);

                (new JSJaCJingleSingle({ to: from }))._send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
              }
            }
          } else if(is_single) {
            // Single: new session? Or registered one?
            session_route = this._read(JSJAC_JINGLE_SESSION_SINGLE, sid);

            if(action == JSJAC_JINGLE_ACTION_SESSION_INITIATE && session_route === null) {
              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > New Jingle session (sid: ' + sid + ').', 2);

              JSJaCJingleStorage.get_single_initiate()(stanza);
            } else if(sid) {
              if(session_route !== null) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Routed to Jingle session (sid: ' + sid + ').', 2);

                session_route.handle(stanza);
              } else if(stanza.getType() == JSJAC_JINGLE_IQ_TYPE_SET && from) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Unknown Jingle session (sid: ' + sid + ').', 0);

                (new JSJaCJingleSingle({ to: from }))._send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
              }
            }
          } else {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > No route to session, not Jingle nor Muji (sid: ' + sid + ').', 0);
          }
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > ' + e, 1);
      }
    },

    /**
     * Routes Jingle message stanzas
     * @private
     * @param {JSJaCPacket} stanza
     */
    _route_message: function(stanza) {
      try {
        var from = stanza.getFrom();

        if(from) {
          var jid = new JSJaCJID(from);

          // Broadcast message?
          var is_handled_broadcast = JSJaCJingleBroadcast.handle(stanza);

          if(is_handled_broadcast === true) {
            // XEP-0353: Jingle Message Initiation
            // Nothing to do there.
          } else {
            // Muji?
            var room = jid.getNode() + '@' + jid.getDomain();

            var session_route = this._read(JSJAC_JINGLE_SESSION_MUJI, room);

            var x_conference = stanza.getChild('x', NS_JABBER_CONFERENCE);
            var x_invite = stanza.getChild('x', NS_MUJI_INVITE);

            var is_invite = (x_conference && x_invite && true);

            if(is_invite === true) {
              if(session_route === null) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_message > Muji invite received (room: ' + room + ').', 2);

                // Read invite data
                var err = 0;
                var args = {
                  from     : (from                                   || err++),
                  jid      : (x_conference.getAttribute('jid')       || err++),
                  password : (x_conference.getAttribute('password')  || null),
                  reason   : (x_conference.getAttribute('reason')    || null),
                  media    : (x_invite.getAttribute('media')         || err++)
                };

                if(err === 0) {
                  JSJaCJingleStorage.get_muji_invite()(stanza, args);
                } else {
                  JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_message > Dropped invite because incomplete (room: ' + room + ').', 0);
                }
              } else {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_message > Dropped invite because Muji already joined (room: ' + room + ').', 0);
              }
            } else {
              if(session_route !== null) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_message > Routed to Jingle session (room: ' + room + ').', 2);

                session_route.handle_message(stanza);
              }
            }
          }
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_message > ' + e, 1);
      }
    },

    /**
     * Routes Jingle presence stanzas
     * @private
     * @param {JSJaCPacket} stanza
     */
    _route_presence: function(stanza) {
      try {
        // Muji?
        var from = stanza.getFrom();

        if(from) {
          var jid = new JSJaCJID(from);
          var room = jid.getNode() + '@' + jid.getDomain();

          var session_route = this._read(JSJAC_JINGLE_SESSION_MUJI, room);

          if(session_route !== null) {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_presence > Routed to Jingle session (room: ' + room + ').', 2);

            session_route.handle_presence(stanza);
          }
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_presence > ' + e, 1);
      }
    },

    /**
     * Adds a new Jingle session
     * @private
     * @param {String} type
     * @param {String} sid
     * @param {Object} obj
     */
    _add: function(type, sid, obj) {
      JSJaCJingleStorage.get_sessions()[type][sid] = obj;
    },

    /**
     * Reads a new Jingle session
     * @private
     * @param {String} type
     * @param {String} sid
     * @returns {Object} Session
     */
    _read: function(type, sid) {
      return (sid in JSJaCJingleStorage.get_sessions()[type]) ? JSJaCJingleStorage.get_sessions()[type][sid] : null;
    },

    /**
     * Removes a new Jingle session
     * @private
     * @param {String} type
     * @param {String} sid
     */
    _remove: function(type, sid) {
      delete JSJaCJingleStorage.get_sessions()[type][sid];
    },

    /**
     * Defer given task/execute deferred tasks
     * @private
     * @param {(Function|Boolean)} arg
     */
    _defer: function(arg) {
      try {
        if(typeof arg == 'function') {
          // Deferring?
          if(JSJaCJingleStorage.get_defer().deferred) {
            (JSJaCJingleStorage.get_defer().fn).push(arg);

            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] defer > Registered a function to be executed once ready.', 2);
          }

          return JSJaCJingleStorage.get_defer().deferred;
        } else if(!arg || typeof arg == 'boolean') {
          JSJaCJingleStorage.get_defer().deferred = (arg === true);

          if(JSJaCJingleStorage.get_defer().deferred === false) {
            // Execute deferred tasks?
            if((--JSJaCJingleStorage.get_defer().count) <= 0) {
              JSJaCJingleStorage.get_defer().count = 0;

              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] defer > Executing ' + JSJaCJingleStorage.get_defer().fn.length + ' deferred functions...', 2);

              while(JSJaCJingleStorage.get_defer().fn.length)
                ((JSJaCJingleStorage.get_defer().fn).shift())();

              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] defer > Done executing deferred functions.', 2);
            }
          } else {
            ++JSJaCJingleStorage.get_defer().count;
          }
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] defer > ' + e, 1);
      }
    },
  }
))();
