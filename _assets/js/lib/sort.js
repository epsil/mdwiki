/**
 * Stable sort, preserving the original order when possible.
 * @param {Array} arr - The array to sort.
 * @param {function} [fn] - A comparison function that returns
 * `-1` if the first argument scores less than the second argument,
 * `1` if the first argument scores more than the second argument,
 * and `0` if the scores are equal.
 * @return {Array} - The array, sorted.
 */
function sort (arr, fn) {
  fn = fn || sort.ascending()
  var i = 0
  var pairs = arr.map(function (x) {
    return {
      idx: i++,
      val: x
    }
  })
  pairs = pairs.sort(function (a, b) {
    var x = fn(a.val, b.val)
    if (x) { return x }
    return (a.idx < b.idx) ? -1 : ((a.idx > b.idx) ? 1 : 0)
  })
  for (i = 0; i < arr.length; i++) {
    arr[i] = pairs[i].val
  }
  return arr
}

/**
 * Create an ascending comparison function.
 * @param {function} fn - A scoring function.
 * @return {function} - A comparison function that returns
 * `-1` if the first argument scores less than the second argument,
 * `1` if the first argument scores more than the second argument,
 * and `0` if the scores are equal.
 */
sort.ascending = function (fn) {
  return sort.comparator(function (x, y) {
    return (x < y) ? -1 : ((x > y) ? 1 : 0)
  }, fn)
}

/**
 * Create a descending comparison function.
 * @param {function} fn - A scoring function.
 * @return {function} - A comparison function that returns
 * `-1` if the first argument scores more than the second argument,
 * `1` if the first argument scores less than the second argument,
 * and `0` if the scores are equal.
 */
sort.descending = function (fn) {
  return sort.comparator(function (x, y) {
    return (x < y) ? 1 : ((x > y) ? -1 : 0)
  }, fn)
}

/**
 * Create a comparison function.
 * @param {function} cmp - A comparator function.
 * @param {function} [fn] - A scoring function.
 * @return {function} - A comparison function that returns
 * `-1`, `1` or `0` depending on its arguments' scoring values
 * and the intended order.
 */
sort.comparator = function (cmp, fn) {
  fn = fn || sort.identity
  return function (a, b) {
    return cmp(fn(a), fn(b))
  }
}

/**
 * Combine comparison functions.
 * @param {...function} fn - A comparison function.
 * @return {function} - A combined comparison function that returns
 * the first comparison value unless the comparands are equal,
 * in which case it returns the next value.
 */
sort.combine = function () {
  var args = Array.prototype.slice.call(arguments)
  return args.reduce(function (fn1, fn2) {
    return function (a, b) {
      var val = fn1(a, b)
      return (val === 0) ? fn2(a, b) : val
    }
  })
}

/**
 * Identity function.
 * @param {object} x - A value.
 * @return {object} - The same value.
 */
sort.identity = function (x) {
  return x
}

module.exports = sort
