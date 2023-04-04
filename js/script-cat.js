const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
let txCharacteristic;
let rxCharacteristic;
let myValue = "0";
let buffer = "";
let jsonData = {};
let jsonDone = false;
let t = 0;
let v = 0;
let i = 0;
let concentration = 0;
let done = false;
let timenow = "";
let myBLE;
let isConnected = false;

// data for chart
let timeSeries = [];
let concentrationSeries = [];
let labels = timeSeries;

let data = {
    labels: labels,
    datasets: [{
        label: 'sodium (Na)',
        backgroundColor: 'rgb(62,222,209)',
        borderColor: 'rgb(62,222,209)',
        data: concentrationSeries,
    }
    ]
};

let config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'concentration level vs. time'
            },
            autocolors: false,
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'time'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'concentration (mM)'
                }
            }
        }
    },
};

// buttons
let connectButton = document.getElementById("connectButton");
let disconnectButton = document.getElementById("disconnectButton");
// let startButton = document.getElementById("collectButton");
let exportButton = document.getElementById("exportButton");
let pumpButton = document.getElementById("pumpButton");
let ocpButton = document.getElementById("ocpButton");

// labels
let statStatus = document.getElementById("statStatus");
let dataStatus = document.getElementById("dataStatus");
let tableRow = document.getElementById("dataTable");

// gauge
var opts = {
    // color configs
    colorStart: "#6fadcf",
    colorStop: void 0,
    gradientType: 0,
    strokeColor: "#e0e0e0",
    generateGradient: true,
    percentColors: [[0.0, "#a9d70b"], [0.50, "#f9c802"], [1.0, "#ff0000"]],
    // customize pointer
    pointer: {
        length: 0.8,
        strokeWidth: 0.035,
        iconScale: 1.0
    },
    // static labels
    staticLabels: {
        font: "15px sans-serif",
        labels: [50, 150, 300, 380],
        fractionDigits: 0
    },
    // static zones
    staticZones: [
        { strokeStyle: "#ef476f", min: 0, max: 20 },
        { strokeStyle: "#E0D26E", min: 20, max: 35 },
        { strokeStyle: "#06D6A0", min: 35, max: 175 },
        { strokeStyle: "#E0D26E", min: 175, max: 225 },
        { strokeStyle: "#ef476f", min: 225, max: 380 }
    ],
    // render ticks
    renderTicks: {
        divisions: 5,
        divWidth: 1.1,
        divLength: 0.7,
        divColor: "#333333",
        subDivisions: 3,
        subLength: 0.5,
        subWidth: 0.6,
        subColor: "#666666"
    },
    // the span of the gauge arc
    angle: 0.10,
    // line thickness
    lineWidth: 0.44,
    // radius scale
    radiusScale: 1.0,
    // font size
    fontSize: 40,
    // if false, max value increases automatically if value > maxValue
    limitMax: false,
    // if true, the min value of the gauge will be fixed
    limitMin: false,
    // High resolution support
    highDpiSupport: true
};

var target = document.getElementById('demo');
var gauge = new Gauge(target).setOptions(opts);

document.getElementById("preview-textfield").className = "preview-textfield";
gauge.setTextField(document.getElementById("preview-textfield"));

gauge.maxValue = 380;
gauge.setMinValue(0);
gauge.animationSpeed = 32;
gauge.set(0);

// ble
myBLE = new p5ble();

connectButton.addEventListener('click', function () {
    console.log("connect button clicked");
    connectToBle();
})

disconnectButton.addEventListener('click', function () {
    disconnectToBle();
})

// startButton.addEventListener('click', function () {
//     readToBle();
// })

ocpButton.addEventListener('click', function () {
    writeToBle("default ocp");
})

pumpButton.addEventListener('click', function () {
    writeToBle('{"pump":5}');
})

function connectToBle() {
    // Connect to a device by passing the service UUID
    myBLE.connect(serviceUuid, gotCharacteristics);
    isConnected = myBLE.isConnected();
    console.log(isConnected)
    statStatus.innerHTML = (isConnected ? "PURRtentio: Connected" : "PURRtentio: Disconnected");
}

function disconnectToBle() {
    // Disonnect to the device
    myBLE.disconnect();
    // Check if myBLE is connected
    isConnected = myBLE.isConnected();
    statStatus.innerHTML = (isConnected ? "PURRtentio: Connected" : "PURRtentio: Disconnected");
}

