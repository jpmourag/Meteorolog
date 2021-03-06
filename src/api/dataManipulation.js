export function handleWeekData(params) {
  if (!params) return;
  const { daily } = params;

  const arrDataString = [];
  const dataSetDailyTemp = {
    Day: { name: "Temp Day", arr: [], key: "day" },
    Evening: { name: "Temp Evening", arr: [], key: "eve" },
    Max: { name: "Temp Max", arr: [], key: "max" },
    Min: { name: "Temp Min", arr: [], key: "min" },
    Morning: { name: "Temp Morning", arr: [], key: "morn" },
    Night: { name: "Temp Night", arr: [], key: "night" },
  };

  const dataSetDailyTempFeelsLike = {
    Day: { name: "Feels Like Temp Day", arr: [], key: "day" },
    Evening: {
      name: "Feels Like Temp Evening",
      arr: [],
      key: "eve",
    },
    Morning: {
      name: "Feels Like Temp Morning",
      arr: [],
      key: "morn",
    },
    Night: {
      name: "Feels Like Temp Night",
      arr: [],
      key: "night",
    },
  };

  for (const day of daily) {
    const utcTime = day["dt"];
    const date = String(new Date(utcTime * 1000));
    const dayWeek = date.split(" ")[0];
    const dayNum = date.split(" ")[2];
    arrDataString.push(`${dayNum} ${dayWeek}`);

    const temp = day.temp;
    for (const value in dataSetDailyTemp) {
      const key = dataSetDailyTemp[value]["key"];
      dataSetDailyTemp[value]["arr"].push(temp[key]);
    }

    const feelsLike = day["feels_like"];
    for (const value in dataSetDailyTempFeelsLike) {
      const key = dataSetDailyTempFeelsLike[value]["key"];
      dataSetDailyTempFeelsLike[value]["arr"].push(feelsLike[key]);
    }
  }
  return {
    arrDataString,
    dataSetDailyTemp,
    dataSetDailyTempFeelsLike,
  };
}
function randomHex() {
  const hex = ((Math.random() * 0xffffff) << 0).toString(16);
  return `#${hex}`;
}

export function handleDataSet(dataSet) {
  const arrObj = [];

  let count = 0;
  for (const key in dataSet) {
    if (key === "arrDataString") continue;
    for (const dailyKey in dataSet[key]) {
      arrObj.push({});
      arrObj[count].label = dataSet[key][dailyKey]["name"];
      arrObj[count].data = dataSet[key][dailyKey]["arr"];
      arrObj[count].fill = false;
      const color = randomHex();
      arrObj[count].backgroundColor = color;
      arrObj[count].borderColor = color;
      count++;
    }
  }

  return arrObj;
}

export function isDatasetEqual(oldDataset, newDataset) {
  for (const i in oldDataset) {
    const numI = +i;
    const oldObj = oldDataset[numI];
    const newObj = newDataset[numI];
    for (const key in oldObj) {
      if (typeof oldObj[key] !== "string") {
        const length = oldObj[key]?.length;
        if (length > 0) {
          const oldArr = oldObj[key];
          const newArr = newObj[key];
          for (const j in oldArr) {
            const numJ = +j;
            if (oldArr[numJ] === newArr[numJ]) return true;
          }
        }
      }
    }
  }

  return false;
}

// toCards
function formatDate(dt, bool = false) {
  const fullDate = new Date(dt * 1000).toString();
  const fullDateSplited = fullDate.split(" ");
  const weekDay = fullDateSplited[0];
  const month = fullDateSplited[1];
  const day = fullDateSplited[2];
  if (bool) return `${weekDay}, ${day} ${month}`;
  return `${day} ${weekDay}`;
}
function formatMinAndMax(min, max) {
  let intMax = Math.round(max);
  let intMin = Math.round(min);
  if (intMax > 0) intMax = "+" + intMax;
  if (intMin > 0) intMin = "+" + intMin;
  return `${intMin}/${intMax}`;
}
export function handleDataToCardsCarousel({ daily }) {
  const data = {
    day: [],
    minMax: [],
    icon: [],
  };
  for (const day of daily) {
    data.day.push(formatDate(day["dt"]));

    const max = day["temp"]["max"];
    const min = day["temp"]["min"];
    data.minMax.push(formatMinAndMax(min, max));
    let icon = day["weather"][0]["icon"];
    data.icon.push(formatIcon(icon));
  }
  return data;
}
function formatIcon(icon) {
  if ("01n 03n 04n 09n 11n 13n 50n".includes(icon))
    return icon.replace("n", "d");
  return icon;
}
function mPerSecToKmPerH(value) {
  return (value * 3.708).toFixed(2);
}
export function handleDataToSideCard(
  { current, minutely, timezone_offset },
  systemPattern
) {
  const offSet = timezone_offset / 60 / 60;
  const windSpeed =
    systemPattern === "metric"
      ? mPerSecToKmPerH(current["wind_speed"])
      : current["wind_speed"];
  const temp = current["temp"];
  const data = {
    dt: formatDate(current["dt"], true),
    time: displayCityTime(offSet),
    icon: formatIcon(current["weather"][0]["icon"]),
    temp: temp > 0 ? "+" + temp.toFixed(0) : temp.toFixed(0),
    wind_speed: windSpeed,
    precipitation: minutely ? minutely[0]["precipitation"] : null, // forecast in 30 minutes
    humidity: current["humidity"],
  };
  return data;
}

export function displayCityTime(offset) {
  const aDate = new Date();
  const utc = aDate.getTime() + aDate.getTimezoneOffset() * 60000;
  const newdate = new Date(utc + 3600000 * offset);

  const defaultDate = new Date();
  const hour = defaultDate.toString().split(" ")[4].split(":")[0];
  const localOffset =
    +defaultDate.toString().split(" ")[5].replace("GMT", "") / 100;
  const defaultHour = hour - localOffset;
  let actualHour = Math.abs(defaultHour + offset);
  if (actualHour >= 24) actualHour -= 24;
  if (actualHour < 10) actualHour = "0" + actualHour;
  const minutes = newdate.toLocaleString().split(" ")[1].split(":")[1];
  return `${actualHour}:${minutes}`;
}
