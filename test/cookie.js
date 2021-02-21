
/**
 * Gets a cookie saved to the local client.
 * @param {string} c_name The name of the cookie to retrieve.
 * @returns {string}
 */
function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1)
        {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
    }
    return c_value;
}

/**
 * Saves a cookie to the local client.
 * @param {string} c_name The name of the cookie to save.
 * @param {string} value The value of the cookie to save.
 * @param {number} exdays The number of days before cookie expiration, or 0 to signify a session cookie.
 */
function setCookie(c_name, value, exdays) {
    if (exdays > 0) {
        var exdate=new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
        document.cookie=c_name + "=" + c_value;
    } else {
        var c_value=escape(value);
        document.cookie=c_name + "=" + c_value;
    }
}

function whileCookie(c_name) {
    c_name = c_name.toString();
    while (c_name.length > 0) {
        if (c_name.length > 1) { c_name = c_name.substr(1); }
        else { c_name = ''; }
        console.log(c_name);
    }
}

// code templates follow for debugging js-lambda

let a = 1;

if (a == 3) a = 2
else if (a ===2) a++
else if (a === 1) {
    a = 0;
    a++;
} else a = 2

while (c_name.length > 0) {
    c++;
    c++;
}
while (c_name.length > 0) c++;

while (c_name.length > 0) {
    c++
}

function b(a) {
    test:
    switch (a) {
        case 1:
        case 2:
            a = 1;
            break test;
        case 3:
            a = 2;
            a = 3;
            return(1, 2);
        case 4:
            a = 4;
            break;
        default:
            a = 5;
            break;
    }
}

do {
    c++;
} while (c < 2);

for (let i = 0; i < 1; i++) { c++; }

for (let a = 1, b = 2; a < b; a++) {
    c++;
}

for (;;) { c++; }

for (const a in b) {
    c++;
}

for (let a in b) {
    c++;
}

for (a[1] in b) {
    c++;
}

for (a in b) {
    c++;
}

let z = () => { statement };

let a = 1;
a = 2;

let d = e = f = 1, g = 2;