function prependScript(url, id=undefined) {
    let script = document.createElement("script");
    script.src = chrome.extension.getURL(url);

    if (id !== undefined) {
        script.id = id;
    }

    document.documentElement.appendChild(script);
}

function dataToDOM(data) {
    let code = '';

    for (let key in data) {
        code += `const ${key} = JSON.parse('${JSON.stringify(data[key])}');\n`
    }

    let script = document.createElement("script");
    script.textContent = code;
    document.documentElement.appendChild(script);
}