function onDisconnected() {
    console.log('Device got disconnected.');
    isConnected = false;
    statStatus.innerHTML = (isConnected ? "PURRtentio: Connected" : "PURRtentio: Disconnected");
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {

    if (error) console.log('error: ', error);
    console.log('characteristics: ', characteristics);
    rxCharacteristic = characteristics[0]
    txCharacteristic = characteristics[1];
    readToBle();
    isConnected = myBLE.isConnected();

    //just so the connection status is up to date always
    statStatus.innerHTML = (isConnected ? "PURRtentio Connected" : "PURRtentio Disconnected");
}

// A function that will be called once got characteristics
//This is our gotValue
function handleNotifications(data) {
    //console.log("data: ", data)
    // if (data.includes('data') || buffer.includes('data')) {
    //     buffer = buffer.concat(data);
    // }
    if (data) {
        if (data.includes("test starting")){
            dataStatus.innerHTML = "TESTING"
        } else {
          buffer = buffer.concat(data);
        }
    }
    //console.log(buffer)

    if (buffer.includes('$')) {
        timenow = new Date().toLocaleTimeString();

        myValue = buffer;
        buffer = "";
        myValue = myValue.replace('$', '');
        myValue = myValue.replace('True', 'true');
        myValue = myValue.replace('False', 'false');
        myValue = myValue.replaceAll("'", '"');
        myValue = myValue.replaceAll("'", '"');
        // done = myValue.done;
        jsonData = JSON.parse(myValue).data;
        jsonDone = JSON.parse(myValue).done;

        console.log(jsonData)
        v = jsonData.v;
        i = jsonData.i;
        t = jsonData.t;
        console.log(v, i, t);

        concentration = v2c(v);
        console.log(concentration);

        // add new data to the chart
        timeSeries.push(timenow);
        concentrationSeries.push(concentration);
        console.log(concentrationSeries);

        //update the gauge
        gauge.set(concentration);
        var row = tableRow.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.innerHTML = timenow;
        cell2.innerHTML = i.toString();
        cell3.innerHTML = v.toString();
        cell4.innerHTML = concentration.toString();

        //update the text
        if(jsonDone){
            dataStatus.innerHTML = "LAST RECORD: \n" + timenow + "\n" +
                                    "Concentration: " + concentration.toString() + " mM" +
                                    "\n" + "Current: " + i.toString() + " mA" + "\n" +
                                    "Potential: " + v.toString() + " V";
        }
        actualizarData(myChart);

    }

    // Add a event handler when the device is disconnected
    myBLE.onDisconnected(onDisconnected)
}

function readToBle() {
    myBLE.startNotifications(txCharacteristic, handleNotifications, 'string');
    // myBLE.read(txCharacteristic, gotValue);
}

function writeToBle(writeValue) {
    // Write the value of the input to the txCharacteristic
    myBLE.write(rxCharacteristic, writeValue);
}

function tableToCSV() {

    // Variable to store the final csv data
    var csv_data = [];

    // Get each row data
    var rows = document.getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {

        // Get each column data
        var cols = rows[i].querySelectorAll('td,th');

        // Stores each csv row data
        var csvrow = [];
        for (var j = 0; j < cols.length; j++) {

            // Get the text data of each cell
            // of a row and push it to csvrow
            csvrow.push(cols[j].innerHTML);
        }

        // Combine each column value with comma
        csv_data.push(csvrow.join(","));
    }

    // Combine each row data with new line character
    csv_data = csv_data.join('\n');

    // Call this function to download csv file
    downloadCSVFile(csv_data);

}

function downloadCSVFile(csv_data) {

    // Create CSV file object and feed
    // our csv_data into it
    CSVFile = new Blob([csv_data], {
        type: "text/csv"
    });

    // Create to temporary link to initiate
    // download process
    var temp_link = document.createElement('a');

    // Download csv file
    temp_link.download = "table_study"+timenow+".csv";
    var url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;

    // This link should not be displayed
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);

    // Automatically click the link to
    // trigger download
    temp_link.click();
    document.body.removeChild(temp_link);
}

var myChart = new Chart(
    document.getElementById('myChart'),
    config
);

function actualizarData(chart) {
    chart.data.labels = timeSeries;
    chart.data.datasets.data = concentrationSeries;

    chart.update();
}

function v2c(v) {
    var vn = (v-0.336387)*0.001325;
    var co = 0;
    if (Math.abs(vn) > 1) {
      co = 1-(0.1*Math.abs(vn));
    } else if (vn < -0.6){
      co = -0.6+(0.1*Math.abs(vn));
    }
    return scale(co,-0.6,0.6,0,370);
}

function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
