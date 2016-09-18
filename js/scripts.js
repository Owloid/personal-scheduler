var dataArr;
var calArr;
var eventArr = [];

var interval;

function setInterval(val) {
  if((24*60)%val != 0) {
    interval = 15;
  }
  else {
    interval = val;
  }
}

setInterval(30);

function calendarShow() {
  readCsv();
}

function generateCalArr() {
  var startTime = new Date(dataArr[0][3].getTime()).setHours(6,0,0,0);
  
  var endTime = startTime+(7*24*60*60*1000);
  
  calArr = [];
  
  var day = 0;
  
  var newTime = startTime;
  var count = 0;
  
  while(newTime < endTime) {
    
    newTime = newTime + interval*60*1000;
    
    calArr[count] = new Date(newTime);
    
    count++;
  }
}

function transpose(arr) {
  var out = [];
  
  for(var col = 0; col < arr[0].length; col++) {
    
    out[col] = [];
    
    for(var row = 0; row < arr.length; row++) {
      out[col][row] = arr[row][col];
    }
  }
  
  return out;
}

function grabColumnsToRow(arr,col) {
  var temp = grabColumns(arr,[col]);
  temp = transpose(temp);
  var out = [];
  
  for(var i = 0; i < temp[0].length; i++) {
    out[i] = temp[0][i];
  }
  
  return out;
}

function generateEventArr() {
  var temp = [];
  
  for(var i = 0; i < calArr.length; i++) {
    temp[i] = "";
  }
  
  var nameArr = grabColumnsToRow(dataArr,1);
  var startArr = grabColumnsToRow(dataArr,[3]);
  var endArr = grabColumnsToRow(dataArr,[4]);
  
  
  // for each data point (event)
  for(var ev = 0; ev < dataArr.length; ev++) {
    
    // find the index range of the calendar array
    
    // find the index of the first time slot before the start of the event
    
    var startIndex = 0;
    
    while(startArr[ev].getTime() > calArr[startIndex].getTime()) {
      startIndex++;
    }
    
    startIndex--;
    
    if(startIndex < 0) {
      startIndex = 0;
    }
    
    // find the index of the end time slot before the start of the event
    
    var endIndex = 0;
    
    while(endArr[ev].getTime() > calArr[endIndex].getTime()) {
      endIndex++;
    }
    
    if(endIndex < 0) {
      endIndex = 0;
    }
    
    // assign the event to the correct array index
    
    for(var i = startIndex; i <= endIndex; i++) {
      temp[i] = nameArr[ev];
    }
    
  }
  
  eventArr = [];
  
  // 1D array to 2D array
  var count = 0;
  
  for(var i = 0; i < 7; i++) {
    
    eventArr[i] = [];
    
    for(var j = 0; j < (temp.length/7); j++) {
      eventArr[i][j] = temp[count];
      count++;
    }
  }
  
  eventArr = transpose(eventArr);
}

function readCsv() {
  var selectedFile = $('#input').get(0).files[0];
  Papa.parse(selectedFile,{
    skipEmptyLines: true,
    complete: function(results, file) {
      dataArr = results.data;
      tableUpdate();
    }
  });
}

function readTogglArr(arr) {
  // 0      1       2           3           4           5         6
  // Client Project Description Start date  Start time  End	date  End time
  var out = grabColumns(arr, [2,3,5,7,8,9,10]);
  
  // 0      1       2           3           4         5
  // Client Project Description Start time  End	date  End time
  out = mergeDateColumns(out, 3, 4);
  out = grabColumns(out, [0,1,2,3,5,6]);
  
  // 0      1       2           3     4
  // Client Project Description Start End
  out = mergeDateColumns(out, 4, 5);
  out = grabColumns(out, [0,1,2,3,4]);
  
  out = grabRowRange(out, 1, out.length);
  
  return out;
}

