

const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
let txCharacteristic;
let rxCharacteristic;
let myValue = "0";
let buffer = "";
let jsonData = {};
let t = 0;
let v = 0;
let i = 0;
let timenow = "";
let myBLE;
let isConnected = false;

// buttons
let connectButton = document.getElementById("connectButton");
let disconnectButton = document.getElementById("disconnectButton");
let startButton = document.getElementById("collectButton");
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
        font: "10px sans-serif",
        labels: [200, 500, 2100, 2800],
        fractionDigits: 0
    },
    // static zones
    staticZones: [
        { strokeStyle: "#F03E3E", min: 0, max: 10 },
        { strokeStyle: "#FFDD00", min: 10, max: 30 },
        { strokeStyle: "#30B32D", min: 30, max: 40 },
        { strokeStyle: "#FFDD00", min: 40, max: 70 },
        { strokeStyle: "#F03E3E", min: 70, max: 100 }
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
    angle: 0.15,
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

gauge.maxValue = 100;
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

startButton.addEventListener('click', function () {
    readToBle();
})

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
    statStatus.innerHTML = (isConnected ? "catStat Connected" : "catStat Disconnected");
}

function disconnectToBle() {
    // Disonnect to the device
    myBLE.disconnect();
    // Check if myBLE is connected
    isConnected = myBLE.isConnected();
    statStatus.innerHTML = (isConnected ? "catStat Connected" : "catStat Disconnected");
}

function onDisconnected() {
    console.log('Device got disconnected.');
    isConnected = false;
    statStatus.innerHTML = (isConnected ? "catStat Connected" : "catStat Disconnected");
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {

    if (error) console.log('error: ', error);
    console.log('characteristics: ', characteristics);
    rxCharacteristic = characteristics[0]
    txCharacteristic = characteristics[1];
    isConnected = myBLE.isConnected();

    //just so the connection status is up to date always
    statStatus.innerHTML = (isConnected ? "catStat Connected" : "catStat Disconnected");
}

// A function that will be called once got characteristics
//This is our gotValue
function handleNotifications(data) {
    //console.log("data: ", data)
    if (data.includes('data') || buffer.includes('data')) {
        buffer = buffer.concat(data);
    }
    console.log(buffer)

    if (buffer.includes('$')) {
        timenow = new Date().toLocaleTimeString();

        myValue = buffer
        buffer = ""
        myValue = myValue.replace('$', '')
        myValue = myValue.replace('True', 'true')
        myValue = myValue.replace('False', 'false')
        myValue = myValue.replaceAll("'", '"')
        myValue = myValue.replaceAll("'", '"')
        jsonData = JSON.parse(myValue).data;
        v = jsonData.v;
        i = jsonData.i;
        t = jsonData.t;
        console.log(v, i, t);

        gauge.set(Math.abs(v * 20));
        var row = tableRow.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.innerHTML = timenow;
        cell2.innerHTML = i.toString();
        cell3.innerHTML = v.toString();

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
