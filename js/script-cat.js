const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
let txCharacteristic;
let rxCharacteristic;
let myValue = "0";
let buffer = "";
let jsonData = {};
let t = 0;
let v = 0;
let i = 0;
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
let tableRow = document.getElementById("tableData");

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
        myValue = buffer
        buffer = ""
        myValue = myValue.replace('$', '')
        myValue = myValue.replaceAll("'", '"')
        myValue = myValue.replaceAll("'", '"')
        jsonData = JSON.parse(myValue).data;
        v = jsonData.v;
        i = jsonData.i;
        t = jsonData.t;
        console.log(v, i, t);

        var row = tableRow.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.innerHTML = t.toString();
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
