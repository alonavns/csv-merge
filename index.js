const fs = require('fs');
const json2csv = require('json2csv');
const csvtojson = require('csvtojson')

const fields = ["date/time", "settlement id", "type", "order id", "sku", "description", "quantity", "marketplace", "fulfilment", "order city", "order state", "order postal", "product sales", "postage credits", "gift wrap credits", "promotional rebates", "selling fees", "fba fees", "other transaction fees", "other", "total"];
const idx_date_time = 0;
const idx_sku = 4;

var saveFile = (data, type = 'json') => {
  let fn = (new Date()).getTime() + '.' + type;
  fs.writeFile('./save/' + fn, data, function (err) {
    if (err) throw err;
    console.log('File saved - to save/' + fn);
  });
}

var readCSV = (filename, callback) => {
  var rows = [];
  csvtojson()
    .fromFile(filename)
    .on('json', (jsonObj) => {
      let currentJson = {};
      let keyCount = 0;

      for (let key in jsonObj) {
        keyCount++;
        let saveKey = key;
        if (key.indexOf('field') != 0) {
          saveKey = keyCount.toString();
        } else {
          saveKey = key.substr(5);
        }
        currentJson[fields[saveKey - 1]] = jsonObj[key];
      }

      if (keyCount <= fields.length - 1) return;
      if (!currentJson[fields[idx_sku]] || !currentJson[fields[idx_sku]].length) return;
      if (typeof currentJson[fields[idx_date_time]] == 'string') {
        currentJson[fields[idx_date_time]] = formateDate(currentJson[fields[idx_date_time]]);
      } else {
        let obj = currentJson[fields[idx_date_time]];
        currentJson[fields[idx_date_time]] = formateDate(obj['']);
      }
      rows.push(currentJson);
    })
    .on('done', (error) => {
      rows.splice(0, 1);
      callback(rows);
    })
}

const monthNames = {
  FR: {
    "janvier": '01',
    "février": '02',
    "mars": '03',
    "avril": '04',
    "mai": '05',
    "juin": '06',
    "juillet": '07',
    "août": '08',
    "septembre": '09',
    "octobre": '10',
    "novembre": '11',
    "décembre": '12'
  },
  IT: {
    "gennaio": '01',
    "febbraio": '02',
    "marzo": '03',
    "aprile": '04',
    "maggio": '05',
    "giugno": '06',
    "luglio": '07',
    "agosto": '08',
    "settembre": '09',
    "ottobre": '10',
    "novembre": '11',
    "dicembre": '12'
  }
}
var formateDate = (date) => {
  let d = new Date(date);
  if (!isValidDate(d)) {
    let d = date.split(' ');
    if (date.indexOf('/') != -1) {
      d = d[0];
      d = d.split('/').reverse();
      if (!isNaN(d[1]))
        return d.join('-');
      else {
        let m = '###';
        for (let k in monthNames.IT) {
          if (k.indexOf(d[1]) != -1) {
            m = monthNames.IT[k];
            break;
          }
        }
        return [d[0], m, d[2]].join('-');
      }
    } else {
      return [d[2], monthNames.FR[d[1]], leadingZero(d[0])].join('-');
    }
  } else {
    let d = new Date(date);
    return [d.getFullYear(), leadingZero(d.getMonth() * 1 + 1), leadingZero(d.getDay() * 1 + 1)].join('-');
  }
}

var isValidDate = (d) => {
  if (Object.prototype.toString.call(d) === "[object Date]") {
    if (isNaN(d.getTime())) {
      return false;
    }
    else {
      return true;
    }
  }
  else {
    return false;
  }
}

var leadingZero = (num, size = 2) => {
  var s = "000000000" + num;
  return s.substr(s.length - size);
}

exports.mergeCSVs = (files) => {
  let fileData = [];
  for (let i = 0; i < files.length; i++) {
    let filename = './csv_data/' + files[i];
    console.log(filename);
    readCSV(filename, (data) => {
      fileData.push(data);
      if (fileData.length == files.length) {
        saveFile(JSON.stringify(fileData));
      }
    });
  }
}

var filenames = [
  'DE_2014JunMonthlyTransaction.csv',
  'ES_2014JunMonthlyTransaction.csv',
  'FR_2014JunMonthlyTransaction.csv',
  'IT_2014JunMonthlyTransaction.csv',
  'UK_2014JunMonthlyTransaction.csv'
];
// mergeCSVs(filenames);