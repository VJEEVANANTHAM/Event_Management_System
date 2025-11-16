import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const timeUtil = {
  localToUTC: function (localDateStrOrObj, tz) {
    return dayjs.tz(localDateStrOrObj, tz).utc().toDate();
  },
  utcToTz: function (utcDate, tz, format = "MMM D, YYYY [at] hh:mm A") {
    return dayjs(utcDate).tz(tz).format(format);
  },
};

export default timeUtil;