function grabRowRange(arr, top, bot) {
  var out = [];
  
  var row = 0;
  
  for(var i = top; i < bot; i++) {
    
    out[row] = [];
    
    for(var j = 0; j < arr[i].length; j++) {
      
      out[row][j] = arr[i][j];
      
    }
    
    row++;
  }
  
  return out;
}

function grabColumns(arr, colArr) {
  var out = [];
  
  for(var i = 0; i < arr.length; i++) {
    
    out[i] = [];
    var count = 0;
    
    for(var j = 0; j < colArr.length; j++) {
      
      out[i][count] = arr[i][colArr[j]];
      count++;
      
    }
  }
  
  return out;
}

function mergeDateColumns(arr, dateCol, timeCol) {
  var out = [];
  
  for(var i = 0; i < arr.length; i++) {
    
    out[i] = [];
    
    for(var j = 0; j < arr[i].length; j++) {
      
      if(j != dateCol) {
        out[i][j] = arr[i][j];
      }
      else {
        out[i][j] = new Date(arr[i][dateCol] + " " + arr[i][timeCol]);
      }
      
    }
  }
  
  return out;
}

function initTable() {
  var tbl = document.createElement('table');
  tbl.style.width = '100%';
  tbl.style.tableLayout = 'fixed';
  tbl.style.boarderStype = 'none';
  tbl.setAttribute("id", "cal");
  return tbl;
}

function calendarHead() {
  var tblHead = document.createElement('thead');
  var tr = document.createElement('tr');
  
  var label = ['Time','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  
  var td = td = document.createElement('td');
  td.style.width = '50px';
  td.appendChild(document.createTextNode(label[0]));
  tr.appendChild(td);
  for(var i = 1; i < label.length; i++) {
    td = document.createElement('td');
    td.style.textAlign = 'center';
    td.appendChild(document.createTextNode(label[i]));
    tr.appendChild(td);
  }
  
  tblHead.appendChild(tr);
  return tblHead;
}

function toHHMM(hr, min) {
  var minStr = min.toString();
  
  if(min < 10) {
    minStr = '0' + minStr;
  }
  
  return hr.toString() + ':' + minStr;
}

function timesheetBody(startHr, startMin, intv) {
  var tblBody = document.createElement('tbody');
  
  var hr = startHr;
  var min = startMin;
  
  var interval = intv;
  
  var counter = 0;
  
  do {
    var tr = document.createElement('tr');
    
    var td = document.createElement('td');
    td.appendChild(document.createTextNode(toHHMM(hr, min)));
    tr.appendChild(td);
    
    if(eventArr[counter] == null) {
      eventArr[counter] = [];
    }
    
    for(var j = 1; j < 8; j++) {
      if(eventArr[counter][j-1] == null) {
        eventArr[counter][j-1] = "";
      }
      
      td = document.createElement('td');
      td.appendChild(document.createTextNode(eventArr[counter][j-1]));
      tr.appendChild(td);
    }
    
    tblBody.appendChild(tr);
    
    min = min + interval;
    hr = ((hr + (min/60)|0) % 24);
    min = min % 60;
    
    counter++;
    
    if(counter > 1000) {
      break;
    }
  }
  while(hr != startHr || min != startMin);
  
  return tblBody;
}

function tableCreate() {
  var tbl = initTable();
  
  var tblHead = calendarHead();
  var tblBody = timesheetBody(6, 0, interval);
  
  tbl.appendChild(tblHead);
  tbl.appendChild(tblBody);
  
  return tbl;
}

function tableUpdate() {
  dataArr = readTogglArr(dataArr);
  console.log("Formatting complete:", dataArr);
  
  generateCalArr();
  console.log("Calendar complete:", calArr);
  
  generateEventArr();
  console.log("Event complete:", eventArr);
  
  changeTable();
}

function changeTable() {
  $('#cal tbody').empty();
  
  var tblBody = timesheetBody(6, 0, interval);
  mainTable.appendChild(tblBody);
}

var mainTable = tableCreate();
$('body').append(mainTable);