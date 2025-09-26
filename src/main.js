(function () {
  kintone.events.on("app.record.index.show", function (event) {
    alert("Hello from Kintone!");
    console.log("Hello, Kintone!");
    return event;
  });
})();
