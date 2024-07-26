export function stripNumber(num, precision = 12) {
  return +parseFloat(num.toPrecision(precision));
}

export function download(url, name) {
  if (typeof url === "object" && url instanceof Blob) {
    url = URL.createObjectURL(url);
  }
  let aLink = document.createElement("a");
  aLink.href = url;
  aLink.download = name;
  let event;
  if (window.MouseEvent) {
    event = new MouseEvent("click");
  } else {
    event = document.createEvent("MouseEvents");
    event.initMouseEvent(
      "click",
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
  }
  aLink.dispatchEvent(event);
}

export function loadJs(src) {
  return new Promise((resolve) => {
    const scripts = document.querySelectorAll("body>script");
    for (let index = 0; index < scripts.length; index++) {
      if (scripts[index].getAttribute("src") === src) {
        resolve(true);
        return;
      }
    }

    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    document.body.appendChild(script);

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
  });
}
