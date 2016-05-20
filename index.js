var cookie = require('cookie');

var _rawCookie = {};
var _res = undefined;

function load(name, doNotParse) {
  var cookies = (typeof document === 'undefined') ? _rawCookie : cookie.parse(document.cookie);
  var cookieVal = cookies && cookies[name];

  if (!doNotParse) {
    try {
      cookieVal = JSON.parse(cookieVal);
    } catch(e) {
      // Not serialized object
    }
  }

  return cookieVal;
}


function save(name, val, opt) {
  _rawCookie[name] = val;

  // allow you to work with cookies as objects.
  if (typeof val === 'object') {
    _rawCookie[name] = JSON.stringify(val);
  }

  // Cookies only work in the browser
  if (typeof document !== 'undefined') {
    document.cookie = cookie.serialize(name, _rawCookie[name], opt);
  }

  if (_res && _res.cookie) {
    _res.cookie(name, val, opt);
  }
}

function remove(name, opt) {
  if(typeof name === 'string') {
    delete _rawCookie[name];
  } else if (name instanceof RegExp) {
    var names = getCookieNames().filter(function(cookieName) { name.test(cookieName) })
    names.forEach(function(cookieName) { remove(cookieName, opt) })
    return
  } else {
    throw new Error('remove function requires a string or regex name parameter.')
  }

  if (typeof opt === 'undefined') {
    opt = {};
  } else if (typeof opt === 'string') {
    // Will be deprecated in future versions
    opt = { path: opt };
  }

  if (typeof document !== 'undefined') {
    opt.expires = new Date(1970, 1, 1, 0, 0, 1);
    document.cookie = cookie.serialize(name, '', opt);
  }

  if (_res && _res.clearCookie) {
    _res.clearCookie(name, opt);
  }
}

function getCookieNames() {
  var cookies = (typeof document === 'undefined') ? _rawCookie : cookie.parse(document.cookie);
  return Object.keys(cookies);
}

function setRawCookie(rawCookie) {
  if (rawCookie) {
    _rawCookie = cookie.parse(rawCookie);
  } else {
    _rawCookie = {};
  }
}

function plugToRequest(req, res) {
  if (req.cookie) {
    _rawCookie = req.cookie;
  } else if (req.cookies) {
    _rawCookie = req.cookies;
  } else if (req.headers && req.headers.cookie) {
    setRawCookie(req.headers.cookie);
  } else {
    _rawCookie = {};
  }

  _res = res;
}

var reactCookie = {
  load: load,
  save: save,
  remove: remove,
  getCookieNames: getCookieNames,
  setRawCookie: setRawCookie,
  plugToRequest: plugToRequest
};

if (typeof window !== 'undefined') {
  window['reactCookie'] = reactCookie;
}

module.exports = reactCookie;
