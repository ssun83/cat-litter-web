let jointSelect = document.getElementById("jointSelect");

const labels = [
    '01/06',
    '02/06',
    '03/06',
    '04/06',
    '05/06',
    '06/06',
];

const data = {
    labels: labels,
    datasets: [{
            label: 'Flexion',
            backgroundColor: 'rgb(62,222,209)',
            borderColor: 'rgb(62,222,209)',
            data: [70, 65, 63, 60, 57, 54, 50],
        },
        {
            label: 'Extension',
            backgroundColor: 'rgb(255, 99, 200)',
            borderColor: 'rgb(255, 99, 200)',
            data: [150, 155, 157, 160, 162, 165, 167],
        }
    ]
};

const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: jointSelect.value + ' Range-of-motion Progress'
            },
            autocolors: false,
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: 60,
                        yMax: 60,
                        borderColor: 'rgb(241,180,23)',
                        borderWidth: 2,
                        label: {
                            enabled: true,
                            position: 'start',
                            backgroundColor: 'rgb(241,180,23)',
                            content: 'Normal Flexion'
                         }
                    },
                    line2: {
                        type: 'line',
                        yMin: 100,
                        yMax: 100,
                        borderColor: 'rgb(241,180,23)',
                        borderWidth: 2,
                        label: {
                            enabled: true,
                            position: 'start',
                            backgroundColor: 'rgb(241,180,23)',
                            content: 'Normal Extension'
                         }
                    }
                }
            },
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
                    text: 'Session'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Angle (º)'
                }
            }
        }
    },
};

var myChart = new Chart(
    document.getElementById('myChart'),
    config
);

jointSelect.addEventListener("change", function () {
    actualizarData(myChart)
});

function actualizarData(chart) {
    console.log(jointSelect.value);
    chart.options.plugins.title.text = jointSelect.value + ' Range-of-motion Progress';
    switch (jointSelect.value) {
        case 'carpus':
            minAngleValue = '32';
            maxAngleValue = '196';
            break;
        case 'elbow':
            minAngleValue = '36';
            maxAngleValue = '165';
            break;
        case 'shoulder':
            minAngleValue = '57';
            maxAngleValue = '165';
            break;
        case 'ankle':
            minAngleValue = '39';
            maxAngleValue = '164';
            break;
        case 'stifle':
            minAngleValue = '42';
            maxAngleValue = '162';
            break;
        case 'hip':
            minAngleValue = '50';
            maxAngleValue = '162';
            break;
        default:
            console.log("unknown joint");
    }
    chart.options.plugins.annotation.annotations.line1.yMin = parseInt(minAngleValue);
    chart.options.plugins.annotation.annotations.line1.yMax = parseInt(minAngleValue);

    chart.options.plugins.annotation.annotations.line2.yMin = parseInt(maxAngleValue);
    chart.options.plugins.annotation.annotations.line2.yMax = parseInt(maxAngleValue);

    chart.update();
}

// specify the columns
const columnDefs = [{
        field: "session",
        sortable: true,
        filter: true
    },
    {
        field: "joint",
        sortable: true,
        filter: true
    },
    {
        field: "date",
        sortable: true,
        filter: true
    },
    {
        field: "flexion",
        sortable: true,
        filter: true
    },
    {
        field: "extension",
        sortable: true,
        filter: true
    },
    {
        field: "rom",
        sortable: true,
        filter: true
    }
];

// specify the data
const rowData = [{
        session: "1",
        joint: "Elbow",
        date: "01/06",
        flexion: 90,
        extension: 100,
        rom: 100
    },
    {
        session: "2",
        joint: "Elbow",
        date: "02/06",
        flexion: 92,
        extension: 100,
        rom: 100
    },
    {
        session: "3",
        joint: "Elbow",
        date: "03/06",
        flexion: 91,
        extension: 100,
        rom: 100
    },
    {
        session: "4",
        joint: "Elbow",
        date: "04/06",
        flexion: 93,
        extension: 100,
        rom: 100
    },
    {
        session: "5",
        joint: "Elbow",
        date: "05/06",
        flexion: 94,
        extension: 100,
        rom: 100
    },
    {
        session: "6",
        joint: "Elbow",
        date: "06/06",
        flexion: 94,
        extension: 100,
        rom: 100
    }
];

// let the grid know which columns and what data to use
const gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData
};

// lookup the container we want the Grid to use
const eGridDiv = document.querySelector('#myGrid');

// create the grid passing in the div to use together with the columns & data we want to use
new agGrid.Grid(eGridDiv, gridOptions);

var allColumnIds = [];
gridOptions.columnApi.getAllColumns().forEach(function (column) {
    allColumnIds.push(column.colId);
});

gridOptions.columnApi.autoSizeColumns(allColumnIds, false);