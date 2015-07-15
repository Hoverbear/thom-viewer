/*******************************************************************************
Andrew Hobden, 2015.
MIT.
******************************************************************************/
var DATA_LIST = "cartographic-legacies.csv";

var map;

function init() {
    // Map options for example map
    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(47.597486111111095, -122.30471388888901),
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        streetViewControl:false,
        scaleControl: true,
        overviewMapControl: true
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    document.getElementById("map").style.backgroundColor = "#5C5745";

    buildSidebar();
}

google.maps.event.addDomListener(window, 'load', init);

function toggleMap(dataset) {
    // Get tile url
    var tilesetName = dataset["File Name"].split(".");
    tilesetName.pop(); // remove extension.
    tilesetName = String(tilesetName);
    var tileUrl = "tiles/" + tilesetName;
    var foundIdx = null;
    map.overlayMapTypes.forEach(function (elem, idx) {
        console.log(elem.name);
        if (elem.name == tilesetName) {
            foundIdx = idx;
            console.log("FOUND")
        }
    });
    console.log(foundIdx);
    if (foundIdx !== null) {
        console.log("Removing!")
        // Remove existing tileset.
        map.overlayMapTypes.removeAt(foundIdx);
        $("#datasets > #" + tilesetName).remove();
    } else {
        // Make a new tileset.
        var overlay = new google.maps.ImageMapType({
            name: tilesetName,
            getTileUrl: function (coord, zoom) {
                return tileUrl + "/" + zoom + "/" + coord.x + "/" + (Math.pow(2,zoom)-coord.y-1) + ".png";
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
        });
        map.overlayMapTypes.push(overlay);
        // Add a Dataset entry.
        var div = document.createElement("div");
        $(div).attr("id", tilesetName);

        var bibliographicReferenceElem = document.createElement("span");
        $(bibliographicReferenceElem).text("Reference: " + dataset["Bibliographic Reference"]);
        $(div).append(bibliographicReferenceElem);

        var urlElem = document.createElement("span");
        $(urlElem).text("URL: " + dataset["URL"]);
        $(div).append(urlElem);

        var alternateLinkElem = document.createElement("span");
        $(alternateLinkElem).text("Alt: " + dataset["Alternate Link"]);
        $(div).append(alternateLinkElem);

        var sliderElem = document.createElement("input");
        $(sliderElem).attr("type", "range");
        $(sliderElem).attr("min", "0");
        $(sliderElem).attr("max", "100");
        $(sliderElem).attr("value", "100");
        $(sliderElem).on("input", function () {
            var val = Number($(sliderElem).val()) / 100;
            console.log("Changing " + val);
            map.overlayMapTypes.forEach(function (elem, idx) {
                if (elem.name == tilesetName) {
                    console.log("Setting ", elem);
                    elem.setOpacity(val);
                }
            });
        });
        $(div).append(sliderElem);

        $("#datasets").append(div);
    }

}

function toggleSidebar() {
    console.log("Toggling sidebar");
    $("#sidebarContainer").toggleClass("in");
}

function toggleDatasets() {
    console.log("Toggling sidebar");
    $("#datasetsContainer").toggleClass("in");
}

function buildSidebar() {
    // Pull and parse data from the csv.
    Papa.parse(DATA_LIST, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            // The list will be added to.
            var list = document.createElement("ul");
            var categories = {};

            // Build a set of list elements and add them to respective categories.
            results.data.map(function (val) {
                var li = document.createElement("li"),
                    label = document.createElement("label"),
                    checkbox  = document.createElement("input");
                // Build checkbox.
                $(checkbox).attr("type", "checkbox");
                $(checkbox).data("dataset", val);
                $(checkbox).click(function () {
                    toggleMap($(this).data("dataset"));
                });
                // Build label.
                $(label).text(val["File Name"]);
                // Build `li`
                $(li).append(checkbox);
                $(li).append(label);
                // Add to category
                if (!categories[val.Category]) {
                    categories[val.Category] = document.createElement("ul");
                }
                $(categories[val.Category]).append(li);
            });

            // Build the heirarchical sidebar.
            for (var category in categories) {
                var sublist = document.createElement("li"),
                    link = document.createElement("a");
                // Link setup.
                $(link).text(category);
                $(link).attr("href", "#");
                $(link).click(function () {
                    $(this).siblings("ul").toggle();
                });
                // List setup.
                $(sublist).append(link);
                $(categories[category]).hide(); // Show on click.
                $(sublist).append(categories[category]);
                $(list).append(sublist);
            }
            var sidebar = $("#sidebar");
            sidebar.append(list);
        }
    });
}
